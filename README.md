# Encuesta ECP UNA

Aplicacion Next.js para encuesta institucional de la Escuela de Ciencias Politicas, con panel administrativo, graficos, detalle individual y exportacion de informe PDF.

## Requisitos

- Node.js 20 o superior
- npm
- Cuenta en Vercel
- Proyecto Postgres en Supabase para produccion

## Desarrollo local

```bash
npm install
npm run dev
```

## Variables de entorno

Cree un archivo `.env.local` a partir de `.env.example`.

```env
DATABASE_URL=
ADMIN_ACCOUNTS_JSON=
ADMIN_SESSION_SALT=ecp-una-panel
ALLOW_SQLITE_FALLBACK=true
```

Notas:

- En local, si `DATABASE_URL` no existe, la app puede seguir usando SQLite solo como respaldo de desarrollo.
- En produccion, configure `DATABASE_URL` para usar Supabase/Postgres.
- Puede usar `ADMIN_ACCOUNTS_JSON` para definir usuarios y roles personalizados.
- Si no define `ADMIN_ACCOUNTS_JSON`, la aplicacion usa la lista de accesos configurada en el proyecto.
- Cambie `ADMIN_SESSION_SALT` antes de publicar.

## Scripts utiles

```bash
npm run dev
npm run build
npx tsc --noEmit
npm run db:import:supabase
```

## Importar la base local a Supabase

Si ya tienes respuestas guardadas en `data/encuesta-ecp-una.db`, puedes volcarlas a Supabase:

```bash
npm run db:import:supabase
```

Si la base remota ya tiene datos y deseas sobrescribirla:

```bash
FORCE_IMPORT=true npm run db:import:supabase
```

En PowerShell:

```powershell
$env:FORCE_IMPORT="true"
npm run db:import:supabase
```

## Rutas principales

- `/` Inicio publico
- `/encuesta` Formulario principal
- `/admin` Panel de control
- `/api/admin/report` Descarga del informe PDF

## Despliegue en Vercel

1. Sube el proyecto a GitHub.
2. Importa el repositorio en Vercel.
3. Configura las variables de entorno del proyecto.
4. Ejecuta el despliegue.
5. Verifica el envio de encuestas y el acceso al panel.

## Estructura importante

- `src/config/questionnaire.ts`: preguntas, modulos y opciones
- `src/lib/survey-db.ts`: persistencia y lectura de datos
- `src/app/api/surveys/route.ts`: envio del formulario
- `src/app/admin/page.tsx`: acceso y panel administrativo
- `src/app/api/admin/report/route.ts`: generacion de informe PDF
