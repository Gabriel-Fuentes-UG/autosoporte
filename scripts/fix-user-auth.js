const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkAndFixUser() {
  console.log('🔧 Checking and fixing user authentication...\n');

  try {
    // Check if Gabriel exists
    let gabriel = await prisma.iC_Users.findFirst({
      where: { email: 'gabriel.fuentes@uniongroup.mx' }
    });

    if (!gabriel) {
      console.log('❌ User Gabriel not found. Creating...');
      
      const hashedPassword = await bcrypt.hash('password123', 10);
      gabriel = await prisma.iC_Users.create({
        data: {
          username: 'Gabriel Fuentes Duarte',
          email: 'gabriel.fuentes@uniongroup.mx',
          password_hash: hashedPassword,
          role: 'user',
          is_active: true
        }
      });
      console.log('✅ User Gabriel created successfully');
    } else {
      console.log('✅ User Gabriel found');
      
      // Update password to ensure it's correct
      const hashedPassword = await bcrypt.hash('password123', 10);
      await prisma.iC_Users.update({
        where: { id: gabriel.id },
        data: {
          password_hash: hashedPassword,
          is_active: true
        }
      });
      console.log('✅ Password updated and user activated');
    }

    // Show final user details
    const finalUser = await prisma.iC_Users.findFirst({
      where: { email: 'gabriel.fuentes@uniongroup.mx' },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        is_active: true
      }
    });

    console.log('\n👤 User Details:');
    console.log(`  ID: ${finalUser.id}`);
    console.log(`  Username: ${finalUser.username}`);
    console.log(`  Email: ${finalUser.email}`);
    console.log(`  Role: ${finalUser.role}`);
    console.log(`  Active: ${finalUser.is_active}`);
    
    console.log('\n🔑 Login Credentials:');
    console.log(`  Email: gabriel.fuentes@uniongroup.mx`);
    console.log(`  Password: password123`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndFixUser();