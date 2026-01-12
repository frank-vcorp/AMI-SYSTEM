/**
 * Tipos compartidos para AMI-SYSTEM
 * Centralizamos aquí todas las interfaces y tipos usados en todos los packages
 */

// Usuario y Autenticación
export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: UserRole;
  tenantId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  COORDINADOR = 'COORDINADOR',
  MEDICO = 'MEDICO',
  RECEPCIONISTA = 'RECEPCIONISTA',
  VIEWER = 'VIEWER',
}

// Tenant
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Clínica
export interface Clinic {
  id: string;
  tenantId: string;
  name: string;
  address: string;
  city: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  capacityPerShift: number;
  schedules: ClinicSchedule[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClinicSchedule {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  openTime: string; // HH:mm
  closeTime: string; // HH:mm
}

// Servicio
export interface Service {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  description?: string;
  cost: number;
  estimatedDurationMinutes: number;
  requiresEquipment: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Batería (paquete de servicios)
export interface Battery {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  serviceIds: string[];
  totalCost: number;
  totalDurationMinutes: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Empresa
export interface Company {
  id: string;
  tenantId: string;
  name: string;
  address?: string;
  phone?: string;
  contactEmail?: string;
  contractedBatteryIds: string[];
  jobProfiles: JobProfile[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Perfil de Puesto
export interface JobProfile {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  riskLevel: 'BAJO' | 'MEDIO' | 'ALTO';
  requiredBatteryIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

// AuditLog
export interface AuditLog {
  id: string;
  tenantId: string;
  userId: string;
  action: string; // 'CREATE', 'UPDATE', 'DELETE', etc.
  entityType: string; // 'Clinic', 'Service', etc.
  entityId: string;
  changes?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: Date;
}

// Error estándar de API
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Respuesta estándar de API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

// Paginación
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
