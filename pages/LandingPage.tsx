
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SharedHeader from '../components/SharedHeader';
import SharedFooter from '../components/SharedFooter';
import { IconMapper } from '../components/IconMapper';
import { AnimatedBackground } from '../components/AnimatedBackground';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <AnimatedBackground className="flex flex-col">
      <SharedHeader />

      <main className="flex-1">
        <section className="px-6 pt-24 pb-32 mx-auto max-w-7xl flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-3 px-4 py-1.5 mb-14 text-[10px] font-black tracking-widest uppercase border border-slate-200 text-slate-600 rounded-full bg-slate-50/50"
          >
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            Intelligence Simulation System v4.0
          </motion.div>

          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-5xl font-black mb-12 tracking-tight text-slate-900 font-display"
          >
            <span className="block text-5xl md:text-8xl mb-4 md:mb-6 leading-tight">Dự báo tương lai</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500 block text-4xl md:text-7xl leading-normal pb-4">bằng dữ liệu mô phỏng.</span>
          </motion.h1>

          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="max-w-2xl text-xl text-slate-600 mb-16 leading-relaxed font-medium"
          >
            Xây dựng bản đồ hệ quả dài hạn cho các quyết định sự nghiệp và tài chính quan trọng của bạn thông qua AI.
          </motion.p>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center gap-6"
          >
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 20px 40px -10px rgba(37,99,235,0.3)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/register')}
              className="bg-slate-900 hover:bg-blue-600 text-white px-12 py-5 font-black rounded-2xl shadow-2xl flex items-center gap-3 text-xs uppercase tracking-widest transition-colors"
            >
              Chạy mô phỏng đầu tiên
              <IconMapper name="bolt" className=" text-[20px]" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-12 py-5 font-black text-slate-900 border border-slate-200 hover:bg-slate-50 transition-colors rounded-2xl text-xs uppercase tracking-widest"
            >
              Tài liệu kỹ thuật
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="hidden lg:block relative z-30 max-w-5xl mx-auto mt-24 px-6 perspective-1000"
          >
            <div className="bg-white/50 backdrop-blur-2xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white p-2 flex flex-col items-center">
              <div className="w-full flex items-center justify-between px-6 py-4 bg-white/40 rounded-t-2xl border-b border-white">
                <div className="flex gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                </div>
                <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                  Temporal Matrix Engine / System Stable
                </div>
                <div className="w-12"></div>
              </div>
              <div className="aspect-[21/10] w-full bg-gradient-to-b from-slate-50/20 to-transparent p-12 flex items-center justify-center relative overflow-hidden rounded-b-2xl">

                {/* Dòng Chảy Dữ Liệu Phát Sáng (Animated Data Flow) */}
                <div className="absolute inset-0 opacity-40">
                  <svg className="w-full h-full drop-shadow-[0_0_8px_rgba(37,99,235,0.4)]" fill="none" viewBox="0 0 1000 400">
                    {/* Đường nét mờ */}
                    <path d="M0 200C150 200 200 50 400 50C600 50 650 350 800 350C950 350 1000 200 1000 200" stroke="#cbd5e1" strokeDasharray="8 8" strokeWidth="1.5" className="opacity-50"></path>
                    {/* Dòng chảy di chuyển */}
                    <motion.path
                      d="M0 200C150 200 200 50 400 50C600 50 650 350 800 350C950 350 1000 200 1000 200"
                      stroke="#2563eb"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: [0, 1, 1, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    />
                    <line stroke="#f1f5f9" strokeWidth="1" x1="0" x2="1000" y1="200" y2="200"></line>
                  </svg>
                </div>

                <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 w-full max-w-5xl z-10">

                  {/* Khối Trái (Cảm biến) */}
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="border border-white/60 p-10 rounded-3xl bg-white/70 backdrop-blur-md shadow-lg flex flex-col items-center hover:bg-white transition-colors"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 shadow-sm border border-slate-100">
                      <IconMapper name="insights" className="text-slate-400 text-3xl" />
                    </div>
                    <div className="h-1.5 w-32 bg-slate-200 rounded-full mb-3"></div>
                    <div className="h-1.5 w-20 bg-slate-200/50 rounded-full"></div>
                  </motion.div>

                  {/* Khối Giữa (Active Core) */}
                  <motion.div
                    animate={{ y: [0, -15, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    className="relative"
                  >
                    {/* Quầng sáng lơ lửng (Glowing shadow) */}
                    <div className="absolute -inset-4 bg-blue-500/20 blur-2xl rounded-full opacity-70 animate-pulse-slow"></div>

                    <div className="border border-blue-500/30 p-10 rounded-3xl bg-white/90 backdrop-blur-xl flex flex-col items-center shadow-[0_20px_50px_-15px_rgba(37,99,235,0.3)] transform scale-110 relative z-10 ring-4 ring-white/50">
                      <div className="absolute -top-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[8px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-blue-500/30 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                        Active Core
                      </div>
                      <div className="w-20 h-20 rounded-3xl bg-blue-50 flex items-center justify-center mb-6 border border-blue-100 relative group cursor-pointer overflow-hidden">
                        <div className="absolute inset-0 bg-blue-600/10 group-hover:bg-blue-600/20 transition-colors"></div>
                        <IconMapper name="psychology" className="text-blue-600 text-4xl mb-1 font-bold group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="h-2 w-40 bg-blue-100 rounded-full mb-3 overflow-hidden relative">
                        <motion.div
                          className="absolute top-0 left-0 bottom-0 bg-blue-500"
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </div>
                      <div className="h-2 w-24 bg-slate-200 rounded-full"></div>
                    </div>
                  </motion.div>

                  {/* Khối Phải (Đầu ra) */}
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="border border-white/60 p-10 rounded-3xl bg-white/70 backdrop-blur-md shadow-lg flex flex-col items-center hover:bg-white transition-colors"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 shadow-sm border border-slate-100">
                      <IconMapper name="account_tree" className="text-slate-400 text-3xl" />
                    </div>
                    <div className="h-1.5 w-32 bg-slate-200 rounded-full mb-3"></div>
                    <div className="h-1.5 w-20 bg-slate-200/50 rounded-full"></div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="px-10 py-24 mx-auto max-w-7xl border-y border-slate-100 bg-slate-50/30">
          <div className="flex flex-col md:flex-row justify-between items-center gap-16">
            <div className="text-left max-w-lg">
              <h3 className="text-xs font-black uppercase tracking-widest text-blue-600 mb-6">Độ tin cậy toán học</h3>
              <p className="text-slate-900 text-2xl font-black leading-snug font-display uppercase italic">
                Sử dụng bởi các nhà nghiên cứu dữ liệu và chiến lược gia tổ chức trên 40 quốc gia.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-16 opacity-30 grayscale font-black text-2xl tracking-tighter italic text-slate-900">
              <span>MIT LABS</span>
              <span>STANFORD AI</span>
              <span>OXFORD DATA</span>
            </div>
          </div>
        </section>
      </main>

      <SharedFooter />
    </AnimatedBackground>
  );
};

export default LandingPage;
