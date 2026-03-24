import type {
  EvaluationAnswer,
  EvaluationSection,
  EvaluationTotals,
} from "@/types/evaluation";

export const ANSWER_TO_COMPLIANCE: Record<Exclude<EvaluationAnswer, "">, number> =
  {
    si: 100,
    parcial: 50,
    no: 0,
  };

export function complianceFromAnswer(
  answer: EvaluationAnswer,
): number | null {
  if (answer === "") return null;
  return ANSWER_TO_COMPLIANCE[answer];
}

/** Promedio aritmético; redondeo a 2 decimales. */
export function average(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((a, b) => a + b, 0);
  return Math.round((sum / values.length) * 100) / 100;
}

export function sectionSubtotal(section: EvaluationSection): number {
  return average(section.items.map((i) => Number(i.compliance) || 0));
}

export function computeTotals(sections: EvaluationSection[]): EvaluationTotals {
  const byId = new Map(
    sections.map((s) => [s.id, sectionSubtotal(s)] as const),
  );
  const procesosInternos = byId.get("procesosInternos") ?? 0;
  const aprendizajeCrecimiento = byId.get("aprendizajeCrecimiento") ?? 0;
  const cliente = byId.get("cliente") ?? 0;
  const financiera = byId.get("financiera") ?? 0;
  const final = average([
    procesosInternos,
    aprendizajeCrecimiento,
    cliente,
    financiera,
  ]);
  return {
    procesosInternos,
    aprendizajeCrecimiento,
    cliente,
    financiera,
    final,
  };
}

/** Limita cumplimiento manual al rango 0–100. */
export function clampCompliance(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, value));
}
