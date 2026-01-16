/**
 * /admin/expedientes
 * List and manage medical records
 */

"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ExpeditentTable } from "@ami/mod-expedientes";
import { ExpedientDTO } from "@ami/mod-expedientes";

interface PageProps {
  params?: { tenantId?: string };
  searchParams?: { tenantId?: string };
}

export default function ExpeditentsPage(props: PageProps) {
  const [expedients, setExpedients] = useState<ExpedientDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // TODO: In production, fetch from API
    // For now, load mock data
    const loadExpedients = async () => {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        const mockData: ExpedientDTO[] = [
          {
            id: "exp_1",
            patientId: "patient_1",
            clinicId: "clinic_1",
            companyId: "company_1",
            status: "DRAFT",
            notes: "",
            patient: {
              id: "patient_1",
              name: "Juan Pérez",
              email: "juan@example.com",
              phone: "+55 11 99999-9999",
              birthDate: "1980-05-15",
              gender: "MASCULINO",
              documentId: "123456789",
              status: "ACTIVE",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            medicalExams: [],
            studies: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];

        setExpedients(mockData);
      } catch (err) {
        setError("Error loading expedients");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadExpedients();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de que desea eliminar este expediente?")) {
      return;
    }

    try {
      // TODO: In production, call DELETE /api/expedientes/{id}
      setExpedients((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      setError("Error deleting expedient");
      console.error(err);
    }
  };

  const handleViewDetails = (id: string) => {
    // Navigate to detail page
    window.location.href = `/admin/expedientes/${id}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expedientes Médicos</h1>
          <p className="text-gray-600 mt-1">
            Gestionar registros médicos de pacientes
          </p>
        </div>
        <Link href="/admin/expedientes/new">
          <Button>
            + Nuevo Expediente
          </Button>
        </Link>
      </div>

      {/* Content */}
      {error && (
        <div className="p-4 bg-red-100 text-red-800 rounded-lg">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="text-gray-500">Cargando expedientes...</div>
        </div>
      ) : (
        <ExpeditentTable
          expedients={expedients}
          onDelete={handleDelete}
          onViewDetails={handleViewDetails}
        />
      )}
    </div>
  );
}
