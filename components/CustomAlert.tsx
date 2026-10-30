import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconMapper } from "./IconMapper";

export type AlertType = "info" | "success" | "warning" | "error" | "danger";

export interface AlertOptions {
  title?: string;
  message: string;
  type?: AlertType;
  confirmText?: string;
  cancelText?: string;
}

interface DialogItem extends AlertOptions {
  id: string;
  mode: "alert" | "confirm";
  resolve: (value: boolean) => void;
}

interface AlertContextValue {
  showAlert: (
    messageOrOptions: string | AlertOptions,
    type?: AlertType,
    title?: string
  ) => Promise<void>;
  showConfirm: (
    messageOrOptions: string | AlertOptions,
    options?: Partial<AlertOptions>
  ) => Promise<boolean>;
}

const AlertContext = createContext<AlertContextValue | null>(null);

const TYPE_META: Record<
  AlertType,
  {
    badge: string;
    defaultTitle: string;
    icon: string;
    stripGradient: string;
    iconBg: string;
    badgeText: string;
    confirmBtn: string;
  }
> = {
  info: {
    badge: "Thông báo hệ thống",
    defaultTitle: "Thông báo",
    icon: "info",
    stripGradient: "from-blue-600 via-indigo-600 to-blue-500",
    iconBg: "bg-blue-600 text-white shadow-blue-500/30",
    badgeText: "text-blue-600",
    confirmBtn:
      "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25",
  },
  success: {
    badge: "Hoàn tất",
    defaultTitle: "Thành công",
    icon: "check_circle",
    stripGradient: "from-emerald-500 via-teal-500 to-blue-600",
    iconBg: "bg-emerald-600 text-white shadow-emerald-500/30",
    badgeText: "text-emerald-600",
    confirmBtn:
      "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25",
  },
  warning: {
    badge: "Lưu ý",
    defaultTitle: "Cảnh báo",
    icon: "warning",
    stripGradient: "from-amber-400 via-orange-500 to-amber-500",
    iconBg: "bg-amber-500 text-white shadow-amber-500/30",
    badgeText: "text-amber-600",
    confirmBtn:
      "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25",
  },
  error: {
    badge: "Sự cố hệ thống",
    defaultTitle: "Đã xảy ra lỗi",
    icon: "error",
    stripGradient: "from-rose-500 via-red-600 to-orange-500",
    iconBg: "bg-rose-600 text-white shadow-rose-500/30",
    badgeText: "text-rose-600",
    confirmBtn:
      "bg-slate-900 hover:bg-blue-600 text-white shadow-lg shadow-slate-900/20",
  },
  danger: {
    badge: "Xác nhận hành động",
    defaultTitle: "Xác nhận xóa",
    icon: "delete",
    stripGradient: "from-rose-500 via-red-600 to-rose-600",
    iconBg: "bg-rose-600 text-white shadow-rose-500/30",
    badgeText: "text-rose-600",
    confirmBtn:
      "bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-500/25",
  },
};

function inferAlertType(message: string): AlertType {
  const lower = message.toLowerCase();
  if (
    lower.includes("thành công") ||
    lower.includes("hoàn tất") ||
    lower.includes("đã lưu")
  ) {
    return "success";
  }
  if (
    lower.includes("lỗi") ||
    lower.includes("không thể") ||
    lower.includes("thất bại") ||
    lower.includes("không tải được")
  ) {
    return "error";
  }
  if (
    lower.includes("vui lòng") ||
    lower.includes("chức năng") ||
    lower.includes("đang được phát triển") ||
    lower.includes("cảnh báo")
  ) {
    return "warning";
  }
  return "info";
}

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [queue, setQueue] = useState<DialogItem[]>([]);
  const activeDialog = queue[0] || null;
  const confirmButtonRef = useRef<HTMLButtonElement | null>(null);

  const enqueue = useCallback(
    (
      mode: "alert" | "confirm",
      options: AlertOptions
    ): Promise<boolean> => {
      return new Promise((resolve) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        setQueue((prev) => [...prev, { ...options, id, mode, resolve }]);
      });
    },
    []
  );

  const showAlert = useCallback(
    async (
      messageOrOptions: string | AlertOptions,
      type?: AlertType,
      title?: string
    ): Promise<void> => {
      const opts: AlertOptions =
        typeof messageOrOptions === "string"
          ? {
              message: messageOrOptions,
              type: type || inferAlertType(messageOrOptions),
              title,
            }
          : {
              ...messageOrOptions,
              type:
                messageOrOptions.type ||
                inferAlertType(messageOrOptions.message),
            };
      await enqueue("alert", opts);
    },
    [enqueue]
  );

  const showConfirm = useCallback(
    async (
      messageOrOptions: string | AlertOptions,
      options?: Partial<AlertOptions>
    ): Promise<boolean> => {
      const base: AlertOptions =
        typeof messageOrOptions === "string"
          ? { message: messageOrOptions, ...options }
          : { ...messageOrOptions, ...options };

      const inferredType: AlertType =
        base.type ||
        (base.message.toLowerCase().includes("xóa") ? "danger" : "warning");

      return enqueue("confirm", {
        ...base,
        type: inferredType,
      });
    },
    [enqueue]
  );

  const closeActive = useCallback((result: boolean) => {
    setQueue((prev) => {
      if (prev.length === 0) return prev;
      const [current, ...rest] = prev;
      current.resolve(result);
      return rest;
    });
  }, []);

  // Intercept native window.alert so browser alert is never shown
  useEffect(() => {
    const originalAlert = window.alert;
    window.alert = (message?: any) => {
      showAlert(String(message ?? ""));
    };
    return () => {
      window.alert = originalAlert;
    };
  }, [showAlert]);

  // Keyboard support (Escape / Enter)
  useEffect(() => {
    if (!activeDialog) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeActive(false);
      } else if (e.key === "Enter") {
        e.preventDefault();
        closeActive(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeDialog, closeActive]);

  useEffect(() => {
    if (activeDialog) {
      const timer = setTimeout(() => {
        confirmButtonRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [activeDialog]);

  const meta = activeDialog
    ? TYPE_META[activeDialog.type || "info"]
    : TYPE_META.info;

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm }}>
      {children}

      <AnimatePresence>
        {activeDialog && (
          <div
            className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ft-alert-title"
            aria-describedby="ft-alert-message"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() =>
                closeActive(activeDialog.mode === "alert" ? true : false)
              }
              className="absolute inset-0 bg-slate-950/75 backdrop-blur-md"
            />

            {/* Dialog Card */}
            <motion.div
              key={activeDialog.id}
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: "spring", stiffness: 340, damping: 28 }}
              className="relative w-full max-w-md bg-white rounded-[2rem] shadow-[0_32px_90px_-15px_rgba(15,23,42,0.45)] border border-slate-100 overflow-hidden"
            >
              {/* Top Theme Accent Strip */}
              <div
                className={`h-1.5 w-full bg-gradient-to-r ${meta.stripGradient}`}
              />

              {/* Subtle Decorative Glow */}
              <div className="pointer-events-none absolute -top-20 -right-20 w-44 h-44 rounded-full bg-blue-500/5 blur-2xl" />

              <div className="p-7 sm:p-8">
                {/* Header: Icon + Badge + Title */}
                <div className="flex items-center gap-4 mb-5">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shrink-0 ${meta.iconBg}`}
                  >
                    <IconMapper name={meta.icon} className="w-6 h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-[10px] font-black uppercase tracking-widest mb-0.5 ${meta.badgeText}`}
                    >
                      {meta.badge}
                    </p>
                    <h3
                      id="ft-alert-title"
                      className="text-lg sm:text-xl font-black text-slate-900 leading-snug truncate"
                    >
                      {activeDialog.title || meta.defaultTitle}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      closeActive(activeDialog.mode === "alert" ? true : false)
                    }
                    className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors shrink-0"
                    aria-label="Đóng thông báo"
                  >
                    <IconMapper name="close" className="w-4 h-4" />
                  </button>
                </div>

                {/* Body Message */}
                <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-4 sm:p-5 mb-6">
                  <p
                    id="ft-alert-message"
                    className="text-slate-700 text-sm font-medium leading-relaxed whitespace-pre-line"
                  >
                    {activeDialog.message}
                  </p>
                </div>

                {/* Action Buttons */}
                {activeDialog.mode === "confirm" ? (
                  <div className="flex flex-col-reverse sm:flex-row items-center gap-3">
                    <button
                      type="button"
                      onClick={() => closeActive(false)}
                      className="w-full sm:flex-1 py-3.5 px-5 bg-slate-100 hover:bg-slate-200/80 text-slate-600 font-black text-[11px] uppercase tracking-widest rounded-xl transition-all"
                    >
                      {activeDialog.cancelText || "Hủy bỏ"}
                    </button>
                    <button
                      ref={confirmButtonRef}
                      type="button"
                      onClick={() => closeActive(true)}
                      className={`w-full sm:flex-1 py-3.5 px-5 font-black text-[11px] uppercase tracking-widest rounded-xl transition-all ${meta.confirmBtn}`}
                    >
                      {activeDialog.confirmText || "Xác nhận"}
                    </button>
                  </div>
                ) : (
                  <button
                    ref={confirmButtonRef}
                    type="button"
                    onClick={() => closeActive(true)}
                    className={`w-full py-3.5 px-6 font-black text-[11px] uppercase tracking-widest rounded-xl transition-all ${meta.confirmBtn}`}
                  >
                    {activeDialog.confirmText || "Đã hiểu"}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AlertContext.Provider>
  );
};

export const useAlert = (): AlertContextValue => {
  const ctx = useContext(AlertContext);
  if (!ctx) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return ctx;
};

