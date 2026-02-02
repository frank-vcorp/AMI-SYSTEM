"use client";

/**
 * ExpedientDetail Component
 * Readonly detail view of expedient with all relations
 */

import { useState } from "react";

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

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  documentId?: string;
}

interface Clinic {
  id: string;
  name: string;
}

interface Expedient {
  id: string;
  folio: string;
  status: string;
  patient: Patient;
  clinic: Clinic;
  medicalExams?: MedicalExam[];
  studies?: Study[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface ExpedientDetailProps {
  expedient: Expedient;
  onStatusChange?: (newStatus: string) => Promise<void>;
  isLoading?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  STUDIES_PENDING: "bg-yellow-100 text-yellow-800",
  VALIDATED: "bg-green-100 text-green-800",
  COMPLETED: "bg-green-100 text-green-800",
  ARCHIVED: "bg-gray-200 text-gray-700",
};

const NEXT_STATUSES: Record<string, string[]> = {
  PENDING: ["IN_PROGRESS"],
  IN_PROGRESS: ["STUDIES_PENDING"],
  STUDIES_PENDING: ["VALIDATED"],
  VALIDATED: ["COMPLETED"],
  COMPLETED: [],
  ARCHIVED: [],
};

import { ExpedientReader } from "./ExpedientReader";

export function ExpedientDetail({
  expedient,
  onStatusChange,
  isLoading = false,
}: ExpedientDetailProps) {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!onStatusChange || isUpdatingStatus) return;
    try {
      setIsUpdatingStatus(true);
      await onStatusChange(newStatus);
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Si el expediente está en fase de recolección de estudios, mostramos el Reader Premium
  const showReader = ["IN_PROGRESS", "STUDIES_PENDING"].includes(expedient.status);

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-8 px-4 font-inter">
      {/* Barra de Navegación de Estado / Acciones */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
          <Badge variant="info" className="bg-medical-50 text-medical-600 border-none px-4 py-1.5 rounded-lg font-bold">
            ESTADO: {expedient.status}
          </Badge>
        </div>

        {NEXT_STATUSES[expedient.status].length > 0 && (
          <div className="flex gap-2">
            {NEXT_STATUSES[expedient.status].map((nextStatus) => (
              <Button
                key={nextStatus}
                onClick={() => handleStatusChange(nextStatus)}
                isLoading={isUpdatingStatus || isLoading}
                className="btn-primary shadow-premium"
              >
                Mover a {nextStatus}
              </Button>
            ))}
          </div>
        )}
      </div>

      {showReader ? (
        <ExpedientReader
          patientName={`${expedient.patient.firstName} ${expedient.patient.lastName}`}
          companyName={expedient.clinic.name}
          folio={expedient.folio}
          expedientId={expedient.id}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card variant="premium">
              <CardHeader>
                <CardTitle>Datos del Paciente</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nombre Completo</p>
                  <p className="text-slate-800 font-semibold">{expedient.patient.firstName} {expedient.patient.lastName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Folio del Sistema</p>
                  <p className="text-slate-800 font-semibold font-mono">{expedient.folio}</p>
                </div>
              </CardContent>
            </Card>

            {/* Aquí iría el historial de exámenes y estudios previos si no estamos en modo Reader */}
          </div>
        </div>
      )}
    </div>
  );
}
