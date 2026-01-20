import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@ami/core-database";
import { getTenantIdFromRequest, getUserIdFromRequest } from "@/lib/auth";

/**
 * POST /api/expedientes
 * 
 * Crear un nuevo expediente con paciente
 */
export async function POST(req: NextRequest) {
  try {
    const tenantId = await getTenantIdFromRequest();
    const userId = await getUserIdFromRequest();

    if (!tenantId || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { patientData, clinicId, companyId } = body;

    // Crear o recuperar paciente
    const patient = await prisma.patient.upsert({
      where: {
        documentNumber_tenantId: {
          documentNumber: patientData.documentNumber,
          tenantId,
        },
      },
      create: {
        ...patientData,
        tenantId,
      },
      update: patientData,
    });

    // Crear expediente
    const folio = `EXP-${clinicId}-${Date.now()}`;
    const expedient = await prisma.expedient.create({
      data: {
        folio,
        patientId: patient.id,
        clinicId,
        companyId,
        status: "PENDING",
        tenantId,
        createdBy: userId,
      },
      include: {
        patient: true,
        clinic: true,
      },
    });

    return NextResponse.json(
      {
        id: expedient.id,
        folio: expedient.folio,
        patientId: patient.id,
        status: expedient.status,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating expedient:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/expedientes
 * 
 * Listar expedientes del tenant (con filtros opcionales)
 */
export async function GET(req: NextRequest) {
  try {
    const tenantId = await getTenantIdFromRequest();
    if (!tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const clinicId = searchParams.get("clinicId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = { tenantId };
    if (status) where.status = status;
    if (clinicId) where.clinicId = clinicId;

    const expedients = await prisma.expedient.findMany({
      where,
      include: {
        patient: {
          select: { id: true, name: true, documentNumber: true },
        },
        clinic: {
          select: { id: true, name: true },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.expedient.count({ where });

    return NextResponse.json({
      expedients,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching expedients:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
