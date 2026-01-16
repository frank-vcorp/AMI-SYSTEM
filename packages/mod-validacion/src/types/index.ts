/**
 * MOD-VALIDACION: Type definitions for medical validation workflow
 * Includes: ValidationTask, Semaphores, Extraction, Dictamen
 */

// Core validation task entity
export interface ValidationTask {
  id: string;
  expedientId: string;
  patientId: string;
  clinicId: string;
  tenantId: string;
  status: "PENDING" | "IN_REVIEW" | "COMPLETED" | "SIGNED" | "REJECTED";
  
  // Studies and extracted data
  studies: StudyResult[];
  extractedData: ExtractedDataSet;
  
  // Medical assessment
  medicalOpinion: string;
  verdict: "APTO" | "APTO_CON_RESTRICCIONES" | "NO_APTO";
  restrictions?: string[];
  recommendations?: string[];
  
  // Signature and timeline
  signedAt?: string;
  signedBy?: string;
  validatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// Study reference within validation task
export interface StudyResult {
  id: string;
  fileKey: string;
  fileName: string;
  studyType: "RADIOGRAFIA" | "LABORATORIO" | "ECG" | "ESPIROMETRIA" | "AUDIOMETRIA" | "OTHER";
  uploadedAt: string;
  extractionStatus: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  extractionError?: string;
}

// Extracted data container
export interface ExtractedDataSet {
  laboratorio?: LaboratoryData;
  radiografia?: RadiographyData;
  ecg?: ECGData;
  spirometry?: SpirometryData;
  audiometry?: AudiometryData;
  customFields?: Record<string, any>;
}

// Laboratory results
export interface LaboratoryData {
  hemoglobina?: number; // g/dL
  hematocrito?: number; // %
  glucosa?: number; // mg/dL
  urea?: number; // mg/dL
  creatinina?: number; // mg/dL
  sodio?: number; // mEq/L
  potasio?: number; // mEq/L
  cloruro?: number; // mEq/L
  co2?: number; // mEq/L
  colesterolTotal?: number; // mg/dL
  trigliceridos?: number; // mg/dL
  hdl?: number; // mg/dL
  ldl?: number; // mg/dL
  ast?: number; // U/L
  alt?: number; // U/L
  fa?: number; // U/L (fosfatasa alcalina)
  bilirrubina?: number; // mg/dL
  albumina?: number; // g/dL
  proteinas?: number; // g/dL
}

// Radiology findings
export interface RadiographyData {
  location: string; // "Torax", "Columna", etc.
  findings: string;
  impression: string;
  normalFindings?: boolean;
  abnormalityType?: string; // "Infiltrado", "Derrame", etc.
}

// ECG interpretation
export interface ECGData {
  heartRate?: number; // bpm
  rhythm?: string;
  interpretation?: string;
  abnormalities?: string[];
  normalECG?: boolean;
}

// Spirometry data
export interface SpirometryData {
  fvc?: number; // Forced Vital Capacity (L)
  fev1?: number; // Forced Expiratory Volume in 1 second (L)
  fev1Fvc?: number; // FEV1/FVC ratio %
  pef?: number; // Peak Expiratory Flow (L/min)
  interpretation?: string; // Normal, Obstructive, Restrictive
  severity?: string; // Mild, Moderate, Severe
}

// Audiometry data
export interface AudiometryData {
  leftEar500Hz?: number; // dB
  leftEar1000Hz?: number;
  leftEar2000Hz?: number;
  leftEar3000Hz?: number;
  rightEar500Hz?: number;
  rightEar1000Hz?: number;
  rightEar2000Hz?: number;
  rightEar3000Hz?: number;
  interpretation?: string;
  hearingLoss?: boolean;
}

// Semaphore status for each clinical value
export interface SemaphoreStatus {
  field: string; // "hemoglobina", "sistolica", etc.
  value: number | string | boolean;
  status: "NORMAL" | "WARNING" | "CRITICAL";
  reference: string; // "12-16 g/dL", "< 90 o > 140 mmHg"
  notes?: string;
}

// Complete validation result
export interface ValidationResult {
  taskId: string;
  verdict: "APTO" | "APTO_CON_RESTRICCIONES" | "NO_APTO";
  semaphores: SemaphoreStatus[];
  medicalOpinion: string;
  restrictions?: string[];
  recommendations?: string[];
  signature: {
    dataUrl?: string; // Canvas-based signature
    hash?: string; // Signature hash for verification
    timestamp: string;
    medicalLicense?: string;
  };
}

// Patient summary for validation context
export interface PatientSummary {
  id: string;
  name: string;
  documentType: string;
  documentNumber: string;
  age: number;
  gender: "M" | "F" | "O";
  company?: {
    id: string;
    name: string;
  };
  jobProfile?: {
    id: string;
    title: string;
    riskLevel: "BAJO" | "MEDIO" | "ALTO";
  };
  vitals?: {
    sistolica: number;
    diastolica: number;
    frequenciaCardiaca: number;
    temperaturaCorporal: number;
    presionOxigeno: number;
    imc: number;
  };
}

// Validation session state (for UI)
export interface ValidationSessionState {
  taskId: string;
  currentTab: "pdf" | "data" | "opinion";
  selectedStudy?: StudyResult;
  pdfPage: number;
  editMode: boolean;
  unsavedChanges: boolean;
  extractedDataEdits: Partial<ExtractedDataSet>;
  semaphoreResults: SemaphoreStatus[];
}

// Medical dictionary for quick access
export interface MedicalReference {
  code: string;
  name: string;
  unit: string;
  min: number;
  max: number;
  minWarning?: number;
  maxWarning?: number;
  description: string;
}
