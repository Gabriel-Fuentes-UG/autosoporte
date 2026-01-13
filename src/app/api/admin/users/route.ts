import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

// Forzar renderizado dinámico - no pregenerar durante el build
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Schemas de validación
const CreateUserSchema = z.object({
  username: z.string().min(3, 'Mínimo 3 caracteres').max(100),
  email: z.string().email('Email inválido').max(200),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  role: z.enum(['admin', 'user']).default('user')
});

const UpdateUserSchema = z.object({
  id: z.number(),
  username: z.string().min(3).max(100).optional(),
  email: z.string().email('Email inválido').max(200).optional().or(z.literal('')),
  password: z.string().min(6, 'Mínimo 6 caracteres').optional().or(z.literal('')),
  role: z.enum(['admin', 'user'], { errorMap: () => ({ message: 'Rol inválido' }) }).optional(),
  is_active: z.boolean().optional()
});

// Verificar que el usuario es admin
function isAdmin(request: NextRequest): boolean {
  const userRole = request.cookies.get('user_role')?.value;
  console.log('🔍 Checking admin status:', { userRole, isAdmin: userRole === 'admin' });
  console.log('📋 All cookies:', request.cookies.getAll());
  return userRole === 'admin';
}

// GET - Obtener todos los usuarios
export async function GET(request: NextRequest) {
  try {
    console.log('👥 Fetching users list...');
    
    if (!isAdmin(request)) {
      console.log('❌ Access denied - not admin');
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const users = await prisma.iC_Users.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        is_active: true,
        created_at: true,
        updated_at: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });
    
    console.log(`✅ Found ${users.length} users`);

    return NextResponse.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo usuario
export async function POST(request: NextRequest) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const body = await request.json();
    const validData = CreateUserSchema.parse(body);

    // Verificar si el usuario ya existe
    const existing = await prisma.iC_Users.findFirst({
      where: {
        OR: [
          { username: validData.username },
          { email: validData.email }
        ]
      }
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'El usuario o email ya existe' },
        { status: 400 }
      );
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(validData.password, 12);

    // Crear el usuario
    const newUser = await prisma.iC_Users.create({
      data: {
        username: validData.username,
        email: validData.email,
        password_hash: hashedPassword,
        role: validData.role,
        is_active: true
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        created_at: true
      }
    });

    // Log de la acción (no crítico)
    try {
      await prisma.iC_Logs.create({
        data: {
          user: validData.username,
          folio_interno: 'Admin Panel',
          action: 'USER_CREATED',
          details: `Usuario ${validData.username} creado con rol ${validData.role}`,
          status: 'success'
        }
      });
    } catch (logError) {
      console.log('❌ Log error (non-critical):', logError);
    }

    return NextResponse.json({
      success: true,
      message: 'Usuario creado exitosamente',
      user: newUser
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('❌ Error creating user:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar usuario existente
export async function PUT(request: NextRequest) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const body = await request.json();
    const validData = UpdateUserSchema.parse(body);

    // Verificar que el usuario existe
    const existingUser = await prisma.iC_Users.findUnique({
      where: { id: validData.id },
      select: { id: true, username: true }
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si el nuevo username ya existe (si se está cambiando)
    if (validData.username && validData.username !== existingUser.username) {
      const duplicate = await prisma.iC_Users.findFirst({
        where: {
          username: validData.username,
          id: { not: validData.id }
        }
      });

      if (duplicate) {
        return NextResponse.json(
          { success: false, error: 'El nombre de usuario ya existe' },
          { status: 400 }
        );
      }
    }

    // Verificar si el nuevo email ya existe (si se está cambiando)
    if (validData.email && validData.email.trim() !== '') {
      const emailDuplicate = await prisma.iC_Users.findFirst({
        where: {
          email: validData.email,
          id: { not: validData.id }
        }
      });

      if (emailDuplicate) {
        return NextResponse.json(
          { success: false, error: 'El email ya está registrado' },
          { status: 400 }
        );
      }
    }

    // Preparar datos de actualización
    const updateData: any = {
      updated_at: new Date()
    };

    if (validData.username) {
      updateData.username = validData.username;
    }

    if (validData.email && validData.email.trim() !== '') {
      updateData.email = validData.email;
    }

    if (validData.password && validData.password.trim() !== '') {
      updateData.password_hash = await bcrypt.hash(validData.password, 12);
    }

    if (validData.role) {
      updateData.role = validData.role;
    }

    if (validData.is_active !== undefined) {
      updateData.is_active = validData.is_active;
    }

    // Actualizar usuario
    const updatedUser = await prisma.iC_Users.update({
      where: { id: validData.id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        is_active: true,
        created_at: true
      }
    });

    // Log de la acción (no crítico)
    try {
      await prisma.iC_Logs.create({
        data: {
          user: updatedUser.username,
          folio_interno: 'Admin Panel',
          action: 'USER_UPDATED',
          details: `Usuario ${updatedUser.username} actualizado`,
          status: 'success'
        }
      });
    } catch (logError) {
      console.log('❌ Log error (non-critical):', logError);
    }

    return NextResponse.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      user: updatedUser
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('❌ Error updating user:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar usuario
export async function DELETE(request: NextRequest) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID de usuario requerido' },
        { status: 400 }
      );
    }

    // Verificar que el usuario existe
    const existingUser = await prisma.iC_Users.findUnique({
      where: { id: parseInt(id) },
      select: { id: true, username: true, role: true }
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // No permitir eliminar al último admin
    if (existingUser.role === 'admin') {
      const adminCount = await prisma.iC_Users.count({
        where: { role: 'admin' }
      });

      if (adminCount <= 1) {
        return NextResponse.json(
          { success: false, error: 'No se puede eliminar el último administrador' },
          { status: 400 }
        );
      }
    }

    // Log antes de eliminar (no crítico)
    try {
      await prisma.iC_Logs.create({
        data: {
          user: existingUser.username,
          folio_interno: 'Admin Panel',
          action: 'USER_DELETED',
          details: `Usuario ${existingUser.username} eliminado`,
          status: 'success'
        }
      });
    } catch (logError) {
      console.log('❌ Log error (non-critical):', logError);
    }

    // Eliminar usuario
    await prisma.iC_Users.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });

  } catch (error) {
    console.error('❌ Error deleting user:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}