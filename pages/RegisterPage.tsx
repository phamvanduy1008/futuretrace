import { AnimatedBackground } from '../components/AnimatedBackground';
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import SharedHeader from "../components/SharedHeader";
import SharedFooter from "../components/SharedFooter";
import { sendRegisterOtp, verifyRegisterOtp } from "../services/authService";
import { IconMapper } from '../components/IconMapper';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

const OtpModal: React.FC<{
  email: string;
  onClose: () => void;
  onResend: () => Promise<void>;
  onVerifySuccess: () => void;
}> = ({ email, onClose, onResend, onVerifySuccess }) => {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const [success, setSuccess] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown(c => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    setError('');

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i];
    }
    setOtp(next);
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();
  };

  const handleVerify = useCallback(async () => {
    const code = otp.join('');
    if (code.length !== OTP_LENGTH) {
      setError('Vui lòng nhập đủ 6 số.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await verifyRegisterOtp(email, code);
      setSuccess(true);
      setTimeout(() => onVerifySuccess(), 1500);
    } catch (err: any) {
      setError(err.message || 'Xác thực thất bại.');
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }, [otp, email, onVerifySuccess]);

  const handleResend = async () => {
    if (countdown > 0 || resending) return;
    setResending(true);
    setError('');
    try {
      await onResend();
      setCountdown(RESEND_COOLDOWN);
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || 'Gửi lại mã thất bại.');
    } finally {
      setResending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
      style={{ backdropFilter: 'blur(16px)', background: 'rgba(15, 23, 42, 0.45)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.25)] w-full max-w-[450px] overflow-hidden"
      >
        {/* Header */}
        <div className="p-10 pb-0 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-9 h-9 flex items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 transition-all text-slate-400 hover:text-slate-600 border border-slate-100 active:scale-95"
          >
            <IconMapper name="close" className="text-base" />
          </button>

          <div className="w-20 h-20 bg-blue-600/10 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <IconMapper name="mail" className="text-4xl" />
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2 font-display uppercase">
            Xác nhận Email
          </h2>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1.5">
            Mã xác thực đã được gửi đến
          </p>
          <p className="text-blue-600 font-extrabold text-sm mb-8 select-all">
            {email}
          </p>
        </div>

        {/* Body */}
        <div className="px-10 pb-10">
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-5 border border-blue-100">
                <IconMapper name="check_circle" className="text-5xl" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2 uppercase">Đăng ký thành công!</h3>
              <p className="text-slate-500 text-sm font-medium">Đang chuyển hướng vào hệ thống...</p>
            </motion.div>
          ) : (
            <>
              {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-xs font-bold flex items-center gap-3 mb-6 animate-pulse">
                  <IconMapper name="error" className="text-lg flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* OTP Input */}
              <div className="flex justify-center gap-2.5 mb-8" onPaste={handlePaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleChange(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    className={`w-12 h-16 text-center text-2xl font-black rounded-2xl border-2 outline-none transition-all ${
                      digit
                        ? 'border-blue-600 bg-blue-50/30 text-blue-700 shadow-md shadow-blue-50'
                        : 'border-slate-100 bg-slate-50 text-slate-900 focus:bg-white'
                    } focus:border-blue-600 focus:ring-4 focus:ring-blue-50/80`}
                  />
                ))}
              </div>

              {/* Verify Button */}
              <button
                onClick={handleVerify}
                disabled={loading || otp.join('').length !== OTP_LENGTH}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black h-16 rounded-2xl transition-all shadow-2xl shadow-blue-200/50 uppercase text-[11px] tracking-widest disabled:opacity-40 flex items-center justify-center gap-2 mb-6 active:scale-[0.99]"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <IconMapper name="verified" className="text-base" />
                    Xác nhận mã
                  </>
                )}
              </button>

              {/* Resend */}
              <div className="text-center pt-4 border-t border-slate-50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                  Không nhận được mã?
                </p>
                {countdown > 0 ? (
                  <p className="text-[11px] font-bold text-slate-500 bg-slate-50 inline-block px-4 py-1.5 rounded-full border border-slate-100">
                    Gửi lại sau <span className="text-blue-600 font-black">{countdown}s</span>
                  </p>
                ) : (
                  <button
                    onClick={handleResend}
                    disabled={resending}
                    className="text-blue-600 font-black text-xs hover:text-blue-700 transition-colors inline-flex items-center gap-1.5 hover:underline disabled:opacity-50"
                  >
                    {resending ? 'Đang gửi...' : (
                      <>
                        <IconMapper name="refresh" className="text-xs" />
                        Gửi lại mã mới
                      </>
                    )}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Password validation: at least 8 characters, 1 uppercase, 1 special character
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passwordRegex.test(password)) {
      setError("Mật khẩu phải có ít nhất 8 ký tự, bao gồm ít nhất 1 chữ viết hoa và 1 ký tự đặc biệt.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu nhập lại không khớp.");
      setLoading(false);
      return;
    }

    try {
      await sendRegisterOtp({ email, password, fullName, role });
      setShowOtpModal(true);
    } catch (err: any) {
      setError(err.message || "Gửi mã xác thực thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    await sendRegisterOtp({ email, password, fullName, role });
  };

  const handleVerifySuccess = () => {
    setShowOtpModal(false);
    // User is automatically logged in as verifyRegisterOtp now sets token & user in localStorage
    navigate("/dashboard");
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
                <div className="relative w-full">
                  <input
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 h-14 pl-6 pr-14 text-base focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium"
                    placeholder="Ít nhất 8 ký tự, 1 viết hoa, 1 ký tự đặc biệt"
                    type={showPassword ? "text" : "password"}
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <IconMapper name={showPassword ? "visibility_off" : "visibility"} />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  Nhập lại mật khẩu
                </label>
                <div className="relative w-full">
                  <input
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 h-14 pl-6 pr-14 text-base focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium"
                    placeholder="Xác nhận mật khẩu bảo mật"
                    type={showConfirmPassword ? "text" : "password"}
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <IconMapper name={showConfirmPassword ? "visibility_off" : "visibility"} />
                  </button>
                </div>
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

      <AnimatePresence>
        {showOtpModal && (
          <OtpModal
            email={email}
            onClose={() => setShowOtpModal(false)}
            onResend={handleResendOtp}
            onVerifySuccess={handleVerifySuccess}
          />
        )}
      </AnimatePresence>
    </AnimatedBackground>
  );
};

export default RegisterPage;
