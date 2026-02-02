/**
 * @impl IMPL-20260121-PROD-FIX
 * @route POST /api/papeletas
 * @description Crear papeleta de admisión y guardar en BD
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { studies, tenantId, clinicId, patientId } = await req.json();

    if (!tenantId || !clinicId || !patientId) {
      return NextResponse.json(
        { error: 'tenantId, clinicId, y patientId requeridos' },
        { status: 400 }
      );
    }

    // Verificar que el paciente existe
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      return NextResponse.json(
        { error: 'Paciente no encontrado' },
        { status: 404 }
      );
    }

    // Generar folio único
    const folio = `EXP-${clinicId.substring(0, 4).toUpperCase()}-${new Date()
      .toISOString()
      .split('T')[0]
      .replace(/-/g, '')}-${String(Date.now()).slice(-3)}`;

    // Crear expediente en BD
    const expedient = await prisma.expedient.create({
      data: {
        tenantId,
        clinicId,
        patientId,
        folio,
        status: 'DRAFT',
        medicalNotes: `Papeleta generada con ${studies?.length || 0} estudios`,
      },
    });

    return NextResponse.json({
      success: true,
      folio,
      expedientId: expedient.id,
      message: '✅ Papeleta guardada exitosamente',
    });
  } catch (error) {
    console.error('Error creating papeleta:', error);
    return NextResponse.json(
      { error: 'Error al guardar papeleta' },
      { status: 500 }
    );
  }
}
