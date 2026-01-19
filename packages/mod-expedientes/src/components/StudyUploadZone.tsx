"use client";

import React, { useState, useCallback } from "react";
import { Button } from "../../../web-app/src/components/ui/button";
import { validateFileUpload } from "@ami/mod-expedientes";

interface StudyUploadZoneProps {
  expedientId: string;
  onUpload: (file: File, type: string) => Promise<void>;
  isLoading?: boolean;
}

const STUDY_TYPES = [
  { value: "RADIOGRAPHY", label: "Radiografía" },
  { value: "LABORATORY", label: "Laboratorio" },
  { value: "CARDIOGRAM", label: "Cardiograma" },
  { value: "ULTRASOUND", label: "Ecografía" },
  { value: "TOMOGRAPHY", label: "Tomografía" },
  { value: "RESONANCE", label: "Resonancia" },
  { value: "ENDOSCOPY", label: "Endoscopia" },
  { value: "OTHER", label: "Otro" },
];

/**
 * StudyUploadZone Component
 * Drag-drop zone for uploading medical studies
 */
export function StudyUploadZone({
  expedientId,
  onUpload,
  isLoading = false,
}: StudyUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedType, setSelectedType] = useState("OTHER");
  const [error, setError] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(true);
    },
    []
  );

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileUpload = useCallback(
    async (file: File) => {
      setError("");
      setUploadProgress(0);

      const validation = validateFileUpload(file.type, file.size);
      if (!validation.isValid) {
        setError(validation.errors.join("; "));
        return;
      }

      try {
        // Simulate progress
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => Math.min(prev + 10, 90));
        }, 100);

        await onUpload(file, selectedType);

        clearInterval(progressInterval);
        setUploadProgress(100);
        setSelectedType("OTHER");

        setTimeout(() => setUploadProgress(0), 1000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al subir archivo");
        setUploadProgress(0);
      }
    },
    [selectedType, onUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileUpload(files[0]);
      }
    },
    [handleFileUpload]
  );

  const handleFileInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  return (
    <div className="space-y-4 bg-white p-6 rounded-lg border">
      <h3 className="text-lg font-semibold text-gray-900">Subir Estudios Médicos</h3>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Tipo de Estudio
        </label>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          {STUDY_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 bg-gray-50"
        }`}
      >
        <input
          type="file"
          id="file-upload"
          onChange={handleFileInputChange}
          accept=".pdf,.jpg,.jpeg,.png"
          disabled={isLoading}
          className="hidden"
        />

        <label
          htmlFor="file-upload"
          className="cursor-pointer"
        >
          <div className="space-y-2">
            <div className="text-3xl">📁</div>
            <p className="text-sm font-medium text-gray-700">
              Arrastra archivos aquí o haz clic para seleccionar
            </p>
            <p className="text-xs text-gray-500">
              PDF, JPG, PNG (máximo 50MB)
            </p>
          </div>
        </label>
      </div>

      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">
            Subiendo... {uploadProgress}%
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-100 text-red-800 rounded-md text-sm">
          {error}
        </div>
      )}

      {uploadProgress === 100 && (
        <div className="p-3 bg-green-100 text-green-800 rounded-md text-sm">
          ✓ Archivo subido correctamente
        </div>
      )}
    </div>
  );
}
