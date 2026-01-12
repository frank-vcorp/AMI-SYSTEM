// Types for MOD-CITAS
import type {
  Appointment as PrismaAppointment,
} from '@ami/core';

import { AppointmentStatus } from '@ami/core';

// Export Prisma types
export type Appointment = PrismaAppointment;
export { AppointmentStatus };

// Request/Response DTOs
export interface CreateAppointmentRequest {
  clinicId: string;
  employeeId: string;        // Empleado / Paciente
  companyId: string;         // Empresa contratante
  appointmentDate: Date;
  appointmentTime: string;   // HH:MM format
  serviceIds: string[];      // Servicios/Baterías a realizar
  notes?: string;
  createdBy?: string;
}

export interface UpdateAppointmentRequest {
  appointmentDate?: Date;
  appointmentTime?: string;
  serviceIds?: string[];
  notes?: string;
  status?: AppointmentStatus;
}

export interface AppointmentResponse extends Appointment {
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
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface AvailabilitySlot {
  clinicId: string;
  date: Date;
  time: string;
  durationMin: number;
  available: boolean;
}

export interface AvailabilityRequest {
  clinicId: string;
  dateFrom: Date;
  dateTo: Date;
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
  constructor(clinicId: string, date: Date) {
    super(`Clinic ${clinicId} is not available on ${date.toISOString().split('T')[0]}`);
    this.name = 'ClinicNotAvailableError';
  }
}

export class InvalidAppointmentError extends Error {
  constructor(message: string) {
    super(`Invalid appointment: ${message}`);
    this.name = 'InvalidAppointmentError';
  }
}
