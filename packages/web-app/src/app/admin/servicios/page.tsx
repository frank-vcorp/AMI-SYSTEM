/**
 * ⚙️ IMPL REFERENCE: IMPL-20260121-01
 * 📄 SEE: context/SPEC-MVP-DEMO-APIS.md
 * 🤖 AUTHOR: SOFIA (Claude Opus 4.5)
 * 
 * Página de Gestión de Servicios Médicos y Baterías
 * CRUD completo con API real
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@ami/core-ui';

interface Service {
  id: string;
  name: string;
  code: string;
  description?: string;
  category?: string;
  estimatedMinutes?: number;
  costAmount?: number;
  sellingPrice?: number;
  requiresEquipment?: boolean;
  equipmentName?: string;
  status: string;
  _count?: { batteries: number; clinics: number };
}

interface Battery {
  id: string;
  name: string;
  description?: string;
  costTotal?: number;
  sellingPriceTotal?: number;
  status: string;
  services: { service: { id: string; name: string; code: string; sellingPrice?: number } }[];
  _count?: { services: number; contractedBatteries: number };
}

type TabType = 'services' | 'batteries';

const SERVICE_CATEGORIES = [
  'LABORATORIO', 'RAYOS_X', 'AUDIOMETRIA', 'ESPIROMETRIA', 'ELECTROCARDIOGRAMA',
  'OFTALMOLOGIA', 'CONSULTA_MEDICA', 'VACUNACION', 'OTROS'
];

export default function ServiciosPage() {
  const [activeTab, setActiveTab] = useState<TabType>('services');
  const [services, setServices] = useState<Service[]>([]);
  const [batteries, setBatteries] = useState<Battery[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Service form
  const [serviceForm, setServiceForm] = useState({
    name: '', code: '', description: '', category: 'OTROS',
    estimatedMinutes: '30', costAmount: '', sellingPrice: '',
    requiresEquipment: false, equipmentName: '',
  });

  // Battery form
  const [batteryForm, setBatteryForm] = useState({
    name: '', description: '', sellingPriceTotal: '', serviceIds: [] as string[],
  });

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ pageSize: '100' });
      if (search) params.append('search', search);
      
      const response = await fetch(`/api/services?${params}`);
      if (response.ok) {
        const data = await response.json();
        setServices(data.data || []);
      }
    } catch (err) {
      setError('Error al cargar servicios');
    } finally {
      setLoading(false);
    }
  }, [search]);

  const fetchBatteries = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ pageSize: '100' });
      if (search) params.append('search', search);
      
      const response = await fetch(`/api/batteries?${params}`);
      if (response.ok) {
        const data = await response.json();
        setBatteries(data.data || []);
      }
    } catch (err) {
      setError('Error al cargar baterías');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    if (activeTab === 'services') {
      fetchServices();
    } else {
      fetchBatteries();
    }
  }, [activeTab, fetchServices, fetchBatteries]);

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const url = editingId ? `/api/services/${editingId}` : '/api/services';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...serviceForm,
          estimatedMinutes: parseInt(serviceForm.estimatedMinutes),
          costAmount: serviceForm.costAmount ? parseFloat(serviceForm.costAmount) : 0,
          sellingPrice: serviceForm.sellingPrice ? parseFloat(serviceForm.sellingPrice) : null,
        }),
      });

      if (response.ok) {
        setSuccess(editingId ? 'Servicio actualizado' : 'Servicio creado');
        resetForm();
        fetchServices();
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Error al guardar');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const handleBatterySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const url = editingId ? `/api/batteries/${editingId}` : '/api/batteries';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...batteryForm,
          sellingPriceTotal: batteryForm.sellingPriceTotal ? parseFloat(batteryForm.sellingPriceTotal) : null,
        }),
      });

      if (response.ok) {
        setSuccess(editingId ? 'Batería actualizada' : 'Batería creada');
        resetForm();
        fetchBatteries();
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Error al guardar');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const handleDelete = async (id: string, type: 'service' | 'battery') => {
    if (!confirm(`¿Está seguro de eliminar este ${type === 'service' ? 'servicio' : 'batería'}?`)) return;

    try {
      const url = type === 'service' ? `/api/services/${id}` : `/api/batteries/${id}`;
      const response = await fetch(url, { method: 'DELETE' });
      if (response.ok) {
        setSuccess(`${type === 'service' ? 'Servicio' : 'Batería'} eliminado`);
        type === 'service' ? fetchServices() : fetchBatteries();
      }
    } catch (err) {
      setError('Error al eliminar');
    }
  };

  const handleEditService = (service: Service) => {
    setEditingId(service.id);
    setServiceForm({
      name: service.name,
      code: service.code,
      description: service.description || '',
      category: service.category || 'OTROS',
      estimatedMinutes: service.estimatedMinutes?.toString() || '30',
      costAmount: service.costAmount?.toString() || '',
      sellingPrice: service.sellingPrice?.toString() || '',
      requiresEquipment: service.requiresEquipment || false,
      equipmentName: service.equipmentName || '',
    });
    setShowForm(true);
  };

  const handleEditBattery = (battery: Battery) => {
    setEditingId(battery.id);
    setBatteryForm({
      name: battery.name,
      description: battery.description || '',
      sellingPriceTotal: battery.sellingPriceTotal?.toString() || '',
      serviceIds: battery.services.map(s => s.service.id),
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setServiceForm({ name: '', code: '', description: '', category: 'OTROS', estimatedMinutes: '30', costAmount: '', sellingPrice: '', requiresEquipment: false, equipmentName: '' });
    setBatteryForm({ name: '', description: '', sellingPriceTotal: '', serviceIds: [] });
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-800',
      INACTIVE: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Gestión de Servicios</h1>
            <p className="text-slate-600">Administra servicios médicos y baterías de exámenes</p>
          </div>
          <Button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3"
          >
            ➕ {activeTab === 'services' ? 'Nuevo Servicio' : 'Nueva Batería'}
          </Button>
        </div>

        {/* Messages */}
        {error && <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">{error}</div>}
        {success && <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded">{success}</div>}

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => { setActiveTab('services'); resetForm(); }}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'services' ? 'border-cyan-500 text-cyan-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              🏥 Servicios Médicos
            </button>
            <button
              onClick={() => { setActiveTab('batteries'); resetForm(); }}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'batteries' ? 'border-cyan-500 text-cyan-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              📦 Baterías (Paquetes)
            </button>
          </nav>
        </div>

        {/* Service Form */}
        {showForm && activeTab === 'services' && (
          <div className="mb-8 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">{editingId ? 'Editar' : 'Nuevo'} Servicio</h2>
            <form onSubmit={handleServiceSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input type="text" required value={serviceForm.name} onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Código *</label>
                <input type="text" required value={serviceForm.code} onChange={(e) => setServiceForm({ ...serviceForm, code: e.target.value.toUpperCase() })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select value={serviceForm.category} onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  {SERVICE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duración (min)</label>
                <input type="number" value={serviceForm.estimatedMinutes} onChange={(e) => setServiceForm({ ...serviceForm, estimatedMinutes: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Costo</label>
                <input type="number" step="0.01" value={serviceForm.costAmount} onChange={(e) => setServiceForm({ ...serviceForm, costAmount: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio de Venta</label>
                <input type="number" step="0.01" value={serviceForm.sellingPrice} onChange={(e) => setServiceForm({ ...serviceForm, sellingPrice: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={serviceForm.requiresEquipment} onChange={(e) => setServiceForm({ ...serviceForm, requiresEquipment: e.target.checked })} className="h-4 w-4" />
                <label className="text-sm font-medium text-gray-700">Requiere Equipo</label>
              </div>
              {serviceForm.requiresEquipment && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Equipo</label>
                  <input type="text" value={serviceForm.equipmentName} onChange={(e) => setServiceForm({ ...serviceForm, equipmentName: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
              )}
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea value={serviceForm.description} onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <div className="md:col-span-2 lg:col-span-3 flex gap-4">
                <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2">Guardar</Button>
                <Button type="button" onClick={resetForm} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2">Cancelar</Button>
              </div>
            </form>
          </div>
        )}

        {/* Battery Form */}
        {showForm && activeTab === 'batteries' && (
          <div className="mb-8 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">{editingId ? 'Editar' : 'Nueva'} Batería</h2>
            <form onSubmit={handleBatterySubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input type="text" required value={batteryForm.name} onChange={(e) => setBatteryForm({ ...batteryForm, name: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio de Venta Total</label>
                <input type="number" step="0.01" value={batteryForm.sellingPriceTotal} onChange={(e) => setBatteryForm({ ...batteryForm, sellingPriceTotal: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <input type="text" value={batteryForm.description} onChange={(e) => setBatteryForm({ ...batteryForm, description: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Servicios Incluidos</label>
                <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto">
                  {services.length === 0 ? (
                    <p className="text-gray-500 text-sm">No hay servicios disponibles. Crea servicios primero.</p>
                  ) : (
                    services.map(s => (
                      <label key={s.id} className="flex items-center gap-2 py-1">
                        <input
                          type="checkbox"
                          checked={batteryForm.serviceIds.includes(s.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setBatteryForm({ ...batteryForm, serviceIds: [...batteryForm.serviceIds, s.id] });
                            } else {
                              setBatteryForm({ ...batteryForm, serviceIds: batteryForm.serviceIds.filter(id => id !== s.id) });
                            }
                          }}
                          className="h-4 w-4"
                        />
                        <span className="text-sm">{s.name} ({s.code})</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
              <div className="md:col-span-2 flex gap-4">
                <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2">Guardar</Button>
                <Button type="button" onClick={resetForm} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2">Cancelar</Button>
              </div>
            </form>
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <input type="text" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full md:w-96 border border-gray-300 rounded-lg px-4 py-2" />
        </div>

        {/* Services Table */}
        {activeTab === 'services' && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Cargando servicios...</div>
            ) : services.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="text-xl mb-2">No hay servicios registrados</p>
                <p className="text-sm">Haz clic en "Nuevo Servicio" para agregar uno.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-800 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Servicio</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Código</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Categoría</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Precio</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Duración</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Estado</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {services.map((service) => (
                    <tr key={service.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{service.name}</div>
                        {service.description && <div className="text-sm text-gray-500 truncate max-w-xs">{service.description}</div>}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-600">{service.code}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{service.category?.replace('_', ' ') || '-'}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900">${service.sellingPrice?.toFixed(2) || '-'}</td>
                      <td className="px-4 py-3 text-sm text-center text-gray-600">{service.estimatedMinutes} min</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(service.status)}`}>
                          {service.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => handleEditService(service)} className="text-cyan-600 hover:text-cyan-800 mr-2">✏️</button>
                        <button onClick={() => handleDelete(service.id, 'service')} className="text-red-600 hover:text-red-800">🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Batteries Table */}
        {activeTab === 'batteries' && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Cargando baterías...</div>
            ) : batteries.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="text-xl mb-2">No hay baterías registradas</p>
                <p className="text-sm">Haz clic en "Nueva Batería" para agregar una.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-800 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Batería</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Servicios</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Empresas</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Precio Venta</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Estado</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {batteries.map((battery) => (
                    <tr key={battery.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{battery.name}</div>
                        {battery.description && <div className="text-sm text-gray-500">{battery.description}</div>}
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-gray-900">{battery._count?.services || 0}</td>
                      <td className="px-4 py-3 text-sm text-center text-gray-900">{battery._count?.contractedBatteries || 0}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900">${battery.sellingPriceTotal?.toFixed(2) || '-'}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${battery.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {battery.status === 'ACTIVE' ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => handleEditBattery(battery)} className="text-cyan-600 hover:text-cyan-800 mr-2">✏️</button>
                        <button onClick={() => handleDelete(battery.id, 'battery')} className="text-red-600 hover:text-red-800">🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
