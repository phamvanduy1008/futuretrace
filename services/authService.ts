const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || 'https://futuretrace-server.onrender.com';

const normalizeUser = (user: any) => {
  if (!user) return null;
  const tokenFree = user.token_free ?? user.token ?? 0;
  const tokenPremium = user.token_premium ?? 0;
  return {
    ...user,
    name: user.full_name || user.name,
    avatar: user.avatar_url || user.avatar,
    // Ensure id is a string
    id: user.id || user._id?.toString(),
    token: user.token ?? tokenFree + tokenPremium,
    token_free: tokenFree,
    token_premium: tokenPremium,
    code_invite: user.code_invite,
    invite_redeemed: !!user.invite_redeemed,
    premium_create_date: user.premium_create_date,
    premium_due_date: user.premium_due_date,
    premium_last_token_reset_date: user.premium_last_token_reset_date
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
  const user = normalizeUser(data);
  localStorage.setItem('user', JSON.stringify(user));
  return user;
};

export const updateProfile = async (profileData: { full_name?: string, avatar_url?: string, bio?: string }) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found');

  const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Cập nhật thông tin thất bại');
  }

  const data = await response.json();
  const user = normalizeUser(data);
  localStorage.setItem('user', JSON.stringify(user));
  return user;
};

export const changePassword = async (currentPassword: string, newPassword: string) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found');

  const response = await fetch(`${API_BASE_URL}/api/auth/password`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Đổi mật khẩu thất bại');
  }

  return response.json();
};

export const redeemInviteCode = async (codeInvite: string) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found');

  const response = await fetch(`${API_BASE_URL}/api/auth/redeem-invite`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ code_invite: codeInvite }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Không thể nhập mã mời');
  }

  const user = normalizeUser(data.user);
  localStorage.setItem('user', JSON.stringify(user));
  return { ...data, user };
};
