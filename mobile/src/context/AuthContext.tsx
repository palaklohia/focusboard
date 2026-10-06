import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { api, ApiError, setExpiredHandler, tokenStore } from '../lib/api';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  loading: boolean;
  bootError: string;
  notice: string;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearNotice: () => void;
  retryBoot: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [bootError, setBootError] = useState('');
  const [notice, setNotice] = useState('');

  // When any request finds the token expired, send the user back to login with a message
  useEffect(() => {
    setExpiredHandler((message) => {
      setUser(null);
      setNotice(message);
    });
    return () => setExpiredHandler(null);
  }, []);

  const boot = useCallback(async () => {
    setLoading(true);
    setBootError('');
    try {
      const token = await tokenStore.get();
      if (token) {
        const r = await api<{ user: User }>('/auth/me');
        setUser(r.user);
      }
    } catch (e) {
      // A 401 is already handled (token cleared, notice set). Only offline needs a retry screen.
      if (e instanceof ApiError && e.status === 0) setBootError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    boot();
  }, [boot]);

  const login = useCallback(async (email: string, password: string) => {
    const r = await api<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: { email, password },
      auth: false,
    });
    await tokenStore.set(r.token);
    setNotice('');
    setUser(r.user);
  }, []);

  const register = useCallback(async (fullName: string, email: string, password: string) => {
    const r = await api<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: { fullName, email, password },
      auth: false,
    });
    await tokenStore.set(r.token);
    setNotice('');
    setUser(r.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api('/auth/logout', { method: 'POST' });
    } catch {
      // Log out locally even if the server can't be reached
    }
    await tokenStore.clear();
    setUser(null);
  }, []);

  const clearNotice = useCallback(() => setNotice(''), []);

  const value = useMemo(
    () => ({ user, loading, bootError, notice, login, register, logout, clearNotice, retryBoot: boot }),
    [user, loading, bootError, notice, login, register, logout, clearNotice, boot],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
