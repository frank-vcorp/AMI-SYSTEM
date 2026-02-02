/**
 * GET /api/expedientes/[id]
 * Get expedient details with all relations
 *
 * PUT /api/expedientes/[id]
 * Update expedient status and notes
 * 
 * DELETE /api/expedientes/[id]
 * Soft delete expedient
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantIdFromRequest } from "@/lib/auth";

// Default tenant for MVP demo
const DEFAULT_TENANT_ID = '550e8400-e29b-41d4-a716-446655440000';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantId = await getTenantIdFromRequest(_request) || DEFAULT_TENANT_ID;
    const { id } = await params;

    // Fetch expedient with multi-tenant check
    const expedient = await prisma.expedient.findFirst({
      where: { id, tenantId },
      include: {
        patient: true,
        clinic: true,
        medicalExams: { orderBy: { createdAt: "desc" } },
        studies: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!expedient) {
      return NextResponse.json(
        { error: "Expedient not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(expedient);
  } catch (error: any) {
    console.error("Error fetching expedient:", error);
    return NextResponse.json(
      { error: "Failed to fetch expedient" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantId = await getTenantIdFromRequest(request) || DEFAULT_TENANT_ID;
    const { id } = await params;
    const body = await request.json();
    const { status, notes } = body;

    // Fetch current expedient with multi-tenant check
    const expedient = await prisma.expedient.findFirst({
      where: { id, tenantId },
    });

    if (!expedient) {
      return NextResponse.json(
        { error: "Expedient not found" },
        { status: 404 }
      );
    }

    // Validate status transition if provided
    if (status) {
      const validStatuses = [
        "SCHEDULED", "CHECKED_IN", "IN_PHYSICAL_EXAM", "EXAM_COMPLETED",
        "AWAITING_STUDIES", "STUDIES_UPLOADED", "DATA_EXTRACTED",
        "READY_FOR_REVIEW", "IN_VALIDATION", "VALIDATED", "DELIVERED",
        "ARCHIVED", "DRAFT", "CANCELLED"
      ];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: `status must be one of: ${validStatuses.join(", ")}` },
          { status: 400 }
        );
      }

      // Validate state machine transition
      const statusOrder: Record<string, number> = {
        PENDING: 0,
        IN_PROGRESS: 1,
        STUDIES_PENDING: 2,
        VALIDATED: 3,
        COMPLETED: 4,
        ARCHIVED: 5,
      };

      const currentOrder = statusOrder[expedient.status as any];
      const newOrder = statusOrder[status];

      if (newOrder < currentOrder) {
        return NextResponse.json(
          { error: `Cannot transition from ${expedient.status} to ${status}` },
          { status: 400 }
        );
      }
    }

    // Update expedient
    const updated = await prisma.expedient.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { medicalNotes: notes }),
      },
    });

    return NextResponse.json({
      id: updated.id,
      status: updated.status,
      medicalNotes: updated.medicalNotes,
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (error: any) {
    console.error("Error updating expedient:", error);
    return NextResponse.json(
      { error: "Failed to update expedient" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantId = await getTenantIdFromRequest(request) || DEFAULT_TENANT_ID;
    const { id } = await params;

    // Verify expedient exists and belongs to tenant
    const expedient = await prisma.expedient.findFirst({
      where: { id, tenantId },
    });

    if (!expedient) {
      return NextResponse.json(
        { error: "Expedient not found" },
        { status: 404 }
      );
    }

    // Soft delete: update status to ARCHIVED instead of hard delete
    await prisma.expedient.update({
      where: { id },
      data: { status: "ARCHIVED" },
    });

    return NextResponse.json({
      id,
      deleted: true,
      status: "ARCHIVED",
      deletedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error deleting expedient:", error);
    return NextResponse.json(
      { error: "Failed to delete expedient" },
      { status: 500 }
    );
  }
}
