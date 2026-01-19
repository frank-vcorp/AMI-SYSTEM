// Types for MOD-CLINICAS

// Basic Clinic types
export enum ClinicStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
}

// Schedule types
export interface ClinicSchedule {
  id: string;
  clinicId: string;
  dayOfWeek: number;
  openingTime: string;
  closingTime: string;
  lunchStartTime: string | null;
  lunchEndTime: string | null;
}

export interface ClinicService {
  id: string;
  clinicId: string;
  name: string;
  description?: string;
}

export interface Appointment {
  id: string;
  clinicId: string;
  date: Date;
  time: string;
}

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

export interface ClinicResponse {
  id: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phoneNumber?: string;
  email?: string;
  totalBeds?: number;
  availableBeds?: number;
  isHeadquarters?: boolean;
  status?: ClinicStatus;
  schedules: ClinicSchedule[];
  services: ClinicService[];
  appointmentCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
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
