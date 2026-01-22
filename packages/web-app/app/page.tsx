export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">AMI System</h1>
        <p className="text-xl text-gray-600 mb-8">Sistema de Gestión de Exámenes Médicos</p>
        <div className="space-y-4">
          <p className="text-gray-700">
            <strong>API Endpoints disponibles:</strong>
          </p>
          <ul className="text-left inline-block space-y-2 text-sm text-gray-600">
            <li>✓ <code className="bg-gray-200 px-2 py-1 rounded">/api/validaciones</code></li>
            <li>✓ <code className="bg-gray-200 px-2 py-1 rounded">/api/validaciones/[id]</code></li>
            <li>✓ <code className="bg-gray-200 px-2 py-1 rounded">/api/validaciones/[id]/generate-pdf</code></li>
            <li>✓ <code className="bg-gray-200 px-2 py-1 rounded">/api/citas</code></li>
          </ul>
        </div>
        <p className="text-gray-500 text-sm mt-8">Version 1.0.0 - MVP Ready</p>
      </div>
    </main>
  );
}
