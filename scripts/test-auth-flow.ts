import fetch from 'node-fetch';

async function testAuthFlow() {
  const baseURL = 'http://localhost:3000/ReebokSoporte';
  
  console.log('🧪 Testing Authentication Flow...\n');

  try {
    // Test 1: Login
    console.log('1. Testing Login...');
    const loginResponse = await fetch(`${baseURL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'gabriel.fuentes@uniongroup.mx', // Using the email we know exists
        password: 'password123' // The password we set in our tests
      }),
    });

    const loginData = await loginResponse.json();
    console.log('Login Response Status:', loginResponse.status);
    console.log('Login Response:', JSON.stringify(loginData, null, 2));
    
    // Extract cookies
    const cookies = loginResponse.headers.get('set-cookie');
    console.log('Set-Cookie Header:', cookies);

    if (!cookies) {
      console.log('❌ No cookies set in login response');
      return;
    }

    // Test 2: Session check with cookies
    console.log('\n2. Testing Session Check...');
    const sessionResponse = await fetch(`${baseURL}/api/auth/session`, {
      headers: {
        'Cookie': cookies
      }
    });

    const sessionData = await sessionResponse.json();
    console.log('Session Response Status:', sessionResponse.status);
    console.log('Session Response:', JSON.stringify(sessionData, null, 2));

    // Test 3: Direct database check
    console.log('\n3. Testing Direct Database Access...');
    const { prisma } = require('../src/lib/prisma');
    
    const user = await prisma.iC_Users.findFirst({
      where: { email: 'gabriel.fuentes@uniongroup.mx' },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        is_active: true
      }
    });
    
    console.log('Database User:', JSON.stringify(user, null, 2));
    
    await prisma.$disconnect();

  } catch (error) {
    console.error('❌ Test Error:', error);
  }
}

testAuthFlow();