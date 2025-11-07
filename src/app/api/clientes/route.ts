import { NextRequest, NextResponse } from 'next/server';


// Forzar renderizado dinámico - no pregenerar durante el build
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// FORZAR: Configurar Node.js para ignorar errores de certificado SSL
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

// Importar módulos necesarios
const https = require('https');

// Cache en memoria para clientes externos
let clientesCache: any = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos en milisegundos

// Clientes de respaldo - SOLO datos reales del API externo
const CLIENTES_RESPALDO = [
  { CardName: "DEREMATE.COM DE MEXICO", CardCode: "C000000033" },
  { CardName: "DISTRIBUIDORA LIVERPOOL", CardCode: "C000000006" },
  { CardName: "SUBURBIA", CardCode: "C000000114" },
  { CardName: "SERVICIOS COMERCIALES AMAZON MEXICO", CardCode: "C000000113" },
  { CardName: "DEPORTES MARTI", CardCode: "C000000007" },
  { CardName: "INNOVA SPORT", CardCode: "C000000013" },
  { CardName: "COPPEL", CardCode: "C000000001" }
];

export async function GET(request: NextRequest) {
  try {
    // Verificar si tenemos datos en cache y son recientes
    const now = Date.now();
    if (clientesCache && (now - cacheTimestamp) < CACHE_DURATION) {
      console.log(`⚡ Devolviendo clientes desde cache (${Math.round((now - cacheTimestamp) / 1000)}s antiguos)`);
      return NextResponse.json({
        success: true,
        data: clientesCache,
        source: 'cache',
        cached: true,
        cacheAge: Math.round((now - cacheTimestamp) / 1000)
      });
    }

    // Intentar API externo con NODE_TLS_REJECT_UNAUTHORIZED=0

    // Credenciales de autenticación básica (usar las que TÚ probaste)
    const apiUser = process.env.EXTERNAL_API_USER || 'UsrRetailReebok';
    const apiPassword = process.env.EXTERNAL_API_PASSWORD || 'AccesoRetailReebok2025@UnionGroup.Com';
    const basicAuth = Buffer.from(`${apiUser}:${apiPassword}`).toString('base64');

    // Construir URL desde variables de entorno
    const baseUrl = process.env.EXTERNAL_API_BASE_URL || 'https://www.vectordelta.com.mx:81';
    const endpoint = process.env.EXTERNAL_API_CLIENTES_ENDPOINT || '/UnionGroup/API/Query/MasterData/ClientesParaCodigosIC';
    const fullUrl = `${baseUrl}${endpoint}`;

    console.log(`🔄 Conectando a: ${fullUrl}`);
    console.log(`🔑 Usuario: ${apiUser}`);

    // Usar HTTPS request nativo de Node.js
    const clientesData = await new Promise<any[]>((resolve, reject) => {
      const url = new URL(fullUrl);
      
      const options = {
        hostname: url.hostname,
        port: url.port || 82,
        path: url.pathname,
        method: 'GET',
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Accept': 'application/json',
          'User-Agent': 'ReebokSoporte/1.0'
        },
        rejectUnauthorized: false,
        timeout: 20000
      };

      console.log(`🌐 ${options.hostname}:${options.port}${options.path}`);

      const req = https.request(options, (res: any) => {
        let data = '';
        res.on('data', (chunk: any) => data += chunk);
        res.on('end', () => {
          console.log(`📊 Status: ${res.statusCode}`);
          if (res.statusCode === 200) {
            try {
              const parsed = JSON.parse(data);
              console.log(`✅ ${parsed.length} clientes obtenidos`);
              resolve(parsed);
            } catch (e) {
              console.error(`❌ JSON inválido`);
              reject(new Error('JSON inválido'));
            }
          } else {
            console.error(`❌ Status: ${res.statusCode}`);
            reject(new Error(`Status: ${res.statusCode}`));
          }
        });
      });

      req.on('error', (err: any) => {
        console.error(`❌ Error: ${err.message}`);
        reject(err);
      });

      req.on('timeout', () => {
        console.error(`❌ Timeout`);
        req.destroy();
        reject(new Error('Timeout'));
      });

      req.end();
    });

    console.log(`📝 Respuesta recibida (primeros 200 chars): ${JSON.stringify(clientesData).substring(0, 200)}`);
    console.log(`🔍 Tipo de clientesData:`, typeof clientesData, Array.isArray(clientesData) ? 'es array' : 'NO es array');
    console.log(`🔍 Primer cliente:`, JSON.stringify(clientesData[0]));

    // Guardar en cache
    clientesCache = clientesData;
    cacheTimestamp = Date.now();
    console.log(`💾 ${clientesData.length} clientes guardados en cache por 5 minutos`);

    const response = {
      success: true,
      data: clientesData,
      source: 'external',
      cached: false,
      count: clientesData.length
    };
    
    console.log(`📤 Enviando respuesta - tipo de data:`, typeof response.data, Array.isArray(response.data) ? 'es array' : 'NO es array');

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('❌ Error al obtener clientes del API externo:', error.message);
    
    if (error.name === 'AbortError') {
      console.error('🕒 Timeout: El API externo tardó más de 30 segundos en responder');
    }
    
    console.log('🔄 Usando clientes de respaldo...');
    
    // Usar clientes de respaldo - MOSTRAR CORRECTAMENTE el estado
    console.log('🔄 Usando clientes de respaldo - API externo no disponible');
    
    return NextResponse.json({
      success: true,
      data: CLIENTES_RESPALDO,
      source: 'backup',
      count: CLIENTES_RESPALDO.length,
      warning: 'No se pudo conectar con el API externo, usando datos de respaldo',
      error: error.message
    });
  }
}
