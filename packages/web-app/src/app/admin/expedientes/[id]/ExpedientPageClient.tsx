"use client";

/**
 * Client component for expedient detail page interactions
 * IMPL-20260123-10
 */

import { useRouter } from "next/navigation";
import { ExpedientDetail, MedicalExamFullForm, StudyUploadZone } from "@ami/mod-expedientes";

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  birthDate?: string;
  documentId?: string;
}

interface Clinic {
  id: string;
  name: string;
}

interface MedicalExam {
  id: string;
  bloodPressure?: string;
  heartRate?: number;
  respiratoryRate?: number;
  temperature?: number;
  weight?: number;
  height?: number;
  physicalExamNotes?: string;
  notes?: string;
  createdAt: string;
}

interface Study {
  id: string;
  studyType: string;
  fileName: string;
  fileSize: number;
  fileKey: string;
  createdAt: string;
}

interface Expedient {
  id: string;
  folio: string;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  patient: Patient;
  clinic: Clinic;
  medicalExams?: MedicalExam[];
  studies?: Study[];
}

interface ExpedientPageClientProps {
  expedient: Expedient;
}

export function ExpedientPageClient({ expedient }: ExpedientPageClientProps) {
  const router = useRouter();

  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/expedientes/${expedient.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update status");
      router.refresh();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Error updating status");
    }
  };

  const handleExamSubmit = async (data: unknown) => {
    try {
      const response = await fetch(`/api/expedientes/${expedient.id}/exam`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save exam");
      }

      alert("✅ Examen guardado correctamente");
      router.refresh();
    } catch (error) {
      console.error("Error saving exam:", error);
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleStudySuccess = () => {
    router.refresh();
  };

  const handleStudyError = (error: Error) => {
    console.error("Error uploading study:", error);
    alert(`Error: ${error.message}`);
  };

  return (
    <div className="space-y-6">
      {/* Detail View */}
      <div className="rounded-lg border border-gray-300 bg-white p-6">
        <ExpedientDetail
          expedient={expedient}
          onStatusChange={handleStatusChange}
        />
      </div>

      {/* Medical Exams Section */}
      <div className="rounded-lg border border-gray-300 bg-white p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Examen Médico Completo</h2>
        <MedicalExamFullForm onSubmit={handleExamSubmit} />
      </div>

      {/* Study Upload Section */}
      <div className="rounded-lg border border-gray-300 bg-white p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Cargar Estudio Médico</h2>
        <StudyUploadZone
          expedientId={expedient.id}
          onSuccess={handleStudySuccess}
          onError={handleStudyError}
        />
      </div>
    </div>
  );
}
