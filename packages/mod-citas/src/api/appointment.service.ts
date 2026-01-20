// API service for MOD-CITAS
import { PrismaClient } from '@ami/core';
import type {
  CreateAppointmentRequest,
  UpdateAppointmentRequest,
  AppointmentResponse,
  AppointmentListResponse,
  AppointmentListFilters,
  AvailabilityRequest,
  AvailabilitySlot
} from '../types/appointment';
import {
  AppointmentNotFoundError,
  AppointmentConflictError,
  ClinicNotAvailableError,
  InvalidAppointmentError
} from '../types/appointment';

export class AppointmentService {
  constructor(private prisma: PrismaClient) {}

  private isUuid(value: string): boolean {
    // Accept any RFC 4122 UUID version
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
  }

  /**
   * Create a new appointment
   */
  async createAppointment(
    tenantId: string,
    data: CreateAppointmentRequest,
    _createdBy?: string
  ): Promise<AppointmentResponse> {
    if (!this.isUuid(tenantId)) {
      throw new InvalidAppointmentError('tenantId must be a UUID');
    }
    // Validate clinic exists and belongs to tenant
    const clinic = await this.prisma.clinic.findFirst({
      where: { id: data.clinicId, tenantId }
    });

    if (!clinic) {
      throw new ClinicNotAvailableError(data.clinicId, data.appointmentDate);
    }

    // Validate clinic is open on that date
    const appointmentDate = new Date(data.appointmentDate);
    const dayOfWeek = appointmentDate.getDay();

    const schedule = await this.prisma.clinicSchedule.findFirst({
      where: {
        clinicId: data.clinicId,
        dayOfWeek,
        // Compatible with current schema (uses isOpen) and future schema (uses isActive)
        OR: [{ isOpen: true } as any, { isActive: true } as any]
      }
    });

    if (!schedule) {
      throw new ClinicNotAvailableError(data.clinicId, appointmentDate);
    }

    // Validate time is within clinic hours
    const [hour, minute] = data.appointmentTime.split(':').map(Number);
    const appointmentTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    
    if (appointmentTime < schedule.openingTime || appointmentTime > schedule.closingTime) {
      throw new InvalidAppointmentError('Time is outside clinic hours');
    }

    // Check for lunch break if applicable
    const lunchStart = (schedule as any).lunchStartTime ?? (schedule as any).lunchStart;
    const lunchEnd = (schedule as any).lunchEndTime ?? (schedule as any).lunchEnd;
    if (lunchStart && lunchEnd) {
      if (appointmentTime >= lunchStart && appointmentTime < lunchEnd) {
        throw new InvalidAppointmentError('Time falls during lunch break');
      }
    }

    // Check for existing appointment conflict
    const existingAppointment = await this.prisma.appointment.findFirst({
      where: {
        clinicId: data.clinicId,
        appointmentDate: {
          gte: appointmentDate,
          lt: new Date(appointmentDate.getTime() + 24 * 60 * 60 * 1000)
        },
        // Current schema uses `time`, core schema uses `appointmentTime`
        OR: [{ time: appointmentTime } as any, { appointmentTime } as any],
        status: { not: 'CANCELLED' }
      }
    });

    if (existingAppointment) {
      throw new AppointmentConflictError(data.clinicId, data.appointmentTime);
    }

    // Create appointment with services
    const appointment = await this.prisma.appointment.create({
      data: {
        tenantId,
        clinicId: data.clinicId,
        employeeId: data.employeeId,
        companyId: data.companyId,
        appointmentDate,
        // Current schema stores this as `time`
        time: appointmentTime,
        notes: data.notes,
      } as any,
      include: {
        clinic: true,
      } as any,
    });

    return this.mapAppointmentResponse(appointment);
  }

  /**
   * Get single appointment
   */
  async getAppointment(tenantId: string, appointmentId: string): Promise<AppointmentResponse> {
    const appointment = await this.prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        ...(this.isUuid(tenantId) ? { tenantId } : {})
      } as any,
      include: {
        clinic: true,
      } as any
    });

    if (!appointment) {
      throw new AppointmentNotFoundError(appointmentId);
    }

    return this.mapAppointmentResponse(appointment);
  }

  /**
   * List appointments with filtering
   */
  async listAppointments(filters: AppointmentListFilters): Promise<AppointmentListResponse> {
    const {
      tenantId,
      clinicId,
      companyId,
      employeeId,
      status,
      dateFrom,
      dateTo,
      page = 1,
      pageSize = 10
    } = filters;

    const skip = (page - 1) * pageSize;

    const where: any = {};
    // `default-tenant` (non-UUID) causes Postgres UUID cast errors.
    // While auth/multitenancy is not wired yet, omit tenantId filtering if invalid.
    if (tenantId && this.isUuid(tenantId)) where.tenantId = tenantId;

    if (clinicId) where.clinicId = clinicId;
    if (companyId) where.companyId = companyId;
    if (employeeId) where.employeeId = employeeId;
    if (status) where.status = status;

    if (dateFrom || dateTo) {
      where.appointmentDate = {};
      if (dateFrom) where.appointmentDate.gte = dateFrom;
      if (dateTo) where.appointmentDate.lte = dateTo;
    }

    const [appointments, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          clinic: true,
        } as any,
        orderBy: { appointmentDate: 'desc' }
      }),
      this.prisma.appointment.count({ where })
    ]);

    return {
      data: appointments.map((a: any) => this.mapAppointmentResponse(a)),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }

  /**
   * Update appointment
   */
  async updateAppointment(
    tenantId: string,
    appointmentId: string,
    data: UpdateAppointmentRequest,
    _updatedBy?: string
  ): Promise<AppointmentResponse> {
    if (!this.isUuid(tenantId)) {
      throw new InvalidAppointmentError('tenantId must be a UUID');
    }
    const appointment = await this.prisma.appointment.findFirst({
      where: { id: appointmentId, tenantId }
    });

    if (!appointment) {
      throw new AppointmentNotFoundError(appointmentId);
    }

    // If updating date/time, validate availability again
    if (data.appointmentDate || data.appointmentTime) {
      const newDateStr = data.appointmentDate || (appointment.appointmentDate instanceof Date 
        ? appointment.appointmentDate.toISOString().split('T')[0]
        : appointment.appointmentDate);
      const newDate = new Date(newDateStr);
      const persistedTime = (appointment as any).appointmentTime ?? (appointment as any).time;
      const newTime = data.appointmentTime || persistedTime;

      // Validate clinic hours (simplified - reuse logic from create)
      const schedule = await this.prisma.clinicSchedule.findFirst({
        where: {
          clinicId: appointment.clinicId,
          dayOfWeek: newDate.getDay(),
          OR: [{ isOpen: true } as any, { isActive: true } as any]
        }
      });

      if (!schedule) {
        throw new ClinicNotAvailableError(appointment.clinicId, newDate);
      }

      if (newTime < schedule.openingTime || newTime > schedule.closingTime) {
        throw new InvalidAppointmentError('Time is outside clinic hours');
      }
    }

    // Current schema does not model appointmentServices join yet.

    const updated = await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        appointmentDate: data.appointmentDate,
        time: data.appointmentTime,
        notes: data.notes,
        status: data.status as any
      } as any,
      include: {
        clinic: true,
      } as any
    });

    return this.mapAppointmentResponse(updated);
  }

  /**
   * Cancel appointment
   */
  async cancelAppointment(tenantId: string, appointmentId: string): Promise<void> {
    if (!this.isUuid(tenantId)) {
      throw new InvalidAppointmentError('tenantId must be a UUID');
    }
    const appointment = await this.prisma.appointment.findFirst({
      where: { id: appointmentId, tenantId }
    });

    if (!appointment) {
      throw new AppointmentNotFoundError(appointmentId);
    }

    await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'CANCELLED' }
    });
  }

  /**
   * Find available slots for scheduling
   */
  async findAvailableSlots(
    tenantId: string,
    request: AvailabilityRequest
  ): Promise<AvailabilitySlot[]> {
    if (!this.isUuid(tenantId)) {
      throw new InvalidAppointmentError('tenantId must be a UUID');
    }
    const { clinicId, dateFrom, dateTo, durationMin } = request;

    // Get clinic schedule
    const clinic = await this.prisma.clinic.findFirst({
      where: { id: clinicId, tenantId },
      include: { schedules: true } as any
    });

    if (!clinic) {
      throw new ClinicNotAvailableError(clinicId, dateFrom);
    }

    const slots: AvailabilitySlot[] = [];
    const currentDate = new Date(dateFrom);
    const endDate = new Date(dateTo);

    // Iterate through each day
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      const schedule: any = clinic.schedules?.find(
        (s: any) => s.dayOfWeek === dayOfWeek && ((s.isActive ?? s.isOpen) === true)
      );

      if (schedule) {
        // Generate time slots for this day
        const daySlots = this.generateDaySlots(
          currentDate,
          schedule.openingTime,
          schedule.closingTime,
          durationMin,
          (schedule as any).lunchStartTime ?? (schedule as any).lunchStart,
          (schedule as any).lunchEndTime ?? (schedule as any).lunchEnd
        );

        // Check which slots have no conflicts
        const existingAppointments = await this.prisma.appointment.findMany({
          where: {
            clinicId,
            appointmentDate: {
              gte: currentDate,
              lt: new Date(currentDate.getTime() + 24 * 60 * 60 * 1000)
            },
            status: { not: 'CANCELLED' }
          }
        });

        const availableSlots = daySlots.filter(slot => {
          const conflict = existingAppointments.some((apt: any) => (apt.appointmentTime ?? apt.time) === slot.time);
          return !conflict;
        });

        slots.push(...availableSlots);
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return slots;
  }

  // ========================================================================
  // PRIVATE HELPER METHODS
  // ========================================================================

  private mapAppointmentResponse(appointment: any): AppointmentResponse {
    const appointmentDate = appointment.appointmentDate instanceof Date
      ? appointment.appointmentDate
      : new Date(appointment.appointmentDate);
    const createdAt = appointment.createdAt instanceof Date ? appointment.createdAt : new Date(appointment.createdAt);
    const updatedAt = appointment.updatedAt instanceof Date ? appointment.updatedAt : new Date(appointment.updatedAt);

    return {
      id: appointment.id,
      tenantId: appointment.tenantId,
      clinicId: appointment.clinicId,
      employeeId: appointment.employeeId,
      companyId: appointment.companyId,
      appointmentDate: appointmentDate.toISOString().split('T')[0],
      appointmentTime: appointment.appointmentTime ?? appointment.time,
      status: appointment.status,
      notes: appointment.notes ?? null,
      serviceIds: appointment.serviceIds ?? [],  // IMPL-20260120-12
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
      clinicName: appointment.clinic?.name,
      companyName: appointment.company?.name
    };
  }

  private generateDaySlots(
    date: Date,
    openingTime: string,
    closingTime: string,
    durationMin: number,
    lunchStart?: string | null,
    lunchEnd?: string | null
  ): AvailabilitySlot[] {
    const slots: AvailabilitySlot[] = [];
    const [openHour, openMin] = openingTime.split(':').map(Number);
    const [closeHour, closeMin] = closingTime.split(':').map(Number);

    let currentTime = new Date(date);
    currentTime.setHours(openHour, openMin, 0, 0);

    const closeTime = new Date(date);
    closeTime.setHours(closeHour, closeMin, 0, 0);

    while (currentTime < closeTime) {
      const timeStr = `${String(currentTime.getHours()).padStart(2, '0')}:${String(currentTime.getMinutes()).padStart(2, '0')}`;

      // Skip lunch break
      if (lunchStart && lunchEnd) {
        if (timeStr >= lunchStart && timeStr < lunchEnd) {
          currentTime.setMinutes(currentTime.getMinutes() + 30); // Skip to after lunch
          continue;
        }
      }

      slots.push({
        clinicId: '',
        date: date.toISOString().split('T')[0],  // Convert Date to ISO string (YYYY-MM-DD)
        time: timeStr,
        durationMin,
        available: true
      });

      currentTime.setMinutes(currentTime.getMinutes() + 30); // 30-min slots
    }

    return slots;
  }
}
