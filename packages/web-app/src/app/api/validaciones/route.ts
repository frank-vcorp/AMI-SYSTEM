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
      },
    });

    if (!expedient) {
      return NextResponse.json(
        { error: "Expedient not found" },
        { status: 404 }
      );
    }

    // Create validation task
    const validationTask = await prisma.validationTask.create({
      data: {
        tenantId,
        expedientId,
        patientId: expedient.patientId,
        clinicId: expedient.clinicId,
        status: "PENDING",
        studies: expedient.studies.map((s) => ({
          id: s.id,
          fileKey: s.fileKey,
          fileName: s.fileName,
          studyType: s.studyType,
          uploadedAt: s.uploadedAt.toISOString(),
          extractionStatus: "PENDING",
        })),
        extractedData: {},
        medicalOpinion: "",
        verdict: "APTO",
      },
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
