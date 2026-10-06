import * as SecureStore from 'expo-secure-store';

// 10.0.2.2 is how the Android emulator reaches your Mac's localhost
const API_URL: string = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:4000/api';
const TOKEN_KEY = 'focusboard_token';

// Android Keystore / iOS Keychain via expo-secure-store
export const tokenStore = {
  get: () => SecureStore.getItemAsync(TOKEN_KEY),
  set: (token: string) => SecureStore.setItemAsync(TOKEN_KEY, token),
  clear: () => SecureStore.deleteItemAsync(TOKEN_KEY),
};

export interface FieldError {
  field: string;
  message: string;
}

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: FieldError[];

  constructor(status: number, message: string, code?: string, details?: FieldError[]) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

let expiredHandler: ((message: string) => void) | null = null;
export function setExpiredHandler(fn: ((message: string) => void) | null) {
  expiredHandler = fn;
}

interface Options {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  auth?: boolean;
}

export function buildQuery(params: Record<string, string | undefined>): string {
  const parts = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => encodeURIComponent(k) + '=' + encodeURIComponent(v as string));
  return parts.length ? '?' + parts.join('&') : '';
}

export async function api<T>(path: string, { method = 'GET', body, auth = true }: Options = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = await tokenStore.get();
    if (token) headers.Authorization = 'Bearer ' + token;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  let res: Response;
  try {
    res = await fetch(API_URL + path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch {
    throw new ApiError(0, 'No connection to the server. Check your internet and try again.', 'NETWORK');
  } finally {
    clearTimeout(timer);
  }

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const err = data?.error;
    const code: string | undefined = err?.code;
    if (auth && res.status === 401 && (code === 'TOKEN_EXPIRED' || code === 'INVALID_TOKEN' || code === 'NO_TOKEN')) {
      await tokenStore.clear();
      expiredHandler?.(code === 'TOKEN_EXPIRED' ? err.message : 'Please log in to continue.');
    }
    throw new ApiError(res.status, err?.message ?? 'Something went wrong', code, err?.details);
  }

  return data as T;
}
