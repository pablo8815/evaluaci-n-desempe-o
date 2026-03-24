import type { EvaluationTotals } from "@/types/evaluation";

const cardBase =
  "rounded-xl border bg-white p-4 shadow-sm ring-1 ring-inset transition";

type Props = {
  totals: EvaluationTotals;
};

export function TotalsCards({ totals }: Props) {
  const items: {
    key: keyof EvaluationTotals;
    label: string;
    sub: string;
    ring: string;
    border: string;
  }[] = [
    {
      key: "procesosInternos",
      label: "Procesos internos",
      sub: "Perspectiva operativa y estandarización",
      ring: "ring-orange-100",
      border: "border-orange-100",
    },
    {
      key: "aprendizajeCrecimiento",
      label: "Aprendizaje y crecimiento",
      sub: "Competencias y desarrollo",
      ring: "ring-amber-100",
      border: "border-amber-100",
    },
    {
      key: "cliente",
      label: "Cliente",
      sub: "Valor y servicio",
      ring: "ring-blue-100",
      border: "border-blue-100",
    },
    {
      key: "financiera",
      label: "Financiera",
      sub: "Resultados económicos",
      ring: "ring-emerald-100",
      border: "border-emerald-100",
    },
    {
      key: "final",
      label: "Calificación final",
      sub: "Promedio de las cuatro perspectivas",
      ring: "ring-slate-200",
      border: "border-slate-200",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {items.map((it) => {
        const value = totals[it.key];
        const isFinal = it.key === "final";
        return (
          <div
            key={it.key}
            className={`${cardBase} ${it.ring} ${it.border} ${
              isFinal ? "xl:col-span-1 border-slate-300 bg-slate-50" : ""
            }`}
          >
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {it.label}
            </p>
            <p className="mt-2 text-3xl font-bold tabular-nums text-slate-900">
              {value.toFixed(2)}%
            </p>
            <p className="mt-1 text-xs text-slate-500">{it.sub}</p>
          </div>
        );
      })}
    </div>
  );
}
