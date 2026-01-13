'use client';

export default function EmpresasPage() {
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Empresas</h1>
        
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <p className="text-yellow-800">
            <strong>⚠️ Módulo en Desarrollo</strong><br/>
            Esta sección estará disponible próximamente. Actualmente puedes gestionar empresas desde la API.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">MOD-EMPRESAS</h2>
          <p className="text-gray-600 mb-4">
            Gestión de empresas clientes, perfiles de puesto y baterías contratadas.
          </p>

          <div className="space-y-2 text-sm text-gray-600">
            <p>✅ API: <code className="bg-gray-100 px-2 py-1 rounded">/api/empresas</code></p>
            <p>✅ Schema Prisma: Company, CompanyBattery, JobProfile</p>
            <p>📅 UI: Próxima versión</p>
          </div>
        </div>
      </div>
    </div>
  );
}
