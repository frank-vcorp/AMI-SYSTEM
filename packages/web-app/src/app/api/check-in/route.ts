/**
 * POST /api/check-in
 * Registrar arribo del paciente mediante escaneo de QR
 * 
 * @impl IMPL-20260202-02
 * @author SOFIA
 * 
 * Flujo:
 * 1. Recibe QR code del paciente
 * 2. Busca cita activa
 * 3. Crea expediente con estado CHECKED_IN
 * 4. Actualiza cita a CHECKED_IN
 * 5. Retorna datos para papeleta
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantIdFromRequest } from "@/lib/auth";

const DEFAULT_TENANT_ID = '550e8400-e29b-41d4-a716-446655440000';

export async function POST(request: NextRequest) {
    try {
        const tenantId = await getTenantIdFromRequest(request) || DEFAULT_TENANT_ID;
        const body = await request.json();
        const { qrCode, appointmentId } = body;

        // Validar que se proporcione al menos uno
        if (!qrCode && !appointmentId) {
            return NextResponse.json(
                { error: "qrCode or appointmentId is required" },
                { status: 400 }
            );
        }

        // Buscar cita activa
        const appointment = await prisma.appointment.findFirst({
            where: {
                tenantId,
                ...(qrCode ? { qrCode } : { id: appointmentId }),
                status: { in: ["PENDING", "CONFIRMED"] }, // Solo citas no atendidas
            },
            include: {
                patient: true,
                clinic: true,
            },
        });

        if (!appointment) {
            return NextResponse.json(
                { error: "Appointment not found or already checked in" },
                { status: 404 }
            );
        }

        // Verificar si ya existe expediente para esta cita
        const existingExpedient = await prisma.expedient.findFirst({
            where: {
                appointmentId: appointment.id,
                tenantId,
            },
        });

        if (existingExpedient) {
            return NextResponse.json(
                {
                    error: "Patient already checked in",
                    expedient: existingExpedient
                },
                { status: 409 }
            );
        }

        // Crear expediente y actualizar cita en transacción
        const result = await prisma.$transaction(async (tx) => {
            // Crear expediente
            const expedient = await tx.expedient.create({
                data: {
                    tenantId,
                    patientId: appointment.patientId!,
                    clinicId: appointment.clinicId,
                    companyId: appointment.companyId,
                    appointmentId: appointment.id,
                    status: "CHECKED_IN",
                    medicalNotes: `Check-in realizado el ${new Date().toISOString()}`,
                },
                include: {
                    patient: true,
                    clinic: true,
                },
            });

            // Actualizar estado de cita
            await tx.appointment.update({
                where: { id: appointment.id },
                data: { status: "CHECK_IN" },
            });

            return expedient;
        });

        return NextResponse.json({
            success: true,
            message: "Check-in successful",
            expedient: result,
            appointment: {
                id: appointment.id,
                appointmentDate: appointment.appointmentDate,
                time: appointment.time,
            },
        }, { status: 201 });

    } catch (error: any) {
        console.error("[POST /api/check-in]", error);
        return NextResponse.json(
            { error: "Failed to process check-in" },
            { status: 500 }
        );
    }
}

/**
 * GET /api/check-in?qrCode=XXX
 * Verificar si un QR es válido sin hacer check-in
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl;
        const qrCode = searchParams.get("qrCode");
        const tenantId = await getTenantIdFromRequest(request) || DEFAULT_TENANT_ID;

        if (!qrCode) {
            return NextResponse.json(
                { error: "qrCode parameter is required" },
                { status: 400 }
            );
        }

        const appointment = await prisma.appointment.findFirst({
            where: {
                tenantId,
                qrCode,
            },
            include: {
                patient: {
                    select: {
                        id: true,
                        name: true,
                        documentId: true,
                    },
                },
                clinic: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        if (!appointment) {
            return NextResponse.json(
                { valid: false, error: "QR code not found" },
                { status: 404 }
            );
        }

        // Verificar si ya hizo check-in
        const expedient = await prisma.expedient.findFirst({
            where: {
                appointmentId: appointment.id,
                tenantId,
            },
        });

        return NextResponse.json({
            valid: true,
            alreadyCheckedIn: !!expedient,
            appointment: {
                id: appointment.id,
                appointmentDate: appointment.appointmentDate,
                time: appointment.time,
                status: appointment.status,
                patient: appointment.patient,
                clinic: appointment.clinic,
            },
            expedient: expedient || null,
        });

    } catch (error: any) {
        console.error("[GET /api/check-in]", error);
        return NextResponse.json(
            { error: "Failed to verify QR code" },
            { status: 500 }
        );
    }
}
