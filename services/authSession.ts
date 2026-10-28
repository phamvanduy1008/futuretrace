/**
 * Quản lý phiên đăng nhập: access token ngắn hạn (30 phút) + refresh token xoay vòng (30 ngày).
 *
 * installAuthInterceptor() bọc window.fetch: mọi request tới backend nhận 401 TOKEN_EXPIRED
 * sẽ tự gọi /api/auth/refresh (một lần cho nhiều request đồng thời) rồi gửi lại request.
 * Nhờ vậy các service đang dùng fetch trực tiếp không cần sửa từng chỗ.
 */
const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || 'https://futuretrace-server.onrender.com';

const ACCESS_KEY = 'token';
const REFRESH_KEY = 'refreshToken';

export const storeSession = (accessToken?: string, refreshToken?: string) => {
  if (accessToken) localStorage.setItem(ACCESS_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
};

export const clearSession = () => {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem('futuretrace_refresh_token');
};

let refreshInFlight: Promise<string | null> | null = null;

const refreshAccessToken = (nativeFetch: typeof fetch): Promise<string | null> => {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      const refreshToken = localStorage.getItem(REFRESH_KEY) || localStorage.getItem('futuretrace_refresh_token');
      if (!refreshToken) return null;
      try {
        const res = await nativeFetch(`${API_BASE_URL}/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        if (!res.ok) return null;
        const data = await res.json();
        storeSession(data.accessToken, data.refreshToken);
        return data.accessToken as string;
      } catch {
        return null;
      }
    })().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
};

const isAuthEndpoint = (url: string) => /\/auth\/(refresh|login|register|google)/.test(url);

const withAuthHeader = (init: RequestInit | undefined, token: string): RequestInit => {
  const headers = new Headers(init?.headers || {});
  headers.set('Authorization', `Bearer ${token}`);
  return { ...init, headers };
};

export const installAuthInterceptor = () => {
  if ((window as any).__ftAuthInterceptor) return;
  (window as any).__ftAuthInterceptor = true;
  const nativeFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const response = await nativeFetch(input, init);
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    const hadAuth = new Headers(init?.headers || {}).has('Authorization');

    if (response.status !== 401 || !url.startsWith(API_BASE_URL) || isAuthEndpoint(url) || !hadAuth || input instanceof Request) {
      return response;
    }

    const body = await response.clone().json().catch(() => ({}));
    if (body?.code !== 'TOKEN_EXPIRED') return response;

    const newToken = await refreshAccessToken(nativeFetch);
    if (!newToken) {
      clearSession();
      localStorage.removeItem('user');
      window.dispatchEvent(new CustomEvent('auth-unauthorized'));
      return response;
    }
    return nativeFetch(input, withAuthHeader(init, newToken));
  };
};
