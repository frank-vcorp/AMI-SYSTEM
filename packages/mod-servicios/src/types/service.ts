// Types for MOD-SERVICIOS
import {
  Service,
  ServiceBattery as Battery,
  BatteryItem as BatteryService,
  ServiceType as ServiceCategory,
  ServiceStatus
} from '@ami/core';

// Alias for BatteryStatus (String in Core, was Enum in Modulo)
export type BatteryStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
export const BatteryStatus = {
  ACTIVE: 'ACTIVE' as BatteryStatus,
  INACTIVE: 'INACTIVE' as BatteryStatus,
  ARCHIVED: 'ARCHIVED' as BatteryStatus
};

// Export Prisma types with aliases
export {
  Service,
  Battery,
  BatteryService,
  ServiceCategory,
  ServiceStatus
};

// DTOs for Service
export interface CreateServiceRequest {
  code: string;
  name: string;
  description?: string;
  type: ServiceCategory; // Use aliased Enum
  basePrice: number;
  costPrice?: number;
  taxRate?: number;
  durationMin?: number;
}

export interface UpdateServiceRequest extends Partial<CreateServiceRequest> {
  status?: ServiceStatus;
}

export interface ServiceListFilters {
  tenantId: string;
  search?: string;
  type?: ServiceCategory;
  status?: ServiceStatus;
  page?: number;
  pageSize?: number;
}

export interface ServiceResponse extends Service {
  // Extended props if any
}

export interface ServiceListResponse {
  data: ServiceResponse[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// DTOs for Battery
export interface CreateBatteryRequest {
  name: string;
  description?: string;
  totalPrice: number;
  services: {
    serviceId: string;
    quantity?: number;
    unitPrice: number;
  }[];
}

export interface UpdateBatteryRequest extends Partial<CreateBatteryRequest> {
  status?: BatteryStatus;
}

export interface BatteryListFilters {
  tenantId: string;
  search?: string;
  status?: BatteryStatus;
  page?: number;
  pageSize?: number;
}

export interface BatteryResponse extends Battery {
  services: (BatteryService & { service: Service })[];
  serviceCount: number;
}

export interface BatteryListResponse {
  data: BatteryResponse[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Errors
export class ServiceNotFoundError extends Error {
  constructor(id: string) {
    super(`Service not found: ${id}`);
    this.name = 'ServiceNotFoundError';
  }
}

export class ServiceAlreadyExistsError extends Error {
  constructor(code: string) {
    super(`Service with code ${code} already exists`);
    this.name = 'ServiceAlreadyExistsError';
  }
}

export class BatteryNotFoundError extends Error {
  constructor(id: string) {
    super(`Battery not found: ${id}`);
    this.name = 'BatteryNotFoundError';
  }
}

export class BatteryAlreadyExistsError extends Error {
  constructor(name: string) {
    super(`Battery with name ${name} already exists`);
    this.name = 'BatteryAlreadyExistsError';
  }
}

export class InvalidBatteryError extends Error {
  constructor(message: string) {
    super(`Invalid battery: ${message}`);
    this.name = 'InvalidBatteryError';
  }
}
