'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import ExecutiveLayout from '@/components/layout/ExecutiveLayout';
import CodigosIC from '@/components/tools/CodigosIC';

export default function AdminCodigosICPage() {
  return (
    <AuthProvider>
      <ExecutiveLayout>
        <CodigosIC />
      </ExecutiveLayout>
    </AuthProvider>
  );
}
