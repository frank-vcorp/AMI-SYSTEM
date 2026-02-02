/**
 * ValidationPanel - Main component for medical validation workflow
 * Layout: 2-column (PDF left, data right), form bottom
 */

import React, { useState, useMemo } from "react";
import {
  ValidationTask,
  PatientSummary,
  ExtractedDataSet,
} from "../types";
import { PDFViewer } from "./PDFViewer";
import { ExtractionResults } from "./ExtractionResults";
import { ValidationForm } from "./ValidationForm";
import { Badge, Button } from "@ami/core-ui";
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


export const ValidationPanel: React.FC<ValidationPanelProps> = ({
  task,
  patient,
  pdfUrls = {},
  onSave,
  isLoading = false,
}) => {
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
    <div className="h-screen flex flex-col bg-slate-50 font-inter">
      {/* Premium Header Banner */}
      <div className="bg-slate-900 text-white px-8 py-5 flex items-center justify-between border-b border-white/10 shadow-lg shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-medical-400 leading-none mb-1">Validación Médica</span>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-outfit font-bold tracking-tight">Expediente {task.expedientId}</h1>
              <Badge variant="outline" className="border-medical-500/50 text-medical-400 bg-medical-500/5 py-0.5 px-3">
                {task.status}
              </Badge>
            </div>
          </div>

          <div className="h-8 w-px bg-white/10 hidden md:block"></div>

          {patient && (
            <div className="hidden lg:flex items-center gap-6">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500 leading-none mb-1">Paciente</p>
                <p className="text-sm font-semibold">{patient.name}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500 leading-none mb-1">Empresa</p>
                <p className="text-sm font-semibold">{patient.company?.name || '---'}</p>
              </div>
              <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/10">
                <p className="text-[10px] uppercase font-bold text-slate-500 leading-none mb-0.5 text-center">Riesgo</p>
                <p className={`text-xs font-bold text-center ${patient.jobProfile?.riskLevel === 'ALTO' ? 'text-clinical-error' :
                  patient.jobProfile?.riskLevel === 'MEDIO' ? 'text-clinical-warning' : 'text-clinical-success'
                  }`}>
                  {patient.jobProfile?.riskLevel || 'BAJO'}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-9 border-white/20 text-white hover:bg-white/10">Ayuda IA</Button>
          <Button className="h-9 btn-primary">Firmar y Cerrar</Button>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left Side: PDF Viewer (Visual Proof) */}
        <div className="w-[45%] border-r border-slate-200 bg-slate-100/50 flex flex-col overflow-hidden">
          <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Fuentes PDF</p>
              <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-sm">
                {task.studies.map((study) => (
                  <button
                    key={study.id}
                    onClick={() => setSelectedStudyId(study.id)}
                    className={`h-7 px-3 rounded-full text-[10px] font-bold uppercase tracking-tight transition-all border shrink-0 ${selectedStudyId === study.id
                      ? "bg-medical-500 text-white border-medical-600 shadow-sm"
                      : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                      }`}
                  >
                    {study.studyType}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 relative bg-[#525659]">
            <PDFViewer
              study={selectedStudy || null}
              fileUrl={selectedPdfUrl || null}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Right Side: Data Extraction & Decision (The Brain) */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">

          {/* Subheader Decision Support */}
          <div className="px-8 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex gap-2">
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-bold text-clinical-success leading-none mb-0.5">{semaphores.filter((s) => s.status === "NORMAL").length}</span>
                    <div className="w-4 h-1 bg-clinical-success rounded-full"></div>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-bold text-clinical-warning leading-none mb-0.5">{semaphores.filter((s) => s.status === "WARNING").length}</span>
                    <div className="w-4 h-1 bg-clinical-warning rounded-full"></div>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-bold text-clinical-error leading-none mb-0.5">{semaphores.filter((s) => s.status === "CRITICAL").length}</span>
                    <div className="w-4 h-1 bg-clinical-error rounded-full"></div>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Veredicto IA Sugerido</p>
                <p className={`text-sm font-bold ${suggestedVerdict === 'APTO' ? 'text-clinical-success' : 'text-clinical-warning'}`}>
                  {suggestedVerdict}
                </p>
              </div>
            </div>

            <button className="text-xs font-bold text-medical-600 hover:text-medical-700 transition-colors uppercase tracking-widest">
              Ver historial de cambios
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            {/* Extraction Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-outfit font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-medical-500 rounded-full"></span>
                  Datos Extraídos por RD-AMI
                </h3>
              </div>
              <ExtractionResults
                extractedData={extractedData}
                onDataChange={setExtractedData}
                isEditable={true}
              />
            </section>

            {/* Verdict Section */}
            <section className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-lg font-outfit font-bold text-slate-800 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-ami-purple rounded-full"></span>
                Dictamen y Certificación
              </h3>
              <ValidationForm
                task={task}
                patient={patient}
                semaphores={semaphores}
                suggestedVerdict={suggestedVerdict}
                onSubmit={onSave}
                isLoading={isLoading}
              />
            </section>
          </div>
        </div>

      </div>
    </div>
  );
};
