// React Server Component: Lista de Clínicas
import type { ClinicListResponse, ClinicResponse } from '../types/clinic';

interface ClinicsTableProps {
  clinics: ClinicResponse[];
  total: number;
  page: number;
  pageSize: number;
  onEdit: (clinic: ClinicResponse) => void;
  onDelete: (clinicId: string) => void;
}

export function ClinicsTable({ 
  clinics, 
  total, 
  page, 
  pageSize,
  onEdit, 
  onDelete 
}: ClinicsTableProps) {
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-ami-turquoise to-ami-purple p-4 text-white rounded-t-lg">
        <h2 className="text-xl font-bold">Clínicas</h2>
        <p className="text-sm opacity-90">Total: {total} clínicas</p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Nombre</th>
              <th className="px-4 py-3 text-left font-semibold">Ciudad</th>
              <th className="px-4 py-3 text-left font-semibold">Camas</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3 text-center font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clinics.map((clinic) => (
              <tr 
                key={clinic.id} 
                className="border-b hover:bg-gray-50 transition"
              >
                <td className="px-4 py-3 font-medium text-ami-dark-gray">
                  {clinic.name}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {clinic.city}, {clinic.state}
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm">
                    {clinic.availableBeds}/{clinic.totalBeds}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={clinic.status} />
                </td>
                <td className="px-4 py-3 text-center space-x-2 flex justify-center">
                  <button
                    onClick={() => onEdit(clinic)}
                    className="px-3 py-1 text-sm bg-ami-turquoise text-white rounded hover:bg-opacity-80"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => onDelete(clinic.id)}
                    className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="bg-gray-50 px-4 py-3 border-t flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Página {page} de {totalPages}
        </p>
        <div className="space-x-2">
          <button
            disabled={page === 1}
            className="px-3 py-1 text-sm bg-ami-turquoise text-white rounded disabled:opacity-50"
          >
            ← Anterior
          </button>
          <button
            disabled={page === totalPages}
            className="px-3 py-1 text-sm bg-ami-turquoise text-white rounded disabled:opacity-50"
          >
            Siguiente →
          </button>
        </div>
      </div>
    </div>
  );
}

interface StatusBadgeProps {
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
}

function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    ACTIVE: { bg: 'bg-green-100', text: 'text-green-700', label: 'Activo' },
    INACTIVE: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Inactivo' },
    ARCHIVED: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Archivado' }
  };

  const config = statusConfig[status];

  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}
