/**
 * ⚙️ IMPL REFERENCE: IMPL-20260121-02
 * 📄 SEE: context/SPEC-MVP-DEMO-APIS.md
 * 🤖 AUTHOR: SOFIA (Claude Opus 4.5)
 * 
 * API para Disponibilidad de Clínica
 * GET /api/clinicas/[id]/availability - Obtener slots disponibles para una fecha
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildTenantFilter, isUuid } from '@/lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clinicId } = await params;
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId') || 'default-tenant';
    const dateStr = searchParams.get('date'); // Format: YYYY-MM-DD
    const durationMin = parseInt(searchParams.get('durationMin') || '30');

    if (!dateStr) {
      return NextResponse.json(
        { error: 'date parameter is required (format: YYYY-MM-DD)' },
        { status: 400 }
      );
    }

    // Verify clinic exists
    const clinic = await prisma.clinic.findFirst({
      where: { id: clinicId, ...buildTenantFilter(tenantId) },
      include: {
        schedules: true,
      },
    });

    if (!clinic) {
      return NextResponse.json(
        { error: 'Clinic not found' },
        { status: 404 }
      );
    }

    const requestedDate = new Date(dateStr);
    const dayOfWeek = requestedDate.getDay();

    // Find schedule for this day
    const schedule = clinic.schedules.find(s => s.dayOfWeek === dayOfWeek);

    if (!schedule || !schedule.isOpen) {
      return NextResponse.json({
        clinicId,
        clinicName: clinic.name,
        date: dateStr,
        isOpen: false,
        message: 'Clinic is closed on this day',
        slots: [],
        totalSlots: 0,
      });
    }

    // Get existing appointments for this date
    const startOfDay = new Date(dateStr);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(dateStr);
    endOfDay.setHours(23, 59, 59, 999);

    const appointmentWhere: any = {
      clinicId,
      status: { in: ['PENDING', 'SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'] },
      appointmentDate: {
        gte: startOfDay,
        lte: endOfDay,
      },
    };

    if (isUuid(tenantId)) {
      appointmentWhere.tenantId = tenantId;
    }

    const existingAppointments = await prisma.appointment.findMany({
      where: appointmentWhere,
      select: {
        time: true,
      },
    });

    const bookedTimes = new Set(existingAppointments.map(a => a.time));

    // Generate time slots
    const slots: Array<{
      time: string;
      endTime: string;
      available: boolean;
    }> = [];

    const [openHour, openMin] = schedule.openingTime.split(':').map(Number);
    const [closeHour, closeMin] = schedule.closingTime.split(':').map(Number);

    let slotStart = new Date(requestedDate);
    slotStart.setHours(openHour, openMin, 0, 0);

    const dayEnd = new Date(requestedDate);
    dayEnd.setHours(closeHour, closeMin, 0, 0);

    // Handle lunch break
    let lunchStart: Date | null = null;
    let lunchEnd: Date | null = null;

    if (schedule.lunchStart && schedule.lunchEnd) {
      const [lunchStartH, lunchStartM] = schedule.lunchStart.split(':').map(Number);
      const [lunchEndH, lunchEndM] = schedule.lunchEnd.split(':').map(Number);
      
      lunchStart = new Date(requestedDate);
      lunchStart.setHours(lunchStartH, lunchStartM, 0, 0);
      
      lunchEnd = new Date(requestedDate);
      lunchEnd.setHours(lunchEndH, lunchEndM, 0, 0);
    }

    while (slotStart < dayEnd) {
      const slotEnd = new Date(slotStart.getTime() + durationMin * 60000);

      // Skip lunch time
      let isLunchTime = false;
      if (lunchStart && lunchEnd) {
        isLunchTime = slotStart >= lunchStart && slotStart < lunchEnd;
      }

      if (!isLunchTime && slotEnd <= dayEnd) {
        const timeStr = slotStart.toTimeString().slice(0, 5);
        const endTimeStr = slotEnd.toTimeString().slice(0, 5);
        
        slots.push({
          time: timeStr,
          endTime: endTimeStr,
          available: !bookedTimes.has(timeStr),
        });
      }

      slotStart = slotEnd;
    }

    const availableSlots = slots.filter(s => s.available);

    // Check if max appointments reached
    const appointmentsToday = existingAppointments.length;
    const maxReached = appointmentsToday >= schedule.maxAppointmentsDay;

    return NextResponse.json({
      clinicId,
      clinicName: clinic.name,
      date: dateStr,
      dayOfWeek,
      isOpen: true,
      schedule: {
        openingTime: schedule.openingTime,
        closingTime: schedule.closingTime,
        lunchStart: schedule.lunchStart,
        lunchEnd: schedule.lunchEnd,
        maxAppointmentsDay: schedule.maxAppointmentsDay,
      },
      appointmentsBooked: appointmentsToday,
      maxCapacityReached: maxReached,
      slots,
      totalSlots: slots.length,
      availableSlots: availableSlots.length,
    });
  } catch (error) {
    console.error('[GET /api/clinicas/[id]/availability]', error);
    return NextResponse.json(
      { error: 'Failed to get availability' },
      { status: 500 }
    );
  }
}
