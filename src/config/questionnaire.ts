import { QuestionnaireConfig } from "@/lib/types";

const scaleQuality: [string, string, string, string, string] = [
  "Muy deficiente",
  "Deficiente",
  "Aceptable",
  "Buena",
  "Excelente",
];

const scaleAgreement: [string, string, string, string, string] = [
  "Totalmente en desacuerdo",
  "En desacuerdo",
  "Neutral",
  "De acuerdo",
  "Totalmente de acuerdo",
];

const scaleSufficiency: [string, string, string, string, string] = [
  "Totalmente insuficiente",
  "Insuficiente",
  "Moderadamente suficiente",
  "Suficiente",
  "Altamente suficiente",
];

export const questionnaireConfig: QuestionnaireConfig = {
  projectTitle:
    "Sistema de Diagnóstico Institucional y Caracterización de la Comunidad Académica",
  projectSubtitle:
    "Escuela de Ciencias Políticas · Facultad de Derecho y Ciencias Sociales · U.N.A.",
  publicDescription:
    "Instrumento técnico orientado a relevar condiciones académicas, administrativas, infraestructurales y de gestión, así como prioridades, necesidades y oportunidades de mejora continua en la Escuela de Ciencias Políticas.",
  characterizationModule: {
    id: "caracterizacion-general",
    title: "Módulo de Caracterización General",
    subtitle:
      "Esta sección reúne datos generales de caracterización sociodemográfica e institucional con la finalidad de segmentar adecuadamente los resultados, identificar patrones relevantes y fortalecer el análisis estadístico para la toma de decisiones académicas y administrativas.",
    questions: [
      {
        id: "nombre_completo",
        prompt: "Nombre completo",
        type: "text",
        required: true,
        placeholder: "Escriba su nombre y apellido",
      },
      {
        id: "edad",
        prompt: "Edad",
        type: "number",
        required: true,
        placeholder: "Ej. 23",
      },
      {
        id: "ciudad_residencia",
        prompt: "Ciudad de residencia",
        type: "text",
        required: true,
        placeholder: "Ej. Asunción",
      },
      {
        id: "barrio_residencia",
        prompt: "Barrio / zona de residencia",
        type: "text",
        required: true,
        placeholder: "Ej. Sajonia",
      },
      {
        id: "telefono",
        prompt: "Número de teléfono celular",
        type: "text",
        required: true,
        placeholder: "Ej. +595...",
      },
      {
        id: "correo",
        prompt: "Correo electrónico",
        type: "email",
        required: true,
        placeholder: "Ej. nombre@correo.com",
      },
      {
        id: "sexo_genero",
        prompt: "Sexo / género",
        type: "single",
        required: true,
        options: [
          { label: "Masculino", value: "masculino" },
          { label: "Femenino", value: "femenino" },
          { label: "Otro", value: "otro" },
          { label: "Prefiero no responder", value: "prefiero_no_responder" },
        ],
      },
      {
        id: "participacion_institucional",
        prompt:
          "¿Tiene actualmente algún tipo de participación adicional en la vida institucional de la Escuela?",
        type: "multiple",
        required: true,
        options: [
          { label: "Ninguna", value: "ninguna" },
          { label: "Representación estudiantil", value: "representacion_estudiantil" },
          { label: "Apoyo administrativo", value: "apoyo_administrativo" },
          { label: "Investigación", value: "investigacion" },
          { label: "Extensión universitaria", value: "extension_universitaria" },
          { label: "Actividades académicas", value: "actividades_academicas" },
          { label: "Organización de eventos", value: "organizacion_eventos" },
          { label: "Otra", value: "otra" },
        ],
      },
      {
        id: "canales_informacion",
        prompt:
          "¿Cómo se informa habitualmente sobre novedades institucionales vinculadas a la Escuela?",
        type: "multiple",
        required: true,
        options: [
          { label: "WhatsApp", value: "whatsapp" },
          { label: "Instagram", value: "instagram" },
          { label: "Facebook", value: "facebook" },
          { label: "Comunicados oficiales", value: "comunicados_oficiales" },
          { label: "Docentes", value: "docentes" },
          { label: "Compañeros/as", value: "companeros" },
          { label: "Funcionarios/as", value: "funcionarios" },
          { label: "No me informo regularmente", value: "no_me_informo_regularmente" },
          { label: "Otro", value: "otro" },
        ],
      },
      {
        id: "frecuencia_participacion",
        prompt:
          "¿Con qué frecuencia participa o se involucra en actividades, espacios o dinámicas vinculadas a la Escuela más allá de la asistencia ordinaria?",
        type: "single",
        required: true,
        options: [
          { label: "Muy frecuentemente", value: "muy_frecuentemente" },
          { label: "Frecuentemente", value: "frecuentemente" },
          { label: "Ocasionalmente", value: "ocasionalmente" },
          { label: "Rara vez", value: "rara_vez" },
          { label: "Nunca", value: "nunca" },
        ],
      },
    ],
  },
  relations: {
    estudiante: {
      label: "Estudiante",
      intro:
        "Formulario orientado a medir trayectoria académica, condiciones de permanencia, experiencia formativa, gestión administrativa, infraestructura, transparencia y prioridades institucionales desde la perspectiva estudiantil.",
      modules: [
        {
          id: "caracterizacion-academica",
          title: "Módulo 1. Caracterización Académica del Estudiante",
          subtitle:
            "Este bloque permite contextualizar la experiencia formativa del estudiante según su trayectoria académica actual, nivel de avance en la carrera y condiciones de permanencia.",
          questions: [
            {
              id: "semestre_actual",
              prompt: "¿En qué semestre se encuentra actualmente?",
              type: "single",
              required: true,
              options: [
                { label: "1.º semestre", value: "1" },
                { label: "3.º semestre", value: "3" },
                { label: "5.º semestre", value: "5" },
                { label: "7.º semestre", value: "7" },
              ],
            },
            {
              id: "factor_desempeno_continuidad",
              prompt:
                "¿Cuál es el principal factor que actualmente incide en su desempeño o continuidad académica?",
              type: "single",
              required: true,
              options: [
                { label: "Carga laboral", value: "carga_laboral" },
                { label: "Dificultades económicas", value: "dificultades_economicas" },
                { label: "Tiempo de traslado", value: "tiempo_traslado" },
                { label: "Responsabilidades familiares", value: "responsabilidades_familiares" },
                { label: "Acceso a recursos académicos o tecnológicos", value: "acceso_recursos" },
                { label: "Ninguno de los anteriores", value: "ninguno" },
                { label: "Otro", value: "otro" },
              ],
            },
            {
              id: "situacion_academica",
              prompt: "Situación académica actual",
              type: "single",
              required: true,
              options: [
                { label: "Regular", value: "regular" },
                { label: "Irregular", value: "irregular" },
                { label: "Recursante", value: "recursante" },
                { label: "Reincorporado/a", value: "reincorporado" },
              ],
            },
            {
              id: "actividad_laboral",
              prompt: "¿Desarrolla actividad laboral paralela a sus estudios?",
              type: "single",
              required: true,
              options: [
                { label: "Sí, jornada completa", value: "si_completa" },
                { label: "Sí, jornada parcial", value: "si_parcial" },
                { label: "Sí, de manera ocasional", value: "si_ocasional" },
                { label: "No", value: "no" },
              ],
            },
            {
              id: "tiempo_traslado",
              prompt: "Tiempo promedio de traslado hasta la sede de clases",
              type: "single",
              required: true,
              options: [
                { label: "Menos de 30 minutos", value: "menos_30" },
                { label: "Entre 30 y 60 minutos", value: "30_60" },
                { label: "Entre 1 y 2 horas", value: "1_2h" },
                { label: "Más de 2 horas", value: "mas_2h" },
              ],
            },
            {
              id: "primera_generacion_universitaria",
              prompt:
                "¿Es la primera persona de su núcleo familiar directo en cursar estudios universitarios?",
              type: "single",
              required: true,
              options: [
                { label: "Sí", value: "si" },
                { label: "No", value: "no" },
                { label: "No sabe / no responde", value: "nsnr" },
              ],
            },
          ],
        },
        {
          id: "experiencia-academica",
          title: "Módulo 2. Experiencia Académica y Calidad Formativa",
          subtitle:
            "Esta sección releva la percepción estudiantil sobre pertinencia curricular, coherencia del proceso de enseñanza, exigencia académica y adecuación de la formación a los desafíos profesionales de la disciplina.",
          questions: [
            {
              id: "pertinencia_contenidos",
              prompt:
                "Evalúe la pertinencia de los contenidos desarrollados en relación con la formación en ciencias políticas.",
              type: "scale",
              required: true,
              scaleLabels: scaleQuality,
            },
            {
              id: "coherencia_contenidos_competencias",
              prompt:
                "Evalúe la coherencia entre los contenidos impartidos y las competencias profesionales que demanda actualmente la disciplina.",
              type: "scale",
              required: true,
              scaleLabels: scaleQuality,
            },
            {
              id: "claridad_criterios_evaluacion",
              prompt:
                "Evalúe la claridad con que se comunican criterios de evaluación, exigencias y objetivos de aprendizaje.",
              type: "scale",
              required: true,
              scaleLabels: scaleQuality,
            },
            {
              id: "analisis_politico_gestion_publica",
              prompt:
                "La formación recibida contribuye al desarrollo de capacidades de análisis político, institucional y de gestión pública.",
              type: "scale",
              required: true,
              scaleLabels: scaleAgreement,
            },
            {
              id: "reflexion_critica_argumentacion",
              prompt:
                "Las clases promueven reflexión crítica, argumentación y participación.",
              type: "scale",
              required: true,
              scaleLabels: scaleAgreement,
            },
            {
              id: "vinculo_paraguay_region",
              prompt:
                "Los contenidos impartidos guardan relación con problemáticas contemporáneas del Paraguay y del entorno regional.",
              type: "scale",
              required: true,
              scaleLabels: scaleAgreement,
            },
            {
              id: "materiales_apoyo_bibliografia",
              prompt:
                "Evalúe la disponibilidad efectiva de materiales de apoyo, bibliografía y orientaciones académicas.",
              type: "scale",
              required: true,
              scaleLabels: scaleSufficiency,
            },
            {
              id: "componentes_requieren_fortalecimiento",
              prompt:
                "¿Qué componentes formativos considera que requieren mayor fortalecimiento dentro de la carrera?",
              helpText: "Seleccione hasta 3 opciones.",
              type: "multiple",
              required: true,
              maxSelections: 3,
              options: [
                { label: "Teoría académica", value: "teoria_academica" },
                { label: "Metodología de la investigación", value: "metodologia_investigacion" },
                { label: "Lectura y redacción académica", value: "lectura_redaccion" },
                { label: "Oratoria y argumentación", value: "oratoria_argumentacion" },
                { label: "Herramientas Digitales", value: "herramientas_digitales" },
                { label: "Relaciones Institucionales", value: "relaciones_institucionales" },
                { label: "Extensión Universitaria", value: "extension_universitaria" },
                { label: "Otro", value: "otro" },
              ],
            },
          ],
        },
        {
          id: "gestion-administrativa",
          title: "Módulo 3. Gestión Administrativa y Atención al Estudiante",
          subtitle:
            "Este bloque busca medir la eficiencia operativa, la claridad de la información, la calidad del servicio y la capacidad de respuesta de la administración frente a necesidades estudiantiles.",
          questions: [
            {
              id: "claridad_info_administrativa",
              prompt:
                "Evalúe la claridad de la información administrativa difundida por la Escuela.",
              type: "scale",
              required: true,
              scaleLabels: scaleQuality,
            },
            {
              id: "oportunidad_comunicaciones",
              prompt:
                "Evalúe la oportunidad temporal con que se comunican horarios, disposiciones, cambios y avisos institucionales.",
              type: "scale",
              required: true,
              scaleLabels: scaleQuality,
            },
            {
              id: "calidad_atencion_consultas",
              prompt:
                "Evalúe la calidad de la atención recibida en consultas, trámites y gestiones.",
              type: "scale",
              required: true,
              scaleLabels: scaleQuality,
            },
            {
              id: "tramites_reglas_claras",
              prompt:
                "Los trámites administrativos pueden realizarse con reglas claras y previsibles.",
              type: "scale",
              required: true,
              scaleLabels: scaleAgreement,
            },
            {
              id: "consistencia_info_actores",
              prompt:
                "Existe consistencia entre la información brindada por distintos actores administrativos.",
              type: "scale",
              required: true,
              scaleLabels: scaleAgreement,
            },
            {
              id: "dificultades_administrativas",
              prompt: "¿En qué áreas observa mayores dificultades administrativas?",
              helpText: "Seleccione hasta 4 opciones.",
              type: "multiple",
              required: true,
              maxSelections: 4,
              options: [
                { label: "Inscripción o reinscripción", value: "inscripcion" },
                { label: "Constancias / certificados", value: "constancias" },
                { label: "Información académica", value: "informacion_academica" },
                { label: "Registro de notas", value: "registro_notas" },
                { label: "Atención presencial", value: "atencion_presencial" },
                { label: "Atención por mensajería o medios digitales", value: "atencion_digital" },
                { label: "Canalización de reclamos", value: "canalizacion_reclamos" },
                { label: "Seguimiento de solicitudes", value: "seguimiento_solicitudes" },
                { label: "Otro", value: "otro" },
              ],
            },
            {
              id: "principal_problema_dificultad_admin",
              prompt:
                "¿Cuál suele ser el principal problema cuando se presenta una dificultad administrativa?",
              type: "single",
              required: true,
              options: [
                { label: "Falta de respuesta", value: "falta_respuesta" },
                { label: "Demora excesiva", value: "demora_excesiva" },
                { label: "Información contradictoria", value: "informacion_contradictoria" },
                { label: "Falta de seguimiento", value: "falta_seguimiento" },
                { label: "Trato inadecuado", value: "trato_inadecuado" },
                { label: "No he tenido dificultades", value: "sin_dificultades" },
              ],
            },
          ],
        },
        {
          id: "infraestructura-entorno",
          title: "Módulo 4. Infraestructura, Entorno y Condiciones de Permanencia",
          subtitle:
            "Esta sección releva la percepción sobre capacidad instalada, entorno físico, soporte material y condiciones mínimas para el desarrollo adecuado de las actividades académicas.",
          questions: [
            {
              id: "condiciones_aulas",
              prompt: "Evalúe las condiciones generales de las aulas.",
              type: "scale",
              required: true,
              scaleLabels: scaleQuality,
            },
            {
              id: "estado_mobiliario",
              prompt: "Evalúe el estado del mobiliario utilizado durante las clases.",
              type: "scale",
              required: true,
              scaleLabels: scaleQuality,
            },
            {
              id: "climatizacion_iluminacion",
              prompt:
                "Evalúe las condiciones de climatización, ventilación e iluminación.",
              type: "scale",
              required: true,
              scaleLabels: scaleQuality,
            },
            {
              id: "conectividad_soporte_tecnologico",
              prompt:
                "Evalúe el acceso a conectividad y soporte tecnológico para actividades académicas.",
              type: "scale",
              required: true,
              scaleLabels: scaleSufficiency,
            },
            {
              id: "limpieza_higiene",
              prompt:
                "Evalúe las condiciones de limpieza e higiene de los espacios de uso común.",
              type: "scale",
              required: true,
              scaleLabels: scaleQuality,
            },
            {
              id: "condiciones_materiales_rendimiento",
              prompt:
                "Las condiciones materiales de la Escuela favorecen la permanencia y el rendimiento académico.",
              type: "scale",
              required: true,
              scaleLabels: scaleAgreement,
            },
            {
              id: "deficits_infraestructurales",
              prompt: "¿Cuáles son hoy los déficits infraestructurales más notorios?",
              helpText: "Seleccione hasta 5 opciones.",
              type: "multiple",
              required: true,
              maxSelections: 5,
              options: [
                { label: "Aulas insuficientes", value: "aulas_insuficientes" },
                { label: "Sillas / pupitres en mal estado", value: "pupitres_mal_estado" },
                { label: "Deficiencia de climatización", value: "climatizacion" },
                { label: "Iluminación deficiente", value: "iluminacion" },
                { label: "Sanitarios", value: "sanitarios" },
                { label: "Limpieza", value: "limpieza" },
                { label: "Conectividad", value: "conectividad" },
                { label: "Seguridad", value: "seguridad" },
                { label: "Espacios comunes reducidos", value: "espacios_comunes" },
                { label: "Accesibilidad", value: "accesibilidad" },
                { label: "Equipamiento audiovisual", value: "equipamiento_audiovisual" },
                { label: "Otro", value: "otro" },
              ],
            },
          ],
        },
        {
          id: "gestion-transparencia-participacion",
          title: "Módulo 5. Gestión Institucional, Transparencia y Participación",
          subtitle:
            "Este bloque mide percepción sobre gobernanza interna, circulación de información, legitimidad de decisiones y apertura institucional a la participación.",
          questions: [
            {
              id: "claridad_decisiones_impacto_academico",
              prompt:
                "Las decisiones que impactan en la vida académica son comunicadas con suficiente claridad.",
              type: "scale",
              required: true,
              scaleLabels: scaleAgreement,
            },
            {
              id: "canales_reclamos_propuestas",
              prompt:
                "Existen canales reconocibles para presentar reclamos, propuestas o sugerencias.",
              type: "scale",
              required: true,
              scaleLabels: scaleAgreement,
            },
            {
              id: "apertura_escucha_estudiantado",
              prompt:
                "La Escuela demuestra apertura para escuchar necesidades del estudiantado.",
              type: "scale",
              required: true,
              scaleLabels: scaleAgreement,
            },
            {
              id: "transparencia_gestion",
              prompt: "Evalúe el nivel de transparencia percibido en la gestión institucional.",
              type: "scale",
              required: true,
              scaleLabels: scaleQuality,
            },
            {
              id: "modalidad_participacion_util",
              prompt:
                "¿Qué modalidad de participación considera más útil para canalizar demandas y propuestas?",
              helpText: "Seleccione hasta 3 opciones.",
              type: "multiple",
              required: true,
              maxSelections: 3,
              options: [
                { label: "Asambleas generales", value: "asambleas_generales" },
                { label: "Mesas de diálogo", value: "mesas_dialogo" },
                { label: "Formularios permanentes", value: "formularios_permanentes" },
                { label: "Reuniones por semestre", value: "reuniones_semestre" },
                { label: "Canal digital de reclamos", value: "canal_reclamos" },
                { label: "Representación estudiantil formal", value: "representacion_formal" },
                { label: "Otro", value: "otro" },
              ],
            },
          ],
        },
        {
          id: "prioridades-observacion",
          title: "Módulo 6. Prioridades Institucionales y Observación Final",
          subtitle:
            "Las respuestas de este bloque permiten establecer jerarquías de intervención y orientar decisiones de gestión, inversión, acompañamiento y extensión.",
          questions: [
            {
              id: "prioridades_institucionales",
              prompt:
                "Seleccione las tres prioridades institucionales que deberían atenderse de manera más urgente.",
              helpText: "Seleccione hasta 3 opciones.",
              type: "multiple",
              required: true,
              maxSelections: 3,
              options: [
                { label: "Fortalecimiento académico", value: "fortalecimiento_academico" },
                { label: "Modernización administrativa", value: "modernizacion_administrativa" },
                { label: "Infraestructura", value: "infraestructura" },
                { label: "Comunicación institucional", value: "comunicacion_institucional" },
                { label: "Transparencia", value: "transparencia" },
                { label: "Investigación", value: "investigacion" },
                { label: "Extensión universitaria", value: "extension_universitaria" },
                { label: "Vinculación profesional", value: "vinculacion_profesional" },
                { label: "Bienestar estudiantil", value: "bienestar_estudiantil" },
                { label: "Tecnología", value: "tecnologia" },
              ],
            },
            {
              id: "acciones_complementarias_necesarias",
              prompt:
                "¿Qué tipo de acciones complementarias considera más necesarias para el estudiantado?",
              helpText: "Seleccione hasta 4 opciones.",
              type: "multiple",
              required: true,
              maxSelections: 4,
              options: [
                { label: "Debates y foros", value: "debates_foros" },
                { label: "Capacitaciones técnicas", value: "capacitaciones_tecnicas" },
                { label: "Talleres de investigación", value: "talleres_investigacion" },
                { label: "Orientación laboral", value: "orientacion_laboral" },
                { label: "Pasantías", value: "pasantias" },
                { label: "Extensión comunitaria", value: "extension_comunitaria" },
                { label: "Seminarios especializados", value: "seminarios_especializados" },
                { label: "Apoyo en redacción académica", value: "apoyo_redaccion" },
                { label: "Herramientas digitales", value: "herramientas_digitales" },
                { label: "Otro", value: "otro" },
              ],
            },
            {
              id: "destino_recursos_adicionales",
              prompt:
                "Si la Escuela dispusiera de recursos adicionales en el corto plazo, ¿dónde deberían invertirse prioritariamente?",
              type: "single",
              required: true,
              options: [
                { label: "Infraestructura", value: "infraestructura" },
                { label: "Recursos académicos", value: "recursos_academicos" },
                { label: "Tecnología", value: "tecnologia" },
                { label: "Procesos administrativos", value: "procesos_administrativos" },
                { label: "Actividades de extensión", value: "actividades_extension" },
                { label: "Capacitación", value: "capacitacion" },
                { label: "Otro", value: "otro" },
              ],
            },
            {
              id: "observacion_final",
              prompt: "Observación o comentario final",
              type: "textarea",
              required: true,
              placeholder: "Escriba aquí su observación final.",
            },
          ],
        },
      ],
    },
    docente: {
      label: "Docente",
      intro:
        "Formulario técnico para relevar planificación, articulación curricular, condiciones de docencia, gobernanza académica y prioridades de fortalecimiento institucional.",
      modules: [
        {
          id: "perfil-docente",
          title: "Módulo 1. Caracterización Docente",
          subtitle:
            "Esta sección releva información básica sobre trayectoria docente y ubicación funcional para interpretar la evaluación desde la experiencia académica concreta.",
          questions: [
            { id: "area_docencia", prompt: "Área principal o cátedra de desempeño", type: "text", required: true },
            {
              id: "antiguedad_docente",
              prompt: "Antigüedad docente en la Escuela",
              type: "single",
              required: true,
              options: [
                { label: "Menos de 1 año", value: "menos_1" },
                { label: "1 a 3 años", value: "1_3" },
                { label: "4 a 6 años", value: "4_6" },
                { label: "7 a 10 años", value: "7_10" },
                { label: "Más de 10 años", value: "mas_10" },
              ],
            },
            {
              id: "modalidad_vinculacion_docente",
              prompt: "Modalidad principal de vinculación docente",
              type: "single",
              required: true,
              options: [
                { label: "Horas cátedra", value: "horas_catedra" },
                { label: "Dedicación parcial", value: "dedicacion_parcial" },
                { label: "Dedicación media", value: "dedicacion_media" },
                { label: "Dedicación completa", value: "dedicacion_completa" },
                { label: "Otra", value: "otra" },
              ],
            },
            {
              id: "funciones_adicionales",
              prompt: "¿Desarrolla además funciones de coordinación, investigación o extensión?",
              type: "multiple",
              required: true,
              options: [
                { label: "Coordinación académica", value: "coordinacion_academica" },
                { label: "Investigación", value: "investigacion" },
                { label: "Extensión", value: "extension" },
                { label: "Gestión", value: "gestion" },
                { label: "No", value: "no" },
              ],
            },
          ],
        },
        {
          id: "calidad-academica-docente",
          title: "Módulo 2. Planificación, Articulación Curricular y Calidad Académica",
          subtitle:
            "Este módulo releva percepciones sobre coherencia del plan de formación, articulación curricular y compromiso institucional con la mejora académica.",
          questions: [
            { id: "coherencia_plan_egreso", prompt: "Evalúe la coherencia del plan de formación con el perfil esperado del egresado de ciencias políticas.", type: "scale", required: true, scaleLabels: scaleQuality },
            { id: "articulacion_asignaturas_semestres", prompt: "Evalúe el grado de articulación horizontal y vertical entre asignaturas y semestres.", type: "scale", required: true, scaleLabels: scaleQuality },
            { id: "programacion_objetivos_ensenanza", prompt: "La programación académica permite desarrollar adecuadamente los objetivos de enseñanza.", type: "scale", required: true, scaleLabels: scaleAgreement },
            { id: "alineacion_contenidos_estrategias", prompt: "Existe suficiente alineación entre contenidos, estrategias didácticas y criterios de evaluación.", type: "scale", required: true, scaleLabels: scaleAgreement },
            { id: "compromiso_calidad_academica", prompt: "Evalúe el nivel de compromiso institucional con la mejora de la calidad académica.", type: "scale", required: true, scaleLabels: scaleQuality },
            { id: "areas_academicas_fortalecer", prompt: "¿Qué áreas académicas requieren mayor fortalecimiento?", type: "multiple", required: true, maxSelections: 4, options: [
              { label: "Actualización curricular", value: "actualizacion_curricular" },
              { label: "Investigación", value: "investigacion" },
              { label: "Metodología", value: "metodologia" },
              { label: "Tecnología educativa", value: "tecnologia_educativa" },
              { label: "Evaluación del aprendizaje", value: "evaluacion_aprendizaje" },
              { label: "Extensión", value: "extension" },
              { label: "Vinculación institucional", value: "vinculacion_institucional" },
              { label: "Producción académica", value: "produccion_academica" },
              { label: "Otro", value: "otro" },
            ] },
          ],
        },
        {
          id: "cierre-docente",
          title: "Módulo 3. Observación Final y Prioridades",
          subtitle:
            "Este bloque resume prioridades docentes y registra observaciones estratégicas para fortalecimiento institucional.",
          questions: [
            { id: "prioridades_docente", prompt: "Seleccione las tres prioridades institucionales más urgentes.", type: "multiple", required: true, maxSelections: 3, options: [
              { label: "Infraestructura", value: "infraestructura" },
              { label: "Tecnología educativa", value: "tecnologia_educativa" },
              { label: "Capacitación docente", value: "capacitacion_docente" },
              { label: "Investigación", value: "investigacion" },
              { label: "Apoyo administrativo", value: "apoyo_administrativo" },
              { label: "Actualización curricular", value: "actualizacion_curricular" },
            ] },
            { id: "propuesta_docente_final", prompt: "Observación o propuesta final", type: "textarea", required: true, placeholder: "Describa una propuesta concreta." },
          ],
        },
      ],
    },
    funcionario: {
      label: "Funcionario",
      intro:
        "Formulario técnico orientado a organización administrativa, capacidad operativa, atención al usuario, coordinación interna y prioridades de modernización.",
      modules: [
        {
          id: "perfil-funcionario",
          title: "Módulo 1. Caracterización Funcional",
          subtitle:
            "Esta sección ubica la respuesta dentro de la estructura operativa de la Escuela y permite asociar la percepción del encuestado con áreas de servicio y responsabilidad funcional.",
          questions: [
            { id: "dependencia_funcionario", prompt: "Área o dependencia de desempeño", type: "text", required: true },
            { id: "antiguedad_funcionario", prompt: "Antigüedad en la Escuela", type: "single", required: true, options: [
              { label: "Menos de 1 año", value: "menos_1" },
              { label: "1 a 3 años", value: "1_3" },
              { label: "4 a 6 años", value: "4_6" },
              { label: "7 a 10 años", value: "7_10" },
              { label: "Más de 10 años", value: "mas_10" },
            ] },
            { id: "naturaleza_funciones", prompt: "Naturaleza principal de sus funciones", type: "multiple", required: true, options: [
              { label: "Atención al público", value: "atencion_publico" },
              { label: "Gestión documental", value: "gestion_documental" },
              { label: "Apoyo académico", value: "apoyo_academico" },
              { label: "Administración interna", value: "administracion_interna" },
              { label: "Coordinación", value: "coordinacion" },
              { label: "Servicios generales", value: "servicios_generales" },
              { label: "Otro", value: "otro" },
            ] },
            { id: "contacto_usuarios", prompt: "Nivel de contacto directo con usuarios", type: "single", required: true, options: [
              { label: "Permanente", value: "permanente" },
              { label: "Frecuente", value: "frecuente" },
              { label: "Ocasional", value: "ocasional" },
              { label: "Mínimo", value: "minimo" },
            ] },
          ],
        },
        {
          id: "cierre-funcionario",
          title: "Módulo 2. Cierre y Prioridades Administrativas",
          subtitle:
            "Este bloque registra cuellos de botella, prioridades y sugerencias para mejora de la administración.",
          questions: [
            { id: "organizacion_procesos", prompt: "Evalúe el grado de organización de los procesos administrativos actuales.", type: "scale", required: true, scaleLabels: scaleQuality },
            { id: "digitalizacion_procesos", prompt: "Evalúe el nivel actual de digitalización de los procesos administrativos.", type: "scale", required: true, scaleLabels: scaleQuality },
            { id: "cuellos_botella", prompt: "¿Cuáles son los principales cuellos de botella administrativos?", type: "multiple", required: true, maxSelections: 4, options: [
              { label: "Demora en trámites", value: "demora_tramites" },
              { label: "Falta de personal", value: "falta_personal" },
              { label: "Insuficiencia de equipos", value: "insuficiencia_equipos" },
              { label: "Falta de protocolos", value: "falta_protocolos" },
              { label: "Comunicación interna", value: "comunicacion_interna" },
              { label: "Exceso de tareas manuales", value: "tareas_manuales" },
              { label: "Seguimiento deficiente", value: "seguimiento_deficiente" },
              { label: "Archivo y documentación", value: "archivo_documentacion" },
              { label: "Otro", value: "otro" },
            ] },
            { id: "prioridades_funcionario", prompt: "Seleccione las tres prioridades administrativas más urgentes.", type: "multiple", required: true, maxSelections: 3, options: [
              { label: "Digitalización", value: "digitalizacion" },
              { label: "Capacitación del personal", value: "capacitacion_personal" },
              { label: "Infraestructura", value: "infraestructura" },
              { label: "Protocolos de atención", value: "protocolos_atencion" },
              { label: "Mejor coordinación", value: "mejor_coordinacion" },
              { label: "Mayor dotación de recursos", value: "mayor_dotacion" },
              { label: "Comunicación institucional", value: "comunicacion_institucional" },
              { label: "Seguimiento de trámites", value: "seguimiento_tramites" },
            ] },
            { id: "observacion_funcionario", prompt: "Observación o sugerencia final", type: "textarea", required: true, placeholder: "Escriba una sugerencia concreta." },
          ],
        },
      ],
    },
    egresado: {
      label: "Egresado",
      intro:
        "Formulario para vincular la formación recibida con inserción profesional, pertinencia del perfil de egreso y oportunidades de fortalecimiento institucional.",
      modules: [
        {
          id: "trayectoria-egresado",
          title: "Módulo 1. Caracterización de Trayectoria Posterior al Egreso",
          subtitle:
            "Este bloque busca vincular la formación recibida con la inserción profesional y con la trayectoria posterior del egresado.",
          questions: [
            { id: "anio_egreso", prompt: "Año de egreso", type: "text", required: true },
            { id: "situacion_ocupacional", prompt: "Situación ocupacional actual", type: "single", required: true, options: [
              { label: "Empleado/a", value: "empleado" },
              { label: "Independiente", value: "independiente" },
              { label: "En búsqueda laboral", value: "busqueda" },
              { label: "Estudios de posgrado", value: "posgrado" },
              { label: "Otra", value: "otra" },
            ] },
            { id: "sector_desempeno", prompt: "Sector principal de desempeño", type: "single", required: true, options: [
              { label: "Público", value: "publico" },
              { label: "Privado", value: "privado" },
              { label: "Académico", value: "academico" },
              { label: "Sociedad civil", value: "sociedad_civil" },
              { label: "Organismo internacional", value: "organismo_internacional" },
              { label: "Otro", value: "otro" },
            ] },
            { id: "relacion_actividad_carrera", prompt: "Grado de relación entre su actividad actual y la carrera cursada", type: "scale", required: true, scaleLabels: scaleQuality },
          ],
        },
        {
          id: "cierre-egresado",
          title: "Módulo 2. Pertinencia Formativa y Cierre",
          subtitle:
            "Este bloque registra valoración de la formación, necesidades de fortalecimiento y recomendaciones estratégicas.",
          questions: [
            { id: "solidez_formacion", prompt: "Evalúe la solidez general de la formación recibida.", type: "scale", required: true, scaleLabels: scaleQuality },
            { id: "herramientas_analiticas_utiles", prompt: "La carrera brindó herramientas analíticas útiles para comprender procesos políticos, institucionales y administrativos.", type: "scale", required: true, scaleLabels: scaleAgreement },
            { id: "suficiencia_exigencias_profesionales", prompt: "La formación recibida resultó suficiente para responder a exigencias profesionales concretas.", type: "scale", required: true, scaleLabels: scaleAgreement },
            { id: "componentes_debieron_fortalecerse", prompt: "¿Qué componentes debieron fortalecerse más?", type: "multiple", required: true, maxSelections: 4, options: [
              { label: "Gestión pública", value: "gestion_publica" },
              { label: "Investigación", value: "investigacion" },
              { label: "Metodología", value: "metodologia" },
              { label: "Herramientas digitales", value: "herramientas_digitales" },
              { label: "Redacción técnica", value: "redaccion_tecnica" },
              { label: "Vinculación profesional", value: "vinculacion_profesional" },
              { label: "Idiomas", value: "idiomas" },
              { label: "Práctica institucional", value: "practica_institucional" },
              { label: "Otro", value: "otro" },
            ] },
            { id: "observacion_egresado", prompt: "Observación o recomendación final", type: "textarea", required: true, placeholder: "Escriba su recomendación final." },
          ],
        },
      ],
    },
  },
};
