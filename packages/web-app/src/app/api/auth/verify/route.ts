/**
 * API Route: POST /api/auth/verify
 * Verifica el token de Firebase y devuelve el usuario autenticado
 */
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@ami/core-auth';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token es requerido' },
        { status: 400 }
      );
    }

    // Verificar el token usando core-auth
    const authUser = await verifyToken(token);

    if (!authUser) {
      return NextResponse.json(
        { error: 'Token inválido o expirado' },
        { status: 401 }
      );
    }

    // Guardar el token en una cookie HttpOnly (seguro)
    const cookieStore = await cookies();
    cookieStore.set('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: '/',
    });

    return NextResponse.json({
      success: true,
      user: {
        uid: authUser.uid,
        email: authUser.email,
        role: authUser.role,
        tenantId: authUser.tenantId,
      },
    });
  } catch (error) {
    console.error('Error en /api/auth/verify:', error);
    return NextResponse.json(
      { error: 'Error al verificar token' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('authToken')?.value;

    if (!token) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    // Verificar el token
    const authUser = await verifyToken(token);

    if (!authUser) {
      // Limpiar la cookie si el token es inválido
      const response = NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
      response.cookies.delete('authToken');
      return response;
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        uid: authUser.uid,
        email: authUser.email,
        role: authUser.role,
        tenantId: authUser.tenantId,
      },
    });
  } catch (error) {
    console.error('Error en GET /api/auth/verify:', error);
    return NextResponse.json(
      { error: 'Error al verificar token' },
      { status: 500 }
    );
  }
}
