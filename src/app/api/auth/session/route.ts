import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // ✅ Prisma: findUnique con ID
    const user = await prisma.iC_Users.findUnique({
      where: { id: parseInt(token) },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        is_active: true
      }
    });
    
    if (!user || !user.is_active) {
      return NextResponse.json({ error: 'Usuario no encontrado o inactivo' }, { status: 401 });
    }

    return NextResponse.json({ 
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email,
        role: user.role 
      } 
    });
  } catch (error) {
    console.error('❌ Session check error:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
