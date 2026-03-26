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

type RouteParams = { id: string } | Promise<{ id: string }>;

async function getId(params: RouteParams): Promise<string> {
  const resolved = await Promise.resolve(params);
  return resolved.id;
}

function invalidIdResponse() {
  return NextResponse.json(
    { error: "Identificador no válido" },
    { status: 400 }
  );
}

export async function GET(
  _request: Request,
  ctx: { params: RouteParams }
) {
  try {
    const id = await getId(ctx.params);

    if (!ObjectId.isValid(id)) {
      return invalidIdResponse();
    }

    const db = await getEvaluationsDb();
    const doc = await db
      .collection(EVALUATIONS_COLLECTION)
      .findOne({ _id: new ObjectId(id) });

    if (!doc) {
      return NextResponse.json(
        { error: "Evaluación no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(evaluationToClient(doc));
  } catch (e) {
    console.error("GET /api/evaluations/[id] error:", e);

    const message =
      e instanceof Error ? e.message : "Error al obtener evaluación";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  ctx: { params: RouteParams }
) {
  try {
    const id = await getId(ctx.params);

    if (!ObjectId.isValid(id)) {
      return invalidIdResponse();
    }

    const body = (await request.json()) as Partial<EvaluationPayload>;
    const sections = body.sections;

    if (!sections?.length) {
      return NextResponse.json(
        { error: "Se requiere sections" },
        { status: 400 }
      );
    }

    if (!body.employee) {
      return NextResponse.json(
        { error: "Se requiere employee" },
        { status: 400 }
      );
    }

    if (!body.date) {
      return NextResponse.json(
        { error: "Se requiere date" },
        { status: 400 }
      );
    }

    const totals = computeTotals(sections);
    const now = new Date();

    const update = {
      employee: body.employee,
      date: body.date,
      status: body.status ?? "draft",
      sections,
      totals,
      updatedAt: now,
    };

    const db = await getEvaluationsDb();
    const collection = db.collection(EVALUATIONS_COLLECTION);

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: update }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Evaluación no encontrada" },
        { status: 404 }
      );
    }

    const doc = await collection.findOne({ _id: new ObjectId(id) });

    if (!doc) {
      return NextResponse.json(
        { error: "Evaluación no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(evaluationToClient(doc));
  } catch (e) {
    console.error("PUT /api/evaluations/[id] error:", e);

    const message =
      e instanceof Error ? e.message : "Error al actualizar evaluación";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
