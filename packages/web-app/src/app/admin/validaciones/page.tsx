/**
 * Page: /admin/validaciones
 * List of validation tasks pending review
 */

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface ValidationTaskRow {
  id: string;
  expedientId: string;
  patientName: string;
  documentId: string;
  companyName?: string;
  status: string;
  studies: number;
  createdAt: string;
}

export default function ValidacionesPage() {
  const [tasks, setTasks] = useState<ValidationTaskRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("PENDING");

  useEffect(() => {
    fetchValidations();
  }, [statusFilter]);

  const fetchValidations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/validaciones?status=${statusFilter}&limit=50`
      );
      if (!response.ok) throw new Error("Failed to fetch");

      const { data } = await response.json();
      setTasks(
        data.map((task: any) => ({
          id: task.id,
          expedientId: task.expedientId,
          patientName: task.expedient?.patient?.name || "N/A",
          documentId: task.expedient?.patient?.documentId || "N/A",
          companyName: task.expedient?.patient?.company?.name || "—",
          status: task.status,
          studies: task.studies?.length || 0,
          createdAt: new Date(task.createdAt).toLocaleDateString(),
        }))
      );
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar datos");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      IN_REVIEW: "bg-blue-100 text-blue-800",
      COMPLETED: "bg-green-100 text-green-800",
      SIGNED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">✓ Validación de Estudios</h1>
        <p className="text-gray-600 mt-1">
          Revisa expedientes, valida datos extraídos y firma dictámenes
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Pendientes", count: "—", color: "bg-yellow-50" },
          { label: "En Revisión", count: "—", color: "bg-blue-50" },
          { label: "Completados", count: "—", color: "bg-green-50" },
          { label: "Rechazados", count: "—", color: "bg-red-50" },
        ].map((item, idx) => (
          <div key={idx} className={`${item.color} rounded-lg p-4 border`}>
            <p className="text-sm text-gray-600 font-semibold">{item.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{item.count}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {["PENDING", "IN_REVIEW", "SIGNED", "REJECTED"].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === status
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {status === "PENDING" && "📋 Pendientes"}
            {status === "IN_REVIEW" && "👁️ En Revisión"}
            {status === "SIGNED" && "✓ Firmados"}
            {status === "REJECTED" && "✕ Rechazados"}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando validaciones...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-800 border border-red-200">
            {error}
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="text-lg font-semibold">No hay expedientes para validar</p>
            <p className="text-sm mt-1">
              Los expedientes listos aparecerán aquí
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Paciente
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Empresa
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Estudios
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, idx) => (
                <tr
                  key={task.id}
                  className={
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }
                >
                  <td className="px-6 py-3">
                    <div>
                      <p className="font-medium text-gray-900">
                        {task.patientName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {task.documentId}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600">
                    {task.companyName}
                  </td>
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">
                    📁 {task.studies}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(
                        task.status
                      )}`}
                    >
                      {task.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600">
                    {task.createdAt}
                  </td>
                  <td className="px-6 py-3 text-sm">
                    <Link
                      href={`/admin/validaciones/${task.id}`}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Revisar →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
