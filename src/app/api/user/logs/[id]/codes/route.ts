import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación
    const userId = request.cookies.get('auth_token')?.value;
    
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const logId = parseInt(params.id);
    
    if (isNaN(logId)) {
      return NextResponse.json(
        { success: false, error: 'ID de log inválido' },
        { status: 400 }
      );
    }

    // Verificar que el log existe
    const log = await prisma.iC_Logs.findUnique({
      where: { id: logId },
    });

    if (!log) {
      return NextResponse.json(
        { success: false, error: 'Log no encontrado' },
        { status: 404 }
      );
    }

    // Obtener los códigos IC asociados al log
    const codes = await prisma.iC_Codes.findMany({
      where: { log_id: logId },
      orderBy: { created_at: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: {
        log: {
          id: log.id,
          folio_interno: log.folio_interno,
          cliente: log.cliente,
          status: log.status,
          created_at: log.created_at,
        },
        codes: codes.map(code => ({
          id: code.id,
          producto: code.producto,
          codigo_ic: code.codigo_ic,
          created_at: code.created_at,
        })),
        total: codes.length,
      }
    });

  } catch (error) {
    console.error('Error fetching IC codes for log:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}