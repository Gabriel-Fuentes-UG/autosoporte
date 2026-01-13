import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

async function createAdminUser() {
  try {
    console.log('🚀 Iniciando configuración inicial de la base de datos...');
    
    // Verificar conexión
    await prisma.$connect();
    console.log('✅ Conexión a base de datos establecida');
    
    // Verificar si ya existe un usuario admin
    const existingAdmin = await prisma.iC_Users.findUnique({
      where: { username: 'admin' }
    });

    if (existingAdmin) {
      console.log('ℹ️ El usuario admin ya existe');
      console.log('� Email: admin@reebok.com');
      console.log('🔑 Contraseña: SUPERVISORX#413017581');
      return existingAdmin;
    }

    // Crear usuario admin
    console.log('📝 Creando usuario administrador...');
    const hashedPassword = await bcrypt.hash('SUPERVISORX#413017581', 12);
    
    const admin = await prisma.iC_Users.create({
      data: {
        username: 'admin',
        email: 'admin@reebok.com',
        password_hash: hashedPassword,
        role: 'admin'
      }
    });

    console.log('✅ Usuario administrador creado exitosamente!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 CREDENCIALES DE ADMINISTRADOR');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('� Email: admin@reebok.com');
    console.log('🔑 Contraseña: admin123');
    console.log('🆔 ID:', admin.id);
    console.log('🎯 Rol:', admin.role);
    console.log('📅 Creado:', admin.created_at);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    return admin;
    
  } catch (error) {
    console.error('❌ Error en configuración inicial:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Conexión cerrada');
  }
}

async function seedDatabase() {
  try {
    console.log('🌱 Iniciando seed de la base de datos...');
    
    await createAdminUser();
    
    // Aquí puedes agregar más datos de seed si necesitas
    console.log('✅ Seed completado exitosamente');
    
  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  seedDatabase();
}

export { createAdminUser, seedDatabase };