/**
 * /admin/expedientes/[id]
 * View expedient details
 */

"use client";

import React, { useState, useEffect } from "react";
import { ExpeditentDetail } from "@ami/mod-expedientes";
import { ExpedientDTO } from "@ami/mod-expedientes";
import { use } from "react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ExpedientDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const [expedient, setExpedient] = useState<ExpedientDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // TODO: In production, fetch from API
    const loadExpedient = async () => {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        const mockData: ExpedientDTO = {
          id,
          patientId: "patient_1",
          clinicId: "clinic_1",
          companyId: "company_1",
          status: "IN_PROGRESS",
          notes: "Regular health check",
          patient: {
            id: "patient_1",
            name: "Juan Pérez García",
            email: "juan@example.com",
            phone: "+55 11 99999-9999",
            birthDate: "1980-05-15",
            gender: "MASCULINO",
            documentId: "123456789",
            status: "ACTIVE",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          medicalExams: [
            {
              id: "exam_1",
              expedientId: id,
              bloodPressure: "120/80",
              heartRate: 72,
              respiratoryRate: 16,
              temperature: 37.0,
              weight: 75.5,
              height: 175,
              physicalExam: "Normal findings, no abnormalities detected",
              notes: "Patient reports good general health",
              examinedAt: new Date().toISOString(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
          studies: [
            {
              id: "study_1",
              expedientId: id,
              type: "RADIOGRAPHY",
              fileName: "chest_xray.pdf",
              fileUrl: "https://storage.example.com/studies/chest_xray.pdf",
              mimeType: "application/pdf",
              fileSizeBytes: 2048000,
              status: "COMPLETED",
              uploadedAt: new Date().toISOString(),
              createdAt: new Date().toISOString(),
            },
            {
              id: "study_2",
              expedientId: id,
              type: "LABORATORY",
              fileName: "blood_test.pdf",
              fileUrl: "https://storage.example.com/studies/blood_test.pdf",
              mimeType: "application/pdf",
              fileSizeBytes: 1024000,
              status: "COMPLETED",
              uploadedAt: new Date().toISOString(),
              createdAt: new Date().toISOString(),
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setExpedient(mockData);
      } catch (err) {
        setError("Error loading expedient");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadExpedient();
  }, [id]);

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      // TODO: In production, call PATCH /api/expedientes/{id}
      if (expedient) {
        setExpedient({
          ...expedient,
          status: newStatus as any,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      setError("Error updating status");
      console.error(err);
    }
  };

  const handleDownloadStudy = (studyId: string) => {
    // TODO: In production, generate signed URL from storage
    const study = expedient?.studies?.find((s) => s.id === studyId);
    if (study) {
      window.open(study.fileUrl, "_blank");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-gray-500">Cargando expediente...</div>
      </div>
    );
  }

  if (error || !expedient) {
    return (
      <div className="p-4 bg-red-100 text-red-800 rounded-lg">
        {error || "Expediente no encontrado"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => window.history.back()}
          className="text-blue-600 hover:text-blue-800 mb-4"
        >
          ← Volver
        </button>
      </div>

      <ExpeditentDetail
        expedient={expedient}
        onUpdateStatus={handleUpdateStatus}
        onDownloadStudy={handleDownloadStudy}
      />
    </div>
  );
}
