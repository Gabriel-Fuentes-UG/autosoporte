// Test ultra detallado del problema de conectividad
const nodeFetch = require('node-fetch');
const https = require('https');

// FORZAR SSL inseguro
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

async function testConexion() {
  console.log('🧪 TEST DETALLADO DE CONECTIVIDAD\n');

  const apiUser = 'UsrRetailReebok';
  const apiPassword = 'AccesoRetailReebok2025@UnionGroup.Com';
  const basicAuth = Buffer.from(`${apiUser}:${apiPassword}`).toString('base64');
  const fullUrl = 'https://www.vectordelta.com.mx:81/UnionGroup/API/Query/MasterData/ClientesParaCodigosIC';

  console.log(`📋 Configuración:`);
  console.log(`   URL: ${fullUrl}`);
  console.log(`   Usuario: ${apiUser}`);
  console.log(`   NODE_TLS_REJECT_UNAUTHORIZED: ${process.env.NODE_TLS_REJECT_UNAUTHORIZED}`);
  console.log('');

  // Test 1: Sin agente personalizado
  console.log('TEST 1: Fetch sin agente personalizado...');
  try {
    const res1 = await nodeFetch(fullUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Accept': 'application/json'
      },
      timeout: 10000
    });
    console.log(`✅ ÉXITO: ${res1.status} ${res1.statusText}`);
    const data1 = await res1.json();
    console.log(`   Clientes: ${data1.length}\n`);
  } catch (err1) {
    console.log(`❌ FALLÓ: ${err1.message}\n`);
  }

  // Test 2: Con agente HTTPS personalizado
  console.log('TEST 2: Fetch con agente HTTPS personalizado...');
  try {
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false
    });
    
    const res2 = await nodeFetch(fullUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Accept': 'application/json'
      },
      agent: httpsAgent,
      timeout: 10000
    });
    console.log(`✅ ÉXITO: ${res2.status} ${res2.statusText}`);
    const data2 = await res2.json();
    console.log(`   Clientes: ${data2.length}\n`);
  } catch (err2) {
    console.log(`❌ FALLÓ: ${err2.message}\n`);
  }

  // Test 3: HTTPS request nativo de Node.js
  console.log('TEST 3: HTTPS request nativo de Node.js...');
  try {
    await new Promise((resolve, reject) => {
      const url = new URL(fullUrl);
      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method: 'GET',
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Accept': 'application/json'
        },
        rejectUnauthorized: false
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          console.log(`✅ ÉXITO: ${res.statusCode} ${res.statusMessage}`);
          const parsed = JSON.parse(data);
          console.log(`   Clientes: ${parsed.length}\n`);
          resolve();
        });
      });

      req.on('error', (err) => {
        console.log(`❌ FALLÓ: ${err.message}\n`);
        reject(err);
      });

      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('Timeout'));
      });

      req.end();
    });
  } catch (err3) {
    console.log(`❌ FALLÓ: ${err3.message}\n`);
  }
}

testConexion();