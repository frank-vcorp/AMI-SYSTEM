/**
 * MOD-REPORTES Types
 * 
 * Tipos para la generación de reportes y certificados de validación
 */

export interface ReportTemplate {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

export interface CertificateData {
  expedientId: string;
  patientName: string;
  patientDOB: string;
  clinicName: string;
  validatorName: string;
  validationDate: string;
  status: 'APPROVED' | 'REJECTED' | 'CONDITIONAL';
  medicalFindings?: string;
  signature?: string;
  stampDate: string;
}

export interface PDFExportOptions {
  format: 'A4' | 'LETTER';
  includeImages: boolean;
  includeSignature: boolean;
}

export interface ReportFilter {
  startDate?: Date;
  endDate?: Date;
  status?: 'APPROVED' | 'REJECTED' | 'PENDING';
  clinicId?: string;
}
