"use client";

/**
 * ExpedientTable Component
 * Tabla para listar expedientes con filtros y acciones
 */

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { ExpedientStatusBadge } from "./ExpedientStatusBadge";

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
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error cargando expedientes</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>Por favor intente nuevamente.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 space-x-2 animate-pulse">
        <div className="h-4 w-4 bg-indigo-400 rounded-full"></div>
        <div className="h-4 w-4 bg-indigo-400 rounded-full"></div>
        <div className="h-4 w-4 bg-indigo-400 rounded-full"></div>
        <span className="text-sm font-medium text-gray-500 ml-2">Cargando expedientes...</span>
      </div>
    );
  }

  const expedients: Expedient[] = data?.data || [];
  const { total = 0, totalPages = 1 } = data?.pagination || {};

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Folio
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Paciente
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Fecha Creación
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {expedients.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500 bg-gray-50/50">
                  <div className="flex flex-col items-center justify-center">
                    <svg className="h-10 w-10 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 011.414.586l4 4a1 1 0 01.586 1.414V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="font-medium">No se encontraron expedientes</span>
                    <span className="text-xs text-gray-400 mt-1">Intente ajustar los filtros de búsqueda</span>
                  </div>
                </td>
              </tr>
            ) : (
              expedients.map((exp) => (
                <tr
                  key={exp.id}
                  onClick={() => onRowClick?.(exp)}
                  className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer group"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600 font-mono">
                    {exp.folio}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {exp.patient?.name || exp.patientId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <ExpedientStatusBadge status={exp.status} size="sm" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(exp.createdAt).toLocaleDateString("es-MX", {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/admin/expedientes/${exp.id}`}
                      className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                      onClick={(e) => e.stopPropagation()} // Prevenir doble click event si la row es clickeable
                    >
                      Ver Detalle
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando página <span className="font-medium">{page}</span> de <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                >
                  <span className="sr-only">Anterior</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                >
                  <span className="sr-only">Siguiente</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
