// Types for MOD-EMPRESAS
import type {
  Company,
  JobProfile,
  CompanyBattery,
  RiskLevel,
  CompanyStatus
} from '@prisma/client';

// Export Prisma types
export type {
  Company,
  JobProfile,
  CompanyBattery,
  RiskLevel,
  CompanyStatus
};

// ============================================================================
// REQUEST/RESPONSE DTOs
// ============================================================================

export interface CreateCompanyRequest {
  name: string;
  rfc?: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phoneNumber?: string;
  email?: string;
  contactPerson?: string;
  contactPhone?: string;
  isHeadquarters?: boolean;
  maxEmployees?: number;
}

export interface UpdateCompanyRequest {
  name?: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phoneNumber?: string;
  email?: string;
  contactPerson?: string;
  contactPhone?: string;
  isHeadquarters?: boolean;
  maxEmployees?: number;
  status?: CompanyStatus;
}

export interface CompanyResponse extends Company {
  batteriesCount?: number;
  jobProfilesCount?: number;
  contractedBatteries?: string[]; // IDs de baterías contratadas
}

export interface CompanyListResponse {
  data: CompanyResponse[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface AddBatteryRequest {
  batteryId: string;
  validFrom?: Date;
  validUntil?: Date;
}

export interface RemoveBatteryRequest {
  batteryId: string;
}

export interface CreateJobProfileRequest {
  name: string;
  description?: string;
  riskLevel?: RiskLevel;
  requiredBatteryIds?: string[];
}

export interface UpdateJobProfileRequest {
  name?: string;
  description?: string;
  riskLevel?: RiskLevel;
  requiredBatteryIds?: string[];
}

export interface JobProfileResponse extends JobProfile {
  companyName?: string;
}

export interface JobProfileListResponse {
  data: JobProfileResponse[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================================================
// FILTER TYPES
// ============================================================================

export interface CompanyListFilters {
  tenantId: string;
  status?: CompanyStatus;
  search?: string; // Busca en name, rfc, email
  city?: string;
  page?: number;
  pageSize?: number;
}

export interface JobProfileListFilters {
  tenantId: string;
  companyId: string;
  search?: string; // Busca en name, description
  riskLevel?: RiskLevel;
  page?: number;
  pageSize?: number;
}

// ============================================================================
// CUSTOM ERRORS
// ============================================================================

export class CompanyNotFoundError extends Error {
  constructor(companyId: string) {
    super(`Company not found: ${companyId}`);
    this.name = 'CompanyNotFoundError';
  }
}

export class CompanyAlreadyExistsError extends Error {
  constructor(name: string, tenantId: string) {
    super(`Company with name ${name} already exists in tenant ${tenantId}`);
    this.name = 'CompanyAlreadyExistsError';
  }
}

export class CompanyRFCAlreadyExistsError extends Error {
  constructor(rfc: string) {
    super(`Company with RFC ${rfc} already exists`);
    this.name = 'CompanyRFCAlreadyExistsError';
  }
}

export class JobProfileNotFoundError extends Error {
  constructor(jobProfileId: string) {
    super(`Job profile not found: ${jobProfileId}`);
    this.name = 'JobProfileNotFoundError';
  }
}

export class JobProfileAlreadyExistsError extends Error {
  constructor(name: string, companyId: string) {
    super(`Job profile with name ${name} already exists in this company`);
    this.name = 'JobProfileAlreadyExistsError';
  }
}

export class InvalidJobProfileError extends Error {
  constructor(message: string) {
    super(`Invalid job profile: ${message}`);
    this.name = 'InvalidJobProfileError';
  }
}

export class BatteryAlreadyContractedError extends Error {
  constructor(batteryId: string, companyId: string) {
    super(`Battery ${batteryId} is already contracted by company ${companyId}`);
    this.name = 'BatteryAlreadyContractedError';
  }
}
