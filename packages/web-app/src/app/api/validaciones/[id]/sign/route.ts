/**
 * API Route: POST /api/validaciones/[id]/sign
 * Sign validation task and save verdict
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantIdFromRequest } from "@/lib/auth";
import { getUserIdFromRequest } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = await getTenantIdFromRequest(request);
    const userId = await getUserIdFromRequest(request);

    if (!tenantId || !userId) {
      return NextResponse.json(
        { error: "Auth info not found" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      medicalOpinion,
      verdict,
      restrictions,
      recommendations,
      signatureHash,
    } = body;

    // Validate input
    if (!medicalOpinion || !verdict || !signatureHash) {
      return NextResponse.json(
        { error: "Missing required fields: medicalOpinion, verdict, signatureHash" },
        { status: 400 }
      );
    }

    // Get current validation task
    const currentTask = await prisma.validationTask.findFirst({
      where: {
        id: params.id,
        tenantId,
      },
    });

    if (!currentTask) {
      return NextResponse.json(
        { error: "Validation task not found" },
        { status: 404 }
      );
    }

    // Update validation task with verdict
    const updatedTask = await prisma.validationTask.update({
      where: { id: params.id },
      data: {
        medicalOpinion,
        verdict,
        restrictions: restrictions || [],
        recommendations: recommendations || [],
        status: "SIGNED",
        signedAt: new Date(),
        signedBy: userId,
        updatedAt: new Date(),
      },
    });

    // Update expedient status to VALIDATED
    await prisma.expedient.update({
      where: { id: currentTask.expedientId },
      data: {
        status: "VALIDATED",
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedTask,
      message: "Validation task signed successfully",
    });
  } catch (error) {
    console.error("[POST /api/validaciones/[id]/sign]", error);
    return NextResponse.json(
      { error: "Failed to sign validation task" },
      { status: 500 }
    );
  }
}
