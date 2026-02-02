/**
 * /admin/expedientes
 * List and manage medical records
 */

"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ExpedientTable } from "@ami/mod-expedientes";

function ExpedientesContent() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get('status') || "";

  const [statusFilter, setStatusFilter] = useState<string>(initialStatus);
  const [clinicFilter, setClinicFilter] = useState<string>("");

  // Sync state if URL param changes
  useEffect(() => {
    const status = searchParams.get('status');
    if (status) {
      setStatusFilter(status);
    }
  }, [searchParams]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Gestión de Expedientes</h1>
          <p className="mt-1 text-sm text-gray-500">
            Administra el historial clínico, validaciones y entregables de los pacientes.
          </p>
        </div>
        <Link
          href="/admin/expedientes/new"
          className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
        >
          <svg className="-ml-0.5 mr-1.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v7h7a1 1 0 110 2h-7v7a1 1 0 11-2 0v-7H2a1 1 0 110-2h7V3a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Nuevo Expediente
        </Link>
      </div>

      {/* Filters Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Filtrar por Estado
            </label>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
              >
                <option value="">Todos los estados</option>
                <optgroup label="📋 Pre-atención">
                  <option value="SCHEDULED">Agendado</option>
                  <option value="DRAFT">Borrador</option>
                </optgroup>
                <optgroup label="🏥 Atención">
                  <option value="CHECKED_IN">En Sala (Check-in)</option>
                  <option value="IN_PHYSICAL_EXAM">En Examen Médico</option>
                  <option value="EXAM_COMPLETED">Examen Finalizado</option>
                </optgroup>
                <optgroup label="⏳ Procesamiento">
                  <option value="AWAITING_STUDIES">Esperando Estudios</option>
                  <option value="STUDIES_UPLOADED">Estudios Cargados</option>
                  <option value="DATA_EXTRACTED">Datos Extraídos (IA)</option>
                </optgroup>
                <optgroup label="✅ Validación">
                  <option value="READY_FOR_REVIEW">Listo para Revisión</option>
                  <option value="IN_VALIDATION">En Validación</option>
                </optgroup>
                <optgroup label="📦 Finalizado">
                  <option value="VALIDATED">Validado / Apto</option>
                  <option value="DELIVERED">Entregado</option>
                  <option value="ARCHIVED">Archivado</option>
                </optgroup>
                <optgroup label="❌ Otros">
                  <option value="CANCELLED">Cancelado</option>
                </optgroup>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Filtrar por Clínica
            </label>
            <select
              value={clinicFilter}
              onChange={(e) => setClinicFilter(e.target.value)}
              className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
            >
              <option value="">Todas las clínicas</option>
              {/* TODO: Load clinic options from API */}
            </select>
          </div>

          {/* Search Placeholder (Visual only for now) */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Búsqueda Rápida
            </label>
            <div className="relative rounded-md shadow-sm">
              <input
                type="text"
                className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="Nombre, Folio o ID..."
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
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

export default function ExpedientesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <ExpedientesContent />
    </Suspense>
  );
}
