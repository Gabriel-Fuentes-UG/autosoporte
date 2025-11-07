// Test directo del API externo con node-fetch
const fetch = require('node-fetch');
const https = require('https');

// FORZAR SSL inseguro
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

async function testDirectAPI() {
  try {
    console.log('🧪 Test directo del API externo...\n');

    const apiUser = 'UsrWhlsReebok';
    const apiPassword = 'AccesoWhslReebok2025@UnionGroup.Com';
    const basicAuth = Buffer.from(`${apiUser}:${apiPassword}`).toString('base64');
    const fullUrl = 'https://www.vectordelta.com.mx:81/UnionGroup/API/Query/MasterData/ClientesParaCodigosIC';

    console.log(`🔗 URL: ${fullUrl}`);
    console.log(`🔑 Usuario: ${apiUser}`);
    console.log(`🔒 NODE_TLS_REJECT_UNAUTHORIZED = ${process.env.NODE_TLS_REJECT_UNAUTHORIZED}`);

    // Agente SSL super permisivo
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
      checkServerIdentity: () => undefined,
      secureProtocol: 'TLS_method',
      ciphers: 'ALL'
    });

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Accept': 'application/json',
        'User-Agent': 'ReebokSoporte/1.0'
      },
      agent: httpsAgent,
      timeout: 20000
    });

    console.log(`📊 Status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Éxito! Clientes obtenidos: ${data.length}`);
      console.log(`📋 Primeros 3 clientes:`);
      data.slice(0, 3).forEach((cliente, i) => {
        console.log(`  ${i+1}. ${cliente.CardName} (${cliente.CardCode})`);
      });
    } else {
      const errorText = await response.text();
      console.log(`❌ Error: ${errorText}`);
    }

  } catch (error) {
    console.error(`❌ Excepción: ${error.message}`);
    console.error(`📝 Tipo de error: ${error.name}`);
    if (error.code) {
      console.error(`🔢 Código: ${error.code}`);
    }
  }
}

testDirectAPI();