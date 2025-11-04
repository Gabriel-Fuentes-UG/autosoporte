'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import ExecutiveLayout from '@/components/layout/ExecutiveLayout';
import UserLogs from '@/components/user/UserLogs';

export default function UserLogsPage() {
  return (
    <AuthProvider>
      <ExecutiveLayout>
        <UserLogs />
      </ExecutiveLayout>
    </AuthProvider>
  );
}
