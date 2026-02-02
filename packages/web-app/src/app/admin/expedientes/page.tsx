/**
 * /admin/expedientes
 * List and manage medical records
 */

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ExpedientTable } from "@ami/mod-expedientes";

export default function ExpedientesPage() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [clinicFilter, setClinicFilter] = useState<string>("");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Medical Records</h1>
          <p className="mt-1 text-gray-600">
            View and manage patient medical records
          </p>
        </div>
        <Link
          href="/admin/expedientes/new"
          className="inline-flex justify-center rounded-md border border-transparent bg-purple-600 py-2 px-4 text-sm font-medium text-white hover:bg-purple-700"
        >
          Create New Record
        </Link>
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-gray-300 bg-white p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            >
              <option value="">All Statuses</option>
              <optgroup label="📋 Pre-atención">
                <option value="SCHEDULED">Scheduled</option>
                <option value="DRAFT">Draft</option>
              </optgroup>
              <optgroup label="🏥 Atención">
                <option value="CHECKED_IN">Checked In</option>
                <option value="IN_PHYSICAL_EXAM">In Physical Exam</option>
                <option value="EXAM_COMPLETED">Exam Completed</option>
              </optgroup>
              <optgroup label="⏳ Procesamiento">
                <option value="AWAITING_STUDIES">Awaiting Studies</option>
                <option value="STUDIES_UPLOADED">Studies Uploaded</option>
                <option value="DATA_EXTRACTED">Data Extracted</option>
              </optgroup>
              <optgroup label="✅ Validación">
                <option value="READY_FOR_REVIEW">Ready for Review</option>
                <option value="IN_VALIDATION">In Validation</option>
              </optgroup>
              <optgroup label="📦 Finalizado">
                <option value="VALIDATED">Validated</option>
                <option value="DELIVERED">Delivered</option>
                <option value="ARCHIVED">Archived</option>
              </optgroup>
              <optgroup label="❌ Otros">
                <option value="CANCELLED">Cancelled</option>
              </optgroup>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Clinic
            </label>
            <select
              value={clinicFilter}
              onChange={(e) => setClinicFilter(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            >
              <option value="">All Clinics</option>
              {/* TODO: Load clinic options from API */}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-gray-300 bg-white overflow-hidden">
        <ExpedientTable
          status={statusFilter || undefined}
          clinicId={clinicFilter || undefined}
          onRowClick={(expedient) => {
            window.location.href = `/admin/expedientes/${expedient.id}`;
          }}
        />
      </div>
    </div>
  );
}
