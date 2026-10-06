import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { api, tokenStore } from '../lib/api';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  loading: boolean;
  notice: string;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearNotice: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(() => !!tokenStore.get());
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const onExpired = (e: Event) => {
      setUser(null);
      setNotice((e as CustomEvent<string>).detail);
    };
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, []);

  useEffect(() => {
    if (!tokenStore.get()) return;
    api<{ user: User }>('/auth/me')
      .then((r) => setUser(r.user))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const r = await api<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: { email, password },
      auth: false,
    });
    tokenStore.set(r.token);
    setNotice('');
    setUser(r.user);
  }, []);

  const register = useCallback(async (fullName: string, email: string, password: string) => {
    const r = await api<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: { fullName, email, password },
      auth: false,
    });
    tokenStore.set(r.token);
    setNotice('');
    setUser(r.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api('/auth/logout', { method: 'POST' });
    } catch {
      // Even if the server is unreachable, we still log the user out locally
    }
    tokenStore.clear();
    setUser(null);
  }, []);

  const clearNotice = useCallback(() => setNotice(''), []);

  const value = useMemo(
    () => ({ user, loading, notice, login, register, logout, clearNotice }),
    [user, loading, notice, login, register, logout, clearNotice],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
