
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SharedHeader from '../components/SharedHeader';
import SharedFooter from '../components/SharedFooter';
import { ScenarioResult, SimulationData, Comment } from '../types';
import { saveToHistory, getComments, publishToCommunity, getProgressByScenarioId } from '../data/mockDatabase';

const ScenarioDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saveForm, setSaveForm] = useState({ 
    title: "", 
    category: "SỰ NGHIỆP",
    shareToCommunity: true,
    isAnonymous: false
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [existingProgress, setExistingProgress] = useState<any>(null);
  
  const state = location.state as { scenario: any, context?: SimulationData } | null;

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!state) {
      navigate('/history');
    } else {
      if (state.scenario && state.scenario.title) {
        setSaveForm(prev => ({ ...prev, title: state.scenario.title }));
        
        // Check for existing progress
        const progress = getProgressByScenarioId(state.scenario.id, state.scenario.title);
        if (progress) {
          setExistingProgress(progress);
        } else {
          setExistingProgress(null);
        }
      }
      if (id) {
        setComments(getComments(id));
      }
    }
  }, [state, navigate, id, location]);

  if (!state || !state.scenario) return null;

  const { scenario } = state;

  const displayRoi = scenario.roi ?? scenario.metrics?.roi ?? 0;
  const displayCareer = scenario.careerGrowth ?? scenario.metrics?.career ?? 0;
  const displayHappiness = scenario.happiness ?? scenario.metrics?.happiness ?? 0;
  const displayType = scenario.type || 'Positive';

  const [isTimeframeModalOpen, setIsTimeframeModalOpen] = useState(false);
  const [timeframe, setTimeframe] = useState(12);

  const handlePremiumClick = () => {
    setIsTimeframeModalOpen(true);
  };

  const handleConfirmTimeframe = () => {
    setIsTimeframeModalOpen(false);
    navigate('/premium-analysis', { state: { scenario, context: state.context, timeframe } });
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveForm.title.trim()) return;
    setIsSaving(true);
    
    const newItem = {
      id: `FT-${Math.floor(Math.random() * 9000) + 1000}`,
      title: saveForm.title,
      category: saveForm.category,
      author: saveForm.isAnonymous ? "Người dùng ẩn danh" : "Jane Doe",
      isAnonymous: saveForm.isAnonymous,
      date: new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
      desc: scenario.description,
      reliability: 95,
      color: displayType === 'Risk' ? 'bg-rose-500' : (displayType === 'Positive' ? 'bg-emerald-500' : 'bg-blue-500'),
      type: displayType,
      metrics: { career: displayCareer, happiness: displayHappiness, roi: displayRoi },
      deepAnalysis: scenario.deepAnalysis
    };

    setTimeout(() => {
      publishToCommunity(newItem); 
      setIsSaving(false);
      setIsSaved(true);
      setTimeout(() => {
        setIsModalOpen(false);
        navigate('/community');
      }, 1500);
    }, 1200);
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      authorId: 'u-me',
      authorName: 'Jane Doe (Bạn)',
      authorAvatar: 'https://i.pravatar.cc/150?img=10',
      content: newComment,
      date: 'VỪA XONG',
      likes: 0
    };

    setComments([comment, ...comments]);
    setNewComment("");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans relative">
      <SharedHeader />
      
      <main className="flex-1 max-w-[1200px] mx-auto w-full px-6 py-12 sm:py-24">
        {/* Lab Header */}
        <header className="mb-24">
          <div className="flex items-center gap-3 text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-10">
            <span className="material-symbols-outlined text-[16px]">science</span> Nghiên cứu chuyên sâu
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
            <div className="max-w-4xl">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="text-4xl sm:text-7xl font-black tracking-tight font-display text-slate-900 leading-[0.9] mb-10"
              >
                {scenario.title}
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="text-xl sm:text-2xl text-slate-500 font-medium italic leading-relaxed max-w-2xl"
              >
                "{scenario.description}"
              </motion.p>
            </div>
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }}
              className="bg-slate-950 p-12 rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] flex flex-col items-center justify-center min-w-[280px] border border-slate-800 relative group overflow-hidden"
            >
               <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <span className="text-6xl font-black text-blue-500 mb-3 relative z-10">{displayRoi}%</span>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest relative z-10">DỰ BÁO ROI 5 NĂM</span>
            </motion.div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Analysis */}
          <div className="lg:col-span-7 space-y-12">
            {/* Metrics Grid */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {[
                { label: 'Sự nghiệp', val: displayCareer, icon: 'trending_up', color: 'text-blue-600' },
                { label: 'Hạnh phúc', val: displayHappiness, icon: 'sentiment_satisfied', color: 'text-emerald-600' },
                { label: 'Tin cậy', val: scenario.reliability || 95, icon: 'verified', color: 'text-amber-600' }
              ].map((m, i) => (
                <div key={i} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)] transition-all text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-slate-100">
                    <span className={`material-symbols-outlined ${m.color} text-3xl`}>{m.icon}</span>
                  </div>
                  <div className="text-3xl font-black text-slate-900 mb-1">+{m.val}%</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{m.label}</div>
                </div>
              ))}
            </section>

            {/* SWOT Section */}
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {scenario.deepAnalysis?.swot.map((item: any, i: number) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
                  key={i} className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.12)] transition-all"
                >
                  <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest inline-block mb-8 border ${
                    item.type === 'S' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                    item.type === 'W' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                    item.type === 'O' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                    'bg-amber-50 text-amber-600 border-amber-100'
                  }`}>
                    {item.label}
                  </span>
                  <p className="text-lg font-bold text-slate-800 leading-relaxed italic">"{item.value}"</p>
                </motion.div>
              ))}
            </section>

            {/* Comments Section */}
            <section className="bg-white p-12 sm:p-16 rounded-[3.5rem] border border-slate-100 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.08)] mt-12">
               <h3 className="text-xs font-black uppercase tracking-[0.4em] text-slate-900 mb-14 flex items-center gap-5">
                 <span className="material-symbols-outlined text-blue-600">chat_bubble</span>
                 Bình luận Cộng đồng ({comments.length})
               </h3>
               
               <div className="flex gap-8 mb-16 pb-16 border-b border-slate-50">
                  <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0 border-2 border-white shadow-xl font-black text-blue-600 text-sm">JD</div>
                  <form onSubmit={handlePostComment} className="flex-1 space-y-6">
                    <textarea 
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="w-full p-8 bg-slate-50 border border-slate-100 rounded-[2rem] text-base font-medium outline-none focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all shadow-inner h-36 placeholder:text-slate-400"
                      placeholder="Chia sẻ góc nhìn của bạn về kịch bản này..."
                    />
                    <div className="flex justify-end">
                      <button 
                        type="submit"
                        disabled={!newComment.trim()}
                        className="px-10 py-4 bg-blue-600 text-white font-black text-[11px] uppercase tracking-widest rounded-2xl hover:bg-slate-900 transition-all disabled:opacity-30 shadow-2xl shadow-blue-500/20"
                      >
                        Đăng bình luận
                      </button>
                    </div>
                  </form>
               </div>

               <div className="space-y-12">
                 <AnimatePresence initial={false}>
                  {comments.map((comment) => (
                    <motion.div 
                      key={comment.id}
                      initial={{ opacity: 0, height: 0, y: -20 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      className="flex gap-8 group overflow-hidden"
                    >
                        <img src={comment.authorAvatar} className="w-14 h-14 rounded-2xl border-2 border-white shadow-lg shrink-0" alt={comment.authorName} />
                        <div className="flex-1 space-y-4 pb-4">
                          <div className="flex items-center justify-between">
                              <div>
                                <span className="text-sm font-black text-slate-900 uppercase tracking-widest mr-4">{comment.authorName}</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{comment.date}</span>
                              </div>
                              <button className="flex items-center gap-2 group/like bg-slate-50 px-3 py-1.5 rounded-xl hover:bg-rose-50 transition-all border border-slate-100 hover:border-rose-100">
                                <span className="material-symbols-outlined text-lg text-slate-300 group-hover/like:text-rose-500 transition-colors">favorite</span>
                                <span className="text-[10px] font-black text-slate-400 group-hover/like:text-rose-600">{comment.likes}</span>
                              </button>
                          </div>
                          <p className="text-slate-600 text-base font-medium leading-relaxed bg-slate-50 p-6 rounded-[2rem] border border-slate-100 group-hover:bg-white group-hover:shadow-xl group-hover:border-slate-200 transition-all italic">
                            "{comment.content}"
                          </p>
                        </div>
                    </motion.div>
                  ))}
                 </AnimatePresence>
               </div>
            </section>
          </div>

          {/* Right Column: Sprint & Actions */}
          <div className="lg:col-span-5 space-y-12">
            <section className="bg-slate-950 p-12 sm:p-14 rounded-[3.5rem] text-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] relative overflow-hidden">
               <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                  <span className="material-symbols-outlined text-[200px] text-white">sprint</span>
               </div>
               <h3 className="text-xs font-black uppercase tracking-[0.4em] text-blue-400 mb-14 relative z-10">Chiến thuật cơ bản</h3>
               <div className="space-y-14 relative z-10">
                 {scenario.deepAnalysis?.sprint90.map((phase: any, i: number) => (
                   <div key={i} className="flex gap-10 group">
                      <div className="flex flex-col items-center shrink-0">
                         <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-600/40 flex items-center justify-center text-xs font-black text-blue-400 shadow-lg shadow-blue-900/40">
                           {i + 1}
                         </div>
                         {i < 2 && <div className="w-px h-full bg-slate-800 mt-6 shadow-[0_0_10px_rgba(37,99,235,0.2)]"></div>}
                      </div>
                      <div className="pb-6">
                        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white mb-8">
                          {phase.phase}
                        </h4>
                        <ul className="space-y-6">
                          {phase.tasks.map((task: string, ti: number) => (
                            <li key={ti} className="flex items-start gap-4 text-slate-400 text-sm font-medium leading-relaxed">
                              <span className="w-2 h-2 rounded-full bg-blue-600 mt-2 shrink-0 shadow-[0_0_10px_rgba(37,99,235,0.5)]"></span>
                              {task}
                            </li>
                          ))}
                        </ul>
                      </div>
                   </div>
                 ))}
               </div>
            </section>

            <div className="flex flex-col gap-6 pt-4">
               {/* Nút Kịch bản chi tiết Premium */}
               {existingProgress ? (
                 <motion.button 
                   whileHover={{ scale: 1.02, boxShadow: '0 40px 80px -15px rgba(37,99,235,0.3)' }}
                   whileTap={{ scale: 0.98 }}
                   onClick={() => navigate(`/progress?id=${existingProgress.id}`)} 
                   className="w-full py-7 bg-gradient-to-br from-blue-500 to-blue-700 text-white font-black text-[11px] uppercase tracking-[0.4em] rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(37,99,235,0.25)] flex items-center justify-center gap-4 relative overflow-hidden group"
                 >
                   XEM TIẾN TRÌNH <span className="material-symbols-outlined text-xl">trending_up</span>
                 </motion.button>
               ) : (
                 <motion.button 
                   whileHover={{ scale: 1.02, boxShadow: '0 40px 80px -15px rgba(245,158,11,0.3)' }}
                   whileTap={{ scale: 0.98 }}
                   onClick={handlePremiumClick} 
                   className="w-full py-7 bg-gradient-to-br from-amber-400 to-amber-600 text-white font-black text-[11px] uppercase tracking-[0.4em] rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(245,158,11,0.25)] flex items-center justify-center gap-4 relative overflow-hidden group"
                 >
                   <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                   KỊCH BẢN CHI TIẾT <span className="material-symbols-outlined text-xl">workspace_premium</span>
                 </motion.button>
               )}

               <button onClick={() => setIsModalOpen(true)} className="w-full py-7 bg-slate-900 text-white font-black text-[11px] uppercase tracking-[0.4em] rounded-[2rem] hover:bg-blue-600 transition-all shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] flex items-center justify-center gap-4 group">
                 XUẤT BẢN <span className="material-symbols-outlined text-xl group-hover:rotate-12 transition-transform">share</span>
               </button>
               
               <button onClick={() => navigate('/history')} className="w-full py-7 bg-white border border-slate-200 text-slate-500 font-black text-[11px] uppercase tracking-[0.4em] rounded-[2rem] hover:bg-slate-50 hover:border-slate-300 transition-all shadow-[0_15px_30px_-5px_rgba(0,0,0,0.05)]">
                 QUAY LẠI LỊCH SỬ
               </button>
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {isTimeframeModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsTimeframeModalOpen(false)} className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }} className="relative w-full max-w-[480px] bg-white rounded-[4rem] p-12 sm:p-16 shadow-[0_100px_150px_-50px_rgba(0,0,0,0.4)] border border-slate-100 overflow-hidden">
              <div className="text-center mb-12">
                <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-amber-100">
                  <span className="material-symbols-outlined text-4xl">timer</span>
                </div>
                <h3 className="text-3xl font-black text-slate-900 font-display uppercase tracking-tighter mb-4">Cấu hình lộ trình</h3>
                <p className="text-slate-500 text-sm font-medium">Bạn muốn hoàn thành mục tiêu này trong bao lâu?</p>
              </div>
              
              <div className="space-y-10 mb-12">
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center px-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Thời gian (Tháng)</label>
                    <span className="text-xl font-black text-blue-600">{timeframe} tháng</span>
                  </div>
                  <input 
                    type="range" min="3" max="60" step="3" 
                    className="w-full h-3 bg-slate-100 rounded-full appearance-none cursor-pointer accent-blue-600"
                    value={timeframe}
                    onChange={(e) => setTimeframe(parseInt(e.target.value))}
                  />
                  <div className="flex justify-between text-[8px] font-black text-slate-300 uppercase tracking-widest px-1">
                    <span>3 tháng</span>
                    <span>60 tháng (5 năm)</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <button 
                  onClick={handleConfirmTimeframe}
                  className="w-full py-6 bg-slate-900 text-white font-black text-[12px] uppercase tracking-[0.4em] rounded-[2rem] hover:bg-blue-600 shadow-2xl shadow-slate-200 transition-all flex items-center justify-center gap-4"
                >
                  XÁC NHẬN & PHÂN TÍCH <span className="material-symbols-outlined text-xl">bolt</span>
                </button>
                <button 
                  onClick={() => setIsTimeframeModalOpen(false)}
                  className="w-full py-6 bg-white border border-slate-200 text-slate-400 font-black text-[10px] uppercase tracking-widest rounded-[2rem] hover:bg-slate-50 transition-all"
                >
                  Hủy bỏ
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !isSaving && !isSaved && setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }} className="relative w-full max-w-[540px] bg-white rounded-[4rem] p-12 sm:p-16 shadow-[0_100px_150px_-50px_rgba(0,0,0,0.4)] border border-slate-100 overflow-hidden">
              {isSaved ? (
                <div className="py-12 text-center space-y-8">
                  <div className="w-28 h-28 bg-emerald-50 text-emerald-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl border border-emerald-100"><span className="material-symbols-outlined text-6xl font-bold">verified</span></div>
                  <h3 className="text-3xl font-black text-slate-900 font-display uppercase tracking-tighter">Thành công!</h3>
                  <p className="text-slate-500 text-base font-medium">Báo cáo của bạn đã được đóng gói và xuất bản an toàn.</p>
                </div>
              ) : (
                <form onSubmit={handleSaveSubmit} className="space-y-12 relative z-10">
                  <div className="text-center mb-14"><h3 className="text-3xl font-black text-slate-900 font-display uppercase tracking-tighter mb-4">Xuất bản báo cáo</h3><p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Hệ thống bảo mật dữ liệu AES-256</p></div>
                  <div className="space-y-10">
                    <div className="flex flex-col gap-4"><label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Tên báo cáo chính thức</label><input required value={saveForm.title} onChange={(e) => setSaveForm({...saveForm, title: e.target.value})} className="w-full h-16 px-8 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all font-bold text-slate-900 shadow-inner" placeholder="Ví dụ: Lộ trình sự nghiệp 2024" /></div>
                    <div className="space-y-6">
                      <label className="flex items-center justify-between cursor-pointer p-6 rounded-[2rem] border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-xl transition-all group"><div className="flex items-center gap-5"><span className="material-symbols-outlined text-2xl text-amber-500">visibility_off</span><span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Đăng ẩn danh</span></div><input type="checkbox" checked={saveForm.isAnonymous} onChange={(e) => setSaveForm({...saveForm, isAnonymous: e.target.checked})} className="w-7 h-7 rounded-xl text-amber-500 border-slate-200 focus:ring-amber-500" /></label>
                    </div>
                  </div>
                  <button type="submit" disabled={isSaving} className="w-full py-7 bg-slate-900 text-white font-black text-[12px] uppercase tracking-[0.4em] rounded-[2rem] hover:bg-blue-600 shadow-2xl shadow-slate-200 transition-all disabled:opacity-50 flex items-center justify-center gap-4">{isSaving ? "Đang mã hóa dữ liệu..." : "Xác nhận & Xuất bản"}</button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <SharedFooter />
    </div>
  );
};

export default ScenarioDetailPage;
