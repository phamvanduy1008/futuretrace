import React, { useEffect, useState } from "react";

const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || "https://futuretrace-server.onrender.com";

/**
 * Đồng ý xử lý dữ liệu cá nhân (Luật BVDLCN 2025) trước khi dùng tính năng AI.
 * Hiện khi người dùng đã đăng nhập nhưng chưa có consent, hoặc khi API trả CONSENT_REQUIRED.
 * Dưới 16 tuổi: bắt buộc xác nhận cha mẹ / người giám hộ đã đồng ý.
 */
export const ConsentGate: React.FC<{ isAuthenticated: boolean }> = ({ isAuthenticated }) => {
  const [open, setOpen] = useState(false);
  const [birthYear, setBirthYear] = useState("");
  const [agree, setAgree] = useState(false);
  const [guardian, setGuardian] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return setOpen(false);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      if (user && !user.consent) setOpen(true);
    } catch {
      /* dữ liệu cục bộ hỏng: chờ /auth/me cập nhật */
    }
    const onRequired = () => setOpen(true);
    window.addEventListener("consent-required", onRequired);
    return () => window.removeEventListener("consent-required", onRequired);
  }, [isAuthenticated]);

  if (!open) return null;

  const year = Number(birthYear);
  const age = year ? new Date().getFullYear() - year : null;
  const isMinor = age !== null && age < 16;
  const canSubmit = agree && year > 1900 && (!isMinor || guardian) && !saving;

  const submit = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/consent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ accepted: true, birthYear: year, guardianConfirmed: guardian }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || "Không lưu được.");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...user, consent: body.user?.consent || { acceptedAt: new Date().toISOString() } }));
      setOpen(false);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-auto">
        <h2 className="text-xl font-black text-slate-900 mb-2">Đồng ý xử lý dữ liệu cá nhân</h2>
        <p className="text-sm text-slate-600 leading-relaxed mb-4">
          Để mô phỏng tương lai cho bạn, FutureTrace xử lý thông tin bạn nhập: mong muốn học tập, học lực, mức áp lực,
          khả năng tài chính gia đình. Dữ liệu chỉ dùng để tạo kết quả và cải thiện chất lượng hệ thống, được gửi tới máy chủ AI
          (có thể đặt ngoài Việt Nam) không kèm họ tên, email. Bạn có thể xóa tài khoản và toàn bộ dữ liệu bất cứ lúc nào trong
          trang Hồ sơ.{" "}
          <a href="#/privacy" target="_blank" rel="noreferrer" className="text-blue-600 underline">Đọc chính sách đầy đủ</a>
        </p>
        <label className="block text-xs font-bold text-slate-600 mb-1">Năm sinh</label>
        <input
          type="number"
          inputMode="numeric"
          className="w-full border border-slate-200 rounded-2xl px-4 py-3 mb-4 text-sm"
          placeholder="vd 2008"
          value={birthYear}
          onChange={(e) => setBirthYear(e.target.value)}
        />
        <label className="flex gap-3 items-start text-sm text-slate-700 mb-3">
          <input type="checkbox" className="mt-1" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
          <span>Tôi đã đọc và đồng ý với chính sách xử lý dữ liệu cá nhân của FutureTrace.</span>
        </label>
        {isMinor && (
          <label className="flex gap-3 items-start text-sm text-slate-700 mb-3 bg-amber-50 border border-amber-100 rounded-2xl p-3">
            <input type="checkbox" className="mt-1" checked={guardian} onChange={(e) => setGuardian(e.target.checked)} />
            <span>Bạn dưới 16 tuổi: cha mẹ hoặc người giám hộ của bạn đã đọc chính sách và đồng ý cho bạn sử dụng FutureTrace.</span>
          </label>
        )}
        {error && <p className="text-sm text-rose-600 mb-3">{error}</p>}
        <button
          disabled={!canSubmit}
          onClick={submit}
          className="w-full bg-slate-900 hover:bg-blue-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black text-xs uppercase tracking-widest py-4 rounded-2xl transition"
        >
          {saving ? "Đang lưu..." : "Đồng ý và tiếp tục"}
        </button>
      </div>
    </div>
  );
};

export default ConsentGate;
