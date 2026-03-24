import type { EvaluationItem, EvaluationSection, EvaluationSectionId } from "@/types/evaluation";

/** Definición de ítem en plantilla (sin respuestas). */
export interface TemplateItemDef {
  category: string;
  label: string;
  type: string;
}

export interface TemplateSectionDef {
  id: EvaluationSectionId;
  title: string;
  items: TemplateItemDef[];
}

/**
 * Plantilla configurable del instrumento INNOVA.
 * Las vistas consumen esto vía buildEmptySections(); no hardcodear preguntas en JSX.
 */
export const EVALUATION_TEMPLATE: TemplateSectionDef[] = [
  {
    id: "procesosInternos",
    title: "Perspectiva de Procesos Internos",
    items: [
      {
        category: "Gestión de Riesgos y Cumplimiento",
        label:
          "Firma del contrato legal y contrato de confidencialidad (NDA)",
        type: "Cumplimiento",
      },
      {
        category: "Gestión Cumplimiento de Estandarización",
        label:
          "Utiliza correctamente las herramientas de comunicación de la empresa",
        type: "Cumplimiento",
      },
      {
        category: "Gestión Cumplimiento de Estandarización",
        label:
          "Registro de Actividades en tiempo y forma en Time Track INNOVA",
        type: "Cumplimiento",
      },
      {
        category: "Gestión Cumplimiento de Estandarización",
        label:
          "Cumplimiento de estándares y atención a requerimientos internos",
        type: "Cumplimiento",
      },
    ],
  },
  {
    id: "aprendizajeCrecimiento",
    title: "Perspectiva de Aprendizaje y Crecimiento",
    items: [
      {
        category:
          "Comunicación, Comportamiento, Iniciativa y Proactividad",
        label:
          "Comunica y transmite con claridad información a sus superiores y clientes",
        type: "Competencia",
      },
      {
        category:
          "Comunicación, Comportamiento, Iniciativa y Proactividad",
        label:
          "Registra asistencia, puntualidad y cumplimiento de jornada de trabajo",
        type: "Cumplimiento",
      },
      {
        category:
          "Comunicación, Comportamiento, Iniciativa y Proactividad",
        label:
          "Cumplimiento de las políticas internas / externas & valores de la empresa",
        type: "Cumplimiento",
      },
      {
        category:
          "Desarrollo de Competencias, Trabajo en equipo & Mentoría",
        label:
          "Cursos atendidos y certificados obtenidos en RAU y/o PU",
        type: "Desarrollo",
      },
      {
        category:
          "Desarrollo de Competencias, Trabajo en equipo & Mentoría",
        label:
          "Habilidad y compromiso de trabajo en equipo y dar mentoría a otros",
        type: "Competencia",
      },
    ],
  },
  {
    id: "cliente",
    title: "Perspectiva del Cliente (Valor y Servicio)",
    items: [
      {
        category: "Retención / Fidelidad / Nivel de servicio (SLA)",
        label:
          "Clientes recurrentes asociados a su atención y cumplimiento de expectativas",
        type: "Servicio",
      },
      {
        category:
          "Calidad Percibida, Cumplimiento & Satisfacción del Cliente (CSAT)",
        label: "Calidad del producto o servicio desde la perspectiva del cliente",
        type: "Calidad",
      },
      {
        category: "Quejas, Inconformidad y/o Tiempo Perdido en Proyectos",
        label:
          "Quejas y/o desviaciones a las expectativas del cliente",
        type: "Gestión",
      },
      {
        category: "Desarrollo de Proyectos",
        label:
          "Cumplimiento de alcance, en tiempo y presupuesto del cliente",
        type: "Proyecto",
      },
    ],
  },
  {
    id: "financiera",
    title: "Perspectiva Financiera (Resultados Económicos)",
    items: [
      {
        category: "Productividad",
        label: "Volumen de trabajo realizado en relación con el tiempo",
        type: "Productividad",
      },
      {
        category: "Presupuestos",
        label:
          "Cumplimiento de presupuesto y cuotas de tiempos de proyectos",
        type: "Presupuesto",
      },
      {
        category: "Presupuestos",
        label:
          "Reducción de costos operativos y optimización del uso de recursos",
        type: "Eficiencia",
      },
      {
        category: "Rentabilidad",
        label: "Contribución específica de rentabilidad",
        type: "Resultado",
      },
    ],
  },
];

function emptyItem(index: number, def: TemplateItemDef): EvaluationItem {
  return {
    index,
    category: def.category,
    label: def.label,
    type: def.type,
    answer: "",
    compliance: 0,
    comment: "",
    improvementCommitment: "",
  };
}

/** Clona la plantilla en secciones con ítems listos para capturar. */
export function buildEmptySections(): EvaluationSection[] {
  return EVALUATION_TEMPLATE.map((sec) => ({
    id: sec.id,
    title: sec.title,
    items: sec.items.map((def, i) => emptyItem(i + 1, def)),
  }));
}
