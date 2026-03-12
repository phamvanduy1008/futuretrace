import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import SharedHeader from "../components/SharedHeader";
import SharedFooter from "../components/SharedFooter";
import { getCurrentUser } from "../services/authService";
import { apiFetch } from "../services/apiClient";

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = getCurrentUser();

  const fetchHistory = async () => {
    try {
      const response = await apiFetch('/simulations?limit=5');
      if (response.ok) {
        const data = await response.json();
        setHistory(data.items);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 100 },
    },
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc]">
      <SharedHeader />

      <motion.main
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="flex-1 p-6 sm:p-10 lg:p-16 max-w-7xl mx-auto w-full"
      >
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-md uppercase tracking-widest shadow-lg shadow-blue-500/20">
                System Online
              </span>
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                Protocol 4.0
              </span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tighter font-display text-slate-900 leading-none">
              Trung tâm Phân tích
            </h1>
            <p className="text-slate-500 mt-4 text-lg font-medium">
              Xin chào {user?.name || "Jane"}, hôm nay bạn muốn định lượng tương lai nào?
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex flex-col items-end gap-3"
          >
            <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-100 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.05)]">
              <div className="flex -space-x-3 px-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 shadow-sm overflow-hidden"
                  >
                    <img
                      src={`https://i.pravatar.cc/100?img=${i + 10}`}
                      alt="avatar"
                    />
                  </div>
                ))}
              </div>
              <div className="h-8 w-px bg-slate-200"></div>
              <div className="pr-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                  Cố văn AI
                </p>
                <p className="text-xs font-black text-blue-600">
                  3 Đang sẵn sàng
                </p>
              </div>
            </div>
          </motion.div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-16">
          <motion.button
            variants={itemVariants}
            whileHover={{
              y: -8,
              boxShadow: "0 40px 80px -15px rgba(0,0,0,0.15)",
            }}
            onClick={() => navigate("/simulate")}
            className="md:col-span-8 group bg-slate-900 p-10 sm:p-14 rounded-[3rem] text-left transition-all shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-12 opacity-10 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-12">
              <span className="material-symbols-outlined text-[300px] text-white">
                neurology
              </span>
            </div>
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-blue-500/30">
                  <span className="material-symbols-outlined text-white text-4xl font-bold">
                    add_circle
                  </span>
                </div>
                <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 font-display uppercase tracking-tight">
                  Khởi tạo Mô phỏng Mới
                </h2>
                <p className="text-slate-400 text-xl max-w-md leading-relaxed font-medium">
                  Kích hoạt Temporal Matrix Engine để dự báo quỹ đạo 5-10 năm
                  dựa trên biến số hiện tại.
                </p>
              </div>
              <div className="mt-12 flex items-center gap-4 text-blue-400 font-black text-[11px] uppercase tracking-[0.3em]">
                Bắt đầu ngay{" "}
                <span className="material-symbols-outlined text-xl">
                  arrow_right_alt
                </span>
              </div>
            </div>
          </motion.button>

          <motion.button
            variants={itemVariants}
            whileHover={{
              y: -8,
              boxShadow: "0 40px 80px -15px rgba(0,0,0,0.08)",
            }}
            onClick={() => navigate("/history")}
            className="md:col-span-4 group bg-white border border-slate-100 p-10 rounded-[3rem] text-left transition-all hover:border-blue-200 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] flex flex-col justify-between"
          >
            <div>
              <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors shadow-sm">
                <span className="material-symbols-outlined text-3xl font-bold">
                  history
                </span>
              </div>
              <h2 className="text-2xl font-black mb-3 font-display uppercase tracking-tight text-slate-900">
                Lịch sử
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">
                {loading ? "Đang tải dữ liệu..." : `Truy xuất dữ liệu từ ${history.length} kịch bản nghiên cứu đã lưu trữ.`}
              </p>
            </div>
            <div className="mt-8 pt-8 border-t border-slate-50 flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Xem kho lưu trữ
              </span>
              <span className="material-symbols-outlined text-slate-300 group-hover:text-blue-600 transition-colors">
                open_in_new
              </span>
            </div>
          </motion.button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : history.length > 0 ? (
          <motion.div variants={itemVariants} className="space-y-8">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                Kịch bản Quan trọng Nhất
              </h3>
              <button
                onClick={() => navigate("/history")}
                className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
              >
                Tất cả lịch sử
              </button>
            </div>

            <div className="bg-white border border-slate-100 rounded-[3rem] p-10 sm:p-14 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] relative overflow-hidden group hover:shadow-[0_60px_120px_-30px_rgba(0,0,0,0.12)] transition-all">
              <div className="absolute top-0 left-0 w-2 h-full bg-blue-600 shadow-[2px_0_10px_rgba(37,99,235,0.3)]"></div>
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-8">
                <div className="flex items-start gap-6">
                  <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center text-blue-600 shrink-0 shadow-sm border border-blue-100">
                    <span className="material-symbols-outlined text-4xl">
                      work_history
                    </span>
                  </div>
                  <div>
                    <h4 className="text-2xl sm:text-3xl font-black text-slate-900 font-display tracking-tight leading-tight">
                      {history[0].title}
                    </h4>
                    <div className="flex items-center gap-4 mt-4">
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-md">
                        ID: {history[0].id}
                      </p>
                      <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                      <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                        Độ tin cậy {history[0].reliability}%
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() =>
                    navigate(`/detail/${history[0].id}`, {
                      state: { scenario: history[0] },
                    })
                  }
                  className="bg-slate-900 text-white px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-blue-600 transition-all shadow-xl shadow-slate-200"
                >
                  Chi tiết báo cáo
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-14 pt-8 border-t border-slate-50">
                {[
                  {
                    label: "Tăng trưởng",
                    val: history[0].metrics?.career || 0,
                    color: "bg-blue-600",
                  },
                  {
                    label: "Hạnh phúc",
                    val: history[0].metrics?.happiness || 0,
                    color: "bg-emerald-500",
                  },
                  {
                    label: "Lợi nhuận (ROI)",
                    val: history[0].metrics?.roi || 0,
                    color: "bg-indigo-600",
                  },
                ].map((metric, i) => (
                  <div key={i} className="space-y-5">
                    <div className="flex justify-between items-end">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {metric.label}
                      </p>
                      <p className="text-3xl font-black text-slate-900">
                        +{metric.val}%
                      </p>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${metric.val}%` }}
                        className={`h-full ${metric.color} shadow-[0_0_10px_rgba(0,0,0,0.1)]`}
                        transition={{
                          delay: 0.8 + i * 0.2,
                          duration: 1.5,
                          type: "spring" as const,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div variants={itemVariants} className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
            <p className="text-slate-400 font-medium">Chưa có kịch bản nào được mô phỏng.</p>
            <button onClick={() => navigate("/simulate")} className="mt-4 text-blue-600 font-bold hover:underline font-display uppercase tracking-widest text-xs">
              Tạo kịch bản đầu tiên ngay
            </button>
          </motion.div>
        )}
      </motion.main>

      <SharedFooter />
    </div>
  );
};

export default DashboardPage;
