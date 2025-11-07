import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


// Forzar renderizado dinámico - no pregenerar durante el build
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Endpoint simple para gestión de logs de códigos IC
export async function GET() {
  try {
    // Obtener logs recientes (últimos 100)
    const logs = await prisma.iC_Logs.findMany({
      select: {
        id: true,
        user: true,
        folio_interno: true,
        action: true,
        details: true,
        created_at: true
      },
      orderBy: { created_at: 'desc' },
      take: 100
    });

    return NextResponse.json({
      success: true,
      logs
    });

  } catch (error) {
    console.error('❌ Error obteniendo logs:', error);
    return NextResponse.json({
      success: false,
      error: 'Error obteniendo logs',
      details: (error as Error).message
    }, { status: 500 });
  }
}

// Limpiar logs antiguos (solo admins)
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { olderThan } = body; // días

    if (!olderThan || olderThan < 7) {
      return NextResponse.json({
        success: false,
        error: 'Se requiere olderThan (mínimo 7 días)'
      }, { status: 400 });
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThan);

    const result = await prisma.iC_Logs.deleteMany({
      where: {
        created_at: {
          lt: cutoffDate
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: `Logs eliminados (más antiguos que ${olderThan} días)`,
      rowsAffected: result.count
    });

  } catch (error) {
    console.error('❌ Error eliminando logs:', error);
    return NextResponse.json({
      success: false,
      error: 'Error eliminando logs',
      details: (error as Error).message
    }, { status: 500 });
  }
}
