import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SharedHeader from '../components/SharedHeader';
import SharedFooter from '../components/SharedFooter';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { IconMapper } from '../components/IconMapper';
import { getCurrentUser, getUserProfile, updateProfile, changePassword, redeemInviteCode } from '../services/authService';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  // Profile Form State
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ text: '', type: '' });

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ text: '', type: '' });
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [isRedeemingInvite, setIsRedeemingInvite] = useState(false);
  const [inviteMsg, setInviteMsg] = useState({ text: '', type: '' });
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate('/login');
    } else {
      setUser(currentUser);
      setFullName(currentUser.name || '');
      setBio(currentUser.bio || '');
      if (currentUser.tier?.startsWith('premium') && currentUser.premium_due_date) {
        const diff = new Date(currentUser.premium_due_date).getTime() - Date.now();
        if (diff > 0 && diff <= 3 * 24 * 60 * 60 * 1000) {
          setShowRenewModal(true);
        }
      }
      getUserProfile()
        .then((freshUser) => {
          setUser(freshUser);
          setFullName(freshUser.name || '');
          setBio(freshUser.bio || '');
          if (freshUser.tier?.startsWith('premium') && freshUser.premium_due_date) {
            const diff = new Date(freshUser.premium_due_date).getTime() - Date.now();
            if (diff > 0 && diff <= 3 * 24 * 60 * 60 * 1000) {
              setShowRenewModal(true);
            }
          }
        })
        .catch(() => {});
    }
  }, [navigate]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileMsg({ text: '', type: '' });
    try {
      const updatedUser = await updateProfile({ full_name: fullName, bio });
      setUser(updatedUser);
      setProfileMsg({ text: 'Cập nhật thông tin thành công.', type: 'success' });
    } catch (err: any) {
      setProfileMsg({ text: err.message || 'Lỗi khi cập nhật.', type: 'error' });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg({ text: '', type: '' });
    setPasswordMsg({ text: '', type: '' });

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: 'Mật khẩu xác nhận không khớp.', type: 'error' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ text: 'Mật khẩu mới phải có ít nhất 6 ký tự.', type: 'error' });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordMsg({ text: 'Đổi mật khẩu thành công.', type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordMsg({ text: err.message || 'Lỗi khi đổi mật khẩu.', type: 'error' });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleRedeemInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCodeInput.trim()) return;
    setIsRedeemingInvite(true);
    setInviteMsg({ text: '', type: '' });

    try {
      const data = await redeemInviteCode(inviteCodeInput.trim());
      setUser(data.user);
      setInviteCodeInput('');
      setInviteMsg({ text: 'Nhập mã mời thành công. Bạn đã nhận thêm 5.000 token.', type: 'success' });
    } catch (err: any) {
      setInviteMsg({ text: err.message || 'Không thể nhập mã mời.', type: 'error' });
    } finally {
      setIsRedeemingInvite(false);
    }
  };

  const handleCopyInviteCode = async () => {
    if (!user?.code_invite) return;
    try {
      await navigator.clipboard.writeText(user.code_invite);
      setInviteMsg({ text: 'Đã sao chép mã mời.', type: 'success' });
    } catch {
      setInviteMsg({ text: 'Không thể sao chép mã mời tự động.', type: 'error' });
    }
  };

  if (!user) return null;

  const getUserInitials = () => {
    if (!user?.name) return 'ID';
    return user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const tokenFreeValue = Number(user.token_free ?? user.token ?? 0);
  const tokenPremiumValue = Number(user.token_premium || 0);
  const premiumActive = Boolean(user?.tier?.startsWith('premium') && user?.premium_due_date && new Date(user.premium_due_date).getTime() > now);
  const formatTokenCount = (value: number) => value.toLocaleString('vi-VN');
  const tokenFreeFill = Math.min(100, (tokenFreeValue / 30000) * 100);
  const tokenPremiumFill = Math.min(100, (tokenPremiumValue / 30000) * 100);

  const formatPremiumCountdown = () => {
    if (!user?.premium_due_date) return '';
    const diff = new Date(user.premium_due_date).getTime() - now;
    if (diff <= 0) return 'Đã hết hạn';
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    const hours = Math.floor((diff / (60 * 60 * 1000)) % 24);
    const minutes = Math.floor((diff / (60 * 1000)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return `${days} ngày ${hours} giờ ${minutes} phút ${seconds} giây`;
  };

  return (
    <AnimatedBackground className="min-h-screen bg-slate-50 font-sans selection:bg-blue-200">
      <SharedHeader />

      <main className="max-w-[1200px] mx-auto px-6 sm:px-10 py-12 lg:py-20 relative z-10 w-full">
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 font-display italic tracking-tight uppercase mb-4">
            Thông Tin Cá Nhân
          </h1>
          <p className="text-slate-500 font-medium max-w-2xl text-lg">
            Quản lý thông tin tài khoản và bảo mật của bạn.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* User Info Overview */}
          <div className="lg:col-span-4">
            <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-slate-200 shadow-xl p-8 flex flex-col items-center text-center">
              <div className="w-32 h-32 rounded-full overflow-hidden mb-6 border-4 border-white shadow-lg relative bg-slate-900 flex items-center justify-center text-white text-[3.5rem] font-black uppercase tracking-tighter">
                {(!user.avatar || user.avatar.includes('pravatar.cc')) ? (
                  getUserInitials()
                ) : (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                )}
              </div>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-1">
                {user.name}
              </h2>
              <p className="text-slate-500 font-medium mb-4">{user.email}</p>
              
              <button 
                onClick={() => navigate('/premium')}
                className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all hover:scale-105 ${
                  user.tier?.startsWith('premium')
                    ? 'bg-amber-50 text-amber-600 border-amber-100' 
                    : 'bg-blue-50 text-blue-600 border-blue-100'
                }`}
              >
                <IconMapper name="workspace_premium" className="text-sm" />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {user.tier?.startsWith('premium') ? 'Thành viên Premium' : 'Thành viên Tiêu chuẩn'}
                </span>
              </button>
              <div className="w-full mt-8 pt-8 border-t border-slate-100 space-y-5 text-left">
                <div className="hidden">
                  <p className="text-[9px] font-black uppercase tracking-widest text-blue-500 mb-2">Token hiện có</p>
                  <p className="text-3xl font-black text-slate-900">{Number(user.token || 0).toLocaleString('vi-VN')}</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="group relative p-5 bg-blue-50/80 border border-blue-100 rounded-2xl hover:border-blue-300 transition-all">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-blue-500 mb-2">Token Free</p>
                      </div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        {formatTokenCount(tokenFreeValue)} token
                      </div>
                    </div>
                    <div className="h-3 rounded-full bg-blue-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-500 transition-all duration-500"
                        style={{ width: `${tokenFreeFill}%` }}
                      />
                    </div>
                    <p className="mt-3 text-[10px] text-slate-500">Hiển thị theo chuẩn 30.000 token = 100%.</p>
                  </div>
                  <div className="group relative p-5 bg-amber-50/90 border border-amber-100 rounded-2xl hover:border-amber-300 transition-all">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-amber-500 mb-2">Token Premium</p>
                      </div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        {formatTokenCount(tokenPremiumValue)} token
                      </div>
                    </div>
                    <div className="h-3 rounded-full bg-amber-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-amber-500 transition-all duration-500"
                        style={{ width: `${tokenPremiumFill}%` }}
                      />
                    </div>
                    <p className="mt-3 text-[10px] text-slate-500">Giới hạn 30.000 token premium/ngày.</p>
                  </div>
                </div>

                {user.tier?.startsWith('premium') && user.premium_due_date && (
                  <div className="p-5 bg-slate-950 text-white rounded-2xl">
                    <p className="text-[9px] font-black uppercase tracking-widest text-amber-300 mb-2">Thời gian Premium còn lại</p>
                    <p className="text-[14px] font-black">{formatPremiumCountdown()}</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-2">
                      Hết hạn: {new Date(user.premium_due_date).toLocaleString('vi-VN')}
                    </p>
                  </div>
                )}

                <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">Mã mời của bạn</p>
                  <div className="flex items-center gap-3">
                    <code className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-black tracking-widest text-slate-900 text-center">
                      {user.code_invite || '--------'}
                    </code>
                    <button
                      type="button"
                      onClick={handleCopyInviteCode}
                      className="w-11 h-11 rounded-xl bg-slate-900 text-white hover:bg-blue-600 transition-all flex items-center justify-center"
                      title="Sao chép mã mời"
                    >
                      <IconMapper name="content_copy" className="text-base" />
                    </button>
                  </div>
                </div>

                {inviteMsg.text && (
                  <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 ${inviteMsg.type === 'error' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    <IconMapper name={inviteMsg.type === 'error' ? 'error' : 'check_circle'} />
                    {inviteMsg.text}
                  </div>
                )}

                {!user.invite_redeemed && (
                  <form onSubmit={handleRedeemInvite} className="space-y-3">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Nhập mã mời</label>
                    <div className="flex gap-3">
                      <input
                        value={inviteCodeInput}
                        onChange={(e) => setInviteCodeInput(e.target.value.replace(/[^A-Za-z0-9]/g, '').slice(0, 8))}
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-black tracking-widest"
                        placeholder="AbC123xY"
                      />
                      <button
                        type="submit"
                        disabled={inviteCodeInput.length !== 8 || isRedeemingInvite}
                        className="px-5 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-40"
                      >
                        {isRedeemingInvite ? '...' : 'Nhập'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-8">
            {/* Form Edit Profile */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                    <IconMapper name="manage_accounts" className="text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Hồ Sơ Của Bạn</h3>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                      Cập nhật thông tin hiển thị
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="p-8 space-y-6">
                {profileMsg.text && (
                  <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-2 ${profileMsg.type === 'error' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    <IconMapper name={profileMsg.type === 'error' ? 'error' : 'check_circle'} />
                    {profileMsg.text}
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Họ và Tên</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-900"
                      placeholder="Nhập họ và tên..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Email (Không thể đổi)</label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-5 py-4 text-sm outline-none font-medium text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Tiểu sử (Bio)</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-900 resize-none"
                    placeholder="Vài dòng giới thiệu về bản thân..."
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2 disabled:opacity-50"
                  >
                    {isUpdatingProfile ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <IconMapper name="save" className="text-base" />
                        Lưu Thay Đổi
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>

            {/* Form Change Password */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center shadow-inner">
                    <IconMapper name="lock_reset" className="text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Bảo Mật & Mật Khẩu</h3>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                      Đổi mật khẩu tài khoản của bạn
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleChangePassword} className="p-8 space-y-6">
                {passwordMsg.text && (
                  <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-2 ${passwordMsg.type === 'error' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    <IconMapper name={passwordMsg.type === 'error' ? 'error' : 'check_circle'} />
                    {passwordMsg.text}
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Mật khẩu hiện tại</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-900"
                    placeholder="••••••••"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Mật khẩu mới</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-900"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Xác nhận mật khẩu mới</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-900"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isUpdatingPassword}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-lg shadow-slate-900/30 flex items-center gap-2 disabled:opacity-50"
                  >
                    {isUpdatingPassword ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <IconMapper name="key" className="text-base" />
                        Đổi Mật Khẩu
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
        {showRenewModal && premiumActive && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-6">
            <div className="w-full max-w-3xl rounded-[2rem] bg-white border border-slate-200 shadow-2xl overflow-hidden">
              <div className="p-8">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center text-3xl font-black">
                    !
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">Premium sắp hết hạn</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Tài khoản Premium của bạn còn lại {formatPremiumCountdown()}. Hãy gia hạn sớm để tiếp tục nhận 30.000 token premium mỗi ngày và giữ quyền truy cập các tính năng cao cấp.
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-3xl bg-slate-50 p-5 border border-slate-100">
                  <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">Hạn sử dụng hiện tại</p>
                  <p className="text-base font-bold text-slate-900 mt-2">
                    {new Date(user.premium_due_date).toLocaleDateString('vi-VN')} - {new Date(user.premium_due_date).toLocaleTimeString('vi-VN')}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-2">Token premium hiện tại: {formatTokenCount(tokenPremiumValue)} / 30.000</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 justify-end border-t border-slate-100 bg-slate-50 px-6 py-4">
                <button
                  type="button"
                  onClick={() => setShowRenewModal(false)}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl border border-slate-300 text-slate-700 font-black uppercase tracking-widest transition hover:bg-slate-100"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowRenewModal(false);
                    navigate('/premium');
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest transition hover:bg-blue-700"
                >
                  Gia hạn Premium
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <SharedFooter />
    </AnimatedBackground>
  );
};

export default ProfilePage;
