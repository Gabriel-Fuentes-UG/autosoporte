import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


// Forzar renderizado dinámico - no pregenerar durante el build
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    console.log('🔍 Verificando estado de conexión SQL Server...');
    
    // Test basic health
    const basicHealth = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV,
    };

    // Test database connection with simple query
    const currentTime = await prisma.$queryRaw<Array<{ CurrentTime: Date }>>`SELECT GETDATE() as CurrentTime`;
    
    // Check if our tables exist by attempting to count records
    const [usersCount, logsCount, codesCount] = await Promise.all([
      prisma.iC_Users.count().catch(() => null),
      prisma.iC_Logs.count().catch(() => null),
      prisma.iC_Codes.count().catch(() => null)
    ]);

    const response = {
      ...basicHealth,
      database: {
        status: 'connected',
        message: '✅ Conexión SQL Server establecida via Prisma',
        serverTime: currentTime[0]?.CurrentTime,
        tables: {
          IC_Users: usersCount !== null,
          IC_Logs: logsCount !== null,
          IC_Codes: codesCount !== null
        },
        counts: {
          users: usersCount ?? 0,
          logs: logsCount ?? 0,
          codes: codesCount ?? 0
        }
      }
    };

    console.log('✅ Health check completado exitosamente');
    
    return NextResponse.json({
      success: true,
      connected: true,
      ...response
    });

  } catch (error) {
    console.error('❌ Error en health check:', error);
    
    return NextResponse.json({
      success: false,
      connected: false,
      error: 'Error de conexión SQL Server',
      details: (error as Error).message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
