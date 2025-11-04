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
      select: { username: true, email: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Ejecutar todas las queries en paralelo para mejor performance
    const [
      totalLogs,
      logsHoy,
      totalCodigos,
      codigosHoy,
      recentActivity
    ] = await Promise.all([
      // Total de logs del usuario (solo con cliente válido)
      prisma.iC_Logs.count({
        where: {
          user: user.username,
          cliente: { not: null, notIn: [''] }
        }
      }),

      // Logs de hoy del usuario
      prisma.iC_Logs.count({
        where: {
          user: user.username,
          cliente: { not: null, notIn: [''] },
          created_at: { gte: today }
        }
      }),

      // Total de códigos IC del usuario
      prisma.iC_Codes.count({
        where: {
          log: { user: user.username }
        }
      }),

      // Códigos de hoy del usuario
      prisma.iC_Codes.count({
        where: {
          log: {
            user: user.username,
            created_at: { gte: today }
          }
        }
      }),

      // Actividad reciente del usuario (últimos 10 registros con cliente)
      prisma.iC_Logs.findMany({
        where: {
          user: user.username,
          cliente: { not: null, notIn: [''] }
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
        orderBy: { created_at: 'desc' },
        take: 10
      })
    ]);

    // Transformar actividad reciente para que coincida con la estructura esperada
    const formattedActivity = recentActivity.map(log => ({
      id: log.id,
      cliente: log.cliente,
      status: log.status,
      created_at: log.created_at,
      total_codigos: log._count.codes
    }));

    return NextResponse.json({
      success: true,
      stats: {
        totalLogs,
        logsHoy,
        totalCodigos,
        codigosHoy,
        recentActivity: formattedActivity,
        username: user.username,
        email: user.email
      }
    });
  } catch (error: any) {
    console.error('❌ Error fetching user stats:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al obtener estadísticas' },
      { status: 500 }
    );
  }
}
