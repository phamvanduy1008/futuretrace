import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconMapper } from "./IconMapper";
import {
  sendForgotPasswordOtp,
  verifyForgotPasswordOtp,
  resetForgotPassword,
} from "../services/authService";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

type Step = "EMAIL" | "OTP" | "NEW_PASSWORD" | "SUCCESS";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  initialEmail?: string;
  onClose: () => void;
  onSuccess: (email: string) => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  initialEmail = "",
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<Step>("EMAIL");
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [verifiedOtpCode, setVerifiedOtpCode] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [otpSuccessNotice, setOtpSuccessNotice] = useState("");
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset state when opening modal
  useEffect(() => {
    if (isOpen) {
      setStep("EMAIL");
      setEmail(initialEmail);
      setOtp(Array(OTP_LENGTH).fill(""));
      setVerifiedOtpCode("");
      setNewPassword("");
      setConfirmPassword("");
      setError("");
      setOtpSuccessNotice("");
      setCountdown(RESEND_COOLDOWN);
    }
  }, [isOpen, initialEmail]);

  // Handle resend countdown
  useEffect(() => {
    if (step !== "OTP" || countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [step, countdown]);

  // Focus first OTP input when entering OTP step
  useEffect(() => {
    if (step === "OTP") {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    }
  }, [step]);

  // Password rules validation states
  const hasMinLength = newPassword.length >= 8;
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
  const isPasswordValid = PASSWORD_REGEX.test(newPassword);
  const isConfirmMatched = confirmPassword.length > 0 && newPassword === confirmPassword;
  const isConfirmMismatched = confirmPassword.length > 0 && newPassword !== confirmPassword;

  // ===================== STEP 1: SEND OTP =====================
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError("Vui lòng nhập địa chỉ email.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError("Địa chỉ email không đúng định dạng.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await sendForgotPasswordOtp(cleanEmail);
      setCountdown(RESEND_COOLDOWN);
      setOtp(Array(OTP_LENGTH).fill(""));
      setStep("OTP");
    } catch (err: any) {
      setError(err.message || "Không thể gửi mã xác thực. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // ===================== STEP 2: RESEND OTP =====================
  const handleResendOtp = async () => {
    if (countdown > 0 || resending) return;
    setResending(true);
    setError("");
    setOtpSuccessNotice("");

    try {
      await sendForgotPasswordOtp(email.trim().toLowerCase());
      setCountdown(RESEND_COOLDOWN);
      setOtp(Array(OTP_LENGTH).fill(""));
      otpInputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || "Gửi lại mã thất bại. Vui lòng thử lại.");
    } finally {
      setResending(false);
    }
  };

  // OTP Input event handlers
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    setError("");

    if (value && index < OTP_LENGTH - 1) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i];
    }
    setOtp(next);
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    otpInputRefs.current[focusIdx]?.focus();
  };

  // ===================== STEP 2: VERIFY OTP ONLY =====================
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("").trim();

    if (code.length !== OTP_LENGTH) {
      setError("Vui lòng nhập đủ 6 số của mã OTP.");
      return;
    }

    setLoading(true);
    setError("");
    setOtpSuccessNotice("");

    try {
      await verifyForgotPasswordOtp(email.trim().toLowerCase(), code);
      setVerifiedOtpCode(code);
      setOtpSuccessNotice("Mã OTP chính xác! Đang chuyển sang bước đặt mật khẩu mới...");

      setTimeout(() => {
        setOtpSuccessNotice("");
        setError("");
        setStep("NEW_PASSWORD");
      }, 700);
    } catch (err: any) {
      setError(err.message || "Mã xác thực không chính xác hoặc đã hết hạn.");
      setOtp(Array(OTP_LENGTH).fill(""));
      otpInputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // ===================== STEP 3: RESET PASSWORD =====================
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPasswordValid) {
      setError(
        "Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm ít nhất 1 chữ viết hoa và 1 ký tự đặc biệt."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không trùng khớp với mật khẩu mới.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await resetForgotPassword({
        email: email.trim().toLowerCase(),
        otp: verifiedOtpCode,
        newPassword,
        confirmPassword,
      });

      setStep("SUCCESS");
    } catch (err: any) {
      setError(err.message || "Đặt lại mật khẩu thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        style={{ backdropFilter: "blur(16px)", background: "rgba(15, 23, 42, 0.6)" }}
        onClick={(e) => {
          if (e.target === e.currentTarget && !loading) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] w-full max-w-[460px] overflow-hidden"
        >
          {/* Header Bar */}
          <div className="pt-8 px-8 pb-2 text-center relative">
            {/* Close Button */}
            <button
              onClick={onClose}
              disabled={loading}
              className="absolute top-6 right-6 w-9 h-9 flex items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 transition-all text-slate-400 hover:text-slate-600 border border-slate-100 active:scale-95 disabled:opacity-50"
              title="Đóng"
            >
              <IconMapper name="close" className="text-base" />
            </button>

            {/* Back Button */}
            {step === "OTP" && (
              <button
                onClick={() => {
                  setError("");
                  setOtpSuccessNotice("");
                  setStep("EMAIL");
                }}
                disabled={loading}
                className="absolute top-6 left-6 w-9 h-9 flex items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 transition-all text-slate-500 hover:text-slate-700 border border-slate-100 active:scale-95"
                title="Đổi lại email"
              >
                <IconMapper name="arrow_back" className="text-base" />
              </button>
            )}

            {step === "NEW_PASSWORD" && (
              <button
                onClick={() => {
                  setError("");
                  setStep("OTP");
                }}
                disabled={loading}
                className="absolute top-6 left-6 w-9 h-9 flex items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 transition-all text-slate-500 hover:text-slate-700 border border-slate-100 active:scale-95"
                title="Quay lại bước OTP"
              >
                <IconMapper name="arrow_back" className="text-base" />
              </button>
            )}

            {/* Step Icon */}
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-sm">
              {step === "EMAIL" && <IconMapper name="mail" className="text-3xl text-blue-600" />}
              {step === "OTP" && <IconMapper name="verified" className="text-3xl text-blue-600" />}
              {step === "NEW_PASSWORD" && <IconMapper name="lock_reset" className="text-3xl text-blue-600" />}
              {step === "SUCCESS" && <IconMapper name="check_circle" className="text-3xl text-emerald-600" />}
            </div>

            {/* Step Title */}
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1 uppercase font-display">
              {step === "EMAIL" && "Quên mật khẩu"}
              {step === "OTP" && "Xác thực mã OTP"}
              {step === "NEW_PASSWORD" && "Tạo mật khẩu mới"}
              {step === "SUCCESS" && "Thành công!"}
            </h2>

            {/* Step Subtitle */}
            <p className="text-slate-500 text-xs font-medium px-4">
              {step === "EMAIL" && "Nhập email của bạn để nhận mã OTP 6 số xác thực tài khoản"}
              {step === "OTP" && (
                <>
                  Mã OTP 6 số đã được gửi tới:{" "}
                  <span className="text-blue-600 font-bold select-all block mt-0.5">{email}</span>
                </>
              )}
              {step === "NEW_PASSWORD" && "Thiết lập mật khẩu mới có tính bảo mật cao cho tài khoản của bạn"}
              {step === "SUCCESS" && "Mật khẩu tài khoản đã được cập nhật an toàn vào hệ thống"}
            </p>
          </div>

          {/* Body Content */}
          <div className="p-8 pt-4">
            {/* Error Notification Banner */}
            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-xs font-bold flex items-center gap-2.5 mb-5 animate-pulse">
                <IconMapper name="error" className="text-base flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Notification Banner (Step 2 OTP Verified) */}
            {otpSuccessNotice && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl text-xs font-bold flex items-center gap-2.5 mb-5">
                <IconMapper name="check_circle" className="text-base flex-shrink-0 text-emerald-600" />
                <span>{otpSuccessNotice}</span>
              </div>
            )}

            {/* ======================= UI 1: NHẬP EMAIL ======================= */}
            {step === "EMAIL" && (
              <form onSubmit={handleSendOtp} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Địa chỉ Email
                  </label>
                  <input
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    placeholder="name@company.vn"
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 h-14 px-5 text-sm focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium text-slate-800"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black h-14 rounded-2xl transition-all shadow-xl shadow-blue-200/50 uppercase text-[11px] tracking-widest disabled:opacity-40 flex items-center justify-center gap-2 active:scale-[0.99] mt-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <IconMapper name="send" className="text-base" />
                      Gửi mã xác thực OTP
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-[11px] font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-wider"
                  >
                    Quay lại đăng nhập
                  </button>
                </div>
              </form>
            )}

            {/* ======================= UI 2: NHẬP & XÁC THỰC MÃ OTP (RIÊNG BIỆT) ======================= */}
            {step === "OTP" && (
              <form onSubmit={handleVerifyOtp} className="flex flex-col gap-6">
                <div>
                  <div className="flex justify-between items-center mb-3 px-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Mã 6 chữ số
                    </label>
                    <span className="text-[10px] font-bold text-slate-400">
                      Đã nhập: <span className="text-blue-600 font-black">{otp.join("").length}/6</span>
                    </span>
                  </div>

                  {/* 6 OTP Inputs */}
                  <div className="flex justify-center gap-2 sm:gap-2.5" onPaste={handleOtpPaste}>
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => {
                          otpInputRefs.current[i] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className={`w-12 h-16 sm:w-13 sm:h-16 text-center text-2xl font-black rounded-2xl border-2 outline-none transition-all ${
                          digit
                            ? "border-blue-600 bg-blue-50/40 text-blue-700 shadow-sm"
                            : error
                            ? "border-rose-200 bg-rose-50/20 text-rose-800"
                            : "border-slate-100 bg-slate-50 text-slate-900 focus:bg-white"
                        } focus:border-blue-600 focus:ring-4 focus:ring-blue-50`}
                      />
                    ))}
                  </div>

                  {/* Countdown & Resend Button */}
                  <div className="text-center mt-4">
                    {countdown > 0 ? (
                      <span className="text-[11px] font-medium text-slate-400 bg-slate-50 px-3.5 py-1.5 rounded-full border border-slate-100">
                        Gửi lại mã sau <span className="text-blue-600 font-black">{countdown}s</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={resending}
                        className="text-blue-600 font-bold text-xs hover:underline inline-flex items-center gap-1.5"
                      >
                        <IconMapper name="refresh" className="text-xs" />
                        {resending ? "Đang gửi lại..." : "Gửi lại mã OTP"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Button Xác nhận mã OTP */}
                <button
                  type="submit"
                  disabled={loading || otp.join("").length !== OTP_LENGTH}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black h-14 rounded-2xl transition-all shadow-xl shadow-blue-200/50 uppercase text-[11px] tracking-widest disabled:opacity-40 flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <IconMapper name="verified" className="text-base" />
                      Xác nhận mã OTP
                    </>
                  )}
                </button>
              </form>
            )}

            {/* ======================= UI 3: ĐẶT LẠI MẬT KHẨU MỚI (RIÊNG BIỆT) ======================= */}
            {step === "NEW_PASSWORD" && (
              <form onSubmit={handleResetPassword} className="flex flex-col gap-5">
                {/* Field: Tạo mật khẩu mới */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Tạo mật khẩu mới
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      required
                      autoFocus
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setError("");
                      }}
                      placeholder="Nhập mật khẩu mới"
                      className="w-full rounded-2xl border border-slate-100 bg-slate-50 h-13 px-4 pr-12 text-sm focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                    >
                      <IconMapper
                        name={showNewPassword ? "visibility_off" : "visibility"}
                        className="text-lg"
                      />
                    </button>
                  </div>

                  {/* 3 Real-time Criteria Badges */}
                  <div className="grid grid-cols-3 gap-1.5 mt-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[10px] font-bold">
                    <div
                      className={`flex items-center gap-1 transition-colors ${
                        hasMinLength ? "text-emerald-600" : "text-slate-400"
                      }`}
                    >
                      <IconMapper
                        name={hasMinLength ? "check_circle" : "circle"}
                        className="text-xs"
                      />
                      <span>≥ 8 ký tự</span>
                    </div>
                    <div
                      className={`flex items-center gap-1 transition-colors ${
                        hasUpperCase ? "text-emerald-600" : "text-slate-400"
                      }`}
                    >
                      <IconMapper
                        name={hasUpperCase ? "check_circle" : "circle"}
                        className="text-xs"
                      />
                      <span>1 chữ hoa</span>
                    </div>
                    <div
                      className={`flex items-center gap-1 transition-colors ${
                        hasSpecialChar ? "text-emerald-600" : "text-slate-400"
                      }`}
                    >
                      <IconMapper
                        name={hasSpecialChar ? "check_circle" : "circle"}
                        className="text-xs"
                      />
                      <span>1 ký tự đặc biệt</span>
                    </div>
                  </div>
                </div>

                {/* Field: Xác nhận mật khẩu mới */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Xác nhận mật khẩu mới
                    </label>
                    {isConfirmMismatched && (
                      <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1 animate-pulse">
                        <IconMapper name="error" className="text-xs" />
                        Không trùng khớp
                      </span>
                    )}
                    {isConfirmMatched && (
                      <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                        <IconMapper name="check_circle" className="text-xs" />
                        Trùng khớp
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setError("");
                      }}
                      placeholder="Nhập lại mật khẩu mới"
                      className={`w-full rounded-2xl border h-13 px-4 pr-12 text-sm outline-none transition-all font-medium text-slate-800 ${
                        isConfirmMismatched
                          ? "border-rose-300 bg-rose-50/30 focus:border-rose-500 focus:ring-4 focus:ring-rose-50"
                          : isConfirmMatched
                          ? "border-emerald-300 bg-emerald-50/20 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"
                          : "border-slate-100 bg-slate-50 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-50"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                    >
                      <IconMapper
                        name={showConfirmPassword ? "visibility_off" : "visibility"}
                        className="text-lg"
                      />
                    </button>
                  </div>
                </div>

                {/* Button Xác nhận đổi mật khẩu */}
                <button
                  type="submit"
                  disabled={
                    loading ||
                    !isPasswordValid ||
                    isConfirmMismatched ||
                    !confirmPassword
                  }
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black h-14 rounded-2xl transition-all shadow-xl shadow-blue-200/50 uppercase text-[11px] tracking-widest disabled:opacity-40 flex items-center justify-center gap-2 active:scale-[0.99] mt-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <IconMapper name="lock_reset" className="text-base" />
                      Xác nhận đổi mật khẩu
                    </>
                  )}
                </button>
              </form>
            )}

            {/* ======================= UI 4: THÀNH CÔNG ======================= */}
            {step === "SUCCESS" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4 flex flex-col items-center"
              >
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mb-4 border border-emerald-100 shadow-sm">
                  <IconMapper name="check_circle" className="text-4xl" />
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-2 uppercase">
                  Đổi mật khẩu thành công!
                </h3>
                <p className="text-slate-500 text-xs font-medium mb-6 leading-relaxed">
                  Mật khẩu mới của bạn đã được cập nhật an toàn vào hệ thống. Bạn có thể sử dụng mật khẩu mới này để đăng nhập ngay bây giờ.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    onSuccess(email);
                    onClose();
                  }}
                  className="w-full bg-slate-900 hover:bg-blue-600 text-white font-black h-14 rounded-2xl transition-all shadow-xl shadow-slate-200 uppercase text-[11px] tracking-widest flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  <IconMapper name="arrow_forward" className="text-base" />
                  Đăng nhập ngay
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
