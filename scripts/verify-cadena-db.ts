import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyDatabase() {
  console.log('🔍 Verificando estructura de la base de datos...\n');

  try {
    // Verificar usuarios
    const users = await prisma.iC_Users.findMany();
    console.log(`✅ Tabla IC_Users: ${users.length} registro(s)`);
    users.forEach(user => {
      console.log(`   - ${user.username} (${user.email}) - Role: ${user.role}`);
    });

    // Verificar logs
    const logs = await prisma.iC_Logs.findMany();
    console.log(`\n✅ Tabla IC_Logs: ${logs.length} registro(s)`);

    // Verificar códigos
    const codes = await prisma.iC_Codes.findMany();
    console.log(`✅ Tabla IC_Codes: ${codes.length} registro(s)`);

    console.log('\n🎉 Base de datos verificada exitosamente!');
    console.log(`📊 Base de datos: ${process.env.DB_NAME || 'CadenaDeSuministroDev'}`);
    
  } catch (error) {
    console.error('❌ Error al verificar la base de datos:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

verifyDatabase();
