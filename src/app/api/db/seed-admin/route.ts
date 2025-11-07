import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';


// Forzar renderizado dinámico - no pregenerar durante el build
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST() {
  try {
    // Hash de la contraseña del admin: SUPERVISORX#413017581
    const passwordHash = await bcrypt.hash('SUPERVISORX#413017581', 12);

    // Usar upsert para crear o actualizar el admin si ya existe
    const admin = await prisma.iC_Users.upsert({
      where: { username: 'Administrador' },
      update: {
        // Si existe, solo actualizar contraseña y asegurar que esté activo
        password_hash: passwordHash,
        is_active: true,
        role: 'admin',
        updated_at: new Date()
      },
      create: {
        // Si no existe, crearlo
        username: 'Administrador',
        email: 'admin@autosoporte.com',
        password_hash: passwordHash,
        role: 'admin',
        is_active: true
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true
      }
    });

    return NextResponse.json({ 
      success: true,
      message: admin.id ? 'Usuario Administrador actualizado exitosamente' : 'Usuario Administrador creado exitosamente',
      user: admin
    });
  } catch (error) {
    console.error('❌ Seed admin error:', error);
    return NextResponse.json({ 
      error: 'Error creando usuario administrador', 
      detail: (error as any).message 
    }, { status: 500 });
  }
}
