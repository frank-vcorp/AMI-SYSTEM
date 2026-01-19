"use client";

import React, { useState } from "react";
import { Button } from "../../../web-app/src/components/ui/button";
import { CreatePatientDTO, CreateExpedientDTO } from "@ami/mod-expedientes";
import { ExpedientService } from "@ami/mod-expedientes";

interface ExpeditentFormProps {
  clinicId: string;
  companyId?: string;
  onSubmit: (patient: CreatePatientDTO, expedient: CreateExpedientDTO) => Promise<void>;
  isLoading?: boolean;
}

/**
 * ExpeditentForm Component
 * Form for patient reception and expedient creation
 */
export function ExpeditentForm({
  clinicId,
  companyId,
  onSubmit,
  isLoading = false,
}: ExpeditentFormProps) {
  const [formData, setFormData] = useState({
    // Patient data
    name: "",
    email: "",
    phone: "",
    birthDate: "",
    gender: "MASCULINO" as const,
    documentId: "",
    // Expedient data
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const patientData: CreatePatientDTO = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      birthDate: formData.birthDate,
      gender: formData.gender as "MASCULINO" | "FEMENINO" | "OTRO",
      documentId: formData.documentId,
    };

    // Validate patient data
    const validation = ExpedientService.validateCreatePatient(patientData);
    if (!validation.isValid) {
      const newErrors: Record<string, string> = {};
      validation.errors.forEach((error) => {
        if (error.includes("Name")) newErrors.name = error;
        if (error.includes("email")) newErrors.email = error;
        if (error.includes("phone")) newErrors.phone = error;
        if (error.includes("document")) newErrors.documentId = error;
        if (error.includes("date")) newErrors.birthDate = error;
      });
      setErrors(newErrors);
      return;
    }

    const expedientData: CreateExpedientDTO = {
      patientId: "", // Will be set after patient creation
      clinicId,
      companyId,
      notes: formData.notes,
    };

    try {
      await onSubmit(patientData, expedientData);
      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        birthDate: "",
        gender: "MASCULINO",
        documentId: "",
        notes: "",
      });
      setErrors({});
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : "Error al crear expediente",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre Completo *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Juan Pérez García"
          />
          {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="juan@example.com"
          />
          {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono *
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.phone ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="+55 11 99999-9999"
          />
          {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
        </div>

        {/* Document ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Documento de Identidad *
          </label>
          <input
            type="text"
            name="documentId"
            value={formData.documentId}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.documentId ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="123456789"
          />
          {errors.documentId && (
            <p className="text-red-600 text-sm mt-1">{errors.documentId}</p>
          )}
        </div>

        {/* Birth Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de Nacimiento *
          </label>
          <input
            type="date"
            name="birthDate"
            value={formData.birthDate}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.birthDate ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.birthDate && (
            <p className="text-red-600 text-sm mt-1">{errors.birthDate}</p>
          )}
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Género *
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="MASCULINO">Masculino</option>
            <option value="FEMENINO">Femenino</option>
            <option value="OTRO">Otro</option>
          </select>
        </div>
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
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="Información adicional relevante"
          rows={3}
        />
      </div>

      {errors.submit && (
        <div className="p-3 bg-red-100 text-red-800 rounded-md text-sm">
          {errors.submit}
        </div>
      )}

      <div className="flex gap-2 justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creando..." : "Crear Expediente"}
        </Button>
      </div>
    </form>
  );
}
