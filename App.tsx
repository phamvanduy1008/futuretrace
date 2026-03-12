
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
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

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('futuretrace_auth') === 'true';
  });

  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(localStorage.getItem('futuretrace_auth') === 'true');
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

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
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
