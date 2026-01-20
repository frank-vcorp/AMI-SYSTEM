"use client";

/**
 * MedicalExamPanel Component
 * Panel para agregar datos de examen médico (vitales)
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { medicalExamSchema, type MedicalExamInput } from "../schemas/validation";

interface MedicalExamPanelProps {
  expedientId: string;
  onSuccess?: (exam: any) => void;
  onError?: (error: Error) => void;
}

export function MedicalExamPanel({ expedientId, onSuccess, onError }: MedicalExamPanelProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<MedicalExamInput>({
    resolver: zodResolver(medicalExamSchema),
    defaultValues: {
      bloodPressure: "",
      heartRate: undefined,
      respiratoryRate: undefined,
      temperature: undefined,
      weight: undefined,
      height: undefined,
      physicalExam: "",
      notes: "",
    },
  });

  async function onSubmit(data: MedicalExamInput) {
    try {
      setIsLoading(true);

      // Filter out empty strings
      const payload = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== "" && v !== undefined)
      );

      const response = await fetch(`/api/expedientes/${expedientId}/exam`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add exam");
      }

      const exam = await response.json();
      form.reset();
      onSuccess?.(exam);
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Unknown error");
      onError?.(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-gray-300 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold">Medical Examination</h3>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Blood Pressure */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Blood Pressure (SYS/DIA)
            </label>
            <input
              type="text"
              placeholder="120/80"
              {...form.register("bloodPressure")}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              disabled={isLoading}
            />
            {form.formState.errors.bloodPressure && (
              <p className="mt-1 text-xs text-red-600">
                {form.formState.errors.bloodPressure.message}
              </p>
            )}
          </div>

          {/* Heart Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Heart Rate (bpm)
            </label>
            <input
              type="number"
              placeholder="72"
              {...form.register("heartRate")}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              disabled={isLoading}
            />
            {form.formState.errors.heartRate && (
              <p className="mt-1 text-xs text-red-600">
                {form.formState.errors.heartRate.message}
              </p>
            )}
          </div>

          {/* Respiratory Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Respiratory Rate (breaths/min)
            </label>
            <input
              type="number"
              placeholder="16"
              {...form.register("respiratoryRate")}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              disabled={isLoading}
            />
            {form.formState.errors.respiratoryRate && (
              <p className="mt-1 text-xs text-red-600">
                {form.formState.errors.respiratoryRate.message}
              </p>
            )}
          </div>

          {/* Temperature */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Temperature (°C)
            </label>
            <input
              type="number"
              step="0.1"
              placeholder="37.0"
              {...form.register("temperature")}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              disabled={isLoading}
            />
            {form.formState.errors.temperature && (
              <p className="mt-1 text-xs text-red-600">
                {form.formState.errors.temperature.message}
              </p>
            )}
          </div>

          {/* Weight */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Weight (kg)
            </label>
            <input
              type="number"
              step="0.1"
              placeholder="75.5"
              {...form.register("weight")}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              disabled={isLoading}
            />
            {form.formState.errors.weight && (
              <p className="mt-1 text-xs text-red-600">
                {form.formState.errors.weight.message}
              </p>
            )}
          </div>

          {/* Height */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Height (cm)
            </label>
            <input
              type="number"
              placeholder="175"
              {...form.register("height")}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              disabled={isLoading}
            />
            {form.formState.errors.height && (
              <p className="mt-1 text-xs text-red-600">
                {form.formState.errors.height.message}
              </p>
            )}
          </div>
        </div>

        {/* Physical Exam */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Physical Exam Notes
          </label>
          <textarea
            rows={3}
            {...form.register("physicalExam")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            disabled={isLoading}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Additional Notes
          </label>
          <textarea
            rows={3}
            {...form.register("notes")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex justify-center rounded-md border border-transparent bg-green-600 py-2 px-4 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          {isLoading ? "Saving..." : "Save Exam"}
        </button>
      </form>
    </div>
  );
}
