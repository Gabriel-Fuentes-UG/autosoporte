/**
 * Script para probar la API user/logs con autenticación simulada
 */

async function testUserLogsWithAuth() {
  try {
    console.log('🧪 Probando API de user/logs con ID de Gabriel...\n');
    
    // Gabriel Fuentes Duarte tiene ID: 4 según nuestro diagnóstico
    const gabrielId = '4';
    
    // Simular una petición con el header de cookie
    const response = await fetch('http://localhost:3000/ReebokSoporte/api/user/logs', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `auth_token=${gabrielId}`
      }
    });
    
    console.log(`📊 Status: ${response.status}`);
    console.log(`📊 Status Text: ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Respuesta exitosa:');
      console.log(`   Success: ${data.success}`);
      console.log(`   Total logs: ${data.data?.logs?.length || 0}`);
      
      if (data.data?.logs?.length > 0) {
        console.log('\n📋 Primeros 3 logs:');
        data.data.logs.slice(0, 3).forEach((log: any) => {
          console.log(`   ID: ${log.id} | Cliente: ${log.cliente} | Status: ${log.status}`);
        });
      }
    } else {
      const error = await response.text();
      console.log('❌ Error de respuesta:', error);
    }
    
  } catch (error) {
    console.error('❌ Error de conexión:', error);
  }
}

testUserLogsWithAuth();