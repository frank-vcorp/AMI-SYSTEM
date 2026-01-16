/**
 * Auth utilities for API routes
 */

import { NextRequest } from 'next/server';
import * as admin from 'firebase-admin';

/**
 * Extract tenant ID from request headers or Firebase token
 */
export async function getTenantIdFromRequest(request: NextRequest): Promise<string> {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.substring(7);
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Use Firebase UID as tenant ID (or extract custom claim if configured)
    return decodedToken.uid;
  } catch (error) {
    throw new Error(`Failed to extract tenant ID: ${error}`);
  }
}

/**
 * Extract user ID from request headers or Firebase token
 */
export async function getUserIdFromRequest(request: NextRequest): Promise<string> {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.substring(7);
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    return decodedToken.uid;
  } catch (error) {
    throw new Error(`Failed to extract user ID: ${error}`);
  }
}

/**
 * Verify Firebase ID token
 */
export async function verifyToken(token: string) {
  try {
    return await admin.auth().verifyIdToken(token);
  } catch (error) {
    throw new Error(`Token verification failed: ${error}`);
  }
}
