import { AdminDashboard } from "@/components/AdminDashboard";
import { BrandHeader } from "@/components/BrandHeader";
import {
  AdminAccessScope,
  getAdminAccessTitle,
  getAdminRoleLabel,
  getAdminSession,
} from "@/lib/admin-auth";
import { getRelationConfig } from "@/lib/questionnaire-helpers";
import { getDashboardData } from "@/lib/survey-db";
import { RelationKey } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AdminPageProps = {
  searchParams?: Promise<{
    error?: string;
    relation?: string;
  }>;
};

const relationOrder: RelationKey[] = ["estudiante", "docente", "funcionario", "egresado"];

function isRelationKey(value: string | undefined): value is RelationKey {
  return value === "estudiante" || value === "docente" || value === "funcionario" || value === "egresado";
}

function getReportHref(scope: AdminAccessScope, activeRelation: RelationKey | null) {
  if (scope !== "all") {
    return `/api/admin/report?relation=${scope}`;
  }

  return activeRelation ? `/api/admin/report?relation=${activeRelation}` : "/api/admin/report";
}

function getReportLabel(scope: AdminAccessScope, activeRelation: RelationKey | null) {
  if (scope !== "all") {
    return `Descargar informe de ${getRelationConfig(scope).label.toLowerCase()}`;
  }

  if (activeRelation) {
    return `Descargar informe de ${getRelationConfig(activeRelation).label.toLowerCase()}`;
  }

  return "Descargar informe general";
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const session = await getAdminSession();

  if (!session) {
    const resolvedSearchParams = (await searchParams) ?? {};
    const showError = resolvedSearchParams.error === "invalid";

    return (
      <main className="mx-auto max-w-5xl px-4 pb-28 pt-10 md:px-6 md:py-14">
        <section className="grid gap-8 rounded-[36px] border border-borde bg-panel/90 p-6 shadow-suave backdrop-blur lg:grid-cols-[0.95fr_1.05fr] lg:p-10">
          <div className="flex flex-col justify-between gap-8">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-dorado">Panel de control</p>
              <h1 className="mt-4 max-w-xl font-serif text-4xl font-bold leading-tight tracking-[-0.04em] text-tinta md:text-5xl">
                Acceso al panel de administracion institucional
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-tenue">
                Ingrese sus credenciales para revisar el resumen estadistico, las respuestas individuales y los informes
                PDF segun el nivel de acceso asignado a su relacion con la Escuela.
              </p>
            </div>
            <div className="rounded-[30px] border border-borde bg-panelSec/70 p-6">
              <BrandHeader />
              <div className="mt-5 space-y-3 text-sm leading-7 text-tenue">
                <p>Panel protegido con autenticacion segura y acceso diferenciado por relacion con la Escuela.</p>
              </div>
            </div>
          </div>

          <section className="rounded-[32px] border border-borde bg-panelSec/76 p-6 shadow-suave">
            <p className="text-sm uppercase tracking-[0.24em] text-dorado">Inicio de sesion</p>
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em] text-tinta">Ingrese para continuar</h2>
            <p className="mt-3 text-sm leading-7 text-tenue">
              Utilice el usuario y la contrasena institucional asignada para acceder a su panel.
            </p>

            <form action="/api/admin/login" method="post" className="mt-6 space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-semibold tracking-[0.01em] text-tinta">
                  Usuario
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  placeholder="Ingrese su usuario"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-semibold tracking-[0.01em] text-tinta">
                  Contrasena
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Ingrese su contrasena"
                  required
                />
              </div>

              {showError ? (
                <div className="rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                  Las credenciales ingresadas no son validas. Intente nuevamente.
                </div>
              ) : null}

              <button
                type="submit"
                className="w-full rounded-2xl bg-dorado px-6 py-4 text-base font-semibold text-slate-900 transition hover:opacity-90"
              >
                Ingresar al panel
              </button>
            </form>
          </section>
        </section>
      </main>
    );
  }

  const resolvedSearchParams = (await searchParams) ?? {};
  const requestedRelation = isRelationKey(resolvedSearchParams.relation) ? resolvedSearchParams.relation : null;
  const activeRelation = session.access === "all" ? requestedRelation : session.access;
  const dashboardData = await getDashboardData(activeRelation ?? undefined);
  const overviewData = session.access === "all" && activeRelation ? await getDashboardData() : dashboardData;

  const relationFilters =
    session.access === "all"
      ? [
          {
            key: "all" as const,
            label: "General",
            href: "/admin",
            total: overviewData.totalSubmissions,
            active: activeRelation === null,
          },
          ...relationOrder.map((relation) => {
            const relationSummaryItem = overviewData.relationSummary.find((item) => item.relation === relation);

            return {
              key: relation,
              label: getRelationConfig(relation).label,
              href: `/admin?relation=${relation}`,
              total: relationSummaryItem?.total ?? 0,
              active: activeRelation === relation,
            };
          }),
        ]
      : [
          {
            key: session.access,
            label: getRelationConfig(session.access).label,
            href: `/admin?relation=${session.access}`,
            total: dashboardData.totalSubmissions,
            active: true,
          },
        ];

  const currentViewTitle =
    activeRelation === null ? "Vista general de las cuatro relaciones con la Escuela" : `Vista activa: ${getRelationConfig(activeRelation).label}`;

  return (
    <main className="mx-auto max-w-7xl px-4 pb-28 pt-10 md:px-6 md:py-14">
      <section className="mb-8 flex flex-col gap-5 rounded-[36px] border border-borde bg-panel/88 p-6 shadow-suave backdrop-blur">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-dorado">Panel de control</p>
            <h1 className="mt-3 font-serif text-4xl font-bold tracking-[-0.04em] text-tinta md:text-5xl">
              {getAdminAccessTitle(session.access)}
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-8 text-tenue">
              {currentViewTitle}. Visualice estadisticas, respuestas individuales e informes PDF dentro del alcance
              autorizado para su usuario.
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              <span className="rounded-full border border-borde bg-panelSec/78 px-4 py-2 font-semibold text-tinta">
                Usuario: {session.username}
              </span>
              <span className="rounded-full border border-dorado/50 bg-dorado/15 px-4 py-2 font-semibold text-tinta">
                Acceso: {getAdminRoleLabel(session.access)}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href="/"
              className="rounded-2xl border border-borde bg-panelSec/78 px-5 py-3 text-center text-sm font-semibold text-tinta transition hover:bg-panelSec"
            >
              Volver al inicio
            </a>
            <a
              href={getReportHref(session.access, activeRelation)}
              className="rounded-2xl border border-borde bg-panelSec/78 px-5 py-3 text-center text-sm font-semibold text-tinta transition hover:bg-panelSec"
            >
              {getReportLabel(session.access, activeRelation)}
            </a>
            <form action="/api/admin/logout" method="post">
              <button
                type="submit"
                className="w-full rounded-2xl bg-dorado px-5 py-3 text-sm font-semibold text-slate-900 transition hover:opacity-90"
              >
                Cerrar sesion
              </button>
            </form>
          </div>
        </div>

        <div className="rounded-[30px] border border-borde bg-panelSec/68 p-4">
          <p className="text-sm uppercase tracking-[0.24em] text-dorado">Secciones disponibles</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3 xl:grid-cols-5">
            {relationFilters.map((filter) => (
              <a
                key={filter.key}
                href={filter.href}
                className={`rounded-2xl border px-4 py-4 transition ${
                  filter.active
                    ? "border-dorado bg-dorado/15 text-tinta"
                    : "border-borde bg-panel/80 text-tinta hover:border-dorado/40 hover:bg-panelSec/90"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-base font-semibold">{filter.label}</span>
                  <span className="rounded-full bg-panelSec/85 px-3 py-1 text-xs font-semibold text-tenue">
                    {filter.total}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <AdminDashboard data={dashboardData} accessScope={session.access} />
    </main>
  );
}
