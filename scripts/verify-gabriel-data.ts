import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyGabrielData() {
  try {
    console.log('🔍 Verificando datos para Gabriel Fuentes Duarte...\n');
    
    // Obtener los logs de Gabriel
    const gabrielLogs = await prisma.iC_Logs.findMany({
      where: {
        user: 'Gabriel Fuentes Duarte'
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    console.log(`📊 Encontrados ${gabrielLogs.length} logs para Gabriel Fuentes Duarte:`);
    
    gabrielLogs.forEach(log => {
      console.log(`\n📋 Log ID: ${log.id}`);
      console.log(`   Folio: ${log.folio_interno}`);
      console.log(`   Cliente: ${log.cliente}`);
      console.log(`   Estado: ${log.status}`);
      console.log(`   Acción: ${log.action}`);
      console.log(`   Fecha: ${log.created_at}`);
    });

    // Obtener estadísticas por estado para Gabriel
    const gabrielStats = await prisma.iC_Logs.groupBy({
      by: ['status'],
      where: {
        user: 'Gabriel Fuentes Duarte'
      },
      _count: {
        status: true
      },
      orderBy: {
        status: 'asc'
      }
    });

    console.log('\n📈 Estadísticas de Gabriel por estado:');
    gabrielStats.forEach(stat => {
      console.log(`   ${stat.status}: ${stat._count.status} logs`);
    });

    console.log('\n✅ Verificación completada');
    console.log('💡 Ahora refresca la página "Mis Registros" para ver los datos con colores pasteles');
    
  } catch (error) {
    console.error('❌ Error al verificar datos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyGabrielData();