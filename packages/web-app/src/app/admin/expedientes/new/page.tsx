/**
 * /admin/expedientes/new
 * Create new expedient from appointment (Papeleta Form)
 */

"use client";

import React from "react";
import Link from "next/link";
import { Suspense } from "react";
import { PapeletaForm } from "@ami/mod-expedientes";

function NewExpedientContent() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📋 Recepción - Crear Papeleta</h1>
          <p className="mt-1 text-gray-600">
            Generar papeleta de admisión y seleccionar estudios a realizar
          </p>
        </div>
        <Link
          href="/admin/expedientes"
          className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          ← Back to List
        </Link>
      </div>

      <div className="rounded-lg border border-gray-300 bg-white p-6">
        <PapeletaForm
          patientName="PACIENTE EJEMPLO"
          clinic="CLÍNICA CENTRAL"
          company="EMPRESA CLIENTE"
          onSubmit={async (data) => {
            console.log("Papeleta submitted:", data);
            // Navegar a examen médico
            setTimeout(() => {
              window.location.href = `/admin/expedientes`;
            }, 1000);
          }}
        />
      </div>
    </div>
  );
}

export default function NewExpedientPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewExpedientContent />
    </Suspense>
  );
}
