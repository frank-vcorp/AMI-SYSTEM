'use client';

import { useState } from 'react';
import { AppointmentResponse, AppointmentStatus } from '../types/appointment';

interface CalendarViewProps {
  appointments: AppointmentResponse[];
  onDateSelect?: (date: string) => void;
  onAppointmentClick?: (appointment: AppointmentResponse) => void;
}

export function CalendarView({
  appointments,
  onDateSelect,
  onAppointmentClick,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = [];

  // Add empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Add days of month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const getAppointmentsForDate = (day: number | null) => {
    if (!day) return [];

    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return appointments.filter((apt) => apt.appointmentDate === dateStr);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getStatusColor = (status: AppointmentStatus) => {
    const colors: Record<AppointmentStatus, string> = {
      [AppointmentStatus.SCHEDULED]: 'bg-blue-500',
      [AppointmentStatus.CONFIRMED]: 'bg-green-500',
      [AppointmentStatus.CHECK_IN]: 'bg-yellow-500',
      [AppointmentStatus.IN_PROGRESS]: 'bg-purple-500',
      [AppointmentStatus.COMPLETED]: 'bg-gray-500',
      [AppointmentStatus.CANCELLED]: 'bg-red-500',
      [AppointmentStatus.NO_SHOW]: 'bg-orange-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {months[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handlePrevMonth}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            ← Anterior
          </button>
          <button
            onClick={handleToday}
            className="px-4 py-2 text-sm font-medium text-cyan-600 border border-cyan-300 rounded-lg hover:bg-cyan-50"
          >
            Hoy
          </button>
          <button
            onClick={handleNextMonth}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Siguiente →
          </button>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
          <div key={day} className="text-center font-semibold text-gray-600 text-sm">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, idx) => {
          const dayAppointments = getAppointmentsForDate(day);
          const isToday =
            day &&
            currentDate.getFullYear() === new Date().getFullYear() &&
            currentDate.getMonth() === new Date().getMonth() &&
            day === new Date().getDate();

          return (
            <div
              key={idx}
              onClick={() => {
                if (day) {
                  const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  onDateSelect?.(dateStr);
                }
              }}
              className={`min-h-24 p-2 rounded-lg border-2 transition-colors cursor-pointer ${
                !day
                  ? 'bg-gray-50 border-transparent'
                  : isToday
                  ? 'border-cyan-500 bg-cyan-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {day && (
                <>
                  <div className={`font-semibold text-sm mb-1 ${isToday ? 'text-cyan-600' : 'text-gray-700'}`}>
                    {day}
                  </div>
                  <div className="space-y-1">
                    {dayAppointments.slice(0, 2).map((apt) => (
                      <div
                        key={apt.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAppointmentClick?.(apt);
                        }}
                        className={`text-xs p-1 rounded text-white truncate ${getStatusColor(apt.status)} hover:opacity-90`}
                      >
                        {apt.appointmentTime}
                      </div>
                    ))}
                    {dayAppointments.length > 2 && (
                      <div className="text-xs text-gray-500 px-1">
                        +{dayAppointments.length - 2} más
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-500"></div>
          <span className="text-sm text-gray-600">Programada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-500"></div>
          <span className="text-sm text-gray-600">Confirmada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-purple-500"></div>
          <span className="text-sm text-gray-600">En Progreso</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-500"></div>
          <span className="text-sm text-gray-600">Cancelada</span>
        </div>
      </div>
    </div>
  );
}
