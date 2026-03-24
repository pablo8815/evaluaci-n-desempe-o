import { NextResponse } from "next/server";
import { computeTotals } from "@/lib/calculations";
import { buildEvaluationPdfBytes } from "@/lib/pdf";
import { collaboratorSlugForFilename } from "@/lib/collaborator-filename";
import type { EvaluationDocument } from "@/types/evaluation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const data = (await request.json()) as EvaluationDocument;

    if (!data?.sections?.length) {
      return NextResponse.json(
        { error: "Payload incompleto" },
        { status: 400 }
      );
    }

    const totals = computeTotals(data.sections);
    const payload: EvaluationDocument = { ...data, totals };

    const bytes = await buildEvaluationPdfBytes(payload);

    if (!bytes || bytes.length === 0) {
      return NextResponse.json(
        { error: "El PDF se generó vacío" },
        { status: 500 }
      );
    }

    const slug = collaboratorSlugForFilename(data.employee?.name || "sin-nombre");
    const filenameAscii = `evaluacion-${slug}.pdf`;

    return new Response(Buffer.from(bytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filenameAscii}"`,
        "Content-Length": String(bytes.length),
        "Cache-Control": "no-store, no-cache, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (e) {
    console.error("Error al generar PDF:", e);

    const message =
      e instanceof Error ? e.message : "Error interno al generar PDF";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
