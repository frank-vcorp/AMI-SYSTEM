/**
 * ValidationPanel - Main component for medical validation workflow
 * Layout: 2-column (PDF left, data right), form bottom
 */

import React, { useState, useMemo } from "react";
import {
  ValidationTask,
  PatientSummary,
  SemaphoreStatus,
  ExtractedDataSet,
} from "../types";
import { PDFViewer } from "./PDFViewer";
import { ExtractionResults } from "./ExtractionResults";
import { SemaphoreIndicators } from "./SemaphoreIndicators";
import { ValidationForm } from "./ValidationForm";
import {
  calculateSemaphoresFromLab,
  suggestVerdictBySemaphores,
} from "../utils/clinical-rules";

export interface ValidationPanelProps {
  task: ValidationTask;
  patient?: PatientSummary;
  pdfUrls?: Record<string, string>; // Map of studyId -> fileUrl
  onSave: (task: ValidationTask, signature: string) => Promise<void>;
  isLoading?: boolean;
}

type TabType = "pdf" | "data" | "opinion";

export const ValidationPanel: React.FC<ValidationPanelProps> = ({
  task,
  patient,
  pdfUrls = {},
  onSave,
  isLoading = false,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("pdf");
  const [selectedStudyId, setSelectedStudyId] = useState<string>(
    task.studies.length > 0 ? task.studies[0].id : ""
  );
  const [extractedData, setExtractedData] = useState<ExtractedDataSet>(
    task.extractedData
  );

  // Calculate semaphores from current extracted data
  const semaphores = useMemo(() => {
    if (extractedData?.laboratorio) {
      return calculateSemaphoresFromLab(extractedData.laboratorio);
    }
    return [];
  }, [extractedData]);

  // Suggest verdict based on semaphores and job risk
  const suggestedVerdict = useMemo(() => {
    return suggestVerdictBySemaphores(
      semaphores,
      patient?.jobProfile?.riskLevel
    );
  }, [semaphores, patient]);

  const selectedStudy = task.studies.find((s) => s.id === selectedStudyId);
  const selectedPdfUrl = selectedStudy ? pdfUrls[selectedStudy.id] : null;

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header with patient info */}
      <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ✓ Validación de Expediente
          </h1>
          {patient && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div>
                <p className="text-xs text-gray-600 font-semibold">PACIENTE</p>
                <p className="text-sm font-medium text-gray-900">
                  {patient.name}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold">DOCUMENTO</p>
                <p className="text-sm font-medium text-gray-900">
                  {patient.documentNumber}
                </p>
              </div>
              {patient.company && (
                <div>
                  <p className="text-xs text-gray-600 font-semibold">EMPRESA</p>
                  <p className="text-sm font-medium text-gray-900">
                    {patient.company.name}
                  </p>
                </div>
              )}
              {patient.jobProfile && (
                <div>
                  <p className="text-xs text-gray-600 font-semibold">
                    PUESTO
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {patient.jobProfile.title}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-6">
          {/* Studies list */}
          {task.studies.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-700 mb-3">
                📁 Estudios ({task.studies.length})
              </p>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {task.studies.map((study) => (
                  <button
                    key={study.id}
                    onClick={() => setSelectedStudyId(study.id)}
                    className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                      selectedStudyId === study.id
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {study.studyType}
                    {study.extractionStatus === "FAILED" && (
                      <span className="ml-1">⚠️</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tab navigation */}
          <div className="flex gap-0 border-b mb-6">
            <button
              onClick={() => setActiveTab("pdf")}
              className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                activeTab === "pdf"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              📄 PDF
            </button>
            <button
              onClick={() => setActiveTab("data")}
              className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                activeTab === "data"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              📊 Datos Extraídos
            </button>
            <button
              onClick={() => setActiveTab("opinion")}
              className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                activeTab === "opinion"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              ✍️ Dictamen
            </button>
          </div>

          {/* Tab content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left panel - PDF Viewer */}
            {activeTab === "pdf" && (
              <div className="lg:col-span-2 border rounded-lg bg-gray-50 min-h-96">
                <PDFViewer
                  study={selectedStudy || null}
                  fileUrl={selectedPdfUrl || null}
                  isLoading={isLoading}
                />
              </div>
            )}

            {/* Center/Right panel - Data & Semaphores */}
            {activeTab === "data" && (
              <div className="lg:col-span-3 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="border rounded-lg p-6 bg-white">
                    <h3 className="text-lg font-semibold mb-4">
                      🎯 Semáforos Clínicos
                    </h3>
                    <SemaphoreIndicators
                      semaphores={semaphores}
                      isCompact={false}
                    />
                  </div>

                  <div className="border rounded-lg p-6 bg-white">
                    <h3 className="text-lg font-semibold mb-4">
                      📋 Valores Extraídos
                    </h3>
                    <ExtractionResults
                      extractedData={extractedData}
                      onDataChange={setExtractedData}
                      isEditable={true}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Opinion & Signing panel */}
            {activeTab === "opinion" && (
              <div className="lg:col-span-3 border rounded-lg p-6 bg-white">
                <h3 className="text-lg font-semibold mb-4">✍️ Dictamen Médico</h3>

                {/* Quick stats */}
                <div className="grid grid-cols-4 gap-3 mb-6">
                  <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                    <p className="text-2xl font-bold text-green-700">
                      {semaphores.filter((s) => s.status === "NORMAL").length}
                    </p>
                    <p className="text-xs text-green-600 font-medium">Normales</p>
                  </div>
                  <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                    <p className="text-2xl font-bold text-yellow-700">
                      {semaphores.filter((s) => s.status === "WARNING").length}
                    </p>
                    <p className="text-xs text-yellow-600 font-medium">
                      Advertencia
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                    <p className="text-2xl font-bold text-red-700">
                      {semaphores.filter((s) => s.status === "CRITICAL").length}
                    </p>
                    <p className="text-xs text-red-600 font-medium">Crítico</p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <p className="text-2xl font-bold text-blue-700">
                      {semaphores.length}
                    </p>
                    <p className="text-xs text-blue-600 font-medium">Total</p>
                  </div>
                </div>

                <ValidationForm
                  task={task}
                  patient={patient}
                  semaphores={semaphores}
                  suggestedVerdict={suggestedVerdict}
                  onSubmit={onSave}
                  isLoading={isLoading}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
