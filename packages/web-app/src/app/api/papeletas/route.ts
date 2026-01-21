/**
 * @impl IMPL-20260121-PROD
 * @route POST /api/papeletas
 * @description Crear papeleta de admisión y guardar en BD
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { studies, tenantId, clinicId, patientName } = await req.json();

    if (!tenantId || !clinicId) {
      return NextResponse.json(
        { error: 'tenantId y clinicId requeridos' },
        { status: 400 }
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
        folio,
        patientName: patientName || 'PACIENTE DEMO',
        description: `Papeleta generada con estudios: ${studies.join(', ')}`,
        status: 'RECEPTION',
        createdAt: new Date(),
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
