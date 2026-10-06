const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';
const TOKEN_KEY = 'focusboard_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
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

interface Options {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  auth?: boolean;
}

export async function api<T>(path: string, { method = 'GET', body, auth = true }: Options = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = tokenStore.get();
  if (auth && token) headers.Authorization = 'Bearer ' + token;

  let res: Response;
  try {
    res = await fetch(API_URL + path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'Cannot reach the server. Check your internet connection and try again.', 'NETWORK');
  }

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const err = data?.error;
    const code: string | undefined = err?.code;
    if (auth && res.status === 401 && (code === 'TOKEN_EXPIRED' || code === 'INVALID_TOKEN' || code === 'NO_TOKEN')) {
      tokenStore.clear();
      window.dispatchEvent(
        new CustomEvent('auth:expired', {
          detail: code === 'TOKEN_EXPIRED' ? err.message : 'Please log in to continue.',
        }),
      );
    }
    throw new ApiError(res.status, err?.message ?? 'Something went wrong', code, err?.details);
  }

  return data as T;
}
