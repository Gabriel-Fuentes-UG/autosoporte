/**
 * Script para probar la API de user/logs
 */

async function testUserLogsAPI() {
  try {
    console.log('🧪 Probando API de user/logs...\n');
    
    // Intentar hacer request a la API
    const response = await fetch('http://localhost:3000/ReebokSoporte/api/user/logs?page=0&rowsPerPage=5', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Nota: En una prueba real necesitaríamos las cookies de autenticación
    });
    
    console.log(`📊 Status: ${response.status}`);
    console.log(`📊 Status Text: ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Respuesta exitosa:', data);
    } else {
      const error = await response.text();
      console.log('❌ Error de respuesta:', error);
      
      if (response.status === 401) {
        console.log('💡 Error 401 esperado: La API requiere autenticación');
        console.log('💡 Esto significa que la ruta está funcionando correctamente');
      }
    }
    
  } catch (error) {
    console.error('❌ Error de conexión:', error);
    console.log('💡 Esto puede indicar que el servidor no está ejecutándose');
  }
}

testUserLogsAPI();