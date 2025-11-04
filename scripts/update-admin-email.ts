import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateAdmin() {
  try {
    const updated = await prisma.iC_Users.update({
      where: { username: 'admin' },
      data: { email: 'admin@reebok.com' }
    });
    
    console.log('✅ Email actualizado');
    console.log('📧 Email: admin@reebok.com');
    console.log('🔑 Contraseña: admin123');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAdmin();
