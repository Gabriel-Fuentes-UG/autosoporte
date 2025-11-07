// Test de conexión al API externo
const fetch = require('node-fetch');
const https = require('https');

async function testExternalAPI() {
  console.log('🧪 Probando conexión al API externo...\n');

  // Credenciales desde .env
  const apiUser = 'UsrWhlsReebok';
  const apiPassword = 'AccesoWhslReebok2025@UnionGroup.Com';
  const baseUrl = 'https://www.vectordelta.com.mx:81';
  const endpoint = '/UnionGroup/API/Query/MasterData/ClientesParaCodigosIC';
  const fullUrl = `${baseUrl}${endpoint}`;

  console.log('📋 Detalles de la conexión:');
  console.log(`  URL: ${fullUrl}`);
  console.log(`  Usuario: ${apiUser}`);
  console.log(`  Password: ${apiPassword.substring(0, 8)}...`);
  console.log('');

  try {
    // Crear autenticación básica
    const basicAuth = Buffer.from(`${apiUser}:${apiPassword}`).toString('base64');
    
    console.log('🔄 Intentando conexión...');
    
    // Agent para ignorar certificados SSL
    const agent = new https.Agent({
      rejectUnauthorized: false
    });

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${basicAuth}`,
        'User-Agent': 'ReebokSoporte/1.0'
      },
      agent: agent,
      timeout: 15000 // 15 segundos
    });

    console.log(`📊 Respuesta del servidor:`);
    console.log(`  Status: ${response.status} ${response.statusText}`);
    console.log(`  Headers:`, Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const data = await response.text();
      console.log(`  Contenido (primeros 500 chars): ${data.substring(0, 500)}`);
      
      try {
        const jsonData = JSON.parse(data);
        console.log(`  ✅ JSON válido - Registros: ${Array.isArray(jsonData) ? jsonData.length : 'No es array'}`);
      } catch (e) {
        console.log(`  ⚠️ Respuesta no es JSON válido`);
      }
    } else {
      const errorText = await response.text();
      console.log(`  ❌ Error: ${errorText}`);
    }

  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    
    if (error.code) {
      console.log(`  Código de error: ${error.code}`);
    }
    
    if (error.message.includes('timeout')) {
      console.log('  🕒 El servidor tardó más de 15 segundos en responder');
    }
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('  🌐 No se pudo resolver el nombre del servidor');
    }
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('  🚫 El servidor rechazó la conexión');
    }
    
    if (error.message.includes('certificate')) {
      console.log('  🔒 Problema con el certificado SSL');
    }
  }
}

testExternalAPI();