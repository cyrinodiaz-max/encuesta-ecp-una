"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useAccessibility } from "@/components/AccessibilityPanel";
import { QuestionRenderer } from "@/components/QuestionRenderer";
import { questionnaireConfig } from "@/config/questionnaire";
import { Module, Question, RelationKey } from "@/lib/types";

const relationCards: { key: RelationKey; title: string }[] = [
  { key: "estudiante", title: "Estudiante" },
  { key: "egresado", title: "Egresado/a" },
  { key: "funcionario", title: "Funcionario/a" },
  { key: "docente", title: "Docente" },
];

function isQuestionAnswered(question: Question, value: string | string[] | undefined) {
  if (question.type === "multiple") {
    return Array.isArray(value) && value.length > 0;
  }

  return typeof value === "string" && value.trim().length > 0;
}

export function SurveyShell() {
  const { reduceMotion } = useAccessibility();
  const [relation, setRelation] = useState<RelationKey | null>(null);
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});

  const modules = useMemo<Module[]>(() => {
    if (!relation) {
      return [];
    }

    return [questionnaireConfig.characterizationModule, ...questionnaireConfig.relations[relation].modules];
  }, [relation]);

  const currentModule = modules[step];
  const selectedRelation = relation ? questionnaireConfig.relations[relation] : null;

  const canContinue = useMemo(() => {
    if (!currentModule) {
      return false;
    }

    return currentModule.questions.every((question) => isQuestionAnswered(question, answers[question.id]));
  }, [answers, currentModule]);

  const progress = modules.length ? Math.round(((step + 1) / modules.length) * 100) : 0;

  const updateAnswer = (id: string, value: string | string[]) => {
    setAnswers((previous) => ({ ...previous, [id]: value }));
  };

  const handleRelationSelect = (nextRelation: RelationKey) => {
    if (relation && relation !== nextRelation) {
      setAnswers({});
      setStep(0);
      setSubmitted(false);
      setSubmissionId(null);
      setSubmitError(null);
    }

    setRelation(nextRelation);
  };

  const handleBack = () => {
    if (step === 0) {
      setStarted(false);
      return;
    }

    setStep((previous) => Math.max(0, previous - 1));
  };

  const handleSubmit = async () => {
    if (!relation || !canContinue || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/surveys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          relation,
          answers,
        }),
      });

      const payload = (await response.json()) as { submissionId?: number; error?: string };

      if (!response.ok || !payload.submissionId) {
        throw new Error(payload.error ?? "No se pudo guardar la encuesta.");
      }

      localStorage.setItem(
        "encuesta-ecp-una-demo",
        JSON.stringify(
          {
            relation,
            answers,
            sentAt: new Date().toISOString(),
            submissionId: payload.submissionId,
          },
          null,
          2,
        ),
      );

      setSubmissionId(payload.submissionId);
      setSubmitted(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "No se pudo guardar la encuesta.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!started) {
    return (
      <section className="rounded-[32px] border border-borde bg-panel/85 p-5 shadow-suave backdrop-blur md:p-10">
        <div className="space-y-8">
          <div className="space-y-3 text-center">
            <p className="text-sm uppercase tracking-[0.28em] text-dorado">Acceso publico</p>
            <h2 className="text-3xl font-bold md:text-4xl">{questionnaireConfig.projectTitle}</h2>
            <p className="mx-auto max-w-3xl text-base leading-8 text-tenue">{questionnaireConfig.publicDescription}</p>
          </div>

          <div className="space-y-4">
            <label className="block text-center text-lg font-semibold">
              Cual es su relacion con la Escuela de Ciencias Politicas?
            </label>

            <div className="space-y-3">
              {relationCards.map((card) => {
                const active = relation === card.key;

                return (
                  <button
                    key={card.key}
                    type="button"
                    onClick={() => handleRelationSelect(card.key)}
                    aria-pressed={active}
                    className={`w-full rounded-3xl border px-5 py-5 text-left transition ${
                      active
                        ? "border-dorado bg-dorado/15 text-tinta"
                        : "border-borde bg-panelSec/70 text-tinta hover:border-dorado/40 hover:bg-panelSec/90"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-1 h-4 w-4 rounded-full border ${
                          active ? "border-dorado bg-dorado" : "border-borde bg-panel"
                        }`}
                      />
                      <div>
                        <span className="text-lg font-semibold">{card.title}</span>
                        <p className="mt-2 text-sm leading-6 text-tenue">
                          {questionnaireConfig.relations[card.key].intro}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => relation && setStarted(true)}
              disabled={!relation}
              className="rounded-2xl bg-dorado px-6 py-3 font-semibold text-slate-900 transition hover:opacity-90"
            >
              Ingresar a la encuesta
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (submitted) {
    return (
      <section className="rounded-[32px] border border-borde bg-panel/85 p-6 shadow-suave backdrop-blur md:p-10">
        <div className="space-y-5 text-center">
          <p className="text-sm uppercase tracking-[0.28em] text-dorado">Envio completado</p>
          <h2 className="text-3xl font-bold">Gracias por participar</h2>
          <p className="mx-auto max-w-2xl text-tenue">
            La respuesta fue registrada correctamente en la base institucional y ya aparece disponible dentro del panel de
            administracion.
          </p>
          <div className="mx-auto max-w-xl rounded-3xl border border-borde bg-panelSec/78 p-5 text-left text-sm leading-7 text-tenue">
            <p className="font-semibold text-tinta">Registro guardado: #{submissionId}</p>
            <p className="mt-2">Tipo de encuestado: {selectedRelation?.label}</p>
            <p className="mt-2">Tambien se guardo una copia local de respaldo en este navegador.</p>
          </div>
        </div>
      </section>
    );
  }

  if (!currentModule || !selectedRelation) {
    return null;
  }

  return (
    <section className="rounded-[32px] border border-borde bg-panel/85 p-4 shadow-suave backdrop-blur md:p-10">
      <div className="mb-8 space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-dorado">{selectedRelation.label}</p>
            <h2 className="text-2xl font-bold md:text-3xl">{currentModule.title}</h2>
            <p className="mt-2 max-w-3xl text-base leading-8 text-tenue">{currentModule.subtitle}</p>
          </div>
          <div className="min-w-44 rounded-2xl border border-borde bg-panelSec/75 px-4 py-3 text-sm text-tenue">
            Paso {step + 1} de {modules.length}
          </div>
        </div>

        <div className="h-3 w-full overflow-hidden rounded-full bg-panelSec/85">
          <div className="h-full rounded-full bg-dorado transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <motion.div
        key={currentModule.id}
        initial={reduceMotion ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.22 }}
        className="space-y-5"
      >
        {currentModule.questions.map((question) => (
          <div key={question.id} className="rounded-3xl border border-borde bg-panelSec/70 p-4 md:p-5">
            <QuestionRenderer
              question={question}
              value={answers[question.id] ?? (question.type === "multiple" ? [] : "")}
              onChange={(nextValue) => updateAnswer(question.id, nextValue)}
            />
          </div>
        ))}
      </motion.div>

      <div className="mt-8 flex flex-col gap-4 rounded-3xl border border-borde bg-panelSec/65 p-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2 text-sm leading-6 text-tenue">
          <p>Todas las preguntas son obligatorias para avanzar al siguiente modulo.</p>
          {submitError ? <p className="text-red-200">{submitError}</p> : null}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={handleBack}
            className="rounded-2xl border border-borde bg-panel px-5 py-3 text-sm font-semibold text-tinta transition hover:bg-panelSec/90"
          >
            Anterior
          </button>
          {step < modules.length - 1 ? (
            <button
              type="button"
              onClick={() => canContinue && setStep((previous) => previous + 1)}
              disabled={!canContinue}
              className="rounded-2xl bg-dorado px-5 py-3 text-sm font-semibold text-slate-900 transition hover:opacity-90"
            >
              Siguiente
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canContinue || isSubmitting}
              className="rounded-2xl bg-dorado px-5 py-3 text-sm font-semibold text-slate-900 transition hover:opacity-90"
            >
              {isSubmitting ? "Guardando..." : "Enviar encuesta"}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
