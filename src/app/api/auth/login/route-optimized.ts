import { NextRequest, NextResponse } from 'next/server';
import { withPrisma } from '@/lib/prisma-service';
import bcrypt from 'bcryptjs';

export const POST = withPrisma(async (request: NextRequest, prisma) => {
  try {
    const body = await request.json();
    const { username, password } = body;
    
    console.log('🔐 Login attempt:', { username, passwordLength: password?.length });
    
    if (!username || !password) {
      console.log('❌ Missing credentials');
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    // Buscar usuario con timeout optimizado
    const user = await prisma.iC_Users.findUnique({
      where: { username: username.trim().toLowerCase() },
      select: {
        id: true,
        username: true,
        password_hash: true,
        role: true,
        created_at: true
      }
    });
    
    console.log('🔍 User lookup:', { found: !!user, username });
    
    if (!user) {
      console.log('❌ User not found:', username);
      // Delay para prevenir timing attacks
      await new Promise(resolve => setTimeout(resolve, 1000));
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Verificar contraseña
    const match = await bcrypt.compare(password, user.password_hash);
    
    console.log('🔑 Password check:', { match });
    
    if (!match) {
      console.log('❌ Invalid password for user:', username);
      // Delay para prevenir timing attacks
      await new Promise(resolve => setTimeout(resolve, 1000));
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Log del login exitoso
    await prisma.iC_Logs.create({
      data: {
        user: user.username,
        client: 'SYSTEM',
        action: 'LOGIN_SUCCESS',
        details: `Login exitoso desde IP: ${request.ip || 'unknown'}`
      }
    });

    // Return minimal user info (do not send password hash)
    const userResponse = { 
      id: user.id,
      username: user.username, 
      role: user.role 
    };
    
    console.log('✅ Login successful for user:', username);
    
    return NextResponse.json({ 
      success: true, 
      user: userResponse,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Login error:', error);
    
    // Log del error
    try {
      await prisma.iC_Logs.create({
        data: {
          user: 'UNKNOWN',
          client: 'SYSTEM',
          action: 'LOGIN_ERROR',
          details: `Error de login: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
    
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
});