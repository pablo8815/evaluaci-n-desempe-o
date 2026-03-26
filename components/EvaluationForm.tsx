"use client";

import { useCallback, useMemo, useState } from "react";
import { clampCompliance, computeTotals } from "@/lib/calculations";
import { collaboratorSlugForFilename } from "@/lib/collaborator-filename";
import { createEmptyEvaluationDraft } from "@/lib/evaluation-helpers";
import { EvaluationHeader } from "@/components/EvaluationHeader";
import { EvaluationSection } from "@/components/EvaluationSection";
import { TotalsCards } from "@/components/TotalsCards";
import Link from "next/link";
import type {
  EmployeeInfo,
  EvaluationItem,
  EvaluationDocument,
} from "@/types/evaluation";

const btnPrimary =
  "inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50";

const btnSecondary =
  "inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:opacity-50";

const btnAccent =
  "inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50";

function Alert({
  type,
  children,
}: {
  type: "ok" | "err";
  children: React.ReactNode;
}) {
  const styles =
    type === "ok"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
      : "border-red-200 bg-red-50 text-red-900";

  return (
    <div
      role="status"
      className={`rounded-lg border px-4 py-3 text-sm ${styles}`}
    >
      {children}
    </div>
  );
}

type PersistResponse = {
  id?: string;
  _id?: string;
  evaluation?: {
    id?: string;
    _id?: string;
  };
};

function extractEvaluationId(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;

  const value = data as PersistResponse;

  if (typeof value.id === "string" && value.id.trim()) return value.id;
  if (typeof value._id === "string" && value._id.trim()) return value._id;

  if (value.evaluation && typeof value.evaluation === "object") {
    if (
      typeof value.evaluation.id === "string" &&
      value.evaluation.id.trim()
    ) {
      return value.evaluation.id;
    }

    if (
      typeof value.evaluation._id === "string" &&
      value.evaluation._id.trim()
    ) {
      return value.evaluation._id;
    }
  }

  return undefined;
}

export function EvaluationForm() {
  const initial = useMemo(() => createEmptyEvaluationDraft(), []);
  const [employee, setEmployee] = useState<EmployeeInfo>(initial.employee);
  const [date, setDate] = useState(initial.date);
  const [sections, setSections] = useState(initial.sections);
  const [evaluationId, setEvaluationId] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  const totals = useMemo(() => computeTotals(sections), [sections]);

  const showError = useCallback((text: string) => {
    setBanner({ type: "err", text });
  }, []);

  const showOk = useCallback((text: string) => {
    setBanner({ type: "ok", text });
  }, []);

  const resetForm = useCallback(() => {
    const empty = createEmptyEvaluationDraft();
    setEmployee(empty.employee);
    setDate(empty.date);
    setSections(empty.sections);
    setEvaluationId(undefined);
  }, []);

  const buildDocumentForPdf = useCallback((): EvaluationDocument => {
    return {
      employee,
      date,
      status: "draft",
      sections,
      totals: computeTotals(sections),
    };
  }, [employee, date, sections]);

  const persistDraft = useCallback(async (): Promise<string> => {
    const payload = {
      employee,
      date,
      status: "draft" as const,
      sections,
    };

    if (!evaluationId) {
      const res = await fetch("/api/evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data: unknown = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errorMessage =
          data &&
          typeof data === "object" &&
          "error" in data &&
          typeof (data as { error?: unknown }).error === "string"
            ? (data as { error: string }).error
            : "No se pudo crear el borrador";

        throw new Error(errorMessage);
      }

      const newId = extractEvaluationId(data);

      if (!newId) {
        console.error("Respuesta POST /api/evaluations sin id:", data);
        throw new Error("La API no devolvió el identificador del borrador");
      }

      setEvaluationId(newId);
      return newId;
    }

    const res = await fetch(`/api/evaluations/${evaluationId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data: unknown = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMessage =
        data &&
        typeof data === "object" &&
        "error" in data &&
        typeof (data as { error?: unknown }).error === "string"
          ? (data as { error: string }).error
          : "No se pudo actualizar el borrador";

      throw new Error(errorMessage);
    }

    const updatedId = extractEvaluationId(data) ?? evaluationId;

    if (!updatedId) {
      console.error("Respuesta PUT /api/evaluations/[id] sin id:", data);
      throw new Error("No se pudo conservar el identificador de la evaluación");
    }

    setEvaluationId(updatedId);
    return updatedId;
  }, [employee, date, sections, evaluationId]);

  const onSaveDraft = async () => {
    setLoading(true);
    setBanner(null);

    try {
      const id = await persistDraft();
      showOk(`Borrador guardado correctamente. ID: ${id}`);
    } catch (e) {
      showError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  const onGeneratePdf = async () => {
    setLoading(true);
    setBanner(null);

    try {
      const doc = buildDocumentForPdf();

      const res = await fetch("/api/evaluations/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(doc),
        cache: "no-store",
      });

      if (!res.ok) {
        const data: unknown = await res.json().catch(() => ({}));
        const errorMessage =
          data &&
          typeof data === "object" &&
          "error" in data &&
          typeof (data as { error?: unknown }).error === "string"
            ? (data as { error: string }).error
            : "Error al generar PDF";

        throw new Error(errorMessage);
      }

      const arrayBuffer = await res.arrayBuffer();

      if (!arrayBuffer.byteLength) {
        throw new Error("El PDF llegó vacío desde el servidor");
      }

      const slug = collaboratorSlugForFilename(employee.name);
      const downloadName = `evaluacion-${slug}.pdf`;

      const blob = new Blob([arrayBuffer], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      window.open(url, "_blank");

      const a = document.createElement("a");
      a.href = url;
      a.download = downloadName;
      document.body.appendChild(a);
      a.click();
      a.remove();

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 5000);

      showOk("PDF generado correctamente.");
    } catch (e) {
      showError(e instanceof Error ? e.message : "Error al generar PDF");
    } finally {
      setLoading(false);
    }
  };

  const onFinalize = async () => {
    if (!employee.name.trim()) {
      showError("El nombre del colaborador es obligatorio para finalizar.");
      return;
    }

    setLoading(true);
    setBanner(null);

    try {
      const id = await persistDraft();

      if (!id) {
        throw new Error("No se pudo obtener el identificador de la evaluación");
      }

      const evaluation = {
        employee,
        date,
        status: "finalized" as const,
        sections,
      };

      const res = await fetch("/api/evaluations/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, evaluation }),
      });

      const data: unknown = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errorMessage =
          data &&
          typeof data === "object" &&
          "error" in data &&
          typeof (data as { error?: unknown }).error === "string"
            ? (data as { error: string }).error
            : "No se pudo finalizar";

        throw new Error(errorMessage);
      }

      resetForm();
      showOk(
        "Evaluación finalizada y guardada. El formulario se reinició para una nueva captura."
      );
    } catch (e) {
      showError(e instanceof Error ? e.message : "Error al finalizar");
    } finally {
      setLoading(false);
    }
  };

  const onItemChange = (
    sectionIndex: number,
    itemIndex: number,
    patch: Partial<EvaluationItem>
  ) => {
    setSections((prev) =>
      prev.map((section, si) => {
        if (si !== sectionIndex) return section;

        return {
          ...section,
          items: section.items.map((item, ii) => {
            if (ii !== itemIndex) return item;

            const merged = { ...item, ...patch };

            if (patch.compliance !== undefined) {
              merged.compliance = clampCompliance(Number(patch.compliance));
            }

            return merged;
          }),
        };
      })
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            INNOVA
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
            Nueva evaluación de desempeño
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Captura manual del instrumento. Los totales se calculan en tiempo real;
            puedes guardar borradores, generar el PDF y finalizar cuando esté completa.
          </p>
        </div>

        <Link
          href="/evaluaciones"
          className="text-sm font-medium text-slate-600 underline-offset-4 hover:text-slate-900 hover:underline"
        >
          ← Volver al listado
        </Link>
      </header>

      <div className="mt-8 space-y-8">
        {banner ? <Alert type={banner.type}>{banner.text}</Alert> : null}

        <TotalsCards totals={totals} />

        <EvaluationHeader
          employee={employee}
          date={date}
          onEmployeeChange={(field, value) =>
            setEmployee((prev) => ({ ...prev, [field]: value }))
          }
          onDateChange={setDate}
        />

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className={btnPrimary}
            disabled={loading}
            onClick={() => void onSaveDraft()}
          >
            Guardar borrador
          </button>

          <button
            type="button"
            className={btnSecondary}
            disabled={loading}
            onClick={() => void onGeneratePdf()}
          >
            Generar PDF
          </button>

          <button
            type="button"
            className={btnAccent}
            disabled={loading}
            onClick={() => void onFinalize()}
          >
            Finalizar y limpiar
          </button>

          {evaluationId ? (
            <span className="self-center text-xs text-slate-500">
              Borrador:{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5">
                {evaluationId}
              </code>
            </span>
          ) : null}
        </div>

        <div className="space-y-6">
          {sections.map((section, sectionIndex) => (
            <EvaluationSection
              key={section.id}
              section={section}
              sectionIndex={sectionIndex}
              subtotal={totals[section.id]}
              onItemChange={onItemChange}
            />
          ))}
        </div>
      </div>
    </div>
  );
}