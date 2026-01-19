"use client";

import React, { useState } from "react";
import { Button } from "../../../web-app/src/components/ui/button";
import {
  CreateMedicalExamDTO,
  ExpedientService,
} from "@ami/mod-expedientes";

interface MedicalExamFormProps {
  expedientId: string;
  onSubmit: (data: CreateMedicalExamDTO) => Promise<void>;
  isLoading?: boolean;
}

/**
 * MedicalExamForm Component
 * Form for capturing vital signs and physical exam data
 */
export function MedicalExamForm({
  expedientId,
  onSubmit,
  isLoading = false,
}: MedicalExamFormProps) {
  const [formData, setFormData] = useState({
    bloodPressure: "",
    heartRate: "",
    respiratoryRate: "",
    temperature: "",
    weight: "",
    height: "",
    physicalExam: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const examData: CreateMedicalExamDTO = {
      bloodPressure: formData.bloodPressure || undefined,
      heartRate: formData.heartRate ? parseInt(formData.heartRate) : undefined,
      respiratoryRate: formData.respiratoryRate
        ? parseInt(formData.respiratoryRate)
        : undefined,
      temperature: formData.temperature ? parseFloat(formData.temperature) : undefined,
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      height: formData.height ? parseFloat(formData.height) : undefined,
      physicalExam: formData.physicalExam || undefined,
      notes: formData.notes || undefined,
    };

    // Validate
    const validation = ExpedientService.validateMedicalExam(examData);
    if (!validation.isValid) {
      setErrors({
        submit: validation.errors.join("; "),
      });
      return;
    }

    try {
      await onSubmit(examData);
      // Reset form
      setFormData({
        bloodPressure: "",
        heartRate: "",
        respiratoryRate: "",
        temperature: "",
        weight: "",
        height: "",
        physicalExam: "",
        notes: "",
      });
      setErrors({});
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : "Error al guardar examen",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border">
      <h3 className="text-lg font-semibold text-gray-900">Examen Médico</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Blood Pressure */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Presión Arterial (SIS/DIA)
          </label>
          <input
            type="text"
            name="bloodPressure"
            value={formData.bloodPressure}
            onChange={handleChange}
            placeholder="120/80"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* Heart Rate */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Frecuencia Cardíaca (latidos/min)
          </label>
          <input
            type="number"
            name="heartRate"
            value={formData.heartRate}
            onChange={handleChange}
            placeholder="72"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            min="30"
            max="200"
          />
        </div>

        {/* Respiratory Rate */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Frecuencia Respiratoria (respiraciones/min)
          </label>
          <input
            type="number"
            name="respiratoryRate"
            value={formData.respiratoryRate}
            onChange={handleChange}
            placeholder="16"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            min="10"
            max="60"
          />
        </div>

        {/* Temperature */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Temperatura (°C)
          </label>
          <input
            type="number"
            name="temperature"
            value={formData.temperature}
            onChange={handleChange}
            placeholder="37.0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            min="35"
            max="42"
            step="0.1"
          />
        </div>

        {/* Weight */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Peso (kg)
          </label>
          <input
            type="number"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            placeholder="75.5"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            min="20"
            max="300"
            step="0.1"
          />
        </div>

        {/* Height */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Altura (cm)
          </label>
          <input
            type="number"
            name="height"
            value={formData.height}
            onChange={handleChange}
            placeholder="175"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            min="100"
            max="250"
          />
        </div>
      </div>

      {/* Physical Exam */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Exploración Física
        </label>
        <textarea
          name="physicalExam"
          value={formData.physicalExam}
          onChange={handleChange}
          placeholder="Hallazgos del examen físico"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          rows={3}
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notas Adicionales
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Notas relevantes"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          rows={2}
        />
      </div>

      {errors.submit && (
        <div className="p-3 bg-red-100 text-red-800 rounded-md text-sm">
          {errors.submit}
        </div>
      )}

      <div className="flex gap-2 justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Guardando..." : "Guardar Examen"}
        </Button>
      </div>
    </form>
  );
}
