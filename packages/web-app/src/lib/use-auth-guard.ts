/**
 * Hook useAuthGuard - Redirige a login si no está autenticado
 * Útil para componentes que requieren autenticación obligatoria
 */
'use client';

import { useAuth } from './auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function useAuthGuard() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    setIsReady(true);
  }, [isAuthenticated, loading, router]);

  return { isReady, isAuthenticated, loading };
}
