/**
 * /admin/expedientes/[id]
 * View and manage expedient details (server component)
 */

import React from "react";
import Link from "next/link";
import { ExpedientDetail, MedicalExamFullForm, StudyUploadZone } from "@ami/mod-expedientes";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getExpedient(id: string) {
  try {
    // Use VERCEL_URL for server-side fetch in production, fallback to localhost for dev
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    
    const response = await fetch(`${baseUrl}/api/expedientes/${id}`, {
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(`[getExpedient] API error: ${response.status} for ID: ${id}`);
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error("[getExpedient] Error fetching expedient:", error);
    return null;
  }
}

export default async function ExpedientDetailPage({ params }: PageProps) {
  const { id } = await params;
  const expedient = await getExpedient(id);

  if (!expedient) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-red-300 bg-red-50 p-4">
          <h3 className="text-sm font-semibold text-red-900">Error</h3>
          <p className="mt-1 text-sm text-red-700">Could not load expedient details.</p>
          <Link
            href="/admin/expedientes"
            className="mt-4 inline-flex justify-center rounded-md border border-transparent bg-red-600 py-2 px-4 text-sm font-medium text-white hover:bg-red-700"
          >
            Back to List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Medical Record Details</h1>
          <p className="mt-1 text-gray-600">{expedient.folio}</p>
        </div>
        <Link
          href="/admin/expedientes"
          className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Back to List
        </Link>
      </div>

      {/* Detail View */}
      <div className="rounded-lg border border-gray-300 bg-white p-6">
        <ExpedientDetail
          expedient={expedient}
          onStatusChange={async (newStatus) => {
            try {
              const response = await fetch(`/api/expedientes/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
              });

              if (!response.ok) throw new Error("Failed to update status");
              // Reload page to see changes
              window.location.reload();
            } catch (error) {
              console.error("Error updating status:", error);
              alert("Error updating status");
            }
          }}
        />
      </div>

      {/* Medical Exams Section */}
      <div className="rounded-lg border border-gray-300 bg-white p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Examen Médico Completo</h2>
        <MedicalExamFullForm
          onSubmit={async (data) => {
            console.log('Exam data:', data);
            alert('✅ Examen guardado correctamente');
          }}
        />
      </div>

      {/* Study Upload Section */}
      <div className="rounded-lg border border-gray-300 bg-white p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Medical Study</h2>
        <StudyUploadZone
          expedientId={id}
          onSuccess={() => {
            // Reload page to show new study
            window.location.reload();
          }}
          onError={(error) => {
            console.error("Error uploading study:", error);
            alert(`Error: ${error.message}`);
          }}
        />
      </div>
    </div>
  );
}
