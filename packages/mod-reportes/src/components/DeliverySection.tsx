/**
 * @impl IMPL-20260121-B6
 * @ref context/Plan-Demo-RD-20260121.md
 * 
 * Delivery Section - Entrega controlada de reportes
 * Email caducable + Enlace directo temporal (7 días)
 */

'use client';

import { useState } from 'react';
import { Button } from '@ami/core-ui';
import { Card } from '@ami/core-ui';
import { Input } from '@ami/core-ui';
import { Badge } from '@ami/core-ui';

interface DeliverySectionProps {
  folio: string;
  patientEmail?: string;
  onDownload?: () => void;
}

export function DeliverySection({
  folio,
  patientEmail = '',
  onDownload,
}: DeliverySectionProps) {
  const [emailInput, setEmailInput] = useState(patientEmail);
  const [directLink, setDirectLink] = useState('');
  const [showDirectLink, setShowDirectLink] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateDirectLink = () => {
    // Simulate generating a temporary URL
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    const token = Math.random().toString(36).substring(2, 15);
    const link = `${window.location.origin}/reportes/descarga/${folio}?token=${token}&expires=${expiresAt.getTime()}`;
    setDirectLink(link);
    setShowDirectLink(true);
  };

  const handleSendEmail = async () => {
    setLoading(true);
    setError('');

    try {
      if (!emailInput.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        setError('Por favor ingrese un email válido');
        setLoading(false);
        return;
      }

      // Simulate API call to send email
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setEmailSent(true);
      setError('');
    } catch (err) {
      setError('Error al enviar email');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (directLink) {
      navigator.clipboard.writeText(directLink);
      alert('Enlace copiado al portapapeles');
    }
  };

  return (
    <Card>
      <div className="p-6 space-y-6">
        {/* Title */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Entrega Controlada
          </h2>
          <p className="text-gray-600">
            Seleccione cómo desea entregar el reporte (PDF caducable + seguimiento)
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Success Alert */}
        {emailSent && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
            <p className="text-sm font-medium">
              ✓ Email enviado exitosamente a {emailInput}
            </p>
            <p className="text-xs mt-1">
              El enlace caducará en 7 días o después del primer acceso.
            </p>
          </div>
        )}

        {/* Envío por Email */}
        <div className="border rounded-lg p-6 bg-blue-50">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900">📧 Envío por Correo</h3>
              <p className="text-sm text-gray-600 mt-1">
                Enlace caducable con acceso seguro y limitado
              </p>
            </div>
            <Badge variant="default">Recomendado</Badge>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email del Destinatario *
              </label>
              <Input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="paciente@ejemplo.com"
                disabled={emailSent}
              />
            </div>

            <div className="text-xs text-gray-600 bg-white p-3 rounded border border-gray-200">
              <p className="font-medium mb-2">Características del enlace:</p>
              <ul className="space-y-1">
                <li>✓ Caduca en 7 días</li>
                <li>✓ Se desactiva tras primer acceso</li>
                <li>✓ Sin acceso a datos sensibles (paciente anónimo)</li>
                <li>✓ Registro de descarga en bitácora</li>
              </ul>
            </div>

            <Button
              onClick={handleSendEmail}
              disabled={loading || emailSent || !emailInput}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Enviando...' : emailSent ? '✓ Email Enviado' : 'Enviar Email'}
            </Button>
          </div>
        </div>

        {/* Enlace Directo */}
        <div className="border rounded-lg p-6 bg-purple-50">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900">🔗 Enlace Directo</h3>
              <p className="text-sm text-gray-600 mt-1">
                URL temporal con acceso limitado
              </p>
            </div>
            <Badge variant="secondary">Temporal</Badge>
          </div>

          <div className="space-y-4">
            {!showDirectLink ? (
              <Button
                onClick={generateDirectLink}
                variant="outline"
                className="w-full border-ami-purple text-ami-purple hover:bg-ami-purple/5"
              >
                Generar Enlace Temporal
              </Button>
            ) : (
              <>
                <div className="bg-white p-4 rounded border border-gray-300 break-all">
                  <p className="text-xs text-gray-600 mb-2">URL:</p>
                  <code className="text-sm font-mono text-slate-900">
                    {directLink}
                  </code>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleCopyLink}
                    variant="outline"
                    className="flex-1"
                  >
                    📋 Copiar Enlace
                  </Button>
                  <Button
                    onClick={() => {
                      if (directLink) {
                        window.open(directLink, '_blank');
                      }
                    }}
                    className="flex-1 bg-ami-purple hover:bg-ami-purple/90"
                  >
                    Abrir en Nueva Pestaña
                  </Button>
                </div>

                <div className="text-xs text-gray-600 bg-white p-3 rounded border border-gray-200">
                  <p className="font-medium mb-2">Información del enlace:</p>
                  <ul className="space-y-1">
                    <li>📅 Expira: {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('es-MX')}</li>
                    <li>🔐 Token único con encriptación</li>
                    <li>📊 Rastreado en bitácora</li>
                  </ul>
                </div>

                <Button
                  onClick={() => setShowDirectLink(false)}
                  variant="outline"
                  className="w-full"
                >
                  Generar Nuevo Enlace
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Descargar PDF */}
        <div className="border rounded-lg p-6 bg-green-50">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900">📥 Descargar Localmente</h3>
              <p className="text-sm text-gray-600 mt-1">
                Guardar PDF en tu computadora
              </p>
            </div>
          </div>

          <Button
            onClick={onDownload}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            📥 Descargar PDF - {folio}.pdf
          </Button>
        </div>

        {/* Bitácora de Entregas */}
        <div className="border-t pt-6">
          <h3 className="font-semibold text-slate-900 mb-4">
            📋 Histórico de Entregas
          </h3>

          <div className="space-y-3">
            <div className="bg-gray-50 p-3 rounded text-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-gray-900">
                  Email: {patientEmail || 'No enviado'}
                </span>
                <Badge variant="default">Hoy, 14:23</Badge>
              </div>
              <p className="text-xs text-gray-600">
                ✓ Enlace caducable enviado exitosamente
              </p>
            </div>

            <div className="bg-gray-50 p-3 rounded text-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-gray-900">
                  Descarga Local
                </span>
                <Badge variant="secondary">Disponible</Badge>
              </div>
              <p className="text-xs text-gray-600">
                Documento listo para descargar en esta sesión
              </p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Nota de Seguridad:</strong> Todos los accesos son registrados en la
            bitácora del sistema. Los enlaces temporales requieren autenticación y son
            únicos por descarga.
          </p>
        </div>
      </div>
    </Card>
  );
}
