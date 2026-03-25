import Link from "next/link";
import { BrandHeader } from "@/components/BrandHeader";
import { questionnaireConfig } from "@/config/questionnaire";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 pb-28 pt-10 md:px-6 md:py-14">
      <section className="overflow-hidden rounded-[40px] border border-borde bg-panel/88 p-6 shadow-suave backdrop-blur md:p-12">
        <div className="grid gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
          <div className="relative">
            <div className="absolute inset-x-10 top-6 h-40 rounded-full bg-dorado/10 blur-3xl" aria-hidden="true" />
            <div className="relative rounded-[32px] border border-borde bg-panelSec/72 p-6">
              <BrandHeader />
            </div>
          </div>

          <div className="space-y-6 text-center lg:text-left">
            <p className="text-sm uppercase tracking-[0.32em] text-dorado">Plataforma publica</p>
            <div className="space-y-4">
              <h1 className="font-serif text-4xl font-bold leading-[0.97] tracking-[-0.045em] text-tinta md:text-6xl">
                {questionnaireConfig.projectTitle}
              </h1>
              <p className="mx-auto max-w-3xl text-xl font-medium tracking-[-0.02em] text-tinta/90 lg:mx-0">
                {questionnaireConfig.projectSubtitle}
              </p>
            </div>
            <div className="mx-auto h-px w-28 bg-gradient-to-r from-transparent via-dorado to-transparent lg:mx-0" />
            <p className="mx-auto max-w-3xl text-base leading-8 text-tenue lg:mx-0">
              {questionnaireConfig.publicDescription}
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:max-w-2xl">
              <Link
                href="/encuesta"
                className="rounded-2xl bg-dorado px-6 py-4 text-center text-base font-semibold text-slate-900 transition hover:opacity-90"
              >
                Ingresar a la encuesta
              </Link>
              <Link
                href="/admin"
                className="rounded-2xl border border-borde bg-panelSec/70 px-6 py-4 text-center text-base font-semibold text-tinta transition hover:bg-panelSec"
              >
                Panel de Control
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
