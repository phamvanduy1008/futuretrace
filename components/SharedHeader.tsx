import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getCurrentUser, logout } from '../services/authService';

const SharedHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const user = getCurrentUser();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    setIsMobileMenuOpen(false);
    
    if (location.pathname === '/community') {
      setSearchValue(searchParams.get('q') || "");
    } else {
      setSearchValue("");
    }
  }, [location, searchParams]);

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    
    if (value.trim()) {
      navigate(`/community?q=${encodeURIComponent(value)}`, { replace: location.pathname === '/community' });
    } else if (location.pathname === '/community') {
      navigate('/community', { replace: true });
    }
  };

  const getUserInitials = () => {
    if (!user?.name) return 'ID';
    return user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const navItems = [
    { label: 'Tổng quan', path: '/dashboard', icon: 'dashboard' },
    { label: 'Mô phỏng', path: '/simulate', icon: 'model_training' },
    { label: 'Cộng đồng', path: '/community', icon: 'groups' },
    { label: 'Tiến trình', path: '/progress', icon: 'trending_up' },
    { label: 'Lịch sử', path: '/history', icon: 'history' },
  ];

  const profileMenuItems = [
    { label: 'Thông tin cá nhân', icon: 'person', action: () => {} },
    { label: 'Đổi mật khẩu', icon: 'lock_reset', action: () => {} },
    { label: 'Cài đặt', icon: 'settings', action: () => {} },
    { label: 'Đăng xuất', icon: 'logout', action: handleLogout, danger: true },
  ];

  return (
    <>
      <header className="sticky top-0 z-[100] w-full bg-slate-950/95 backdrop-blur-md border-b border-slate-800 px-6 sm:px-10 py-4">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-white/10">
                 <span className="material-symbols-outlined text-slate-950 text-xl font-bold">insights</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-xl font-black tracking-tighter text-white font-display">FutureTrace</span>
                <span className="text-[8px] uppercase tracking-[0.2em] text-blue-500 font-black hidden sm:block">Decision Research</span>
              </div>
            </div>
            
            {isLoggedIn && (
              <nav className="hidden lg:flex items-center gap-8">
                {navItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`text-[11px] font-black uppercase tracking-widest transition-all ${
                      location.pathname === item.path 
                        ? 'text-white border-b-2 border-white pb-1' 
                        : 'text-slate-500 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
                <button
                  onClick={() => navigate('/premium')}
                  className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-widest transition-all px-4 py-1.5 rounded-full border ${
                    location.pathname === '/premium'
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-slate-800 text-amber-500 hover:border-amber-500/50 hover:bg-amber-500/5'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">workspace_premium</span>
                  Premium
                </button>
              </nav>
            )}
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            {isLoggedIn ? (
              <>
                <div className="relative hidden lg:block">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-lg">search</span>
                  <input 
                    value={searchValue}
                    onChange={handleSearchChange}
                    className="bg-slate-900 border border-slate-800 rounded-lg py-1.5 pl-10 pr-4 text-[11px] w-48 xl:w-64 outline-none focus:ring-1 focus:ring-blue-600 focus:bg-slate-800 text-white transition-all font-medium"
                    placeholder="Tìm kịch bản cộng đồng..."
                  />
                  {searchValue && (
                    <button 
                      onClick={() => { setSearchValue(""); navigate('/community'); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  )}
                </div>

                <button className="material-symbols-outlined text-slate-500 hover:text-white transition-colors hidden sm:block">notifications</button>
                
                <div 
                  className="relative hidden lg:block"
                  onMouseEnter={() => setIsProfileOpen(true)}
                  onMouseLeave={() => setIsProfileOpen(false)}
                >
                  <div className="w-8 h-8 rounded-full bg-white border-2 border-slate-800 flex items-center justify-center text-slate-950 font-black text-[10px] cursor-pointer hover:ring-2 hover:ring-blue-600/50 transition-all">
                    {getUserInitials()}
                  </div>
                  
                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden py-2 z-[110]"
                      >
                        <div className="px-4 py-3 border-b border-slate-800 mb-1">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tài khoản ID</p>
                          <p className="text-sm font-black text-white truncate">{user?.email || "guest@research.vn"}</p>
                        </div>
                        
                        {profileMenuItems.map((item, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              item.action();
                              setIsProfileOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors group ${
                              item.danger 
                                ? 'hover:bg-rose-950/50 text-rose-500' 
                                : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            <span className={`material-symbols-outlined text-[18px] ${
                              item.danger ? 'text-rose-500/50' : 'text-slate-600 group-hover:text-white'
                            }`}>
                              {item.icon}
                            </span>
                            <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors border border-slate-800"
                >
                  <span className="material-symbols-outlined text-2xl">
                    {isMobileMenuOpen ? 'close' : 'menu'}
                  </span>
                </button>
              </>
            ) : (
              <button 
                onClick={() => navigate('/login')}
                className="bg-white hover:bg-slate-200 text-slate-950 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-lg shadow-white/5"
              >
                Đăng nhập
              </button>
            )}
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] lg:hidden"
          >
            <div 
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xl"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-[320px] bg-slate-950 shadow-2xl flex flex-col border-l border-slate-800"
            >
              <div className="p-8 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-slate-950 text-lg">insights</span>
                  </div>
                  <span className="font-black text-white uppercase tracking-tighter">Menu</span>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-900 text-slate-500"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-8 px-6 space-y-8">
                {/* Search Mobile */}
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-lg">search</span>
                  <input 
                    value={searchValue}
                    onChange={handleSearchChange}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-xs text-white outline-none focus:ring-1 focus:ring-blue-600"
                    placeholder="Tìm kịch bản..."
                  />
                </div>

                <nav className="space-y-2">
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4 ml-2">Điều hướng</p>
                  {navItems.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all group ${
                        location.pathname === item.path 
                          ? 'bg-white text-slate-950 shadow-lg shadow-white/5' 
                          : 'hover:bg-slate-900 text-slate-400'
                      }`}
                    >
                      <span className={`material-symbols-outlined text-xl ${location.pathname === item.path ? 'text-slate-950' : 'text-slate-600 group-hover:text-white'}`}>
                        {item.icon}
                      </span>
                      <span className="text-[11px] font-black uppercase tracking-[0.2em]">{item.label}</span>
                    </button>
                  ))}
                  <button
                    onClick={() => navigate('/premium')}
                    className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all group ${
                      location.pathname === '/premium'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'hover:bg-amber-500/10 text-amber-500'
                    }`}
                  >
                    <span className="material-symbols-outlined text-xl">workspace_premium</span>
                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">Premium</span>
                  </button>
                </nav>

                <div className="pt-8 border-t border-slate-800">
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4 ml-2">Cá nhân</p>
                  <div className="space-y-2">
                    {profileMenuItems.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          item.action();
                        }}
                        className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${
                          item.danger 
                            ? 'text-rose-500 hover:bg-rose-950/30' 
                            : 'text-slate-400 hover:bg-slate-900'
                        }`}
                      >
                        <span className={`material-symbols-outlined text-xl ${item.danger ? 'text-rose-500/50' : 'text-slate-600'}`}>
                          {item.icon}
                        </span>
                        <span className="text-[11px] font-black uppercase tracking-[0.2em]">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SharedHeader;
