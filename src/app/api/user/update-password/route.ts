import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const UpdatePasswordSchema = z.object({
  userId: z.number(),
  currentPassword: z.string().min(6, 'La contraseña actual debe tener al menos 6 caracteres'),
  password: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres')
});

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validData = UpdatePasswordSchema.parse(body);

    // Verificar que el usuario existe
    const user = await prisma.iC_Users.findUnique({
      where: { id: validData.userId },
      select: { 
        id: true, 
        username: true,
        password_hash: true 
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar la contraseña actual
    const isPasswordValid = await bcrypt.compare(validData.currentPassword, user.password_hash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'La contraseña actual es incorrecta' },
        { status: 401 }
      );
    }

    // Verificar que la nueva contraseña sea diferente
    const isSamePassword = await bcrypt.compare(validData.password, user.password_hash);

    if (isSamePassword) {
      return NextResponse.json(
        { success: false, error: 'La nueva contraseña debe ser diferente a la actual' },
        { status: 400 }
      );
    }

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(validData.password, 12);

    // Actualizar la contraseña
    await prisma.iC_Users.update({
      where: { id: validData.userId },
      data: {
        password_hash: hashedPassword,
        updated_at: new Date()
      }
    });

    // Log de la acción (no crítico)
    try {
      await prisma.iC_Logs.create({
        data: {
          user: user.username,
          folio_interno: 'User Profile',
          action: 'PASSWORD_UPDATED',
          details: `Usuario ${user.username} actualizó su contraseña`,
          status: 'success'
        }
      });
    } catch (logError) {
      console.log('❌ Log error (non-critical):', logError);
    }

    return NextResponse.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('❌ Error updating password:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
