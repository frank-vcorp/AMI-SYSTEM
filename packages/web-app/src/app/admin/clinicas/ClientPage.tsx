'use client';

import React, { useState } from 'react';
import { ClinicsTable, DoctorModal } from '@ami/mod-clinicas';
import { Button } from '@ami/core-ui';

interface ClinicsClientPageProps {
  clinics: any[];
  total: number;
  page: number;
  pageSize: number;
}

export function ClinicsClientPage({
  clinics,
  total,
  page,
  pageSize,
}: ClinicsClientPageProps) {
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState<any>(null);

  const handleAddDoctor = (clinic?: any) => {
    setSelectedClinic(clinic);
    setShowDoctorModal(true);
  };

  const handleSaveDoctor = async (doctorData: any) => {
    console.log('Doctor saved:', doctorData);
    setShowDoctorModal(false);
    // Aquí iría la llamada a la API
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Gestión de Clínicas</h1>
            <p className="text-slate-600">
              Administra clínicas, horarios, capacidad de camas y servicios disponibles
            </p>
          </div>
          <Button
            onClick={() => handleAddDoctor()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            👨‍⚕️ Agregar Médico
          </Button>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <ClinicsTable 
            clinics={clinics}
            total={total}
            page={page}
            pageSize={pageSize}
          />
        </div>

        {/* Doctor Modal */}
        {showDoctorModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Alta de Médico</h2>
                <button
                  onClick={() => setShowDoctorModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <div className="p-6">
                <DoctorModal
                  isOpen={true}
                  doctor={null}
                  clinics={[{ id: selectedClinic?.id || '1', name: selectedClinic?.name || 'Clínica Demo' }]}
                  onClose={() => setShowDoctorModal(false)}
                  onSave={handleSaveDoctor}
                />
              </div>
            </div>
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
          <p className="text-sm">
            <strong>Nota:</strong> Esta vista está conectada a MOD-CLINICAS. Los datos se sincronizarán automáticamente
            cuando PostgreSQL esté configurado.
          </p>
        </div>
      </div>
    </div>
  );
}
