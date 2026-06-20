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

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate('/login');
    } else {
      setUser(currentUser);
      setFullName(currentUser.name || '');
      setBio(currentUser.bio || '');
      getUserProfile()
        .then((freshUser) => {
          setUser(freshUser);
          setFullName(freshUser.name || '');
          setBio(freshUser.bio || '');
        })
        .catch(() => { });
    }
  }, [navigate]);

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
      setInviteMsg({ text: 'Nhập mã mời thành công. Bạn và người mời đều nhận được 40 token.', type: 'success' });
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

  const tokenValue = Number(user.token ?? 0);
  const formatTokenCount = (value: number) => value.toLocaleString('vi-VN');
  const tokenFill = Math.min(100, (tokenValue / 1000) * 100);


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
                onClick={() => navigate('/store')}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all hover:scale-105 bg-blue-50 text-blue-600 border-blue-100"
              >
                <IconMapper name="store" className="text-sm" />
                <span className="text-[10px] font-black uppercase tracking-widest">Thành viên</span>
              </button>
              <div className="w-full mt-8 pt-8 border-t border-slate-100 space-y-5 text-left">
                <div className="group relative p-5 bg-blue-50/80 border border-blue-100 rounded-2xl hover:border-blue-300 transition-all">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-blue-500 mb-1">Token hiện có</p>
                    </div>
                  </div>
                  <div className="relative h-3 rounded-full bg-blue-100 cursor-pointer group/bar">
                    <div
                      className="h-full rounded-full bg-blue-500 transition-all duration-500"
                      style={{ width: `${tokenFill}%` }}
                    />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-xl opacity-0 group-hover/bar:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50">
                      {formatTokenCount(tokenValue)} token
                      <span className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-slate-900"></span>
                    </div>
                  </div>
                  <p className="mt-2 text-[10px] text-slate-500">1.000 token = 100%  <button onClick={() => navigate('/store')} className="text-blue-600 font-bold underline">Mua thêm token</button></p>
                </div>

                <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Mã mời của bạn</p>
                    <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-600">
                      Mời 1 bạn = 40 token
                    </span>
                  </div>
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
                        style={{width:'100px'}}
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
                    <IconMapper name="profile" className="text-2xl" />
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

      </main>

      <SharedFooter />
    </AnimatedBackground>
  );
};

export default ProfilePage;
