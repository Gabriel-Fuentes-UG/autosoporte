import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function verifyPassword() {
  const email = 'admin@uniongroup.mx';
  const password = 'SUPERVISORX#413017581';

  try {
    // Buscar usuario
    const user = await prisma.iC_Users.findUnique({
      where: { email }
    });

    if (!user) {
      console.log('❌ Usuario no encontrado');
      return;
    }

    console.log('👤 Usuario encontrado:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Password Hash: ${user.password_hash.substring(0, 20)}...`);
    console.log('');

    // Verificar contraseña
    const isMatch = await bcrypt.compare(password, user.password_hash);
    console.log(`🔑 Password "${password}"`);
    console.log(`   Match: ${isMatch ? '✅ SÍ' : '❌ NO'}`);
    console.log('');

    if (!isMatch) {
      console.log('🔄 Regenerando hash de contraseña...');
      const newHash = await bcrypt.hash(password, 12);
      console.log(`   Nuevo hash: ${newHash.substring(0, 20)}...`);
      
      // Actualizar en BD
      await prisma.iC_Users.update({
        where: { id: user.id },
        data: { password_hash: newHash }
      });
      
      console.log('✅ Password actualizado en la base de datos');
      
      // Verificar de nuevo
      const verifyAgain = await bcrypt.compare(password, newHash);
      console.log(`   Verificación: ${verifyAgain ? '✅ OK' : '❌ FALLO'}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyPassword();
