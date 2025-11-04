'use client';

import { ReactNode } from 'react';
import ICThemeProvider from '@/components/ICThemeProvider';
import { AuthProvider } from '@/contexts/AuthContext';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ICThemeProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ICThemeProvider>
  );
}
