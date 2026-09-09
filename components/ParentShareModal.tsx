import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  X,
  ShareNetwork,
  Copy,
  Check,
  QrCode,
  ArrowSquareOut,
  ChatCircleDots,
  ShieldCheck,
  Heart,
  DeviceMobile,
  CloudCheck,
  PaperPlaneTilt,
} from "@phosphor-icons/react";

interface ParentShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
  scenarioTitle: string;
  categoryTag?: string;
}

export const ParentShareModal: React.FC<ParentShareModalProps> = ({
  isOpen,
  onClose,
  shareUrl,
  scenarioTitle,
  categoryTag,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [activeTab, setActiveTab] = useState<"qr" | "message">("qr");

  if (!isOpen) return null;

  const sampleMessage = `Ba mẹ ơi, con vừa xem phân tích định hướng "${scenarioTitle}" trên hệ thống FutureTrace và có bản tóm tắt dành riêng cho phụ huynh (về mức học phí dự kiến, thời gian con tự lập tài chính và kế hoạch dự phòng). Ba mẹ xem qua link này trên điện thoại giúp con nhé:\n${shareUrl}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = shareUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(sampleMessage);
      setCopiedMsg(true);
      setTimeout(() => setCopiedMsg(false), 2500);
    } catch {
      setCopiedMsg(true);
      setTimeout(() => setCopiedMsg(false), 2500);
    }
  };

  const handleShareZalo = () => {
    window.open(
      `https://chat.zalo.me/?url=${encodeURIComponent(shareUrl)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleShareFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] border-2 border-slate-100 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Unified Light Header - Aligned with FutureTrace clean tone */}
        <div className="bg-slate-50/80 px-6 sm:px-8 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shadow-sm">
              <ShareNetwork size={22} weight="bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-black text-slate-900 text-base sm:text-lg tracking-tight uppercase italic">
                  Chia Sẻ Góc Nhìn Phụ Huynh
                </h3>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <CloudCheck size={12} weight="bold" /> Cloud Link
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Xem trực tiếp trên điện thoại • Cỡ chữ to rõ • Không cần tạo tài khoản
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors shadow-sm"
            title="Đóng"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 space-y-5 overflow-y-auto">
          {/* Active Scenario Card */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 truncate">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
              <div className="truncate">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                  Kịch bản được chia sẻ
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-900 truncate block font-display">
                  {scenarioTitle}
                </span>
              </div>
            </div>
            {categoryTag && (
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-xl shrink-0 border border-blue-100">
                {categoryTag}
              </span>
            )}
          </div>

          {/* Cloud Share Link Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                Đường dẫn liên kết cloud:
              </span>
              <span className="text-emerald-700 flex items-center gap-1 font-medium text-[11px]">
                <ShieldCheck size={14} weight="fill" /> Chỉ đọc an toàn
              </span>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-1.5 pl-3 focus-within:border-blue-500 focus-within:bg-white transition-all shadow-inner">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="bg-transparent text-xs text-slate-700 font-mono flex-1 outline-none truncate select-all"
              />
              <button
                onClick={handleCopyLink}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0 ${
                  copiedLink
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/10"
                }`}
              >
                {copiedLink ? (
                  <>
                    <Check size={15} weight="bold" /> Đã chép
                  </>
                ) : (
                  <>
                    <Copy size={15} weight="bold" /> Chép link
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Sharing Tabs Switcher */}
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
            <button
              onClick={() => setActiveTab("qr")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "qr"
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200/50"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <QrCode size={16} weight="bold" />
              Mã QR Quét Nhanh
            </button>
            <button
              onClick={() => setActiveTab("message")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "message"
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200/50"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <ChatCircleDots size={16} weight="bold" />
              Gửi Tin Nhắn Mẫu
            </button>
          </div>

          {/* Tab 1: QR Code & Direct Channels */}
          {activeTab === "qr" && (
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-slate-50/60 border border-slate-200/80 rounded-2xl p-4 sm:p-5 animate-fade-in">
              {/* Left Column: QR Code */}
              <div className="sm:col-span-5 flex flex-col items-center justify-center text-center">
                <div className="p-3 bg-white rounded-2xl border-2 border-slate-200 shadow-sm inline-block">
                  <QRCodeSVG
                    value={shareUrl}
                    size={155}
                    level="M"
                    includeMargin={true}
                    bgColor="#ffffff"
                    fgColor="#0f172a"
                  />
                </div>
                <span className="text-[11px] text-slate-500 mt-2 font-medium flex items-center gap-1">
                  <DeviceMobile size={14} className="text-blue-600" /> Quét bằng Camera / Zalo
                </span>
              </div>

              {/* Right Column: Direct Share Buttons */}
              <div className="sm:col-span-7 space-y-2.5 flex flex-col justify-center">
                <button
                  onClick={handleShareZalo}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/70 text-blue-900 font-bold text-xs transition-all group shadow-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-[11px] shadow-sm">
                      Zalo
                    </div>
                    <div className="text-left">
                      <span className="block text-xs font-bold text-slate-900">Gửi qua ứng dụng Zalo</span>
                      <span className="text-[10px] text-slate-500 font-normal">Mở khung chat gửi link</span>
                    </div>
                  </div>
                  <PaperPlaneTilt size={16} className="text-blue-600 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={handleShareFacebook}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs transition-all group shadow-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#1877F2] text-white flex items-center justify-center font-black text-[11px] shadow-sm">
                      FB
                    </div>
                    <div className="text-left">
                      <span className="block text-xs font-bold text-slate-900">Chia sẻ qua Facebook</span>
                      <span className="text-[10px] text-slate-500 font-normal">Gửi tin nhắn Messenger</span>
                    </div>
                  </div>
                  <PaperPlaneTilt size={16} className="text-[#1877F2] group-hover:translate-x-0.5 transition-transform" />
                </button>

                <a
                  href={shareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <ArrowSquareOut size={15} weight="bold" /> Xem trước giao diện phụ huynh
                </a>
              </div>
            </div>
          )}

          {/* Tab 2: Sample Message */}
          {activeTab === "message" && (
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ChatCircleDots size={16} weight="fill" className="text-blue-600" />
                  Mẫu tin nhắn ấm áp gửi cha mẹ:
                </span>
                <button
                  onClick={handleCopyMessage}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  {copiedMsg ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <Check size={14} weight="bold" /> Đã sao chép
                    </span>
                  ) : (
                    <>
                      <Copy size={14} weight="bold" /> Chép tin nhắn
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-700 italic bg-white p-3.5 rounded-xl border border-slate-200 leading-relaxed font-sans select-all whitespace-pre-line">
                {sampleMessage}
              </p>
              <p className="text-[11px] text-slate-500">
                💡 Bạn chỉ cần sao chép và dán vào Zalo/Messenger cho ba mẹ. Phụ huynh có thể mở đọc ngay lập tức mà không cần tài khoản.
              </p>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-400">
              FutureTrace • Gắn kết gia đình
            </span>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
            >
              Đóng lại
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
