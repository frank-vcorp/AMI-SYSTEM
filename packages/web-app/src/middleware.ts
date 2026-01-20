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

  // Token existe, permitir acceso
  console.log('✅ Middleware: Token válido, permitiendo acceso a', pathname);
  return NextResponse.next();
}

// Configurar qué rutas ejecutan el middleware
export const config = {
  matcher: ['/admin/:path*'],
};
