// API service for MOD-EMPRESAS
import { PrismaClient } from '@prisma/client';
import type {
  CreateCompanyRequest,
  UpdateCompanyRequest,
  CompanyResponse,
  CompanyListResponse,
  CompanyListFilters,
  AddBatteryRequest,
  CreateJobProfileRequest,
  UpdateJobProfileRequest,
  JobProfileResponse,
  JobProfileListResponse,
  JobProfileListFilters
} from '../types/company';
import {
  CompanyNotFoundError,
  CompanyAlreadyExistsError,
  CompanyRFCAlreadyExistsError,
  JobProfileNotFoundError,
  JobProfileAlreadyExistsError,
  InvalidJobProfileError,
  BatteryAlreadyContractedError
} from '../types/company';

export class CompanyService {
  constructor(private prisma: PrismaClient) {}

  // ========================================================================
  // COMPANY OPERATIONS
  // ========================================================================

  /**
   * Create a new company
   */
  async createCompany(tenantId: string, data: CreateCompanyRequest, createdBy: string): Promise<CompanyResponse> {
    // Check if company name already exists in tenant
    const existing = await this.prisma.company.findFirst({
      where: {
        tenantId,
        name: data.name
      }
    });

    if (existing) {
      throw new CompanyAlreadyExistsError(data.name, tenantId);
    }

    // Check if RFC already exists (globally unique)
    if (data.rfc) {
      const existingRfc = await this.prisma.company.findFirst({
        where: { rfc: data.rfc }
      });

      if (existingRfc) {
        throw new CompanyRFCAlreadyExistsError(data.rfc);
      }
    }

    const company = await this.prisma.company.create({
      data: {
        tenantId,
        name: data.name,
        rfc: data.rfc,
        description: data.description,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        phoneNumber: data.phoneNumber,
        email: data.email,
        contactPerson: data.contactPerson,
        contactPhone: data.contactPhone,
        isHeadquarters: data.isHeadquarters || false,
        maxEmployees: data.maxEmployees || 100,
        createdBy
      }
    });

    return company as CompanyResponse;
  }

  /**
   * Get single company with metadata
   */
  async getCompany(tenantId: string, companyId: string): Promise<CompanyResponse> {
    const company = await this.prisma.company.findFirst({
      where: { id: companyId, tenantId }
    });

    if (!company) {
      throw new CompanyNotFoundError(companyId);
    }

    const [batteriesCount, jobProfilesCount, contractedBatteries] = await Promise.all([
      this.prisma.companyBattery.count({ where: { companyId } }),
      this.prisma.jobProfile.count({ where: { companyId } }),
      this.prisma.companyBattery
        .findMany({ where: { companyId }, select: { batteryId: true } })
        .then(rows => rows.map(r => r.batteryId))
    ]);

    return {
      ...company,
      batteriesCount,
      jobProfilesCount,
      contractedBatteries
    } as CompanyResponse;
  }

  /**
   * List companies with filtering, search, and pagination
   */
  async listCompanies(filters: CompanyListFilters): Promise<CompanyListResponse> {
    const {
      tenantId,
      status,
      search,
      city,
      page = 1,
      pageSize = 10
    } = filters;

    const skip = (page - 1) * pageSize;

    const where: any = { tenantId };
    if (status) where.status = status;
    if (city) where.city = city;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { rfc: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [companies, total] = await Promise.all([
      this.prisma.company.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.company.count({ where })
    ]);

    // Enrich each company with metadata
    const enriched = await Promise.all(
      companies.map(async (company) => {
        const [batteriesCount, jobProfilesCount] = await Promise.all([
          this.prisma.companyBattery.count({ where: { companyId: company.id } }),
          this.prisma.jobProfile.count({ where: { companyId: company.id } })
        ]);

        return {
          ...company,
          batteriesCount,
          jobProfilesCount
        } as CompanyResponse;
      })
    );

    return {
      data: enriched,
      total,
      page,
      pageSize,
      hasMore: skip + companies.length < total
    };
  }

  /**
   * Update company
   */
  async updateCompany(
    tenantId: string,
    companyId: string,
    data: UpdateCompanyRequest,
    updatedBy: string
  ): Promise<CompanyResponse> {
    const company = await this.prisma.company.findFirst({
      where: { id: companyId, tenantId }
    });

    if (!company) {
      throw new CompanyNotFoundError(companyId);
    }

    const updated = await this.prisma.company.update({
      where: { id: companyId },
      data: {
        ...data,
        updatedBy
      }
    });

    return updated as CompanyResponse;
  }

  /**
   * Delete company (soft delete via status)
   */
  async deleteCompany(tenantId: string, companyId: string): Promise<void> {
    const company = await this.prisma.company.findFirst({
      where: { id: companyId, tenantId }
    });

    if (!company) {
      throw new CompanyNotFoundError(companyId);
    }

    await this.prisma.company.update({
      where: { id: companyId },
      data: { status: 'ARCHIVED' }
    });
  }

  // ========================================================================
  // COMPANY BATTERY OPERATIONS
  // ========================================================================

  /**
   * Add contracted battery to company
   */
  async addBattery(
    tenantId: string,
    companyId: string,
    data: AddBatteryRequest
  ): Promise<void> {
    const company = await this.prisma.company.findFirst({
      where: { id: companyId, tenantId }
    });

    if (!company) {
      throw new CompanyNotFoundError(companyId);
    }

    // Check if battery is already contracted
    const existing = await this.prisma.companyBattery.findFirst({
      where: { companyId, batteryId: data.batteryId }
    });

    if (existing) {
      throw new BatteryAlreadyContractedError(data.batteryId, companyId);
    }

    await this.prisma.companyBattery.create({
      data: {
        companyId,
        batteryId: data.batteryId,
        validFrom: data.validFrom,
        validUntil: data.validUntil
      }
    });
  }

  /**
   * Remove contracted battery from company
   */
  async removeBattery(tenantId: string, companyId: string, batteryId: string): Promise<void> {
    const company = await this.prisma.company.findFirst({
      where: { id: companyId, tenantId }
    });

    if (!company) {
      throw new CompanyNotFoundError(companyId);
    }

    await this.prisma.companyBattery.deleteMany({
      where: { companyId, batteryId }
    });
  }

  /**
   * Get contracted batteries for company
   */
  async getContractedBatteries(tenantId: string, companyId: string): Promise<string[]> {
    const company = await this.prisma.company.findFirst({
      where: { id: companyId, tenantId }
    });

    if (!company) {
      throw new CompanyNotFoundError(companyId);
    }

    const batteries = await this.prisma.companyBattery.findMany({
      where: { companyId, isActive: true },
      select: { batteryId: true }
    });

    return batteries.map(b => b.batteryId);
  }

  // ========================================================================
  // JOB PROFILE OPERATIONS
  // ========================================================================

  /**
   * Create job profile for company
   */
  async createJobProfile(
    tenantId: string,
    companyId: string,
    data: CreateJobProfileRequest,
    createdBy: string
  ): Promise<JobProfileResponse> {
    const company = await this.prisma.company.findFirst({
      where: { id: companyId, tenantId }
    });

    if (!company) {
      throw new CompanyNotFoundError(companyId);
    }

    // Check if profile name already exists in this company
    const existing = await this.prisma.jobProfile.findFirst({
      where: { companyId, name: data.name }
    });

    if (existing) {
      throw new JobProfileAlreadyExistsError(data.name, companyId);
    }

    const jobProfile = await this.prisma.jobProfile.create({
      data: {
        tenantId,
        companyId,
        name: data.name,
        description: data.description,
        riskLevel: data.riskLevel || 'MEDIO',
        requiredBatteryIds: data.requiredBatteryIds || [],
        createdBy
      }
    });

    return {
      ...jobProfile,
      companyName: company.name
    } as JobProfileResponse;
  }

  /**
   * Get single job profile
   */
  async getJobProfile(tenantId: string, jobProfileId: string): Promise<JobProfileResponse> {
    const jobProfile = await this.prisma.jobProfile.findFirst({
      where: {
        id: jobProfileId,
        tenantId
      }
    });

    if (!jobProfile) {
      throw new JobProfileNotFoundError(jobProfileId);
    }

    const company = await this.prisma.company.findUnique({
      where: { id: jobProfile.companyId }
    });

    return {
      ...jobProfile,
      companyName: company?.name
    } as JobProfileResponse;
  }

  /**
   * List job profiles for company
   */
  async listJobProfiles(filters: JobProfileListFilters): Promise<JobProfileListResponse> {
    const {
      tenantId,
      companyId,
      search,
      riskLevel,
      page = 1,
      pageSize = 10
    } = filters;

    const company = await this.prisma.company.findFirst({
      where: { id: companyId, tenantId }
    });

    if (!company) {
      throw new CompanyNotFoundError(companyId);
    }

    const skip = (page - 1) * pageSize;

    const where: any = { companyId, tenantId };
    if (riskLevel) where.riskLevel = riskLevel;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [jobProfiles, total] = await Promise.all([
      this.prisma.jobProfile.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.jobProfile.count({ where })
    ]);

    return {
      data: jobProfiles.map(jp => ({
        ...jp,
        companyName: company.name
      })) as JobProfileResponse[],
      total,
      page,
      pageSize,
      hasMore: skip + jobProfiles.length < total
    };
  }

  /**
   * Update job profile
   */
  async updateJobProfile(
    tenantId: string,
    jobProfileId: string,
    data: UpdateJobProfileRequest,
    updatedBy: string
  ): Promise<JobProfileResponse> {
    const jobProfile = await this.prisma.jobProfile.findFirst({
      where: { id: jobProfileId, tenantId }
    });

    if (!jobProfile) {
      throw new JobProfileNotFoundError(jobProfileId);
    }

    const updated = await this.prisma.jobProfile.update({
      where: { id: jobProfileId },
      data: {
        ...data,
        updatedBy
      }
    });

    const company = await this.prisma.company.findUnique({
      where: { id: updated.companyId }
    });

    return {
      ...updated,
      companyName: company?.name
    } as JobProfileResponse;
  }

  /**
   * Delete job profile
   */
  async deleteJobProfile(tenantId: string, jobProfileId: string): Promise<void> {
    const jobProfile = await this.prisma.jobProfile.findFirst({
      where: { id: jobProfileId, tenantId }
    });

    if (!jobProfile) {
      throw new JobProfileNotFoundError(jobProfileId);
    }

    await this.prisma.jobProfile.delete({
      where: { id: jobProfileId }
    });
  }
}
