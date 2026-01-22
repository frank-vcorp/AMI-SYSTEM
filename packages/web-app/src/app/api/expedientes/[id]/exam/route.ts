/**
 * POST /api/expedientes/[id]/exam
 * Add medical exam to expedient
 * 
 * Request body:
 * {
 *   bloodPressure: "120/80" (optional, format: "SYS/DIA"),
 *   heartRate: 72 (optional, bpm, range: 40-200),
 *   respiratoryRate: 16 (optional, range: 4-60),
 *   temperature: 37.5 (optional, Celsius, range: 35-42),
 *   weight: 75.5 (optional, kg, range: 2-300),
 *   height: 175 (optional, cm, range: 50-250),
 *   physicalExam: "string" (optional),
 *   notes: "string" (optional)
 * }
 * 
 * Side effect: Changes expedient status to IN_PROGRESS if it was DRAFT
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantIdFromRequest } from "@/lib/auth";

// MVP Demo tenant ID
const DEFAULT_TENANT_ID = '550e8400-e29b-41d4-a716-446655440000';

function validateBloodPressure(bp: string): boolean {
  const match = bp.match(/^(\d{1,3})\/(\d{1,3})$/);
  if (!match) return false;
  const [sys, dia] = [parseInt(match[1]), parseInt(match[2])];
  return sys >= 50 && sys <= 250 && dia >= 30 && dia <= 150 && sys > dia;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantId = await getTenantIdFromRequest(request) || DEFAULT_TENANT_ID;
    const { id } = await params;
    const body = await request.json();
    const {
      bloodPressure,
      heartRate,
      respiratoryRate,
      temperature,
      weight,
      height,
      physicalExam,
      notes,
    } = body;

    // === VERIFY EXPEDIENT EXISTS ===
    const expedient = await prisma.expedient.findFirst({
      where: { id, tenantId },
    });

    if (!expedient) {
      return NextResponse.json(
        { error: "Expedient not found" },
        { status: 404 }
      );
    }

    // === VALIDATIONS ===
    const errors: string[] = [];

    if (bloodPressure) {
      if (!validateBloodPressure(bloodPressure)) {
        errors.push("bloodPressure must be in format SYS/DIA (e.g., 120/80) with valid ranges");
      }
    }

    if (heartRate !== null && heartRate !== undefined) {
      if (!Number.isInteger(heartRate) || heartRate < 40 || heartRate > 200) {
        errors.push("heartRate must be an integer between 40 and 200");
      }
    }

    if (respiratoryRate !== null && respiratoryRate !== undefined) {
      if (!Number.isInteger(respiratoryRate) || respiratoryRate < 4 || respiratoryRate > 60) {
        errors.push("respiratoryRate must be an integer between 4 and 60");
      }
    }

    if (temperature !== null && temperature !== undefined) {
      if (typeof temperature !== "number" || temperature < 35 || temperature > 42) {
        errors.push("temperature must be a number between 35 and 42 (Celsius)");
      }
    }

    if (weight !== null && weight !== undefined) {
      if (typeof weight !== "number" || weight < 2 || weight > 300) {
        errors.push("weight must be a number between 2 and 300 (kg)");
      }
    }

    if (height !== null && height !== undefined) {
      if (!Number.isInteger(height) || height < 50 || height > 250) {
        errors.push("height must be an integer between 50 and 250 (cm)");
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: errors.join("; ") },
        { status: 400 }
      );
    }

    // Create medical exam with Prisma transaction
    const exam = await prisma.$transaction(async (tx: any) => {
      // Create exam
      const medicalExam = await tx.medicalExam.create({
        data: {
          expedientId: id,
          bloodPressure: bloodPressure || null,
          heartRate: heartRate || null,
          respiratoryRate: respiratoryRate || null,
          temperature: temperature || null,
          weight: weight || null,
          height: height || null,
          physicalExam: physicalExam || null,
          notes: notes || null,
        },
      });

      // Update expedient status to IN_PROGRESS if it's PENDING
      if (expedient.status === "PENDING") {
        await tx.expedient.update({
          where: { id },
          data: { status: "IN_PROGRESS" },
        });
      }

      return medicalExam;
    });

    return NextResponse.json(exam, { status: 201 });
  } catch (error: any) {
    console.error("Error adding medical exam:", error);
    return NextResponse.json(
      { error: "Failed to add medical exam" },
      { status: 500 }
    );
  }
}
