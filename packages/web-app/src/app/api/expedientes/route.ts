/**
 * POST /api/expedientes
 * Create a new patient and expedient
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patient, expedient, tenantId } = body;

    // Validate tenant
    if (!tenantId) {
      return NextResponse.json(
        { error: "tenantId is required" },
        { status: 400 }
      );
    }

    // TODO: In production, call Prisma to create patient
    // TODO: Then create expedient with patientId
    // For now, return mock response

    const mockPatientId = `patient_${Date.now()}`;
    const mockExpedientId = `exp_${Date.now()}`;

    return NextResponse.json(
      {
        patientId: mockPatientId,
        expedientId: mockExpedientId,
        status: "DRAFT",
        createdAt: new Date().toISOString(),
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
 * List expedients with filtering
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tenantId = searchParams.get("tenantId");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");
    const status = searchParams.get("status");

    if (!tenantId) {
      return NextResponse.json(
        { error: "tenantId is required" },
        { status: 400 }
      );
    }

    // TODO: In production, query Prisma with filters
    // For now, return mock data

    const mockExpedients = [
      {
        id: "exp_1",
        patientId: "patient_1",
        clinicId: "clinic_1",
        companyId: "company_1",
        status: "DRAFT",
        patient: {
          id: "patient_1",
          name: "Juan Pérez",
          documentId: "123456789",
          email: "juan@example.com",
        },
        medicalExams: [],
        studies: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    return NextResponse.json({
      data: mockExpedients,
      total: mockExpedients.length,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error listing expedients:", error);
    return NextResponse.json(
      { error: "Failed to list expedients" },
      { status: 500 }
    );
  }
}
