/**
 * /admin/expedientes/new
 * Create new expedient from appointment
 */

"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { ExpedientForm } from "@ami/mod-expedientes";

function NewExpedientContent() {
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get("appointmentId");
  const patientId = searchParams.get("patientId");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Expedient</h1>
          <p className="mt-1 text-gray-600">
            Register a new medical record for a patient
          </p>
        </div>
        <Link
          href="/admin/expedientes"
          className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Back to List
        </Link>
      </div>

      <div className="rounded-lg border border-gray-300 bg-white p-6 max-w-2xl">
        <ExpedientForm
          appointmentId={appointmentId || undefined}
          patientId={patientId || undefined}
          onSuccess={(expedient) => {
            window.location.href = `/admin/expedientes/${expedient.id}`;
          }}
          onError={(error) => {
            console.error("Error creating expedient:", error);
            alert(`Error: ${error.message}`);
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
