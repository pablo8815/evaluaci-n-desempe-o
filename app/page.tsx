"use client";

import type { EvaluationDocument } from "@/types/evaluation";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type EvaluationListItem = EvaluationDocument & {
  id?: string;
  _id?: string;
};

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function statusLabel(s: EvaluationDocument["status"]) {
  return s === "finalized" ? "Finalizada" : "Borrador";
}

function getEvaluationId(ev: EvaluationListItem) {
  return ev.id ?? ev._id ?? "";
}

export default function EvaluacionesListPage() {
  const [rows, setRows] = useState<EvaluationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/evaluations?ts=${Date.now()}`, {
        method: "GET",
        cache: "no-store",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "Error al cargar"
        );
      }

      setRows(Array.isArray(data.evaluations) ? data.evaluations : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar evaluaciones");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            INNOVA
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
            Evaluaciones de desempeño
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Listado de evaluaciones registradas en la base de datos.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void load()}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50"
          >
            Actualizar
          </button>

          <Link
            href="/evaluaciones/nueva"
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
          >
            Nueva evaluación
          </Link>
        </div>
      </header>

      <div className="mt-8">
        {error ? (
          <div
            className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
            role="alert"
          >
            {error}
          </div>
        ) : null}

        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Puesto</th>
                  <th className="px-4 py-3">Área</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3 text-right">Calificación final</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-center">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-10 text-center text-slate-500"
                    >
                      Cargando…
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-10 text-center text-slate-500"
                    >
                      No hay evaluaciones guardadas aún.{" "}
                      <Link
                        href="/evaluaciones/nueva"
                        className="font-medium text-slate-900 underline"
                      >
                        Crear la primera
                      </Link>
                      .
                    </td>
                  </tr>
                ) : (
                  rows.map((ev) => {
                    const evaluationId = getEvaluationId(ev);

                    return (
                      <tr
                        key={evaluationId || `${ev.employee.name}-${ev.date}`}
                        className="hover:bg-slate-50/80"
                      >
                        <td className="px-4 py-3 font-medium text-slate-900">
                          {ev.employee?.name || "—"}
                        </td>

                        <td className="px-4 py-3 text-slate-700">
                          {ev.employee?.position || "—"}
                        </td>

                        <td className="px-4 py-3 text-slate-700">
                          {ev.employee?.area || "—"}
                        </td>

                        <td className="px-4 py-3 text-slate-600">
                          {formatDate(ev.date)}
                        </td>

                        <td className="px-4 py-3 text-right tabular-nums text-slate-900">
                          {ev.totals?.final != null
                            ? `${ev.totals.final.toFixed(2)}%`
                            : "—"}
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              ev.status === "finalized"
                                ? "bg-emerald-100 text-emerald-900"
                                : "bg-amber-100 text-amber-900"
                            }`}
                          >
                            {statusLabel(ev.status)}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-center">
                          {!evaluationId ? (
                            <span className="text-xs text-slate-400">
                              Sin ID
                            </span>
                          ) : ev.status === "draft" ? (
                            <Link
                              href={`/evaluaciones/${evaluationId}`}
                              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                            >
                              Continuar
                            </Link>
                          ) : (
                            <a
                              href={`/api/evaluations/${evaluationId}/pdf`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                            >
                              Descargar PDF
                            </a>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}