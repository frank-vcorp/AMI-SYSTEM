/**
 * core-auth - Autenticación Firebase + roles + middleware
 * 
 * Proporciona:
 * - Autenticación con Firebase
 * - Manejo de Custom Claims (roles)
 * - Middleware para proteger rutas
 * - Funciones de autorización
 */

import * as admin from 'firebase-admin';
import { type UserRole } from '@ami/core-types';

export interface FirebaseAuthConfig {
  projectId: string;
  privateKey: string;
  clientEmail: string;
}

export interface AuthUser {
  uid: string;
  email: string;
  role: UserRole;
  tenantId: string;
}

// Referencia global a la instancia de Firebase Admin
let firebaseAdmin: admin.app.App | null = null;

/**
 * Inicializa Firebase Admin SDK
 */
export function initializeFirebaseAdmin(config: FirebaseAuthConfig) {
  try {
    if (firebaseAdmin) {
      console.log('Firebase Admin ya está inicializado');
      return;
    }

    firebaseAdmin = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: config.projectId,
        privateKey: config.privateKey,
        clientEmail: config.clientEmail,
      } as admin.ServiceAccount),
      projectId: config.projectId,
    });

    console.log('Firebase Admin SDK inicializado correctamente');
  } catch (error) {
    console.error('Error inicializando Firebase Admin:', error);
    throw error;
  }
}

/**
 * Verifica un token JWT y devuelve los claims del usuario
 */
export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    if (!firebaseAdmin) {
      throw new Error('Firebase Admin no está inicializado. Llama initializeFirebaseAdmin primero.');
    }

    const decodedToken = await admin.auth().verifyIdToken(token);

    const authUser: AuthUser = {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      role: (decodedToken.role as UserRole) || 'user',
      tenantId: decodedToken.tenantId || '',
    };

    return authUser;
  } catch (error) {
    console.error('Error verificando token:', error);
    return null;
  }
}

/**
 * Crea un usuario en Firebase
 */
export async function createUser(email: string, password: string, displayName?: string): Promise<admin.auth.UserRecord> {
  try {
    if (!firebaseAdmin) {
      throw new Error('Firebase Admin no está inicializado. Llama initializeFirebaseAdmin primero.');
    }

    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
    });

    console.log('Usuario creado correctamente:', userRecord.uid);
    return userRecord;
  } catch (error) {
    console.error('Error creando usuario:', error);
    throw error;
  }
}

/**
 * Asigna custom claims a un usuario
 */
export async function setCustomClaims(uid: string, claims: Record<string, unknown>) {
  try {
    if (!firebaseAdmin) {
      throw new Error('Firebase Admin no está inicializado. Llama initializeFirebaseAdmin primero.');
    }

    await admin.auth().setCustomUserClaims(uid, claims);
    console.log('Custom claims asignados correctamente para:', uid);
  } catch (error) {
    console.error('Error asignando custom claims:', error);
    throw error;
  }
}

/**
 * Middleware de Next.js para proteger rutas
 */
export function authMiddleware() {
  // Implementación pendiente
  console.log('Auth middleware pending');
}

/**
 * Verificar permiso del usuario
 */
export function requireRole(...roles: UserRole[]) {
  // Implementación pendiente
  console.log('Role checking pending', roles);
}

export default {
  initializeFirebaseAdmin,
  verifyToken,
  createUser,
  setCustomClaims,
  authMiddleware,
  requireRole,
};
