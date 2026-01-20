"use client";

/**
 * StudyUploadZone Component
 * Drag-drop zone para subir estudios médicos (radiografías, análisis, etc.)
 */

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { studyUploadSchema, type StudyUploadInput } from "../schemas/validation";

interface StudyUploadZoneProps {
  expedientId: string;
  onSuccess?: (study: any) => void;
  onError?: (error: Error) => void;
}

const STUDY_TYPES = [
  { value: "RADIOGRAFIA", label: "X-Ray (Radiografía)" },
  { value: "LABORATORIO", label: "Laboratory (Análisis)" },
  { value: "ECG", label: "ECG (Cardiograma)" },
  { value: "ESPIROMETRIA", label: "Spirometry (Espirometría)" },
  { value: "AUDIOMETRIA", label: "Audiometry (Audiometría)" },
  { value: "OTROS", label: "Other (Otros)" },
];

export function StudyUploadZone({ expedientId, onSuccess, onError }: StudyUploadZoneProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const form = useForm<StudyUploadInput>({
    resolver: zodResolver(studyUploadSchema),
    defaultValues: {
      studyType: "OTROS",
    },
  });

  async function onSubmit(data: StudyUploadInput) {
    try {
      setIsLoading(true);

      const formData = new FormData();
      formData.append("file", data.file);
      formData.append("studyType", data.studyType);

      const response = await fetch(`/api/expedientes/${expedientId}/studies`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to upload study");
      }

      const study = await response.json();
      form.reset();
      onSuccess?.(study);
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Unknown error");
      onError?.(err);
    } finally {
      setIsLoading(false);
    }
  }

  function handleDrag(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      form.setValue("file", file);
    }
  }

  const selectedFile = form.watch("file");

  return (
    <div className="rounded-lg border border-gray-300 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold">Upload Medical Studies</h3>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Study Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Study Type
          </label>
          <select
            {...form.register("studyType")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            disabled={isLoading}
          >
            {STUDY_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {form.formState.errors.studyType && (
            <p className="mt-1 text-xs text-red-600">
              {form.formState.errors.studyType.message}
            </p>
          )}
        </div>

        {/* Drag-Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative rounded-lg border-2 border-dashed p-8 text-center transition ${
            isDragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 bg-gray-50"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                form.setValue("file", e.target.files[0]);
              }
            }}
            className="hidden"
            disabled={isLoading}
          />

          {selectedFile ? (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-700">
                ✓ {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <button
                type="button"
                onClick={() => form.setValue("file", undefined as any)}
                className="text-xs text-blue-600 hover:underline"
              >
                Change file
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-700">
                Drag and drop your file here
              </p>
              <p className="text-xs text-gray-500">or</p>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="text-sm font-semibold text-blue-600 hover:underline"
              >
                Click to select
              </button>
              <p className="text-xs text-gray-400">
                Supported: PDF, JPG, PNG (max 50MB)
              </p>
            </div>
          )}
        </div>

        {form.formState.errors.file && (
          <p className="text-sm text-red-600">
            {(() => {
              const error = form.formState.errors.file;
              if (typeof error === 'string') {
                return error;
              }
              if (error && 'message' in error && typeof error.message === 'string') {
                return error.message;
              }
              return "File is required";
            })() as React.ReactNode}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading || !selectedFile}
          className="inline-flex justify-center rounded-md border border-transparent bg-purple-600 py-2 px-4 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
        >
          {isLoading ? "Uploading..." : "Upload Study"}
        </button>
      </form>
    </div>
  );
}
