/**
 * API Route: GET /api/validaciones/[id]
 * Get validation task detail
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantIdFromRequest } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    if (!tenantId) {
      return NextResponse.json(
        { error: "Tenant ID not found" },
        { status: 401 }
      );
    }

    const validationTask = await prisma.validationTask.findFirst({
      where: {
        id: params.id,
        tenantId,
      },
      include: {
        expedient: {
          include: {
            patient: {
              include: {
                company: true,
              },
            },
            studies: true,
          },
        },
      },
    });

    if (!validationTask) {
      return NextResponse.json(
        { error: "Validation task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(validationTask);
  } catch (error) {
    console.error("[GET /api/validaciones/[id]]", error);
    return NextResponse.json(
      { error: "Failed to fetch validation task" },
      { status: 500 }
    );
  }
}

/**
 * PATCH: Update validation task (update extracted data)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    if (!tenantId) {
      return NextResponse.json(
        { error: "Tenant ID not found" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { extractedData, medicalOpinion, verdict } = body;

    const validationTask = await prisma.validationTask.update({
      where: { id: params.id },
      data: {
        extractedData: extractedData || undefined,
        medicalOpinion: medicalOpinion || undefined,
        verdict: verdict || undefined,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(validationTask);
  } catch (error) {
    console.error("[PATCH /api/validaciones/[id]]", error);
    return NextResponse.json(
      { error: "Failed to update validation task" },
      { status: 500 }
    );
  }
}
