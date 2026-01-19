/**
 * POST /api/expedientes
 * Create a new patient and expedient with transaction
 * 
 * Request body:
 * {
 *   patient: { name, email, phone, birthDate, gender, documentId },
 *   expedient: { clinicId, companyId },
 *   tenantId
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@ami/core-database";

// Validation helpers
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone: string): boolean {
  return /^[\d\s+\-()]{7,20}$/.test(phone);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patient, expedient, tenantId } = body;

    // === VALIDATIONS ===
    if (!tenantId) {
      return NextResponse.json(
        { error: "tenantId is required" },
        { status: 400 }
      );
    }

    if (!patient) {
      return NextResponse.json(
        { error: "patient data is required" },
        { status: 400 }
      );
    }

    const { name, email, phone, birthDate, gender, documentId } = patient;

    // Required fields validation
    if (!name || !email || !phone || !birthDate || !gender || !documentId) {
      return NextResponse.json(
        { error: "patient.name, email, phone, birthDate, gender, documentId are required" },
        { status: 400 }
      );
    }

    // Email validation
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Phone validation
    if (!isValidPhone(phone)) {
      return NextResponse.json(
        { error: "Invalid phone format" },
        { status: 400 }
      );
    }

    // Gender enum validation
    const validGenders = ["MASCULINO", "FEMENINO", "OTRO"];
    if (!validGenders.includes(gender)) {
      return NextResponse.json(
        { error: `gender must be one of: ${validGenders.join(", ")}` },
        { status: 400 }
      );
    }

    // Expedient data validation
    if (!expedient || !expedient.clinicId) {
      return NextResponse.json(
        { error: "expedient.clinicId is required" },
        { status: 400 }
      );
    }

    // === CHECK EXISTING PATIENT ===
    const existingPatient = await prisma.patient.findFirst({
      where: {
        OR: [
          { tenantId, documentNumber: documentId },
          { tenantId, email },
        ],
      },
    });

    if (existingPatient) {
      const conflictField = existingPatient.documentNumber === documentId ? "documentNumber" : "email";
      return NextResponse.json(
        { error: `Patient with this ${conflictField} already exists in this tenant` },
        { status: 409 }
      );
    }

    // === CHECK CLINIC EXISTS ===
    const clinic = await prisma.clinic.findUnique({
      where: { id: expedient.clinicId },
    });

    if (!clinic) {
      return NextResponse.json(
        { error: "Clinic not found" },
        { status: 404 }
      );
    }

    // === CHECK COMPANY EXISTS (if provided) ===
    if (expedient.companyId) {
      const company = await prisma.company.findUnique({
        where: { id: expedient.companyId },
      });

      if (!company) {
        return NextResponse.json(
          { error: "Company not found" },
          { status: 404 }
        );
      }
    }

    // === CREATE PATIENT & EXPEDIENT IN TRANSACTION ===
    const result = await prisma.$transaction(async (tx) => {
      const newPatient = await tx.patient.create({
        data: {
          tenantId,
          name,
          email,
          phoneNumber: phone,
          dateOfBirth: new Date(birthDate),
          gender,
          documentNumber: documentId,
          status: "ACTIVE",
        },
      });

      const newExpedient = await tx.expedient.create({
        data: {
          tenantId,
          patientId: newPatient.id,
          clinicId: expedient.clinicId,
          folio: `EXP-${expedient.clinicId}-${Date.now()}`,
          status: "PENDING",
          medicalNotes: null,
        },
      });

      return { patient: newPatient, expedient: newExpedient };
    });

    return NextResponse.json(
      {
        patientId: result.patient.id,
        expedientId: result.expedient.id,
        status: result.expedient.status,
        createdAt: result.expedient.createdAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating expedient:", error);
    return NextResponse.json(
      { error: "Failed to create expedient" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/expedientes
 * List expedients with filtering, pagination, and relations
 * 
 * Query params:
 * - tenantId (required)
 * - limit (optional, default: 10, max: 100)
 * - offset (optional, default: 0)
 * - status (optional, filter by ExpedientStatus)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tenantId = searchParams.get("tenantId");
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");
    const status = searchParams.get("status");

    if (!tenantId) {
      return NextResponse.json(
        { error: "tenantId is required" },
        { status: 400 }
      );
    }

    // Build where clause
    const where: any = { tenantId };
    if (status) {
      const validStatuses = ["DRAFT", "IN_PROGRESS", "COMPLETED", "SIGNED", "DELIVERED"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: `status must be one of: ${validStatuses.join(", ")}` },
          { status: 400 }
        );
      }
      where.status = status;
    }

    // Query with pagination and relations
    const [expedients, total] = await Promise.all([
      prisma.expedient.findMany({
        where,
        include: {
          patient: {
            select: {
              id: true,
              name: true,
              email: true,
              documentNumber: true,
            },
          },
          medicalExams: {
            select: {
              id: true,
              bloodPressure: true,
              heartRate: true,
              temperature: true,
              createdAt: true,
            },
          },
          studies: {
            select: {
              id: true,
              studyType: true,
              fileName: true,
              uploadedAt: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
        skip: offset,
      }),
      prisma.expedient.count({ where }),
    ]);

    return NextResponse.json({
      data: expedients.map((exp) => ({
        id: exp.id,
        patientId: exp.patientId,
        clinicId: exp.clinicId,
        status: exp.status,
        patient: exp.patient,
        medicalExamsCount: exp.medicalExams.length,
        studiesCount: exp.studies.length,
        createdAt: exp.createdAt.toISOString(),
        updatedAt: exp.updatedAt.toISOString(),
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Error listing expedients:", error);
    return NextResponse.json(
      { error: "Failed to list expedients" },
      { status: 500 }
    );
  }
}
