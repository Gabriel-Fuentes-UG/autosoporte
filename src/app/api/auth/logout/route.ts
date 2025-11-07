import { NextRequest, NextResponse } from 'next/server';


// Forzar renderizado dinámico - no pregenerar durante el build
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true });
  
  // Eliminar cookies de autenticación
  response.cookies.delete('auth_token');
  response.cookies.delete('user_role');
  
  return response;
}
