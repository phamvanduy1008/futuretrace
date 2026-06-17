import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import SharedHeader from "../components/SharedHeader";
import SharedFooter from "../components/SharedFooter";
import { getCurrentUser } from "../services/authService";
import { apiFetch } from "../services/apiClient";
import { IconMapper } from "../components/IconMapper";
import { AnimatedBackground } from "../components/AnimatedBackground";

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({ simulations: 0, reports: 0, impact: 0 });
  const [recentSimulations, setRecentSimulations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const currentUser = getCurrentUser();
        setUser(currentUser);

        // Fetch real stats and recent simulations
        const response = await apiFetch("/dashboard/summary");
        if (response.ok) {
          const dashboardData = await response.json();
          setStats(
            dashboardData.stats || { simulations: 0, reports: 0, impact: 0 },
          );
          setRecentSimulations(dashboardData.recentSimulations || []);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <AnimatedBackground className="flex flex-col font-sans">
      <SharedHeader />

      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 max-w-[1440px] mx-auto w-full px-6 sm:px-10 py-12"
      >
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-20 px-2">
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-2 text-[9px] font-black text-blue-600 uppercase tracking-widest mb-4">
              RESEARCH NETWORK{" "}
              <IconMapper name="chevron_right" className=" text-[10px]" />{" "}
              TERMINAL v0.8
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight font-display text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-500 leading-normal pb-2 uppercase italic pt-2 pr-6">
              Trung tâm Phân tích
            </h1>
            <p className="text-slate-600 mt-4 text-lg font-medium italic">
              "Xin chào {user?.name || "Jane"}, hôm nay bạn muốn định lượng
              tương lai nào?"
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
                  Cố vấn AI
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
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/simulate")}
            className="md:col-span-8 group bg-slate-900 p-10 sm:p-14 rounded-[3rem] text-left transition-all shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-12 opacity-10 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-12">
              <IconMapper
                name="neurology"
                className=" text-[300px] text-white"
              />
            </div>
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-blue-500/30">
                  <IconMapper
                    name="add_circle"
                    className=" text-white text-4xl font-bold"
                  />
                </div>
                <h2 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-4 font-display uppercase tracking-tight italic leading-normal pt-2 pr-6">
                  Khởi tạo Mô phỏng Mới
                </h2>
                <p className="text-slate-400 text-xl max-w-md leading-relaxed font-medium italic opacity-80">
                  Kích hoạt Temporal Matrix Engine để dự báo quỹ đạo 5-10 năm
                  dựa trên biến số hiện tại.
                </p>
              </div>
              <div className="mt-12 flex items-center gap-4 text-blue-400 font-black text-[11px] uppercase tracking-widest">
                Bắt đầu ngay{" "}
                <IconMapper name="arrow_right_alt" className=" text-xl" />
              </div>
            </div>
          </motion.button>

          <motion.button
            variants={itemVariants}
            whileHover={{
              y: -8,
              boxShadow: "0 40px 80px -15px rgba(0,0,0,0.08)",
            }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/history")}
            className="md:col-span-4 group bg-white border border-slate-100 p-10 rounded-[3rem] text-left transition-all hover:border-blue-200 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] flex flex-col justify-between"
          >
            <div>
              <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors shadow-sm">
                <IconMapper name="history" className=" text-3xl font-bold" />
              </div>
              <h2 className="text-2xl font-black mb-3 font-display uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-500 italic leading-normal pt-1 pr-6">
                Lịch sử
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed font-medium italic">
                Truy xuất dữ liệu từ các kịch bản nghiên cứu đã lưu trữ.
              </p>
            </div>
            <div className="mt-8 pt-8 border-t border-slate-50 flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Xem kho lưu trữ
              </span>
              <IconMapper
                name="open_in_new"
                className=" text-slate-300 group-hover:text-blue-600 transition-colors"
              />
            </div>
          </motion.button>
        </div>

        {isLoading ? (
          <motion.div
            variants={itemVariants}
            className="space-y-8 animate-pulse text-center py-24"
          >
            <div className="flex flex-col items-center gap-6">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Đang trích xuất dữ liệu trung tâm...
              </p>
            </div>
          </motion.div>
        ) : recentSimulations.length > 0 ? (
          <motion.div variants={itemVariants} className="space-y-12">
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-4">
                <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">
                    Trung tâm Điều hành Temporal
                  </h3>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                    Trích xuất kịch bản mới nhất từ Ma trận xác suất
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate("/history")}
                className="group flex items-center gap-3 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-all"
              >
                Lịch sử toàn cầu
                <IconMapper
                  name="arrow_forward"
                  className="text-lg group-hover:translate-x-1 transition-transform"
                />
              </button>
            </div>

            {/* Main Hub Card */}
            <div className="relative group">
              {/* Background Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[3.5rem] blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>

              <div className="relative bg-white/80 backdrop-blur-2xl border border-white/20 rounded-[3.5rem] overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] transition-all duration-700 hover:shadow-[0_60px_130px_-30px_rgba(37,99,235,0.15)]">
                {/* Header Section */}
                <div className="p-10 sm:p-14 border-b border-slate-100/50">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                    <div className="flex items-start gap-8">
                      <div className="relative">
                        <div className="bg-slate-900 w-20 h-20 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-blue-900/40 relative z-10">
                          <IconMapper name="radar" className=" text-4xl animate-pulse" />
                        </div>
                        <div className="absolute -inset-2 bg-blue-500 rounded-3xl blur-xl opacity-20 animate-pulse"></div>
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <span className="px-3 py-1 bg-blue-600 text-white text-[8px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-blue-200">
                            Hoạt động
                          </span>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {recentSimulations[0].date}
                          </span>
                        </div>
                        <h4 className="text-3xl sm:text-5xl font-black text-slate-900 font-display leading-[1.6] sm:leading-[1.4] uppercase italic">
                          {recentSimulations[0].title}
                        </h4>
                        <div className="flex items-center gap-6 mt-6">
                          <div className="flex items-center gap-2">
                            <IconMapper name="fingerprint" className="text-blue-600 text-lg" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                              FT-IDENT: {recentSimulations[0].id.slice(-6).toUpperCase()}
                            </span>
                          </div>
                          <div className="h-4 w-px bg-slate-200"></div>
                          <div className="flex items-center gap-2">
                            <IconMapper name="verified" className="text-emerald-500 text-lg" />
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                              Tỉ lệ khớp 98.4%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

          
                  </div>
                </div>

                {/* Sub-scenarios Preview Grid */}
                <div className="p-10 sm:p-8 bg-slate-50/50">
                  <div className="mb-10 flex items-center justify-between">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">
                      Lộ trình đa phân cực (Matrix Nodes)
                    </h5>
                    <div className="flex gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                      <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                      <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {(recentSimulations[0].scenarios || []).map((scenario: any, idx: number) => (
                      <motion.div
                        key={idx}
                        whileHover={{ y: -5 }}
                        onClick={() => navigate(`/detail/${scenario.id || recentSimulations[0].id}`, { state: { scenario: scenario } })}
                        className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group/card cursor-pointer"
                      >
                        <div className={`absolute top-0 right-0 w-24 h-24 -mr-12 -mt-12 rounded-full blur-2xl opacity-10 transition-opacity group-hover/card:opacity-30 ${
                          scenario.type === 'Positive' ? 'bg-emerald-500' : 
                          scenario.type === 'Risk' ? 'bg-rose-500' : 'bg-blue-500'
                        }`}></div>
                        
                        <div className="flex justify-between items-start mb-6">
                           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${
                             scenario.type === 'Positive' ? 'bg-emerald-50 text-emerald-600' :
                             scenario.type === 'Risk' ? 'bg-rose-50 text-rose-600' :
                             'bg-blue-50 text-blue-600'
                           }`}>
                             <IconMapper name={scenario.type === 'Positive' ? 'trending_up' : scenario.type === 'Risk' ? 'warning' : 'equalizer'} className="text-xl" />
                           </div>
                           <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-md">
                             NODE 0{idx + 1}
                           </span>
                        </div>

                        <h6 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-3 group-hover/card:text-blue-600 transition-colors">
                          {scenario.title}
                        </h6>
                        <p className="text-xs text-slate-500 font-medium italic line-clamp-2 mb-8 leading-relaxed">
                          "{scenario.description}"
                        </p>

                        <div className="space-y-4 pt-6 border-t border-slate-50">
                          <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-400">
                            <span>Hạnh phúc</span>
                            <span className="text-slate-900">+{scenario.metrics.happiness}%</span>
                          </div>
                          <div className="h-1 w-full bg-slate-50 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-1000 ${
                                scenario.type === 'Positive' ? 'bg-emerald-500' :
                                scenario.type === 'Risk' ? 'bg-rose-500' : 'bg-blue-500'
                              }`} 
                              style={{ width: `${scenario.metrics.happiness}%` }}
                            ></div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            variants={itemVariants}
            className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200 shadow-sm px-10"
          >
            <IconMapper
              name="inbox_customize"
              className="text-6xl text-slate-100 mb-6 block mx-auto"
            />
            <p className="text-slate-400 font-black uppercase tracking-widest text-[11px] mb-8">
              Chưa có quỹ đạo kịch bản nghiên cứu nào
            </p>
            <button
              onClick={() => navigate("/simulate")}
              className="bg-slate-900 text-white px-10 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg"
            >
              Chạy mô phỏng đầu tiên
            </button>
          </motion.div>
        )}
      </motion.main>

      <SharedFooter />
    </AnimatedBackground>
  );
};

export default DashboardPage;
