const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || 'https://futuretrace-server.onrender.com';

const normalizeUser = (user: any) => {
  if (!user) return null;
  return {
    ...user,
    name: user.full_name || user.name,
    avatar: user.avatar_url || user.avatar,
    // Ensure id is a string
    id: user.id || user._id?.toString()
  };
};

export const login = async (email: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Đăng nhập thất bại');
  }

  const data = await response.json();
  const user = normalizeUser(data.user);
  localStorage.setItem('token', data.accessToken);
  localStorage.setItem('user', JSON.stringify(user));
  // Removed futuretrace_auth as we now use token as source of truth
  return { ...data, user };
};

export const register = async (userData: any) => {
  const { email, password, fullName, role } = userData;
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      full_name: fullName,
      role
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Đăng ký thất bại');
  }

  const data = await response.json();
  const user = normalizeUser(data.user);
  localStorage.setItem('token', data.accessToken);
  localStorage.setItem('user', JSON.stringify(user));
  return { ...data, user };
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('futuretrace_auth');
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const getUserProfile = async () => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found');

  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('Could not fetch user profile');
  }

  const data = await response.json();
  return normalizeUser(data);
};
