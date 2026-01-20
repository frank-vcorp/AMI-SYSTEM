"use client";

/**
 * ExpedientTable Component
 * Tabla para listar expedientes con filtros y acciones
 */

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";

interface Expedient {
  id: string;
  folio: string;
  patientId: string;
  clinicId: string;
  status: string;
  medicalNotes: string | null;
  createdAt: string;
  patient?: { name: string };
}

interface ExpedientTableProps {
  status?: string;
  clinicId?: string;
  onRowClick?: (expedient: Expedient) => void;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function ExpedientTable({ status, clinicId, onRowClick }: ExpedientTableProps) {
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Build query string
  const query = new URLSearchParams();
  if (status) query.append("status", status);
  if (clinicId) query.append("clinicId", clinicId);
  query.append("page", page.toString());
  query.append("pageSize", pageSize.toString());

  const { data, error, isLoading } = useSWR(
    `/api/expedientes?${query.toString()}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  if (error) {
    return <div className="text-red-600">Error loading expedients</div>;
  }

  if (isLoading) {
    return <div className="text-gray-500">Loading...</div>;
  }

  const expedients: Expedient[] = data?.data || [];
  const { total = 0, totalPages = 1 } = data?.pagination || {};

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-4 py-2 text-left">Folio</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Patient</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Created</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {expedients.length === 0 ? (
              <tr>
                <td colSpan={5} className="border border-gray-300 px-4 py-2 text-center text-gray-500">
                  No expedients found
                </td>
              </tr>
            ) : (
              expedients.map((exp) => (
                <tr
                  key={exp.id}
                  onClick={() => onRowClick?.(exp)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="border border-gray-300 px-4 py-2 font-mono text-sm">
                    {exp.folio}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {exp.patient?.name || exp.patientId}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <span
                      className={`inline-block rounded px-2 py-1 text-xs font-semibold ${
                        exp.status === "COMPLETED"
                          ? "bg-green-100 text-green-800"
                          : exp.status === "IN_PROGRESS"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {exp.status}
                    </span>
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-sm">
                    {new Date(exp.createdAt).toLocaleDateString()}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <Link
                      href={`/admin/expedientes/${exp.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing page {page} of {totalPages} ({total} total)
        </p>
        <div className="space-x-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="rounded border border-gray-300 px-3 py-1 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="rounded border border-gray-300 px-3 py-1 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
