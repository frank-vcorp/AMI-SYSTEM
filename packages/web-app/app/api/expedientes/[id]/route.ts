import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@ami/core-database";
import { getTenantIdFromRequest } from "@/lib/auth";

/**
 * GET /api/expedientes/[id]
 * 
 * Obtener un expediente con toda su información
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = await getTenantIdFromRequest();
    if (!tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const expedient = await prisma.expedient.findFirst({
      where: {
        id: params.id,
        tenantId,
      },
      include: {
        patient: true,
        clinic: true,
        medicalExams: true,
        studies: true,
        validationTasks: true,
      },
    });

    if (!expedient) {
      return NextResponse.json(
        { error: "Expediente no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(expedient);
  } catch (error) {
    console.error("Error fetching expedient:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/expedientes/[id]
 * 
 * Actualizar estado o datos del expediente
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = await getTenantIdFromRequest();
    if (!tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { status, notes } = body;

    const expedient = await prisma.expedient.update({
      where: {
        id: params.id,
      },
      data: {
        ...(status && { status }),
        ...(notes && { notes }),
      },
      include: {
        patient: true,
        clinic: true,
      },
    });

    return NextResponse.json(expedient);
  } catch (error) {
    console.error("Error updating expedient:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/expedientes/[id]
 * 
 * Borrar un expediente (soft delete)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = await getTenantIdFromRequest();
    if (!tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.expedient.update({
      where: { id: params.id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting expedient:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
