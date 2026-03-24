import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";
import { computeTotals } from "@/lib/calculations";
import { wrapTextToLines } from "@/lib/pdf-text";
import type { EvaluationAnswer, EvaluationDocument } from "@/types/evaluation";

const A4_W = 595.28;
const A4_H = 841.89;
const MARGIN = 48;

function answerLabel(a: EvaluationAnswer): string {
  if (a === "si") return "Sí";
  if (a === "parcial") return "Parcial";
  if (a === "no") return "No";
  return "—";
}

type LayoutContext = {
  pdfDoc: PDFDocument;
  page: PDFPage;
  y: number;
  font: PDFFont;
  fontBold: PDFFont;
  contentWidth: number;
};

function lineHeight(size: number, factor = 1.35): number {
  return size * factor;
}

function ensureSpace(ctx: LayoutContext, needed: number): void {
  if (ctx.y - needed < MARGIN) {
    ctx.page = ctx.pdfDoc.addPage([A4_W, A4_H]);
    ctx.y = A4_H - MARGIN;
  }
}

function drawLines(
  ctx: LayoutContext,
  lines: string[],
  size: number,
  opts?: { bold?: boolean; color?: ReturnType<typeof rgb> }
): void {
  const font = opts?.bold ? ctx.fontBold : ctx.font;
  const color = opts?.color ?? rgb(0.12, 0.14, 0.18);
  const lh = lineHeight(size);

  for (const line of lines) {
    ensureSpace(ctx, lh + 4);

    ctx.page.drawText(line, {
      x: MARGIN,
      y: ctx.y - size,
      size,
      font,
      color,
    });

    ctx.y -= lh;
  }
}

function drawParagraph(
  ctx: LayoutContext,
  text: string,
  size: number,
  opts?: { bold?: boolean; color?: ReturnType<typeof rgb> }
): void {
  const font = opts?.bold ? ctx.fontBold : ctx.font;
  const safeText = text?.trim() || "—";
  const lines = wrapTextToLines(safeText, ctx.contentWidth, font, size);

  if (!lines.length) {
    drawLines(ctx, ["—"], size, opts);
    return;
  }

  drawLines(ctx, lines, size, opts);
}

function drawRule(ctx: LayoutContext): void {
  ensureSpace(ctx, 8);

  ctx.page.drawLine({
    start: { x: MARGIN, y: ctx.y },
    end: { x: A4_W - MARGIN, y: ctx.y },
    thickness: 0.5,
    color: rgb(0.75, 0.78, 0.82),
  });

  ctx.y -= 10;
}

export async function buildEvaluationPdfBytes(
  raw: EvaluationDocument
): Promise<Uint8Array> {
  if (!raw?.sections?.length) {
    throw new Error("No hay secciones para generar el PDF");
  }

  const totals = computeTotals(raw.sections);
  const data: EvaluationDocument = {
    ...raw,
    totals,
  };

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const firstPage = pdfDoc.addPage([A4_W, A4_H]);

  const ctx: LayoutContext = {
    pdfDoc,
    page: firstPage,
    y: A4_H - MARGIN,
    font,
    fontBold,
    contentWidth: A4_W - MARGIN * 2,
  };

  console.log("Sections:", data.sections.length);
  console.log("Primer item:", data.sections[0]);

  ctx.page.drawText("PRUEBA PDF FUNCIONANDO", {
    x: MARGIN,
    y: ctx.y,
    size: 10,
    font: ctx.fontBold,
    color: rgb(0.8, 0.1, 0.1),
  });
  ctx.y -= 20;

  drawLines(ctx, ["Evaluación de Desempeño INNOVA 2026"], 16, {
    bold: true,
    color: rgb(0.06, 0.09, 0.16),
  });

  ctx.y -= 4;
  drawRule(ctx);

  drawParagraph(ctx, `Nombre: ${data.employee?.name || "—"}`, 11, {
    bold: true,
  });
  drawParagraph(ctx, `Puesto: ${data.employee?.position || "—"}`, 11);
  drawParagraph(ctx, `Área: ${data.employee?.area || "—"}`, 11);
  drawParagraph(ctx, `Fecha: ${data.date || "—"}`, 11);

  ctx.y -= 6;
  drawRule(ctx);

  for (const section of data.sections) {
    const score = data.totals[section.id] ?? 0;

    drawParagraph(
      ctx,
      `${section.title} — Subtotal: ${Number(score).toFixed(2)}%`,
      12,
      { bold: true }
    );

    ctx.y -= 4;

    for (const item of section.items) {
      ensureSpace(ctx, lineHeight(10) * 7);

      drawParagraph(ctx, `Ítem ${item.index}`, 10, { bold: true });
      drawParagraph(ctx, `Categoría: ${item.category || "—"}`, 9);
      drawParagraph(ctx, `Parámetro: ${item.label || "—"}`, 9);
      drawParagraph(ctx, `Tipo: ${item.type || "—"}`, 9);

      drawParagraph(
        ctx,
        `Respuesta: ${answerLabel(item.answer)}   |   % Cumplimiento: ${Number(
          item.compliance ?? 0
        ).toFixed(2)}%`,
        9
      );

      drawParagraph(ctx, `Comentario: ${item.comment || "—"}`, 9);
      drawParagraph(
        ctx,
        `Compromiso de mejora: ${item.improvementCommitment || "—"}`,
        9
      );

      ctx.y -= 6;
    }

    drawRule(ctx);
  }

  drawParagraph(ctx, "Totales (%)", 12, { bold: true });
  drawParagraph(
    ctx,
    `Procesos Internos: ${Number(data.totals.procesosInternos ?? 0).toFixed(2)}%`,
    10
  );
  drawParagraph(
    ctx,
    `Aprendizaje y Crecimiento: ${Number(
      data.totals.aprendizajeCrecimiento ?? 0
    ).toFixed(2)}%`,
    10
  );
  drawParagraph(
    ctx,
    `Cliente: ${Number(data.totals.cliente ?? 0).toFixed(2)}%`,
    10
  );
  drawParagraph(
    ctx,
    `Financiera: ${Number(data.totals.financiera ?? 0).toFixed(2)}%`,
    10
  );
  drawParagraph(
    ctx,
    `Calificación Final: ${Number(data.totals.final ?? 0).toFixed(2)}%`,
    11,
    { bold: true }
  );

  ctx.y -= 16;
  drawRule(ctx);
  drawParagraph(ctx, "Firmas", 12, { bold: true });

  ctx.y -= 8;
  ensureSpace(ctx, 70);

  drawParagraph(
    ctx,
    "Evaluador: ________________________________________________    Fecha: __________________",
    10
  );

  ctx.y -= 28;
  ensureSpace(ctx, 50);

  drawParagraph(
    ctx,
    "Colaborador: ______________________________________________    Fecha: __________________",
    10
  );

  const finalBytes = await pdfDoc.save();

  console.log("PDF bytes length:", finalBytes.length);

  if (!finalBytes.length) {
    throw new Error("pdf-lib devolvió un archivo vacío");
  }

  return finalBytes;
}