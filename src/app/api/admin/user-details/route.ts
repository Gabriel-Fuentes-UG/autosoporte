import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Resumen por usuario - Usando groupBy de Prisma
    const summaryData = await prisma.iC_Logs.groupBy({
      by: ['user'],
      where: {
        cliente: { not: null, notIn: [''] }
      },
      _count: {
        id: true
      },
      _min: {
        created_at: true
      },
      _max: {
        created_at: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    });

    // Para cada usuario, contar sus códigos totales
    const summaryWithCodigos = await Promise.all(
      summaryData.map(async (userSummary) => {
        const totalCodigos = await prisma.iC_Codes.count({
          where: {
            log: {
              user: userSummary.user,
              cliente: { not: null, notIn: [''] }
            }
          }
        });

        return {
          user: userSummary.user,
          total_logs: userSummary._count.id,
          total_codigos: totalCodigos,
          primera_operacion: userSummary._min.created_at,
          ultima_operacion: userSummary._max.created_at
        };
      })
    );

    // Detalle completo de logs con códigos por usuario
    const detailData = await prisma.iC_Logs.findMany({
      where: {
        cliente: { not: null, notIn: [''] }
      },
      select: {
        user: true,
        id: true,
        folio_interno: true,
        cliente_code: true,
        cliente: true,
        status: true,
        created_at: true,
        codes: {
          select: {
            producto: true,
            codigo_ic: true
          }
        }
      },
      orderBy: [
        { user: 'asc' },
        { created_at: 'desc' }
      ]
    });

    // Transformar detalle para coincidir con estructura esperada
    const formattedDetails = detailData.map(log => ({
      user: log.user,
      log_id: log.id,
      codigo_interno: log.folio_interno,
      cliente_code: log.cliente_code,
      cliente: log.cliente,
      status: log.status,
      created_at: log.created_at,
      codigos_count: log.codes.length,
      codigos_detalle: log.codes.map(c => `${c.producto}:${c.codigo_ic}`).join(', ')
    }));

    return NextResponse.json({
      success: true,
      summary: summaryWithCodigos,
      details: formattedDetails
    });
  } catch (error: any) {
    console.error('❌ Error fetching user details:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
