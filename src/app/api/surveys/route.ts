import { NextResponse } from "next/server";
import { saveSurveySubmission } from "@/lib/survey-db";
import { RelationKey } from "@/lib/types";

export const runtime = "nodejs";

type Payload = {
  relation?: RelationKey;
  answers?: Record<string, string | string[]>;
};

function isRelationKey(value: string): value is RelationKey {
  return value === "estudiante" || value === "docente" || value === "funcionario" || value === "egresado";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Payload;

    if (!body.relation || !isRelationKey(body.relation) || !body.answers) {
      return NextResponse.json({ error: "Solicitud invalida." }, { status: 400 });
    }

    const submissionId = await saveSurveySubmission(body.relation, body.answers);
    return NextResponse.json({ submissionId }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo guardar la encuesta.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
