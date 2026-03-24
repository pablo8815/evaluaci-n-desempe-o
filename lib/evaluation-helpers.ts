import { computeTotals } from "@/lib/calculations";
import { buildEmptySections } from "@/lib/evaluation-template";
import type {
  EvaluationDocument,
  EvaluationStatus,
  EvaluationTotals,
} from "@/types/evaluation";

/** Estado inicial listo para nueva captura (sin _id). */
export function createEmptyEvaluationDraft(params?: {
  status?: EvaluationStatus;
}): Omit<
  EvaluationDocument,
  "_id" | "createdAt" | "updatedAt" | "finalizedAt"
> {
  const sections = buildEmptySections();
  return {
    employee: { name: "", position: "", area: "" },
    date: new Date().toISOString().slice(0, 10),
    status: params?.status ?? "draft",
    sections,
    totals: computeTotals(sections),
  };
}

/** Asegura objeto `totals` coherente con `sections`. */
export function withComputedTotals<
  T extends Pick<EvaluationDocument, "sections">,
>(doc: T): T & { totals: EvaluationTotals } {
  return {
    ...doc,
    totals: computeTotals(doc.sections),
  };
}
