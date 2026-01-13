import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Redirigir / (o /basePath/) a /login
  if (pathname === '/' || pathname === basePath || pathname === `${basePath}/`) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = `${basePath}/login`;
    return NextResponse.redirect(loginUrl);
  }

  // Permitir acceso público a /login y todas las rutas de API
  // Las rutas de API manejan su propia autenticación y devuelven JSON
  if (pathname.endsWith('/login') || pathname.includes('/api/')) {
    return NextResponse.next();
  }

  // Verificar autenticación mediante cookie o header
  const token = request.cookies.get('auth_token')?.value;
  const userRole = request.cookies.get('user_role')?.value;

  // Si no hay token, redirigir a login (solo para páginas, no APIs)
  if (!token) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = `${basePath}/login`;
    return NextResponse.redirect(loginUrl);
  }

  // Proteger rutas de admin
  if (pathname.includes('/admin') && userRole !== 'admin') {
    const userHomeUrl = request.nextUrl.clone();
    userHomeUrl.pathname = `${basePath}/user/home`;
    return NextResponse.redirect(userHomeUrl);
  }

  // Proteger rutas de user
  if (pathname.includes('/user') && userRole === 'admin') {
    const adminHomeUrl = request.nextUrl.clone();
    adminHomeUrl.pathname = `${basePath}/admin/home`;
    return NextResponse.redirect(adminHomeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
