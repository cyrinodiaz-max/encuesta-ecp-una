"use client";

import { questionnaireConfig } from "@/config/questionnaire";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const demoData = [
  { name: "1", value: 4 },
  { name: "2", value: 7 },
  { name: "3", value: 12 },
  { name: "4", value: 18 },
  { name: "5", value: 9 },
];

export function AdminPreview() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-[28px] border border-borde bg-panel/85 p-6 shadow-suave backdrop-blur">
        <p className="text-sm uppercase tracking-[0.24em] text-dorado">Centro de configuracion</p>
        <h2 className="mt-3 text-2xl font-bold">Edicion centralizada de preguntas y respuestas</h2>
        <p className="mt-3 text-sm leading-7 text-tenue">
          Para evitar modificar multiples archivos, toda la estructura del cuestionario se centralizo en
          <span className="font-semibold text-tinta"> src/config/questionnaire.ts</span>. Alli podras cambiar titulos,
          subtitulos, modulos, preguntas, opciones, limites de seleccion y escalas sin rehacer toda la aplicacion.
        </p>
        <div className="mt-6 rounded-3xl border border-borde bg-panelSec/75 p-5">
          <p className="text-sm font-semibold">Estructura configurada actualmente</p>
          <ul className="mt-3 space-y-2 text-sm text-tenue">
            <li>- Modulo general compartido: {questionnaireConfig.characterizationModule.questions.length} preguntas</li>
            <li>- Formulario estudiante: {questionnaireConfig.relations.estudiante.modules.length} modulos</li>
            <li>- Formulario docente: {questionnaireConfig.relations.docente.modules.length} modulos</li>
            <li>- Formulario funcionario: {questionnaireConfig.relations.funcionario.modules.length} modulos</li>
            <li>- Formulario egresado: {questionnaireConfig.relations.egresado.modules.length} modulos</li>
          </ul>
        </div>
      </div>

      <div className="rounded-[28px] border border-borde bg-panel/85 p-6 shadow-suave backdrop-blur">
        <p className="text-sm uppercase tracking-[0.24em] text-dorado">Vista previa del panel</p>
        <h2 className="mt-3 text-2xl font-bold">Grafico automatico de barras</h2>
        <p className="mt-3 text-sm leading-7 text-tenue">
          En la siguiente etapa, todas las respuestas de opcion multiple y escala se cargaran desde base de datos y se
          representaran automaticamente en graficos de barras como este.
        </p>
        <div className="mt-6 h-72 rounded-3xl border border-borde bg-panelSec/75 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={demoData}>
              <XAxis dataKey="name" stroke="rgb(var(--color-tenue))" />
              <YAxis stroke="rgb(var(--color-tenue))" allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="rgb(var(--color-dorado))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
