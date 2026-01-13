import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function verifyData() {
  try {
    console.log('🔍 Verificando datos en IC_Logs e IC_Codes...\n');

    // Contar total de logs
    const totalLogs = await prisma.iC_Logs.count();
    console.log(`📊 Total de logs: ${totalLogs}`);

    // Contar total de códigos
    const totalCodes = await prisma.iC_Codes.count();
    console.log(`📊 Total de códigos IC: ${totalCodes}\n`);

    // Obtener logs con sus códigos (primeros 10)
    const logsWithCodes = await prisma.iC_Logs.findMany({
      take: 10,
      orderBy: { id: 'desc' },
      include: {
        codes: true,
      },
    });

    console.log('📋 Últimos 10 logs con sus códigos:\n');
    logsWithCodes.forEach((log) => {
      console.log(`  Log ID: ${log.id}`);
      console.log(`  Usuario: ${log.user}`);
      console.log(`  Cliente: ${log.cliente || 'N/A'}`);
      console.log(`  Status: ${log.status}`);
      console.log(`  Códigos asociados: ${log.codes.length}`);
      if (log.codes.length > 0) {
        log.codes.forEach((code, idx) => {
          console.log(`    ${idx + 1}. ${code.producto} - ${code.codigo_ic}`);
        });
      }
      console.log('  ---');
    });

    // Verificar específicamente log_id 94
    console.log('\n🔎 Verificando específicamente log_id = 94:\n');
    const log94 = await prisma.iC_Logs.findUnique({
      where: { id: 94 },
      include: {
        codes: true,
      },
    });

    if (log94) {
      console.log(`✅ Log 94 existe:`);
      console.log(`  Usuario: ${log94.user}`);
      console.log(`  Cliente: ${log94.cliente || 'N/A'}`);
      console.log(`  Status: ${log94.status}`);
      console.log(`  Códigos: ${log94.codes.length}`);
      if (log94.codes.length > 0) {
        log94.codes.forEach((code, idx) => {
          console.log(`    ${idx + 1}. ${code.producto} - ${code.codigo_ic}`);
        });
      } else {
        console.log(`  ⚠️ No hay códigos asociados a este log`);
      }
    } else {
      console.log(`❌ Log 94 NO existe en la base de datos`);
    }

    // Buscar logs con códigos
    console.log('\n🔍 Buscando logs que SÍ tienen códigos asociados:\n');
    const logsWithCodesCount = await prisma.iC_Logs.findMany({
      where: {
        codes: {
          some: {},
        },
      },
      take: 5,
      include: {
        codes: true,
      },
    });

    if (logsWithCodesCount.length > 0) {
      console.log(`✅ Encontrados ${logsWithCodesCount.length} logs con códigos:`);
      logsWithCodesCount.forEach((log) => {
        console.log(`  Log ID: ${log.id} - ${log.codes.length} códigos`);
      });
    } else {
      console.log(`⚠️ NO se encontraron logs con códigos asociados`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyData();
