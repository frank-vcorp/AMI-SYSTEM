/**
 * Validation utilities for MOD-VALIDACION
 * Ensures data integrity before signing
 */

import {
  ValidationTask,
  LaboratoryData,
  ExtractedDataSet,
  PatientSummary,
} from "../types";

/**
 * Validation result with errors and warnings
 */
export interface ValidationCheckResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate a complete validation task before signing
 */
export function validateTaskBeforeSigning(
  task: ValidationTask
): ValidationCheckResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required fields
  if (!task.id) errors.push("Task ID is missing");
  if (!task.expedientId) errors.push("Expedient ID is missing");
  if (!task.patientId) errors.push("Patient ID is missing");
  if (!task.studies || task.studies.length === 0) {
    errors.push("No studies attached to this task");
  }

  // Check medical assessment
  if (!task.medicalOpinion || task.medicalOpinion.trim().length < 10) {
    errors.push("Medical opinion is required and must be at least 10 characters");
  }

  if (!task.verdict) {
    errors.push("Verdict (APTO/RESTRICCIONES/NO_APTO) is required");
  }

  // Check restrictions if verdict requires them
  if (
    task.verdict === "APTO_CON_RESTRICCIONES" &&
    (!task.restrictions || task.restrictions.length === 0)
  ) {
    errors.push(
      "At least one restriction must be specified for 'APTO_CON_RESTRICCIONES' verdict"
    );
  }

  // Check extracted data
  if (!task.extractedData || Object.keys(task.extractedData).length === 0) {
    warnings.push("No extracted data found - verification data may be incomplete");
  }

  // Validate extracted lab data if present
  if (task.extractedData?.laboratorio) {
    const labErrors = validateLaboratoryData(task.extractedData.laboratorio);
    if (labErrors.length > 0) {
      warnings.push(
        `Laboratory data issues: ${labErrors.join("; ")}`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate laboratory data for consistency
 */
export function validateLaboratoryData(
  labData: LaboratoryData
): string[] {
  const errors: string[] = [];

  // Hemoglobin out of biological range
  if (labData.hemoglobina && (labData.hemoglobina < 5 || labData.hemoglobina > 20)) {
    errors.push(
      `Hemoglobin value ${labData.hemoglobina} is biologically implausible`
    );
  }

  // Glucose out of possible range
  if (labData.glucosa && (labData.glucosa < 20 || labData.glucosa > 600)) {
    errors.push(
      `Glucose value ${labData.glucosa} is biologically implausible`
    );
  }

  // Creatinine out of possible range
  if (labData.creatinina && (labData.creatinina < 0.2 || labData.creatinina > 10)) {
    errors.push(
      `Creatinine value ${labData.creatinina} is biologically implausible`
    );
  }

  // Blood sodium/potassium consistency
  if (
    labData.sodio &&
    labData.potasio &&
    Math.abs(labData.sodio - labData.potasio) > 120
  ) {
    errors.push(
      "Sodium/Potassium ratio seems incorrect - verify extraction"
    );
  }

  // Liver enzymes
  if (
    labData.ast &&
    labData.alt &&
    Math.abs(labData.ast - labData.alt) > 500
  ) {
    errors.push(
      "AST/ALT difference is unusually large - verify extraction"
    );
  }

  // Lipid profile
  if (
    labData.colesterolTotal &&
    labData.ldl &&
    labData.colesterolTotal < labData.ldl
  ) {
    errors.push("Total cholesterol cannot be less than LDL - verify extraction");
  }

  return errors;
}

/**
 * Validate extracted data set for completeness
 */
export function validateExtractedDataCompleteness(
  data: ExtractedDataSet
): ValidationCheckResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const hasLab = data.laboratorio && Object.keys(data.laboratorio).length > 0;
  const hasRadio = data.radiografia && Object.keys(data.radiografia).length > 0;
  const hasECG = data.ecg && Object.keys(data.ecg).length > 0;
  const hasSpiro = data.spirometry && Object.keys(data.spirometry).length > 0;
  const hasAudio = data.audiometry && Object.keys(data.audiometry).length > 0;

  if (!hasLab && !hasRadio && !hasECG && !hasSpiro && !hasAudio) {
    errors.push("No extracted data available for any study type");
  }

  if (hasLab) {
    const labErrors = validateLaboratoryData(data.laboratorio!);
    warnings.push(...labErrors);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate patient summary for completeness
 */
export function validatePatientSummary(
  patient: PatientSummary
): ValidationCheckResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!patient.id) errors.push("Patient ID is missing");
  if (!patient.name) errors.push("Patient name is missing");
  if (!patient.documentId) errors.push("Patient document number is missing");
  if (!patient.age || patient.age < 16 || patient.age > 120) {
    warnings.push("Patient age seems unusual - verify data");
  }
  if (!patient.gender) warnings.push("Patient gender not specified");

  if (patient.vitals) {
    if (
      patient.vitals.sistolica < 50 ||
      patient.vitals.sistolica > 250
    ) {
      warnings.push(
        `Systolic pressure ${patient.vitals.sistolica} seems unusual`
      );
    }
    if (
      patient.vitals.diastolica < 30 ||
      patient.vitals.diastolica > 150
    ) {
      warnings.push(
        `Diastolic pressure ${patient.vitals.diastolica} seems unusual`
      );
    }
    if (patient.vitals.imc < 10 || patient.vitals.imc > 80) {
      warnings.push(`BMI ${patient.vitals.imc} seems unusual`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Check for mandatory fields based on job risk level
 */
export function checkMandatoryStudiesByRiskLevel(
  riskLevel: "BAJO" | "MEDIO" | "ALTO",
  studyTypes: string[]
): ValidationCheckResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const requiredStudies = {
    BAJO: ["laboratorio"], // Minimum lab work
    MEDIO: ["laboratorio", "radiografia"], // Lab + X-ray
    ALTO: ["laboratorio", "radiografia", "ecg", "espirometria"], // Full workup
  };

  const required = requiredStudies[riskLevel];
  const missing = required.filter((study) => !studyTypes.includes(study));

  if (missing.length > 0) {
    errors.push(
      `Missing mandatory studies for ${riskLevel} risk level: ${missing.join(", ")}`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate medical opinion text
 */
export function validateMedicalOpinion(opinion: string): ValidationCheckResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!opinion || opinion.trim().length === 0) {
    errors.push("Medical opinion cannot be empty");
  } else if (opinion.trim().length < 20) {
    errors.push("Medical opinion must be at least 20 characters");
  } else if (opinion.trim().length > 5000) {
    errors.push("Medical opinion cannot exceed 5000 characters");
  }

  // Check for common medical keywords
  const keywords = [
    "laboratorio",
    "radiografia",
    "normal",
    "anormal",
    "hallazgo",
    "restricción",
    "recomendación",
  ];
  const hasKeywords = keywords.some((kw) =>
    opinion.toLowerCase().includes(kw)
  );

  if (!hasKeywords) {
    warnings.push(
      "Medical opinion appears to lack clinical terminology - verify content"
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Run all validations before signing
 */
export function runAllValidationsBeforeSigning(
  task: ValidationTask,
  patient: PatientSummary
): ValidationCheckResult {
  const taskValidation = validateTaskBeforeSigning(task);
  const patientValidation = validatePatientSummary(patient);
  const extractedValidation = validateExtractedDataCompleteness(
    task.extractedData
  );
  const opinionValidation = validateMedicalOpinion(task.medicalOpinion);

  const allErrors = [
    ...taskValidation.errors,
    ...patientValidation.errors,
    ...extractedValidation.errors,
    ...opinionValidation.errors,
  ];

  const allWarnings = [
    ...taskValidation.warnings,
    ...patientValidation.warnings,
    ...extractedValidation.warnings,
    ...opinionValidation.warnings,
  ];

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  };
}
