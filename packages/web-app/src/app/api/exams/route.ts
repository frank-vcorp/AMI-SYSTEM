/**
 * @impl IMPL-20260121-PROD
 * @route POST /api/exams
 * @description Guardar examen médico completo en BD
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { expedientId, tenantId, examData } = await req.json();

    if (!expedientId || !tenantId || !examData) {
      return NextResponse.json(
        { error: 'expedientId, tenantId, y examData requeridos' },
        { status: 400 }
      );
    }

    // Verificar que el expediente existe
    const expedient = await prisma.expedient.findUnique({
      where: { id: expedientId },
    });

    if (!expedient) {
      return NextResponse.json(
        { error: 'Expediente no encontrado' },
        { status: 404 }
      );
    }

    // Crear examen médico en BD
    const exam = await prisma.medicalExam.create({
      data: {
        tenantId,
        expedientId,
        vitals: examData.vitals || {},
        demographics: examData.demographics || {},
        physicalExam: examData.physicalExam || {},
        vision: examData.vision || {},
        background: examData.background || {},
        aptitude: examData.aptitude || {},
        status: examData.aptitude?.approved ? 'APPROVED' : 'PENDING',
      },
    });

    // Actualizar estado del expediente
    await prisma.expedient.update({
      where: { id: expedientId },
      data: { status: 'MEDICAL_EXAM' },
    });

    return NextResponse.json({
      success: true,
      examId: exam.id,
      message: '✅ Examen médico guardado exitosamente',
    });
  } catch (error) {
    console.error('Error creating exam:', error);
    return NextResponse.json(
      { error: 'Error al guardar examen' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const expedientId = searchParams.get('expedientId');

    if (!expedientId) {
      return NextResponse.json(
        { error: 'expedientId requerido' },
        { status: 400 }
      );
    }

    const exam = await prisma.medicalExam.findFirst({
      where: { expedientId },
      orderBy: { createdAt: 'desc' },
    });

    if (!exam) {
      return NextResponse.json(
        { error: 'Examen no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, exam });
  } catch (error) {
    console.error('Error fetching exam:', error);
    return NextResponse.json(
      { error: 'Error al obtener examen' },
      { status: 500 }
    );
  }
}
