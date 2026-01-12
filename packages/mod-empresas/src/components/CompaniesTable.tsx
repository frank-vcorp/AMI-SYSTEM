// CompaniesTable - Server Component
'use client';

import type { CompanyResponse } from '../types/company';

interface CompaniesTableProps {
  companies: CompanyResponse[];
  total: number;
  page: number;
  pageSize: number;
  onEdit?: (company: CompanyResponse) => void;
  onDelete?: (company: CompanyResponse) => void;
  onManageBatteries?: (company: CompanyResponse) => void;
  onManageProfiles?: (company: CompanyResponse) => void;
  onPageChange?: (page: number) => void;
}

export function CompaniesTable({
  companies,
  total,
  page,
  pageSize,
  onEdit,
  onDelete,
  onManageBatteries,
  onManageProfiles,
  onPageChange
}: CompaniesTableProps) {
  const totalPages = Math.ceil(total / pageSize);
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-100 text-emerald-800';
      case 'INACTIVE':
        return 'bg-yellow-100 text-yellow-800';
      case 'SUSPENDED':
        return 'bg-red-100 text-red-800';
      case 'ARCHIVED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-ami-turquoise to-ami-purple rounded-lg p-4 text-white">
        <h2 className="text-xl font-bold">Gestión de Empresas Clientes</h2>
        <p className="text-sm opacity-90">Total: {total} empresas</p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Nombre</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">RFC</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Contacto</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Baterías</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Perfiles</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Estado</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {companies.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  No hay empresas registradas
                </td>
              </tr>
            ) : (
              companies.map((company) => (
                <tr key={company.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{company.name}</p>
                      {company.city && (
                        <p className="text-xs text-gray-500">{company.city}, {company.state}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-gray-700">{company.rfc || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      {company.contactPerson && <p>{company.contactPerson}</p>}
                      {company.email && <p className="text-xs text-gray-500">{company.email}</p>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                      {company.batteriesCount || 0}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                      {company.jobProfilesCount || 0}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(company.status)}`}>
                      {company.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex flex-wrap gap-1 justify-center">
                      <button
                        onClick={() => onEdit?.(company)}
                        className="px-2 py-1 bg-ami-turquoise text-white rounded text-xs font-medium hover:opacity-90"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => onManageBatteries?.(company)}
                        className="px-2 py-1 bg-blue-500 text-white rounded text-xs font-medium hover:opacity-90"
                      >
                        Baterías
                      </button>
                      <button
                        onClick={() => onManageProfiles?.(company)}
                        className="px-2 py-1 bg-purple-600 text-white rounded text-xs font-medium hover:opacity-90"
                      >
                        Perfiles
                      </button>
                      <button
                        onClick={() => onDelete?.(company)}
                        className="px-2 py-1 bg-red-500 text-white rounded text-xs font-medium hover:opacity-90"
                      >
                        Eliminar
                      </button>
                    </div>
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
          Página {page} de {totalPages}
        </p>
        <div className="space-x-2">
          <button
            onClick={() => onPageChange?.(page - 1)}
            disabled={!hasPrev}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
          >
            Anterior
          </button>
          <button
            onClick={() => onPageChange?.(page + 1)}
            disabled={!hasNext}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
