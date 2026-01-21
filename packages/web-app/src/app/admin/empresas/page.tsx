/**
 * ⚙️ IMPL REFERENCE: IMPL-20260121-01
 * 📄 SEE: context/SPEC-MVP-DEMO-APIS.md
 * 🤖 AUTHOR: SOFIA (Claude Opus 4.5)
 * 
 * Página de Gestión de Empresas (Companies)
 * CRUD completo con API real
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@ami/core-ui';

interface Company {
  id: string;
  name: string;
  rfc: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phoneNumber?: string;
  email?: string;
  contactPerson?: string;
  contactPhone?: string;
  maxEmployees?: number;
  status: string;
  _count?: {
    jobProfiles: number;
    batteries: number;
  };
}

interface FormData {
  name: string;
  rfc: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phoneNumber: string;
  email: string;
  contactPerson: string;
  contactPhone: string;
  maxEmployees: string;
}

const initialFormData: FormData = {
  name: '',
  rfc: '',
  description: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  phoneNumber: '',
  email: '',
  contactPerson: '',
  contactPhone: '',
  maxEmployees: '',
};

export default function EmpresasPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ pageSize: '100' });
      if (search) params.append('search', search);
      
      const response = await fetch(`/api/empresas?${params}`);
      if (response.ok) {
        const data = await response.json();
        setCompanies(data.data || []);
      } else {
        throw new Error('Error al cargar empresas');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const url = editingId ? `/api/empresas/${editingId}` : '/api/empresas';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          maxEmployees: formData.maxEmployees ? parseInt(formData.maxEmployees) : null,
        }),
      });

      if (response.ok) {
        setSuccess(editingId ? 'Empresa actualizada exitosamente' : 'Empresa creada exitosamente');
        setShowForm(false);
        setEditingId(null);
        setFormData(initialFormData);
        fetchCompanies();
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Error al guardar empresa');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const handleEdit = (company: Company) => {
    setEditingId(company.id);
    setFormData({
      name: company.name || '',
      rfc: company.rfc || '',
      description: company.description || '',
      address: company.address || '',
      city: company.city || '',
      state: company.state || '',
      zipCode: company.zipCode || '',
      phoneNumber: company.phoneNumber || '',
      email: company.email || '',
      contactPerson: company.contactPerson || '',
      contactPhone: company.contactPhone || '',
      maxEmployees: company.maxEmployees?.toString() || '',
    });
    setShowForm(true);
    setError(null);
    setSuccess(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar esta empresa?')) return;

    try {
      const response = await fetch(`/api/empresas/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setSuccess('Empresa eliminada exitosamente');
        fetchCompanies();
      } else {
        throw new Error('Error al eliminar empresa');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(initialFormData);
    setError(null);
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-800',
      INACTIVE: 'bg-gray-100 text-gray-800',
      SUSPENDED: 'bg-red-100 text-red-800',
      ARCHIVED: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Gestión de Empresas</h1>
            <p className="text-slate-600">
              Administra empresas clientes, perfiles de puesto y baterías contratadas
            </p>
          </div>
          <Button
            onClick={() => { setShowForm(true); setEditingId(null); setFormData(initialFormData); }}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3"
          >
            ➕ Nueva Empresa
          </Button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded">
            {success}
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="mb-8 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              {editingId ? 'Editar Empresa' : 'Nueva Empresa'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">RFC *</label>
                <input
                  type="text"
                  required
                  value={formData.rfc}
                  onChange={(e) => setFormData({ ...formData, rfc: e.target.value.toUpperCase() })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="XAXX010101000"
                  maxLength={13}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Persona de Contacto</label>
                <input
                  type="text"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono Contacto</label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Código Postal</label>
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Máx. Empleados</label>
                <input
                  type="number"
                  value={formData.maxEmployees}
                  onChange={(e) => setFormData({ ...formData, maxEmployees: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2 lg:col-span-3 flex gap-4">
                <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2">
                  {editingId ? 'Actualizar' : 'Crear'} Empresa
                </Button>
                <Button type="button" onClick={handleCancel} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2">
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar por nombre, RFC o descripción..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-96 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Cargando empresas...</div>
          ) : companies.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-xl mb-2">No hay empresas registradas</p>
              <p className="text-sm">Haz clic en "Nueva Empresa" para agregar una.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Empresa</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">RFC</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Contacto</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Ciudad</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Perfiles</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Estado</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {companies.map((company) => (
                    <tr key={company.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{company.name}</div>
                        {company.email && <div className="text-sm text-gray-500">{company.email}</div>}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-600">{company.rfc}</td>
                      <td className="px-4 py-3">
                        {company.contactPerson && <div className="text-sm text-gray-900">{company.contactPerson}</div>}
                        {company.phoneNumber && <div className="text-sm text-gray-500">{company.phoneNumber}</div>}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {company.city}{company.state ? `, ${company.state}` : ''}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-medium text-gray-900">
                          {company._count?.jobProfiles || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(company.status)}`}>
                          {company.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(company)}
                            className="text-cyan-600 hover:text-cyan-800"
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(company.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Eliminar"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
