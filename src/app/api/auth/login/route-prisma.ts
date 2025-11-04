import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;
    
    console.log('🔐 Login attempt:', { username, passwordLength: password?.length });
    
    if (!username || !password) {
      console.log('❌ Missing credentials');
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    const user = await prisma.iC_Users.findUnique({
      where: { username }
    });
    
    console.log('🔍 User lookup:', { found: !!user, username });
    
    if (!user) {
      console.log('❌ User not found:', username);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    
    console.log('🔑 Password check:', { match });
    
    if (!match) {
      console.log('❌ Invalid password for user:', username);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Return minimal user info (do not send password hash)
    const userResponse = { username: user.username, role: user.role };
    console.log('✅ Login successful for user:', username);
    return NextResponse.json({ success: true, user: userResponse });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}