/**
 * ⚙️ IMPL REFERENCE: IMPL-20260122-02
 * 📄 SEE: context/SPEC-MVP-DEMO-APIS.md
 * 🤖 AUTHOR: SOFIA (Claude Opus 4.5)
 * 
 * AppointmentManager
 * Complete appointment management with:
 * - Clinic selection
 * - Real availability from clinic schedules
 * - Patient selection with company info
 * - Job profile for exam type determination
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@ami/core-ui';

interface Clinic {
  id: string;
  name: string;
  address: string;
  city: string;
}

interface Patient {
  id: string;
  name: string;
  documentNumber: string;
  company?: { id: string; name: string };
}

interface JobProfile {
  id: string;
  name: string;
  companyId: string;
}

interface AvailabilitySlot {
  time: string;
  available: boolean;
}

interface Appointment {
  id: string;
  appointmentDate: string;
  time?: string;
  appointmentTime?: string;
  status: string;
  patient?: { id: string; name: string };
  clinic?: { id: string; name: string };
  doctor?: { id: string; name: string };
}

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440000';
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export function AppointmentManager() {
  const router = useRouter();
  
  // Data states
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [jobProfiles, setJobProfiles] = useState<JobProfile[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  
  // Selection states
  const [selectedClinic, setSelectedClinic] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [selectedJobProfile, setSelectedJobProfile] = useState<string>('');
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [clinicsRes, patientsRes, jobProfilesRes] = await Promise.all([
          fetch(`/api/clinicas?tenantId=${TENANT_ID}&pageSize=50`),
          fetch(`/api/patients?tenantId=${TENANT_ID}&pageSize=100`),
          fetch(`/api/job-profiles?tenantId=${TENANT_ID}&pageSize=100`),
        ]);
        
        if (clinicsRes.ok) {
          const data = await clinicsRes.json();
          setClinics(data.data || []);
          // Auto-select first clinic
          if (data.data?.length > 0 && !selectedClinic) {
            setSelectedClinic(data.data[0].id);
          }
        }
        if (patientsRes.ok) {
          const data = await patientsRes.json();
          setPatients(data.data || []);
        }
        if (jobProfilesRes.ok) {
          const data = await jobProfilesRes.json();
          setJobProfiles(data.data || []);
        }
      } catch (err) {
        console.error('Error loading data:', err);
      }
    };
    loadData();
  }, []);

  // Load availability when clinic or date changes
  const loadAvailability = useCallback(async () => {
    if (!selectedClinic) return;
    
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const res = await fetch(`/api/clinicas/${selectedClinic}/availability?tenantId=${TENANT_ID}&date=${dateStr}`);
      if (res.ok) {
        const data = await res.json();
        setAvailability(data.slots || []);
      }
    } catch (err) {
      console.error('Error loading availability:', err);
      setAvailability([]);
    }
  }, [selectedClinic, selectedDate]);

  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

  // Load appointments for selected date
  const loadAppointments = useCallback(async () => {
    if (!selectedClinic) return;
    
    try {
      setLoading(true);
      const dateStr = selectedDate.toISOString().split('T')[0];
      const res = await fetch(`/api/citas?tenantId=${TENANT_ID}&clinicId=${selectedClinic}&date=${dateStr}&pageSize=50`);
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.data || []);
      }
    } catch (err) {
      console.error('Error loading appointments:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedClinic, selectedDate]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  // Filter job profiles based on patient's company
  const filteredJobProfiles = selectedPatient
    ? jobProfiles.filter(jp => {
        const patient = patients.find(p => p.id === selectedPatient);
        return patient?.company?.id === jp.companyId;
      })
    : [];

  // Filter patients by search
  const filteredPatients = patientSearch
    ? patients.filter(p => 
        p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
        p.documentNumber?.includes(patientSearch)
      )
    : patients;

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    // Add empty slots for days before first of month
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    
    // Add all days of month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Create appointment
  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClinic || !selectedPatient || !selectedSlot) {
      setError('Complete todos los campos requeridos');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/citas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: TENANT_ID,
          clinicId: selectedClinic,
          patientId: selectedPatient,
          jobProfileId: selectedJobProfile || null,
          appointmentDate: selectedDate.toISOString().split('T')[0],
          time: selectedSlot,
          appointmentType: 'SCHEDULED',
          notes: '',
        }),
      });

      if (res.ok) {
        setSuccess('Cita creada exitosamente');
        setShowForm(false);
        setSelectedSlot('');
        setSelectedPatient('');
        setSelectedJobProfile('');
        loadAppointments();
        loadAvailability();
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Error al crear cita');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Cancel appointment
  const handleCancelAppointment = async (id: string) => {
    if (!confirm('¿Cancelar esta cita?')) return;

    try {
      const res = await fetch(`/api/citas/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId: TENANT_ID }),
      });

      if (res.ok) {
        setSuccess('Cita cancelada');
        loadAppointments();
        loadAvailability();
      }
    } catch (err) {
      setError('Error al cancelar cita');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      SCHEDULED: 'bg-blue-100 text-blue-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      COMPLETED: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-red-100 text-red-800',
      NO_SHOW: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Gestión de Citas</h1>
          <p className="text-slate-600">Programa citas según disponibilidad de sucursales</p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
            {error}
            <button onClick={() => setError(null)} className="ml-4 text-red-900 font-bold">×</button>
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 text-green-700 rounded">
            {success}
            <button onClick={() => setSuccess(null)} className="ml-4 text-green-900 font-bold">×</button>
          </div>
        )}

        {/* Clinic Selector */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar Sucursal</label>
          <select
            value={selectedClinic}
            onChange={(e) => setSelectedClinic(e.target.value)}
            className="w-full md:w-80 border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">Seleccionar clínica...</option>
            {clinics.map(clinic => (
              <option key={clinic.id} value={clinic.id}>
                {clinic.name} - {clinic.city}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                className="p-2 hover:bg-gray-100 rounded"
              >
                ←
              </button>
              <h2 className="text-lg font-semibold">
                {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h2>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                className="p-2 hover:bg-gray-100 rounded"
              >
                →
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {WEEKDAYS.map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth(currentMonth).map((day, idx) => (
                <div key={idx}>
                  {day ? (
                    <button
                      onClick={() => !isPast(day) && setSelectedDate(day)}
                      disabled={isPast(day)}
                      className={`w-full aspect-square flex items-center justify-center text-sm rounded-lg transition-colors ${
                        isSelected(day)
                          ? 'bg-cyan-600 text-white'
                          : isToday(day)
                          ? 'bg-cyan-100 text-cyan-800'
                          : isPast(day)
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {day.getDate()}
                    </button>
                  ) : (
                    <div className="w-full aspect-square" />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t text-center">
              <p className="text-sm text-gray-600">
                Fecha seleccionada: <strong>{selectedDate.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}</strong>
              </p>
            </div>
          </div>

          {/* Availability & Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Availability Slots */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">Horarios Disponibles</h3>
                {selectedClinic && (
                  <Button onClick={() => setShowForm(true)} className="bg-cyan-600 text-white">
                    + Nueva Cita
                  </Button>
                )}
              </div>

              {!selectedClinic ? (
                <p className="text-center text-gray-500 py-8">Seleccione una sucursal para ver disponibilidad</p>
              ) : availability.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No hay horarios disponibles para esta fecha</p>
              ) : (
                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                  {availability.map(slot => (
                    <button
                      key={slot.time}
                      onClick={() => slot.available && setSelectedSlot(slot.time)}
                      disabled={!slot.available}
                      className={`py-2 px-3 text-sm rounded border transition-colors ${
                        selectedSlot === slot.time
                          ? 'bg-cyan-600 text-white border-cyan-600'
                          : slot.available
                          ? 'bg-white hover:bg-cyan-50 border-gray-300'
                          : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Appointment Form */}
            {showForm && (
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="font-semibold text-lg mb-4">Nueva Cita</h3>
                <form onSubmit={handleCreateAppointment} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Fecha y Hora</label>
                      <div className="p-3 bg-gray-50 rounded text-sm">
                        {selectedDate.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
                        {selectedSlot && ` a las ${selectedSlot}`}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Sucursal</label>
                      <div className="p-3 bg-gray-50 rounded text-sm">
                        {clinics.find(c => c.id === selectedClinic)?.name || 'No seleccionada'}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Buscar Paciente *</label>
                    <input
                      type="text"
                      value={patientSearch}
                      onChange={(e) => setPatientSearch(e.target.value)}
                      className="w-full border rounded px-3 py-2 mb-2"
                      placeholder="Nombre o documento..."
                    />
                    {patientSearch && filteredPatients.length > 0 && (
                      <div className="border rounded max-h-40 overflow-y-auto">
                        {filteredPatients.slice(0, 10).map(patient => (
                          <button
                            key={patient.id}
                            type="button"
                            onClick={() => {
                              setSelectedPatient(patient.id);
                              setPatientSearch(patient.name);
                              setSelectedJobProfile('');
                            }}
                            className={`w-full text-left px-3 py-2 hover:bg-gray-50 ${
                              selectedPatient === patient.id ? 'bg-cyan-50' : ''
                            }`}
                          >
                            <div className="font-medium">{patient.name}</div>
                            <div className="text-xs text-gray-500">
                              {patient.documentNumber} • {patient.company?.name || 'Sin empresa'}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {selectedPatient && filteredJobProfiles.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Perfil de Puesto (determina exámenes)</label>
                      <select
                        value={selectedJobProfile}
                        onChange={(e) => setSelectedJobProfile(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                      >
                        <option value="">Sin perfil específico</option>
                        {filteredJobProfiles.map(profile => (
                          <option key={profile.id} value={profile.id}>{profile.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <Button 
                      type="submit" 
                      disabled={loading || !selectedSlot || !selectedPatient}
                      className="bg-cyan-600 text-white"
                    >
                      {loading ? 'Creando...' : 'Crear Cita'}
                    </Button>
                    <Button 
                      type="button" 
                      onClick={() => { setShowForm(false); setSelectedSlot(''); }}
                      className="bg-gray-200 text-gray-700"
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Appointments List */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold text-lg mb-4">
                Citas del {selectedDate.toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })}
                <span className="text-sm font-normal text-gray-500 ml-2">({appointments.length})</span>
              </h3>

              {loading ? (
                <p className="text-center text-gray-500 py-8">Cargando citas...</p>
              ) : appointments.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No hay citas programadas para esta fecha</p>
              ) : (
                <div className="space-y-2">
                  {appointments.map(apt => (
                    <div key={apt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="text-lg font-mono font-bold text-gray-700">
                          {apt.appointmentTime || apt.time}
                        </div>
                        <div>
                          <p className="font-medium">{apt.patient?.name || 'Paciente'}</p>
                          <p className="text-xs text-gray-500">{apt.doctor?.name || 'Sin médico asignado'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 text-xs rounded ${getStatusColor(apt.status)}`}>
                          {apt.status}
                        </span>
                        {apt.status === 'SCHEDULED' && (
                          <button
                            onClick={() => handleCancelAppointment(apt.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Cancelar
                          </button>
                        )}
                        {apt.status === 'CONFIRMED' && (
                          <button
                            onClick={() => router.push(`/admin/expedientes/new?appointmentId=${apt.id}&patientId=${apt.patient?.id}`)}
                            className="text-cyan-600 hover:text-cyan-800 text-sm"
                          >
                            Crear Expediente
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
