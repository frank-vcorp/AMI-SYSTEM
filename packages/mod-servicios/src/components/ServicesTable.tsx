// ServicesTable - Server Component
'use client';

import type { ServiceResponse } from '../types/service';

interface ServicesTableProps {
  services: ServiceResponse[];
  total: number;
  page: number;
  pageSize: number;
  onEdit?: (service: ServiceResponse) => void;
  onDelete?: (service: ServiceResponse) => void;
  onPageChange?: (page: number) => void;
}

export function ServicesTable({
  services,
  total,
  page,
  pageSize,
  onEdit,
  onDelete,
  onPageChange
}: ServicesTableProps) {
  const totalPages = Math.ceil(total / pageSize);
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-100 text-emerald-800';
      case 'INACTIVE':
        return 'bg-yellow-100 text-yellow-800';
      case 'DEPRECATED':
        return 'bg-orange-100 text-orange-800';
      case 'ARCHIVED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      LABORATORIO: 'Laboratorio',
      IMAGENES: 'Imágenes',
      ELECTROCARDIOGRAFIA: 'Electrocardiografía',
      OFTALMOLOGIA: 'Oftalmología',
      AUDIOMETRIA: 'Audiometría',
      ESPIROFOTOMETRIA: 'Espirofotometría',
      OTROS: 'Otros'
    };
    return labels[category] || category;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-ami-turquoise to-ami-purple rounded-lg p-4 text-white">
        <h2 className="text-xl font-bold">Catálogo de Servicios</h2>
        <p className="text-sm opacity-90">Total: {total} servicios</p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Código</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Nombre</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Categoría</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Costo</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Estado</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {services.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No hay servicios registrados
                </td>
              </tr>
            ) : (
              services.map((service) => (
                <tr key={service.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-mono text-gray-700">{service.code}</td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{service.name}</p>
                      {service.description && (
                        <p className="text-xs text-gray-500 line-clamp-1">{service.description}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{getCategoryLabel(service.category)}</td>
                  <td className="px-4 py-3 text-right text-gray-900 font-semibold">
                    ${service.costAmount.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                      {service.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center space-x-2">
                    <button
                      onClick={() => onEdit?.(service)}
                      className="px-3 py-1 bg-ami-turquoise text-white rounded text-xs font-medium hover:opacity-90"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => onDelete?.(service)}
                      className="px-3 py-1 bg-red-500 text-white rounded text-xs font-medium hover:opacity-90"
                    >
                      Eliminar
                    </button>
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
