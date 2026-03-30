"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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

type EvaluationFormInitialData = EvaluationDocument & {
  id?: string;
  _id?: string;
};

type EmployeeOption = {
  id: string;
  nombre: string;
  puesto: string;
  area: string;
  email?: string;
};

export function EvaluationForm({
  initialData,
}: {
  initialData?: EvaluationFormInitialData | null;
}) {
  const initial = useMemo(
    () => initialData ?? createEmptyEvaluationDraft(),
    [initialData]
  );

  const [employee, setEmployee] = useState<EmployeeInfo>(initial.employee);
  const [date, setDate] = useState(initial.date);
  const [sections, setSections] = useState(initial.sections);
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  const [employeeOptions, setEmployeeOptions] = useState<EmployeeOption[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [employeesError, setEmployeesError] = useState<string | null>(null);

  const isFinalized = initialData?.status === "finalized";
  const totals = useMemo(() => computeTotals(sections), [sections]);

  useEffect(() => {
    let ignore = false;

    async function loadEmployees() {
      try {
        setEmployeesLoading(true);
        setEmployeesError(null);

        const res = await fetch("/api/employees", {
          method: "GET",
          cache: "no-store",
        });

        const data: unknown = await res.json().catch(() => []);

        if (!res.ok) {
          const errorMessage =
            data &&
            typeof data === "object" &&
            "error" in data &&
            typeof (data as { error?: unknown }).error === "string"
              ? (data as { error: string }).error
              : "No se pudo cargar la lista de colaboradores";

          throw new Error(errorMessage);
        }

        if (!Array.isArray(data)) {
          throw new Error("La respuesta de empleados no tiene el formato esperado");
        }

        const normalized: EmployeeOption[] = data
          .map((item) => {
            if (!item || typeof item !== "object") return null;

            const row = item as Record<string, unknown>;

            return {
              id: String(row.id ?? ""),
              nombre: String(row.nombre ?? ""),
              puesto: String(row.puesto ?? ""),
              area: String(row.area ?? ""),
              email: row.email ? String(row.email) : "",
            };
          })
          .filter(
            (item): item is EmployeeOption =>
              !!item && !!item.id && !!item.nombre
          );

        if (!ignore) {
          setEmployeeOptions(normalized);
        }
      } catch (error) {
        if (!ignore) {
          setEmployeesError(
            error instanceof Error
              ? error.message
              : "Error al cargar colaboradores"
          );
        }
      } finally {
        if (!ignore) {
          setEmployeesLoading(false);
        }
      }
    }

    void loadEmployees();

    return () => {
      ignore = true;
    };
  }, []);

  const selectedEmployeeId = useMemo(() => {
    const match = employeeOptions.find(
      (option) =>
        option.nombre.trim().toLowerCase() === employee.name.trim().toLowerCase()
    );

    return match?.id ?? "";
  }, [employee.name, employeeOptions]);

  const handleEmployeeSelect = useCallback(
    (employeeId: string) => {
      const selected = employeeOptions.find((item) => item.id === employeeId);

      if (!selected) {
        setEmployee((prev) => ({
          ...prev,
          name: "",
          position: "",
          area: "",
        }));
        return;
      }

      setEmployee((prev) => ({
        ...prev,
        name: selected.nombre,
        position: selected.puesto,
        area: selected.area,
      }));
    },
    [employeeOptions]
  );

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
  }, []);

  const waitForStateFlush = useCallback(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      }),
    []
  );

  const buildDocumentForPdf = useCallback(
    (
      status: EvaluationDocument["status"] = "finalized"
    ): EvaluationDocument => {
      return {
        employee,
        date,
        status,
        sections,
        totals: computeTotals(sections),
      };
    },
    [employee, date, sections]
  );

  const onGeneratePdf = async () => {
    setLoading(true);
    setBanner(null);

    try {
      await waitForStateFlush();
      const doc = buildDocumentForPdf("finalized");

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

      const slug = collaboratorSlugForFilename(employee.name || "colaborador");
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
      await waitForStateFlush();

      const payload = {
        employee,
        date,
        status: "finalized" as const,
        sections,
      };

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
            : "No se pudo finalizar";

        throw new Error(errorMessage);
      }

      resetForm();
      showOk("Evaluación finalizada y guardada correctamente.");
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
            Captura manual del instrumento. Los totales se calculan en tiempo
            real; puedes generar el PDF y finalizar cuando esté completa.
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

        {employeesError ? (
          <Alert type="err">
            No se pudo cargar la lista de colaboradores: {employeesError}
          </Alert>
        ) : null}

        <TotalsCards totals={totals} />

        <EvaluationHeader
          employee={employee}
          date={date}
          employeeOptions={employeeOptions}
          selectedEmployeeId={selectedEmployeeId}
          employeesLoading={employeesLoading}
          onEmployeeSelect={handleEmployeeSelect}
          onEmployeeChange={(field, value) =>
            setEmployee((prev) => ({ ...prev, [field]: value }))
          }
          onDateChange={setDate}
        />

        <div className="flex flex-wrap gap-3">
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
            disabled={loading || isFinalized}
            onClick={() => void onFinalize()}
          >
            Finalizar y limpiar
          </button>
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