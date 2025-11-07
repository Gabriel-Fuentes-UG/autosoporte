import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';


// Forzar renderizado dinámico - no pregenerar durante el build
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;
    
    console.log('🔐 Login attempt:', { username, passwordLength: password?.length });
    
    if (!username || !password) {
      console.log('❌ Missing credentials');
      return NextResponse.json({ error: 'Correo y contraseña requeridos' }, { status: 400 });
    }

    // Prisma con email único
    const user = await prisma.iC_Users.findFirst({
      where: { email: username },
      select: {
        id: true,
        username: true,
        email: true,
        password_hash: true,
        role: true,
        is_active: true
      }
    });
    
    console.log('👤 User found:', user ? `${user.email} (${user.role})` : 'NO');
    
    if (!user) {
      console.log('❌ User not found');
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    if (!user.is_active) {
      console.log('❌ User inactive');
      return NextResponse.json({ error: 'Usuario deshabilitado. Contacte al administrador.' }, { status: 403 });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    console.log('🔑 Password match:', match);
    
    if (!match) {
      console.log('❌ Invalid password');
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    const response = NextResponse.json({ 
      success: true, 
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email,
        role: user.role 
      } 
    });

    response.cookies.set('auth_token', user.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8
    });

    response.cookies.set('user_role', user.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8
    });

    return response;
  } catch (error) {
    console.error('❌ Login error:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
