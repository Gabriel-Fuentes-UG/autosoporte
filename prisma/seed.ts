import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Datos del administrador desde variables de entorno
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@uniongroup.mx';
  const adminPassword = process.env.ADMIN_PASSWORD || 'SUPERVISORX#413017581';
  const adminUsername = process.env.ADMIN_USERNAME || 'ADMINISTRADOR';

  // Validar que las credenciales estén configuradas
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    console.warn('⚠️  ADVERTENCIA: Usando credenciales por defecto.');
    console.warn('   Para producción, configura las variables de entorno:');
    console.warn('   - ADMIN_EMAIL');
    console.warn('   - ADMIN_PASSWORD');
    console.warn('   - ADMIN_USERNAME (opcional)');
    console.warn('');
  }

  // Verificar si el admin ya existe (por email o username)
  const existingAdminByEmail = await prisma.iC_Users.findUnique({
    where: { email: adminEmail }
  });
  
  const existingAdminByUsername = await prisma.iC_Users.findUnique({
    where: { username: adminUsername }
  });

  const existingAdmin = existingAdminByEmail || existingAdminByUsername;

  if (existingAdmin) {
    console.log('⚠️  El usuario administrador ya existe.');
    console.log(`   ID: ${existingAdmin.id}`);
    console.log(`   Email actual: ${existingAdmin.email}`);
    console.log(`   Username actual: ${existingAdmin.username}`);
    console.log('');
    console.log('🔄 Actualizando usuario administrador...');
    
    // Hash de la nueva contraseña
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    
    // Actualizar usuario administrador
    const updatedAdmin = await prisma.iC_Users.update({
      where: { id: existingAdmin.id },
      data: {
        username: adminUsername,
        email: adminEmail,
        password_hash: passwordHash,
        role: 'admin',
        is_active: true,
        updated_at: new Date(),
      }
    });
    
    console.log('✅ Usuario administrador actualizado exitosamente:');
    console.log(`   ID: ${updatedAdmin.id}`);
    console.log(`   Username: ${updatedAdmin.username}`);
    console.log(`   Email: ${updatedAdmin.email}`);
    console.log(`   Role: ${updatedAdmin.role}`);
    console.log('');
    console.log('📝 Credenciales de acceso actualizadas:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Contraseña: ${adminPassword}`);
    return;
  }

  // Hash de la contraseña
  console.log('🔐 Generando hash de contraseña...');
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  // Crear usuario administrador
  const admin = await prisma.iC_Users.create({
    data: {
      username: adminUsername,
      email: adminEmail,
      password_hash: passwordHash,
      role: 'admin',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    }
  });

  console.log('✅ Usuario administrador creado exitosamente:');
  console.log(`   ID: ${admin.id}`);
  console.log(`   Username: ${admin.username}`);
  console.log(`   Email: ${admin.email}`);
  console.log(`   Role: ${admin.role}`);
  console.log('');
  console.log('📝 Credenciales de acceso:');
  console.log(`   Email: ${adminEmail}`);
  console.log(`   Contraseña: ${adminPassword}`);
  console.log('');
  console.log('⚠️  IMPORTANTE: Por seguridad, cambia la contraseña después del primer inicio de sesión.');
}

main()
  .catch((e) => {
    console.error('❌ Error ejecutando seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
