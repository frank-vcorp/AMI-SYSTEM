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

  /**
   * Create a new appointment
   */
  async createAppointment(
    tenantId: string,
    data: CreateAppointmentRequest,
    _createdBy?: string
  ): Promise<AppointmentResponse> {
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
        isActive: true
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
    if (schedule.lunchStartTime && schedule.lunchEndTime) {
      if (appointmentTime >= schedule.lunchStartTime && appointmentTime < schedule.lunchEndTime) {
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
        appointmentTime,
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
        appointmentTime,
        notes: data.notes,
        appointmentServices: {
          createMany: {
            data: data.serviceIds.map(serviceId => ({ serviceId }))
          }
        }
      },
      include: {
        clinic: true,
        company: true,
        appointmentServices: true
      }
    });

    return this.mapAppointmentResponse(appointment);
  }

  /**
   * Get single appointment
   */
  async getAppointment(tenantId: string, appointmentId: string): Promise<AppointmentResponse> {
    const appointment = await this.prisma.appointment.findFirst({
      where: { id: appointmentId, tenantId },
      include: {
        clinic: true,
        company: true,
        appointmentServices: true
      }
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

    const where: any = { tenantId };

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
          company: true,
          appointmentServices: true
        },
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
      const newTime = data.appointmentTime || appointment.appointmentTime;

      // Validate clinic hours (simplified - reuse logic from create)
      const schedule = await this.prisma.clinicSchedule.findFirst({
        where: {
          clinicId: appointment.clinicId,
          dayOfWeek: newDate.getDay(),
          isActive: true
        }
      });

      if (!schedule) {
        throw new ClinicNotAvailableError(appointment.clinicId, newDate);
      }

      if (newTime < schedule.openingTime || newTime > schedule.closingTime) {
        throw new InvalidAppointmentError('Time is outside clinic hours');
      }
    }

    // If updating services, remove old and add new
    if (data.serviceIds) {
      await this.prisma.appointmentService.deleteMany({
        where: { appointmentId }
      });

      await this.prisma.appointmentService.createMany({
        data: data.serviceIds.map(serviceId => ({
          appointmentId,
          serviceId
        }))
      });
    }

    const updated = await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        appointmentDate: data.appointmentDate,
        appointmentTime: data.appointmentTime,
        notes: data.notes,
        status: data.status as any
      },
      include: {
        clinic: true,
        company: true,
        appointmentServices: true
      }
    });

    return this.mapAppointmentResponse(updated);
  }

  /**
   * Cancel appointment
   */
  async cancelAppointment(tenantId: string, appointmentId: string): Promise<void> {
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
    const { clinicId, dateFrom, dateTo, durationMin } = request;

    // Get clinic schedule
    const clinic = await this.prisma.clinic.findFirst({
      where: { id: clinicId, tenantId },
      include: { schedules: true }
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
      const schedule = clinic.schedules?.find((s: any) => s.dayOfWeek === dayOfWeek && s.isActive);

      if (schedule) {
        // Generate time slots for this day
        const daySlots = this.generateDaySlots(
          currentDate,
          schedule.openingTime,
          schedule.closingTime,
          durationMin,
          schedule.lunchStartTime,
          schedule.lunchEndTime
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
          const conflict = existingAppointments.some((apt: any) => apt.appointmentTime === slot.time);
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
    return {
      ...appointment,
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
