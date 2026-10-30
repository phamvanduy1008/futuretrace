import { AnimatedBackground } from '../components/AnimatedBackground';
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SharedHeader from "../components/SharedHeader";
import SharedFooter from "../components/SharedFooter";
import { login, getUserProfile } from "../services/authService";
import { IconMapper } from '../components/IconMapper';

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    const handleUrlTokens = async () => {
      const hash = window.location.hash;
      if (hash.includes("?")) {
        const queryStr = hash.split("?")[1];
        const params = new URLSearchParams(queryStr);
        const token = params.get("token");
        const refreshToken = params.get("refreshToken");

        if (token && refreshToken) {
          setLoading(true);
          setError("");
          try {
            localStorage.setItem("token", token);
            localStorage.setItem("refreshToken", refreshToken);
            localStorage.setItem("futuretrace_token", token);
            localStorage.setItem("futuretrace_refresh_token", refreshToken);

            await getUserProfile();

            const cleanHash = hash.split("?")[0];
            navigate(cleanHash.substring(1), { replace: true });

            onLogin();
            navigate("/dashboard");
          } catch (err: any) {
            console.error("Google login authentication error:", err);
            setError("Đăng nhập bằng Google thất bại. Vui lòng thử lại.");
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("futuretrace_token");
            localStorage.removeItem("futuretrace_refresh_token");
          } finally {
            setLoading(false);
          }
        }
      }
    };

    handleUrlTokens();
  }, [navigate, onLogin]);

  const handleGoogleLogin = () => {
    const clientId = "762553928685-dg5o4lrqu3jbjm1nh5554n7qsrn14tj2.apps.googleusercontent.com";
    const apiBase = (import.meta as any).env.VITE_API_BASE_URL || "https://futuretrace-server.onrender.com";
    const callbackUrl = `${apiBase}/auth/google/callback`;
    const scope = "openid email profile";
    const state = window.location.origin; // frontend origin, so backend knows where to redirect back

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      callbackUrl
    )}&response_type=code&scope=${encodeURIComponent(scope)}&state=${encodeURIComponent(state)}`;

    window.location.href = authUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(email, password);
      onLogin();
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedBackground className="min-h-screen bg-white flex flex-col">
      <SharedHeader />

      <main className="flex-1 flex items-center justify-center p-6 py-16 sm:py-24">
        <div className="w-full max-w-[440px] flex flex-col items-center">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-6 mx-auto border border-blue-100 shadow-sm">
              <IconMapper name="lock" className=" text-4xl font-bold" />
            </div>
            <h1 className="text-3xl font-black mb-2 font-display tracking-tight text-slate-900 uppercase">
              Chào mừng trở lại
            </h1>
            <p className="text-slate-600 font-medium">
              Đăng nhập để bắt đầu định hướng tương lai
            </p>
          </div>

          <div className="w-full bg-white border border-slate-200 rounded-[2.5rem] p-8 sm:p-12 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.18)]">
            <form className="flex flex-col gap-7" onSubmit={handleSubmit}>
              {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-xs font-bold flex items-center gap-3">
                  <IconMapper name="error" className=" text-lg" />
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-2.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  Địa chỉ Email
                </label>
                <input
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 h-14 px-5 text-base focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium"
                  placeholder="name@company.vn"
                  type="email"
                />
              </div>
              <div className="flex flex-col gap-2.5">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Mật khẩu
                  </label>
                  <a
                    className="text-blue-600 text-[10px] font-black uppercase tracking-widest hover:underline"
                    href="#"
                  >
                    Quên mật khẩu?
                  </a>
                </div>
                <div className="relative">
                  <input
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 h-14 px-5 text-base focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium"
                    placeholder="Nhập mật khẩu"
                    type="password"
                  />
                </div>
              </div>

              <button
                disabled={loading}
                className="mt-4 w-full bg-slate-900 hover:bg-blue-600 text-white font-black h-16 rounded-2xl transition-all shadow-2xl shadow-slate-200 uppercase text-[11px] tracking-widest disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Đăng nhập hệ thống"
                )}
              </button>

              <div className="flex items-center gap-4 my-4">
                <div className="h-[1px] grow bg-slate-100"></div>
                <span className="text-[9px] text-slate-300 uppercase tracking-widest font-black">
                  HOẶC TIẾP TỤC VỚI
                </span>
                <div className="h-[1px] grow bg-slate-100"></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex w-full items-center justify-center gap-3 h-14 border border-slate-100 rounded-2xl font-bold hover:bg-slate-50 transition-all text-sm mb-4"
              >
                <img
                  src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png"
                  className="w-5 h-5"
                  alt="Google"
                />
                <span>Google Workspace</span>
              </button>

              <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest pt-6 border-t border-slate-50">
                BẠN CHƯA CÓ TÀI KHOẢN?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="text-blue-600 hover:underline"
                >
                  ĐĂNG KÝ NGAY
                </button>
              </p>
            </form>
          </div>

          <div className="mt-12 flex items-center gap-3 text-slate-400">
            <IconMapper name="verified_user" className=" text-[18px]" />
            <span className="text-[9px] font-black uppercase tracking-widest">
              KẾT NỐI ĐƯỢC MÃ HÓA AES-256
            </span>
          </div>
        </div>
      </main>

      <SharedFooter />
    </AnimatedBackground>
  );
};

export default LoginPage;
