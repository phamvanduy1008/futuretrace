import React, { useState, useEffect, lazy, Suspense } from "react";
import { MotionConfig } from "framer-motion";
import {
  Routes,
  Route,
  Navigate,
  HashRouter,
  useLocation,
} from "react-router-dom";

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant", // hoặc 'smooth' nếu muốn cuộn mượt, 'instant' giúp phản hồi tức thì
    });
  }, [pathname]);

  return null;
};
const LandingPage = lazy(() => import("./pages/LandingPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const SimulationFlow = lazy(() => import("./pages/SimulationFlow"));
const ProgressPage = lazy(() => import("./pages/ProgressPage"));
const HistoryPage = lazy(() => import("./pages/HistoryPage"));
const CommunityPage = lazy(() => import("./pages/CommunityPage"));
const ScenarioDetailPage = lazy(() => import("./pages/ScenarioDetailPage"));
const StorePage = lazy(() => import("./pages/StorePage"));
const PremiumAnalysisPage = lazy(() => import("./pages/PremiumAnalysisPage"));
const StepDetailPage = lazy(() => import("./pages/StepDetailPage"));
const ComparisonMatrixPage = lazy(() => import("./pages/ComparisonMatrixPage"));
const PaymentPage = lazy(() => import("./pages/PaymentPage"));
const PaymentResultPage = lazy(() => import("./pages/PaymentResultPage"));
const EvaluationFlow = lazy(() => import("./pages/EvaluationFlow"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const MethodologyPage = lazy(() => import("./pages/MethodologyPage"));
import ConsentGate from "./components/ConsentGate";
import { getUserProfile, logout } from "./services/authService";
const AdminApp = lazy(() => import("./pages/admin/AdminApp"));
import { TourProvider } from "./components/GuideTour";

// Mỗi trang tải riêng (code-splitting): người dùng không phải tải trang admin, thanh toán... khi mở trang chủ
const RouteFallback: React.FC = () => (
  <div className="min-h-screen bg-white flex items-center justify-center"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>
);

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem("token");
  });
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        // Optimistically authenticate and let user enter immediately
        setIsAuthenticated(true);
        setIsInitializing(false);

        try {
          // Verify token in the background to refresh user info
          await getUserProfile();
        } catch (err) {
          console.error("Session invalid or expired", err);
          logout();
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
        setIsInitializing(false);
      }
    };

    initAuth();

    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem("token"));
    };

    const handleUnauthorized = () => {
      logout();
      setIsAuthenticated(false);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("auth-unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("auth-unauthorized", handleUnauthorized);
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
    <MotionConfig reducedMotion="user">
    <HashRouter>
      <ScrollToTop />
      <TourProvider>
        <ConsentGate isAuthenticated={isAuthenticated} />
        <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/methodology" element={<MethodologyPage />} />

          <Route
            path="/dashboard"
            element={
              isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/simulate"
            element={
              isAuthenticated ? <SimulationFlow /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/community"
            element={
              isAuthenticated ? <CommunityPage /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/evaluate"
            element={
              isAuthenticated ? <EvaluationFlow /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/progress"
            element={
              isAuthenticated ? <ProgressPage /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/history"
            element={
              isAuthenticated ? <HistoryPage /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/matrix"
            element={
              isAuthenticated ? (
                <ComparisonMatrixPage />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/store"
            element={isAuthenticated ? <StorePage /> : <Navigate to="/login" />}
          />
          <Route
            path="/premium"
            element={
              isAuthenticated ? (
                <Navigate to="/store" replace />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/detail/:id"
            element={
              isAuthenticated ? (
                <ScenarioDetailPage />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/premium-analysis"
            element={
              isAuthenticated ? (
                <PremiumAnalysisPage />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/scenario/:scenarioId/step/:stepId"
            element={
              isAuthenticated ? <StepDetailPage /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/checkout"
            element={
              isAuthenticated ? <PaymentPage /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/payment-result"
            element={
              isAuthenticated ? <PaymentResultPage /> : <Navigate to="/login" />
            }
          />

          <Route
            path="/profile"
            element={
              isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />
            }
          />

          <Route path="/admin/*" element={<AdminApp />} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        </Suspense>
      </TourProvider>
    </HashRouter>
    </MotionConfig>
  );
};

export default App;
