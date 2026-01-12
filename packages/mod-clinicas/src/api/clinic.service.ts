// API service for MOD-CLINICAS
import { PrismaClient } from '@prisma/client';
import type {
  CreateClinicRequest,
  UpdateClinicRequest,
  CreateScheduleRequest,
  ClinicListFilters,
  ClinicResponse,
  ClinicListResponse
} from '../types/clinic';
import {
  ClinicNotFoundError,
  ClinicAlreadyExistsError,
  InvalidScheduleError
} from '../types/clinic';

export class ClinicService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a new clinic
   */
  async createClinic(tenantId: string, data: CreateClinicRequest): Promise<ClinicResponse> {
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
        services: true
      }
    });

    return clinic as ClinicResponse;
  }

  /**
   * Get clinic by ID
   */
  async getClinic(clinicId: string, tenantId: string): Promise<ClinicResponse> {
    const clinic = await this.prisma.clinic.findFirst({
      where: {
        id: clinicId,
        tenantId
      },
      include: {
        schedules: true,
        services: true,
        _count: {
          select: { appointments: true }
        }
      }
    });

    if (!clinic) {
      throw new ClinicNotFoundError(clinicId);
    }

    return {
      ...clinic,
      appointmentCount: clinic._count.appointments
    } as ClinicResponse;
  }

  /**
   * List clinics with filters
   */
  async listClinics(filters: ClinicListFilters): Promise<ClinicListResponse> {
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 10;
    const skip = (page - 1) * pageSize;

    const where: any = {
      tenantId: filters.tenantId
    };

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
      data: clinics as ClinicResponse[],
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
    clinicId: string,
    tenantId: string,
    data: UpdateClinicRequest
  ): Promise<ClinicResponse> {
    const clinic = await this.prisma.clinic.findFirst({
      where: { id: clinicId, tenantId }
    });

    if (!clinic) {
      throw new ClinicNotFoundError(clinicId);
    }

    const updated = await this.prisma.clinic.update({
      where: { id: clinicId },
      data,
      include: {
        schedules: true,
        services: true
      }
    });

    return updated as ClinicResponse;
  }

  /**
   * Delete clinic (soft delete via status)
   */
  async deleteClinic(clinicId: string, tenantId: string): Promise<void> {
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
  async upsertSchedule(data: CreateScheduleRequest): Promise<any> {
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
        lunchStartTime: data.lunchStartTime,
        lunchEndTime: data.lunchEndTime,
        isOpen: data.isOpen,
        maxAppointmentsDay: data.maxAppointmentsDay
      },
      create: {
        clinicId: data.clinicId,
        dayOfWeek: data.dayOfWeek,
        openingTime: data.openingTime,
        closingTime: data.closingTime,
        lunchStartTime: data.lunchStartTime,
        lunchEndTime: data.lunchEndTime,
        isOpen: data.isOpen,
        maxAppointmentsDay: data.maxAppointmentsDay
      }
    });
  }

  private isValidTimeFormat(time: string): boolean {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }
}
