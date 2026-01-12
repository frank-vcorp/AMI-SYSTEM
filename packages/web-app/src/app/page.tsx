/**
 * Página inicial del dashboard
 */
'use client';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-gray-50">
      <div className="w-full max-w-5xl text-center">
        <h1 className="text-4xl font-bold text-ami-purple mb-4">
          AMI-SYSTEM v2.0
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Atención Médica Integrada - Residente Digital con IA
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-ami-turquoise">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Setup Completo</h2>
            <p className="text-sm text-gray-600">Monorepo con pnpm + Turborepo</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-ami-purple">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Tipos Compartidos</h2>
            <p className="text-sm text-gray-600">Interfaces globales definidas</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-ami-turquoise">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Documentación</h2>
            <p className="text-sm text-gray-600">Specs y guías disponibles</p>
          </div>
        </div>
      </div>
    </main>
  );
}
