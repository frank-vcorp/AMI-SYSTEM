// API service for MOD-CLINICAS
import { PrismaClient } from '@ami/core';
import type {
  CreateClinicRequest,
  UpdateClinicRequest,
  CreateScheduleRequest,
  ClinicListFilters,
  ClinicResponse,
  ClinicListResponse,
  ClinicSchedule
} from '../types/clinic';
import {
  ClinicNotFoundError,
  ClinicAlreadyExistsError,
  InvalidScheduleError
} from '../types/clinic';

export class ClinicService {
  constructor(private prisma: PrismaClient) {}

  private isUuid(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
  }

  /**
   * Create a new clinic
   */
  async createClinic(tenantId: string, data: CreateClinicRequest, _createdBy?: string): Promise<ClinicResponse> {
    if (!this.isUuid(tenantId)) {
      throw new Error('tenantId must be a UUID');
    }
    // Check if clinic already exists
    const existing = await this.prisma.clinic.findFirst({
      where: {
        tenantId,
        name: data.name
      }
    });

    if (existing) {
      throw new ClinicAlreadyExistsError(data.name, tenantId);
    }

    const clinic = await this.prisma.clinic.create({
      data: {
        tenantId,
        name: data.name,
        description: data.description,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        phoneNumber: data.phoneNumber,
        email: data.email,
        totalBeds: data.totalBeds || 1,
        availableBeds: data.totalBeds || 1,
        isHeadquarters: data.isHeadquarters || false
      },
      include: {
        schedules: true,
        services: {
          include: {
            service: true
          }
        }
      }
    });

    // Transform Prisma result to ClinicResponse
    return {
      ...clinic,
      services: clinic.services.map((cs: any) => ({
        id: cs.id,
        clinicId: cs.clinicId,
        name: cs.service.name,
        description: cs.service.description
      }))
    } as ClinicResponse;
  }

  /**
   * Get clinic by ID
   */
  async getClinic(tenantId: string, clinicId: string): Promise<ClinicResponse> {
    if (!this.isUuid(tenantId)) {
      throw new Error('tenantId must be a UUID');
    }
    const clinic = await this.prisma.clinic.findFirst({
      where: {
        id: clinicId,
        tenantId
      },
      include: {
        schedules: true,
        services: {
          include: {
            service: true
          }
        }
      }
    });

    if (!clinic) {
      throw new ClinicNotFoundError(clinicId);
    }

    return {
      ...clinic,
      services: clinic.services.map((cs: any) => ({
        id: cs.id,
        clinicId: cs.clinicId,
        name: cs.service.name,
        description: cs.service.description
      })),
      appointmentCount: 0
    } as ClinicResponse;
  }

  /**
   * List clinics with filters
   */
  async listClinics(filters: ClinicListFilters): Promise<ClinicListResponse> {
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 10;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    // `default-tenant` (non-UUID) causes Postgres UUID cast errors.
    // Omit tenantId filtering if invalid until auth/multitenancy is configured.
    if (filters.tenantId && this.isUuid(filters.tenantId)) {
      where.tenantId = filters.tenantId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { city: { contains: filters.search, mode: 'insensitive' } },
        { address: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    if (filters.city) {
      where.city = { equals: filters.city, mode: 'insensitive' };
    }

    /**
     * @fix IMPL-20260122-01
     * Removed nested service include as FK relation doesn't exist in current DB schema.
     * Services data will be fetched separately if needed.
     */
    const [clinics, total] = await Promise.all([
      this.prisma.clinic.findMany({
        where,
        include: {
          schedules: true,
          services: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize
      }),
      this.prisma.clinic.count({ where })
    ]);

    return {
      data: clinics.map((clinic: any) => ({
        ...clinic,
        services: clinic.services.map((cs: any) => ({
          id: cs.id,
          clinicId: cs.clinicId,
          serviceId: cs.serviceId,
          isAvailable: cs.isAvailable,
          price: cs.price
        }))
      })) as ClinicResponse[],
      total,
      page,
      pageSize,
      hasMore: skip + clinics.length < total
    };
  }

  /**
   * Update clinic
   */
  async updateClinic(
    tenantId: string,
    clinicId: string,
    data: UpdateClinicRequest,
    _updatedBy?: string
  ): Promise<ClinicResponse> {
    if (!this.isUuid(tenantId)) {
      throw new Error('tenantId must be a UUID');
    }
    const clinic = await this.prisma.clinic.findFirst({
      where: { id: clinicId, tenantId }
    });

    if (!clinic) {
      throw new ClinicNotFoundError(clinicId);
    }

    const updated = await this.prisma.clinic.update({
      where: { id: clinicId },
      data: data as any,
      include: {
        schedules: true,
        services: {
          include: {
            service: true
          }
        }
      }
    });

    return {
      ...updated,
      services: updated.services.map((cs: any) => ({
        id: cs.id,
        clinicId: cs.clinicId,
        name: cs.service.name,
        description: cs.service.description
      }))
    } as ClinicResponse;
  }

  /**
   * Delete clinic (soft delete via status)
   */
  async deleteClinic(tenantId: string, clinicId: string): Promise<void> {
    if (!this.isUuid(tenantId)) {
      throw new Error('tenantId must be a UUID');
    }
    const clinic = await this.prisma.clinic.findFirst({
      where: { id: clinicId, tenantId }
    });

    if (!clinic) {
      throw new ClinicNotFoundError(clinicId);
    }

    await this.prisma.clinic.update({
      where: { id: clinicId },
      data: { status: 'ARCHIVED' }
    });
  }

  /**
   * Create or update schedule for a clinic
   */
  async upsertSchedule(tenantId: string, data: CreateScheduleRequest): Promise<ClinicSchedule> {
    if (!this.isUuid(tenantId)) {
      throw new Error('tenantId must be a UUID');
    }
    // Validate clinic belongs to tenant
    const clinic = await this.prisma.clinic.findFirst({
      where: { id: data.clinicId, tenantId },
      select: { id: true }
    });

    if (!clinic) {
      throw new ClinicNotFoundError(data.clinicId);
    }

    // Normalize times
    data.openingTime = data.openingTime.padStart(5, '0');
    data.closingTime = data.closingTime.padStart(5, '0');
    if (data.lunchStartTime) data.lunchStartTime = data.lunchStartTime.padStart(5, '0');
    if (data.lunchEndTime) data.lunchEndTime = data.lunchEndTime.padStart(5, '0');

    // Validate times
    if (!this.isValidTimeFormat(data.openingTime)) {
      throw new InvalidScheduleError('Invalid opening time format (use HH:MM)');
    }
    if (!this.isValidTimeFormat(data.closingTime)) {
      throw new InvalidScheduleError('Invalid closing time format (use HH:MM)');
    }

    if (data.openingTime >= data.closingTime) {
      throw new InvalidScheduleError('Opening time must be before closing time');
    }

    if (data.dayOfWeek < 0 || data.dayOfWeek > 6) {
      throw new InvalidScheduleError('Day of week must be 0-6');
    }

    return this.prisma.clinicSchedule.upsert({
      where: {
        clinicId_dayOfWeek: {
          clinicId: data.clinicId,
          dayOfWeek: data.dayOfWeek
        }
      },
      update: {
        openingTime: data.openingTime,
        closingTime: data.closingTime,
        isActive: data.isOpen,
        maxAppointmentsDay: data.maxAppointmentsDay
      },
      create: {
        clinicId: data.clinicId,
        dayOfWeek: data.dayOfWeek,
        openingTime: data.openingTime,
        closingTime: data.closingTime,
        isActive: data.isOpen,
        maxAppointmentsDay: data.maxAppointmentsDay
      }
    });
  }

  private isValidTimeFormat(time: string): boolean {
    const timeRegex = /^\d{2}:\d{2}$/;
    return timeRegex.test(time);
  }
}
