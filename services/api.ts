
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Token management
const getToken = (): string | null => localStorage.getItem('futuretrace_token');
const setToken = (token: string) => localStorage.setItem('futuretrace_token', token);
const removeToken = () => localStorage.removeItem('futuretrace_token');

const getRefreshToken = (): string | null => localStorage.getItem('futuretrace_refresh_token');
const setRefreshToken = (token: string) => localStorage.setItem('futuretrace_refresh_token', token);
const removeRefreshToken = () => localStorage.removeItem('futuretrace_refresh_token');

export const getUser = () => {
  const stored = localStorage.getItem('futuretrace_user');
  if (stored) {
    try { return JSON.parse(stored); } catch { return null; }
  }
  return null;
};

const setUser = (user: any) => localStorage.setItem('futuretrace_user', JSON.stringify(user));
const removeUser = () => localStorage.removeItem('futuretrace_user');

export const isAuthenticated = (): boolean => !!getToken();

export const logout = () => {
  removeToken();
  removeRefreshToken();
  removeUser();
  localStorage.removeItem('futuretrace_auth');
};

// Base fetch with auth
const apiFetch = async (path: string, options: RequestInit = {}): Promise<Response> => {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response = await fetch(`${API_URL}${path}`, { ...options, headers });

  // Handle token expiry - try refresh
  if (response.status === 401) {
    const data = await response.json().catch(() => ({}));
    if (data.code === 'TOKEN_EXPIRED') {
      const refreshed = await refreshAuthToken();
      if (refreshed) {
        headers['Authorization'] = `Bearer ${getToken()}`;
        response = await fetch(`${API_URL}${path}`, { ...options, headers });
      } else {
        logout();
        window.location.hash = '#/login';
        throw new Error('Phiên đăng nhập đã hết hạn.');
      }
    }
  }

  return response;
};

const refreshAuthToken = async (): Promise<boolean> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    if (!res.ok) return false;
    const data = await res.json();
    setToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    return true;
  } catch {
    return false;
  }
};

// ==================== AUTH API ====================

export const apiLogin = async (email: string, password: string) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  
  setToken(data.accessToken);
  setRefreshToken(data.refreshToken);
  setUser(data.user);
  localStorage.setItem('futuretrace_auth', 'true');
  return data;
};

export const apiRegister = async (email: string, password: string, full_name: string, role: string) => {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, full_name, role })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  
  setToken(data.accessToken);
  setRefreshToken(data.refreshToken);
  setUser(data.user);
  localStorage.setItem('futuretrace_auth', 'true');
  return data;
};

export const apiGetMe = async () => {
  const res = await apiFetch('/auth/me');
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  setUser(data);
  return data;
};

// ==================== SIMULATION API ====================

export const apiCreateSimulation = async (simulationData: any, folderName?: string) => {
  const res = await apiFetch('/simulations', {
    method: 'POST',
    body: JSON.stringify({ ...simulationData, folderName })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

export const apiGetSimulations = async (page = 1, limit = 20, search = '') => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) params.append('search', search);
  const res = await apiFetch(`/simulations?${params}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

export const apiGetSimulation = async (id: string) => {
  const res = await apiFetch(`/simulations/${id}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

export const apiDeleteSimulation = async (id: string) => {
  const res = await apiFetch(`/simulations/${id}`, { method: 'DELETE' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

// ==================== COMMUNITY API ====================

export const apiGetCommunityPosts = async (page = 1, limit = 3, filter = 'all', q = '') => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit), filter });
  if (q) params.append('q', q);
  const res = await apiFetch(`/community/posts?${params}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

export const apiPublishToCommunity = async (postData: any) => {
  const res = await apiFetch('/community/posts', {
    method: 'POST',
    body: JSON.stringify(postData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

export const apiToggleLike = async (postId: string) => {
  const res = await apiFetch(`/community/posts/${postId}/like`, { method: 'POST' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

export const apiGetComments = async (postId: string) => {
  const res = await apiFetch(`/community/posts/${postId}/comments`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

export const apiAddComment = async (postId: string, content: string) => {
  const res = await apiFetch(`/community/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

// ==================== PREMIUM / PROGRESS API ====================

export const apiGeneratePremiumAnalysis = async (scenario: any, context?: any, timeframe?: number) => {
  const res = await apiFetch('/premium/analyze', {
    method: 'POST',
    body: JSON.stringify({ scenario, context, timeframe })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

export const apiPivotPremiumAnalysis = async (progressId: string, currentReport: any, completedMilestones: any[], feedback: string, context?: any, timeframe?: number) => {
  const res = await apiFetch('/premium/pivot', {
    method: 'POST',
    body: JSON.stringify({ progressId, currentReport, completedMilestones, feedback, context, timeframe })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

export const apiGetProgress = async () => {
  const res = await apiFetch('/premium/progress');
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

export const apiGetProgressById = async (id: string) => {
  const res = await apiFetch(`/premium/progress/${id}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

export const apiUpdateProgress = async (id: string, updates: any) => {
  const res = await apiFetch(`/premium/progress/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

export const apiDeleteProgress = async (id: string) => {
  const res = await apiFetch(`/premium/progress/${id}`, { method: 'DELETE' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

export const apiGetProgressByScenarioId = async (scenarioId: string) => {
  const res = await apiFetch(`/premium/progress/by-scenario/${scenarioId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};
