"use client";

import type { EmployeeInfo } from "@/types/evaluation";

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200";

type Props = {
  employee: EmployeeInfo;
  date: string;
  onEmployeeChange: (field: keyof EmployeeInfo, value: string) => void;
  onDateChange: (value: string) => void;
};

export function EvaluationHeader({
  employee,
  date,
  onEmployeeChange,
  onDateChange,
}: Props) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-800">
        Datos del colaborador
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Completa la información general antes de capturar las perspectivas.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block text-sm font-medium text-slate-700">
          Nombre
          <input
            className={`mt-1 ${inputClass}`}
            value={employee.name}
            onChange={(e) => onEmployeeChange("name", e.target.value)}
            placeholder="Nombre completo"
            autoComplete="name"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Puesto
          <input
            className={`mt-1 ${inputClass}`}
            value={employee.position}
            onChange={(e) => onEmployeeChange("position", e.target.value)}
            placeholder="Puesto"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Área
          <input
            className={`mt-1 ${inputClass}`}
            value={employee.area}
            onChange={(e) => onEmployeeChange("area", e.target.value)}
            placeholder="Área o dirección"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Fecha
          <input
            type="date"
            className={`mt-1 ${inputClass}`}
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
          />
        </label>
      </div>
    </section>
  );
}
