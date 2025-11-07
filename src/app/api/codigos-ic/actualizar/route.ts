import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';


// Forzar renderizado dinámico - no pregenerar durante el build
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Esquema de validación con Zod
const CodigoSchema = z.object({
  articulo: z.string().min(1, 'Artículo requerido').max(100, 'Artículo muy largo'),
  codigoIC: z.string().min(1, 'Código IC requerido').max(100, 'Código IC muy largo')
});

const RequestSchema = z.object({
  cliente: z.string()
    .regex(/^C\d{9}$/, 'Formato de cliente inválido (debe ser C000000XXX)'),
  clienteNombre: z.string()
    .min(1, 'Nombre de cliente requerido')
    .max(200, 'Nombre de cliente muy largo'),
  codigos: z.array(CodigoSchema)
    .min(1, 'Debe incluir al menos un código')
    .max(1000, 'Máximo 1000 códigos por operación'),
  userId: z.number().optional(),
  username: z.string().optional()
});

interface ExternalApiResponse {
  Cliente?: string;
  ProductosProcesados?: number;
  [key: string]: any;
}


export async function POST(request: NextRequest) {
  try {
    // 1. VALIDACIÓN DE DATOS
    const body = await request.json();
    const validData = RequestSchema.parse(body);
    const { cliente, clienteNombre, codigos, username } = validData;

    // 2. GENERAR CÓDIGO DE LOG
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const clienteCorto = cliente.substring(cliente.length - 3);
    const basePattern = `IC-${clienteCorto}-${today}-`;
    
    // 3. OBTENER SECUENCIA (optimizado con count)
    const sequenceCount = await prisma.iC_Logs.count({
      where: {
        folio_interno: {
          startsWith: basePattern
        }
      }
    });
    
    const sequence = (sequenceCount + 1).toString().padStart(3, '0');
    const logCode = `${basePattern}${sequence}`;
    const nowLocal = new Date();

    // 4. TRANSACCIÓN ATÓMICA: Crear Log + Códigos
    const log = await prisma.$transaction(async (tx) => {
      const createdLog = await tx.iC_Logs.create({
        data: {
          user: username || 'Usuario',
          folio_interno: logCode,
          cliente_code: cliente,
          cliente: clienteNombre,
          action: 'IC_BULK_UPDATE',
          details: `[${logCode}] Actualización masiva de ${codigos.length} códigos IC para ${clienteNombre}`,
          status: 'PENDIENTE',
          created_at: nowLocal,
          // Crear códigos en la misma transacción (bulk insert)
          codes: {
            createMany: {
              data: codigos.map(c => ({
                producto: c.articulo.trim(),
                codigo_ic: c.codigoIC.trim(),
                created_at: nowLocal
              }))
            }
          }
        },
        include: {
          codes: {
            select: {
              id: true,
              producto: true,
              codigo_ic: true
            }
          }
        }
      });

      return createdLog;
    });

    // 5. PREPARAR LLAMADA A API EXTERNA
    const apiUser = process.env.EXTERNAL_API_USER;
    const apiPassword = process.env.EXTERNAL_API_PASSWORD;
    
    if (!apiUser || !apiPassword) {
      console.error('❌ Variables de entorno EXTERNAL_API_USER/PASSWORD no configuradas');
      
      // Marcar como error en la BD
      await prisma.iC_Logs.update({
        where: { id: log.id },
        data: {
          status: 'ERROR',
          details: `${log.details} | ERROR: Credenciales API no configuradas`,
          updated_at: new Date()
        }
      });

      return NextResponse.json({
        success: false,
        logId: log.id,
        logCode: logCode,
        error: 'Configuración del servidor incompleta',
      }, { status: 500 });
    }

    const basicAuth = Buffer.from(`${apiUser}:${apiPassword}`).toString('base64');
    
    const externalPayload = {
      Cliente: cliente,
      IdInterno: log.id.toString(),
      Productos: codigos.map(c => ({
        Producto: c.articulo.trim(),
        CodigoIC: c.codigoIC.trim()
      }))
    };

    // 6. LLAMADA A API EXTERNA CON TIMEOUT
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos

    // Construir URL desde variables de entorno
    const baseUrl = process.env.EXTERNAL_API_BASE_URL || 'https://www.vectordelta.com.mx:81';
    const endpoint = process.env.EXTERNAL_API_CODIGOS_IC_ENDPOINT || '/UnionGroup/API/Insert/dd/CodigosIC';
    const fullUrl = `${baseUrl}${endpoint}`;

    let externalResponse: Response;
    try {
      externalResponse = await fetch(
        fullUrl,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${basicAuth}`,
          },
          body: JSON.stringify(externalPayload),
          signal: controller.signal
        }
      );
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      const errorMsg = fetchError.name === 'AbortError' 
        ? 'Timeout: La API externa no respondió a tiempo'
        : `Error de conexión: ${fetchError.message}`;

      // Marcar como error
      await prisma.iC_Logs.update({
        where: { id: log.id },
        data: {
          status: 'ERROR',
          details: `${log.details} | ${errorMsg}`,
          updated_at: new Date()
        }
      });

      return NextResponse.json({
        success: false,
        logId: log.id,
        logCode: logCode,
        error: errorMsg,
      }, { status: 500 });
    }

    clearTimeout(timeoutId);

    // 7. PROCESAR RESPUESTA DE API EXTERNA
    const responseText = await externalResponse.text();
    let responseData: ExternalApiResponse | null = null;
    let isSuccess = false;

    try {
      responseData = JSON.parse(responseText);
      isSuccess = Boolean(
        responseData?.Cliente && 
        responseData?.ProductosProcesados !== undefined
      );
    } catch {
      // Si no es JSON válido, verificar texto de error conocido
      isSuccess = !(
        responseText.includes('Error de registro') || 
        responseText.includes('REINTENTAR')
      );
    }

    // 8. ACTUALIZAR ESTADO SEGÚN RESPUESTA
    if (!isSuccess) {
      await prisma.iC_Logs.update({
        where: { id: log.id },
        data: {
          status: 'ERROR',
          details: `${log.details} | ERROR API: ${responseText.substring(0, 500)}`,
          updated_at: new Date()
        }
      });

      return NextResponse.json({
        success: false,
        logId: log.id,
        logCode: logCode,
        error: 'Error de registro en API externa; REINTENTAR',
        details: responseText,
      }, { status: 500 });
    }

    // 9. ÉXITO - Devolver resultado
    return NextResponse.json({
      success: true,
      logId: log.id,
      logCode: logCode,
      updated: codigos.length,
      codigosCreados: log.codes.length,
      message: `✅ ${codigos.length} códigos IC procesados correctamente`,
      externalResponse: responseData,
    });

  } catch (error: any) {
    console.error('❌ Error en actualización de códigos IC:', error);
    
    // Manejo específico de errores de validación
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Datos inválidos',
        details: error.errors.map(e => ({
          campo: e.path.join('.'),
          mensaje: e.message
        }))
      }, { status: 400 });
    }

    // Error genérico
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error interno del servidor',
    }, { status: 500 });
  }
}
