/**
 * ⚙️ IMPL REFERENCE: IMPL-20260123-02
 * 📄 SEE: context/SPEC-MVP-DEMO-APIS.md
 * 🤖 AUTHOR: SOFIA (Claude Opus 4.5)
 * 
 * AppointmentManager
 * Complete appointment management with:
 * - Clinic selection
 * - Real availability from clinic schedules
 * - Patient selection with company info
 * - Job profile for exam type determination
 * - Modal de detalles de cita
 * - Flujo de estados completo
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
  documentId: string;
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
  displayId?: string;
  appointmentDate: string;
  time?: string;
  appointmentTime?: string;
  status: string;
  notes?: string;
  patient?: { id: string; name: string; documentId?: string };
  clinic?: { id: string; name: string };
  doctor?: { id: string; name: string };
  expedients?: Array<{ id: string; folio: string; status: string }>;
}

// Flujo de estados: SCHEDULED → CONFIRMED → CHECK_IN → IN_PROGRESS → COMPLETED
type AppointmentStatus = 'SCHEDULED' | 'CONFIRMED' | 'CHECK_IN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  SCHEDULED: 'Programada',
  CONFIRMED: 'Confirmada',
  CHECK_IN: 'Registrado',
  IN_PROGRESS: 'En Proceso',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
  NO_SHOW: 'No Presentó',
};

const NEXT_STATUS: Partial<Record<AppointmentStatus, { status: AppointmentStatus; label: string; color: string }>> = {
  SCHEDULED: { status: 'CONFIRMED', label: 'Confirmar', color: 'bg-green-600 hover:bg-green-700' },
  CONFIRMED: { status: 'CHECK_IN', label: 'Check-In', color: 'bg-blue-600 hover:bg-blue-700' },
  CHECK_IN: { status: 'IN_PROGRESS', label: 'Iniciar Examen', color: 'bg-purple-600 hover:bg-purple-700' },
  IN_PROGRESS: { status: 'COMPLETED', label: 'Completar', color: 'bg-emerald-600 hover:bg-emerald-700' },
};

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
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

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
        p.documentId?.includes(patientSearch)
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
        setShowModal(false);
        setSelectedAppointment(null);
        loadAppointments();
        loadAvailability();
      }
    } catch (err) {
      setError('Error al cancelar cita');
    }
  };

  // Change appointment status
  const handleStatusChange = async (id: string, newStatus: AppointmentStatus) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/citas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        const updated = await res.json();
        setSuccess(`Estado cambiado a ${STATUS_LABELS[newStatus]}`);
        setSelectedAppointment(updated);
        loadAppointments();

        // Si es CHECK_IN y se creó expediente, navegar automáticamente
        if (newStatus === 'CHECK_IN' && updated.createdExpedient) {
          setShowModal(false);
          setTimeout(() => {
            router.push(`/admin/expedientes/${updated.createdExpedient.id}`);
          }, 1000);
        }
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Error al cambiar estado');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar estado');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Mark as No Show
  const handleNoShow = async (id: string) => {
    if (!confirm('¿Marcar como "No se presentó"?')) return;
    await handleStatusChange(id, 'NO_SHOW');
    setShowModal(false);
    setSelectedAppointment(null);
  };

  // Open appointment details
  const openAppointmentDetails = async (apt: Appointment) => {
    try {
      // Fetch full appointment details including expedients
      const res = await fetch(`/api/citas/${apt.id}`);
      if (res.ok) {
        const fullData = await res.json();
        setSelectedAppointment(fullData);
      } else {
        setSelectedAppointment(apt);
      }
    } catch {
      setSelectedAppointment(apt);
    }
    setShowModal(true);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      SCHEDULED: 'bg-blue-100 text-blue-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      CHECK_IN: 'bg-indigo-100 text-indigo-800',
      IN_PROGRESS: 'bg-purple-100 text-purple-800',
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
                              {patient.documentId} • {patient.company?.name || 'Sin empresa'}
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
                  {appointments.map(apt => {
                    const nextAction = NEXT_STATUS[apt.status as AppointmentStatus];
                    return (
                      <div key={apt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <button
                          onClick={() => openAppointmentDetails(apt)}
                          className="flex items-center gap-4 text-left flex-1"
                        >
                          <div className="text-lg font-mono font-bold text-gray-700">
                            {apt.appointmentTime || apt.time}
                          </div>
                          <div>
                            <p className="font-medium">{apt.patient?.name || 'Paciente'}</p>
                            <p className="text-xs text-gray-500">{apt.clinic?.name || 'Sin clínica'}</p>
                          </div>
                        </button>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded ${getStatusColor(apt.status)}`}>
                            {STATUS_LABELS[apt.status as AppointmentStatus] || apt.status}
                          </span>
                          {/* Botón de siguiente estado */}
                          {nextAction && (
                            <button
                              onClick={() => handleStatusChange(apt.id, nextAction.status)}
                              disabled={updatingStatus}
                              className={`px-3 py-1 text-xs text-white rounded ${nextAction.color} disabled:opacity-50`}
                            >
                              {nextAction.label}
                            </button>
                          )}
                          {/* Botón cancelar solo para SCHEDULED */}
                          {apt.status === 'SCHEDULED' && (
                            <button
                              onClick={() => handleCancelAppointment(apt.id)}
                              className="text-red-600 hover:text-red-800 text-xs"
                            >
                              Cancelar
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Detalles de Cita */}
      {showModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Detalles de Cita</h2>
                  <p className="text-sm text-cyan-600 font-mono">{selectedAppointment.displayId || `APT-${selectedAppointment.id.slice(-6).toUpperCase()}`}</p>
                </div>
                <button
                  onClick={() => { setShowModal(false); setSelectedAppointment(null); }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Status Badge */}
              <div className="mb-6">
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(selectedAppointment.status)}`}>
                  {STATUS_LABELS[selectedAppointment.status as AppointmentStatus] || selectedAppointment.status}
                </span>
              </div>

              {/* Info Grid */}
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Fecha</p>
                    <p className="font-medium">
                      {new Date(selectedAppointment.appointmentDate).toLocaleDateString('es-MX', {
                        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Hora</p>
                    <p className="font-medium text-lg">
                      {selectedAppointment.appointmentTime || selectedAppointment.time || '—'}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Paciente</p>
                  <p className="font-medium">{selectedAppointment.patient?.name || 'No asignado'}</p>
                  {selectedAppointment.patient?.documentId && (
                    <p className="text-xs text-gray-500 mt-1">Doc: {selectedAppointment.patient.documentId}</p>
                  )}
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Clínica</p>
                  <p className="font-medium">{selectedAppointment.clinic?.name || 'No asignada'}</p>
                </div>

                {selectedAppointment.notes && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Notas</p>
                    <p className="text-sm">{selectedAppointment.notes}</p>
                  </div>
                )}

                {/* Expedientes vinculados */}
                {selectedAppointment.expedients && selectedAppointment.expedients.length > 0 && (
                  <div className="bg-cyan-50 p-3 rounded-lg">
                    <p className="text-xs text-cyan-600 mb-2">Expedientes Vinculados</p>
                    <div className="space-y-1">
                      {selectedAppointment.expedients.map(exp => (
                        <button
                          key={exp.id}
                          onClick={() => router.push(`/admin/expedientes/${exp.id}`)}
                          className="w-full text-left flex justify-between items-center p-2 bg-white rounded hover:bg-cyan-100 transition-colors"
                        >
                          <span className="font-mono text-sm">{exp.folio}</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            exp.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {exp.status}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="border-t pt-4 space-y-3">
                {/* Botón de siguiente estado */}
                {NEXT_STATUS[selectedAppointment.status as AppointmentStatus] && (
                  <button
                    onClick={() => handleStatusChange(selectedAppointment.id, NEXT_STATUS[selectedAppointment.status as AppointmentStatus]!.status)}
                    disabled={updatingStatus}
                    className={`w-full py-3 text-white rounded-lg font-medium ${NEXT_STATUS[selectedAppointment.status as AppointmentStatus]!.color} disabled:opacity-50`}
                  >
                    {updatingStatus ? 'Actualizando...' : NEXT_STATUS[selectedAppointment.status as AppointmentStatus]!.label}
                  </button>
                )}

                {/* Crear Expediente (CHECK_IN o IN_PROGRESS) */}
                {(selectedAppointment.status === 'CHECK_IN' || selectedAppointment.status === 'IN_PROGRESS') && (
                  <button
                    onClick={() => router.push(`/admin/expedientes/new?appointmentId=${selectedAppointment.id}&patientId=${selectedAppointment.patient?.id}`)}
                    className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium"
                  >
                    Crear Expediente
                  </button>
                )}

                {/* Botones secundarios */}
                <div className="flex gap-2">
                  {!['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(selectedAppointment.status) && (
                    <>
                      <button
                        onClick={() => handleNoShow(selectedAppointment.id)}
                        disabled={updatingStatus}
                        className="flex-1 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-lg text-sm font-medium disabled:opacity-50"
                      >
                        No se Presentó
                      </button>
                      <button
                        onClick={() => handleCancelAppointment(selectedAppointment.id)}
                        disabled={updatingStatus}
                        className="flex-1 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-sm font-medium disabled:opacity-50"
                      >
                        Cancelar Cita
                      </button>
                    </>
                  )}
                </div>

                <button
                  onClick={() => { setShowModal(false); setSelectedAppointment(null); }}
                  className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
