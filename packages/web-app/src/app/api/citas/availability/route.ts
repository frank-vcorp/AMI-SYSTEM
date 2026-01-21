/**
 * ⚙️ IMPL REFERENCE: IMPL-20260121-01
 * 📄 SEE: context/SPEC-MVP-DEMO-APIS.md
 * 🤖 AUTHOR: SOFIA (Claude Opus 4.5)
 * 
 * API Routes para Disponibilidad de Citas
 * POST /api/citas/availability - Buscar slots disponibles
 * 
 * FIXED: Removed mockPrisma, now using real Prisma client
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isUuid } from '@/lib/utils';

interface TimeSlot {
  startTime: string;
  endTime: string;
  date: string;
}

/**
 * POST /api/citas/availability
 * Find available appointment slots
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId = 'default-tenant', clinicId, dateFrom, dateTo, durationMin = 30 } = body;

    if (!clinicId || !dateFrom || !dateTo) {
      return NextResponse.json(
        { error: 'clinicId, dateFrom, and dateTo are required' },
        { status: 400 }
      );
    }

    const startDate = new Date(dateFrom);
    const endDate = new Date(dateTo);

    // Get clinic schedules (filter isOpen in code for compatibility)
    const allSchedules = await prisma.clinicSchedule.findMany({
      where: {
        clinicId,
      },
      orderBy: { dayOfWeek: 'asc' },
    });

    // Filter only open schedules
    const schedules = allSchedules.filter((s: any) => s.isOpen !== false);

    if (schedules.length === 0) {
      return NextResponse.json({
        slots: [],
        message: 'No schedules configured for this clinic',
      });
    }

    // Get existing appointments in the date range
    const appointmentWhere: any = {
      clinicId,
      status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] },
      appointmentDate: {
        gte: startDate,
        lte: endDate,
      },
    };
    
    // Only add tenantId filter if it's a valid UUID
    if (isUuid(tenantId)) {
      appointmentWhere.tenantId = tenantId;
    }
    
    const existingAppointments = await prisma.appointment.findMany({
      where: appointmentWhere,
      select: {
        appointmentDate: true,
        time: true,
      },
    });

    // Generate available slots
    const slots: TimeSlot[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const schedule = schedules.find(s => s.dayOfWeek === dayOfWeek);

      if (schedule && schedule.openingTime && schedule.closingTime) {
        // Parse schedule times (format: "HH:MM")
        const [openHour, openMin] = schedule.openingTime.split(':').map(Number);
        const [closeHour, closeMin] = schedule.closingTime.split(':').map(Number);

        // Generate slots for this day
        let slotStart = new Date(currentDate);
        slotStart.setHours(openHour, openMin, 0, 0);

        const dayEnd = new Date(currentDate);
        dayEnd.setHours(closeHour, closeMin, 0, 0);

        while (slotStart < dayEnd) {
          const slotEnd = new Date(slotStart.getTime() + durationMin * 60000);

          if (slotEnd <= dayEnd) {
            // Check if this slot conflicts with existing appointments
            const hasConflict = existingAppointments.some(apt => {
              // Combine appointmentDate with time to create actual appointment datetime
              const aptDate = new Date(apt.appointmentDate);
              const [aptHour, aptMin] = apt.time.split(':').map(Number);
              aptDate.setHours(aptHour, aptMin, 0, 0);
              const aptEnd = new Date(aptDate.getTime() + 30 * 60000); // Default 30 min duration
              return slotStart < aptEnd && slotEnd > aptDate;
            });

            if (!hasConflict) {
              slots.push({
                date: currentDate.toISOString().split('T')[0],
                startTime: slotStart.toTimeString().slice(0, 5),
                endTime: slotEnd.toTimeString().slice(0, 5),
              });
            }
          }

          slotStart = slotEnd;
        }
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return NextResponse.json({
      slots,
      totalSlots: slots.length,
      durationMin,
    });
  } catch (error) {
    console.error('[POST /api/citas/availability]', error);
    return NextResponse.json(
      { error: 'Failed to find available slots' },
      { status: 500 }
    );
  }
}
