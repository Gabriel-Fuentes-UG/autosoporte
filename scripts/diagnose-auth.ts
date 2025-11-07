/**
 * Script para diagnosticar el problema de autenticación
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function diagnoseAuthIssue() {
  try {
    console.log('🔍 Diagnosticando problema de autenticación...\n');
    
    // Buscar todos los usuarios
    const users = await prisma.iC_Users.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        is_active: true
      }
    });

    console.log('👥 Usuarios en la base de datos:');
    users.forEach(user => {
      console.log(`   ID: ${user.id} | Username: "${user.username}" | Email: ${user.email} | Role: ${user.role} | Active: ${user.is_active}`);
    });

    console.log('\n📋 Logs por usuario:');
    for (const user of users) {
      const logCount = await prisma.iC_Logs.count({
        where: { user: user.username }
      });
      console.log(`   "${user.username}": ${logCount} logs`);
    }

    // Buscar logs con username que contenga "Gabriel"
    const gabrielLogs = await prisma.iC_Logs.findMany({
      where: {
        user: { contains: 'Gabriel' }
      },
      select: {
        user: true,
        id: true,
        cliente: true,
        status: true
      }
    });

    console.log('\n🔍 Logs que contienen "Gabriel":');
    gabrielLogs.forEach(log => {
      console.log(`   User: "${log.user}" | ID: ${log.id} | Cliente: ${log.cliente} | Status: ${log.status}`);
    });

    console.log('\n✅ Diagnóstico completado');
    
  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
  } finally {
    await prisma.$disconnect();
  }
}

diagnoseAuthIssue();