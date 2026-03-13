
import { logout } from './authService';

const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL;

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}/api${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Global 401 handling
    logout();
    // Redirect logic usually happens via state change in App.tsx or window.location
    window.dispatchEvent(new CustomEvent('auth-unauthorized'));
    throw new Error('Unauthorized');
  }

  return response;
};
