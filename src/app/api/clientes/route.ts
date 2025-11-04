import { NextRequest, NextResponse } from 'next/server';

// Clientes de respaldo en caso de que el API externo falle
const CLIENTES_RESPALDO = [
  {
    CardName: "SERVICIOS COMERCIALES AMAZON MEXICO",
    CardCode: "C000000113"
  },
  {
    CardName: "COPPEL",
    CardCode: "C000000001"
  },
  {
    CardName: "DISTRIBUIDORA LIVERPOOL",
    CardCode: "C000000006"
  },
  {
    CardName: "DEREMATE.COM DE MEXICO",
    CardCode: "C000000033"
  },
  {
    CardName: "SUBURBIA",
    CardCode: "C000000114"
  },
  {
    CardName: "INNOVA SPORT",
    CardCode: "C000000013"
  },
  {
    CardName: "DEPORTES MARTI",
    CardCode: "C000000007"
  }
];

export async function GET(request: NextRequest) {
  try {
    // Credenciales de autenticación básica
    const apiUser = process.env.EXTERNAL_API_USER || 'UsrWhlsReebok';
    const apiPassword = process.env.EXTERNAL_API_PASSWORD || 'AccesoWhslReebok2025@UnionGroup.Com';
    const basicAuth = Buffer.from(`${apiUser}:${apiPassword}`).toString('base64');

    // Construir URL desde variables de entorno
    const baseUrl = process.env.EXTERNAL_API_BASE_URL || 'https://www.vectordelta.com.mx:81';
    const endpoint = process.env.EXTERNAL_API_CLIENTES_ENDPOINT || '/UnionGroup/API/Query/MasterData/ClientesParaCodigosIC';
    const fullUrl = `${baseUrl}${endpoint}`;

    // Intentar obtener del API externo con timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout

    const response = await fetch(
      fullUrl,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${basicAuth}`,
        },
        cache: 'no-store',
        signal: controller.signal,
        // @ts-ignore - Node.js fetch options
        rejectUnauthorized: false // Ignora errores de certificado SSL
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn('API externa respondió con error:', response.status);
      throw new Error(`API externa respondió con status: ${response.status}`);
    }

    const clientes = await response.json();

    return NextResponse.json({
      success: true,
      data: clientes,
      source: 'external'
    });
  } catch (error: any) {
    console.error('Error al obtener clientes del API externo:', error.message);
    console.log('Usando clientes de respaldo...');
    
    // Usar clientes de respaldo
    return NextResponse.json({
      success: true,
      data: CLIENTES_RESPALDO,
      source: 'backup',
      warning: 'No se pudo conectar con el API externo, usando datos de respaldo'
    });
  }
}
