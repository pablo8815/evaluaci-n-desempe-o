import { NextResponse } from "next/server";
import { computeTotals } from "@/lib/calculations";
import { evaluationToClient } from "@/lib/evaluation-db";
import {
  EVALUATIONS_COLLECTION,
  getEvaluationsDb,
} from "@/lib/mongodb";
import type { EvaluationPayload } from "@/types/evaluation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const db = await getEvaluationsDb();

    const rows = await db
      .collection(EVALUATIONS_COLLECTION)
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(
      {
        evaluations: rows.map((row) => evaluationToClient(row)),
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (e) {
    console.error("GET /api/evaluations error:", e);

    const message =
      e instanceof Error ? e.message : "Error al listar evaluaciones";

    return NextResponse.json(
      { error: message, evaluations: [] },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  }
}

export async function POST(request: Request) {
  try {
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

    const now = new Date();
    const totals = computeTotals(sections);

    const docToInsert = {
      employee: body.employee,
      date: body.date,
      status: body.status ?? "draft",
      sections,
      totals,
      createdAt: now,
      updatedAt: now,
    };

    const db = await getEvaluationsDb();
    const collection = db.collection(EVALUATIONS_COLLECTION);

    const result = await collection.insertOne(docToInsert);

    const created = await collection.findOne({
      _id: result.insertedId,
    });

    if (!created) {
      return NextResponse.json(
        { error: "No se pudo recuperar la evaluación creada" },
        { status: 500 }
      );
    }

    return NextResponse.json(evaluationToClient(created), {
      status: 201,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (e) {
    console.error("POST /api/evaluations error:", e);

    const message =
      e instanceof Error ? e.message : "Error al crear evaluación";

    return NextResponse.json(
      { error: message },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  }
}