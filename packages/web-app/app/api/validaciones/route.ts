/**
 * IMPL-20260122-01: POST /api/validaciones
 * Create new validation task and initiate workflow
 * @ref context/infraestructura/Detalle-Specs/SPEC-MOD-VALIDACIONES.md
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { expedientId, medicalExamId, assignedToUserId } = body;

    // Validate required fields
    if (!expedientId || !medicalExamId || !assignedToUserId) {
      return NextResponse.json(
        { error: 'Missing required fields: expedientId, medicalExamId, assignedToUserId' },
        { status: 400 }
      );
    }

    // Verify expedient and medical exam exist
    const expedient = await prisma.expedient.findUnique({
      where: { id: expedientId },
      include: {
        medicalExams: true,
        patient: true,
        clinic: true,
        studies: true,
      },
    });

    if (!expedient) {
      return NextResponse.json({ error: 'Expedient not found' }, { status: 404 });
    }

    const medicalExam = expedient.medicalExams.find((e: any) => e.id === medicalExamId);
    if (!medicalExam) {
      return NextResponse.json({ error: 'Medical exam not found' }, { status: 404 });
    }

    // Create validation task
    const validationTask = await (prisma as any).validationTask.create({
      data: {
        tenantId: expedient.tenantId,
        expedientId,
        medicalExamId,
        assignedToUserId,
        status: 'ASSIGNED' as any,
        verdict: 'APTO' as any, // Default verdict
      },
    });

    // TODO: Trigger study data extraction jobs if any pending
    // for (const study of expedient.studies || []) {
    //   Queue extraction job for studies without extracted data yet
    // }

    return NextResponse.json(
      {
        success: true,
        validationTask: {
          id: validationTask.id,
          expedientId: validationTask.expedientId,
          medicalExamId: validationTask.medicalExamId,
          status: validationTask.status,
          createdAt: validationTask.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating validation task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/validaciones
 * List all validation tasks (with filtering)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const expedientId = searchParams.get('expedientId');
    const assignedToUserId = searchParams.get('assignedToUserId');

    const where: any = {};
    if (status) where.status = status;
    if (expedientId) where.expedientId = expedientId;
    if (assignedToUserId) where.assignedToUserId = assignedToUserId;

    const validationTasks = await (prisma as any).validationTask.findMany({
      where,
      include: {
        expedient: {
          include: {
            patient: true,
            clinic: true,
          },
        } as any,
      } as any,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      validationTasks,
    });
  } catch (error) {
    console.error('Error fetching validation tasks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
