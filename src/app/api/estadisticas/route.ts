import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Fecha de inicio del mes actual
    const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    
    // ✅ Prisma: Ejecutar todas las queries en paralelo
    const [
      totalLogs,
      logsHoy,
      codigosHoy,
      porCliente,
      porUsuario,
      recientes,
      porEstado,
      logsPorMes,
      codigosPorMes
    ] = await Promise.all([
      // Total logs (tickets)
      prisma.iC_Logs.count(),
      
      // Logs de hoy (desde las 00:00)
      prisma.iC_Logs.count({
        where: {
          created_at: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      
      // Códigos de hoy
      prisma.iC_Codes.count({
        where: {
          created_at: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      
      // Top 10 clientes
      prisma.iC_Logs.groupBy({
        by: ['cliente'],
        _count: {
          _all: true
        },
        where: {
          cliente: {
            not: null
          }
        },
        orderBy: {
          _count: {
            cliente: 'desc'
          }
        },
        take: 10
      }),
      
      // Top 10 usuarios
      prisma.iC_Logs.groupBy({
        by: ['user'],
        _count: {
          _all: true
        },
        orderBy: {
          _count: {
            user: 'desc'
          }
        },
        take: 10
      }),
      
      // Actividad reciente (últimos 15)
      prisma.iC_Logs.findMany({
        take: 15,
        orderBy: {
          created_at: 'desc'
        },
        select: {
          id: true,
          user: true,
          cliente: true,
          status: true,
          created_at: true,
          _count: {
            select: {
              codes: true
            }
          }
        }
      }),
      
      // Distribución por estado
      prisma.iC_Logs.groupBy({
        by: ['status'],
        _count: {
          _all: true
        },
        orderBy: {
          _count: {
            status: 'desc'
          }
        }
      }),
      
      // Tickets por mes (últimos 12 meses)
      prisma.$queryRaw`
        SELECT 
          FORMAT(created_at, 'yyyy-MM') as mes,
          COUNT(*) as total
        FROM IC_Logs
        WHERE created_at >= DATEADD(month, -11, DATEADD(day, 1-DAY(GETDATE()), CAST(GETDATE() AS DATE)))
        GROUP BY FORMAT(created_at, 'yyyy-MM')
        ORDER BY mes
      `,
      
      // Códigos por semanas del mes actual
      prisma.$queryRaw`
        SELECT 
          CASE 
            WHEN DATEPART(day, created_at) <= 7 THEN 'Semana 1'
            WHEN DATEPART(day, created_at) <= 14 THEN 'Semana 2'
            WHEN DATEPART(day, created_at) <= 21 THEN 'Semana 3'
            ELSE 'Semana 4'
          END as semana,
          COUNT(*) as total
        FROM IC_Codes
        WHERE created_at >= DATEADD(day, 1-DAY(GETDATE()), CAST(GETDATE() AS DATE))
        GROUP BY CASE 
            WHEN DATEPART(day, created_at) <= 7 THEN 'Semana 1'
            WHEN DATEPART(day, created_at) <= 14 THEN 'Semana 2'
            WHEN DATEPART(day, created_at) <= 21 THEN 'Semana 3'
            ELSE 'Semana 4'
          END
        ORDER BY semana
      `
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalTickets: totalLogs,
        ticketsHoy: logsHoy,
        codigosHoy,
        logsPorMes: (logsPorMes as any[]).map((m: any) => ({
          mes: m.mes,
          total: Number(m.total)
        })),
        codigosPorSemana: (codigosPorMes as any[]).map((s: any) => ({
          semana: s.semana,
          total: Number(s.total)
        })),
        porCliente: porCliente.map(c => ({
          cliente: c.cliente,
          total: c._count._all
        })),
        porUsuario: porUsuario.map(u => ({
          user: u.user,
          total: u._count._all
        })),
        recientes: recientes.map(r => ({
          id: r.id,
          user: r.user,
          cliente: r.cliente,
          status: r.status,
          created_at: r.created_at,
          total_codigos: r._count.codes
        })),
        porEstado: porEstado.map(e => ({
          status: e.status,
          total: e._count._all
        }))
      }
    });
  } catch (error: any) {
    console.error('❌ Error en estadísticas:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener estadísticas'
    }, { status: 500 });
  }
}
