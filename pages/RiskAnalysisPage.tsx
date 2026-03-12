
import React, { useState } from 'react';
import SharedHeader from '../components/SharedHeader';
import SharedFooter from '../components/SharedFooter';
import { motion, AnimatePresence } from 'framer-motion';
import { MOCK_RISKS } from '../data/mockDatabase';

const RiskAnalysisPage: React.FC = () => {
  const [selectedRiskIdx, setSelectedRiskIdx] = useState(0);
  const selectedRisk = MOCK_RISKS[selectedRiskIdx];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      <SharedHeader />
      
      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 sm:px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16">
        <div className="lg:col-span-8 flex flex-col gap-10">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-2 text-[9px] font-black text-blue-600 uppercase tracking-widest mb-4">
              BẢNG ĐIỀU KHIỂN <span className="material-symbols-outlined text-[10px]">chevron_right</span> GIÁM SÁT RỦI RO
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4 font-display text-slate-900 leading-tight">Giám sát Véc-tơ Đe dọa</h1>
            <p className="text-slate-500 text-sm sm:text-lg leading-relaxed max-w-2xl font-medium">
              Hệ thống AI liên tục phân tích các yếu tố gây mất ổn định tiềm tàng trong quỹ đạo của bạn.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MOCK_RISKS.map((risk, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={risk.id} 
                onClick={() => setSelectedRiskIdx(i)}
                className={`group p-8 sm:p-10 flex flex-col gap-8 cursor-pointer transition-all rounded-[2.5rem] border bg-white ${
                  selectedRiskIdx === i 
                    ? 'border-blue-600 ring-2 ring-blue-600/10 shadow-[0_40px_80px_-15px_rgba(37,99,235,0.15)]' 
                    : 'border-slate-100 hover:border-slate-200 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)]'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className={`w-14 h-14 flex items-center justify-center rounded-2xl border transition-all ${
                    selectedRiskIdx === i ? 'bg-blue-600 text-white border-blue-600 scale-110 shadow-lg shadow-blue-500/20' : 'bg-slate-50 text-slate-400 border-slate-100'
                  }`}>
                    <span className="material-symbols-outlined text-2xl">{risk.icon}</span>
                  </div>
                  <span className={`text-[8px] sm:text-[10px] font-black uppercase px-4 py-1.5 rounded-xl border shadow-sm ${risk.statusColor}`}>
                    {risk.status}
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl font-black mb-3 text-slate-900 group-hover:text-blue-600 transition-colors font-display tracking-tight leading-tight uppercase italic">{risk.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 font-medium italic opacity-80">"{risk.desc}"</p>
                </div>
                <div className="space-y-4 pt-4 border-t border-slate-50">
                   <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                     <span>XÁC SUẤT XẢY RA</span>
                     <span className="text-blue-600">{risk.prob}%</span>
                   </div>
                   <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                     <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${risk.prob}%` }} 
                        className="h-full bg-blue-600 shadow-sm" 
                        transition={{ duration: 0.8, delay: 0.5 }}
                     />
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <aside className="lg:col-span-4 mt-8 lg:mt-0">
           <AnimatePresence mode='wait'>
             <motion.div 
               key={selectedRiskIdx}
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 1.05 }}
               className="bg-white border border-slate-200 rounded-[3rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.12)] lg:sticky lg:top-32"
             >
                <div className="p-10 sm:p-12 border-b border-slate-100 bg-slate-50/50">
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] block mb-4">PHÂN TÍCH CHUYÊN SÂU</span>
                  <h2 className="text-2xl sm:text-4xl font-black text-slate-900 font-display tracking-tight leading-none uppercase italic">{selectedRisk.title}</h2>
                </div>
                
                <div className="p-10 sm:p-12 space-y-12">
                   <div className="grid grid-cols-2 gap-6 bg-slate-950 p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl">
                      <div className="text-center">
                         <span className="text-5xl font-black text-blue-500 block mb-2">{selectedRisk.score}</span>
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">CHỈ SỐ RỦI RO</p>
                      </div>
                      <div className="text-center border-l border-white/10">
                         <span className="text-2xl font-black text-white block mb-2">{selectedRisk.loss}</span>
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">DỰ BÁO TỔN THẤT</p>
                      </div>
                   </div>

                   <section className="space-y-6">
                      <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                         <span className="material-symbols-outlined text-blue-600 text-xl">psychology</span> PHƯƠNG ÁN XỬ LÝ AI
                      </h4>
                      <div className="p-8 border border-slate-100 rounded-[2rem] bg-slate-50/70 text-base text-slate-600 leading-relaxed font-medium italic shadow-inner">
                        "Cần can thiệp vào cấu trúc tài sản hiện tại và thiết lập các điểm dừng rủi ro (stop-loss) trong giai đoạn tiếp theo để đảm bảo tính thanh khoản."
                      </div>
                   </section>

                   <button className="w-full py-6 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-blue-600 shadow-2xl shadow-slate-200 transition-all flex items-center justify-center gap-4 hover:gap-6 group">
                      THỰC THI CHIẾN LƯỢC <span className="material-symbols-outlined text-xl group-hover:scale-125 transition-transform">bolt</span>
                   </button>
                </div>
             </motion.div>
           </AnimatePresence>
        </aside>
      </main>

      <SharedFooter />
    </div>
  );
};

export default RiskAnalysisPage;
