/**
 * Index - Export all components and utilities
 */

// Components
export { ValidationPanel } from "./components/ValidationPanel";
export { PDFViewer } from "./components/PDFViewer";
export { ExtractionResults } from "./components/ExtractionResults";
export { SemaphoreIndicators } from "./components/SemaphoreIndicators";
export { ValidationForm } from "./components/ValidationForm";

// Types
export type {
  ValidationTask,
  StudyResult,
  ExtractedDataSet,
  LaboratoryData,
  RadiographyData,
  ECGData,
  SpirometryData,
  AudiometryData,
  SemaphoreStatus,
  ValidationResult,
  PatientSummary,
  ValidationSessionState,
  MedicalReference,
} from "./types";

// Clinical utilities
export {
  CLINICAL_RULES,
  getSemaphoreStatus,
  calculateSemaphoresFromLab,
  suggestVerdictBySemaphores,
  getSemaphoreColor,
  getSemaphoreDescription,
} from "./utils/clinical-rules";

// Validators
export {
  validateTaskBeforeSigning,
  validateLaboratoryData,
  validateExtractedDataCompleteness,
  validatePatientSummary,
  checkMandatoryStudiesByRiskLevel,
  validateMedicalOpinion,
  runAllValidationsBeforeSigning,
} from "./utils/validators";

export type { ValidationCheckResult } from "./utils/validators";
export { ValidatorSideBySide } from "./components/ValidatorSideBySide";
