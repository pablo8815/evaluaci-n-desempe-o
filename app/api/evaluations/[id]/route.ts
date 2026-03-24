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

/** Compatible con `params` síncrono (Next 14) o `Promise` (Next 15+). */
type RouteParams = { id: string } | Promise<{ id: string }>;

async function getId(params: RouteParams): Promise<string> {
  const p = await Promise.resolve(params);
  return p.id;
}

function invalidId() {
  return NextResponse.json({ error: "Identificador no válido" }, { status: 400 });
}

export async function GET(
  _request: Request,
  ctx: { params: RouteParams },
) {
  try {
    const id = await getId(ctx.params);
    if (!ObjectId.isValid(id)) return invalidId();

    const db = await getEvaluationsDb();
    const doc = await db
      .collection(EVALUATIONS_COLLECTION)
      .findOne({ _id: new ObjectId(id) });

    if (!doc) {
      return NextResponse.json({ error: "Evaluación no encontrada" }, { status: 404 });
    }
    return NextResponse.json(evaluationToClient(doc));
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error al obtener evaluación";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request, ctx: { params: RouteParams }) {
  try {
    const id = await getId(ctx.params);
    if (!ObjectId.isValid(id)) return invalidId();

    const body = (await request.json()) as EvaluationPayload;
    const sections = body.sections;
    if (!sections?.length) {
      return NextResponse.json(
        { error: "Se requiere sections" },
        { status: 400 },
      );
    }

    const totals = computeTotals(sections);
    const now = new Date();

    const update = {
      employee: body.employee,
      date: body.date,
      status: body.status,
      sections,
      totals,
      updatedAt: now,
    };

    const db = await getEvaluationsDb();
    const coll = db.collection(EVALUATIONS_COLLECTION);
    const up = await coll.updateOne(
      { _id: new ObjectId(id) },
      { $set: update },
    );

    if (up.matchedCount === 0) {
      return NextResponse.json({ error: "Evaluación no encontrada" }, { status: 404 });
    }

    const doc = await coll.findOne({ _id: new ObjectId(id) });
    if (!doc) {
      return NextResponse.json({ error: "Evaluación no encontrada" }, { status: 404 });
    }

    return NextResponse.json(evaluationToClient(doc));
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error al actualizar evaluación";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
