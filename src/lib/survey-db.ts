import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import postgres, { type Sql } from "postgres";
import { questionnaireConfig } from "@/config/questionnaire";
import { getModulesForRelation, getRelationConfig } from "@/lib/questionnaire-helpers";
import { Question, QuestionType, RelationKey } from "@/lib/types";

type AnswerMap = Record<string, string | string[]>;

type PreparedAnswerRow = {
  relation: RelationKey;
  moduleId: string;
  moduleTitle: string;
  moduleOrder: number;
  questionId: string;
  questionPrompt: string;
  questionType: QuestionType;
  questionOrder: number;
  answerValue: string;
  answerDisplay: string;
  answerOrder: number;
};

type SerializedAnswers = Record<string, string | string[]>;

type SubmissionRow = {
  id: number;
  relation: RelationKey;
  respondent_name: string | null;
  respondent_email: string | null;
  respondent_phone: string | null;
  created_at: string;
  answers_json: string;
};

type AnswerRow = PreparedAnswerRow & {
  id: number;
  submission_id: number;
};

export type SubmissionModuleDetail = {
  moduleId: string;
  moduleTitle: string;
  questions: Array<{
    questionId: string;
    questionPrompt: string;
    questionType: QuestionType;
    answerDisplay: string;
  }>;
};

export type SubmissionDetail = {
  id: number;
  relation: RelationKey;
  relationLabel: string;
  respondentName: string;
  respondentEmail: string;
  respondentPhone: string;
  createdAt: string;
  modules: SubmissionModuleDetail[];
};

export type QuestionSummary = {
  moduleId: string;
  moduleTitle: string;
  moduleOrder: number;
  questionId: string;
  questionPrompt: string;
  questionType: QuestionType;
  questionOrder: number;
  totalResponses: number;
  averageScore?: number | null;
  options: Array<{
    label: string;
    total: number;
    percent: number;
  }>;
};

export type DashboardData = {
  totalSubmissions: number;
  totalDetailedAnswers: number;
  latestSubmissionAt: string | null;
  relationSummary: Array<{
    relation: RelationKey;
    label: string;
    total: number;
  }>;
  questionSummaries: QuestionSummary[];
  submissions: SubmissionDetail[];
};

declare global {
  var __encuestaDatabase: DatabaseSync | undefined;
  var __encuestaPostgresClient: Sql | undefined;
  var __encuestaPostgresSchemaPromise: Promise<void> | undefined;
}

function getDatabasePath() {
  return path.join(process.cwd(), "data", "encuesta-ecp-una.db");
}

function hasPostgresDatabase() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

function canUseSqliteFallback() {
  return process.env.NODE_ENV !== "production" || process.env.ALLOW_SQLITE_FALLBACK === "true";
}

function getStorageMode() {
  if (hasPostgresDatabase()) {
    return "postgres" as const;
  }

  if (canUseSqliteFallback()) {
    return "sqlite" as const;
  }

  throw new Error(
    "No se encontro DATABASE_URL. Configure una base Postgres de Supabase para produccion o habilite ALLOW_SQLITE_FALLBACK solo para entornos locales.",
  );
}

function getRelationModules(relation: RelationKey) {
  return getModulesForRelation(relation);
}

function getQuestionMap(relation: RelationKey) {
  const modules = getRelationModules(relation);
  const questionMap = new Map<
    string,
    {
      moduleId: string;
      moduleTitle: string;
      question: Question;
    }
  >();

  modules.forEach((module) => {
    module.questions.forEach((question) => {
      questionMap.set(question.id, {
        moduleId: module.id,
        moduleTitle: module.title,
        question,
      });
    });
  });

  return questionMap;
}

function getQuestionOptionLabel(question: Question, value: string) {
  return question.options?.find((option) => option.value === value)?.label ?? value;
}

function isQuestionAnswered(question: Question, value: string | string[] | undefined) {
  if (question.type === "multiple") {
    return Array.isArray(value) && value.length > 0;
  }

  return typeof value === "string" && value.trim().length > 0;
}

function normalizeAnswerEntries(question: Question, rawValue: string | string[]) {
  if (question.type === "multiple") {
    const values = Array.isArray(rawValue) ? rawValue : [rawValue];
    return values.map((value, index) => ({
      answerValue: value,
      answerDisplay: getQuestionOptionLabel(question, value),
      answerOrder: index,
    }));
  }

  const value = Array.isArray(rawValue) ? rawValue.join(", ") : rawValue;
  if (question.type === "single") {
    return [
      {
        answerValue: value,
        answerDisplay: getQuestionOptionLabel(question, value),
        answerOrder: 0,
      },
    ];
  }

  if (question.type === "scale") {
    const scaleIndex = Number(value) - 1;
    const scaleLabel = question.scaleLabels?.[scaleIndex] ?? value;
    return [
      {
        answerValue: value,
        answerDisplay: `Nivel ${value}: ${scaleLabel}`,
        answerOrder: 0,
      },
    ];
  }

  return [
    {
      answerValue: value,
      answerDisplay: value,
      answerOrder: 0,
    },
  ];
}

function buildSubmissionModules(relation: RelationKey, answersJson: string) {
  const answers = JSON.parse(answersJson) as SerializedAnswers;
  const modules = getRelationModules(relation);

  return modules
    .map<SubmissionModuleDetail>((module) => ({
      moduleId: module.id,
      moduleTitle: module.title,
      questions: module.questions
        .filter((question) => isQuestionAnswered(question, answers[question.id]))
        .map((question) => {
          const value = answers[question.id]!;
          const answerDisplay = normalizeAnswerEntries(question, value)
            .map((entry) => entry.answerDisplay)
            .join(", ");

          return {
            questionId: question.id,
            questionPrompt: question.prompt,
            questionType: question.type,
            answerDisplay,
          };
        }),
    }))
    .filter((module) => module.questions.length > 0);
}

function prepareSubmission(relation: RelationKey, answers: AnswerMap) {
  const modules = getRelationModules(relation);
  const preparedAnswers: PreparedAnswerRow[] = [];

  modules.forEach((module, moduleOrder) => {
    module.questions.forEach((question, questionOrder) => {
      const value = answers[question.id];

      if (question.required && !isQuestionAnswered(question, value)) {
        throw new Error(`Falta responder: ${question.prompt}`);
      }

      if (!isQuestionAnswered(question, value)) {
        return;
      }

      normalizeAnswerEntries(question, value).forEach((answerEntry) => {
        preparedAnswers.push({
          relation,
          moduleId: module.id,
          moduleTitle: module.title,
          moduleOrder,
          questionId: question.id,
          questionPrompt: question.prompt,
          questionType: question.type,
          questionOrder,
          answerValue: answerEntry.answerValue,
          answerDisplay: answerEntry.answerDisplay,
          answerOrder: answerEntry.answerOrder,
        });
      });
    });
  });

  return {
    respondentName: typeof answers.nombre_completo === "string" ? answers.nombre_completo : "",
    respondentEmail: typeof answers.correo === "string" ? answers.correo : "",
    respondentPhone: typeof answers.telefono === "string" ? answers.telefono : "",
    preparedAnswers,
  };
}

function initializeSqliteDatabase(db: DatabaseSync) {
  db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS survey_submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      relation TEXT NOT NULL,
      respondent_name TEXT,
      respondent_email TEXT,
      respondent_phone TEXT,
      created_at TEXT NOT NULL,
      answers_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS survey_answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      submission_id INTEGER NOT NULL,
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
      answer_order INTEGER NOT NULL,
      FOREIGN KEY (submission_id) REFERENCES survey_submissions(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_survey_submissions_created_at ON survey_submissions(created_at);
    CREATE INDEX IF NOT EXISTS idx_survey_submissions_relation ON survey_submissions(relation);
    CREATE INDEX IF NOT EXISTS idx_survey_answers_submission_id ON survey_answers(submission_id);
    CREATE INDEX IF NOT EXISTS idx_survey_answers_question_id ON survey_answers(question_id);
  `);
}

function getSqliteDatabase() {
  if (!globalThis.__encuestaDatabase) {
    const databasePath = getDatabasePath();
    mkdirSync(path.dirname(databasePath), { recursive: true });
    const database = new DatabaseSync(databasePath);
    initializeSqliteDatabase(database);
    globalThis.__encuestaDatabase = database;
  }

  return globalThis.__encuestaDatabase;
}

function getPostgresClient() {
  if (!globalThis.__encuestaPostgresClient) {
    const connectionString = process.env.DATABASE_URL?.trim();

    if (!connectionString) {
      throw new Error("No se encontro DATABASE_URL para conectar con Supabase.");
    }

    globalThis.__encuestaPostgresClient = postgres(connectionString, {
      ssl: "require",
      max: 1,
      prepare: false,
      connect_timeout: 10,
      idle_timeout: 20,
    });
  }

  return globalThis.__encuestaPostgresClient;
}

async function initializePostgresSchema(sql: Sql) {
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

async function ensurePostgresSchema() {
  if (!globalThis.__encuestaPostgresSchemaPromise) {
    globalThis.__encuestaPostgresSchemaPromise = initializePostgresSchema(getPostgresClient()).catch((error) => {
      globalThis.__encuestaPostgresSchemaPromise = undefined;
      throw error;
    });
  }

  await globalThis.__encuestaPostgresSchemaPromise;
}

function buildDashboardData(
  submissionRows: SubmissionRow[],
  answerRows: AnswerRow[],
  relationFilter?: RelationKey,
): DashboardData {
  const relationKeys = relationFilter
    ? [relationFilter]
    : (Object.keys(questionnaireConfig.relations) as RelationKey[]);

  const relationSummary = relationKeys.map((relation) => ({
    relation,
    label: getRelationConfig(relation).label,
    total: submissionRows.filter((submission) => submission.relation === relation).length,
  }));

  const submissions = submissionRows.map<SubmissionDetail>((submission) => ({
    id: submission.id,
    relation: submission.relation,
    relationLabel: getRelationConfig(submission.relation).label,
    respondentName: submission.respondent_name || "Sin nombre registrado",
    respondentEmail: submission.respondent_email || "Sin correo",
    respondentPhone: submission.respondent_phone || "Sin telefono",
    createdAt: submission.created_at,
    modules: buildSubmissionModules(submission.relation, submission.answers_json),
  }));

  const summaryRows = answerRows.filter((answer) => {
    if (!(answer.questionType === "single" || answer.questionType === "multiple" || answer.questionType === "scale")) {
      return false;
    }

    return getQuestionMap(answer.relation).has(answer.questionId);
  });

  const questionSummaryMap = new Map<
    string,
    {
      moduleId: string;
      moduleTitle: string;
      moduleOrder: number;
      questionId: string;
      questionPrompt: string;
      questionType: QuestionType;
      questionOrder: number;
      submissionIds: Set<number>;
      optionCounts: Map<string, number>;
      numericTotal: number;
      numericCount: number;
    }
  >();

  summaryRows.forEach((row) => {
    const key = row.questionId;
    const current = questionSummaryMap.get(key) ?? {
      moduleId: row.moduleId,
      moduleTitle: row.moduleTitle,
      moduleOrder: row.moduleOrder,
      questionId: row.questionId,
      questionPrompt: row.questionPrompt,
      questionType: row.questionType,
      questionOrder: row.questionOrder,
      submissionIds: new Set<number>(),
      optionCounts: new Map<string, number>(),
      numericTotal: 0,
      numericCount: 0,
    };

    current.submissionIds.add(row.submission_id);
    current.optionCounts.set(row.answerDisplay, (current.optionCounts.get(row.answerDisplay) ?? 0) + 1);
    if (row.questionType === "scale") {
      const numericValue = Number(row.answerValue);

      if (!Number.isNaN(numericValue)) {
        current.numericTotal += numericValue;
        current.numericCount += 1;
      }
    }
    questionSummaryMap.set(key, current);
  });

  const questionSummaries = [...questionSummaryMap.values()]
    .map<QuestionSummary>((summary) => {
      const totalResponses = summary.submissionIds.size;
      const options = [...summary.optionCounts.entries()]
        .map(([label, total]) => ({
          label,
          total,
          percent: totalResponses ? Math.round((total / totalResponses) * 100) : 0,
        }))
        .sort((left, right) => right.total - left.total);

      return {
        moduleId: summary.moduleId,
        moduleTitle: summary.moduleTitle,
        moduleOrder: summary.moduleOrder,
        questionId: summary.questionId,
        questionPrompt: summary.questionPrompt,
        questionType: summary.questionType,
        questionOrder: summary.questionOrder,
        totalResponses,
        averageScore: summary.questionType === "scale" && summary.numericCount
          ? Number((summary.numericTotal / summary.numericCount).toFixed(2))
          : null,
        options,
      };
    })
    .sort((left, right) => {
      if (left.moduleOrder !== right.moduleOrder) {
        return left.moduleOrder - right.moduleOrder;
      }

      return left.questionOrder - right.questionOrder;
    });

  return {
    totalSubmissions: submissionRows.length,
    totalDetailedAnswers: answerRows.length,
    latestSubmissionAt: submissionRows[0]?.created_at ?? null,
    relationSummary,
    questionSummaries,
    submissions,
  };
}

function saveSurveySubmissionToSqlite(relation: RelationKey, answers: AnswerMap) {
  const db = getSqliteDatabase();
  const { respondentName, respondentEmail, respondentPhone, preparedAnswers } = prepareSubmission(relation, answers);
  const createdAt = new Date().toISOString();

  const insertSubmission = db.prepare(`
    INSERT INTO survey_submissions (
      relation,
      respondent_name,
      respondent_email,
      respondent_phone,
      created_at,
      answers_json
    ) VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertAnswer = db.prepare(`
    INSERT INTO survey_answers (
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
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  db.exec("BEGIN");

  try {
    const submissionResult = insertSubmission.run(
      relation,
      respondentName,
      respondentEmail,
      respondentPhone,
      createdAt,
      JSON.stringify(answers),
    );

    const submissionId = Number(submissionResult.lastInsertRowid);

    preparedAnswers.forEach((answer) => {
      insertAnswer.run(
        submissionId,
        answer.relation,
        answer.moduleId,
        answer.moduleTitle,
        answer.moduleOrder,
        answer.questionId,
        answer.questionPrompt,
        answer.questionType,
        answer.questionOrder,
        answer.answerValue,
        answer.answerDisplay,
        answer.answerOrder,
      );
    });

    db.exec("COMMIT");
    return submissionId;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

async function saveSurveySubmissionToPostgres(relation: RelationKey, answers: AnswerMap) {
  await ensurePostgresSchema();
  const sql = getPostgresClient();
  const { respondentName, respondentEmail, respondentPhone, preparedAnswers } = prepareSubmission(relation, answers);
  const createdAt = new Date().toISOString();
  const answersJson = JSON.stringify(answers);

  return sql.begin(async (transaction) => {
    const submissionRows = await transaction.unsafe<{ id: number }[]>(
      `
        INSERT INTO survey_submissions (
          relation,
          respondent_name,
          respondent_email,
          respondent_phone,
          created_at,
          answers_json
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `,
      [relation, respondentName, respondentEmail, respondentPhone, createdAt, answersJson],
    );

    const submissionId = Number(submissionRows[0]?.id ?? 0);

    for (const answer of preparedAnswers) {
      await transaction.unsafe(
        `
          INSERT INTO survey_answers (
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
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `,
        [
          submissionId,
          answer.relation,
          answer.moduleId,
          answer.moduleTitle,
          answer.moduleOrder,
          answer.questionId,
          answer.questionPrompt,
          answer.questionType,
          answer.questionOrder,
          answer.answerValue,
          answer.answerDisplay,
          answer.answerOrder,
        ],
      );
    }

    return submissionId;
  });
}

function getDashboardDataFromSqlite(relationFilter?: RelationKey) {
  const db = getSqliteDatabase();
  const submissionQuery = relationFilter
    ? `
        SELECT
          id,
          relation,
          respondent_name,
          respondent_email,
          respondent_phone,
          created_at,
          answers_json
        FROM survey_submissions
        WHERE relation = ?
        ORDER BY created_at DESC, id DESC
      `
    : `
        SELECT
          id,
          relation,
          respondent_name,
          respondent_email,
          respondent_phone,
          created_at,
          answers_json
        FROM survey_submissions
        ORDER BY created_at DESC, id DESC
      `;

  const answerQuery = relationFilter
    ? `
        SELECT
          id,
          submission_id,
          relation,
          module_id AS moduleId,
          module_title AS moduleTitle,
          module_order AS moduleOrder,
          question_id AS questionId,
          question_prompt AS questionPrompt,
          question_type AS questionType,
          question_order AS questionOrder,
          answer_value AS answerValue,
          answer_display AS answerDisplay,
          answer_order AS answerOrder
        FROM survey_answers
        WHERE relation = ?
        ORDER BY submission_id DESC, module_order ASC, question_order ASC, answer_order ASC
      `
    : `
        SELECT
          id,
          submission_id,
          relation,
          module_id AS moduleId,
          module_title AS moduleTitle,
          module_order AS moduleOrder,
          question_id AS questionId,
          question_prompt AS questionPrompt,
          question_type AS questionType,
          question_order AS questionOrder,
          answer_value AS answerValue,
          answer_display AS answerDisplay,
          answer_order AS answerOrder
        FROM survey_answers
        ORDER BY submission_id DESC, module_order ASC, question_order ASC, answer_order ASC
      `;

  const submissionRows = (relationFilter
    ? db.prepare(submissionQuery).all(relationFilter)
    : db.prepare(submissionQuery).all()) as SubmissionRow[];

  const answerRows = (relationFilter
    ? db.prepare(answerQuery).all(relationFilter)
    : db.prepare(answerQuery).all()) as AnswerRow[];

  return buildDashboardData(submissionRows, answerRows, relationFilter);
}

async function getDashboardDataFromPostgres(relationFilter?: RelationKey) {
  await ensurePostgresSchema();
  const sql = getPostgresClient();
  const submissionRows = relationFilter
    ? await sql<SubmissionRow[]>`
        SELECT
          id,
          relation,
          respondent_name,
          respondent_email,
          respondent_phone,
          created_at,
          answers_json
        FROM survey_submissions
        WHERE relation = ${relationFilter}
        ORDER BY created_at DESC, id DESC
      `
    : await sql<SubmissionRow[]>`
        SELECT
          id,
          relation,
          respondent_name,
          respondent_email,
          respondent_phone,
          created_at,
          answers_json
        FROM survey_submissions
        ORDER BY created_at DESC, id DESC
      `;

  const answerRows = relationFilter
    ? await sql<AnswerRow[]>`
        SELECT
          id,
          submission_id,
          relation,
          module_id AS "moduleId",
          module_title AS "moduleTitle",
          module_order AS "moduleOrder",
          question_id AS "questionId",
          question_prompt AS "questionPrompt",
          question_type AS "questionType",
          question_order AS "questionOrder",
          answer_value AS "answerValue",
          answer_display AS "answerDisplay",
          answer_order AS "answerOrder"
        FROM survey_answers
        WHERE relation = ${relationFilter}
        ORDER BY submission_id DESC, module_order ASC, question_order ASC, answer_order ASC
      `
    : await sql<AnswerRow[]>`
        SELECT
          id,
          submission_id,
          relation,
          module_id AS "moduleId",
          module_title AS "moduleTitle",
          module_order AS "moduleOrder",
          question_id AS "questionId",
          question_prompt AS "questionPrompt",
          question_type AS "questionType",
          question_order AS "questionOrder",
          answer_value AS "answerValue",
          answer_display AS "answerDisplay",
          answer_order AS "answerOrder"
        FROM survey_answers
        ORDER BY submission_id DESC, module_order ASC, question_order ASC, answer_order ASC
      `;

  return buildDashboardData(submissionRows, answerRows, relationFilter);
}

export async function saveSurveySubmission(relation: RelationKey, answers: AnswerMap) {
  return getStorageMode() === "postgres"
    ? saveSurveySubmissionToPostgres(relation, answers)
    : Promise.resolve(saveSurveySubmissionToSqlite(relation, answers));
}

export async function getDashboardData(relationFilter?: RelationKey): Promise<DashboardData> {
  return getStorageMode() === "postgres"
    ? getDashboardDataFromPostgres(relationFilter)
    : Promise.resolve(getDashboardDataFromSqlite(relationFilter));
}
