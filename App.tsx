
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

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('token');
  });
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Verify token by fetching profile
          await getUserProfile();
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
    </HashRouter>
  );
};

export default App;
