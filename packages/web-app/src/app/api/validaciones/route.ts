/**
 * API Route: GET /api/validaciones
 * List pending validation tasks with filters
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Tenant por defecto para MVP demo
const DEFAULT_TENANT_ID = '550e8400-e29b-41d4-a716-446655440000';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    // Usar tenantId del query o default para MVP demo
    const tenantId = searchParams.get("tenantId") || DEFAULT_TENANT_ID;

    const status = searchParams.get("status") || undefined;
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: any = { tenantId };
    if (status) {
      where.status = status;
    }

    const validations = await prisma.validationTask.findMany({
      where,
      include: {
        expedient: {
          include: {
            patient: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: offset,
    });

    const total = await prisma.validationTask.count({ where });

    return NextResponse.json({
      data: validations,
      pagination: {
        total,
        limit,
        offset,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[GET /api/validaciones]", error);
    return NextResponse.json(
      { error: "Failed to fetch validations" },
      { status: 500 }
    );
  }
}

/**
 * Create a new validation task (internal use)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { expedientId, tenantId: bodyTenantId } = body;

    // Get tenantId from body or use default for MVP demo
    const tenantId = bodyTenantId || DEFAULT_TENANT_ID;

    if (!expedientId) {
      return NextResponse.json(
        { error: "expedientId is required" },
        { status: 400 }
      );
    }

    // Fetch expedient with related data
    const expedient = await prisma.expedient.findUnique({
      where: { id: expedientId },
      include: {
        patient: true,
        studies: true,
        medicalExams: { take: 1, orderBy: { createdAt: "desc" } },
      },
    });

    if (!expedient) {
      return NextResponse.json(
        { error: "Expedient not found" },
        { status: 404 }
      );
    }

    // === VALIDAR COMPLETITUD DEL EXPEDIENTE ===
    // Solo crear tarea si el expediente está completo
    const hasExam = expedient.medicalExams && expedient.medicalExams.length > 0;
    const hasStudies = expedient.studies && expedient.studies.length > 0;
    const allStudiesProcessed = expedient.studies?.every(
      (s: any) => s.status === "EXTRACTED" || s.status === "VALIDATED"
    );

    if (!hasExam) {
      return NextResponse.json(
        { error: "Cannot create validation task: expedient has no medical exam" },
        { status: 400 }
      );
    }

    if (hasStudies && !allStudiesProcessed) {
      return NextResponse.json(
        {
          error: "Cannot create validation task: some studies are still being processed",
          pendingStudies: expedient.studies?.filter((s: any) =>
            s.status !== "EXTRACTED" && s.status !== "VALIDATED"
          )
        },
        { status: 400 }
      );
    }

    // Verificar que no exista ya una tarea de validación
    const existingTask = await prisma.validationTask.findFirst({
      where: { expedientId, tenantId },
    });

    if (existingTask) {
      return NextResponse.json(
        { error: "Validation task already exists for this expedient", task: existingTask },
        { status: 409 }
      );
    }

    // Crear tarea de validación y actualizar estado del expediente
    const validationTask = await prisma.$transaction(async (tx) => {
      // Actualizar estado del expediente
      await tx.expedient.update({
        where: { id: expedientId },
        data: { status: "READY_FOR_REVIEW" },
      });

      // Crear tarea
      return tx.validationTask.create({
        data: {
          tenantId,
          expedientId,
          patientId: expedient.patientId,
          clinicId: expedient.clinicId,
          medicalExamId: expedient.medicalExams[0]?.id || null,
          status: "PENDING",
          extractedDataSummary: {},
          medicalOpinion: "",
          verdict: "APTO",
        },
      });
    });

    return NextResponse.json(validationTask, { status: 201 });
  } catch (error) {
    console.error("[POST /api/validaciones]", error);
    return NextResponse.json(
      { error: "Failed to create validation task" },
      { status: 500 }
    );
  }
}
