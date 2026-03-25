import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import postgres from "postgres";

function loadEnvFile(filename) {
  const filePath = path.join(process.cwd(), filename);

  if (!existsSync(filePath)) {
    return;
  }

  const content = readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    const normalizedValue = rawValue.replace(/^['"]|['"]$/g, "");

    if (!(key in process.env)) {
      process.env[key] = normalizedValue;
    }
  }
}

loadEnvFile(".env");
loadEnvFile(".env.local");

const databaseUrl = process.env.DATABASE_URL?.trim();

if (!databaseUrl) {
  throw new Error("No se encontro DATABASE_URL. Cargue la cadena de conexion de Supabase en .env.local o en la terminal.");
}

const sqlitePath = path.join(process.cwd(), "data", "encuesta-ecp-una.db");

if (!existsSync(sqlitePath)) {
  throw new Error(`No se encontro la base SQLite local en ${sqlitePath}.`);
}

const sqlite = new DatabaseSync(sqlitePath);
const sql = postgres(databaseUrl, {
  ssl: "require",
  max: 1,
  prepare: false,
  connect_timeout: 10,
  idle_timeout: 20,
});

const submissions = sqlite
  .prepare(
    `
      SELECT
        id,
        relation,
        respondent_name,
        respondent_email,
        respondent_phone,
        created_at,
        answers_json
      FROM survey_submissions
      ORDER BY id ASC
    `,
  )
  .all();

const answers = sqlite
  .prepare(
    `
      SELECT
        id,
        submission_id,
        relation,
        module_id,
        module_title,
        module_order,
        question_id,
        question_prompt,
        question_type,
        question_order,
        answer_value,
        answer_display,
        answer_order
      FROM survey_answers
      ORDER BY id ASC
    `,
  )
  .all();

async function ensureSchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS survey_submissions (
      id BIGSERIAL PRIMARY KEY,
      relation TEXT NOT NULL,
      respondent_name TEXT,
      respondent_email TEXT,
      respondent_phone TEXT,
      created_at TEXT NOT NULL,
      answers_json TEXT NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS survey_answers (
      id BIGSERIAL PRIMARY KEY,
      submission_id BIGINT NOT NULL REFERENCES survey_submissions(id) ON DELETE CASCADE,
      relation TEXT NOT NULL,
      module_id TEXT NOT NULL,
      module_title TEXT NOT NULL,
      module_order INTEGER NOT NULL,
      question_id TEXT NOT NULL,
      question_prompt TEXT NOT NULL,
      question_type TEXT NOT NULL,
      question_order INTEGER NOT NULL,
      answer_value TEXT NOT NULL,
      answer_display TEXT NOT NULL,
      answer_order INTEGER NOT NULL
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_survey_submissions_created_at ON survey_submissions(created_at)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_survey_submissions_relation ON survey_submissions(relation)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_survey_answers_submission_id ON survey_answers(submission_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_survey_answers_question_id ON survey_answers(question_id)`;
}

async function main() {
  await ensureSchema();

  try {
    await sql.begin(async (tx) => {
      const existingRows = await tx`SELECT COUNT(*)::int AS total FROM survey_submissions`;
      const existingCount = Number(existingRows[0]?.total ?? 0);

      if (existingCount > 0 && process.env.FORCE_IMPORT !== "true") {
        throw new Error(
          "La base remota ya contiene registros. Para sobrescribirla, ejecute con FORCE_IMPORT=true.",
        );
      }

      if (process.env.FORCE_IMPORT === "true") {
        await tx`TRUNCATE TABLE survey_answers, survey_submissions RESTART IDENTITY CASCADE`;
      }

      for (const submission of submissions) {
        await tx.unsafe(
          `
            INSERT INTO survey_submissions (
              id,
              relation,
              respondent_name,
              respondent_email,
              respondent_phone,
              created_at,
              answers_json
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          `,
          [
            submission.id,
            submission.relation,
            submission.respondent_name,
            submission.respondent_email,
            submission.respondent_phone,
            submission.created_at,
            submission.answers_json,
          ],
        );
      }

      for (const answer of answers) {
        await tx.unsafe(
          `
            INSERT INTO survey_answers (
              id,
              submission_id,
              relation,
              module_id,
              module_title,
              module_order,
              question_id,
              question_prompt,
              question_type,
              question_order,
              answer_value,
              answer_display,
              answer_order
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          `,
          [
            answer.id,
            answer.submission_id,
            answer.relation,
            answer.module_id,
            answer.module_title,
            answer.module_order,
            answer.question_id,
            answer.question_prompt,
            answer.question_type,
            answer.question_order,
            answer.answer_value,
            answer.answer_display,
            answer.answer_order,
          ],
        );
      }

      await tx`
        SELECT setval(
          pg_get_serial_sequence('survey_submissions', 'id'),
          GREATEST((SELECT COALESCE(MAX(id), 1) FROM survey_submissions), 1),
          true
        )
      `;

      await tx`
        SELECT setval(
          pg_get_serial_sequence('survey_answers', 'id'),
          GREATEST((SELECT COALESCE(MAX(id), 1) FROM survey_answers), 1),
          true
        )
      `;
    });

    console.log(`Importacion completada. Encuestas: ${submissions.length}. Respuestas detalladas: ${answers.length}.`);
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
