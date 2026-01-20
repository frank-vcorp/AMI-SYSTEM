import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@ami/core-database";
import { getTenantIdFromRequest, getUserIdFromRequest } from "@/lib/auth";

/**
 * GET /api/reportes/[id]
 * 
 * Obtener un reporte/certificado por ID
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
        validationTasks: {
          where: { status: "APPROVED" },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!expedient) {
      return NextResponse.json(
        { error: "Expediente no encontrado" },
        { status: 404 }
      );
    }

    if (expedient.validationTasks.length === 0) {
      return NextResponse.json(
        { error: "Expediente no validado aún" },
        { status: 400 }
      );
    }

    const validation = expedient.validationTasks[0];

    return NextResponse.json({
      expedientId: expedient.id,
      patientName: expedient.patient?.name || "N/A",
      patientDOB: expedient.patient?.dateOfBirth?.toISOString() || "N/A",
      clinicName: expedient.clinic?.name || "N/A",
      validatorName: validation.validatedBy || "Sistema",
      validationDate: validation.validatedAt?.toISOString(),
      status: validation.status,
      medicalFindings: validation.findings,
      stampDate: validation.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Error fetching report:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/reportes/[expedientId]/generate
 * 
 * Generar un nuevo certificado de validación
 * Usado después de que un expediente es validado
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = await getTenantIdFromRequest();
    const userId = await getUserIdFromRequest();

    if (!tenantId || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { status, findings } = body;

    // Validar que el expediente existe y pertenece al tenant
    const expedient = await prisma.expedient.findFirst({
      where: {
        id: params.id,
        tenantId,
      },
    });

    if (!expedient) {
      return NextResponse.json(
        { error: "Expediente no encontrado" },
        { status: 404 }
      );
    }

    // Crear o actualizar la tarea de validación
    const validation = await prisma.validationTask.upsert({
      where: { expedientId: params.id },
      update: {
        status,
        findings,
        validatedBy: userId,
        validatedAt: new Date(),
      },
      create: {
        expedientId: params.id,
        status,
        findings,
        validatedBy: userId,
        validatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      validationId: validation.id,
      reportUrl: `/admin/reportes/${params.id}`,
    });
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
