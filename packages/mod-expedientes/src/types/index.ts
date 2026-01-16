/**
 * MOD-EXPEDIENTES Types
 * Type definitions for medical records management
 */

export interface CreatePatientDTO {
  name: string;
  email: string;
  phone: string;
  birthDate: string; // ISO format
  gender: "MASCULINO" | "FEMENINO" | "OTRO";
  documentId: string;
}

export interface PatientDTO extends CreatePatientDTO {
  id: string;
  status: "ACTIVE" | "INACTIVE" | "ARCHIVED";
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpedientDTO {
  patientId: string;
  clinicId: string;
  companyId?: string;
  notes?: string;
}

export interface ExpedientDTO {
  id: string;
  patientId: string;
  clinicId: string;
  companyId?: string;
  status: "DRAFT" | "IN_PROGRESS" | "COMPLETED" | "SIGNED" | "DELIVERED";
  notes?: string;
  createdAt: string;
  updatedAt: string;
  patient?: PatientDTO;
  medicalExams?: MedicalExamDTO[];
  studies?: StudyUploadDTO[];
}

export interface CreateMedicalExamDTO {
  bloodPressure?: string; // e.g., "120/80"
  heartRate?: number;
  respiratoryRate?: number;
  temperature?: number;
  weight?: number;
  height?: number;
  physicalExam?: string;
  notes?: string;
}

export interface MedicalExamDTO extends CreateMedicalExamDTO {
  id: string;
  expedientId: string;
  examinedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudyUploadDTO {
  id: string;
  expedientId: string;
  type: StudyType;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSizeBytes: number;
  uploadedAt: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  createdAt: string;
}

export type StudyType =
  | "RADIOGRAPHY"
  | "LABORATORY"
  | "CARDIOGRAM"
  | "ULTRASOUND"
  | "TOMOGRAPHY"
  | "RESONANCE"
  | "ENDOSCOPY"
  | "OTHER";

export interface ListExpedientsQuery {
  tenantId: string;
  limit?: number;
  offset?: number;
  status?: string;
  patientId?: string;
  companyId?: string;
}

export interface VitalSignsValidation {
  isValid: boolean;
  errors: string[];
}
