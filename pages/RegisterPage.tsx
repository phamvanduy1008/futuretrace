import { AnimatedBackground } from '../components/AnimatedBackground';
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SharedHeader from "../components/SharedHeader";
import SharedFooter from "../components/SharedFooter";
import { register } from "../services/authService";
import { IconMapper } from '../components/IconMapper';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await register({ email, password, fullName, role });
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedBackground className="min-h-screen bg-white flex flex-col">
      <SharedHeader />

      <main className="flex-1 flex items-center justify-center py-16 sm:py-24 px-4">
        <div className="w-full max-w-[560px]">
          <div className="mb-12 text-center">
            <div className="w-16 h-16 bg-blue-600 text-white rounded-3xl flex items-center justify-center mb-6 mx-auto shadow-xl shadow-blue-200">
              <IconMapper name="person_add" className=" text-4xl font-bold" />
            </div>
            <h1 className="text-3xl font-black mb-3 font-display tracking-tight text-slate-900">
              ĐĂNG KÝ TÀI KHOẢN
            </h1>
            <p className="text-slate-600 font-medium">
              Bắt đầu hành trình định lượng các quỹ đạo tương lai.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-[3rem] p-8 sm:p-14 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.18)]">
            <form className="space-y-10" onSubmit={handleSubmit}>
              {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-xs font-bold flex items-center gap-3">
                  <IconMapper name="error" className=" text-lg" />
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-2.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  Họ và tên
                </label>
                <input
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 h-14 px-6 text-base focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium"
                  placeholder="Nguyễn Văn A"
                  type="text"
                />
              </div>

              <div className="flex flex-col gap-2.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  Địa chỉ Email Công việc / Học tập
                </label>
                <input
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 h-14 px-6 text-base focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium"
                  placeholder="name@university.edu.vn"
                  type="email"
                />
              </div>

              <div className="flex flex-col gap-2.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  Mật khẩu bảo mật
                </label>
                <input
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 h-14 px-6 text-base focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium"
                  placeholder="Ít nhất 8 ký tự"
                  type="password"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-6 ml-1">
                  Bạn là ?
                </label>
                <div className="grid grid-cols-2 gap-5">
                  <label className="relative cursor-pointer group">
                    <input
                      className="peer sr-only"
                      name="role"
                      type="radio"
                      value="student"
                      checked={role === "student"}
                      onChange={() => setRole("student")}
                    />
                    <div className="flex flex-col items-center justify-center p-10 border-2 border-slate-50 rounded-3xl transition-all peer-checked:border-blue-600 peer-checked:bg-blue-50/50 hover:border-slate-200 bg-white">
                      <IconMapper name="school" className=" text-4xl mb-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 peer-checked:text-blue-600">
                        Học sinh cấp 3
                      </span>
                    </div>
                  </label>
                  <label className="relative cursor-pointer group">
                    <input
                      className="peer sr-only"
                      name="role"
                      type="radio"
                      value="worker"
                      checked={role === "worker"}
                      onChange={() => setRole("worker")}
                    />
                    <div className="flex flex-col items-center justify-center p-10 border-2 border-slate-50 rounded-3xl transition-all peer-checked:border-blue-600 peer-checked:bg-blue-50/50 hover:border-slate-200 bg-white">
                      <IconMapper name="work" className=" text-4xl mb-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 peer-checked:text-blue-600">
                        Sinh viên đại học
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex h-6 items-center">
                  <input
                    required
                    className="h-5 w-5 rounded-lg border-slate-200 text-blue-600 focus:ring-blue-600 cursor-pointer"
                    id="disclaimer"
                    type="checkbox"
                  />
                </div>
                <div className="text-xs">
                  <label
                    className="font-black text-slate-900 leading-none cursor-pointer"
                    htmlFor="disclaimer"
                  >
                    Tôi xác nhận quyền sở hữu dữ liệu
                  </label>
                  <p className="text-slate-600 text-[10px] mt-2 font-medium leading-relaxed uppercase tracking-wider">
                    Hệ thống AI xử lý dữ liệu dựa trên các tham số giả lập và
                    không chịu trách nhiệm cho các quyết định thực tế.
                  </p>
                </div>
              </div>

              <button
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black h-16 rounded-2xl transition-all shadow-2xl shadow-blue-100 uppercase text-[11px] tracking-widest disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Tạo tài khoản ngay"
                )}
              </button>

              <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest pt-6 border-t border-slate-50">
                ĐÃ CÓ TÀI KHOẢN?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-blue-600 hover:underline"
                >
                  ĐĂNG NHẬP NGAY
                </button>
              </p>
            </form>
          </div>
        </div>
      </main>

      <SharedFooter />
    </AnimatedBackground>
  );
};

export default RegisterPage;
