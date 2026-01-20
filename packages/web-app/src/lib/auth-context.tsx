/**
 * AuthContext - Proveedor de estado de autenticación
 * Proporciona el usuario autenticado y funciones de login/logout
 */
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { getFirebaseAuth } from './firebase';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  token: string | null;
}

export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const auth = getFirebaseAuth();

  // Monitorear cambios en el estado de autenticación
  useEffect(() => {
    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const token = await firebaseUser.getIdToken();
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            token,
          });
          setError(null);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Error en onAuthStateChanged:', err);
        setError('Error al cargar usuario');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      console.log('🔐 Firebase login iniciado para:', email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      
      console.log('✅ Usuario autenticado:', userCredential.user.uid);
      
      // Guardar token en cookie para el middleware
      document.cookie = `authToken=${token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 días
      console.log('💾 Token guardado en cookie');
      
      setUser({
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        token,
      });
      console.log('💾 Usuario guardado en estado');
    } catch (err) {
      let errorMessage = 'Error al iniciar sesión';
      
      console.error('❌ Error en Firebase login:', err);
      
      if (err instanceof Error) {
        console.error('📋 Tipo de error:', err.name);
        console.error('💬 Mensaje:', err.message);
        
        if (err.message.includes('user-not-found')) {
          errorMessage = 'Usuario no encontrado';
        } else if (err.message.includes('wrong-password')) {
          errorMessage = 'Contraseña incorrecta';
        } else if (err.message.includes('invalid-email')) {
          errorMessage = 'Email inválido';
        } else if (err.message.includes('too-many-requests')) {
          errorMessage = 'Demasiados intentos. Intente más tarde';
        }
      }
      
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      // Limpiar cookie
      document.cookie = 'authToken=; path=/; max-age=0';
      console.log('🗑️ Cookie de autenticación limpiada');
      await signOut(auth);
      setUser(null);
      console.log('✅ Sesión cerrada');
    } catch (err) {
      const errorMessage = 'Error al cerrar sesión';
      setError(errorMessage);
      throw err;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
}
