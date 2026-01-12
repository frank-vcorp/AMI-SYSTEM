// Types for MOD-CLINICAS
import type { 
  Clinic, 
  ClinicSchedule, 
  ClinicService, 
  Appointment,
  ClinicStatus,
  AppointmentStatus 
} from '@prisma/client';

// Export Prisma types
export type {
  Clinic,
  ClinicSchedule,
  ClinicService,
  Appointment,
  ClinicStatus,
  AppointmentStatus
};

// Request/Response DTOs
export interface CreateClinicRequest {
  name: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phoneNumber?: string;
  email?: string;
  totalBeds?: number;
  isHeadquarters?: boolean;
}

export interface UpdateClinicRequest extends Partial<CreateClinicRequest> {
  status?: ClinicStatus;
  availableBeds?: number;
}

export interface ClinicResponse extends Clinic {
  schedules: ClinicSchedule[];
  services: ClinicService[];
  appointmentCount?: number;
}

export interface CreateScheduleRequest {
  clinicId: string;
  dayOfWeek: number; // 0-6
  openingTime: string;
  closingTime: string;
  lunchStartTime?: string;
  lunchEndTime?: string;
  isOpen?: boolean;
  maxAppointmentsDay?: number;
}

export interface UpdateScheduleRequest extends Partial<Omit<CreateScheduleRequest, 'clinicId'>> {}

export interface ClinicListFilters {
  tenantId: string;
  status?: ClinicStatus;
  search?: string;
  city?: string;
  page?: number;
  pageSize?: number;
}

export interface ClinicListResponse {
  data: ClinicResponse[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Service errors
export class ClinicNotFoundError extends Error {
  constructor(clinicId: string) {
    super(`Clinic ${clinicId} not found`);
    this.name = 'ClinicNotFoundError';
  }
}

export class ClinicAlreadyExistsError extends Error {
  constructor(name: string, tenantId: string) {
    super(`Clinic "${name}" already exists for tenant ${tenantId}`);
    this.name = 'ClinicAlreadyExistsError';
  }
}

export class InvalidScheduleError extends Error {
  constructor(message: string) {
    super(`Invalid schedule: ${message}`);
    this.name = 'InvalidScheduleError';
  }
}
