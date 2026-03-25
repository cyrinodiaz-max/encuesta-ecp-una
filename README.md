# Encuesta ECP UNA · Next.js + Tailwind + Vercel

Proyecto base para la plataforma pública de caracterización institucional de la Escuela de Ciencias Políticas.

## 1. Requisitos
- Node.js 20+
- VS Code
- Cuenta en Vercel

## 2. Instalación local
```bash
npm install
npm run dev
```

## 3. Rutas
- `/` Inicio público
- `/encuesta` Formulario principal
- `/admin` Vista técnica de estructura administrativa

## 4. Archivo central para cambiar preguntas y respuestas
Todo el cuestionario está centralizado en:

```bash
src/config/questionnaire.ts
```

En ese archivo puedes cambiar:
- título del proyecto
- subtítulos
- módulos
- preguntas
- opciones
- límites máximos de selección
- escalas de evaluación

## 5. Estado actual
- Interfaz pública funcional
- Formulario por módulos
- Validación obligatoria antes de avanzar
- Logos institucionales integrados
- Demo de envío guardada en `localStorage`
- Vista administrativa de estructura y gráfico de demostración

## 6. Siguiente etapa técnica recomendada
1. Conectar el formulario a Supabase.
2. Crear autenticación privada para `/admin`.
3. Guardar cada respuesta con timestamp y tipo de encuestado.
4. Construir gráficos automáticos por pregunta cerrada.
5. Habilitar exportación CSV/Excel.

## 7. Despliegue en Vercel
1. Sube esta carpeta a GitHub.
2. Entra a Vercel.
3. Importa el repositorio.
4. Framework: Next.js.
5. Deploy.

