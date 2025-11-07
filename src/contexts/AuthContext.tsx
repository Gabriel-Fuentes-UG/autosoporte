'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserSession, ModuleAccess } from '@/types/system';
import { getNavigationModules } from '@/lib/module-registry-simple';
import { ROLE_PERMISSIONS } from '@/lib/permissions';
import { apiPath, pagePath } from '@/lib/api-path';

interface AuthContextType {
  user: User | null;
  session: UserSession | null;
  login: (username: string, password: string) => Promise<{ success: boolean; role?: string }>;
  logout: () => void;
  isLoading: boolean;
  availableModules: ModuleAccess[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [availableModules, setAvailableModules] = useState<any[]>([]);

  useEffect(() => {
    // Verificar sesión con el servidor
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await fetch(apiPath('/api/auth/session'));
      const data = await response.json();

      if (data.user) {
        initializeSession(data.user);
      }
    } catch (error) {
      console.error('Error checking session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeSession = (userData: User) => {
    const userPermissions = ROLE_PERMISSIONS[userData.role] || [];
    const userModules = getNavigationModules(userData);
    
    const userSession: UserSession = {
      user: userData,
      permissions: userPermissions.map(permissionId => ({
        id: permissionId,
        name: permissionId.replace(':', ' ').replace('_', ' '),
        description: `Permiso ${permissionId}`,
        resource: permissionId.split(':')[0],
        action: permissionId.split(':')[1] as any
      })),
      modules: userModules.map(module => ({
        moduleId: module.id,
        moduleName: module.name,
        hasAccess: module.enabled,
        permissions: []
      }))
    };

    setUser(userData);
    setSession(userSession);
    setAvailableModules(userModules);
  };

  const login = async (username: string, password: string): Promise<{ success: boolean; role?: string }> => {
    setIsLoading(true);
    try {
      const response = await fetch(apiPath('/api/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success && data.user) {
        const userData: User = {
          id: data.user.id,
          username: data.user.username,
          role: data.user.role,
          created_at: new Date(),
          isActive: true
        };

        localStorage.setItem('user', JSON.stringify(userData));
        initializeSession(userData);
        return { success: true, role: data.user.role };
      } else {
        console.error('Login failed:', data.error);
        throw new Error(data.error || 'Error de autenticación');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch(apiPath('/api/auth/logout'), { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('user');
    setUser(null);
    setSession(null);
    setAvailableModules([]);
    
    // Forzar redirección inmediata
    window.location.href = apiPath('/login');
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      login,
      logout,
      isLoading,
      availableModules
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}