/**
 * Middleware - Protección de rutas autenticadas
 * Redirige a /login si el usuario no está autenticado
 */
import { NextRequest, NextResponse } from 'next/server';

// Rutas que requieren autenticación
const protectedRoutes = ['/admin'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Verificar si la ruta requiere autenticación
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Verificar si hay token en las cookies
  const authToken = request.cookies.get('authToken')?.value;

  if (!authToken) {
    // Redirigir a login si no hay token
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verificar el token en el servidor
  try {
    const verifyResponse = await fetch(
      new URL('/api/auth/verify', request.url),
      {
        method: 'GET',
        headers: {
          Cookie: `authToken=${authToken}`,
        },
      }
    );

    if (!verifyResponse.ok) {
      // Token inválido, redirigir a login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('authToken');
      return response;
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Error verificando token en middleware:', error);
    // En caso de error, redirigir a login por seguridad
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
}

// Configurar qué rutas ejecutan el middleware
export const config = {
  matcher: ['/admin/:path*'],
};
