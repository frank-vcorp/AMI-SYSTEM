/**
 * API Routes para MOD-EXPEDIENTES
 * 
 * POST   /api/expedientes          - Crear expediente desde cita
 * GET    /api/expedientes          - Listar expedientes con filtros
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantIdFromRequest } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const tenantId = await getTenantIdFromRequest(request);
    const body = await request.json();
    const { appointmentId, patientId, notes } = body;

    if (!appointmentId || !patientId) {
      return NextResponse.json(
        { error: "appointmentId and patientId are required" },
        { status: 400 }
      );
    }

    // Validate that appointment exists and belongs to tenant
    const appointment = await prisma.appointment.findFirst({
      where: { id: appointmentId, tenantId },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Validate that patient exists
    const patient = await prisma.patient.findFirst({
      where: { id: patientId, tenantId },
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Patient not found" },
        { status: 404 }
      );
    }

    // Generate folio
    const count = await prisma.expedient.count({
      where: { tenantId, clinicId: appointment.clinicId },
    });

    // Generate folio: EXP-{CLINIC_ID_SHORT}-{SEQ}
    const folio = `EXP-${appointment.clinicId.substring(0, 4).toUpperCase()}-${String(count + 1).padStart(6, "0")}`;

    // Create expedient
    const expedient = await prisma.expedient.create({
      data: {
        tenantId,
        patientId,
        clinicId: appointment.clinicId,
        appointmentId,
        folio,
        status: "DRAFT",
        notes: notes || "",
      },
      include: {
        patient: true,
        clinic: true,
      },
    });

    return NextResponse.json(expedient, { status: 201 });
  } catch (error: any) {
    console.error("Error creating expedient:", error);
    return NextResponse.json(
      { error: "Failed to create expedient" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tenantId = searchParams.get("tenantId");
    
    if (!tenantId) {
      return NextResponse.json(
        { error: "tenantId is required" },
        { status: 400 }
      );
    }
    
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
