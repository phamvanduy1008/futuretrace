const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || 'https://futuretrace-server.onrender.com';

const normalizeUser = (user: any) => {
  if (!user) return null;
  return {
    ...user,
    name: user.full_name || user.name,
    avatar: user.avatar_url || user.avatar,
    id: user.id || user._id?.toString(),
    token: user.token ?? 0,
    code_invite: user.code_invite,
    invite_redeemed: !!user.invite_redeemed,
    is_google_user: !!user.is_google_user,
    has_manual_password: user.has_manual_password !== false,
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

export const sendRegisterOtp = async (userData: any) => {
  const { email, password, fullName, role } = userData;
  const response = await fetch(`${API_BASE_URL}/api/auth/register/send-otp`, {
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
    throw new Error(error.message || 'Gửi mã xác thực thất bại');
  }

  return response.json();
};

export const verifyRegisterOtp = async (email: string, otp: string) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/register/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Xác thực thất bại');
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

  const body: any = { newPassword };
  if (currentPassword) {
    body.currentPassword = currentPassword;
  }

  const response = await fetch(`${API_BASE_URL}/api/auth/password`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Đổi mật khẩu thất bại');
  }

  const data = await response.json();
  // Update local user if server returns updated user
  if (data.user) {
    const user = normalizeUser(data.user);
    localStorage.setItem('user', JSON.stringify(user));
  }
  return data;
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
