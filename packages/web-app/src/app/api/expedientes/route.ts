/**
 * API Routes para MOD-EXPEDIENTES
 * 
 * POST   /api/expedientes          - Crear expediente desde cita
 * GET    /api/expedientes          - Listar expedientes con filtros
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Tenant por defecto para MVP demo
const DEFAULT_TENANT_ID = '550e8400-e29b-41d4-a716-446655440000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { appointmentId, patientId, clinicId, notes, tenantId: bodyTenantId } = body;

    // Usar tenantId del body o el default
    const tenantId = bodyTenantId || DEFAULT_TENANT_ID;

    if (!patientId) {
      return NextResponse.json(
        { error: "patientId es requerido" },
        { status: 400 }
      );
    }

    if (!clinicId) {
      return NextResponse.json(
        { error: "clinicId es requerido" },
        { status: 400 }
      );
    }

    // Validar que el paciente existe
    const patient = await prisma.patient.findFirst({
      where: { id: patientId },
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Paciente no encontrado" },
        { status: 404 }
      );
    }

    // Validar que la clínica existe
    const clinic = await prisma.clinic.findFirst({
      where: { id: clinicId },
    });

    if (!clinic) {
      return NextResponse.json(
        { error: "Clínica no encontrada" },
        { status: 404 }
      );
    }

    // Generar folio único
    const count = await prisma.expedient.count({
      where: { tenantId, clinicId },
    });

    const folio = `EXP-${clinicId.substring(0, 4).toUpperCase()}-${String(count + 1).padStart(6, "0")}`;

    // Crear expediente
    const expedient = await prisma.expedient.create({
      data: {
        tenantId,
        patientId,
        clinicId,
        appointmentId: appointmentId || null,
        folio,
        status: "DRAFT", // Borrador hasta check-in
        medicalNotes: notes || "",
      },
      include: {
        patient: true,
        clinic: true,
      },
    });

    return NextResponse.json(expedient, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating expedient:", error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: "Failed to create expedient", details: message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    // Usar tenantId del query o el default para MVP demo
    const tenantId = searchParams.get("tenantId") || DEFAULT_TENANT_ID;

    const clinicId = searchParams.get("clinicId");
    const patientId = searchParams.get("patientId");
    const status = searchParams.get("status");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSize = Math.min(50, parseInt(searchParams.get("pageSize") || "20"));

    // Build where clause
    const where: any = { tenantId };
    if (clinicId) where.clinicId = clinicId;
    if (patientId) where.patientId = patientId;
    if (status) where.status = status;

    // Fetch expedients with pagination
    const [expedients, total] = await Promise.all([
      prisma.expedient.findMany({
        where,
        include: {
          patient: true,
          clinic: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.expedient.count({ where }),
    ]);

    return NextResponse.json({
      data: expedients,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error: any) {
    console.error("Error fetching expedients:", error);
    return NextResponse.json(
      { error: "Failed to fetch expedients" },
      { status: 500 }
    );
  }
}
