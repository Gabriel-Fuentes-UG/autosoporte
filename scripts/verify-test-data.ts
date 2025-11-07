import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyTestData() {
  try {
    console.log('🔍 Verificando datos de prueba...\n');
    
    // Obtener los logs de prueba
    const testLogs = await prisma.iC_Logs.findMany({
      where: {
        folio_interno: {
          startsWith: 'TEST-'
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    console.log(`📊 Encontrados ${testLogs.length} logs de prueba:`);
    
    testLogs.forEach(log => {
      console.log(`\n📋 Log ID: ${log.id}`);
      console.log(`   Usuario: ${log.user}`);
      console.log(`   Folio: ${log.folio_interno}`);
      console.log(`   Cliente: ${log.cliente}`);
      console.log(`   Estado: ${log.status}`);
      console.log(`   Fecha: ${log.created_at}`);
    });

    // Obtener estadísticas por estado
    const statusStats = await prisma.iC_Logs.groupBy({
      by: ['status'],
      _count: {
        status: true
      },
      orderBy: {
        status: 'asc'
      }
    });

    console.log('\n📈 Estadísticas por estado:');
    statusStats.forEach(stat => {
      console.log(`   ${stat.status}: ${stat._count.status} logs`);
    });

    console.log('\n✅ Verificación completada');
    
  } catch (error) {
    console.error('❌ Error al verificar datos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyTestData();