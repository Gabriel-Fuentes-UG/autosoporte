import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Forzar renderizado dinámico para esta ruta
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // ✅ Prisma: Obtener todos los logs ordenados por fecha
    const logs = await prisma.iC_Logs.findMany({
      select: {
        id: true,
        user: true,
        folio_interno: true,
        action: true,
        details: true,
        status: true,
        created_at: true,
        cliente: true,
        cliente_code: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      logs
    });
  } catch (error) {
    console.error('❌ Error fetching logs:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener los registros'
      },
      { status: 500 }
    );
  }
}
