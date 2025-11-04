import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Endpoint simple para buscar en los logs de códigos IC
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '50');

    // Buscar en los logs de IC_Logs
    const results = await prisma.iC_Logs.findMany({
      where: {
        OR: [
          { user: { contains: searchTerm } },
          { folio_interno: { contains: searchTerm } },
          { action: { contains: searchTerm } }
        ]
      },
      select: {
        user: true,
        folio_interno: true,
        action: true,
        details: true,
        created_at: true
      },
      orderBy: { created_at: 'desc' },
      take: limit
    });

    return NextResponse.json({
      success: true,
      results,
      count: results.length,
      searchTerm
    });

  } catch (error) {
    console.error('❌ Error en búsqueda IC:', error);
    return NextResponse.json({
      success: false,
      error: 'Error en búsqueda',
      details: (error as Error).message
    }, { status: 500 });
  }
}