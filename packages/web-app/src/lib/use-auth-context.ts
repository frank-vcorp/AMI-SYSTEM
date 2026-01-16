/**
 * useAuthContext hook
 * Alias para useAuth del AuthContext
 */

import { useAuth } from './auth-context';

export function useAuthContext() {
  return useAuth();
}
