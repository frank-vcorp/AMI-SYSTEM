'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@ami/core-ui';

interface Clinic {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phoneNumber?: string;
  email?: string;
  totalBeds: number;
  availableBeds: number;
  isHeadquarters: boolean;
  status: string;
}

interface Doctor {
  id: string;
  name: string;
  cedula: string;
  specialty: string;
}

interface Schedule {
  id?: string;
  dayOfWeek: number;
  dayName?: string;
  openingTime: string;
  closingTime: string;
  lunchStart?: string;
  lunchEnd?: string;
  isOpen: boolean;
  maxAppointmentsDay: number;
}

interface ClinicsClientPageProps {
  clinics: Clinic[];
  total: number;
  page: number;
  pageSize: number;
}

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440000';
const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const defaultSchedules: Schedule[] = DAYS.map((_, i) => ({
  dayOfWeek: i,
  openingTime: '08:00',
  closingTime: '18:00',
  lunchStart: '13:00',
  lunchEnd: '14:00',
  isOpen: i !== 0, // Closed on Sundays
  maxAppointmentsDay: 50,
}));

export function ClinicsClientPage({
  clinics: initialClinics,
  total: _initialTotal,
}: ClinicsClientPageProps) {
  const [clinics, setClinics] = useState<Clinic[]>(initialClinics);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'schedules' | 'doctors'>('info');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>(defaultSchedules);
  const [loading, setLoading] = useState(false);
  const [showClinicForm, setShowClinicForm] = useState(false);
  const [showDoctorForm, setShowDoctorForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '', address: '', city: '', state: '', zipCode: '',
    phoneNumber: '', email: '', totalBeds: '10', isHeadquarters: false,
  });
  const [doctorForm, setDoctorForm] = useState({
    name: '', cedula: '', specialty: '',
  });

  // Load clinic details (doctors & schedules)
  const loadClinicDetails = useCallback(async (clinic: Clinic) => {
    setLoading(true);
    try {
      // Load doctors
      const doctorsRes = await fetch(`/api/clinicas/${clinic.id}/doctors?tenantId=${TENANT_ID}`);
      if (doctorsRes.ok) {
        const data = await doctorsRes.json();
        setDoctors(data.doctors || []);
      }
      
      // Load schedules
      const schedulesRes = await fetch(`/api/clinicas/${clinic.id}/schedules?tenantId=${TENANT_ID}`);
      if (schedulesRes.ok) {
        const data = await schedulesRes.json();
        if (data.schedules?.length > 0) {
          // Merge with defaults for any missing days
          const merged = DAYS.map((_, i) => {
            const existing = data.schedules.find((s: Schedule) => s.dayOfWeek === i);
            return existing || defaultSchedules[i];
          });
          setSchedules(merged);
        } else {
          setSchedules(defaultSchedules);
        }
      }
    } catch (error) {
      console.error('Error loading clinic details:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedClinic) {
      loadClinicDetails(selectedClinic);
    }
  }, [selectedClinic, loadClinicDetails]);

  // Create clinic
  const handleCreateClinic = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/clinicas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: TENANT_ID,
          ...formData,
          totalBeds: parseInt(formData.totalBeds),
          availableBeds: parseInt(formData.totalBeds),
        }),
      });
      if (res.ok) {
        const newClinic = await res.json();
        setClinics([newClinic, ...clinics]);
        setShowClinicForm(false);
        setFormData({ name: '', address: '', city: '', state: '', zipCode: '', phoneNumber: '', email: '', totalBeds: '10', isHeadquarters: false });
      }
    } catch (error) {
      console.error('Error creating clinic:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save schedules
  const handleSaveSchedules = async () => {
    if (!selectedClinic) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/clinicas/${selectedClinic.id}/schedules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId: TENANT_ID, schedules }),
      });
      if (res.ok) {
        alert('Horarios guardados correctamente');
      }
    } catch (error) {
      console.error('Error saving schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create doctor
  const handleCreateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClinic) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/clinicas/${selectedClinic.id}/doctors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId: TENANT_ID, ...doctorForm }),
      });
      if (res.ok) {
        const newDoctor = await res.json();
        setDoctors([...doctors, newDoctor]);
        setShowDoctorForm(false);
        setDoctorForm({ name: '', cedula: '', specialty: '' });
      }
    } catch (error) {
      console.error('Error creating doctor:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSchedule = (dayIndex: number, field: keyof Schedule, value: any) => {
    setSchedules(prev => prev.map((s, i) => i === dayIndex ? { ...s, [field]: value } : s));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Gestión de Clínicas</h1>
            <p className="text-slate-600">Sucursales, horarios, capacidad y médicos</p>
          </div>
          <Button onClick={() => setShowClinicForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
            + Nueva Sucursal
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Clinics List */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow p-4">
            <h2 className="font-semibold text-lg mb-4">Sucursales ({clinics.length})</h2>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {clinics.map(clinic => (
                <div
                  key={clinic.id}
                  onClick={() => { setSelectedClinic(clinic); setActiveTab('info'); }}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    selectedClinic?.id === clinic.id
                      ? 'bg-blue-50 border-2 border-blue-500'
                      : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-slate-900">{clinic.name}</h3>
                      <p className="text-sm text-slate-500">{clinic.city}, {clinic.state}</p>
                    </div>
                    {clinic.isHeadquarters && (
                      <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">Matriz</span>
                    )}
                  </div>
                  <div className="mt-2 flex gap-4 text-xs text-slate-500">
                    <span>🏥 {clinic.totalBeds} camas</span>
                    <span>📞 {clinic.phoneNumber || 'Sin tel.'}</span>
                  </div>
                </div>
              ))}
              {clinics.length === 0 && (
                <p className="text-center text-gray-500 py-8">No hay sucursales registradas</p>
              )}
            </div>
          </div>

          {/* Clinic Details */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow">
            {selectedClinic ? (
              <>
                {/* Tabs */}
                <div className="border-b border-gray-200">
                  <nav className="flex">
                    {[
                      { id: 'info', label: '📋 Información', icon: '' },
                      { id: 'schedules', label: '🕐 Horarios', icon: '' },
                      { id: 'doctors', label: '👨‍⚕️ Médicos', icon: '' },
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                          activeTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>

                <div className="p-6">
                  {/* Info Tab */}
                  {activeTab === 'info' && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold">{selectedClinic.name}</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-gray-500">Dirección</label>
                          <p className="font-medium">{selectedClinic.address}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500">Ciudad</label>
                          <p className="font-medium">{selectedClinic.city}, {selectedClinic.state}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500">Teléfono</label>
                          <p className="font-medium">{selectedClinic.phoneNumber || '-'}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500">Email</label>
                          <p className="font-medium">{selectedClinic.email || '-'}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500">Capacidad (Camas)</label>
                          <p className="font-medium">{selectedClinic.totalBeds} total / {selectedClinic.availableBeds} disponibles</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500">Estado</label>
                          <span className={`px-2 py-1 text-xs rounded ${
                            selectedClinic.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>{selectedClinic.status}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Schedules Tab */}
                  {activeTab === 'schedules' && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Horarios de Atención</h3>
                        <Button onClick={handleSaveSchedules} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
                          {loading ? 'Guardando...' : '💾 Guardar Horarios'}
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {schedules.map((schedule, idx) => (
                          <div key={idx} className={`p-3 rounded-lg border ${schedule.isOpen ? 'bg-white' : 'bg-gray-100'}`}>
                            <div className="flex items-center gap-4">
                              <label className="flex items-center gap-2 w-32">
                                <input
                                  type="checkbox"
                                  checked={schedule.isOpen}
                                  onChange={(e) => updateSchedule(idx, 'isOpen', e.target.checked)}
                                  className="rounded"
                                />
                                <span className="font-medium">{DAYS[idx]}</span>
                              </label>
                              {schedule.isOpen && (
                                <>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="time"
                                      value={schedule.openingTime}
                                      onChange={(e) => updateSchedule(idx, 'openingTime', e.target.value)}
                                      className="border rounded px-2 py-1 text-sm"
                                    />
                                    <span>a</span>
                                    <input
                                      type="time"
                                      value={schedule.closingTime}
                                      onChange={(e) => updateSchedule(idx, 'closingTime', e.target.value)}
                                      className="border rounded px-2 py-1 text-sm"
                                    />
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span>Comida:</span>
                                    <input
                                      type="time"
                                      value={schedule.lunchStart || ''}
                                      onChange={(e) => updateSchedule(idx, 'lunchStart', e.target.value)}
                                      className="border rounded px-2 py-1 text-sm w-24"
                                    />
                                    <span>-</span>
                                    <input
                                      type="time"
                                      value={schedule.lunchEnd || ''}
                                      onChange={(e) => updateSchedule(idx, 'lunchEnd', e.target.value)}
                                      className="border rounded px-2 py-1 text-sm w-24"
                                    />
                                  </div>
                                  <div className="flex items-center gap-2 text-sm">
                                    <span>Max citas:</span>
                                    <input
                                      type="number"
                                      value={schedule.maxAppointmentsDay}
                                      onChange={(e) => updateSchedule(idx, 'maxAppointmentsDay', parseInt(e.target.value))}
                                      className="border rounded px-2 py-1 text-sm w-20"
                                      min="1"
                                    />
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Doctors Tab */}
                  {activeTab === 'doctors' && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Médicos Asignados ({doctors.length})</h3>
                        <Button onClick={() => setShowDoctorForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                          + Agregar Médico
                        </Button>
                      </div>
                      {doctors.length > 0 ? (
                        <div className="space-y-2">
                          {doctors.map(doctor => (
                            <div key={doctor.id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                              <div>
                                <p className="font-medium">{doctor.name}</p>
                                <p className="text-sm text-gray-500">Cédula: {doctor.cedula} | {doctor.specialty}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-gray-500 py-8">No hay médicos asignados a esta sucursal</p>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="p-12 text-center text-gray-500">
                <p className="text-lg">Selecciona una sucursal para ver detalles</p>
                <p className="text-sm mt-2">O crea una nueva usando el botón "Nueva Sucursal"</p>
              </div>
            )}
          </div>
        </div>

        {/* Create Clinic Modal */}
        {showClinicForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold">Nueva Sucursal</h2>
              </div>
              <form onSubmit={handleCreateClinic} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Dirección *</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Ciudad *</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Estado *</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">C.P.</label>
                    <input
                      type="text"
                      value={formData.zipCode}
                      onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Camas</label>
                    <input
                      type="number"
                      value={formData.totalBeds}
                      onChange={(e) => setFormData({ ...formData, totalBeds: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                      min="1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Teléfono</label>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isHeadquarters}
                    onChange={(e) => setFormData({ ...formData, isHeadquarters: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Es matriz principal</span>
                </label>
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" onClick={() => setShowClinicForm(false)} className="bg-gray-200 text-gray-800">
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading} className="bg-blue-600 text-white">
                    {loading ? 'Guardando...' : 'Crear Sucursal'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Doctor Modal */}
        {showDoctorForm && selectedClinic && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold">Agregar Médico a {selectedClinic.name}</h2>
              </div>
              <form onSubmit={handleCreateDoctor} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre completo *</label>
                  <input
                    type="text"
                    value={doctorForm.name}
                    onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Cédula profesional *</label>
                  <input
                    type="text"
                    value={doctorForm.cedula}
                    onChange={(e) => setDoctorForm({ ...doctorForm, cedula: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Especialidad *</label>
                  <select
                    value={doctorForm.specialty}
                    onChange={(e) => setDoctorForm({ ...doctorForm, specialty: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    required
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Medicina General">Medicina General</option>
                    <option value="Medicina del Trabajo">Medicina del Trabajo</option>
                    <option value="Cardiología">Cardiología</option>
                    <option value="Oftalmología">Oftalmología</option>
                    <option value="Audiología">Audiología</option>
                    <option value="Neumología">Neumología</option>
                    <option value="Radiología">Radiología</option>
                    <option value="Laboratorio Clínico">Laboratorio Clínico</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" onClick={() => setShowDoctorForm(false)} className="bg-gray-200 text-gray-800">
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading} className="bg-blue-600 text-white">
                    {loading ? 'Guardando...' : 'Agregar Médico'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
