/**
 * PRISMA MOCK TYPES
 * Estos tipos se usan durante desarrollo hasta que Prisma esté configurado.
 * Cuando se configure la base de datos, remover este archivo y usar @prisma/client directamente.
 */

// Enums
export enum ClinicStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  MAINTENANCE = 'MAINTENANCE'
}

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

export enum CompanyStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED'
}

export enum ServiceStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DEPRECATED = 'DEPRECATED'
}

export enum ServiceType {
  LABORATORIO = 'LABORATORIO',
  IMAGEN = 'IMAGEN',
  CONSULTA = 'CONSULTA',
  PROCEDIMIENTO = 'PROCEDIMIENTO'
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// Types
export interface Clinic {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phoneNumber: string | null;
  email: string | null;
  latitude: number | null;
  longitude: number | null;
  totalBeds: number;
  availableBeds: number;
  isHeadquarters: boolean;
  status: ClinicStatus;
  createdAt: Date;
  updatedAt: Date;
  schedules?: ClinicSchedule[];
  services?: ClinicService[];
  _count?: {
    appointmentSlots?: number;
    appointments?: number;
    [key: string]: number | undefined;
  };
}

export interface ClinicSchedule {
  id: string;
  clinicId: string;
  dayOfWeek: number;
  openingTime: string;
  closingTime: string;
  lunchStartTime: string | null;
  lunchEndTime: string | null;
  isActive: boolean;
  maxAppointmentsPerDay: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClinicService {
  id: string;
  clinicId: string;
  serviceId: string;
  isAvailable: boolean;
  customPrice: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Appointment {
  id: string;
  tenantId: string;
  clinicId: string;
  employeeId: string;
  companyId: string;
  appointmentDate: Date;
  appointmentTime: string;
  status: AppointmentStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  clinic?: Clinic;
  company?: Company;
  appointmentServices?: AppointmentService[];
}

export interface AppointmentService {
  id: string;
  appointmentId: string;
  serviceId: string;
  status: string;
  result: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Company {
  id: string;
  tenantId: string;
  name: string;
  rfc: string | null;
  description: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  phoneNumber: string | null;
  email: string | null;
  contactPerson: string | null;
  contactPhone: string | null;
  isHeadquarters: boolean;
  maxEmployees: number;
  status: CompanyStatus;
  createdAt: Date;
  updatedAt: Date;
  batteries?: CompanyBattery[];
  jobProfiles?: JobProfile[];
}

export interface CompanyBattery {
  id: string;
  companyId: string;
  batteryId: string;
  validFrom: Date;
  validUntil: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobProfile {
  id: string;
  companyId: string;
  tenantId: string;
  name: string;
  description: string | null;
  riskLevel: RiskLevel;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Service {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  description: string | null;
  type: ServiceType;
  basePrice: number;
  costPrice: number;
  taxRate: number;
  durationMinutes: number;
  status: ServiceStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceBattery {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  description: string | null;
  totalPrice: number;
  totalDuration: number;
  status: ServiceStatus;
  createdAt: Date;
  updatedAt: Date;
  items?: BatteryItem[];
}

export interface BatteryItem {
  id: string;
  batteryId: string;
  serviceId: string;
  quantity: number;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// Mock PrismaClient
export class PrismaClient {
  clinic = {
    findFirst: async (_args?: any): Promise<Clinic | null> => null,
    findMany: async (_args?: any): Promise<Clinic[]> => [],
    create: async (_args: any): Promise<Clinic> => ({} as Clinic),
    update: async (_args: any): Promise<Clinic> => ({} as Clinic),
    delete: async (_args: any): Promise<Clinic> => ({} as Clinic),
    count: async (_args?: any): Promise<number> => 0,
  };
  
  clinicSchedule = {
    findFirst: async (_args?: any): Promise<ClinicSchedule | null> => null,
    findMany: async (_args?: any): Promise<ClinicSchedule[]> => [],
    create: async (_args: any): Promise<ClinicSchedule> => ({} as ClinicSchedule),
    update: async (_args: any): Promise<ClinicSchedule> => ({} as ClinicSchedule),
    upsert: async (_args: any): Promise<ClinicSchedule> => ({} as ClinicSchedule),
    delete: async (_args: any): Promise<ClinicSchedule> => ({} as ClinicSchedule),
    deleteMany: async (_args?: any): Promise<{ count: number }> => ({ count: 0 }),
  };
  
  appointment = {
    findFirst: async (_args?: any): Promise<Appointment | null> => null,
    findMany: async (_args?: any): Promise<Appointment[]> => [],
    create: async (_args: any): Promise<Appointment> => ({} as Appointment),
    update: async (_args: any): Promise<Appointment> => ({} as Appointment),
    delete: async (_args: any): Promise<Appointment> => ({} as Appointment),
    count: async (_args?: any): Promise<number> => 0,
  };
  
  appointmentService = {
    findFirst: async (_args?: any): Promise<AppointmentService | null> => null,
    findMany: async (_args?: any): Promise<AppointmentService[]> => [],
    create: async (_args: any): Promise<AppointmentService> => ({} as AppointmentService),
    createMany: async (_args: any): Promise<{ count: number }> => ({ count: 0 }),
    update: async (_args: any): Promise<AppointmentService> => ({} as AppointmentService),
    delete: async (_args: any): Promise<AppointmentService> => ({} as AppointmentService),
    deleteMany: async (_args?: any): Promise<{ count: number }> => ({ count: 0 }),
  };
  
  company = {
    findFirst: async (_args?: any): Promise<Company | null> => null,
    findMany: async (_args?: any): Promise<Company[]> => [],
    create: async (_args: any): Promise<Company> => ({} as Company),
    update: async (_args: any): Promise<Company> => ({} as Company),
    delete: async (_args: any): Promise<Company> => ({} as Company),
    count: async (_args?: any): Promise<number> => 0,
  };
  
  companyBattery = {
    findFirst: async (_args?: any): Promise<CompanyBattery | null> => null,
    findMany: async (_args?: any): Promise<CompanyBattery[]> => [],
    create: async (_args: any): Promise<CompanyBattery> => ({} as CompanyBattery),
    delete: async (_args: any): Promise<CompanyBattery> => ({} as CompanyBattery),
    deleteMany: async (_args?: any): Promise<{ count: number }> => ({ count: 0 }),
  };
  
  jobProfile = {
    findFirst: async (_args?: any): Promise<JobProfile | null> => null,
    findMany: async (_args?: any): Promise<JobProfile[]> => [],
    create: async (_args: any): Promise<JobProfile> => ({} as JobProfile),
    update: async (_args: any): Promise<JobProfile> => ({} as JobProfile),
    delete: async (_args: any): Promise<JobProfile> => ({} as JobProfile),
    count: async (_args?: any): Promise<number> => 0,
  };
  
  service = {
    findFirst: async (_args?: any): Promise<Service | null> => null,
    findMany: async (_args?: any): Promise<Service[]> => [],
    create: async (_args: any): Promise<Service> => ({} as Service),
    update: async (_args: any): Promise<Service> => ({} as Service),
    delete: async (_args: any): Promise<Service> => ({} as Service),
    count: async (_args?: any): Promise<number> => 0,
  };
  
  serviceBattery = {
    findFirst: async (_args?: any): Promise<ServiceBattery | null> => null,
    findMany: async (_args?: any): Promise<ServiceBattery[]> => [],
    create: async (_args: any): Promise<ServiceBattery> => ({} as ServiceBattery),
    update: async (_args: any): Promise<ServiceBattery> => ({} as ServiceBattery),
    delete: async (_args: any): Promise<ServiceBattery> => ({} as ServiceBattery),
    count: async (_args?: any): Promise<number> => 0,
  };
  
  batteryItem = {
    findMany: async (_args?: any): Promise<BatteryItem[]> => [],
    create: async (_args: any): Promise<BatteryItem> => ({} as BatteryItem),
    deleteMany: async (_args?: any): Promise<{ count: number }> => ({ count: 0 }),
  };
  
  $transaction = async <T>(fn: (tx: PrismaClient) => Promise<T>): Promise<T> => {
    return fn(this);
  };
}
