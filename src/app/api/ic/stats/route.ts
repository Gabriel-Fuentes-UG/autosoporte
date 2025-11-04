import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Endpoint para estadísticas simples de códigos IC
export async function GET() {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Ejecutar todas las queries en paralelo
    const [totalLogs, uniqueUsers, lastActivity, userStats] = await Promise.all([
      // Total de logs
      prisma.iC_Logs.count(),

      // Usuarios únicos
      prisma.iC_Logs.findMany({
        select: { user: true },
        distinct: ['user']
      }),

      // Última actividad
      prisma.iC_Logs.findFirst({
        select: { created_at: true },
        orderBy: { created_at: 'desc' }
      }),

      // Estadísticas por usuario en los últimos 7 días
      prisma.iC_Logs.groupBy({
        by: ['user'],
        where: {
          created_at: { gte: sevenDaysAgo }
        },
        _count: { id: true },
        _max: { created_at: true },
        orderBy: {
          _count: { id: 'desc' }
        }
      })
    ]);

    // Contar clientes únicos (folio_interno)
    const uniqueClients = await prisma.iC_Logs.findMany({
      select: { folio_interno: true },
      distinct: ['folio_interno'],
      where: {
        folio_interno: { not: null }
      }
    });

    // Formatear estadísticas de usuarios
    const formattedUserStats = userStats.map(stat => ({
      user: stat.user,
      log_count: stat._count.id,
      last_activity: stat._max.created_at
    }));

    return NextResponse.json({
      success: true,
      stats: {
        total_logs: totalLogs,
        unique_users: uniqueUsers.length,
        unique_clients: uniqueClients.length,
        last_activity: lastActivity?.created_at
      },
      userStats: formattedUserStats
    });

  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
    return NextResponse.json({
      success: false,
      error: 'Error obteniendo estadísticas',
      details: (error as Error).message
    }, { status: 500 });
  }
}