/**
 * useAuthContext hook
 * Alias para useAuth del AuthContext
 */

import { useAuth, type AuthContextType } from './auth-context';

export function useAuthContext(): AuthContextType {
  return useAuth();
}

export type { AuthContextType };
