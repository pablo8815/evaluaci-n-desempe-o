import { NextResponse } from "next/server";
import { evaluationToClient } from "@/lib/evaluation-db";
import {
  EVALUATIONS_COLLECTION,
  getEvaluationsDb,
} from "@/lib/mongodb";

export const runtime = "nodejs";

export async function GET() {
  try {
    const db = await getEvaluationsDb();

    const rows = await db
      .collection(EVALUATIONS_COLLECTION)
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      evaluations: rows.map((row) => evaluationToClient(row)),
    });
  } catch (e) {
    console.error("GET /api/evaluations error:", e);

    const message =
      e instanceof Error ? e.message : "Error al listar evaluaciones";

    return NextResponse.json(
      { error: message, evaluations: [] },
      { status: 500 }
    );
  }
}
