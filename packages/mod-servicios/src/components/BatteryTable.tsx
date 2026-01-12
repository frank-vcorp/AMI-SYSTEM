'use client';

import type { BatteryResponse } from '../types/service';

interface BatteryTableProps {
  batteries: BatteryResponse[];
  loading?: boolean;
  onEdit?: (battery: BatteryResponse) => void;
  onDelete?: (battery: BatteryResponse) => void;
}

export function BatteryTable({ batteries, loading, onEdit, onDelete }: BatteryTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'INACTIVE': return 'bg-yellow-100 text-yellow-800';
      case 'ARCHIVED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-700 font-medium">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3 text-center">Servicios</th>
              <th className="px-4 py-3 text-center">Duración</th>
              <th className="px-4 py-3 text-right">Costo Total</th>
              <th className="px-4 py-3 text-right">Precio Venta</th>
              <th className="px-4 py-3 text-center">Estado</th>
              <th className="px-4 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={7} className="px-4 py-4">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </td>
                </tr>
              ))
            ) : batteries.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  No hay baterías registradas.
                </td>
              </tr>
            ) : (
              batteries.map((battery) => (
                <tr key={battery.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{battery.name}</p>
                      {battery.description && (
                        <p className="text-xs text-gray-500 line-clamp-1">{battery.description}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                      {battery.services ? battery.services.length : 0}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700">
                    {battery.durationMin} min
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900 font-semibold">
                    ${Number(battery.costTotal || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900 font-semibold">
                    ${Number(battery.totalPrice || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(battery.status)}`}>
                      {battery.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center space-x-2">
                    <button
                      onClick={() => onEdit?.(battery)}
                      className="px-3 py-1 bg-ami-turquoise text-white rounded text-xs font-medium hover:opacity-90"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => onDelete?.(battery)}
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
    </div>
  );
}
