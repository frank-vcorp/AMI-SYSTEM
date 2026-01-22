'use client';

import { useState, useEffect } from 'react';

interface ValidationTask {
  id: string;
  patientId: string;
  status: string;
  verdict?: string;
  createdAt: string;
}

export default function ValidacionesPage() {
  const [validations, setValidations] = useState<ValidationTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ patientId: '', medicalExamId: '' });

  useEffect(() => {
    fetchValidations();
  }, []);

  const fetchValidations = async () => {
    try {
      const res = await fetch('/api/validaciones?tenantId=550e8400-e29b-41d4-a716-446655440000');
      if (res.ok) {
        const data = await res.json();
        setValidations(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching validations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/validaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tenantId: '550e8400-e29b-41d4-a716-446655440000',
        }),
      });
      if (res.ok) {
        setFormData({ patientId: '', medicalExamId: '' });
        setShowForm(false);
        fetchValidations();
      }
    } catch (error) {
      console.error('Error creating validation:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Validaciones Médicas</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            {showForm ? 'Cancelar' : 'Nueva Validación'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Crear Nueva Validación</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID Paciente
                </label>
                <input
                  type="text"
                  value={formData.patientId}
                  onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ej: PAT-001"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID Examen Médico
                </label>
                <input
                  type="text"
                  value={formData.medicalExamId}
                  onChange={(e) => setFormData({ ...formData, medicalExamId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ej: MED-001"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Crear Validación
              </button>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Cargando validaciones...</div>
          ) : validations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No hay validaciones aún</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Paciente</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Estado</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Veredicto</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Fecha</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {validations.map((val) => (
                  <tr key={val.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{val.id.slice(0, 8)}...</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{val.patientId}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        val.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        val.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {val.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{val.verdict || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(val.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <a href={`/validaciones/${val.id}`} className="text-blue-600 hover:text-blue-900">
                        Ver Detalles
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
