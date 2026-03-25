"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatAsuncionDate } from "@/lib/date-format";
import { DashboardData, QuestionSummary } from "@/lib/survey-db";

const chartColors = ["#d5b06b", "#87b7ff", "#6fd3b3", "#ff8c8c", "#b89cff", "#ffd37a", "#7ed0ff"];

function ChartModal({
  summary,
  onClose,
}: {
  summary: QuestionSummary | null;
  onClose: () => void;
}) {
  if (!summary) {
    return null;
  }

  const pieData = summary.options.map((option, index) => ({
    name: option.label,
    value: option.total,
    fill: chartColors[index % chartColors.length],
  }));

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 px-4 py-6 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-auto rounded-[32px] border border-borde bg-panel p-5 shadow-[0_28px_80px_rgba(0,0,0,0.35)] md:p-6">
        <div className="flex flex-col gap-4 border-b border-borde pb-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-dorado">Graficos</p>
            <h3 className="mt-2 text-2xl font-bold text-tinta">{summary.questionPrompt}</h3>
            <p className="mt-2 text-sm leading-7 text-tenue">
              {summary.totalResponses} respuestas acumuladas para esta pregunta.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-borde bg-panelSec/78 px-4 py-2 text-sm font-semibold text-tinta transition hover:bg-panelSec"
          >
            Cerrar
          </button>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <section className="rounded-3xl border border-borde bg-panelSec/72 p-4">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-dorado">Grafico de barras</p>
            <div className="mt-4 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.options}>
                  <XAxis dataKey="label" stroke="rgb(var(--color-tenue))" interval={0} angle={-12} textAnchor="end" height={80} />
                  <YAxis stroke="rgb(var(--color-tenue))" allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="total" radius={[10, 10, 0, 0]}>
                    {summary.options.map((option, index) => (
                      <Cell key={`${summary.questionId}-${option.label}-bar`} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="rounded-3xl border border-borde bg-panelSec/72 p-4">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-dorado">Grafico circular</p>
            <div className="mt-4 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={110} innerRadius={50} paddingAngle={2}>
                    {pieData.map((slice) => (
                      <Cell key={`${summary.questionId}-${slice.name}-pie`} fill={slice.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        <div className="mt-5 rounded-3xl border border-borde bg-panelSec/68 p-4">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-dorado">Lectura tecnica</p>
          <div className="mt-3 space-y-2">
            {summary.options.map((option) => (
              <div key={`${summary.questionId}-${option.label}-read`} className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-tinta">{option.label}</span>
                <span className="text-tenue">
                  {option.total} respuestas · {option.percent}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminDashboard({ data }: { data: DashboardData }) {
  const [activeChart, setActiveChart] = useState<QuestionSummary | null>(null);

  const moduleEntries = useMemo(() => {
    const moduleSummaries = data.questionSummaries.reduce<Record<string, typeof data.questionSummaries>>((accumulator, summary) => {
      const key = summary.moduleId;
      accumulator[key] = [...(accumulator[key] ?? []), summary];
      return accumulator;
    }, {});

    return Object.entries(moduleSummaries);
  }, [data.questionSummaries]);

  return (
    <>
      <div className="space-y-8">
        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-[28px] border border-borde bg-panel/88 p-5 shadow-suave backdrop-blur">
            <p className="text-sm uppercase tracking-[0.24em] text-dorado">Total de encuestas</p>
            <h2 className="mt-3 text-4xl font-bold">{data.totalSubmissions}</h2>
            <p className="mt-2 text-sm leading-6 text-tenue">Cantidad total de formularios almacenados en la base institucional.</p>
          </article>
          <article className="rounded-[28px] border border-borde bg-panel/88 p-5 shadow-suave backdrop-blur">
            <p className="text-sm uppercase tracking-[0.24em] text-dorado">Ultimo registro</p>
            <h2 className="mt-3 text-xl font-bold">{formatAsuncionDate(data.latestSubmissionAt)}</h2>
            <p className="mt-2 text-sm leading-6 text-tenue">Marca temporal del envio mas reciente registrado en el sistema.</p>
          </article>
          <article className="rounded-[28px] border border-borde bg-panel/88 p-5 shadow-suave backdrop-blur">
            <p className="text-sm uppercase tracking-[0.24em] text-dorado">Respuestas detalladas</p>
            <h2 className="mt-3 text-4xl font-bold">{data.totalDetailedAnswers}</h2>
            <p className="mt-2 text-sm leading-6 text-tenue">Cantidad de respuestas individuales indexadas por pregunta.</p>
          </article>
        </section>

        <section className="rounded-[32px] border border-borde bg-panel/88 p-6 shadow-suave backdrop-blur">
          <div className="mb-5">
            <p className="text-sm uppercase tracking-[0.24em] text-dorado">Vision general</p>
            <h2 className="mt-2 text-2xl font-bold">Distribucion por tipo de encuestado</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {data.relationSummary.map((item) => {
              const percent = data.totalSubmissions ? Math.round((item.total / data.totalSubmissions) * 100) : 0;

              return (
                <article key={item.relation} className="rounded-3xl border border-borde bg-panelSec/72 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-tinta">{item.label}</p>
                      <p className="mt-1 text-sm text-tenue">{item.total} respuestas</p>
                    </div>
                    <span className="rounded-full bg-dorado/15 px-3 py-1 text-sm font-semibold text-tinta">{percent}%</span>
                  </div>
                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-panel">
                    <div className="h-full rounded-full bg-dorado" style={{ width: `${percent}%` }} />
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="rounded-[32px] border border-borde bg-panel/88 p-6 shadow-suave backdrop-blur">
          <div className="mb-5">
            <p className="text-sm uppercase tracking-[0.24em] text-dorado">Estadistica por pregunta</p>
            <h2 className="mt-2 text-2xl font-bold">Graficas acumuladas de respuestas cerradas</h2>
          </div>
          {moduleEntries.length ? (
            <div className="space-y-6">
              {moduleEntries.map(([moduleId, summaries]) => (
                <div key={moduleId} className="rounded-3xl border border-borde bg-panelSec/68 p-4">
                  <h3 className="text-lg font-semibold text-tinta">{summaries[0]?.moduleTitle}</h3>
                  <div className="mt-4 space-y-4">
                    {summaries.map((summary) => (
                      <article key={summary.questionId} className="rounded-3xl border border-borde bg-panel/80 p-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div>
                            <p className="text-base font-semibold tracking-[0.01em] text-tinta">{summary.questionPrompt}</p>
                            <p className="mt-1 text-sm text-tenue">{summary.totalResponses} respuestas consideradas</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveChart(summary)}
                            className="rounded-full border border-borde bg-panelSec/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-tinta transition hover:bg-panelSec"
                          >
                            Graficos
                          </button>
                        </div>
                        <div className="mt-4 space-y-3">
                          {summary.options.map((option) => (
                            <div key={`${summary.questionId}-${option.label}`} className="space-y-2">
                              <div className="flex items-center justify-between gap-3 text-sm">
                                <span className="font-medium text-tinta">{option.label}</span>
                                <span className="text-tenue">
                                  {option.total} · {option.percent}%
                                </span>
                              </div>
                              <div className="h-3 overflow-hidden rounded-full bg-panelSec">
                                <div className="h-full rounded-full bg-dorado" style={{ width: `${option.percent}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-borde bg-panelSec/60 px-5 py-8 text-sm leading-7 text-tenue">
              Aun no hay respuestas cerradas registradas para mostrar estadisticas.
            </div>
          )}
        </section>

        <section className="rounded-[32px] border border-borde bg-panel/88 p-6 shadow-suave backdrop-blur">
          <div className="mb-5">
            <p className="text-sm uppercase tracking-[0.24em] text-dorado">Detalle individual</p>
            <h2 className="mt-2 text-2xl font-bold">Acceso por persona y respuestas completas</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-tenue">
              Cada registro queda contraido por defecto. Abra solo la persona que desea revisar.
            </p>
          </div>
          {data.submissions.length ? (
            <div className="space-y-5">
              {data.submissions.map((submission) => (
                <details key={submission.id} className="rounded-3xl border border-borde bg-panelSec/68 p-5">
                  <summary className="flex cursor-pointer list-none flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-tinta">{submission.respondentName}</h3>
                      <p className="mt-2 text-sm leading-6 text-tenue">
                        {submission.relationLabel} · {submission.respondentEmail} · {submission.respondentPhone}
                      </p>
                      <p className="mt-2 text-sm font-medium text-dorado">Pulse para ver respuestas completas</p>
                    </div>
                    <div className="rounded-2xl border border-borde bg-panel px-4 py-3 text-sm text-tenue">
                      Registro #{submission.id}
                      <div className="mt-1 font-medium text-tinta">{formatAsuncionDate(submission.createdAt)}</div>
                    </div>
                  </summary>

                  <div className="mt-4 space-y-4 border-t border-borde pt-4">
                    {submission.modules.map((module) => (
                      <div key={`${submission.id}-${module.moduleId}`} className="rounded-3xl border border-borde bg-panel/80 p-4">
                        <h4 className="text-base font-semibold text-tinta">{module.moduleTitle}</h4>
                        <div className="mt-3 space-y-3">
                          {module.questions.map((question) => (
                            <div
                              key={`${submission.id}-${module.moduleId}-${question.questionId}`}
                              className="rounded-2xl border border-borde bg-panelSec/65 px-4 py-3"
                            >
                              <p className="text-sm font-semibold tracking-[0.01em] text-tinta">{question.questionPrompt}</p>
                              <p className="mt-2 text-sm leading-6 text-tenue">{question.answerDisplay}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-borde bg-panelSec/60 px-5 py-8 text-sm leading-7 text-tenue">
              Todavia no se registraron respuestas en la base institucional de la encuesta.
            </div>
          )}
        </section>
      </div>

      <ChartModal summary={activeChart} onClose={() => setActiveChart(null)} />
    </>
  );
}
