/**
 * ⚙️ IMPL REFERENCE: IMPL-20260122-01
 * 📄 SEE: context/SPEC-MVP-DEMO-APIS.md
 * 🤖 AUTHOR: SOFIA (Claude Opus 4.5)
 * 
 * Página de Gestión de Pacientes
 * CRUD completo con API real
 * Incluye vinculación con Empresa y Perfil de Puesto
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@ami/core-ui';

interface Patient {
  id: string;
  name: string;
  email?: string;
  phone?: string;          // Alias para compatibilidad
  phoneNumber?: string;    // Campo real del schema
  birthDate?: string;      // Alias para compatibilidad
  dateOfBirth?: string;    // Campo real del schema
  gender?: string;
  documentId?: string;     // Alias para compatibilidad
  documentNumber?: string; // Campo real del schema
  status: string;
  companyId?: string;
  company?: { id: string; name: string };
  jobProfileId?: string;
  jobProfile?: { id: string; name: string };
  _count?: {
    expedients: number;
    appointments: number;
  };
}

interface Company {
  id: string;
  name: string;
}

interface JobProfile {
  id: string;
  name: string;
  companyId: string;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  gender: string;
  documentId: string;
  companyId: string;
  jobProfileId: string;
}

const initialFormData: FormData = {
  name: '',
  email: '',
  phone: '',
  birthDate: '',
  gender: 'MASCULINO',
  documentId: '',
  companyId: '',
  jobProfileId: '',
};

export default function PacientesPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [jobProfiles, setJobProfiles] = useState<JobProfile[]>([]);
  const [filteredJobProfiles, setFilteredJobProfiles] = useState<JobProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterCompany, setFilterCompany] = useState('');

  // Load companies and job profiles on mount
  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        const [companiesRes, jobProfilesRes] = await Promise.all([
          fetch('/api/empresas?pageSize=100'),
          fetch('/api/job-profiles?pageSize=100'),
        ]);
        if (companiesRes.ok) {
          const data = await companiesRes.json();
          setCompanies(data.data || []);
        }
        if (jobProfilesRes.ok) {
          const data = await jobProfilesRes.json();
          setJobProfiles(data.data || []);
        }
      } catch (err) {
        console.error('Error loading catalogs:', err);
      }
    };
    loadCatalogs();
  }, []);

  // Filter job profiles when company changes in form
  useEffect(() => {
    if (formData.companyId) {
      setFilteredJobProfiles(jobProfiles.filter(jp => jp.companyId === formData.companyId));
    } else {
      setFilteredJobProfiles([]);
    }
  }, [formData.companyId, jobProfiles]);

  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ pageSize: '100' });
      if (search) params.append('search', search);
      if (filterCompany) params.append('companyId', filterCompany);
      
      const response = await fetch(`/api/patients?${params}`);
      if (response.ok) {
        const data = await response.json();
        setPatients(data.data || []);
      } else {
        throw new Error('Error al cargar pacientes');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [search, filterCompany]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const url = editingId ? `/api/patients/${editingId}` : '/api/patients';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          birthDate: formData.birthDate || null,
        }),
      });

      if (response.ok) {
        setSuccess(editingId ? 'Paciente actualizado exitosamente' : 'Paciente creado exitosamente');
        setShowForm(false);
        setEditingId(null);
        setFormData(initialFormData);
        fetchPatients();
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Error al guardar paciente');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const handleEdit = (patient: Patient) => {
    setEditingId(patient.id);
    const birthDateValue = patient.dateOfBirth || patient.birthDate;
    setFormData({
      name: patient.name || '',
      email: patient.email || '',
      phone: patient.phoneNumber || patient.phone || '',
      birthDate: birthDateValue ? birthDateValue.split('T')[0] : '',
      gender: patient.gender === 'M' ? 'MASCULINO' : patient.gender === 'F' ? 'FEMENINO' : patient.gender === 'O' ? 'OTRO' : (patient.gender || 'MASCULINO'),
      documentId: patient.documentNumber || patient.documentId || '',
      companyId: patient.companyId || '',
      jobProfileId: patient.jobProfileId || '',
    });
    setShowForm(true);
    setError(null);
    setSuccess(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este paciente?')) return;

    try {
      const response = await fetch(`/api/patients/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setSuccess('Paciente eliminado exitosamente');
        fetchPatients();
      } else {
        throw new Error('Error al eliminar paciente');
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
      ARCHIVED: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return '-';
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return `${age} años`;
  };

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Gestión de Pacientes</h1>
            <p className="text-slate-600">
              Administra la información de pacientes y sus expedientes
            </p>
          </div>
          <Button
            onClick={() => { setShowForm(true); setEditingId(null); setFormData(initialFormData); }}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3"
          >
            ➕ Nuevo Paciente
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
              {editingId ? 'Editar Paciente' : 'Nuevo Paciente'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Apellido Paterno, Apellido Materno, Nombre(s)"
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
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Género</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value="MASCULINO">Masculino</option>
                  <option value="FEMENINO">Femenino</option>
                  <option value="OTRO">Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Documento ID (CURP/INE)</label>
                <input
                  type="text"
                  value={formData.documentId}
                  onChange={(e) => setFormData({ ...formData, documentId: e.target.value.toUpperCase() })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  maxLength={18}
                />
              </div>
              {/* Company and Job Profile Selectors */}
              <div className="md:col-span-2 lg:col-span-3 border-t pt-4 mt-2">
                <h3 className="text-sm font-semibold text-gray-600 mb-3">🏢 Vinculación Laboral</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
                    <select
                      value={formData.companyId}
                      onChange={(e) => setFormData({ ...formData, companyId: e.target.value, jobProfileId: '' })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    >
                      <option value="">Sin empresa asignada</option>
                      {companies.map(company => (
                        <option key={company.id} value={company.id}>{company.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Perfil de Puesto</label>
                    <select
                      value={formData.jobProfileId}
                      onChange={(e) => setFormData({ ...formData, jobProfileId: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      disabled={!formData.companyId}
                    >
                      <option value="">
                        {formData.companyId ? 'Seleccionar perfil...' : 'Primero seleccione empresa'}
                      </option>
                      {filteredJobProfiles.map(profile => (
                        <option key={profile.id} value={profile.id}>{profile.name}</option>
                      ))}
                    </select>
                    {formData.companyId && filteredJobProfiles.length === 0 && (
                      <p className="text-xs text-amber-600 mt-1">
                        Esta empresa no tiene perfiles de puesto configurados
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="md:col-span-2 lg:col-span-3 flex gap-4">
                <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2">
                  {editingId ? 'Actualizar' : 'Crear'} Paciente
                </Button>
                <Button type="button" onClick={handleCancel} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2">
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Search and Filter */}
        <div className="mb-6 flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Buscar por nombre, email o documento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-80 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
          <select
            value={filterCompany}
            onChange={(e) => setFilterCompany(e.target.value)}
            className="w-full md:w-64 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          >
            <option value="">Todas las empresas</option>
            {companies.map(company => (
              <option key={company.id} value={company.id}>{company.name}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Cargando pacientes...</div>
          ) : patients.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-xl mb-2">No hay pacientes registrados</p>
              <p className="text-sm">Haz clic en "Nuevo Paciente" para agregar uno.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Paciente</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Documento</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Empresa / Puesto</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Contacto</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Edad</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Expedientes</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Estado</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {patients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{patient.name}</div>
                        <div className="text-sm text-gray-500">
                          {formatDate(patient.dateOfBirth || patient.birthDate)} • {patient.gender === 'M' ? 'M' : patient.gender === 'F' ? 'F' : patient.gender === 'MASCULINO' ? 'M' : patient.gender === 'FEMENINO' ? 'F' : 'O'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-600">
                        {patient.documentNumber || patient.documentId || '-'}
                      </td>
                      <td className="px-4 py-3">
                        {patient.company ? (
                          <>
                            <div className="text-sm font-medium text-gray-900">{patient.company.name}</div>
                            <div className="text-xs text-gray-500">{patient.jobProfile?.name || 'Sin puesto'}</div>
                          </>
                        ) : (
                          <span className="text-sm text-gray-400 italic">Sin empresa</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {patient.email && <div className="text-sm text-gray-900">{patient.email}</div>}
                        {(patient.phoneNumber || patient.phone) && <div className="text-sm text-gray-500">{patient.phoneNumber || patient.phone}</div>}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-600">
                        {calculateAge(patient.dateOfBirth || patient.birthDate)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-medium text-gray-900">
                          {patient._count?.expedients || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(patient.status)}`}>
                          {patient.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(patient)}
                            className="text-cyan-600 hover:text-cyan-800"
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(patient.id)}
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
