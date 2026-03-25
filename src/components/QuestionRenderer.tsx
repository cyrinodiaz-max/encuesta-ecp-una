"use client";

import { Check } from "lucide-react";
import { Question } from "@/lib/types";

type Props = {
  question: Question;
  value: string | string[];
  onChange: (value: string | string[]) => void;
};

export function QuestionRenderer({ question, value, onChange }: Props) {
  const currentArray = Array.isArray(value) ? value : [];
  const helperText =
    question.helpText ??
    (question.type === "multiple" && question.maxSelections
      ? `Puedes seleccionar hasta ${question.maxSelections} opciones.`
      : undefined);

  const getChoiceClassName = (active: boolean) =>
    `w-full rounded-2xl border px-4 py-4 text-left transition ${
      active
        ? "border-dorado bg-dorado/15 text-tinta shadow-[0_14px_30px_rgba(0,0,0,0.12)]"
        : "border-borde bg-panel/80 text-tenue hover:border-dorado/40 hover:bg-panelSec/90"
    }`;

  if (question.type === "text" || question.type === "email" || question.type === "number") {
    return (
      <div className="space-y-3">
        <label htmlFor={question.id} className="text-[1.02rem] font-semibold tracking-[0.012em] text-tinta">
          {question.prompt}
        </label>
        {helperText ? <p className="text-sm leading-6 text-tenue">{helperText}</p> : null}
        <input
          id={question.id}
          type={question.type === "number" ? "number" : question.type}
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value)}
          placeholder={question.placeholder}
          className="w-full"
        />
      </div>
    );
  }

  if (question.type === "textarea") {
    return (
      <div className="space-y-3">
        <label htmlFor={question.id} className="text-[1.02rem] font-semibold tracking-[0.012em] text-tinta">
          {question.prompt}
        </label>
        {helperText ? <p className="text-sm leading-6 text-tenue">{helperText}</p> : null}
        <textarea
          id={question.id}
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value)}
          placeholder={question.placeholder}
          className="min-h-32 w-full"
        />
      </div>
    );
  }

  if (question.type === "single") {
    return (
      <div className="space-y-3">
        <p className="text-[1.02rem] font-semibold tracking-[0.012em] text-tinta">{question.prompt}</p>
        {helperText ? <p className="text-sm leading-6 text-tenue">{helperText}</p> : null}
        <div className="space-y-3">
          {question.options?.map((option) => {
            const active = value === option.value;

            return (
              <button
                type="button"
                key={option.value}
                onClick={() => onChange(option.value)}
                aria-pressed={active}
                className={getChoiceClassName(active)}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                      active ? "border-dorado bg-dorado text-slate-900" : "border-borde bg-panelSec/80"
                    }`}
                  >
                    {active ? <Check className="h-3.5 w-3.5" /> : null}
                  </span>
                  <span className="text-base font-medium leading-6 tracking-[0.01em] text-tinta">{option.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (question.type === "multiple") {
    return (
      <div className="space-y-3">
        <p className="text-[1.02rem] font-semibold tracking-[0.012em] text-tinta">{question.prompt}</p>
        {helperText ? <p className="text-sm leading-6 text-tenue">{helperText}</p> : null}
        <div className="space-y-3">
          {question.options?.map((option) => {
            const active = currentArray.includes(option.value);

            return (
              <button
                type="button"
                key={option.value}
                onClick={() => {
                  if (active) {
                    onChange(currentArray.filter((item) => item !== option.value));
                    return;
                  }

                  if (question.maxSelections && currentArray.length >= question.maxSelections) {
                    return;
                  }

                  onChange([...currentArray, option.value]);
                }}
                aria-pressed={active}
                className={getChoiceClassName(active)}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border ${
                      active ? "border-dorado bg-dorado text-slate-900" : "border-borde bg-panelSec/80"
                    }`}
                  >
                    {active ? <Check className="h-3.5 w-3.5" /> : null}
                  </span>
                  <span className="text-base font-medium leading-6 tracking-[0.01em] text-tinta">{option.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-[1.02rem] font-semibold tracking-[0.012em] text-tinta">{question.prompt}</p>
      {helperText ? <p className="text-sm leading-6 text-tenue">{helperText}</p> : null}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((item) => {
          const active = String(value) === String(item);

          return (
            <button
              type="button"
              key={item}
              onClick={() => onChange(String(item))}
              aria-pressed={active}
              className={getChoiceClassName(active)}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${
                    active ? "border-dorado bg-dorado text-slate-900" : "border-borde bg-panelSec/80 text-tinta"
                  }`}
                >
                  {item}
                </span>
                <div>
                  <div className="text-base font-semibold tracking-[0.01em] text-tinta">Nivel {item}</div>
                  <div className="mt-1 text-sm leading-6 text-tenue">{question.scaleLabels?.[item - 1]}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
