import { AdminDashboard } from "@/components/AdminDashboard";
import { BrandHeader } from "@/components/BrandHeader";
import { getAdminRoleLabel, getAdminSession } from "@/lib/admin-auth";
import { getDashboardData } from "@/lib/survey-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AdminPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

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
                Ingrese sus credenciales para revisar el resumen estadistico, el detalle de respuestas y el registro
                completo de la encuesta almacenado en la base institucional.
              </p>
            </div>
            <div className="rounded-[30px] border border-borde bg-panelSec/70 p-6">
              <BrandHeader />
              <div className="mt-5 space-y-3 text-sm leading-7 text-tenue">
                <p>Panel protegido con autenticacion segura y acceso restringido a personal autorizado.</p>
              </div>
            </div>
          </div>

          <section className="rounded-[32px] border border-borde bg-panelSec/76 p-6 shadow-suave">
            <p className="text-sm uppercase tracking-[0.24em] text-dorado">Inicio de sesion</p>
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em] text-tinta">Ingrese para continuar</h2>
            <p className="mt-3 text-sm leading-7 text-tenue">
              Utilice el usuario institucional y la contrasena asignada para acceder al panel.
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
                <input id="password" name="password" type="password" autoComplete="current-password" placeholder="Ingrese su contrasena" required />
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

  const dashboardData = await getDashboardData();

  return (
    <main className="mx-auto max-w-7xl px-4 pb-28 pt-10 md:px-6 md:py-14">
      <section className="mb-8 flex flex-col gap-5 rounded-[36px] border border-borde bg-panel/88 p-6 shadow-suave backdrop-blur lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-dorado">Panel de control</p>
          <h1 className="mt-3 font-serif text-4xl font-bold tracking-[-0.04em] text-tinta md:text-5xl">
            Administracion de respuestas y estadisticas
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-8 text-tenue">
            Visualice el total de respuestas, la informacion detallada por pregunta y el historial completo de envios
            registrados en la base de datos institucional.
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <span className="rounded-full border border-borde bg-panelSec/78 px-4 py-2 font-semibold text-tinta">
              Usuario: {session.username}
            </span>
            <span className="rounded-full border border-dorado/50 bg-dorado/15 px-4 py-2 font-semibold text-tinta">
              Nivel: {getAdminRoleLabel(session.role)}
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
          {session.role === "superadmin" ? (
            <a
              href="/api/admin/report"
              className="rounded-2xl border border-borde bg-panelSec/78 px-5 py-3 text-center text-sm font-semibold text-tinta transition hover:bg-panelSec"
            >
              Descargar informe general
            </a>
          ) : (
            <div className="rounded-2xl border border-borde bg-panelSec/68 px-5 py-3 text-center text-sm font-semibold text-tenue">
              El informe PDF completo esta disponible solo para Superadmin.
            </div>
          )}
          <form action="/api/admin/logout" method="post">
            <button
              type="submit"
              className="w-full rounded-2xl bg-dorado px-5 py-3 text-sm font-semibold text-slate-900 transition hover:opacity-90"
            >
              Cerrar sesion
            </button>
          </form>
        </div>
      </section>

      <AdminDashboard data={dashboardData} role={session.role} roleLabel={getAdminRoleLabel(session.role)} />
    </main>
  );
}
