/**
 * Page: /admin/validaciones/[id]
 * Validation panel for a specific task
 */

"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ValidatorSideBySide } from "@ami/mod-validacion";
import type { ValidationTask, PatientSummary } from "@ami/mod-validacion";

export default function ValidacionDetailPage() {
  const params = useParams();
  const taskId = params.id as string;

  const [task, setTask] = useState<ValidationTask | null>(null);
  const [patient, setPatient] = useState<PatientSummary | null>(null);
  const [pdfUrls, setPdfUrls] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchValidationTask();
  }, [taskId]);

  const fetchValidationTask = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/validaciones/${taskId}`);
      if (!response.ok) throw new Error("Task not found");

      const data = await response.json();

      // Map task data
      setTask({
        id: data.id,
        expedientId: data.expedientId,
        patientId: data.patientId,
        clinicId: data.clinicId,
        tenantId: data.tenantId,
        status: data.status,
        studies: data.studies || [],
        extractedData: data.extractedData || {},
        medicalOpinion: data.medicalOpinion || "",
        verdict: data.verdict || "APTO",
        restrictions: data.restrictions || [],
        recommendations: data.recommendations || [],
        signedAt: data.signedAt,
        signedBy: data.signedBy,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
      });

      // Map patient data
      if (data.expedient?.patient) {
        const p = data.expedient.patient;
        setPatient({
          id: p.id,
          name: p.name,
          documentType: p.documentType,
          documentId: p.documentId,
          age: new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear(),
          gender: p.gender,
          company: data.expedient.patient.company
            ? {
                id: data.expedient.patient.company.id,
                name: data.expedient.patient.company.name,
              }
            : undefined,
          jobProfile: undefined, // TODO: fetch from company profile
          vitals: data.expedient?.vitals,
        });
      }

      // TODO: Generate signed PDF URLs from GCP Storage
      // For MVP, using placeholder URLs
      const urls: Record<string, string> = {};
      if (data.studies) {
        data.studies.forEach((study: any) => {
          urls[study.id] = `/api/storage/download?key=${study.fileKey}`;
        });
      }
      setPdfUrls(urls);

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading task");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveValidation = async (
    updatedTask: ValidationTask,
    signature: string
  ) => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/validaciones/${taskId}/sign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          medicalOpinion: updatedTask.medicalOpinion,
          verdict: updatedTask.verdict,
          restrictions: updatedTask.restrictions,
          recommendations: updatedTask.recommendations,
          signatureHash: signature, // In production, hash the signature
        }),
      });

      if (!response.ok) throw new Error("Failed to save validation");

      await response.json();
      alert("✓ Validación guardada y firmada exitosamente");

      // Refresh task
      await fetchValidationTask();
    } catch (err) {
      alert(
        `Error: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando validación...</p>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="p-6 bg-red-50 text-red-900 border border-red-200 rounded-lg">
        <p className="font-semibold">Error al cargar la validación</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  return (
    <ValidatorSideBySide
      task={task}
      patient={patient || undefined}
      pdfUrls={pdfUrls}
      onSave={(updatedTask) => handleSaveValidation(updatedTask, "MOCK-SIGNATURE-DEMO")}
      isLoading={isSaving}
    />
  );
}
