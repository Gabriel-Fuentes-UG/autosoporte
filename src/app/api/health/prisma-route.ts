import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('🔍 Verificando estado de conexión con Prisma...');
    
    // Test de conexión simple
    await prisma.$queryRaw`SELECT 1 as test`;
    
    // Verificar tablas existentes
    const userCount = await prisma.iC_Users.count();
    const logCount = await prisma.iC_Logs.count();
    
    console.log('✅ Health check completado exitosamente');
    console.log(`📊 Usuarios: ${userCount}, Logs: ${logCount}`);
    
    return NextResponse.json({ 
      status: 'healthy',
      database: 'connected',
      orm: 'prisma',
      tables: {
        users: userCount,
        logs: logCount
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Health check failed:', error);
    
    return NextResponse.json({ 
      status: 'unhealthy',
      database: 'disconnected',
      orm: 'prisma',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}