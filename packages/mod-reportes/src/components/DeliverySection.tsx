'use client';

import { useState } from 'react';

/**
 * Componente simplificado de DeliverySection
 * Métodos para entregar certificado: Email, Link temporal, Descargar
 */

interface DeliverySectionProps {
  folio: string;
  onEmailSend?: (email: string) => Promise<void>;
  onLinkGenerate?: () => Promise<{ url: string; token: string; expiresIn: string }>;
  onDownload?: () => void;
}

export function DeliverySection({
  folio,
  onEmailSend,
  onLinkGenerate,
  onDownload,
}: DeliverySectionProps) {
  const [email, setEmail] = useState('');
  const [generatedLink, setGeneratedLink] = useState<{ url: string; expiresIn: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSendEmail = async () => {
    if (!email) {
      alert('Por favor ingresa un email');
      return;
    }
    setLoading(true);
    try {
      // Obtener expedientId de la URL
      const urlParts = window.location.pathname.split('/');
      const expedientId = urlParts[urlParts.length - 1];

      // Conexión a API
      const res = await fetch('/api/deliveries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expedientId,
          method: 'EMAIL',
          email,
          tenantId: 'default-tenant',
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error al enviar email');
      }

      await onEmailSend?.(email);
      setEmail('');
      alert(`✅ Email enviado a ${email}`);
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLink = async () => {
    setLoading(true);
    try {
      // Obtener expedientId de la URL
      const urlParts = window.location.pathname.split('/');
      const expedientId = urlParts[urlParts.length - 1];

      // Conexión a API
      const res = await fetch('/api/deliveries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expedientId,
          method: 'TEMPORAL_LINK',
          expiresIn: 168, // 7 días
          tenantId: 'default-tenant',
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error al generar enlace');
      }

      const data = await res.json();
      setGeneratedLink({
        url: data.delivery.temporalLink,
        expiresIn: `${168} horas (7 días)`,
      });

      const result = await onLinkGenerate?.();
      if (result) {
        setGeneratedLink(result);
      }
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Método 1: Email */}
      <div className="border-l-4 border-blue-500 pl-6 py-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">📧 Método 1: Enviar por Email (Recomendado)</h3>
        <div className="flex gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo@empresa.com"
            className="border border-gray-300 rounded px-3 py-2 flex-1"
          />
          <button
            onClick={handleSendEmail}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded font-medium"
          >
            {loading ? 'Enviando...' : 'Enviar Email'}
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-2">✓ Válido por 7 días | ✓ Anónimo | ✓ Auditado</p>
      </div>

      {/* Método 2: Enlace Temporal */}
      <div className="border-l-4 border-green-500 pl-6 py-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">🔗 Método 2: Generar Enlace Temporal</h3>
        {!generatedLink ? (
          <button
            onClick={handleGenerateLink}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded font-medium"
          >
            {loading ? 'Generando...' : '✓ Generar Enlace'}
          </button>
        ) : (
          <div className="space-y-3">
            <div className="bg-gray-100 p-4 rounded border border-gray-300 font-mono text-sm break-all">
              {generatedLink.url}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedLink.url);
                  alert('Enlace copiado al portapapeles');
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm"
              >
                📋 Copiar Enlace
              </button>
              <button
                onClick={() => window.open(generatedLink.url, '_blank')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm"
              >
                🌐 Abrir en Nueva Pestaña
              </button>
            </div>
            <p className="text-sm text-gray-600">Expira en: {generatedLink.expiresIn}</p>
          </div>
        )}
      </div>

      {/* Método 3: Descargar */}
      <div className="border-l-4 border-purple-500 pl-6 py-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">📥 Método 3: Descargar PDF</h3>
        <button
          onClick={onDownload}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded font-medium"
        >
          📥 Descargar PDF - {folio}.pdf
        </button>
        <p className="text-sm text-gray-600 mt-2">Guarda una copia local en tu computadora</p>
      </div>
    </div>
  );
}
