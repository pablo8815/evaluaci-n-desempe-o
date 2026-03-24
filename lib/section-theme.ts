import type { EvaluationSectionId } from "@/types/evaluation";

/** Colores por perspectiva (Tailwind) para bordes y acentos. */
export const SECTION_THEME: Record<
  EvaluationSectionId,
  {
    border: string;
    headerBg: string;
    headerText: string;
    cardRing: string;
  }
> = {
  procesosInternos: {
    border: "border-orange-400",
    headerBg: "bg-orange-500/90",
    headerText: "text-white",
    cardRing: "ring-orange-200",
  },
  aprendizajeCrecimiento: {
    border: "border-amber-400",
    headerBg: "bg-amber-400",
    headerText: "text-amber-950",
    cardRing: "ring-amber-200",
  },
  cliente: {
    border: "border-blue-500",
    headerBg: "bg-blue-600",
    headerText: "text-white",
    cardRing: "ring-blue-200",
  },
  financiera: {
    border: "border-emerald-500",
    headerBg: "bg-emerald-600",
    headerText: "text-white",
    cardRing: "ring-emerald-200",
  },
};
