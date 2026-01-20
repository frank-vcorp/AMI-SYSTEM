"use client";

/**
 * ExpedientForm Component
 * Form para crear expediente desde cita
 * Usado en /admin/expedientes/new
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createExpedientSchema, type CreateExpedientInput } from "../schemas/validation";

interface ExpedientFormProps {
  appointmentId?: string;
  patientId?: string;
  onSuccess?: (expedient: any) => void;
  onError?: (error: Error) => void;
}

export function ExpedientForm({
  appointmentId: initialAppointmentId,
  patientId: initialPatientId,
  onSuccess,
  onError,
}: ExpedientFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CreateExpedientInput>({
    resolver: zodResolver(createExpedientSchema),
    defaultValues: {
      appointmentId: initialAppointmentId || "",
      patientId: initialPatientId || "",
      notes: "",
    },
  });

  async function onSubmit(data: CreateExpedientInput) {
    try {
      setIsLoading(true);

      const response = await fetch("/api/expedientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create expedient");
      }

      const expedient = await response.json();
      onSuccess?.(expedient);
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Unknown error");
      onError?.(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Appointment ID
        </label>
        <input
          type="text"
          {...form.register("appointmentId")}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          disabled={isLoading}
        />
        {form.formState.errors.appointmentId && (
          <p className="mt-1 text-sm text-red-600">
            {form.formState.errors.appointmentId.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Patient ID
        </label>
        <input
          type="text"
          {...form.register("patientId")}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          disabled={isLoading}
        />
        {form.formState.errors.patientId && (
          <p className="mt-1 text-sm text-red-600">
            {form.formState.errors.patientId.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Notes (Optional)
        </label>
        <textarea
          {...form.register("notes")}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          disabled={isLoading}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? "Creating..." : "Create Expedient"}
      </button>
    </form>
  );
}
