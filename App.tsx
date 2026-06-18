
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, HashRouter } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import SimulationFlow from './pages/SimulationFlow';
import ProgressPage from './pages/ProgressPage';
import HistoryPage from './pages/HistoryPage';
import CommunityPage from './pages/CommunityPage';
import ScenarioDetailPage from './pages/ScenarioDetailPage';
import PremiumPage from './pages/PremiumPage';
import PremiumAnalysisPage from './pages/PremiumAnalysisPage';
import ComparisonMatrixPage from './pages/ComparisonMatrixPage';
import PaymentPage from './pages/PaymentPage';
import PaymentResultPage from './pages/PaymentResultPage';
import ProfilePage from './pages/ProfilePage.tsx';
import { getUserProfile, logout } from './services/authService';
import AdminApp from './pages/admin/AdminApp';
import { TourProvider } from './components/GuideTour';
import { IconMapper } from './components/IconMapper';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('token');
  });
  const [isInitializing, setIsInitializing] = useState(true);
  const [renewalNotice, setRenewalNotice] = useState<any>(null);

  const maybeShowRenewalNotice = (user: any) => {
    if (!user?.tier?.startsWith('premium') || !user?.premium_due_date) return;
    const dueTime = new Date(user.premium_due_date).getTime();
    if (Number.isNaN(dueTime)) return;
    const daysLeft = (dueTime - Date.now()) / 86400000;
    const noticeKey = `premium_renewal_notice_${user.id}_${new Date().toISOString().slice(0, 10)}`;
    if (daysLeft <= 3 && daysLeft >= 0 && sessionStorage.getItem(noticeKey) !== 'shown') {
      sessionStorage.setItem(noticeKey, 'shown');
      setRenewalNotice(user);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Verify token by fetching profile
          const user = await getUserProfile();
          maybeShowRenewalNotice(user);
          setIsAuthenticated(true);
        } catch (err) {
          console.error("Session invalid or expired", err);
          logout();
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      setIsInitializing(false);
    };

    initAuth();

    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem('token'));
    };

    const handleUnauthorized = () => {
      logout();
      setIsAuthenticated(false);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-unauthorized', handleUnauthorized);
    };
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        maybeShowRenewalNotice(JSON.parse(storedUser));
      }
    } catch {
      // Ignore malformed local user data.
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <HashRouter>
      <TourProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/dashboard"
            element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/simulate"
            element={isAuthenticated ? <SimulationFlow /> : <Navigate to="/login" />}
          />
          <Route
            path="/community"
            element={isAuthenticated ? <CommunityPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/progress"
            element={isAuthenticated ? <ProgressPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/history"
            element={isAuthenticated ? <HistoryPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/matrix"
            element={isAuthenticated ? <ComparisonMatrixPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/premium"
            element={isAuthenticated ? <PremiumPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/detail/:id"
            element={isAuthenticated ? <ScenarioDetailPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/premium-analysis"
            element={isAuthenticated ? <PremiumAnalysisPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/checkout"
            element={isAuthenticated ? <PaymentPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/payment-result"
            element={isAuthenticated ? <PaymentResultPage /> : <Navigate to="/login" />}
          />

          <Route
            path="/profile"
            element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />}
          />

          <Route
            path="/admin/*"
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <AdminApp />}
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        {renewalNotice && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setRenewalNotice(null)} />
            <div className="relative w-full max-w-md bg-white rounded-[2rem] border border-slate-100 shadow-2xl p-8 text-center">
              <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <IconMapper name="workspace_premium" className="text-3xl" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 uppercase italic mb-3">Premium sắp hết hạn</h2>
              <p className="text-sm font-medium text-slate-600 mb-8">
                Gói Premium của bạn còn dưới 3 ngày. Gia hạn để tiếp tục nhận 30.000 token premium mỗi ngày.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setRenewalNotice(null);
                    window.location.hash = '#/premium';
                  }}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all"
                >
                  Gia hạn ngay
                </button>
                <button
                  onClick={() => setRenewalNotice(null)}
                  className="w-full py-4 bg-white border border-slate-200 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                >
                  Để sau
                </button>
              </div>
            </div>
          </div>
        )}
      </TourProvider>
    </HashRouter>
  );
};

export default App;
