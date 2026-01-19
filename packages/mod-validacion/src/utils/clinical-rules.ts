/**
 * Clinical rules and thresholds for semaphore calculation
 * Based on LEGACY medical criteria and occupational health standards
 */

import { SemaphoreStatus, LaboratoryData } from "../types";

/**
 * Clinical reference ranges and thresholds
 * Color coding: NORMAL (green) → WARNING (yellow) → CRITICAL (red)
 */
export const CLINICAL_RULES = {
  // HEMATOLOGY
  hemoglobina: {
    name: "Hemoglobina",
    unit: "g/dL",
    normal: { min: 12.0, max: 16.0 },
    warning: { min: 10.0, max: 18.0 },
    reference: "12-16 g/dL",
  },
  hematocrito: {
    name: "Hematocrito",
    unit: "%",
    normal: { min: 36, max: 46 },
    warning: { min: 30, max: 52 },
    reference: "36-46%",
  },
  eritrocitos: {
    name: "Eritrocitos",
    unit: "10^6/μL",
    normal: { min: 4.0, max: 5.5 },
    warning: { min: 3.5, max: 6.0 },
    reference: "4-5.5 10^6/μL",
  },

  // GLUCOSE & METABOLISM
  glucosa: {
    name: "Glucosa",
    unit: "mg/dL",
    normal: { min: 70, max: 100 },
    warning: { min: 60, max: 150 },
    reference: "70-100 mg/dL",
  },
  glucosaAyunas: {
    name: "Glucosa en Ayunas",
    unit: "mg/dL",
    normal: { min: 70, max: 99 },
    warning: { min: 60, max: 126 },
    reference: "70-99 mg/dL",
  },

  // KIDNEY FUNCTION
  creatinina: {
    name: "Creatinina",
    unit: "mg/dL",
    normal: { min: 0.7, max: 1.3 },
    warning: { min: 0.5, max: 2.0 },
    reference: "0.7-1.3 mg/dL",
  },
  urea: {
    name: "Urea",
    unit: "mg/dL",
    normal: { min: 10, max: 50 },
    warning: { min: 8, max: 100 },
    reference: "10-50 mg/dL",
  },
  bun: {
    name: "BUN (Nitrógeno Ureico)",
    unit: "mg/dL",
    normal: { min: 7, max: 20 },
    warning: { min: 5, max: 50 },
    reference: "7-20 mg/dL",
  },

  // ELECTROLYTES
  sodio: {
    name: "Sodio",
    unit: "mEq/L",
    normal: { min: 136, max: 145 },
    warning: { min: 130, max: 150 },
    reference: "136-145 mEq/L",
  },
  potasio: {
    name: "Potasio",
    unit: "mEq/L",
    normal: { min: 3.5, max: 5.0 },
    warning: { min: 3.0, max: 5.5 },
    reference: "3.5-5.0 mEq/L",
  },
  cloruro: {
    name: "Cloro",
    unit: "mEq/L",
    normal: { min: 98, max: 107 },
    warning: { min: 95, max: 110 },
    reference: "98-107 mEq/L",
  },
  co2: {
    name: "CO2 Sérico",
    unit: "mEq/L",
    normal: { min: 23, max: 29 },
    warning: { min: 20, max: 32 },
    reference: "23-29 mEq/L",
  },

  // LIPID PROFILE
  colesterolTotal: {
    name: "Colesterol Total",
    unit: "mg/dL",
    normal: { min: 0, max: 200 },
    warning: { min: 0, max: 240 },
    reference: "< 200 mg/dL",
  },
  trigliceridos: {
    name: "Triglicéridos",
    unit: "mg/dL",
    normal: { min: 0, max: 150 },
    warning: { min: 0, max: 200 },
    reference: "< 150 mg/dL",
  },
  hdl: {
    name: "HDL",
    unit: "mg/dL",
    normal: { min: 40, max: 999 },
    warning: { min: 35, max: 999 },
    reference: "> 40 mg/dL",
  },
  ldl: {
    name: "LDL",
    unit: "mg/dL",
    normal: { min: 0, max: 130 },
    warning: { min: 0, max: 160 },
    reference: "< 130 mg/dL",
  },

  // LIVER FUNCTION
  ast: {
    name: "AST (GOT)",
    unit: "U/L",
    normal: { min: 7, max: 40 },
    warning: { min: 5, max: 100 },
    reference: "7-40 U/L",
  },
  alt: {
    name: "ALT (GPT)",
    unit: "U/L",
    normal: { min: 7, max: 40 },
    warning: { min: 5, max: 100 },
    reference: "7-40 U/L",
  },
  fa: {
    name: "Fosfatasa Alcalina",
    unit: "U/L",
    normal: { min: 30, max: 120 },
    warning: { min: 25, max: 150 },
    reference: "30-120 U/L",
  },
  bilirrubina: {
    name: "Bilirrubina Total",
    unit: "mg/dL",
    normal: { min: 0.1, max: 1.2 },
    warning: { min: 0.1, max: 2.0 },
    reference: "0.1-1.2 mg/dL",
  },

  // PROTEINS
  albumina: {
    name: "Albúmina",
    unit: "g/dL",
    normal: { min: 3.5, max: 5.0 },
    warning: { min: 3.0, max: 5.5 },
    reference: "3.5-5.0 g/dL",
  },
  proteinasTotal: {
    name: "Proteínas Totales",
    unit: "g/dL",
    normal: { min: 6.0, max: 8.3 },
    warning: { min: 5.5, max: 8.8 },
    reference: "6.0-8.3 g/dL",
  },

  // BLOOD PRESSURE (mmHg)
  sistolica: {
    name: "Presión Sistólica",
    unit: "mmHg",
    normal: { min: 90, max: 120 },
    warning: { min: 85, max: 140 },
    critical: { min: 0, max: 85, minHigh: 160 },
    reference: "90-120 mmHg",
  },
  diastolica: {
    name: "Presión Diastólica",
    unit: "mmHg",
    normal: { min: 60, max: 80 },
    warning: { min: 55, max: 90 },
    critical: { min: 0, max: 55, minHigh: 100 },
    reference: "60-80 mmHg",
  },

  // HEART RATE
  frequenciaCardiaca: {
    name: "Frecuencia Cardíaca",
    unit: "bpm",
    normal: { min: 60, max: 100 },
    warning: { min: 50, max: 110 },
    reference: "60-100 bpm",
  },

  // RESPIRATION
  frecuenciaRespiratoria: {
    name: "Frecuencia Respiratoria",
    unit: "resp/min",
    normal: { min: 12, max: 20 },
    warning: { min: 10, max: 25 },
    reference: "12-20 resp/min",
  },

  // OXYGEN SATURATION
  sat02: {
    name: "Saturación O2",
    unit: "%",
    normal: { min: 95, max: 100 },
    warning: { min: 92, max: 100 },
    critical: { min: 85, max: 91 },
    reference: "> 95%",
  },

  // BODY MEASUREMENTS
  imc: {
    name: "Índice de Masa Corporal",
    unit: "kg/m²",
    normal: { min: 18.5, max: 24.9 },
    warning: { min: 17.0, max: 29.9 },
    reference: "18.5-24.9 kg/m²",
  },

  // PULMONARY FUNCTION
  fvc: {
    name: "Capacidad Vital Forzada",
    unit: "L",
    normal: { min: 3.0, max: 5.5 },
    warning: { min: 2.5, max: 6.0 },
    reference: "3.0-5.5 L",
  },
  fev1: {
    name: "Volumen Espirado Forzado en 1 seg",
    unit: "L",
    normal: { min: 2.5, max: 4.5 },
    warning: { min: 2.0, max: 5.0 },
    reference: "2.5-4.5 L",
  },
  fev1Fvc: {
    name: "FEV1/FVC Ratio",
    unit: "%",
    normal: { min: 70, max: 100 },
    warning: { min: 65, max: 100 },
    reference: "> 70%",
  },
  pef: {
    name: "Peak Expiratory Flow",
    unit: "L/min",
    normal: { min: 400, max: 700 },
    warning: { min: 350, max: 750 },
    reference: "400-700 L/min",
  },
};

/**
 * Determine semaphore status based on value and clinical rules
 */
export function getSemaphoreStatus(
  field: string,
  value: number
): SemaphoreStatus {
  const rule = CLINICAL_RULES[field as keyof typeof CLINICAL_RULES];

  if (!rule) {
    return {
      field,
      value,
      status: "NORMAL",
      reference: "Unknown reference",
    };
  }

  let status: "NORMAL" | "WARNING" | "CRITICAL" = "NORMAL";

  // Check critical first
  if ("critical" in rule && rule.critical) {
    const crit = rule.critical as any;
    if (
      (crit.min !== undefined && value < crit.min) ||
      (crit.minHigh !== undefined && value > crit.minHigh)
    ) {
      status = "CRITICAL";
    }
  }

  // Check warning
  if (status === "NORMAL" && "warning" in rule) {
    const warn = rule.warning as any;
    if (
      (warn.min !== undefined && value < warn.min) ||
      (warn.max !== undefined && value > warn.max)
    ) {
      status = "WARNING";
    }
  }

  // Check normal
  if (status === "NORMAL" && "normal" in rule) {
    const norm = rule.normal as any;
    if (
      (norm.min !== undefined && value < norm.min) ||
      (norm.max !== undefined && value > norm.max)
    ) {
      status = "WARNING"; // Out of normal range but not critical
    }
  }

  return {
    field,
    value,
    status,
    reference: rule.reference as string,
  };
}

/**
 * Calculate semaphores from extracted laboratory data
 */
export function calculateSemaphoresFromLab(
  labData: LaboratoryData
): SemaphoreStatus[] {
  const semaphores: SemaphoreStatus[] = [];

  Object.entries(labData).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      semaphores.push(getSemaphoreStatus(key, value as number));
    }
  });

  return semaphores;
}

/**
 * Suggest medical verdict based on semaphores
 * Returns: APTO | APTO_CON_RESTRICCIONES | NO_APTO
 */
export function suggestVerdictBySemaphores(
  semaphores: SemaphoreStatus[],
  jobRiskLevel?: "BAJO" | "MEDIO" | "ALTO"
): "APTO" | "APTO_CON_RESTRICCIONES" | "NO_APTO" {
  const criticalCount = semaphores.filter((s) => s.status === "CRITICAL").length;
  const warningCount = semaphores.filter((s) => s.status === "WARNING").length;

  // Critical findings → NO_APTO
  if (criticalCount > 0) {
    return "NO_APTO";
  }

  // Multiple warnings + high risk job → NO_APTO or RESTRICCIONES
  if (warningCount >= 3 && jobRiskLevel === "ALTO") {
    return "NO_APTO";
  }

  // Some warnings → RESTRICCIONES
  if (warningCount > 0) {
    return "APTO_CON_RESTRICCIONES";
  }

  // All normal → APTO
  return "APTO";
}

/**
 * Get color code for semaphore UI display
 */
export function getSemaphoreColor(status: "NORMAL" | "WARNING" | "CRITICAL"): string {
  switch (status) {
    case "NORMAL":
      return "#10b981"; // green-500
    case "WARNING":
      return "#f59e0b"; // amber-500
    case "CRITICAL":
      return "#ef4444"; // red-500
    default:
      return "#6b7280"; // gray-500
  }
}

/**
 * Get human-readable description for semaphore
 */
export function getSemaphoreDescription(semaphore: SemaphoreStatus): string {
  const rule = CLINICAL_RULES[semaphore.field as keyof typeof CLINICAL_RULES];
  const name = rule?.name || semaphore.field;
  const unit = rule?.unit || "";

  switch (semaphore.status) {
    case "NORMAL":
      return `${name} dentro de rango normal (${semaphore.value} ${unit})`;
    case "WARNING":
      return `⚠️ ${name} fuera de rango normal (${semaphore.value} ${unit}). Referencia: ${semaphore.reference}`;
    case "CRITICAL":
      return `🚨 ${name} en nivel crítico (${semaphore.value} ${unit}). Requiere atención médica inmediata.`;
    default:
      return `${name}: ${semaphore.value} ${unit}`;
  }
}
