/**
 * /admin/expedientes
 * List and manage medical records
 */

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface Expedient {
  id: string;
  patientId: string;
  clinicId: string;
  companyId?: string;
  status: string;
  patient: {
    id: string;
    name: string;
    email: string;
    documentId: string;
  };
  medicalExamsCount: number;
  studiesCount: number;
  createdAt: string;
}

export default function ExpeditentsPage() {
  const [expedients, setExpedients] = useState<Expedient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const tenantId = "default-tenant"; // TODO: Get from context

  useEffect(() => {
    const loadExpedients = async () => {
      try {
        const response = await fetch(
          `/api/expedientes?tenantId=${tenantId}&limit=20`
        );
        if (!response.ok) throw new Error("Failed to fetch expedients");
        const data = await response.json();
        setExpedients(data.data);
      } catch (err) {
        setError("Error loading expedients");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadExpedients();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de que desea eliminar este expediente?")) {
      return;
    }

    try {
      const response = await fetch(`/api/expedientes/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete expedient");
      setExpedients((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      setError("Error deleting expedient");
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expedientes Médicos</h1>
          <p className="text-gray-600 mt-1">
            Gestionar registros médicos de pacientes
          </p>
        </div>
        <Link href="/admin/expedientes/new">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            + Nuevo Expediente
          </button>
        </Link>
      </div>

      {/* Content */}
      {error && (
        <div className="p-4 bg-red-100 text-red-800 rounded-lg">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="text-gray-500">Cargando expedientes...</div>
        </div>
      ) : expedients.length === 0 ? (
        <div className="flex items-center justify-center h-48">
          <div className="text-gray-500">No hay expedientes</div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 p-2 text-left">Paciente</th>
                <th className="border border-gray-300 p-2 text-left">Email</th>
                <th className="border border-gray-300 p-2 text-left">Estado</th>
                <th className="border border-gray-300 p-2 text-left">Exámenes</th>
                <th className="border border-gray-300 p-2 text-left">Estudios</th>
                <th className="border border-gray-300 p-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {expedients.map((exp) => (
                <tr key={exp.id}>
                  <td className="border border-gray-300 p-2">{exp.patient.name}</td>
                  <td className="border border-gray-300 p-2">{exp.patient.email}</td>
                  <td className="border border-gray-300 p-2">
                    <span className={`px-2 py-1 rounded text-white text-sm ${
                      exp.status === "DRAFT" ? "bg-gray-500" :
                      exp.status === "IN_PROGRESS" ? "bg-blue-500" :
                      exp.status === "COMPLETED" ? "bg-green-500" :
                      "bg-purple-500"
                    }`}>
                      {exp.status}
                    </span>
                  </td>
                  <td className="border border-gray-300 p-2">{exp.medicalExamsCount}</td>
                  <td className="border border-gray-300 p-2">{exp.studiesCount}</td>
                  <td className="border border-gray-300 p-2">
                    <Link href={`/admin/expedientes/${exp.id}`}>
                      <button className="text-blue-600 hover:underline mr-3">Ver</button>
                    </Link>
                    <button
                      onClick={() => handleDelete(exp.id)}
                      className="text-red-600 hover:underline"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
