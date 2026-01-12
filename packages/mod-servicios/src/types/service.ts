// Types for MOD-SERVICIOS
import type {
  Service,
  Battery,
  BatteryService,
  ServiceCategory,
  ServiceStatus,
  BatteryStatus
} from '@prisma/client';

// Export Prisma types
export type {
  Service,
  Battery,
  BatteryService,
  ServiceCategory,
  ServiceStatus,
  BatteryStatus
};

// ============================================================================
// REQUEST/RESPONSE DTOs
// ============================================================================

export interface CreateServiceRequest {
  code: string;
  name: string;
  description?: string;
  category: ServiceCategory;
  estimatedMinutes?: number;
  requiresEquipment?: boolean;
  equipmentName?: string;
  costAmount?: number;
  sellingPrice?: number;
}

export interface UpdateServiceRequest {
  name?: string;
  description?: string;
  category?: ServiceCategory;
  estimatedMinutes?: number;
  requiresEquipment?: boolean;
  equipmentName?: string;
  costAmount?: number;
  sellingPrice?: number;
  status?: ServiceStatus;
}

export interface ServiceResponse extends Service {
  batterieCount?: number;
}

export interface ServiceListResponse {
  data: ServiceResponse[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface CreateBatteryRequest {
  name: string;
  description?: string;
  serviceIds: string[]; // IDs de servicios a incluir
  sellingPriceTotal?: number;
}

export interface UpdateBatteryRequest {
  name?: string;
  description?: string;
  serviceIds?: string[];
  sellingPriceTotal?: number;
  status?: BatteryStatus;
}

export interface BatteryResponse extends Battery {
  services: BatteryServiceDetail[];
  serviceCount: number;
}

export interface BatteryServiceDetail {
  id: string;
  service: Service;
  order: number;
  costOverride?: number;
  estimatedMinutesOverride?: number;
}

export interface BatteryListResponse {
  data: BatteryResponse[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================================================
// FILTER TYPES
// ============================================================================

export interface ServiceListFilters {
  tenantId: string;
  status?: ServiceStatus;
  category?: ServiceCategory;
  search?: string; // Busca en name, code, description
  page?: number;
  pageSize?: number;
}

export interface BatteryListFilters {
  tenantId: string;
  status?: BatteryStatus;
  search?: string; // Busca en name, description
  page?: number;
  pageSize?: number;
}

// ============================================================================
// CUSTOM ERRORS
// ============================================================================

export class ServiceNotFoundError extends Error {
  constructor(serviceId: string) {
    super(`Service not found: ${serviceId}`);
    this.name = 'ServiceNotFoundError';
  }
}

export class ServiceAlreadyExistsError extends Error {
  constructor(code: string, tenantId: string) {
    super(`Service with code ${code} already exists in tenant ${tenantId}`);
    this.name = 'ServiceAlreadyExistsError';
  }
}

export class BatteryNotFoundError extends Error {
  constructor(batteryId: string) {
    super(`Battery not found: ${batteryId}`);
    this.name = 'BatteryNotFoundError';
  }
}

export class BatteryAlreadyExistsError extends Error {
  constructor(name: string, tenantId: string) {
    super(`Battery with name ${name} already exists in tenant ${tenantId}`);
    this.name = 'BatteryAlreadyExistsError';
  }
}

export class InvalidBatteryError extends Error {
  constructor(message: string) {
    super(`Invalid battery: ${message}`);
    this.name = 'InvalidBatteryError';
  }
}
