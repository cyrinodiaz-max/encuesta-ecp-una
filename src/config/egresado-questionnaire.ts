import { RelationConfig } from "@/lib/types";

const scaleGraduateEvaluation: [string, string, string, string, string] = [
  "Muy bajo",
  "Bajo",
  "Medio",
  "Alto",
  "Excelente",
];

export const egresadoQuestionnaireConfig: RelationConfig = {
  label: "Egresado",
  usesSharedCharacterization: false,
  intro:
    "Formulario de seguimiento de egresados orientado a relevar trayectoria posterior al egreso, insercion laboral, pertinencia de la formacion, desarrollo continuo y retroalimentacion institucional.",
  modules: [
    {
      id: "datos-personales-egresado",
      title: "Seccion 1. Datos personales",
      subtitle:
        "Registro base para identificar al egresado, ubicar su contacto actual y ordenar la trazabilidad de la informacion posterior al egreso.",
      questions: [
        { id: "nombre_completo", prompt: "Nombre y apellido", type: "text", required: true, placeholder: "Escriba su nombre completo" },
        { id: "cedula_identidad", prompt: "Cedula de identidad", type: "text", required: true, placeholder: "Ej. 1234567" },
        { id: "anio_egreso", prompt: "Ano de egreso", type: "text", required: true, placeholder: "Ej. 2024" },
        { id: "telefono", prompt: "Telefono", type: "text", required: true, placeholder: "Ej. +595..." },
        { id: "correo", prompt: "Correo electronico", type: "email", required: true, placeholder: "Ej. nombre@correo.com" },
        { id: "ciudad_residencia", prompt: "Ciudad de residencia", type: "text", required: true, placeholder: "Ej. Asuncion" },
        { id: "pais_residencia", prompt: "Pais de residencia", type: "text", required: true, placeholder: "Ej. Paraguay" },
      ],
    },
    {
      id: "informacion-academica-egresado",
      title: "Seccion 2. Informacion academica",
      subtitle:
        "Bloque orientado a reconstruir la trayectoria academica del egresado y su continuidad formativa posterior.",
      questions: [
        { id: "anio_ingreso", prompt: "Ano de ingreso", type: "text", required: true, placeholder: "Ej. 2020" },
        { id: "anio_finalizacion", prompt: "Ano de finalizacion", type: "text", required: true, placeholder: "Ej. 2024" },
        {
          id: "realizo_estudios_posgrado",
          prompt: "Realizo estudios de posgrado?",
          type: "single",
          required: true,
          options: [
            { label: "Si", value: "si" },
            { label: "No", value: "no" },
          ],
        },
        {
          id: "detalle_posgrado",
          prompt: "En caso afirmativo, especifique el posgrado realizado",
          type: "textarea",
          required: false,
          placeholder: "Indique el programa, institucion o escriba si no aplica.",
        },
      ],
    },
    {
      id: "situacion-laboral-egresado",
      title: "Seccion 3. Situacion laboral actual",
      subtitle:
        "Este modulo releva la condicion laboral vigente del egresado y ubica su insercion actual dentro del mercado de trabajo.",
      questions: [
        {
          id: "trabaja_actualmente",
          prompt: "Se encuentra actualmente trabajando?",
          type: "single",
          required: true,
          options: [
            { label: "Si", value: "si" },
            { label: "No", value: "no" },
          ],
        },
        {
          id: "tipo_empleo",
          prompt: "Tipo de empleo",
          type: "single",
          required: false,
          options: [
            { label: "Publico", value: "publico" },
            { label: "Privado", value: "privado" },
            { label: "ONG", value: "ong" },
            { label: "Independiente", value: "independiente" },
            { label: "Otro", value: "otro" },
          ],
        },
        {
          id: "tipo_empleo_otro",
          prompt: "Si corresponde, especifique otro tipo de empleo",
          type: "text",
          required: false,
          placeholder: "Escriba el tipo de empleo o deje en blanco si no aplica.",
        },
        { id: "cargo_desempena", prompt: "Cargo que desempena", type: "text", required: false, placeholder: "Ej. Analista, tecnico, consultor" },
        { id: "institucion_empresa", prompt: "Institucion o empresa", type: "text", required: false, placeholder: "Nombre de la institucion o empresa" },
        { id: "antiguedad_cargo", prompt: "Antiguedad en el cargo", type: "text", required: false, placeholder: "Ej. 2 anos" },
      ],
    },
    {
      id: "relacion-formacion-empleo-egresado",
      title: "Seccion 4. Relacion formacion - empleo",
      subtitle:
        "Seccion destinada a medir la correspondencia entre la formacion recibida y las exigencias del trabajo actual del egresado.",
      questions: [
        {
          id: "trabajo_relacion_carrera",
          prompt: "Su trabajo esta relacionado con la carrera?",
          type: "single",
          required: true,
          options: [
            { label: "Totalmente", value: "totalmente" },
            { label: "Parcialmente", value: "parcialmente" },
            { label: "No", value: "no" },
          ],
        },
        {
          id: "pertinencia_formacion_recibida",
          prompt: "Nivel de pertinencia de la formacion recibida",
          type: "single",
          required: true,
          options: [
            { label: "Alto", value: "alto" },
            { label: "Medio", value: "medio" },
            { label: "Bajo", value: "bajo" },
          ],
        },
        {
          id: "competencias_utilizadas_trabajo",
          prompt: "Competencias mas utilizadas en su trabajo",
          helpText: "Seleccione todas las que correspondan.",
          type: "multiple",
          required: true,
          options: [
            { label: "Analisis politico", value: "analisis_politico" },
            { label: "Investigacion", value: "investigacion" },
            { label: "Gestion publica", value: "gestion_publica" },
            { label: "Comunicacion politica", value: "comunicacion_politica" },
            { label: "Formulacion de politicas publicas", value: "formulacion_politicas_publicas" },
            { label: "Otras", value: "otras" },
          ],
        },
        {
          id: "competencias_otras_detalle",
          prompt: "Si marco Otras, detalle cuales competencias utiliza",
          type: "textarea",
          required: false,
          placeholder: "Describa las otras competencias utilizadas o deje en blanco si no aplica.",
        },
      ],
    },
    {
      id: "evaluacion-formacion-egresado",
      title: "Seccion 5. Evaluacion de la formacion recibida",
      subtitle:
        "Bloque de valoracion estructurada sobre calidad academica, contenidos, practica, infraestructura y vinculacion profesional.",
      questions: [
        { id: "calidad_academica_docentes", prompt: "Calidad academica de los docentes", type: "scale", required: true, scaleLabels: scaleGraduateEvaluation },
        { id: "contenidos_curriculares", prompt: "Contenidos curriculares", type: "scale", required: true, scaleLabels: scaleGraduateEvaluation },
        { id: "formacion_practica", prompt: "Formacion practica", type: "scale", required: true, scaleLabels: scaleGraduateEvaluation },
        { id: "infraestructura_recursos", prompt: "Infraestructura y recursos", type: "scale", required: true, scaleLabels: scaleGraduateEvaluation },
        { id: "vinculacion_entorno_profesional", prompt: "Vinculacion con el entorno profesional", type: "scale", required: true, scaleLabels: scaleGraduateEvaluation },
      ],
    },
    {
      id: "insercion-laboral-egresado",
      title: "Seccion 6. Insercion laboral",
      subtitle:
        "Este modulo releva la velocidad de insercion y las principales barreras encontradas en la transicion al empleo.",
      questions: [
        {
          id: "tiempo_primer_empleo",
          prompt: "Tiempo que tardo en conseguir su primer empleo",
          type: "single",
          required: true,
          options: [
            { label: "Trabajaba en tiempos de cursar la carrera", value: "trabajaba_durante_carrera" },
            { label: "Menos de 6 meses", value: "menos_6_meses" },
            { label: "6 a 12 meses", value: "6_12_meses" },
            { label: "Mas de 1 ano", value: "mas_1_ano" },
          ],
        },
        {
          id: "dificultades_insercion_laboral",
          prompt: "Principales dificultades para insertarse laboralmente",
          type: "textarea",
          required: true,
          placeholder: "Describa las principales dificultades observadas.",
        },
      ],
    },
    {
      id: "formacion-continua-egresado",
      title: "Seccion 7. Formacion continua y desarrollo",
      subtitle:
        "Bloque orientado a conocer capacitaciones posteriores y necesidades de fortalecimiento detectadas por el egresado.",
      questions: [
        {
          id: "realizo_capacitaciones_adicionales",
          prompt: "Ha realizado capacitaciones adicionales?",
          type: "single",
          required: true,
          options: [
            { label: "Si", value: "si" },
            { label: "No", value: "no" },
          ],
        },
        {
          id: "capacitaciones_adicionales_detalle",
          prompt: "Especifique las capacitaciones adicionales realizadas",
          type: "textarea",
          required: false,
          placeholder: "Detalle cursos, talleres, diplomados o escriba si no aplica.",
        },
        {
          id: "areas_fortalecer_formacion",
          prompt: "Areas en las que considera necesario fortalecer la formacion",
          type: "textarea",
          required: true,
          placeholder: "Describa las areas que requieren fortalecimiento.",
        },
      ],
    },
    {
      id: "retroalimentacion-mejora-egresado",
      title: "Seccion 8. Retroalimentacion para mejora (ANEAES)",
      subtitle:
        "Seccion de mejora institucional orientada a identificar cambios curriculares, nuevos contenidos y recomendacion general de la carrera.",
      questions: [
        {
          id: "aspectos_mejorar_carrera",
          prompt: "Que aspectos de la carrera deberian mejorarse?",
          type: "textarea",
          required: true,
          placeholder: "Describa los aspectos que necesitan mejora.",
        },
        {
          id: "nuevas_asignaturas_contenidos",
          prompt: "Que nuevas asignaturas o contenidos propondria?",
          type: "textarea",
          required: true,
          placeholder: "Proponga nuevas asignaturas o contenidos.",
        },
        {
          id: "recomendaria_carrera",
          prompt: "Recomendaria la carrera?",
          type: "single",
          required: true,
          options: [
            { label: "Si", value: "si" },
            { label: "No", value: "no" },
          ],
        },
        {
          id: "recomendaria_carrera_porque",
          prompt: "Por que recomendaria o no recomendaria la carrera?",
          type: "textarea",
          required: true,
          placeholder: "Explique brevemente su respuesta.",
        },
      ],
    },
    {
      id: "vinculacion-institucional-egresado",
      title: "Seccion 9. Vinculacion institucional",
      subtitle:
        "Modulo para medir el interes del egresado en participar nuevamente en actividades de la Facultad y el tipo de aporte que considera viable.",
      questions: [
        {
          id: "interes_participar_facultad",
          prompt: "Le interesaria participar en actividades de la Facultad?",
          type: "single",
          required: true,
          options: [
            { label: "Si", value: "si" },
            { label: "No", value: "no" },
          ],
        },
        {
          id: "tipo_participacion_facultad",
          prompt: "Tipo de participacion que le interesaria realizar",
          helpText: "Seleccione una o varias opciones si corresponde.",
          type: "multiple",
          required: false,
          options: [
            { label: "Charlas", value: "charlas" },
            { label: "Tutorias", value: "tutorias" },
            { label: "Investigacion", value: "investigacion" },
            { label: "Redes de egresados", value: "redes_egresados" },
          ],
        },
      ],
    },
    {
      id: "observaciones-generales-egresado",
      title: "Seccion 10. Observaciones generales",
      subtitle:
        "Espacio final para registrar observaciones integrales, recomendaciones libres y aportes adicionales del egresado.",
      questions: [
        {
          id: "observaciones_generales",
          prompt: "Observaciones generales",
          type: "textarea",
          required: true,
          placeholder: "Escriba aqui sus observaciones finales.",
        },
      ],
    },
  ],
};
