/**
 * /admin/clinicas
 * Server Component that displays the clinics management page
 */

import { ClinicsTable } from '@ami/mod-clinicas';

export const metadata = {
  title: 'Clinics | AMI-SYSTEM',
  description: 'Manage clinics and their capacity',
};

/**
 * Mock data provider (replace with real ClinicService when DB is ready)
 */
async function getClinics() {
  // In production, this would call the actual ClinicService
  // For now, return empty array to show the component works
  return {
    data: [],
    total: 0,
    page: 1,
    pageSize: 10,
    hasMore: false
  };
}

export default async function ClinicsPage() {
  const clinics = await getClinics();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Gestión de Clínicas</h1>
          <p className="text-slate-600">
            Administra clínicas, horarios, capacidad de camas y servicios disponibles
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <ClinicsTable 
            initialData={clinics.data}
            totalCount={clinics.total}
          />
        </div>

        {/* Footer Note */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
          <p className="text-sm">
            <strong>Nota:</strong> Esta vista está conectada a MOD-CLINICAS. Los datos se sincronizarán automáticamente
            cuando PostgreSQL esté configurado.
          </p>
        </div>
      </div>
    </div>
  );
}
