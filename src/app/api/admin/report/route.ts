import path from "node:path";
import sharp from "sharp";
import { PDFDocument, StandardFonts, rgb, type PDFPage, type PDFFont } from "pdf-lib";
import { formatAsuncionDate } from "@/lib/date-format";
import { getDashboardData } from "@/lib/survey-db";
import { isAdminAuthenticated } from "@/lib/admin-auth";

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

export async function GET() {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    return new Response("No autorizado", { status: 401 });
  }

  const data = await getDashboardData();
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
  });

  startNewPage(context, "Resumen ejecutivo");
  drawSectionTitle(context, "1. Resumen ejecutivo");
  drawParagraph(
    context,
    `Este informe consolida la totalidad de respuestas registradas en la plataforma hasta ${formatAsuncionDate(
      new Date().toISOString(),
    )}. El objetivo es ofrecer una lectura tecnica, clara y acumulativa de la encuesta institucional de la ECP UNA.`,
  );
  drawParagraph(
    context,
    `A la fecha del corte se registran ${data.totalSubmissions} formularios completos y ${data.totalDetailedAnswers} respuestas detalladas. Cada formulario corresponde a una persona encuestada y cada respuesta detallada representa una observacion individual normalizada por pregunta.`,
  );
  drawParagraph(
    context,
    `La distribucion por tipo de encuestado permite identificar que sectores participan con mayor frecuencia. Las preguntas cerradas se analizan mediante frecuencias absolutas y porcentajes, lo que facilita detectar tendencias predominantes y prioridades institucionales.`,
  );

  drawSectionTitle(context, "2. Distribucion por tipo de encuestado");
  data.relationSummary.forEach((item) => {
    const percent = data.totalSubmissions ? Math.round((item.total / data.totalSubmissions) * 100) : 0;
    drawBullet(
      context,
      `${item.label}: ${item.total} formularios, equivalentes al ${percent}% del total acumulado.`,
    );
  });

  drawSectionTitle(context, "3. Interpretacion de indicadores");
  drawNumberedPoint(
    context,
    "Total de encuestas",
    "Corresponde a la cantidad de formularios finalizados y almacenados en la base de datos. Este indicador mide el volumen total de participacion alcanzado hasta el momento del informe.",
  );
  drawNumberedPoint(
    context,
    "Respuestas detalladas",
    "Representa la suma de respuestas individuales indexadas por pregunta. Este valor es mayor que el total de formularios porque cada persona responde multiples preguntas y algunas incluyen varias selecciones.",
  );
  drawNumberedPoint(
    context,
    "Ultimo registro",
    `Indica la fecha y hora del envio mas reciente disponible para analisis. El ultimo corte registrado es ${formatAsuncionDate(
      data.latestSubmissionAt,
    )}.`,
  );

  startNewPage(context, "Resultados por pregunta");
  drawSectionTitle(context, "4. Resultados acumulados por pregunta cerrada");
  drawParagraph(
    context,
    "En esta seccion se resume cada pregunta cerrada con el total de respuestas consideradas y la distribucion observada en cada opcion disponible. La lectura porcentual ayuda a identificar preferencias, patrones y puntos de concentracion.",
  );

  data.questionSummaries.forEach((summary) => {
    ensureSpace(context, 92);
    drawSubheading(context, `${summary.moduleTitle}`);
    drawParagraph(
      context,
      `${summary.questionPrompt} | Tipo: ${summary.questionType} | Respuestas consideradas: ${summary.totalResponses}.`,
      11,
    );
    summary.options.forEach((option) => {
      drawBullet(context, `${option.label}: ${option.total} respuestas (${option.percent}%).`, 10.5);
    });
  });

  startNewPage(context, "Detalle por persona");
  drawSectionTitle(context, "5. Anexo de respuestas individuales");
  drawParagraph(
    context,
    "Este anexo organiza cada formulario por persona, tipo de encuestado y modulos contestados. Su funcion es permitir la trazabilidad de la informacion almacenada, verificando de manera ordenada las respuestas efectivamente capturadas.",
  );

  data.submissions.forEach((submission) => {
    ensureSpace(context, 70);
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
      ensureSpace(context, 46);
      drawParagraph(context, module.moduleTitle, 11.5, true);
      module.questions.forEach((question) => {
        drawBullet(context, `${question.questionPrompt}: ${question.answerDisplay}`, 10.5);
      });
    });
  });

  const pdfBytes = await pdfDoc.save();

  return new Response(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="informe-general-encuesta-ecp-una.pdf"',
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
  }: {
    ecpLogo: Awaited<ReturnType<PDFDocument["embedJpg"]>>;
    fdcsLogo: Awaited<ReturnType<PDFDocument["embedPng"]>>;
    totalSubmissions: number;
    totalDetailedAnswers: number;
    latestSubmissionAt: string | null;
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
  drawCenteredText(page, context.boldFont, "INFORME GENERAL DE RESULTADOS", 23, pageWidth / 2, pageHeight - 248, rgb(1, 1, 1));
  drawCenteredText(page, context.boldFont, "Encuesta institucional ECP UNA", 31, pageWidth / 2, pageHeight - 288, rgb(0.84, 0.69, 0.42));
  drawWrappedText(
    page,
    context.regularFont,
    "Documento tecnico generado a partir de la base de datos acumulada. Resume participacion, distribucion por relacion institucional, estadisticas por pregunta y detalle individual por registro.",
    12,
    margin + 48,
    pageHeight - 346,
    innerWidth - 96,
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
  drawText(context.page, context.regularFont, title, 10.5, context.pageWidth - context.margin - 140, context.y, rgb(0.47, 0.55, 0.65));
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
