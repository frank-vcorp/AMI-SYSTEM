/**
 * Página de Login
 * Formulario de autenticación con Firebase
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { login, loading: authLoading, error: authError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Validaciones básicas
    if (!email || !password) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Por favor ingresa un email válido');
      return;
    }

    try {
      setLoading(true);
      console.log('🔐 Iniciando login para:', email);
      await login(email, password);
      console.log('✅ Login exitoso, redirigiendo...');
      // La redirección ocurre automáticamente después del login
      router.push('/admin/clinicas');
    } catch (err) {
      console.error('❌ Error en login:', err);
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('📋 Detalles del error:', errorMsg);
      // El error ya está en authError, pero por seguridad mostramos uno genérico
      setError(authError || 'Error al iniciar sesión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-cyan-50 to-purple-50 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent mb-2">
            AMI-SYSTEM
          </h1>
          <p className="text-slate-600">Atención Médica Integrada</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-xl p-8 border-t-4 border-cyan-500">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Iniciar Sesión</h2>

          {/* Error Message */}
          {(error || authError) && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm font-medium">
                {error || authError}
              </p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-900 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                disabled={loading || authLoading}
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-900 mb-2">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                disabled={loading || authLoading}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || authLoading}
              className="w-full py-2 px-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading || authLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Iniciando sesión...
                </span>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-slate-300"></div>
            <span className="px-3 text-sm text-slate-500">o</span>
            <div className="flex-1 border-t border-slate-300"></div>
          </div>

          {/* Back to Home */}
          <Link
            href="/"
            className="block text-center py-2 px-4 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
          >
            Volver al inicio
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-slate-600">
          <p>
            ¿Problemas al iniciar sesión?{' '}
            <a href="mailto:soporte@ami.com" className="text-cyan-600 hover:underline">
              Contacta soporte
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
