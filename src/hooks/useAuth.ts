'use client';
import { useCallback, useEffect, useState } from 'react';

type AuthUser = {
  id: number;
  username?: string;
  email: string;
  name: string;
  role: 'user' | 'worker' | 'admin' | 'super_admin';
  userType: 'local' | 'oauth';
};

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me', { cache: 'no-store' });
      const data = await response.json();
      setUser(data?.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    window.location.href = '/login';
  }, []);

  const role = user?.role ?? 'user';

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: role === 'admin' || role === 'super_admin',
    isWorker: role === 'worker' || role === 'admin' || role === 'super_admin',
    logout,
    refreshSession,
  };
}
