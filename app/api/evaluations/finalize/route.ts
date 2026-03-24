import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { computeTotals } from "@/lib/calculations";
import { evaluationToClient } from "@/lib/evaluation-db";
import {
  EVALUATIONS_COLLECTION,
  getEvaluationsDb,
} from "@/lib/mongodb";
import type { EvaluationPayload } from "@/types/evaluation";

export const runtime = "nodejs";

/**
 * Persiste últimos cambios (opcional) y marca la evaluación como finalized.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      id: string;
      evaluation?: EvaluationPayload;
    };
    const { id, evaluation } = body;

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "id inválido" }, { status: 400 });
    }

    const db = await getEvaluationsDb();
    const coll = db.collection(EVALUATIONS_COLLECTION);
    const now = new Date();
    const oid = new ObjectId(id);

    if (evaluation) {
      const name = evaluation.employee?.name?.trim();
      if (!name) {
        return NextResponse.json(
          { error: "El nombre del colaborador es obligatorio para finalizar" },
          { status: 400 },
        );
      }
      if (!evaluation.sections?.length) {
        return NextResponse.json({ error: "Se requiere sections" }, { status: 400 });
      }
      const totals = computeTotals(evaluation.sections);
      const up = await coll.updateOne(
        { _id: oid },
        {
          $set: {
            employee: evaluation.employee,
            date: evaluation.date,
            sections: evaluation.sections,
            totals,
            status: "finalized",
            finalizedAt: now,
            updatedAt: now,
          },
        },
      );
      if (up.matchedCount === 0) {
        return NextResponse.json({ error: "Evaluación no encontrada" }, { status: 404 });
      }
      const doc = await coll.findOne({ _id: oid });
      if (!doc) {
        return NextResponse.json({ error: "Evaluación no encontrada" }, { status: 404 });
      }
      return NextResponse.json(evaluationToClient(doc));
    }

    const up = await coll.updateOne(
      { _id: oid },
      {
        $set: {
          status: "finalized",
          finalizedAt: now,
          updatedAt: now,
        },
      },
    );

    if (up.matchedCount === 0) {
      return NextResponse.json({ error: "Evaluación no encontrada" }, { status: 404 });
    }
    const doc = await coll.findOne({ _id: oid });
    if (!doc) {
      return NextResponse.json({ error: "Evaluación no encontrada" }, { status: 404 });
    }
    return NextResponse.json(evaluationToClient(doc));
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error al finalizar";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
