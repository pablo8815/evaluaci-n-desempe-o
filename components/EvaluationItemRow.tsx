"use client";

import { complianceFromAnswer } from "@/lib/calculations";
import type { EvaluationAnswer, EvaluationItem } from "@/types/evaluation";

const selectClass =
  "w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200";

const inputNumClass =
  "w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm tabular-nums text-slate-900 shadow-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200";

const textareaClass =
  "min-h-[52px] w-full resize-y rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200";

type Props = {
  item: EvaluationItem;
  onChange: (patch: Partial<EvaluationItem>) => void;
};

const answerOptions: { value: EvaluationAnswer; label: string }[] = [
  { value: "", label: "— Seleccionar —" },
  { value: "si", label: "Sí" },
  { value: "parcial", label: "Parcial" },
  { value: "no", label: "No" },
];

export function EvaluationItemRow({ item, onChange }: Props) {
  return (
    <tr className="align-top transition-colors hover:bg-slate-50/80">
      <td className="whitespace-nowrap px-2 py-3 text-center text-sm font-medium text-slate-600">
        {item.index}
      </td>
      <td className="px-2 py-3 text-sm text-slate-700">{item.category}</td>
      <td className="px-2 py-3 text-sm text-slate-800">{item.label}</td>
      <td className="whitespace-nowrap px-2 py-3 text-sm text-slate-600">
        {item.type}
      </td>
      <td className="px-2 py-3">
        <select
          className={selectClass}
          value={item.answer}
          onChange={(e) => {
            const answer = e.target.value as EvaluationAnswer;
            if (answer === "") {
              onChange({ answer: "", compliance: 0 });
              return;
            }
            const auto = complianceFromAnswer(answer);
            if (auto !== null) onChange({ answer, compliance: auto });
          }}
        >
          {answerOptions.map((o) => (
            <option key={o.value || "empty"} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </td>
      <td className="px-2 py-3">
        <input
          type="number"
          min={0}
          max={100}
          step={0.01}
          className={inputNumClass}
          value={Number.isFinite(item.compliance) ? item.compliance : 0}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            onChange({ compliance: Number.isNaN(v) ? 0 : v });
          }}
        />
      </td>
      <td className="px-2 py-3">
        <textarea
          className={textareaClass}
          value={item.comment}
          onChange={(e) => onChange({ comment: e.target.value })}
          placeholder="Comentario"
          rows={2}
        />
      </td>
      <td className="px-2 py-3">
        <textarea
          className={textareaClass}
          value={item.improvementCommitment}
          onChange={(e) =>
            onChange({ improvementCommitment: e.target.value })
          }
          placeholder="Compromiso de mejora"
          rows={2}
        />
      </td>
    </tr>
  );
}
