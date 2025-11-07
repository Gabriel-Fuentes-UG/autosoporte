import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';


// Forzar renderizado dinámico - no pregenerar durante el build
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const ICCodeSchema = z.object({
  user: z.string().min(1),
  client: z.string().min(1),
  codes: z.array(
    z.object({
      articulo: z.string(),
      codigo: z.string()
    })
  ).min(1)
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar datos con Zod
    const data = ICCodeSchema.parse(body);

    // Guardar en base de datos con Prisma
    try {
      const details = JSON.stringify({ 
        count: data.codes.length, 
        sample: data.codes.slice(0, 10) 
      });

      await prisma.iC_Logs.create({
        data: {
          user: data.user,
          folio_interno: data.client,
          action: 'upload',
          details,
          status: 'success'
        }
      });

    } catch (err) {
      console.warn('⚠️ No se pudo escribir en IC_Logs:', (err as any).message || err);
      // continuar y devolver éxito local
    }

    return NextResponse.json({
      success: true,
      message: `Se procesaron ${data.codes.length} códigos IC correctamente`,
      data: {
        user: data.user,
        client: data.client,
        count: data.codes.length,
        timestamp: new Date().toISOString(),
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('❌ Error procesando códigos IC:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
