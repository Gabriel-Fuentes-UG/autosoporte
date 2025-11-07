import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Obtener códigos IC de un log específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.cookies.get('auth_token')?.value;
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'No autorizado' 
      }, { status: 401 });
    }

    const logId = parseInt(params.id);

    if (isNaN(logId)) {
      return NextResponse.json({ 
        success: false, 
        error: 'ID de log inválido' 
      }, { status: 400 });
    }

    // Obtener información del usuario
    const user = await prisma.iC_Users.findUnique({
      where: { id: parseInt(userId) },
      select: { username: true }
    });

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Usuario no encontrado' 
      }, { status: 404 });
    }

    // Verificar que el log pertenece al usuario
    const log = await prisma.iC_Logs.findFirst({
      where: {
        id: logId,
        user: user.username
      }
    });

    if (!log) {
      return NextResponse.json({ 
        success: false, 
        error: 'Log no encontrado o no autorizado' 
      }, { status: 404 });
    }

    // Obtener los códigos IC del log
    const codes = await prisma.iC_Codes.findMany({
      where: {
        log_id: logId
      },
      select: {
        producto: true,
        codigo_ic: true
      },
      orderBy: {
        id: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        codes: codes
      }
    });

  } catch (error) {
    console.error('Error fetching codes:', error);
    return NextResponse.json({
      success: false,
      error: 'Error al obtener códigos IC',
      details: (error as Error).message
    }, { status: 500 });
  }
}
