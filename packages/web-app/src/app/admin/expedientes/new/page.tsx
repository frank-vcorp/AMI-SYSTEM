/**
 * /admin/expedientes/new
 * Create new expedient (multi-step form)
 */

"use client";

import React from "react";
import { ExpeditentManager } from "@ami/mod-expedientes";

export default function NewExpedientPage() {
  const mockClinicId = "clinic_1";
  const mockCompanyId = "company_1";
  const mockExpedientId = `exp_${Date.now()}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Nuevo Expediente</h1>
        <p className="text-gray-600 mt-1">
          Registrar un nuevo paciente y crear su expediente médico
        </p>
      </div>

      <ExpeditentManager
        expedientId={mockExpedientId}
        clinicId={mockClinicId}
        companyId={mockCompanyId}
        isNew={true}
        onPatientCreated={() => {
          console.log("Patient created");
        }}
        onExamAdded={() => {
          console.log("Exam added");
        }}
        onStudyUploaded={() => {
          console.log("Study uploaded");
        }}
      />
    </div>
  );
}
