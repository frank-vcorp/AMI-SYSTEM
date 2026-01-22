/**
 * ⚙️ IMPL REFERENCE: IMPL-20260121-02
 * 📄 SEE: context/SPEC-MVP-DEMO-APIS.md
 * 🤖 AUTHOR: SOFIA (Claude Opus 4.5)
 * 
 * API Routes para Horarios de Clínica
 * GET  /api/clinicas/[id]/schedules - Obtener horarios de la clínica
 * POST /api/clinicas/[id]/schedules - Configurar horarios
 * PUT  /api/clinicas/[id]/schedules - Actualizar horarios
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildTenantFilter } from '@/lib/utils';

const DAYS_OF_WEEK = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clinicId } = await params;
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId') || '550e8400-e29b-41d4-a716-446655440000';

    // Verify clinic exists
    const clinic = await prisma.clinic.findFirst({
      where: { id: clinicId, ...buildTenantFilter(tenantId) },
    });

    if (!clinic) {
      return NextResponse.json(
        { error: 'Clinic not found' },
        { status: 404 }
      );
    }

    // Get schedules
    const schedules = await prisma.clinicSchedule.findMany({
      where: { clinicId },
      orderBy: { dayOfWeek: 'asc' },
    });

    // Map with day names
    const schedulesWithNames = schedules.map(s => ({
      ...s,
      dayName: DAYS_OF_WEEK[s.dayOfWeek],
    }));

    return NextResponse.json({
      clinicId,
      clinicName: clinic.name,
      schedules: schedulesWithNames,
    });
  } catch (error) {
    console.error('[GET /api/clinicas/[id]/schedules]', error);
    return NextResponse.json(
      { error: 'Failed to get clinic schedules' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clinicId } = await params;
    const body = await request.json();
    const tenantId = body.tenantId || '550e8400-e29b-41d4-a716-446655440000';
    const { schedules } = body;

    if (!schedules || !Array.isArray(schedules)) {
      return NextResponse.json(
        { error: 'schedules array is required' },
        { status: 400 }
      );
    }

    // Verify clinic exists
    const clinic = await prisma.clinic.findFirst({
      where: { id: clinicId, ...buildTenantFilter(tenantId) },
    });

    if (!clinic) {
      return NextResponse.json(
        { error: 'Clinic not found' },
        { status: 404 }
      );
    }

    // Create schedules using upsert
    const results = await Promise.all(
      schedules.map(async (schedule: any) => {
        const { dayOfWeek, openingTime, closingTime, lunchStart, lunchEnd, isOpen, maxAppointmentsDay } = schedule;

        return prisma.clinicSchedule.upsert({
          where: {
            clinicId_dayOfWeek: {
              clinicId,
              dayOfWeek,
            },
          },
          update: {
            openingTime,
            closingTime,
            lunchStart: lunchStart || null,
            lunchEnd: lunchEnd || null,
            isOpen: isOpen !== undefined ? isOpen : true,
            maxAppointmentsDay: maxAppointmentsDay || 50,
          },
          create: {
            clinicId,
            dayOfWeek,
            openingTime,
            closingTime,
            lunchStart: lunchStart || null,
            lunchEnd: lunchEnd || null,
            isOpen: isOpen !== undefined ? isOpen : true,
            maxAppointmentsDay: maxAppointmentsDay || 50,
          },
        });
      })
    );

    return NextResponse.json({
      message: 'Schedules saved successfully',
      count: results.length,
      schedules: results.map(s => ({
        ...s,
        dayName: DAYS_OF_WEEK[s.dayOfWeek],
      })),
    }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/clinicas/[id]/schedules]', error);
    return NextResponse.json(
      { error: 'Failed to save clinic schedules' },
      { status: 500 }
    );
  }
}
