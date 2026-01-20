import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@ami/core-database";
import { getTenantIdFromRequest, getUserIdFromRequest } from "@/lib/auth";

/**
 * POST /api/expedientes/[id]/exam
 * 
 * Agregar un examen médico (signos vitales) al expediente
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

    // Validar que el expediente existe
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

    const body = await req.json();
    const {
      bloodPressure,
      heartRate,
      temperature,
      respiratoryRate,
      height,
      weight,
      notes,
    } = body;

    // Crear examen médico
    const exam = await prisma.medicalExam.create({
      data: {
        expedientId: params.id,
        bloodPressure,
        heartRate,
        temperature,
        respiratoryRate,
        height,
        weight,
        notes,
        tenantId,
        examinedBy: userId,
      },
    });

    return NextResponse.json(
      {
        id: exam.id,
        bloodPressure: exam.bloodPressure,
        heartRate: exam.heartRate,
        temperature: exam.temperature,
        examinedAt: exam.createdAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating medical exam:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/expedientes/[id]/exam
 * 
 * Listar exámenes médicos de un expediente
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

    const exams = await prisma.medicalExam.findMany({
      where: {
        expedientId: params.id,
        tenantId,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      exams,
      count: exams.length,
    });
  } catch (error) {
    console.error("Error fetching medical exams:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
