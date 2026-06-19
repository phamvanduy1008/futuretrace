const getApiBaseUrl = () => {
  const base = (import.meta.env.VITE_API_BASE_URL || 'https://futuretrace-server.onrender.com').replace(/\/$/, '');
  return base.endsWith('/api') ? base : `${base}/api`;
};

const API_BASE_URL = getApiBaseUrl();

export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

async function parseResponse(response) {
  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new ApiError(payload?.message || 'Yeu cau that bai.', response.status, payload);
  }

  return payload;
}

export function createAdminApi({
  getAccessToken,
  getRefreshToken,
  onAuthUpdate,
  onUnauthorized,
}) {
  let refreshPromise = null;

  const refreshAdminToken = async () => {
    const currentRefreshToken = getRefreshToken();
    if (!currentRefreshToken) {
      throw new ApiError('Phien dang nhap da het han.', 401);
    }

    if (!refreshPromise) {
      refreshPromise = fetch(`${API_BASE_URL}/admin/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: currentRefreshToken }),
      })
        .then(parseResponse)
        .then((data) => {
          onAuthUpdate(data);
          return data;
        })
        .finally(() => {
          refreshPromise = null;
        });
    }

    return refreshPromise;
  };

  const request = async (path, options = {}, retry = true) => {
    const token = getAccessToken();
    const headers = {
      ...(options.headers || {}),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    if (options.body && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    try {
      const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers,
      });

      return await parseResponse(response);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401 && retry && getRefreshToken()) {
        try {
          await refreshAdminToken();
          return await request(path, options, false);
        } catch (refreshError) {
          onUnauthorized();
          throw refreshError;
        }
      }

      if (error instanceof ApiError && error.status === 401) {
        onUnauthorized();
      }

      throw error;
    }
  };

  return {
    login: (email, password) =>
      request('/admin/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }, false),

    getCurrentAdmin: () => request('/admin/auth/me', { method: 'GET' }),

    logout: (refreshToken) =>
      request('/admin/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      }, false),

    getDashboardOverview: () => request('/admin/dashboard/overview', { method: 'GET' }),

    getUsers: (params) =>
      request(`/admin/users?${new URLSearchParams(params).toString()}`, { method: 'GET' }),

    getUserDetail: (userId) => request(`/admin/users/${userId}`, { method: 'GET' }),

    updateUserStatus: (userId, status, reason) =>
      request(`/admin/users/${userId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, reason }),
      }),

    adjustUserTokens: (userId, amount, reason) =>
      request(`/admin/users/${userId}/tokens`, {
        method: 'POST',
        body: JSON.stringify({ amount, reason }),
      }),

    getSimulations: (params) =>
      request(`/admin/simulations?${new URLSearchParams(params).toString()}`, { method: 'GET' }),

    getSimulationDetail: (simulationId) => request(`/admin/simulations/${simulationId}`, { method: 'GET' }),

    getPremiumAnalyses: (params) =>
      request(`/admin/premium-analyses?${new URLSearchParams(params).toString()}`, { method: 'GET' }),

    getPremiumAnalysisDetail: (analysisId) => request(`/admin/premium-analyses/${analysisId}`, { method: 'GET' }),

    getCommunityPosts: (params) =>
      request(`/admin/community/posts?${new URLSearchParams(params).toString()}`, { method: 'GET' }),

    getCommunityPostDetail: (postId) => request(`/admin/community/posts/${postId}`, { method: 'GET' }),

    updateCommunityPostStatus: (postId, status, reason) =>
      request(`/admin/community/posts/${postId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, reason }),
      }),

    getAiLogs: (params) =>
      request(`/admin/ai/logs?${new URLSearchParams(params).toString()}`, { method: 'GET' }),

    getPrompts: (params) =>
      request(`/admin/prompts?${new URLSearchParams(params).toString()}`, { method: 'GET' }),

    releasePrompt: (promptId, reason) =>
      request(`/admin/prompts/${promptId}/release`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),

    rollbackPrompt: (promptId, reason) =>
      request(`/admin/prompts/${promptId}/rollback`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),

    getSettings: () => request('/admin/settings', { method: 'GET' }),

    updateSettingsGroup: (groupKey, payload) =>
      request(`/admin/settings/${groupKey}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),

    getPayments: (params) =>
      request(`/admin/payments?${new URLSearchParams(params).toString()}`, { method: 'GET' }),
  };
}
