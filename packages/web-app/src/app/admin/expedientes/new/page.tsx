/**
 * /admin/expedientes/new
 * Create new expedient (multi-step form)
 */

"use client";

import React from "react";
// TODO: Importar ExpeditentManager desde componentes locales
// import { ExpeditentManager } from "@ami/mod-expedientes";

export default function NewExpedientPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Nuevo Expediente</h1>
        <p className="text-gray-600 mt-1">
          Registrar un nuevo paciente y crear su expediente médico
        </p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
        <p className="text-sm text-yellow-800">Componente en desarrollo</p>
      </div>
    </div>
  );
}
