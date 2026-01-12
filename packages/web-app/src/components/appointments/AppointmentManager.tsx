'use client';

import { useState, useEffect } from 'react';
import { AppointmentForm, AppointmentTable, CalendarView, AppointmentResponse } from '@ami/mod-citas';

/**
 * AppointmentManager
 * Orchestrates the appointment management interface
 * Combines CalendarView, AppointmentForm, and AppointmentTable
 */
export function AppointmentManager() {
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tenantId] = useState('default-tenant'); // In production: Get from auth context

  // Fetch appointments
  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        tenantId,
        pageSize: '100',
      });

      if (selectedDate) {
        params.append('date', selectedDate);
      }

      const response = await fetch(`/api/citas?${params}`, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        setAppointments(data.appointments || data.data || []);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);

  const handleAppointmentCreated = (appointment: AppointmentResponse) => {
    setAppointments((prev) => [appointment, ...prev]);
    setShowForm(false);
  };

  const handleCancelAppointment = async (id: string) => {
    try {
      const response = await fetch(`/api/citas/${id}?tenantId=${tenantId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setAppointments((prev) => prev.filter((apt) => apt.id !== id));
      } else {
        throw new Error('Failed to cancel appointment');
      }
    } catch (error) {
      throw error;
    }
  };

  const filteredAppointments = selectedDate
    ? appointments.filter((apt) => apt.appointmentDate === selectedDate)
    : appointments;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: Calendar */}
      <div className="lg:col-span-1">
        <CalendarView
          appointments={appointments}
          onDateSelect={setSelectedDate}
          onAppointmentClick={(apt) => {
            setSelectedDate(apt.appointmentDate);
            setShowForm(true);
          }}
        />
      </div>

      {/* Right Column: Form & Table */}
      <div className="lg:col-span-2 space-y-6">
        {/* Form Section */}
        {showForm ? (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {selectedDate ? `Nueva Cita - ${selectedDate}` : 'Nueva Cita'}
            </h2>
            <AppointmentForm
              tenantId={tenantId}
              onSuccess={handleAppointmentCreated}
              onCancel={() => setShowForm(false)}
              initialData={selectedDate ? { appointmentDate: selectedDate } : undefined}
            />
          </div>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="w-full px-6 py-4 bg-cyan-500 text-white font-bold rounded-lg hover:bg-cyan-600 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Agendar Nueva Cita
          </button>
        )}

        {/* Appointments List Section */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {selectedDate ? `Citas del ${selectedDate}` : 'Todas las Citas'}
          </h2>
          <AppointmentTable
            appointments={filteredAppointments}
            onCancel={handleCancelAppointment}
            isLoading={loading}
          />
        </div>
      </div>
    </div>
  );
}
