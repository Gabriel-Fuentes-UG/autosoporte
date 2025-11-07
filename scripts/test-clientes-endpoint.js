// Test simple del endpoint de clientes
const https = require('https');

// Configurar Node.js para ignorar certificados SSL
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

async function testClientesEndpoint() {
  try {
    console.log('🧪 Probando endpoint de clientes...\n');

    const response = await fetch('http://localhost:3000/ReebokSoporte/api/clientes');
    const data = await response.json();

    console.log('📊 Resultado:');
    console.log(`  Success: ${data.success}`);
    console.log(`  Source: ${data.source}`);
    console.log(`  Count: ${data.count || (data.data ? data.data.length : 0)}`);
    console.log(`  Cached: ${data.cached || false}`);
    if (data.error) {
      console.log(`  Error: ${data.error}`);
    }
    if (data.warning) {
      console.log(`  Warning: ${data.warning}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testClientesEndpoint();