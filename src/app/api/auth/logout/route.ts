import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true });
  
  // Eliminar cookies de autenticación
  response.cookies.delete('auth_token');
  response.cookies.delete('user_role');
  
  return response;
}
