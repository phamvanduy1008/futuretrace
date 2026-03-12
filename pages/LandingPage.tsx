
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SharedHeader from '../components/SharedHeader';
import SharedFooter from '../components/SharedFooter';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <SharedHeader />

      <main className="flex-1">
        <section className="px-6 pt-24 pb-32 mx-auto max-w-7xl flex flex-col items-center text-center">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-3 px-4 py-1.5 mb-14 text-[10px] font-black tracking-[0.2em] uppercase border border-slate-200 text-slate-500 rounded-full bg-slate-50/50"
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
            <span className="block text-5xl md:text-8xl mb-4 md:mb-6">Dự báo tương lai</span>
            <span className="text-blue-600 block text-4xl md:text-7xl">bằng dữ liệu mô phỏng.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="max-w-2xl text-xl text-slate-500 mb-16 leading-relaxed font-medium"
          >
            Xây dựng bản đồ hệ quả dài hạn cho các quyết định sự nghiệp và tài chính quan trọng của bạn thông qua AI.
          </motion.p>
          
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center gap-6"
          >
            <button 
              onClick={() => navigate('/register')}
              className="bg-slate-900 hover:bg-blue-600 text-white px-12 py-5 font-black rounded-2xl shadow-2xl shadow-slate-200 flex items-center gap-3 text-xs uppercase tracking-[0.2em] transition-all"
            >
              Chạy mô phỏng đầu tiên
              <span className="material-symbols-outlined text-[20px]">bolt</span>
            </button>
            <button className="px-12 py-5 font-black text-slate-900 border border-slate-200 hover:bg-slate-50 transition-all rounded-2xl text-xs uppercase tracking-[0.2em]">
              Tài liệu kỹ thuật
            </button>
          </motion.div>

          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="mt-40 w-full max-w-6xl relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-b from-blue-600/20 to-transparent blur-3xl opacity-20 -z-10"></div>
            <div className="border border-slate-200 rounded-3xl overflow-hidden shadow-2xl bg-white p-2">
              <div className="h-12 flex items-center justify-between px-6 border border-slate-100 bg-slate-50 rounded-2xl mb-2">
                <div className="flex gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
                </div>
                <div className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">Temporal Matrix Engine / System Stable</div>
                <div className="w-12"></div>
              </div>
              <div className="aspect-[21/10] w-full bg-white p-12 flex items-center justify-center relative overflow-hidden rounded-2xl border border-slate-100">
                <div className="absolute inset-0 opacity-5">
                  <svg className="w-full h-full" fill="none" viewBox="0 0 1000 400">
                    <path className="text-blue-600" d="M0 200C150 200 200 50 400 50C600 50 650 350 800 350C950 350 1000 200 1000 200" stroke="currentColor" strokeDasharray="8 8" strokeWidth="2"></path>
                    <line stroke="currentColor" strokeWidth="0.5" x1="0" x2="1000" y1="200" y2="200"></line>
                  </svg>
                </div>
                <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 w-full max-w-5xl z-10">
                  <div className="border border-slate-100 p-10 rounded-2xl bg-white shadow-sm flex flex-col items-center">
                    <span className="material-symbols-outlined text-slate-300 text-4xl mb-6">insights</span>
                    <div className="h-2 w-32 bg-slate-50 rounded-full mb-2"></div>
                    <div className="h-2 w-20 bg-slate-50/50 rounded-full"></div>
                  </div>
                  <div className="border-4 border-blue-600 p-10 rounded-3xl bg-white flex flex-col items-center shadow-2xl transform scale-110 relative">
                    <div className="absolute -top-4 bg-blue-600 text-white text-[8px] font-black px-4 py-1 rounded-full uppercase tracking-widest">Active Core</div>
                    <span className="material-symbols-outlined text-blue-600 text-5xl mb-6 font-bold">psychology</span>
                    <div className="h-2 w-40 bg-blue-50 rounded-full mb-3"></div>
                    <div className="h-2 w-24 bg-blue-50/50 rounded-full"></div>
                  </div>
                  <div className="border border-slate-100 p-10 rounded-2xl bg-white shadow-sm flex flex-col items-center">
                    <span className="material-symbols-outlined text-slate-300 text-4xl mb-6">account_tree</span>
                    <div className="h-2 w-32 bg-slate-50 rounded-full mb-2"></div>
                    <div className="h-2 w-20 bg-slate-50/50 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="px-10 py-24 mx-auto max-w-7xl border-y border-slate-100 bg-slate-50/30">
          <div className="flex flex-col md:flex-row justify-between items-center gap-16">
            <div className="text-left max-w-lg">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-blue-600 mb-6">Độ tin cậy toán học</h3>
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
    </div>
  );
};

export default LandingPage;
