"use client";

import { EvaluationItemRow } from "@/components/EvaluationItemRow";
import type { EvaluationItem, EvaluationSection as SectionType } from "@/types/evaluation";

type Props = {
  section: SectionType;
  sectionIndex: number;
  subtotal: number;
  onItemChange: (
    sectionIndex: number,
    itemIndex: number,
    patch: Partial<EvaluationItem>,
  ) => void;
};

function getSectionClasses(sectionId: string) {
  switch (sectionId) {
    case "procesosInternos":
      return {
        border: "border-orange-400",
        header: "bg-orange-500 text-white",
      };
    case "aprendizajeCrecimiento":
      return {
        border: "border-amber-400",
        header: "bg-amber-400 text-amber-950",
      };
    case "cliente":
      return {
        border: "border-blue-500",
        header: "bg-blue-600 text-white",
      };
    case "financiera":
      return {
        border: "border-emerald-500",
        header: "bg-emerald-600 text-white",
      };
    default:
      return {
        border: "border-slate-300",
        header: "bg-slate-100 text-slate-900",
      };
  }
}

export function EvaluationSection({
  section,
  sectionIndex,
  subtotal,
  onItemChange,
}: Props) {
  const classes = getSectionClasses(section.id);

  return (
    <section
      className={`overflow-hidden rounded-2xl border-2 bg-white shadow-sm ${classes.border}`}
    >
      <header
        className={`flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between ${classes.header}`}
      >
        <div>
          <h3 className="text-base font-semibold">{section.title}</h3>
          <p className="text-sm opacity-90">
            Promedio de ítems de esta perspectiva
          </p>
        </div>

        <div className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-right shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Subtotal
          </p>
          <p className="text-2xl font-bold tabular-nums text-slate-900">
            {Number(subtotal || 0).toFixed(2)}%
          </p>
        </div>
      </header>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-2 py-3 text-center">#</th>
              <th className="px-2 py-3">Categoría</th>
              <th className="min-w-[200px] px-2 py-3">Parámetro</th>
              <th className="px-2 py-3">Tipo</th>
              <th className="min-w-[120px] px-2 py-3">Respuesta</th>
              <th className="min-w-[100px] px-2 py-3">% Cumplimiento</th>
              <th className="min-w-[180px] px-2 py-3">Comentario</th>
              <th className="min-w-[180px] px-2 py-3">Compromiso de mejora</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {section.items.map((item, itemIndex) => (
              <EvaluationItemRow
                key={`${section.id}-${item.index}`}
                item={item}
                onChange={(patch) =>
                  onItemChange(sectionIndex, itemIndex, patch)
                }
              />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}