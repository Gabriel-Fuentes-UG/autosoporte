const bcrypt = require('bcryptjs');

async function createAdminUser() {
  // Simulamos lo que haría el endpoint de creación de usuarios
  const username = 'admin';
  const password = 'admin123'; // Contraseña inicial
  const role = 'admin';
  
  const hash = await bcrypt.hash(password, 10);
  
  console.log('Usuario: admin');
  console.log('Contraseña: admin123');
  console.log('Hash para insertar en DB:', hash);
  console.log('');
  console.log('SQL para insertar:');
  console.log(`INSERT INTO dbo.IC_Users (username, password_hash, role) VALUES ('${username}', '${hash}', '${role}');`);
}

createAdminUser().catch(console.error);