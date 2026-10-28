import React, { useState } from "react";
import { logout } from "../services/authService";

const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || "https://futuretrace-server.onrender.com";
const CONFIRM_TEXT = "XOA TAI KHOAN";

/** Quyền xóa dữ liệu của chủ thể dữ liệu (Luật BVDLCN 2025) */
export const DeleteAccountSection: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [status, setStatus] = useState<"idle" | "deleting" | "error">("idle");
  const [message, setMessage] = useState("");

  const remove = async () => {
    setStatus("deleting");
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/account`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ confirm: text }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || "Không xóa được tài khoản.");
      logout();
      window.location.hash = "#/";
      window.location.reload();
    } catch (e: any) {
      setStatus("error");
      setMessage(e.message);
    }
  };

  return (
    <section className="max-w-5xl mx-auto w-full px-4 sm:px-6 pb-16">
      <div className="bg-white border border-rose-100 rounded-3xl p-6 sm:p-8">
        <h3 className="text-lg font-black text-slate-900 mb-1">Dữ liệu & quyền riêng tư</h3>
        <p className="text-sm text-slate-600 mb-4">
          Xem <a href="#/privacy" className="text-blue-600 underline">chính sách xử lý dữ liệu</a> và{" "}
          <a href="#/methodology" className="text-blue-600 underline">phương pháp tính số liệu</a>. Xóa tài khoản sẽ xóa vĩnh viễn
          mô phỏng, lộ trình, kết quả đánh giá, phản hồi và bài viết cộng đồng của bạn.
        </p>
        {!open ? (
          <button onClick={() => setOpen(true)} className="px-5 py-3 border border-rose-200 text-rose-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-rose-50">
            Xóa tài khoản
          </button>
        ) : (
          <div className="space-y-3">
            <label className="block text-sm text-slate-700">
              Gõ <strong>{CONFIRM_TEXT}</strong> để xác nhận:
            </label>
            <input className="w-full sm:w-80 border border-slate-200 rounded-2xl px-4 py-3 text-sm" value={text} onChange={(e) => setText(e.target.value)} />
            <div className="flex gap-3">
              <button
                disabled={text !== CONFIRM_TEXT || status === "deleting"}
                onClick={remove}
                className="px-5 py-3 bg-rose-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-2xl text-xs font-black uppercase tracking-widest"
              >
                {status === "deleting" ? "Đang xóa..." : "Xóa vĩnh viễn"}
              </button>
              <button onClick={() => { setOpen(false); setText(""); }} className="px-5 py-3 text-slate-500 text-xs font-black uppercase tracking-widest">
                Hủy
              </button>
            </div>
            {status === "error" && <p className="text-sm text-rose-600">{message}</p>}
          </div>
        )}
      </div>
    </section>
  );
};

export default DeleteAccountSection;
