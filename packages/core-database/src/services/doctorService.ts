/**
 * @impl IMPL-20260121-A1
 * @ref context/Plan-Demo-RD-20260121.md
 * Doctor management service
 */

import { prisma } from '../index';

export interface CreateDoctorInput {
  tenantId: string;
  name: string;
  cedula: string;
  specialty: string;
  clinicId: string;
  signature?: Record<string, unknown>;
}

export interface UpdateDoctorInput {
  id: string;
  name?: string;
  cedula?: string;
  specialty?: string;
  signature?: Record<string, unknown> | null;
}

/**
 * Create a new doctor
 */
export async function createDoctor(input: CreateDoctorInput) {
  const { tenantId, name, cedula, specialty, clinicId, signature } = input;

  // Verify clinic exists
  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
  });

  if (!clinic) {
    throw new Error(`Clinic not found: ${clinicId}`);
  }

  // Check cedula uniqueness per tenant
  const existing = await prisma.doctor.findUnique({
    where: { tenantId_cedula: { tenantId, cedula } },
  });

  if (existing) {
    throw new Error(
      `Doctor with cedula ${cedula} already exists in this tenant`
    );
  }

  return prisma.doctor.create({
    data: {
      tenantId,
      name,
      cedula,
      specialty,
      clinicId,
      signature: signature as any || null,
    },
  });
}

/**
 * Get doctor by ID
 */
export async function getDoctor(id: string) {
  return prisma.doctor.findUnique({
    where: { id },
    include: {
      clinic: true,
    },
  });
}

/**
 * List doctors by clinic or tenant
 */
export async function listDoctors(
  tenantId: string,
  clinicId?: string
) {
  return prisma.doctor.findMany({
    where: {
      tenantId,
      ...(clinicId && { clinicId }),
    },
    include: {
      clinic: {
        select: { id: true, name: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Update doctor
 */
export async function updateDoctor(input: UpdateDoctorInput) {
  const { id, ...updateData } = input;

  return prisma.doctor.update({
    where: { id },
    data: updateData as any,
  });
}

/**
 * Delete doctor
 */
export async function deleteDoctor(id: string) {
  return prisma.doctor.delete({
    where: { id },
  });
}

/**
 * Save doctor signature
 */
export async function saveDoctorSignature(
  doctorId: string,
  signatureDataUrl: string
) {
  return prisma.doctor.update({
    where: { id: doctorId },
    data: {
      signature: {
        dataUrl: signatureDataUrl,
        capturedAt: new Date().toISOString(),
      },
    },
  });
}
