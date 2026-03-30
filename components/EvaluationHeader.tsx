"use client";

import type { EmployeeInfo } from "@/types/evaluation";

type EmployeeOption = {
  id: string;
  nombre: string;
  puesto: string;
  area: string;
  email?: string;
};

export function EvaluationHeader({
  employee,
  date,
  employeeOptions,
  selectedEmployeeId,
  employeesLoading,
  onEmployeeSelect,
  onEmployeeChange,
  onDateChange,
}: {
  employee: EmployeeInfo;
  date: string;
  employeeOptions: EmployeeOption[];
  selectedEmployeeId: string;
  employeesLoading: boolean;
  onEmployeeSelect: (employeeId: string) => void;
  onEmployeeChange: (field: keyof EmployeeInfo, value: string) => void;
  onDateChange: (value: string) => void;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">
          Datos del colaborador
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Completa la información general antes de capturar la evaluación.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Empleado
          </label>
          <select
            value={selectedEmployeeId}
            onChange={(e) => onEmployeeSelect(e.target.value)}
            disabled={employeesLoading}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-500"
          >
            <option value="">
              {employeesLoading
                ? "Cargando colaboradores..."
                : "Selecciona un colaborador"}
            </option>

            {employeeOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Puesto
          </label>
          <input
            type="text"
            value={employee.position ?? ""}
            readOnly
            onChange={(e) => onEmployeeChange("position", e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700"
            placeholder="Puesto"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Área
          </label>
          <input
            type="text"
            value={employee.area ?? ""}
            readOnly
            onChange={(e) => onEmployeeChange("area", e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700"
            placeholder="Área"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Fecha
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-500"
          />
        </div>
      </div>
    </section>
  );
}