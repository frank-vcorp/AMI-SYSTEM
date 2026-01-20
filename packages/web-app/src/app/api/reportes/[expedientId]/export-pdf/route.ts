/**
 * POST /api/reportes/[expedientId]/export-pdf
 * 
 * Genera un PDF del certificado de validación
 * Usa jsPDF para generar PDF en servidor
 * 
 * Respuesta: Buffer PDF descargable
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTenantIdFromRequest } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { expedientId: string } }
) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { expedientId } = params;

    // TODO: Integración con core-storage
    // 1. Obtener validationTask del expediente
    // 2. Generar PDF con datos
    // 3. Guardar en GCS si es necesario
    // 4. Retornar al cliente

    // Por ahora, placeholder que retorna instrucciones
    return NextResponse.json({
      message: 'PDF Export - En implementación (FASE 1.4)',
      expedientId,
      tenantId,
      next_steps: [
        'Integrar jsPDF o pdfkit',
        'Obtener datos de BD (expedient + validationTask)',
        'Generar PDF con certificado',
        'Guardar en GCS via core-storage',
        'Retornar URL descargable'
      ]
    });
  } catch (error) {
    console.error('Error en export-pdf:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
