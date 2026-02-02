/**
 * /admin/expedientes/[id]
 * View and manage expedient details (server component)
 */

import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ExpedientPageClient } from "./ExpedientPageClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

// MVP Demo tenant ID
const DEFAULT_TENANT_ID = '550e8400-e29b-41d4-a716-446655440000';

async function getExpedient(id: string) {
  try {
    // Direct database query instead of fetch to avoid URL issues in Vercel SSR
    const expedient = await prisma.expedient.findFirst({
      where: {
        id,
        tenantId: DEFAULT_TENANT_ID
      },
      include: {
        patient: true,
        clinic: true,
        appointment: true,
        medicalExams: {
          orderBy: { createdAt: 'desc' }
        },
        studies: {
          orderBy: { createdAt: 'desc' }
        },
      },
    });

    if (!expedient) return null;

    // Map to the format expected by ExpedientDetail component
    const nameParts = expedient.patient.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    return {
      id: expedient.id,
      folio: expedient.folio || '',
      status: String(expedient.status),
      notes: expedient.medicalNotes || '',
      createdAt: expedient.createdAt.toISOString(),
      updatedAt: expedient.updatedAt.toISOString(),
      patient: {
        id: expedient.patient.id,
        firstName,
        lastName,
        birthDate: expedient.patient.birthDate?.toISOString(),
        documentId: expedient.patient.documentId,
      },
      clinic: {
        id: expedient.clinic.id,
        name: expedient.clinic.name,
      },
      medicalExams: expedient.medicalExams.map(exam => ({
        id: exam.id,
        bloodPressure: exam.bloodPressure || undefined,
        heartRate: exam.heartRate || undefined,
        respiratoryRate: exam.respiratoryRate || undefined,
        temperature: exam.temperature ? Number(exam.temperature) : undefined,
        weight: exam.weight ? Number(exam.weight) : undefined,
        height: exam.height ? Number(exam.height) : undefined,
        physicalExamNotes: exam.physicalExam || undefined,
        notes: exam.notes || undefined,
        createdAt: exam.createdAt.toISOString(),
      })),
      studies: expedient.studies.map(study => ({
        id: study.id,
        studyType: study.type,
        fileName: study.fileName,
        fileSize: study.fileSizeBytes || 0,
        fileKey: study.fileUrl,
        createdAt: study.createdAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("[getExpedient] Error fetching expedient:", error);
    return null;
  }
}

export default async function ExpedientDetailPage({ params }: PageProps) {
  const { id } = await params;
  const expedient = await getExpedient(id);

  if (!expedient) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-red-300 bg-red-50 p-4">
          <h3 className="text-sm font-semibold text-red-900">Error</h3>
          <p className="mt-1 text-sm text-red-700">Could not load expedient details.</p>
          <Link
            href="/admin/expedientes"
            className="mt-4 inline-flex justify-center rounded-md border border-transparent bg-red-600 py-2 px-4 text-sm font-medium text-white hover:bg-red-700"
          >
            Back to List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expediente Médico</h1>
          <p className="mt-1 text-gray-600">{expedient.folio}</p>
        </div>
        <Link
          href="/admin/expedientes"
          className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Volver a Lista
        </Link>
      </div>

      <ExpedientPageClient expedient={expedient} />
    </div>
  );
}
