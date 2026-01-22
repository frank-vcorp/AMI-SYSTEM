'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">AMI System</h1>
          <div className="flex gap-4">
            <Link href="/validaciones" className="text-blue-600 hover:text-blue-900 font-medium">
              Validaciones
            </Link>
            <Link href="/citas" className="text-green-600 hover:text-green-900 font-medium">
              Citas
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">AMI System MVP</h2>
          <p className="text-xl text-gray-600 mb-2">Sistema de Gestión de Exámenes Médicos</p>
          <p className="text-gray-500">Validación electrónica, firmas digitales y generación de reportes PDF</p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Validaciones Card */}
          <Link href="/validaciones">
            <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition cursor-pointer">
              <div className="text-4xl mb-4">✓</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Validaciones Médicas</h3>
              <p className="text-gray-600 mb-4">
                Gestiona validaciones de exámenes médicos con firmas electrónicas, extracción de datos y generación de reportes.
              </p>
              <div className="text-blue-600 font-semibold">Ver Validaciones →</div>
            </div>
          </Link>

          {/* Citas Card */}
          <Link href="/citas">
            <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition cursor-pointer">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Gestión de Citas</h3>
              <p className="text-gray-600 mb-4">
                Administra citas médicas, monitorea ocupancia de consultorios y optimiza recursos.
              </p>
              <div className="text-green-600 font-semibold">Ver Citas →</div>
            </div>
          </Link>
        </div>

        {/* API Documentation */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">API Endpoints</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="font-mono text-sm text-gray-700 mb-2">POST/GET</p>
              <p className="font-mono text-xs bg-gray-200 px-2 py-1 rounded">/api/validaciones</p>
              <p className="text-xs text-gray-600 mt-2">Crear y listar validaciones</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="font-mono text-sm text-gray-700 mb-2">GET/PUT</p>
              <p className="font-mono text-xs bg-gray-200 px-2 py-1 rounded">/api/validaciones/[id]</p>
              <p className="text-xs text-gray-600 mt-2">Obtener y actualizar validación</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="font-mono text-sm text-gray-700 mb-2">POST</p>
              <p className="font-mono text-xs bg-gray-200 px-2 py-1 rounded">/api/validaciones/[id]/generate-pdf</p>
              <p className="text-xs text-gray-600 mt-2">Generar PDF de validación</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="font-mono text-sm text-gray-700 mb-2">POST/GET</p>
              <p className="font-mono text-xs bg-gray-200 px-2 py-1 rounded">/api/citas</p>
              <p className="text-xs text-gray-600 mt-2">Crear y listar citas</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-600">
          <p className="mb-2"><strong>Version 1.0.0</strong> - MVP Ready for Demo</p>
          <p className="text-sm">Multi-tenant: 550e8400-e29b-41d4-a716-446655440000</p>
          <p className="text-xs text-gray-500 mt-4">Desarrollado con Next.js 14, Prisma, y TypeScript</p>
        </div>
      </div>
    </main>
  );
}
