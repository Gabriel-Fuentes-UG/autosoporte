import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get('auth_token')?.value;
    
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener información del usuario
    const user = await prisma.iC_Users.findUnique({
      where: { id: parseInt(userId) },
      select: { username: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Obtener TODOS los logs del usuario con códigos IC (solo logs con cliente)
    const logs = await prisma.iC_Logs.findMany({
      where: {
        user: user.username,
        cliente: {
          not: null,
          notIn: ['']
        }
      },
      select: {
        id: true,
        cliente: true,
        status: true,
        created_at: true,
        _count: {
          select: { codes: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    // Transformar para que coincida con la estructura esperada
    const formattedLogs = logs.map(log => ({
      id: log.id,
      cliente: log.cliente,
      status: log.status,
      created_at: log.created_at,
      total_codigos: log._count.codes
    }));

    return NextResponse.json({
      success: true,
      data: {
        logs: formattedLogs
      }
    });
  } catch (error: any) {
    console.error('❌ Error fetching user logs:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al obtener logs' },
      { status: 500 }
    );
  }
}
