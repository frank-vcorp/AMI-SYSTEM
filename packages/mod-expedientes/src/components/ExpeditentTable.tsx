"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ExpedientDTO } from "@ami/mod-expedientes";

interface ExpeditentTableProps {
  expedients: ExpedientDTO[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onViewDetails?: (id: string) => void;
}

/**
 * ExpeditentTable Component
 * Displays list of medical records with filtering and actions
 */
export function ExpeditentTable({
  expedients,
  onEdit,
  onDelete,
  onViewDetails,
}: ExpeditentTableProps) {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const filtered = selectedStatus
    ? expedients.filter((e) => e.status === selectedStatus)
    : expedients;

  const statusColors: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-800",
    IN_PROGRESS: "bg-blue-100 text-blue-800",
    COMPLETED: "bg-green-100 text-green-800",
    SIGNED: "bg-purple-100 text-purple-800",
    DELIVERED: "bg-emerald-100 text-emerald-800",
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => setSelectedStatus(null)}
          className={`px-3 py-1 rounded text-sm font-medium ${
            selectedStatus === null
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Todos
        </button>
        {["DRAFT", "IN_PROGRESS", "COMPLETED", "SIGNED", "DELIVERED"].map(
          (status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1 rounded text-sm font-medium ${
                selectedStatus === status
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {status}
            </button>
          )
        )}
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Paciente</TableHead>
              <TableHead>Clínica</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Exámenes</TableHead>
              <TableHead>Estudios</TableHead>
              <TableHead>Fecha Creación</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500">
                  No hay expedientes
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((expedient) => (
                <TableRow key={expedient.id}>
                  <TableCell className="font-medium">
                    {expedient.patient?.name || "N/A"}
                  </TableCell>
                  <TableCell>{expedient.clinicId}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        statusColors[expedient.status]
                      }`}
                    >
                      {expedient.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {expedient.medicalExams?.length || 0}
                  </TableCell>
                  <TableCell>
                    {expedient.studies?.length || 0}
                  </TableCell>
                  <TableCell>
                    {formatDate(expedient.createdAt)}
                  </TableCell>
                  <TableCell className="space-x-2">
                    {onViewDetails && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewDetails(expedient.id)}
                      >
                        Ver
                      </Button>
                    )}
                    {onEdit && expedient.status === "DRAFT" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(expedient.id)}
                      >
                        Editar
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onDelete(expedient.id)}
                      >
                        Eliminar
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
