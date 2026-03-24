/** Respuesta del instrumento (vacío = sin seleccionar). */
export type EvaluationAnswer = "si" | "parcial" | "no" | "";

export type EvaluationStatus = "draft" | "finalized";

/** Claves de perspectiva alineadas con totales y plantilla. */
export type EvaluationSectionId =
  | "procesosInternos"
  | "aprendizajeCrecimiento"
  | "cliente"
  | "financiera";

export interface EvaluationItem {
  index: number;
  category: string;
  label: string;
  type: string;
  answer: EvaluationAnswer;
  /** Porcentaje 0–100 */
  compliance: number;
  comment: string;
  improvementCommitment: string;
}

export interface EvaluationSection {
  id: EvaluationSectionId;
  title: string;
  items: EvaluationItem[];
}

export interface EvaluationTotals {
  procesosInternos: number;
  aprendizajeCrecimiento: number;
  cliente: number;
  financiera: number;
  final: number;
}

export interface EmployeeInfo {
  name: string;
  position: string;
  area: string;
}

/** Documento persistido en MongoDB (y payload de API). */
export interface EvaluationDocument {
  _id?: string;
  employee: EmployeeInfo;
  /** Fecha en formato ISO (YYYY-MM-DD o completo). */
  date: string;
  status: EvaluationStatus;
  sections: EvaluationSection[];
  totals: EvaluationTotals;
  createdAt?: string;
  updatedAt?: string;
  finalizedAt?: string | null;
}

/** Cuerpo para crear/actualizar desde el cliente sin metadatos de servidor. */
export type EvaluationPayload = Omit<
  EvaluationDocument,
  "_id" | "createdAt" | "updatedAt" | "finalizedAt"
> & {
  _id?: string;
};
