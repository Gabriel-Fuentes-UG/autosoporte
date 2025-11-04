'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import ExecutiveLayout from '@/components/layout/ExecutiveLayout';
import UserHome from '@/components/dashboard/UserHome';

export default function UserHomePage() {
  return (
    <AuthProvider>
      <ExecutiveLayout>
        <UserHome />
      </ExecutiveLayout>
    </AuthProvider>
  );
}
