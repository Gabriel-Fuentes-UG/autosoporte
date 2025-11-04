import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const users = await prisma.iC_Users.findMany({
      select: {
        id: true,
        username: true,
        role: true,
        created_at: true
      },
      orderBy: {
        id: 'desc'
      }
    });
    
    return NextResponse.json({ users });
  } catch (error) {
    console.error('GET users error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, role } = body;
    
    if (!username || !password) {
      return NextResponse.json({ error: 'username and password required' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.iC_Users.create({
      data: {
        username,
        password_hash: hashedPassword,
        role: role || 'user'
      }
    });
    
    return NextResponse.json({ success: true, user: { id: user.id, username: user.username } });
  } catch (error: any) {
    console.error('POST users error:', error);
    
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
    }
    
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, username, password, role } = body;
    
    if (!id || !username) {
      return NextResponse.json({ error: 'id and username required' }, { status: 400 });
    }

    const updateData: any = {
      username,
      role
    };

    if (password) {
      updateData.password_hash = await bcrypt.hash(password, 10);
    }

    const user = await prisma.iC_Users.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT users error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }
    
    await prisma.iC_Users.delete({
      where: { id: parseInt(id) }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE users error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}