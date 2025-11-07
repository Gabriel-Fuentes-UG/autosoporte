// Simple auth diagnostic script
const { prisma } = require('../src/lib/prisma.ts');

async function diagnoseAuth() {
  console.log('🔍 Diagnosing Authentication Issues...\n');

  try {
    // Check if user exists and is active
    const users = await prisma.iC_Users.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        is_active: true,
        created_at: true
      }
    });

    console.log('📊 Current Users in Database:');
    users.forEach(user => {
      console.log(`  - ID: ${user.id}, Email: ${user.email}, Username: ${user.username}, Role: ${user.role}, Active: ${user.is_active}`);
    });

    // Check specifically for Gabriel
    const gabriel = await prisma.iC_Users.findFirst({
      where: { email: 'gabriel.fuentes@uniongroup.mx' },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        is_active: true,
        password_hash: true
      }
    });

    if (gabriel) {
      console.log('\n👤 Gabriel User Details:');
      console.log(`  - ID: ${gabriel.id} (this should be the auth_token value)`);
      console.log(`  - Email: ${gabriel.email}`);
      console.log(`  - Username: ${gabriel.username}`);
      console.log(`  - Role: ${gabriel.role}`);
      console.log(`  - Active: ${gabriel.is_active}`);
      console.log(`  - Has Password: ${gabriel.password_hash ? 'Yes' : 'No'}`);
    } else {
      console.log('\n❌ Gabriel user not found!');
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Database Error:', error);
    await prisma.$disconnect();
  }
}

diagnoseAuth();