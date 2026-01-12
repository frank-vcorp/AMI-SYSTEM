// Types for MOD-CITAS
// Nota: Prisma client será generado cuando se configure la BD
// Por ahora usamos tipos primitivos para desarrollo

// Mock types para desarrollo (remover cuando Prisma esté configurado)
export enum AppointmentStatus {
  PENDING = 'PENDING',
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  CHECK_IN = 'CHECK_IN',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW'
}

export type Appointment = {
  id: string;
  tenantId: string;
  clinicId: string;
  appointmentDate: Date | string;
  appointmentTime: string;
  employeeId: string;
  companyId: string;
  status: AppointmentStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  appointmentServices?: any[];
  clinic?: any;
  company?: any;
};

// Request/Response DTOs
export interface CreateAppointmentRequest {
  clinicId: string;
  employeeId: string;        // Empleado / Paciente
  companyId: string;         // Empresa contratante
  appointmentDate: string;   // ISO 8601 date string (YYYY-MM-DD)
  appointmentTime: string;   // HH:MM format
  serviceIds: string[];      // Servicios/Baterías a realizar
  notes?: string;
  createdBy?: string;
}

export interface UpdateAppointmentRequest {
  appointmentDate?: string;  // ISO 8601 date string (YYYY-MM-DD)
  appointmentTime?: string;
  serviceIds?: string[];
  notes?: string;
  status?: AppointmentStatus;
}

/**
 * HTTP Response DTO for Appointment
 * Dates are serialized as ISO 8601 strings for JSON transport
 * This is separate from Appointment (Prisma) which uses DateTime
 */
export interface AppointmentResponse {
  id: string;
  tenantId: string;
  clinicId: string;
  employeeId: string;
  companyId: string;
  appointmentDate: string;   // ISO 8601 date string (YYYY-MM-DD)
  appointmentTime: string;
  status: AppointmentStatus;
  notes: string | null;
  createdAt: string;         // ISO 8601 timestamp
  updatedAt: string;         // ISO 8601 timestamp
  // Optional enriched fields
  clinicName?: string;
  employeeName?: string;
  companyName?: string;
  serviceName?: string;
}

export interface AppointmentListResponse {
  data: AppointmentResponse[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AppointmentListFilters {
  tenantId: string;
  clinicId?: string;
  companyId?: string;
  employeeId?: string;
  status?: AppointmentStatus;
  dateFrom?: string;         // ISO 8601 date string (YYYY-MM-DD)
  dateTo?: string;           // ISO 8601 date string (YYYY-MM-DD)
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface AvailabilitySlot {
  clinicId: string;
  date: string;              // ISO 8601 date string (YYYY-MM-DD)
  time: string;
  durationMin: number;
  available: boolean;
}

export interface AvailabilityRequest {
  clinicId: string;
  dateFrom: string;          // ISO 8601 date string (YYYY-MM-DD)
  dateTo: string;            // ISO 8601 date string (YYYY-MM-DD)
  serviceIds: string[];
  durationMin: number;
}

// Errors
export class AppointmentNotFoundError extends Error {
  constructor(id: string) {
    super(`Appointment not found: ${id}`);
    this.name = 'AppointmentNotFoundError';
  }
}

export class AppointmentConflictError extends Error {
  constructor(clinicId: string, time: string) {
    super(`No availability at clinic ${clinicId} at ${time}`);
    this.name = 'AppointmentConflictError';
  }
}

export class ClinicNotAvailableError extends Error {
  constructor(clinicId: string, dateOrString: Date | string) {
    const dateStr = typeof dateOrString === 'string' 
      ? dateOrString 
      : dateOrString.toISOString().split('T')[0];
    super(`Clinic ${clinicId} is not available on ${dateStr}`);
    this.name = 'ClinicNotAvailableError';
  }
}

export class InvalidAppointmentError extends Error {
  constructor(message: string) {
    super(`Invalid appointment: ${message}`);
    this.name = 'InvalidAppointmentError';
  }
}
