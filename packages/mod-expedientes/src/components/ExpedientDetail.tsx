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

export function ExpedientDetail({
  expedient,
  onStatusChange,
  isLoading = false,
}: ExpedientDetailProps) {
  const [expandedSection, setExpandedSection] = useState<string>("patient");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
          <span className={`transform transition-transform ${isExpanded ? "rotate-180" : ""}`}>
            ▼
          </span>
        </button>
        {isExpanded && <div className="px-4 py-4 bg-white space-y-3">{children}</div>}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-lg border border-gray-300 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{expedient.folio}</h1>
            <p className="mt-1 text-sm text-gray-500">
              Created {formatDate(expedient.createdAt)}
            </p>
          </div>
          <span
            className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${
              STATUS_COLORS[expedient.status] || "bg-gray-100 text-gray-800"
            }`}
          >
            {expedient.status}
          </span>
        </div>

        {/* Status Transition */}
        {NEXT_STATUSES[expedient.status].length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {NEXT_STATUSES[expedient.status].map((nextStatus) => (
              <button
                key={nextStatus}
                onClick={() => handleStatusChange(nextStatus)}
                disabled={isUpdatingStatus || isLoading}
                className="inline-flex justify-center rounded-md border border-transparent bg-purple-600 py-2 px-4 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
              >
                Move to {nextStatus}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Sections */}
      <ExpandableSection id="patient" title="Patient Information">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold text-gray-600">Name</p>
            <p className="mt-1 text-sm text-gray-900">
              {expedient.patient.firstName} {expedient.patient.lastName}
            </p>
          </div>
          {expedient.patient.documentId && (
            <div>
              <p className="text-xs font-semibold text-gray-600">Document ID</p>
              <p className="mt-1 text-sm text-gray-900">{expedient.patient.documentId}</p>
            </div>
          )}
          {expedient.patient.dateOfBirth && (
            <div>
              <p className="text-xs font-semibold text-gray-600">Date of Birth</p>
              <p className="mt-1 text-sm text-gray-900">
                {formatDate(expedient.patient.dateOfBirth)}
              </p>
            </div>
          )}
          <div>
            <p className="text-xs font-semibold text-gray-600">Clinic</p>
            <p className="mt-1 text-sm text-gray-900">{expedient.clinic.name}</p>
          </div>
        </div>
      </ExpandableSection>

      {/* Medical Exams */}
      <ExpandableSection id="exams" title={`Medical Exams (${expedient.medicalExams?.length || 0})`}>
        {expedient.medicalExams && expedient.medicalExams.length > 0 ? (
          <div className="space-y-4">
            {expedient.medicalExams.map((exam, idx) => (
              <div key={exam.id} className="border-t pt-4 first:border-t-0 first:pt-0">
                <p className="text-sm font-semibold text-gray-900">Exam #{idx + 1}</p>
                <p className="text-xs text-gray-500 mt-1">{formatDate(exam.createdAt)}</p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  {exam.bloodPressure && (
                    <div>
                      <span className="text-xs font-semibold text-gray-600">Blood Pressure:</span>
                      <span className="ml-1">{exam.bloodPressure} mmHg</span>
                    </div>
                  )}
                  {exam.heartRate && (
                    <div>
                      <span className="text-xs font-semibold text-gray-600">Heart Rate:</span>
                      <span className="ml-1">{exam.heartRate} bpm</span>
                    </div>
                  )}
                  {exam.temperature && (
                    <div>
                      <span className="text-xs font-semibold text-gray-600">Temperature:</span>
                      <span className="ml-1">{exam.temperature}°C</span>
                    </div>
                  )}
                  {exam.weight && (
                    <div>
                      <span className="text-xs font-semibold text-gray-600">Weight:</span>
                      <span className="ml-1">{exam.weight} kg</span>
                    </div>
                  )}
                </div>
                {exam.physicalExamNotes && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-gray-600">Physical Exam Notes</p>
                    <p className="mt-1 text-sm text-gray-700">{exam.physicalExamNotes}</p>
                  </div>
                )}
                {exam.notes && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-gray-600">Notes</p>
                    <p className="mt-1 text-sm text-gray-700">{exam.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No medical exams recorded yet.</p>
        )}
      </ExpandableSection>

      {/* Studies */}
      <ExpandableSection id="studies" title={`Medical Studies (${expedient.studies?.length || 0})`}>
        {expedient.studies && expedient.studies.length > 0 ? (
          <div className="space-y-2">
            {expedient.studies.map((study) => (
              <div key={study.id} className="flex items-center justify-between rounded bg-gray-50 p-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{study.fileName}</p>
                  <p className="text-xs text-gray-500">
                    {study.studyType} • {(study.fileSize / 1024 / 1024).toFixed(2)} MB •{" "}
                    {formatDate(study.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No studies attached yet.</p>
        )}
      </ExpandableSection>

      {/* Notes */}
      {expedient.notes && (
        <ExpandableSection id="notes" title="Additional Notes">
          <p className="text-sm text-gray-700">{expedient.notes}</p>
        </ExpandableSection>
      )}
    </div>
  );
}
