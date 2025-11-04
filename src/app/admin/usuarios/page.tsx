'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import ExecutiveLayout from '@/components/layout/ExecutiveLayout';
import UserManagement from '@/components/admin/UserManagement';

export default function AdminUsersPage() {
  return (
    <AuthProvider>
      <ExecutiveLayout>
        <UserManagement />
      </ExecutiveLayout>
    </AuthProvider>
  );
}
