
import React, { useState, useEffect } from 'react';
import SharedHeader from '../components/SharedHeader';
import SharedFooter from '../components/SharedFooter';
import { motion, AnimatePresence } from 'framer-motion';
import { getProgress, saveProgress, deleteProgressItem } from '../data/mockDatabase';
import { ProgressItem } from '../types';
import { useNavigate, useSearchParams } from 'react-router-dom';

const ProgressPage: React.FC = () => {
  const [progressList, setProgressList] = useState<ProgressItem[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const list = getProgress();
    setProgressList(list);
    
    const id = searchParams.get('id');
    if (id) {
      const idx = list.findIndex(p => p.id === id);
      if (idx >= 0) {
        setSelectedIdx(idx);
      }
    }
  }, [searchParams]);

  const selectedProgress = progressList[selectedIdx];

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Bạn có chắc chắn muốn xóa tiến trình này?')) {
      deleteProgressItem(id);
      const updatedList = getProgress();
      setProgressList(updatedList);
      if (selectedIdx >= updatedList.length) {
        setSelectedIdx(Math.max(0, updatedList.length - 1));
      }
    }
  };

  const getMilestoneStatus = (item: ProgressItem, idx: number) => {
    if (item.completedMilestones.includes(idx)) return 'Đã hoàn thành';
    // The first uncompleted milestone is "In Progress"
    const firstUncompleted = item.report.milestones.findIndex((_, i) => !item.completedMilestones.includes(i));
    if (idx === firstUncompleted) return 'Đang tiến hành';
    return 'Chưa bắt đầu';
  };

  if (progressList.length === 0) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
        <SharedHeader />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center mb-8">
            <span className="material-symbols-outlined text-slate-400 text-5xl">trending_up</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4 uppercase italic">Chưa có tiến trình nào</h2>
          <p className="text-slate-500 max-w-md mb-10 font-medium">Hãy tạo kịch bản chi tiết từ các kịch bản mô phỏng để bắt đầu theo dõi tiến trình của bạn.</p>
          <button onClick={() => navigate('/simulate')} className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-blue-500/20">Bắt đầu mô phỏng</button>
        </main>
        <SharedFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      <SharedHeader />
      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 sm:px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16">
        <div className="lg:col-span-8 flex flex-col gap-10">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-2 text-[9px] font-black text-blue-600 uppercase tracking-widest mb-4">
              BẢNG ĐIỀU KHIỂN <span className="material-symbols-outlined text-[10px]">chevron_right</span> TIẾN TRÌNH CỦA TÔI
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4 font-display text-slate-900 leading-tight uppercase italic">Theo dõi Quỹ đạo Thực thi</h1>
            <p className="text-slate-500 text-sm sm:text-lg leading-relaxed max-w-2xl font-medium italic">
              "Quản lý các cột mốc và điều chỉnh chiến lược dựa trên tiến độ thực tế của bạn."
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {progressList.map((item, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={item.id} 
                onClick={() => setSelectedIdx(i)}
                className={`group p-8 sm:p-10 flex flex-col gap-8 cursor-pointer transition-all rounded-[2.5rem] border bg-white ${
                  selectedIdx === i 
                    ? 'border-blue-600 ring-2 ring-blue-600/10 shadow-[0_40px_80px_-15px_rgba(37,99,235,0.15)]' 
                    : 'border-slate-100 hover:border-slate-200 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)]'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className={`w-14 h-14 flex items-center justify-center rounded-2xl border transition-all ${
                    selectedIdx === i ? 'bg-blue-600 text-white border-blue-600 scale-110 shadow-lg shadow-blue-500/20' : 'bg-slate-50 text-slate-400 border-slate-100'
                  }`}>
                    <span className="material-symbols-outlined text-2xl">trending_up</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => handleDelete(e, item.id)}
                      className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center shadow-sm"
                      title="Xóa tiến trình"
                    >
                      <span className="material-symbols-outlined text-xl">delete</span>
                    </button>
                    <span className={`text-[8px] sm:text-[10px] font-black uppercase px-4 py-1.5 rounded-xl border shadow-sm bg-blue-50 text-blue-600 border-blue-100`}>
                      {item.category}
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-black mb-3 text-slate-900 group-hover:text-blue-600 transition-colors font-display tracking-tight leading-tight uppercase italic">{item.title}</h3>
                  <p className="text-xs text-slate-400 font-black uppercase tracking-widest mb-2">{item.date}</p>
                  <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 font-medium italic opacity-80">"{item.scenario.description}"</p>
                </div>
                <div className="space-y-4 pt-4 border-t border-slate-50">
                   <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                     <span>TIẾN ĐỘ HOÀN THÀNH</span>
                     <span className="text-blue-600">{Math.round((item.completedMilestones.length / item.report.milestones.length) * 100)}%</span>
                   </div>
                   <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                     <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${(item.completedMilestones.length / item.report.milestones.length) * 100}%` }} 
                        className="h-full bg-blue-600 shadow-sm" 
                        transition={{ duration: 0.8 }}
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
               key={selectedIdx}
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 1.05 }}
               className="bg-white border border-slate-200 rounded-[3rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.12)] lg:sticky lg:top-32"
             >
                <div className="p-10 sm:p-12 border-b border-slate-100 bg-slate-50/50">
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] block mb-4">CHI TIẾT TIẾN TRÌNH</span>
                  <h2 className="text-2xl sm:text-4xl font-black text-slate-900 font-display tracking-tight leading-none uppercase italic">{selectedProgress.title}</h2>
                </div>
                
                <div className="p-10 sm:p-12 space-y-12">
                   <div className="space-y-6">
                      <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                         <span className="material-symbols-outlined text-blue-600 text-xl">list_alt</span> CÁC CỘT MỐC TIẾP THEO
                      </h4>
                      <div className="space-y-4">
                        {selectedProgress.report.milestones.map((m, idx) => {
                          const status = getMilestoneStatus(selectedProgress, idx);
                          return (
                            <div key={idx} className={`p-6 rounded-2xl border flex items-center gap-4 transition-all ${
                              status === 'Đã hoàn thành' 
                                ? 'bg-emerald-50 border-emerald-100 opacity-60' 
                                : status === 'Đang tiến hành'
                                ? 'bg-amber-50 border-amber-200 ring-1 ring-amber-500/20 shadow-sm'
                                : 'bg-slate-50 border-slate-100'
                            }`}>
                              <div className="flex flex-col flex-1 min-w-0">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{m.month}</span>
                                <span className={`text-sm font-bold break-words leading-tight ${status === 'Đã hoàn thành' ? 'text-emerald-700 line-through' : 'text-slate-900'}`}>{m.event}</span>
                              </div>
                              <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center border transition-all ${
                                status === 'Đã hoàn thành' ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-200' :
                                status === 'Đang tiến hành' ? 'bg-amber-500 text-white border-amber-500 animate-pulse shadow-lg shadow-amber-200' :
                                'bg-slate-100 text-slate-400 border-slate-200'
                              }`}>
                                <span className="material-symbols-outlined text-xl">
                                  {status === 'Đã hoàn thành' ? 'check_circle' : status === 'Đang tiến hành' ? 'pending' : 'circle'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                   </div>

                   <button 
                    onClick={() => navigate('/premium-analysis', { state: { 
                      scenario: selectedProgress.scenario, 
                      context: selectedProgress.context, 
                      timeframe: selectedProgress.timeframe,
                      existingProgress: selectedProgress
                    }})}
                    className="w-full py-6 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-blue-600 shadow-2xl shadow-slate-200 transition-all flex items-center justify-center gap-4 hover:gap-6 group"
                   >
                      VÀO CHI TIẾT LỘ TRÌNH <span className="material-symbols-outlined text-xl group-hover:scale-125 transition-transform">arrow_forward</span>
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

export default ProgressPage;
