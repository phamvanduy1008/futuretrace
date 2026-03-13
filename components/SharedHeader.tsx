import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getCurrentUser, logout } from '../services/authService';
import { IconMapper } from './IconMapper';

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
      <header className="sticky top-0 z-[100] w-full bg-slate-950/90 backdrop-blur-2xl border-b border-slate-800/50 px-6 sm:px-10 py-4 transition-all duration-300">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
               <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-blue-900/20 border border-slate-800 transition-all group-hover:scale-105 group-hover:border-blue-500/50">
                 <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
               </div>
               <div className="flex flex-col leading-none relative">
                  <div className="absolute -inset-x-6 inset-y-0 bg-blue-600/20 blur-[24px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                 <div className="flex items-baseline relative z-10">
                    <span className="text-2xl sm:text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-400 font-display italic pr-0.5">
                      Future
                    </span>
                    <span className="text-2xl sm:text-3xl font-light tracking-tighter text-slate-500 font-display">
                      Trace
                    </span>
                 </div>
                 <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-blue-600 font-black hidden sm:block mt-1.5 relative z-10 pl-0.5">Decision Research</span>
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
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
                <button
                  onClick={() => navigate('/premium')}
                  className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-widest transition-all px-4 py-1.5 rounded-full border ${
                    location.pathname === '/premium'
                      ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'border-slate-200 text-amber-500 hover:border-amber-300 hover:bg-amber-50'
                  }`}
                >
                  <IconMapper name="workspace_premium" className=" text-sm" />
                  Premium
                </button>
              </nav>
            )}
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            {isLoggedIn ? (
              <>
                <div className="relative hidden lg:block">
                  <IconMapper name="search" className=" absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                  <input aria-label="Tìm kiếm kịch bản cộng đồng" value={searchValue}
                    onChange={handleSearchChange}
                    className="bg-slate-900/80 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-[11px] w-48 xl:w-64 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-slate-900 text-white transition-all font-medium placeholder-slate-500"
                    placeholder="Tìm kịch bản..."
                  />
                  {searchValue && (
                    <button 
                      onClick={() => { setSearchValue(""); navigate('/community'); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    >
                      <IconMapper name="close" className=" text-sm" />
                    </button>
                  )}
                </div>

                <button className="text-slate-400 hover:text-white transition-colors hidden sm:block">
                  <IconMapper name="notifications" className="text-2xl" />
                </button>
                
                <div 
                  className="relative hidden lg:block"
                  onMouseEnter={() => setIsProfileOpen(true)}
                  onMouseLeave={() => setIsProfileOpen(false)}
                >
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-white font-black text-[10px] cursor-pointer hover:ring-4 hover:ring-blue-600/20 transition-all shadow-md"
                  >
                    {getUserInitials()}
                  </motion.div>
                  
                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 bg-white border border-slate-100 rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] overflow-hidden py-2 z-[110]"
                      >
                        <div className="px-4 py-3 border-b border-slate-50 mb-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tài khoản ID</p>
                          <p className="text-sm font-black text-slate-900 truncate">{user?.email || "guest@research.vn"}</p>
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
                                ? 'hover:bg-rose-50 text-rose-600' 
                                : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <IconMapper name={item.icon} className={` text-[18px] ${
                              item.danger ? 'text-rose-400' : 'text-slate-400 group-hover:text-blue-600'
                            }`} />
                            <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors border border-slate-800 shadow-sm"
                >
                  <IconMapper name={isMobileMenuOpen ? 'close' : 'menu'} className=" text-xl" />
                </button>
              </>
            ) : (
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20"
              >
                Đăng nhập
              </motion.button>
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
              className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-[320px] bg-white shadow-2xl flex flex-col border-l border-slate-100"
            >
              <div className="p-8 flex items-center justify-between border-b border-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                    <IconMapper name="menu" className=" text-lg" />
                  </div>
                  <span className="font-black text-slate-900 uppercase tracking-widest text-[11px]">Menu</span>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-50 text-slate-400"
                >
                  <IconMapper name="close" className="" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-8 px-6 space-y-8">
                {/* Search Mobile */}
                <div className="relative">
                  <IconMapper name="search" className=" absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                  <input aria-label="Tìm kiếm kịch bản cộng đồng" value={searchValue}
                    onChange={handleSearchChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-xs text-slate-900 outline-none focus:ring-1 focus:ring-blue-600 placeholder-slate-400"
                    placeholder="Tìm kịch bản..."
                  />
                </div>

                <nav className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-2">Điều hướng</p>
                  {navItems.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all group ${
                        location.pathname === item.path 
                          ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10' 
                          : 'hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <IconMapper name={item.icon} className={` text-xl ${location.pathname === item.path ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'}`} />
                      <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>
                    </button>
                  ))}
                  <button
                    onClick={() => navigate('/premium')}
                    className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all group ${
                      location.pathname === '/premium'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'hover:bg-amber-50 text-amber-600 border border-transparent hover:border-amber-200'
                    }`}
                  >
                    <IconMapper name="workspace_premium" className=" text-xl" />
                    <span className="text-[11px] font-black uppercase tracking-widest">Premium</span>
                  </button>
                </nav>

                <div className="pt-8 border-t border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-2">Cá nhân</p>
                  <div className="space-y-2">
                    {profileMenuItems.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          item.action();
                        }}
                        className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${
                          item.danger 
                            ? 'text-rose-600 hover:bg-rose-50' 
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <IconMapper name={item.icon} className={` text-xl ${item.danger ? 'text-rose-400' : 'text-slate-400'}`} />
                        <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>
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
