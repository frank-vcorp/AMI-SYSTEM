/**
 * Auth utilities for API routes - Server-only
 */

import { NextRequest } from 'next/server';

/**
 * Extract tenant ID from request headers or Firebase token
 * Returns null if no auth header (for MVP demo fallback to default tenant)
 * @note This runs only on the server (API routes)
 */
export async function getTenantIdFromRequest(request: NextRequest): Promise<string | null> {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      // Return null for MVP demo - caller should use default tenant
      return null;
    }

    const token = authHeader.substring(7);
    // For now, extract the tenant ID from the token header or use a default
    // In production, this would verify the token with Firebase Admin SDK on a secure backend
    
    // Temporary: Use first 16 chars of token as placeholder tenant ID
    // TODO: Replace with actual Firebase Admin verification when server-side verification is implemented
    return token.substring(0, 16) || null;
  } catch (error) {
    console.error('[getTenantIdFromRequest]', error);
    return null;
  }
}

/**
 * Extract user ID from request headers or Firebase token
 * Returns null if no auth header (for MVP demo)
 * @note This runs only on the server (API routes)
 */
export async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    // For now, extract the user ID from the token header or use a default
    // In production, this would verify the token with Firebase Admin SDK on a secure backend
    
    // Temporary: Use last 16 chars of token as placeholder user ID
    // TODO: Replace with actual Firebase Admin verification when server-side verification is implemented
    return token.substring(token.length - 16) || null;
  } catch (error) {
    console.error('[getUserIdFromRequest]', error);
    return null;
  }
}

/**
 * Verify Firebase ID token
 * @note This is a placeholder for client-side verification
 * Production: Replace with actual Firebase Admin SDK verification
 */
export async function verifyToken(token: string) {
  try {
    // Placeholder verification - in production, this would use Firebase Admin SDK
    // For now, just validate the token format
    if (!token || token.length < 10) {
      throw new Error('Invalid token format');
    }
    return {
      uid: token.substring(0, 16),
      email: 'user@example.com',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    };
  } catch (error) {
    throw new Error(`Token verification failed: ${error}`);
  }
}
