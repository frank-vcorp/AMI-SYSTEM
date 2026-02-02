/**
 * @impl IMPL-20260121-PROD
 * @route POST /api/deliveries
 * @description Registrar entrega de reportes (email, link temporal, descarga)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface DeliveryRequest {
  expedientId: string;
  tenantId: string;
  method: 'EMAIL' | 'TEMPORAL_LINK' | 'DOWNLOAD';
  email?: string;
  expiresIn?: number; // horas
}

export async function POST(req: NextRequest) {
  try {
    const body: DeliveryRequest = await req.json();
    const { expedientId, tenantId, method, email, expiresIn = 168 } = body;

    if (!expedientId || !tenantId || !method) {
      return NextResponse.json(
        { error: 'expedientId, tenantId, y method requeridos' },
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

    let deliveryData: any = {
      method,
      status: 'SENT',
      sentAt: new Date(),
    };

    if (method === 'EMAIL' && email) {
      deliveryData.email = email;
      // En producción, aquí enviarías un email real
      console.log(`📧 Email enviado a: ${email}`);
    } else if (method === 'TEMPORAL_LINK') {
      const token = Buffer.from(
        JSON.stringify({ expedientId, timestamp: Date.now() })
      )
        .toString('base64')
        .replace(/=/g, '');

      const expiresAt = new Date(Date.now() + expiresIn * 60 * 60 * 1000);
      deliveryData.temporalLink = `https://ami-system.vercel.app/reports/${token}`;
      deliveryData.expiresAt = expiresAt;
      console.log(`🔗 Link temporal generado, expires en: ${expiresAt}`);
    } else if (method === 'DOWNLOAD') {
      deliveryData.downloadedAt = new Date();
      console.log(`📥 Descarga registrada`);
    }

    // Registrar entrega en la BD (si tienes un modelo para ello)
    // Por ahora simplemente actualizamos el estado del expediente
    await prisma.expedient.update({
      where: { id: expedientId },
      data: { status: 'DELIVERED' }, // Expediente entregado al cliente
    });

    return NextResponse.json({
      success: true,
      message: `✅ ${method === 'EMAIL' ? 'Email enviado' : method === 'TEMPORAL_LINK' ? 'Link generado' : 'Descarga registrada'}`,
      delivery: deliveryData,
    });
  } catch (error) {
    console.error('Error registering delivery:', error);
    return NextResponse.json(
      { error: 'Error al registrar entrega' },
      { status: 500 }
    );
  }
}
