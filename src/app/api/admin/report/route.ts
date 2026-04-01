import path from "node:path";
import sharp from "sharp";
import { PDFDocument, StandardFonts, rgb, type PDFPage, type PDFFont } from "pdf-lib";
import { canAccessRelation, getAdminRoleLabel, getAdminSession } from "@/lib/admin-auth";
import { formatAsuncionDate } from "@/lib/date-format";
import { getRelationConfig } from "@/lib/questionnaire-helpers";
import { DashboardData, getDashboardData, QuestionSummary } from "@/lib/survey-db";
import { RelationKey } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ReportContext = {
  pdfDoc: PDFDocument;
  regularFont: PDFFont;
  boldFont: PDFFont;
  page: PDFPage;
  pageWidth: number;
  pageHeight: number;
  margin: number;
  y: number;
};

type OpenResponseGroup = {
  moduleTitle: string;
  questionPrompt: string;
  responses: string[];
};

const relationOrder: RelationKey[] = ["estudiante", "docente", "funcionario", "egresado"];

const stopWords = new Set([
  "para",
  "porque",
  "sobre",
  "entre",
  "desde",
  "hasta",
  "este",
  "esta",
  "estas",
  "estos",
  "como",
  "pero",
  "donde",
  "cuando",
  "deberia",
  "deberian",
  "tener",
  "hacia",
  "tambien",
  "mucho",
  "mucha",
  "muchas",
  "muchos",
  "poco",
  "poca",
  "pocas",
  "pocos",
  "seria",
  "serian",
  "escuela",
  "facultad",
  "carrera",
  "formacion",
  "egresado",
  "egresados",
  "docente",
  "docentes",
  "estudiante",
  "estudiantes",
  "funcionario",
  "funcionarios",
  "institucion",
  "institucional",
  "universidad",
  "general",
  "siempre",
  "nunca",
  "porque",
  "aunque",
  "ademas",
  "mismo",
  "misma",
  "mismos",
  "mismas",
  "tiene",
  "tienen",
  "hacer",
  "hacen",
  "sino",
  "solo",
  "cada",
  "todas",
  "todos",
  "toda",
  "todo",
  "ellos",
  "ellas",
  "nosotros",
  "ustedes",
  "usted",
  "ellos",
  "ellas",
]);

function isRelationKey(value: string | null): value is RelationKey {
  return value === "estudiante" || value === "docente" || value === "funcionario" || value === "egresado";
}

function getScopeTitle(relation: RelationKey | null) {
  return relation ? `Informe de ${getRelationConfig(relation).label}` : "Informe general consolidado";
}

function getScopeSubtitle(relation: RelationKey | null) {
  return relation
    ? `Analisis detallado y acumulado de la relacion ${getRelationConfig(relation).label.toLowerCase()} con la Escuela de Ciencias Politicas.`
    : "Analisis consolidado de estudiantes, docentes, funcionarios y egresados en un solo corte institucional.";
}

function getReportFilename(relation: RelationKey | null) {
  return relation
    ? `informe-${relation}-encuesta-ecp-una.pdf`
    : "informe-general-encuesta-ecp-una.pdf";
}

function describeScaleBand(averageScore: number) {
  if (averageScore >= 4.5) {
    return "muy favorable";
  }

  if (averageScore >= 3.5) {
    return "favorable";
  }

  if (averageScore >= 2.5) {
    return "intermedia";
  }

  if (averageScore >= 1.5) {
    return "debil";
  }

  return "muy debil";
}

function buildClosedQuestionInsight(summary: QuestionSummary) {
  const topOption = summary.options[0];
  const secondOption = summary.options[1];

  if (!topOption) {
    return "No se registran respuestas suficientes para construir una interpretacion de esta pregunta.";
  }

  if (summary.questionType === "scale" && summary.averageScore) {
    const trend = describeScaleBand(summary.averageScore);

    return `La valoracion promedio de esta pregunta es ${summary.averageScore}/5, lo que refleja una percepcion ${trend}. La categoria con mayor frecuencia fue "${topOption.label}" con ${topOption.total} respuestas (${topOption.percent}%).`;
  }

  if (!secondOption) {
    return `La totalidad de las respuestas validas se concentro en "${topOption.label}", con ${topOption.total} registros y una participacion del ${topOption.percent}%.`;
  }

  return `La opcion predominante fue "${topOption.label}" con ${topOption.total} respuestas (${topOption.percent}%). En segundo lugar aparece "${secondOption.label}" con ${secondOption.total} respuestas (${secondOption.percent}%), lo que permite identificar la tendencia principal y su contraste inmediato.`;
}

function collectOpenResponseGroups(data: DashboardData) {
  const groups = new Map<string, OpenResponseGroup>();

  data.submissions.forEach((submission) => {
    submission.modules.forEach((module) => {
      module.questions.forEach((question) => {
        if (question.questionType !== "textarea") {
          return;
        }

        const answer = question.answerDisplay.trim();

        if (!answer) {
          return;
        }

        const key = `${module.moduleTitle}::${question.questionPrompt}`;
        const current = groups.get(key) ?? {
          moduleTitle: module.moduleTitle,
          questionPrompt: question.questionPrompt,
          responses: [],
        };

        current.responses.push(answer);
        groups.set(key, current);
      });
    });
  });

  return [...groups.values()];
}

function extractTopKeywords(responses: string[], limit = 5) {
  const frequencies = new Map<string, number>();

  responses.forEach((response) => {
    const normalized = response
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, " ");

    normalized
      .split(/\s+/)
      .map((token) => token.trim())
      .filter((token) => token.length >= 4 && !stopWords.has(token))
      .forEach((token) => {
        frequencies.set(token, (frequencies.get(token) ?? 0) + 1);
      });
  });

  return [...frequencies.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([token]) => token);
}

function buildOpenResponseInsight(group: OpenResponseGroup) {
  const keywords = extractTopKeywords(group.responses, 4);
  const keywordPhrase = keywords.length ? ` Temas recurrentes detectados: ${keywords.join(", ")}.` : "";

  return `Se registraron ${group.responses.length} respuestas abiertas para esta pregunta.${keywordPhrase} Esta lectura automatizada resume los focos cualitativos mas repetidos sin reemplazar la revision textual completa del anexo.`;
}

function buildOverallConclusions(data: DashboardData, relation: RelationKey | null) {
  const scaleSummaries = data.questionSummaries
    .filter((summary) => summary.questionType === "scale" && typeof summary.averageScore === "number")
    .sort((left, right) => (right.averageScore ?? 0) - (left.averageScore ?? 0));

  const categoricalSummaries = data.questionSummaries.filter(
    (summary) => summary.questionType === "single" || summary.questionType === "multiple",
  );
  const openGroups = collectOpenResponseGroups(data);

  const conclusions: string[] = [];

  if (scaleSummaries.length) {
    const best = scaleSummaries[0];
    const weakest = scaleSummaries[scaleSummaries.length - 1];

    conclusions.push(
      `En la lectura cuantitativa, el mejor desempeno corresponde a "${best.questionPrompt}" con promedio ${best.averageScore}/5, mientras que la dimension mas fragil es "${weakest.questionPrompt}" con promedio ${weakest.averageScore}/5.`,
    );
  }

  const strongestCategorical = categoricalSummaries
    .map((summary) => ({
      summary,
      topOption: summary.options[0],
    }))
    .filter((item): item is { summary: QuestionSummary; topOption: QuestionSummary["options"][number] } => Boolean(item.topOption))
    .sort((left, right) => right.topOption.percent - left.topOption.percent)[0];

  if (strongestCategorical) {
    conclusions.push(
      `La tendencia cerrada con mayor concentracion se observa en "${strongestCategorical.summary.questionPrompt}", donde predomina "${strongestCategorical.topOption.label}" con ${strongestCategorical.topOption.percent}% del total considerado.`,
    );
  }

  if (openGroups.length) {
    const firstGroup = openGroups.sort((left, right) => right.responses.length - left.responses.length)[0];
    conclusions.push(
      `En las respuestas abiertas, la mayor densidad de observaciones aparece en "${firstGroup.questionPrompt}", lo que indica que ese punto concentra una parte importante de las recomendaciones y preocupaciones expresadas.`,
    );
  }

  if (!conclusions.length) {
    conclusions.push(
      relation
        ? `La relacion ${getRelationConfig(relation).label.toLowerCase()} cuenta con registros suficientes para seguimiento, pero aun no presenta una masa critica de indicadores para generar conclusiones mas robustas.`
        : "La base actual permite un monitoreo inicial, aunque sera conveniente ampliar la participacion para fortalecer la estabilidad del analisis institucional.",
    );
  }

  return conclusions;
}

export async function GET(request: Request) {
  const session = await getAdminSession();

  if (!session) {
    return new Response("No autorizado", { status: 401 });
  }

  const url = new URL(request.url);
  const requestedRelationParam = url.searchParams.get("relation");
  const requestedRelation: RelationKey | null = isRelationKey(requestedRelationParam) ? requestedRelationParam : null;
  const relationFilter: RelationKey | null = session.access === "all" ? requestedRelation : session.access;

  if (requestedRelation && !canAccessRelation(session, requestedRelation)) {
    return new Response("No autorizado para esta seccion.", { status: 403 });
  }

  const data = await getDashboardData(relationFilter ?? undefined);
  const pdfDoc = await PDFDocument.create();
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const ecpLogoBuffer = await sharp(path.join(process.cwd(), "public", "logo-ecp-una.jpeg")).png().toBuffer();
  const ecpLogo = await pdfDoc.embedPng(ecpLogoBuffer);
  const fdcsLogoBuffer = await sharp(path.join(process.cwd(), "public", "logo-fdcs-una.webp")).png().toBuffer();
  const fdcsLogo = await pdfDoc.embedPng(fdcsLogoBuffer);

  const firstPage = pdfDoc.addPage([595.28, 841.89]);
  const context: ReportContext = {
    pdfDoc,
    regularFont,
    boldFont,
    page: firstPage,
    pageWidth: firstPage.getWidth(),
    pageHeight: firstPage.getHeight(),
    margin: 42,
    y: firstPage.getHeight() - 42,
  };

  drawCover(context, {
    ecpLogo,
    fdcsLogo,
    totalSubmissions: data.totalSubmissions,
    totalDetailedAnswers: data.totalDetailedAnswers,
    latestSubmissionAt: data.latestSubmissionAt,
    scopeTitle: getScopeTitle(relationFilter),
    scopeSubtitle: getScopeSubtitle(relationFilter),
  });

  startNewPage(context, "Resumen ejecutivo");
  drawSectionTitle(context, "1. Resumen ejecutivo");
  drawParagraph(
    context,
    `Este documento presenta el corte acumulado de respuestas registrado hasta ${formatAsuncionDate(
      new Date().toISOString(),
    )}. El informe se genera en modo ${relationFilter ? getRelationConfig(relationFilter).label : "general"} y resume participacion, estadisticas, interpretacion automatizada y detalle individual de registros.`,
  );
  drawParagraph(
    context,
    `A la fecha del corte se registran ${data.totalSubmissions} formularios completos y ${data.totalDetailedAnswers} respuestas detalladas dentro del alcance autorizado. Documento emitido por ${session.username} con nivel ${getAdminRoleLabel(session.access)}.`,
  );

  if (!relationFilter) {
    drawSectionTitle(context, "2. Distribucion por tipo de encuestado");
    relationOrder.forEach((relation) => {
      const item = data.relationSummary.find((current) => current.relation === relation);

      if (!item) {
        return;
      }

      const percent = data.totalSubmissions ? Math.round((item.total / data.totalSubmissions) * 100) : 0;
      drawBullet(context, `${item.label}: ${item.total} formularios, equivalentes al ${percent}% del total acumulado.`);
    });
  } else {
    drawSectionTitle(context, "2. Corte especifico por relacion");
    drawParagraph(
      context,
      `Este informe se concentra unicamente en la relacion ${getRelationConfig(relationFilter).label.toLowerCase()}, por lo que todas las estadisticas, graficos y respuestas individuales corresponden exclusivamente a ese segmento.`,
    );
  }

  drawSectionTitle(context, relationFilter ? "3. Analisis automatizado" : "3. Analisis automatizado");
  buildOverallConclusions(data, relationFilter).forEach((conclusion, index) => {
    drawNumberedPoint(context, `Conclusion ${index + 1}`, conclusion);
  });

  startNewPage(context, "Resultados por pregunta");
  drawSectionTitle(context, relationFilter ? "4. Lectura punto por punto" : "4. Lectura punto por punto");
  drawParagraph(
    context,
    "Cada pregunta cerrada se interpreta con base en su distribucion de respuestas. En las escalas se agrega el promedio obtenido para facilitar una lectura evaluativa comparable.",
  );

  data.questionSummaries.forEach((summary) => {
    ensureSpace(context, 96);
    drawSubheading(context, summary.moduleTitle);
    drawParagraph(
      context,
      `${summary.questionPrompt} | Tipo: ${summary.questionType} | Respuestas consideradas: ${summary.totalResponses}.`,
      11,
    );
    summary.options.forEach((option) => {
      drawBullet(context, `${option.label}: ${option.total} respuestas (${option.percent}%).`, 10.5);
    });
    drawParagraph(context, buildClosedQuestionInsight(summary), 10.8);
  });

  const openResponseGroups = collectOpenResponseGroups(data);

  if (openResponseGroups.length) {
    startNewPage(context, "Lectura cualitativa");
    drawSectionTitle(context, "5. Lectura cualitativa de respuestas abiertas");
    drawParagraph(
      context,
      "Las preguntas abiertas se resumen mediante una lectura automatizada de recurrencias tematicas. Este apartado complementa los porcentajes y ayuda a detectar focos narrativos de mejora o valoracion.",
    );

    openResponseGroups.forEach((group) => {
      ensureSpace(context, 82);
      drawSubheading(context, `${group.moduleTitle} | ${group.questionPrompt}`);
      drawParagraph(context, buildOpenResponseInsight(group), 10.8);
    });
  }

  startNewPage(context, "Detalle por persona");
  drawSectionTitle(context, openResponseGroups.length ? "6. Anexo de respuestas individuales" : "5. Anexo de respuestas individuales");
  drawParagraph(
    context,
    "Este anexo organiza cada formulario por persona, relacion con la Escuela y modulos respondidos. Su objetivo es permitir trazabilidad y revision puntual de la informacion registrada en la base.",
  );

  data.submissions.forEach((submission) => {
    ensureSpace(context, 74);
    drawSubheading(
      context,
      `${submission.respondentName} | ${submission.relationLabel} | ${formatAsuncionDate(submission.createdAt)}`,
    );
    drawParagraph(
      context,
      `Correo: ${submission.respondentEmail} | Telefono: ${submission.respondentPhone} | Registro #${submission.id}`,
      10.5,
    );

    submission.modules.forEach((module) => {
      ensureSpace(context, 44);
      drawParagraph(context, module.moduleTitle, 11.2, true);
      module.questions.forEach((question) => {
        drawBullet(context, `${question.questionPrompt}: ${question.answerDisplay}`, 10.3);
      });
    });
  });

  const pdfBytes = await pdfDoc.save();

  return new Response(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${getReportFilename(relationFilter)}"`,
    },
  });
}

function drawCover(
  context: ReportContext,
  {
    ecpLogo,
    fdcsLogo,
    totalSubmissions,
    totalDetailedAnswers,
    latestSubmissionAt,
    scopeTitle,
    scopeSubtitle,
  }: {
    ecpLogo: Awaited<ReturnType<PDFDocument["embedJpg"]>>;
    fdcsLogo: Awaited<ReturnType<PDFDocument["embedPng"]>>;
    totalSubmissions: number;
    totalDetailedAnswers: number;
    latestSubmissionAt: string | null;
    scopeTitle: string;
    scopeSubtitle: string;
  },
) {
  const { page, pageWidth, pageHeight, margin } = context;
  const innerWidth = pageWidth - margin * 2;

  page.drawRectangle({
    x: 0,
    y: 0,
    width: pageWidth,
    height: pageHeight,
    color: rgb(0.04, 0.09, 0.16),
  });
  page.drawRectangle({
    x: margin,
    y: margin,
    width: pageWidth - margin * 2,
    height: pageHeight - margin * 2,
    borderColor: rgb(0.84, 0.69, 0.42),
    borderWidth: 1.2,
    color: rgb(0.07, 0.13, 0.21),
  });

  const logoSize = 84;
  const logoGap = 26;
  const logosWidth = logoSize * 2 + logoGap;
  const logosStartX = margin + (innerWidth - logosWidth) / 2;
  const logoY = pageHeight - 138;

  page.drawImage(fdcsLogo, { x: logosStartX, y: logoY, width: logoSize, height: logoSize });
  page.drawImage(ecpLogo, { x: logosStartX + logoSize + logoGap, y: logoY, width: logoSize, height: logoSize });

  drawCenteredText(page, context.regularFont, "Universidad Nacional de Asuncion", 11, pageWidth / 2, pageHeight - 176, rgb(0.83, 0.88, 0.94));
  drawCenteredText(page, context.regularFont, "Facultad de Derecho y Ciencias Sociales | Escuela de Ciencias Politicas", 11, pageWidth / 2, pageHeight - 192, rgb(0.83, 0.88, 0.94));
  drawCenteredText(page, context.boldFont, "INFORME TECNICO DE RESULTADOS", 23, pageWidth / 2, pageHeight - 248, rgb(1, 1, 1));
  drawCenteredText(page, context.boldFont, scopeTitle, 29, pageWidth / 2, pageHeight - 288, rgb(0.84, 0.69, 0.42));
  drawWrappedText(
    page,
    context.regularFont,
    scopeSubtitle,
    12,
    margin + 54,
    pageHeight - 346,
    innerWidth - 108,
    18,
    rgb(0.87, 0.91, 0.95),
    true,
  );

  const cardY = pageHeight - 496;
  const cardGap = 18;
  const cardWidth = (innerWidth - 44 - cardGap * 2) / 3;
  const cardsStartX = margin + 22;

  drawMetricCard(page, context, cardsStartX, cardY, cardWidth, 108, "Total de encuestas", String(totalSubmissions));
  drawMetricCard(
    page,
    context,
    cardsStartX + cardWidth + cardGap,
    cardY,
    cardWidth,
    108,
    "Respuestas detalladas",
    String(totalDetailedAnswers),
  );
  drawMetricCard(
    page,
    context,
    cardsStartX + (cardWidth + cardGap) * 2,
    cardY,
    cardWidth,
    108,
    "Ultimo registro",
    formatAsuncionDate(latestSubmissionAt),
  );

  drawWrappedText(
    page,
    context.regularFont,
    `Fecha de emision: ${formatAsuncionDate(new Date().toISOString())}`,
    11,
    margin + 48,
    margin + 60,
    innerWidth - 96,
    16,
    rgb(0.87, 0.91, 0.95),
    true,
  );
}

function drawMetricCard(
  page: PDFPage,
  context: ReportContext,
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
  value: string,
) {
  page.drawRectangle({
    x,
    y,
    width,
    height,
    color: rgb(0.1, 0.18, 0.29),
    borderColor: rgb(0.64, 0.73, 0.84),
    borderWidth: 0.8,
  });
  drawText(page, context.regularFont, label, 10.5, x + 12, y + height - 28, rgb(0.84, 0.69, 0.42));
  drawWrappedText(page, context.boldFont, value, 15, x + 12, y + height - 60, width - 24, 18, rgb(1, 1, 1));
}

function startNewPage(context: ReportContext, title: string) {
  context.page = context.pdfDoc.addPage([595.28, 841.89]);
  context.pageWidth = context.page.getWidth();
  context.pageHeight = context.page.getHeight();
  context.y = context.pageHeight - context.margin;

  context.page.drawRectangle({
    x: 0,
    y: 0,
    width: context.pageWidth,
    height: context.pageHeight,
    color: rgb(1, 1, 1),
  });

  drawText(context.page, context.boldFont, "ECP UNA | Informe tecnico", 11, context.margin, context.y, rgb(0.15, 0.2, 0.28));
  drawText(context.page, context.regularFont, title, 10.5, context.pageWidth - context.margin - 160, context.y, rgb(0.47, 0.55, 0.65));
  context.y -= 28;
  context.page.drawLine({
    start: { x: context.margin, y: context.y },
    end: { x: context.pageWidth - context.margin, y: context.y },
    thickness: 1,
    color: rgb(0.84, 0.69, 0.42),
  });
  context.y -= 22;
}

function ensureSpace(context: ReportContext, needed: number) {
  if (context.y - needed < context.margin + 24) {
    startNewPage(context, "Continuacion del informe");
  }
}

function drawSectionTitle(context: ReportContext, text: string) {
  ensureSpace(context, 34);
  drawText(context.page, context.boldFont, text, 18, context.margin, context.y, rgb(0.08, 0.12, 0.19));
  context.y -= 28;
}

function drawSubheading(context: ReportContext, text: string) {
  ensureSpace(context, 28);
  drawText(context.page, context.boldFont, text, 12.5, context.margin, context.y, rgb(0.15, 0.2, 0.28));
  context.y -= 20;
}

function drawParagraph(context: ReportContext, text: string, size = 11.5, bold = false) {
  ensureSpace(context, 42);
  const heightUsed = drawWrappedText(
    context.page,
    bold ? context.boldFont : context.regularFont,
    text,
    size,
    context.margin,
    context.y,
    context.pageWidth - context.margin * 2,
    size + 5,
    rgb(0.18, 0.23, 0.3),
  );
  context.y -= heightUsed + 10;
}

function drawBullet(context: ReportContext, text: string, size = 11) {
  ensureSpace(context, 30);
  drawText(context.page, context.boldFont, "-", size, context.margin, context.y, rgb(0.15, 0.2, 0.28));
  const heightUsed = drawWrappedText(
    context.page,
    context.regularFont,
    text,
    size,
    context.margin + 10,
    context.y,
    context.pageWidth - context.margin * 2 - 10,
    size + 4,
    rgb(0.18, 0.23, 0.3),
  );
  context.y -= heightUsed + 6;
}

function drawNumberedPoint(context: ReportContext, title: string, description: string) {
  ensureSpace(context, 50);
  drawParagraph(context, title, 12, true);
  drawParagraph(context, description, 11);
}

function drawText(page: PDFPage, font: PDFFont, text: string, size: number, x: number, y: number, color = rgb(0, 0, 0)) {
  page.drawText(sanitizeText(text), {
    x,
    y,
    size,
    font,
    color,
  });
}

function drawCenteredText(
  page: PDFPage,
  font: PDFFont,
  text: string,
  size: number,
  centerX: number,
  y: number,
  color = rgb(0, 0, 0),
) {
  const safeText = sanitizeText(text);
  const textWidth = font.widthOfTextAtSize(safeText, size);
  drawText(page, font, safeText, size, centerX - textWidth / 2, y, color);
}

function drawWrappedText(
  page: PDFPage,
  font: PDFFont,
  text: string,
  size: number,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  color = rgb(0, 0, 0),
  centered = false,
) {
  const lines = wrapText(font, sanitizeText(text), size, maxWidth);
  lines.forEach((line, index) => {
    const drawX = centered ? x + (maxWidth - font.widthOfTextAtSize(line, size)) / 2 : x;
    page.drawText(line, {
      x: drawX,
      y: y - index * lineHeight,
      size,
      font,
      color,
    });
  });
  return lines.length * lineHeight;
}

function wrapText(font: PDFFont, text: string, size: number, maxWidth: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let currentLine = "";

  words.forEach((word) => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const width = font.widthOfTextAtSize(testLine, size);

    if (width <= maxWidth) {
      currentLine = testLine;
      return;
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    currentLine = word;
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.length ? lines : [""];
}

function sanitizeText(value: string) {
  return value
    .replace(/[\u0000-\u001F]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
