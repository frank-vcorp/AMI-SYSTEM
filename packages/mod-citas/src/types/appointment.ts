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
  patientId: string;         // Changed from employeeId for consistency
  appointmentDate: Date | string;
  time: string;              // Changed from appointmentTime (database field name)
  companyId?: string;        // Optional company association
  status: AppointmentStatus;
  notes: string | null;
  displayId?: string;        // Generated display ID (e.g., APT-XXXXXX)
  appointmentDuration?: number; // Minutes allocated
  createdAt: Date;
  updatedAt: Date;
  appointmentServices?: any[];
  clinic?: any;
  patient?: any;
  company?: any;
};

// Request/Response DTOs
export interface CreateAppointmentRequest {
  clinicId: string;
  patientId: string;         // Changed from employeeId - references Patient
  companyId?: string;        // Optional company association
  appointmentDate: string;   // ISO 8601 date string (YYYY-MM-DD)
  appointmentTime: string;   // HH:MM format - required field
  serviceIds?: string[];     // Optional services/batteries
  notes?: string;
  createdBy?: string;
  employeeId?: string;       // Deprecated - for backwards compatibility
  time?: string;             // Alternative field name
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
  patientId: string;         // Changed from employeeId
  companyId?: string;
  displayId?: string;        // Generated display ID
  appointmentDate: string;   // ISO 8601 date string (YYYY-MM-DD)
  time: string;              // HH:MM format - stored as 'time' in DB
  appointmentTime?: string;  // Alias for backwards compatibility
  appointmentDuration?: number; // Minutes allocated
  status: AppointmentStatus;
  notes: string | null;
  serviceIds?: string[];     // Optional services/batteries
  createdAt: string;         // ISO 8601 timestamp
  updatedAt: string;         // ISO 8601 timestamp
  // Optional enriched fields
  clinic?: { id: string; name: string; address?: string };
  patient?: { id: string; name: string; documentNumber?: string };
  company?: { id: string; name: string };
  // Deprecated fields for backwards compatibility
  employeeId?: string;
  clinicName?: string;
  employeeName?: string;
  companyName?: string;
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
