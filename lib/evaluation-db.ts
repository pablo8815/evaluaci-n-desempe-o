import type { Document, WithId } from "mongodb";
import type { EvaluationDocument } from "@/types/evaluation";

function toIso(d: unknown): string | undefined {
  if (d instanceof Date) return d.toISOString();
  if (typeof d === "string") return d;
  return undefined;
}

/** Convierte documento Mongo a forma enviada al cliente. */
export function evaluationToClient(
  doc: WithId<Document> | Record<string, unknown>,
): EvaluationDocument & { id: string; _id: string } {
  const d = doc as Record<string, unknown>;
  const mongoId = String(d._id ?? "");

  return {
    id: mongoId,
    _id: mongoId,
    employee: d.employee as EvaluationDocument["employee"],
    date: String(d.date ?? ""),
    status: d.status as EvaluationDocument["status"],
    sections: d.sections as EvaluationDocument["sections"],
    totals: d.totals as EvaluationDocument["totals"],
    createdAt: toIso(d.createdAt),
    updatedAt: toIso(d.updatedAt),
    finalizedAt: d.finalizedAt ? toIso(d.finalizedAt) ?? null : null,
  };
}