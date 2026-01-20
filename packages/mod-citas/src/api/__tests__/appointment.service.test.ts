/**
 * Unit Tests para AppointmentService
 * 
 * @test Gate 2: Testing (Soft Gates INTEGRA v2)
 * @coverage >80%
 * 
 * Pruebas unitarias para CRUD operations, disponibilidad y validaciones
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AppointmentService } from '../appointment.service';
import type {
  CreateAppointmentRequest,
  UpdateAppointmentRequest,
  AppointmentStatus,
  AppointmentListFilters
} from '../../types/appointment';
import {
  AppointmentNotFoundError,
  AppointmentConflictError,
  ClinicNotAvailableError,
  InvalidAppointmentError
} from '../../types/appointment';

// Mock PrismaClient
const mockPrisma = {
  appointment: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
  },
  clinic: {
    findFirst: vi.fn(),
  },
  clinicSchedule: {
    findFirst: vi.fn(),
  },
};

describe('AppointmentService', () => {
  let service: AppointmentService;
  const validTenantId = '550e8400-e29b-41d4-a716-446655440000';
  const validClinicId = '550e8400-e29b-41d4-a716-446655440001';
  const validEmployeeId = '550e8400-e29b-41d4-a716-446655440002';
  const validCompanyId = '550e8400-e29b-41d4-a716-446655440003';

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AppointmentService(mockPrisma as any);
  });

  // ========================================================================
  // CREATE APPOINTMENT TESTS
  // ========================================================================

  describe('createAppointment', () => {
    const validRequest: CreateAppointmentRequest = {
      clinicId: validClinicId,
      employeeId: validEmployeeId,
      companyId: validCompanyId,
      appointmentDate: '2026-01-25',
      appointmentTime: '09:00',
      serviceIds: ['srv-1'],
    };

    it('debe rechazar tenantId inválido (no UUID)', async () => {
      await expect(
        service.createAppointment('invalid-tenant', validRequest)
      ).rejects.toThrow(InvalidAppointmentError);
    });

    it('debe rechazar si clínica no existe', async () => {
      mockPrisma.clinic.findFirst.mockResolvedValue(null);

      await expect(
        service.createAppointment(validTenantId, validRequest)
      ).rejects.toThrow(ClinicNotAvailableError);
    });

    it('debe rechazar si clínica no está abierta ese día', async () => {
      mockPrisma.clinic.findFirst.mockResolvedValue({
        id: validClinicId,
        tenantId: validTenantId,
        name: 'Test Clinic'
      });

      mockPrisma.clinicSchedule.findFirst.mockResolvedValue(null);

      await expect(
        service.createAppointment(validTenantId, validRequest)
      ).rejects.toThrow(ClinicNotAvailableError);
    });

    it('debe rechazar si hora está fuera de horario', async () => {
      mockPrisma.clinic.findFirst.mockResolvedValue({
        id: validClinicId,
        tenantId: validTenantId,
        name: 'Test Clinic'
      });

      mockPrisma.clinicSchedule.findFirst.mockResolvedValue({
        dayOfWeek: 6, // Saturday (2026-01-25 es sábado)
        openingTime: '09:00',
        closingTime: '17:00',
        isOpen: true,
      });

      const invalidRequest = { ...validRequest, appointmentTime: '06:00' };

      await expect(
        service.createAppointment(validTenantId, invalidRequest)
      ).rejects.toThrow(InvalidAppointmentError);
    });

    it('debe rechazar si hay conflicto de horario', async () => {
      mockPrisma.clinic.findFirst.mockResolvedValue({
        id: validClinicId,
        tenantId: validTenantId,
        name: 'Test Clinic'
      });

      mockPrisma.clinicSchedule.findFirst.mockResolvedValue({
        dayOfWeek: 6,
        openingTime: '09:00',
        closingTime: '17:00',
        isOpen: true,
      });

      mockPrisma.appointment.findFirst.mockResolvedValue({
        id: 'existing-apt',
        time: '09:00',
        status: 'CONFIRMED'
      });

      await expect(
        service.createAppointment(validTenantId, validRequest)
      ).rejects.toThrow(AppointmentConflictError);
    });

    it('debe crear cita exitosamente con datos válidos', async () => {
      mockPrisma.clinic.findFirst.mockResolvedValue({
        id: validClinicId,
        tenantId: validTenantId,
        name: 'Test Clinic'
      });

      mockPrisma.clinicSchedule.findFirst.mockResolvedValue({
        dayOfWeek: 6,
        openingTime: '09:00',
        closingTime: '17:00',
        isOpen: true,
      });

      mockPrisma.appointment.findFirst.mockResolvedValue(null);

      mockPrisma.appointment.create.mockResolvedValue({
        id: 'new-apt-123',
        tenantId: validTenantId,
        clinicId: validClinicId,
        employeeId: validEmployeeId,
        companyId: validCompanyId,
        appointmentDate: new Date('2026-01-25'),
        time: '09:00',
        status: 'PENDING',
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        clinic: { id: validClinicId, name: 'Test Clinic' }
      });

      const result = await service.createAppointment(validTenantId, validRequest);

      expect(result).toHaveProperty('id', 'new-apt-123');
      expect(result).toHaveProperty('status', 'PENDING');
      expect(result).toHaveProperty('appointmentTime', '09:00');
      expect(mockPrisma.appointment.create).toHaveBeenCalled();
    });
  });

  // ========================================================================
  // GET APPOINTMENT TESTS
  // ========================================================================

  describe('getAppointment', () => {
    it('debe retornar cita existente', async () => {
      const appointmentId = '550e8400-e29b-41d4-a716-446655440010';
      mockPrisma.appointment.findFirst.mockResolvedValue({
        id: appointmentId,
        tenantId: validTenantId,
        clinicId: validClinicId,
        employeeId: validEmployeeId,
        companyId: validCompanyId,
        appointmentDate: new Date('2026-01-25'),
        time: '09:00',
        status: 'CONFIRMED',
        notes: 'Test note',
        createdAt: new Date(),
        updatedAt: new Date(),
        clinic: { id: validClinicId, name: 'Test Clinic' }
      });

      const result = await service.getAppointment(validTenantId, appointmentId);

      expect(result).toHaveProperty('id', appointmentId);
      expect(result).toHaveProperty('status', 'CONFIRMED');
      expect(mockPrisma.appointment.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id: appointmentId })
        })
      );
    });

    it('debe lanzar error si cita no existe', async () => {
      mockPrisma.appointment.findFirst.mockResolvedValue(null);

      await expect(
        service.getAppointment(validTenantId, 'non-existent-id')
      ).rejects.toThrow(AppointmentNotFoundError);
    });
  });

  // ========================================================================
  // LIST APPOINTMENTS TESTS
  // ========================================================================

  describe('listAppointments', () => {
    it('debe retornar lista paginada vacía', async () => {
      const filters: AppointmentListFilters = {
        tenantId: validTenantId,
        page: 1,
        pageSize: 10
      };

      mockPrisma.appointment.findMany.mockResolvedValue([]);
      mockPrisma.appointment.count.mockResolvedValue(0);

      const result = await service.listAppointments(filters);

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
      expect(result.totalPages).toBe(0);
    });

    it('debe filtrar por clinicId cuando se proporciona', async () => {
      const filters: AppointmentListFilters = {
        tenantId: validTenantId,
        clinicId: validClinicId,
        page: 1,
        pageSize: 10
      };

      mockPrisma.appointment.findMany.mockResolvedValue([
        {
          id: 'apt-1',
          tenantId: validTenantId,
          clinicId: validClinicId,
          employeeId: validEmployeeId,
          companyId: validCompanyId,
          appointmentDate: new Date('2026-01-25'),
          time: '09:00',
          status: 'CONFIRMED',
          createdAt: new Date(),
          updatedAt: new Date(),
          clinic: { id: validClinicId, name: 'Test Clinic' }
        }
      ]);
      mockPrisma.appointment.count.mockResolvedValue(1);

      const result = await service.listAppointments(filters);

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(mockPrisma.appointment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ clinicId: validClinicId })
        })
      );
    });

    it('debe aplicar paginación correctamente', async () => {
      const filters: AppointmentListFilters = {
        tenantId: validTenantId,
        page: 2,
        pageSize: 5
      };

      mockPrisma.appointment.findMany.mockResolvedValue([]);
      mockPrisma.appointment.count.mockResolvedValue(0);

      await service.listAppointments(filters);

      expect(mockPrisma.appointment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5, // (2-1) * 5
          take: 5
        })
      );
    });
  });

  // ========================================================================
  // UPDATE APPOINTMENT TESTS
  // ========================================================================

  describe('updateAppointment', () => {
    const appointmentId = '550e8400-e29b-41d4-a716-446655440010';

    it('debe rechazar tenantId inválido', async () => {
      const updateRequest: UpdateAppointmentRequest = { status: 'CONFIRMED' };

      await expect(
        service.updateAppointment('invalid-tenant', appointmentId, updateRequest)
      ).rejects.toThrow(InvalidAppointmentError);
    });

    it('debe lanzar error si cita no existe', async () => {
      mockPrisma.appointment.findFirst.mockResolvedValue(null);

      const updateRequest: UpdateAppointmentRequest = { notes: 'Updated note' };

      await expect(
        service.updateAppointment(validTenantId, appointmentId, updateRequest)
      ).rejects.toThrow(AppointmentNotFoundError);
    });

    it('debe actualizar cita existente', async () => {
      mockPrisma.appointment.findFirst.mockResolvedValue({
        id: appointmentId,
        tenantId: validTenantId,
        clinicId: validClinicId,
        appointmentDate: new Date('2026-01-25'),
        time: '09:00'
      });

      mockPrisma.appointment.update.mockResolvedValue({
        id: appointmentId,
        tenantId: validTenantId,
        clinicId: validClinicId,
        employeeId: validEmployeeId,
        companyId: validCompanyId,
        appointmentDate: new Date('2026-01-25'),
        time: '09:00',
        status: 'CONFIRMED',
        notes: 'Updated note',
        createdAt: new Date(),
        updatedAt: new Date(),
        clinic: { id: validClinicId, name: 'Test Clinic' }
      });

      const updateRequest: UpdateAppointmentRequest = { 
        notes: 'Updated note',
        status: 'CONFIRMED'
      };

      const result = await service.updateAppointment(validTenantId, appointmentId, updateRequest);

      expect(result).toHaveProperty('notes', 'Updated note');
      expect(result).toHaveProperty('status', 'CONFIRMED');
    });
  });

  // ========================================================================
  // CANCEL APPOINTMENT TESTS
  // ========================================================================

  describe('cancelAppointment', () => {
    const appointmentId = '550e8400-e29b-41d4-a716-446655440010';

    it('debe rechazar tenantId inválido', async () => {
      await expect(
        service.cancelAppointment('invalid-tenant', appointmentId)
      ).rejects.toThrow(InvalidAppointmentError);
    });

    it('debe lanzar error si cita no existe', async () => {
      mockPrisma.appointment.findFirst.mockResolvedValue(null);

      await expect(
        service.cancelAppointment(validTenantId, appointmentId)
      ).rejects.toThrow(AppointmentNotFoundError);
    });

    it('debe cancelar cita existente', async () => {
      mockPrisma.appointment.findFirst.mockResolvedValue({
        id: appointmentId,
        tenantId: validTenantId,
        clinicId: validClinicId,
        status: 'CONFIRMED'
      });

      mockPrisma.appointment.update.mockResolvedValue({
        id: appointmentId,
        status: 'CANCELLED'
      });

      await service.cancelAppointment(validTenantId, appointmentId);

      expect(mockPrisma.appointment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: 'CANCELLED' }
        })
      );
    });
  });

  // ========================================================================
  // AVAILABILITY TESTS
  // ========================================================================

  describe('findAvailableSlots', () => {
    it('debe rechazar tenantId inválido', async () => {
      await expect(
        service.findAvailableSlots('invalid-tenant', {
          clinicId: validClinicId,
          dateFrom: '2026-01-25',
          dateTo: '2026-01-26',
          durationMin: 30
        })
      ).rejects.toThrow(InvalidAppointmentError);
    });

    it('debe lanzar error si clínica no existe', async () => {
      mockPrisma.clinic.findFirst.mockResolvedValue(null);

      await expect(
        service.findAvailableSlots(validTenantId, {
          clinicId: validClinicId,
          dateFrom: '2026-01-25',
          dateTo: '2026-01-26',
          durationMin: 30
        })
      ).rejects.toThrow(ClinicNotAvailableError);
    });

    it('debe retornar slots disponibles', async () => {
      mockPrisma.clinic.findFirst.mockResolvedValue({
        id: validClinicId,
        tenantId: validTenantId,
        schedules: [
          {
            dayOfWeek: 0, // Sunday (2026-01-25 is Sunday)
            openingTime: '09:00',
            closingTime: '12:00',
            isOpen: true,
            lunchStartTime: null,
            lunchEndTime: null
          }
        ]
      });

      mockPrisma.appointment.findMany.mockResolvedValue([]);

      const result = await service.findAvailableSlots(validTenantId, {
        clinicId: validClinicId,
        dateFrom: '2026-01-25',
        dateTo: '2026-01-25',
        durationMin: 30
      });

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('time');
      expect(result[0]).toHaveProperty('date');
    });

    it('debe excluir slots ocupados', async () => {
      mockPrisma.clinic.findFirst.mockResolvedValue({
        id: validClinicId,
        tenantId: validTenantId,
        schedules: [
          {
            dayOfWeek: 6,
            openingTime: '09:00',
            closingTime: '12:00',
            isOpen: true,
            lunchStartTime: null,
            lunchEndTime: null
          }
        ]
      });

      mockPrisma.appointment.findMany.mockResolvedValue([
        {
          appointmentTime: '09:00',
          status: 'CONFIRMED'
        }
      ]);

      const result = await service.findAvailableSlots(validTenantId, {
        clinicId: validClinicId,
        dateFrom: '2026-01-25',
        dateTo: '2026-01-25',
        durationMin: 30
      });

      const slot09 = result.find(s => s.time === '09:00');
      expect(slot09).toBeUndefined();
    });
  });
});
