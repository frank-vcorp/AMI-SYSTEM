"use client";

import React from "react";
import { ExpeditentForm } from "./ExpeditentForm";
import { MedicalExamForm } from "./MedicalExamForm";
import { StudyUploadZone } from "./StudyUploadZone";
import { CreatePatientDTO, CreateExpedientDTO } from "@ami/mod-expedientes";

interface ExpeditentManagerProps {
  expedientId: string;
  clinicId: string;
  companyId?: string;
  isNew?: boolean;
  onPatientCreated?: (patientId: string) => void;
  onExamAdded?: (examId: string) => void;
  onStudyUploaded?: (studyId: string) => void;
}

/**
 * ExpeditentManager Component
 * Orchestrates the different forms and sections for creating/editing expedients
 */
export function ExpeditentManager({
  expedientId,
  clinicId,
  companyId,
  isNew = false,
  onPatientCreated,
  onExamAdded,
  onStudyUploaded,
}: ExpeditentManagerProps) {
  const [step, setStep] = React.useState<"patient" | "exam" | "studies">(
    isNew ? "patient" : "exam"
  );

  const handlePatientSubmit = async (
    patient: CreatePatientDTO,
    expedient: CreateExpedientDTO
  ) => {
    try {
      // Here you would call the API to create patient and expedient
      console.log("Creating patient:", patient);
      console.log("Creating expedient:", expedient);

      onPatientCreated?.(expedientId);
      setStep("exam");
    } catch (error) {
      console.error("Error creating patient:", error);
      throw error;
    }
  };

  const handleExamSubmit = async (data: any) => {
    try {
      // Here you would call the API to create medical exam
      console.log("Creating exam:", data);

      onExamAdded?.(expedientId);
    } catch (error) {
      console.error("Error creating exam:", error);
      throw error;
    }
  };

  const handleStudyUpload = async (file: File, type: string) => {
    try {
      // Here you would call the API to upload study
      console.log("Uploading study:", { file: file.name, type });

      onStudyUploaded?.(expedientId);
    } catch (error) {
      console.error("Error uploading study:", error);
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-between px-6">
        <div
          className={`flex items-center space-x-2 ${
            step === "patient" ? "text-blue-600 font-bold" : "text-gray-600"
          }`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === "patient"
                ? "bg-blue-600 text-white"
                : "bg-gray-300 text-gray-700"
            }`}
          >
            1
          </div>
          <span>Paciente</span>
        </div>

        <div className="flex-1 h-1 mx-4 bg-gray-200">
          <div
            className="h-1 bg-blue-600 transition-all"
            style={{
              width:
                step === "patient"
                  ? "0%"
                  : step === "exam"
                  ? "50%"
                  : "100%",
            }}
          ></div>
        </div>

        <div
          className={`flex items-center space-x-2 ${
            step === "exam" ? "text-blue-600 font-bold" : "text-gray-600"
          }`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step !== "patient"
                ? "bg-blue-600 text-white"
                : "bg-gray-300 text-gray-700"
            }`}
          >
            2
          </div>
          <span>Examen</span>
        </div>

        <div className="flex-1 h-1 mx-4 bg-gray-200">
          <div
            className="h-1 bg-blue-600 transition-all"
            style={{
              width: step === "studies" ? "100%" : "0%",
            }}
          ></div>
        </div>

        <div
          className={`flex items-center space-x-2 ${
            step === "studies" ? "text-blue-600 font-bold" : "text-gray-600"
          }`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === "studies"
                ? "bg-blue-600 text-white"
                : "bg-gray-300 text-gray-700"
            }`}
          >
            3
          </div>
          <span>Estudios</span>
        </div>
      </div>

      {/* Forms */}
      <div>
        {step === "patient" && isNew && (
          <ExpeditentForm
            clinicId={clinicId}
            companyId={companyId}
            onSubmit={handlePatientSubmit}
          />
        )}

        {step === "exam" && (
          <>
            <MedicalExamForm
              expedientId={expedientId}
              onSubmit={handleExamSubmit}
            />
            <div className="flex gap-2 justify-end mt-4">
              {isNew && (
                <button
                  onClick={() => setStep("patient")}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Atrás
                </button>
              )}
              <button
                onClick={() => setStep("studies")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Siguiente
              </button>
            </div>
          </>
        )}

        {step === "studies" && (
          <>
            <StudyUploadZone
              expedientId={expedientId}
              onUpload={handleStudyUpload}
            />
            <div className="flex gap-2 justify-end mt-4">
              <button
                onClick={() => setStep("exam")}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Atrás
              </button>
              <button
                onClick={() => {
                  // Mark expedient as complete
                  console.log("Expedient completed");
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Completar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
