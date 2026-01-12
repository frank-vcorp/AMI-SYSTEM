/**
 * /admin/citas page
 * Main appointment management interface
 */

import { AppointmentManager } from '../../../components/appointments';

export const metadata = {
  title: 'Citas | Admin',
  description: 'Gestionar citas médicas y disponibilidad',
};

export default function CitasPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Citas</h1>
        <p className="text-gray-600 mt-2">
          Programa, consulta y gestiona citas médicas de tus clínicas
        </p>
      </div>

      {/* Appointment Manager Component */}
      <AppointmentManager />
    </div>
  );
}
