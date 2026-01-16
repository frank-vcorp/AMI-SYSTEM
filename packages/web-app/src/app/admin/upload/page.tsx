/**
 * /admin/upload
 * Server Component - Página de carga de archivos
 * Protegida por autenticación
 */

'use client';

import React, { useState, useEffect } from 'react';
import { FileUpload, UploadedFile } from '@/components/FileUpload';
import { useAuthContext } from '@/lib/use-auth-context';
import { useRouter } from 'next/navigation';

async function getRecentUploads(
  _tenantId: string,
  _token?: string
): Promise<UploadedFile[]> {
  try {
    // En futuro, conectar con API para obtener historial real
    // const response = await fetch(`/api/files?tenantId=${_tenantId}&limit=5`, {
    //   headers: _token ? { Authorization: `Bearer ${_token}` } : {},
    // });
    // return await response.json();
    return [];
  } catch (error) {
    console.error('Error fetching uploads:', error);
    return [];
  }
}

export default function UploadPage() {
  const { user, loading: authLoading } = useAuthContext();
  const router = useRouter();
  const [recentUploads, setRecentUploads] = useState<UploadedFile[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Verificar autenticación
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Cargar historial de archivos recientes
  useEffect(() => {
    if (user) {
      setLoadingHistory(true);
      getRecentUploads(user.uid || 'default-tenant', user.token ?? undefined).then(
        (uploads) => {
          setRecentUploads(uploads);
          setLoadingHistory(false);
        }
      );
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Carga de Archivos</h1>
          <p className="text-slate-600">
            Sube documentos PDF, imágenes JPG o PNG. Máximo 50MB por archivo.
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Upload Form Card */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Cargar Nuevos Archivos
            </h2>
            <FileUpload
              tenantId={user.uid || 'default-tenant'}
              maxFiles={5}
              maxSizeMB={50}
              onUploadComplete={(files) => {
                console.log('Files uploaded:', files);
                // Aquí podrías recargar el historial o actualizar un estado global
              }}
            />
          </div>

          {/* Recent Uploads Card */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Archivos Recientes
            </h2>

            {loadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : recentUploads.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p>No hay archivos cargados aún.</p>
                <p className="text-sm mt-2">
                  Carga tu primer archivo usando el formulario anterior.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentUploads.slice(0, 5).map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center flex-1 min-w-0">
                      <svg
                        className="w-5 h-5 text-gray-400 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
                        />
                        <path
                          fillRule="evenodd"
                          d="M3 4a2 2 0 00-2 2v4a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2H3zm0 2h10v4H3V6z"
                        />
                      </svg>
                      <div className="ml-4 flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{(file.size / 1024 / 1024).toFixed(2)}MB</span>
                          <span>
                            {new Date(file.uploadedAt).toLocaleDateString('es-ES')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-4 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                    >
                      Descargar
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-11-1a1 1 0 11-2 0 1 1 0 012 0zM8 8a1 1 0 000 2h6a1 1 0 100-2H8zm0 4a1 1 0 100 2h3a1 1 0 100-2H8z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-blue-900">
                  Información Importante
                </h3>
                <ul className="mt-3 text-sm text-blue-800 space-y-2">
                  <li>
                    ✓ Los archivos se almacenan en Google Cloud Storage con
                    encriptación
                  </li>
                  <li>
                    ✓ Los enlaces de descarga caducan después de 7 días
                  </li>
                  <li>
                    ✓ Soportamos PDF, JPG y PNG
                  </li>
                  <li>
                    ✓ Tamaño máximo: 50MB por archivo
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
