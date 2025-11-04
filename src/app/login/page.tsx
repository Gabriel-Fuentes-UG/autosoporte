'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';
import { apiPath } from '@/lib/api-path';

export default function LoginPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Verificar si ya está autenticado
    const checkAuth = async () => {
      try {
        const response = await fetch(apiPath('/api/auth/session'));
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            // Redirigir según el rol
            if (data.user.role === 'admin') {
              router.push('/admin/home');
            } else {
              router.push('/user/home');
            }
            return;
          }
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isChecking) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: '#f5f7fa'
      }}>
        <div>Cargando...</div>
      </div>
    );
  }

  return <LoginForm />;
}
