"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ExpedientDTO, ExpedientService } from "@ami/mod-expedientes";

interface ExpeditentDetailProps {
  expedient: ExpedientDTO;
  onUpdateStatus?: (newStatus: string) => Promise<void>;
  onDownloadStudy?: (studyId: string) => void;
}

/**
 * ExpeditentDetail Component
 * Accordion view with all sections of the medical record
 */
export function ExpeditentDetail({
  expedient,
  onUpdateStatus,
  onDownloadStudy,
}: ExpeditentDetailProps) {
  const [expandedSection, setExpandedSection] = useState<string>("patient");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const progress = ExpedientService.calculateExpedientProgress(expedient);
  const bpFormatted = ExpedientService.formatBloodPressure(
    expedient.medicalExams?.[0]?.bloodPressure
  );

  const statusColors: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-800",
    IN_PROGRESS: "bg-blue-100 text-blue-800",
    COMPLETED: "bg-green-100 text-green-800",
    SIGNED: "bg-purple-100 text-purple-800",
    DELIVERED: "bg-emerald-100 text-emerald-800",
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const nextStatuses: Record<string, string[]> = {
    DRAFT: ["IN_PROGRESS"],
    IN_PROGRESS: ["COMPLETED"],
    COMPLETED: ["SIGNED"],
    SIGNED: ["DELIVERED"],
    DELIVERED: [],
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!onUpdateStatus) return;

    try {
      setIsUpdatingStatus(true);
      await onUpdateStatus(newStatus);
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const ExpandableSection = ({
    id,
    title,
    children,
  }: {
    id: string;
    title: string;
    children: React.ReactNode;
  }) => {
    const isExpanded = expandedSection === id;
    return (
      <div className="border rounded-lg overflow-hidden">
        <button
          onClick={() => setExpandedSection(isExpanded ? "" : id)}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 font-medium text-gray-900"
        >
          {title}
          <span
            className={`transform transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
          >
            ▼
          </span>
        </button>
        {isExpanded && (
          <div className="px-4 py-4 bg-white space-y-3">{children}</div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg border">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {expedient.patient?.name || "Paciente"}
            </h1>
            <p className="text-gray-600">ID: {expedient.id}</p>
          </div>
          <span
            className={`px-4 py-2 rounded-lg text-sm font-semibold ${
              statusColors[expedient.status]
            }`}
          >
            {expedient.status}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Progreso del Expediente
            </span>
            <span className="text-sm font-semibold text-gray-900">
              {progress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Status Transitions */}
        {nextStatuses[expedient.status]?.length > 0 && (
          <div className="flex gap-2">
            {nextStatuses[expedient.status].map((status) => (
              <Button
                key={status}
                onClick={() => handleStatusChange(status)}
                disabled={isUpdatingStatus}
              >
                Marcar como {status}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Sections */}
      <div className="space-y-3">
        {/* Patient Information */}
        <ExpandableSection id="patient" title="📋 Información del Paciente">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Documento</p>
              <p className="font-semibold">{expedient.patient?.documentId}</p>
            </div>
            <div>
              <p className="text-gray-600">Email</p>
              <p className="font-semibold">{expedient.patient?.email}</p>
            </div>
            <div>
              <p className="text-gray-600">Teléfono</p>
              <p className="font-semibold">{expedient.patient?.phone}</p>
            </div>
            <div>
              <p className="text-gray-600">Fecha Nacimiento</p>
              <p className="font-semibold">
                {expedient.patient?.birthDate
                  ? formatDate(expedient.patient.birthDate)
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Género</p>
              <p className="font-semibold">{expedient.patient?.gender}</p>
            </div>
            <div>
              <p className="text-gray-600">Estado</p>
              <p className="font-semibold">{expedient.patient?.status}</p>
            </div>
          </div>
        </ExpandableSection>

        {/* Medical Exams */}
        <ExpandableSection
          id="exams"
          title={`🩺 Exámenes Médicos (${expedient.medicalExams?.length || 0})`}
        >
          {!expedient.medicalExams || expedient.medicalExams.length === 0 ? (
            <p className="text-gray-500 text-sm">Sin exámenes registrados</p>
          ) : (
            <div className="space-y-4">
              {expedient.medicalExams.map((exam) => (
                <div
                  key={exam.id}
                  className="border-l-4 border-blue-500 pl-4 py-2"
                >
                  <p className="text-xs text-gray-500">
                    {formatDate(exam.examinedAt)}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2 text-sm">
                    {exam.bloodPressure && (
                      <div>
                        <p className="text-gray-600">PA</p>
                        <p className="font-semibold">{exam.bloodPressure}</p>
                      </div>
                    )}
                    {exam.heartRate && (
                      <div>
                        <p className="text-gray-600">FC</p>
                        <p className="font-semibold">{exam.heartRate} bpm</p>
                      </div>
                    )}
                    {exam.temperature && (
                      <div>
                        <p className="text-gray-600">Temp</p>
                        <p className="font-semibold">{exam.temperature}°C</p>
                      </div>
                    )}
                    {exam.weight && (
                      <div>
                        <p className="text-gray-600">Peso</p>
                        <p className="font-semibold">{exam.weight} kg</p>
                      </div>
                    )}
                    {exam.height && (
                      <div>
                        <p className="text-gray-600">Altura</p>
                        <p className="font-semibold">{exam.height} cm</p>
                      </div>
                    )}
                  </div>
                  {exam.physicalExam && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-600 font-semibold">
                        Exploración Física
                      </p>
                      <p className="text-sm">{exam.physicalExam}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ExpandableSection>

        {/* Studies */}
        <ExpandableSection
          id="studies"
          title={`📁 Estudios Médicos (${expedient.studies?.length || 0})`}
        >
          {!expedient.studies || expedient.studies.length === 0 ? (
            <p className="text-gray-500 text-sm">Sin estudios subidos</p>
          ) : (
            <div className="space-y-2">
              {expedient.studies.map((study) => (
                <div
                  key={study.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{study.fileName}</p>
                    <p className="text-xs text-gray-600">
                      {study.type} • {(study.fileSizeBytes / 1024 / 1024).toFixed(2)}MB •{" "}
                      {formatDate(study.uploadedAt)}
                    </p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        study.status === "COMPLETED"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {study.status}
                    </span>
                    {onDownloadStudy && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDownloadStudy(study.id)}
                      >
                        Descargar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ExpandableSection>

        {/* Additional Info */}
        <ExpandableSection id="info" title="ℹ️ Información Adicional">
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-gray-600">Clínica</p>
              <p className="font-semibold">{expedient.clinicId}</p>
            </div>
            {expedient.companyId && (
              <div>
                <p className="text-gray-600">Empresa</p>
                <p className="font-semibold">{expedient.companyId}</p>
              </div>
            )}
            {expedient.notes && (
              <div>
                <p className="text-gray-600">Notas</p>
                <p className="font-semibold">{expedient.notes}</p>
              </div>
            )}
            <div>
              <p className="text-gray-600">Creado</p>
              <p className="font-semibold">{formatDate(expedient.createdAt)}</p>
            </div>
            <div>
              <p className="text-gray-600">Última actualización</p>
              <p className="font-semibold">{formatDate(expedient.updatedAt)}</p>
            </div>
          </div>
        </ExpandableSection>
      </div>
    </div>
  );
}
