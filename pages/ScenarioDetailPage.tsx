import { AnimatedBackground } from '../components/AnimatedBackground';
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SharedHeader from '../components/SharedHeader';
import SharedFooter from '../components/SharedFooter';
import { SimulationData, Comment } from '../types';
import { communityService } from '../services/communityService';
import { getCurrentUser } from '../services/authService';
import { IconMapper } from '../components/IconMapper';

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
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [existingProgress, setExistingProgress] = useState<any>(null);

  const state = (location.state as { scenario: any, context?: SimulationData, fromCommunity?: boolean } | null) || { scenario: null };

  const fetchProgress = async (scenarioId: string) => {
    try {
      const token = localStorage.getItem("token");
      const apiBase = (import.meta as any).env.VITE_API_BASE_URL || 'https://futuretrace-server.onrender.com';
      const response = await fetch(`${apiBase}/api/premium/progress/by-scenario/${scenarioId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setExistingProgress(data);
      }
    } catch (err) {
      console.error("Error fetching progress:", err);
    }
  };

  const loadComments = useCallback(async () => {
    if (!id || !state?.fromCommunity) return;
    setIsCommentsLoading(true);
    try {
      const data = await communityService.getComments(id);
      setComments(data);
    } catch (err) {
      console.error("Error loading comments:", err);
    } finally {
      setIsCommentsLoading(false);
    }
  }, [id, state?.fromCommunity]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!state.scenario) {
      navigate('/history');
    } else {
      if (state.scenario && state.scenario.id) {
        setSaveForm(prev => ({ ...prev, title: state.scenario.title || "" }));
        // If not from community, check if it has progress
        if (!state.fromCommunity) {
          fetchProgress(state.scenario.id);
        }
      }

      if (state.fromCommunity) {
        loadComments();
      }
    }
  }, [state, navigate, id, loadComments]);

  if (!state.scenario) return null;

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

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveForm.title.trim()) return;
    setIsSaving(true);

    try {
      await communityService.publishPost({
        title: saveForm.title,
        content: scenario.description,
        category: saveForm.category,
        is_anonymous: saveForm.isAnonymous,
        type: displayType,
        career_growth: displayCareer,
        happiness: displayHappiness,
        roi: displayRoi,
        reliability: 95,
        deep_analysis: scenario.deepAnalysis,
        scenario_id: scenario.id
      });

      setIsSaving(false);
      setIsSaved(true);
      setTimeout(() => {
        setIsModalOpen(false);
        navigate('/community');
      }, 1500);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Lỗi khi xuất bản báo cáo.");
      setIsSaving(false);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !id) return;

    try {
      const addedComment = await communityService.addComment(id, newComment);
      setComments([addedComment, ...comments]);
      setNewComment("");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Lỗi khi gửi bình luận.");
    }
  };

  const handleDeletePost = async () => {
    if (!id || !window.confirm("Bạn có chắc chắn muốn xóa bài viết này khỏi cộng đồng?")) return;
    try {
      await communityService.deletePost(id);
      alert("Đã xóa bài viết thành công.");
      navigate('/community');
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Lỗi khi xóa bài viết.");
    }
  };

  const currentUser = getCurrentUser();
  // Robust ID check: handle both nested objects and direct strings
  const scenarioUserId = scenario.user_id?._id || scenario.user_id;
  const isOwner = currentUser && (
    (state.fromCommunity && String(scenarioUserId) === String(currentUser.id)) ||
    (!state.fromCommunity) // In history mode (not from community), assume local ownership
  );

  return (
    <AnimatedBackground className="min-h-screen bg-[#f8fafc] flex flex-col font-sans relative">
      <SharedHeader />

      <main className="flex-1 max-w-[1200px] mx-auto w-full px-4 sm:px-6 py-10 sm:py-20">
        {/* Lab Header */}
        <header className="mb-16 sm:mb-24">
          <div className="flex items-center gap-3 text-[10px] font-black text-blue-600 uppercase tracking-widest mb-8">
            <IconMapper name="science" className=" text-[16px]" /> Nghiên cứu chuyên sâu
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
            <div className="max-w-4xl">
              <motion.h1
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight font-display text-slate-900 leading-[0.95] mb-8"
              >
                {scenario.title}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="text-lg sm:text-xl lg:text-2xl text-slate-600 font-medium italic leading-relaxed max-w-2xl"
              >
                "{scenario.description}"
              </motion.p>
            </div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }}
              className="bg-slate-950 p-8 sm:p-10 lg:p-12 rounded-[2.5rem] sm:rounded-[3.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)] flex flex-col items-center justify-center min-w-[240px] sm:min-w-[280px] border border-slate-800 relative group overflow-hidden"
            >
              <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="text-5xl sm:text-6xl font-black text-blue-500 mb-2 relative z-10">{displayRoi}%</span>
              <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest relative z-10">DỰ BÁO ROI 5 NĂM</span>
            </motion.div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Analysis */}
          <div className="lg:col-span-7 space-y-8 lg:space-y-12">
            {/* Metrics Grid */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8">
              {[
                { label: 'Sự nghiệp', val: displayCareer, icon: 'trending_up', color: 'text-blue-600' },
                { label: 'Hạnh phúc', val: displayHappiness, icon: 'sentiment_satisfied', color: 'text-emerald-600' },
                { label: 'Tin cậy', val: scenario.reliability || 95, icon: 'verified', color: 'text-amber-600' }
              ].map((m, i) => (
                <div key={i} className="bg-white p-6 sm:p-8 lg:p-10 rounded-[2rem] sm:rounded-[2.5rem] border-2 border-slate-100 shadow-[0_15px_30px_-5px_rgba(0,0,0,0.05)] hover:border-blue-600 hover:ring-4 hover:ring-blue-600/10 transition-all text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-inner border border-slate-100">
                    <IconMapper name={m.icon} className={` ${m.color} text-2xl sm:text-3xl`} />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 mb-1">+{m.val}%</div>
                  <div className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">{m.label}</div>
                </div>
              ))}
            </section>

            {/* SWOT Section */}
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
              {scenario.deepAnalysis?.swot.map((item: any, i: number) => (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
                  key={i} className="bg-white p-8 lg:p-10 rounded-[2rem] sm:rounded-[3rem] border-2 border-slate-100 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.06)] hover:border-blue-600 hover:ring-4 hover:ring-blue-600/10 transition-all"
                >
                  <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest inline-block mb-6 border ${item.type === 'S' || item.type === 'Strengths' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      item.type === 'W' || item.type === 'Weaknesses' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                        item.type === 'O' || item.type === 'Opportunities' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                          'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                    {item.type === 'S' || item.type === 'Strengths' ? 'Thế mạnh' :
                     item.type === 'W' || item.type === 'Weaknesses' ? 'Điểm yếu' :
                     item.type === 'O' || item.type === 'Opportunities' ? 'Cơ hội' :
                     'Thách thức'}
                  </span>
                  <p className="text-base sm:text-lg font-bold text-slate-800 leading-relaxed italic">"{item.value}"</p>
                </motion.div>
              ))}
            </section>

            {/* Comments Section - Redesigned (Compact & Minimal) */}
            {(state?.fromCommunity || isSaved) && (
              <section className="bg-white/60 backdrop-blur-xl p-8 sm:p-10 lg:p-12 rounded-[2.5rem] sm:rounded-[4rem] border-2 border-white/80 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.03)] hover:border-blue-600/50 hover:ring-4 hover:ring-blue-600/10 transition-all mt-8 relative overflow-hidden">

                 
                 <div className="flex items-center justify-between mb-10">
                   <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-900 flex items-center gap-4">
                     <IconMapper name="forum" className=" text-blue-600 bg-blue-50/50 p-2 rounded-xl text-xl" />
                     Cộng đồng thảo luận ({comments.length})
                   </h3>
                 </div>
                 
                 {/* Input Area */}
                 <div className="flex gap-5 mb-10 pb-10 border-b border-slate-100/60">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-900 flex items-center justify-center shrink-0 border-2 border-white shadow-lg font-black text-white text-[10px]">ME</div>
                    <form onSubmit={handlePostComment} className="flex-1">
                      <textarea 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="w-full p-5 bg-slate-50/30 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 transition-all shadow-inner h-24 placeholder:text-slate-300 resize-none"
                        placeholder="Chia sẻ góc nhìn của bạn..."
                      />
                      <div className="flex justify-end mt-3">
                        <button 
                          type="submit"
                          disabled={!newComment.trim()}
                          className="px-6 py-3 bg-slate-900 text-white font-black text-[9px] uppercase tracking-widest rounded-xl hover:bg-blue-600 transition-all disabled:opacity-20 shadow-xl flex items-center gap-2 group"
                        >
                          GỬI Ý KIẾN <IconMapper name="arrow_forward" className=" text-sm group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </form>
                 </div>

                {/* Comments List */}
                {isCommentsLoading ? (
                  <div className="py-12 flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-3 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Đang tải thảo luận...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <AnimatePresence initial={false}>
                      {comments.map((comment) => (
                        <motion.div
                          key={comment.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex gap-5 group"
                        >
                          <div className="shrink-0 relative pt-1">
                            <img src={comment.authorAvatar || 'https://i.pravatar.cc/150?img=1'} className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl border border-slate-100 shadow-sm" alt={comment.authorName} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="bg-slate-50/40 hover:bg-white hover:shadow-xl hover:shadow-slate-200/20 transition-all p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100/50 relative group">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] sm:text-[11px] font-black text-slate-900 uppercase tracking-widest">{comment.authorName}</span>
                                  <span className="w-0.5 h-0.5 rounded-full bg-slate-300"></span>
                                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{comment.date}</span>
                                </div>
                                <p className="text-slate-600 text-sm sm:text-base font-medium leading-relaxed italic pr-12">"{comment.content}"</p>
                                
                                <button 
                                  onClick={async () => {
                                    try {
                                      const res = await communityService.toggleCommentLike(id!, comment.id);
                                      setComments(prev => prev.map(c => {
                                        if (c.id === comment.id) {
                                          return { 
                                            ...c, 
                                            isLiked: res.liked, 
                                            likes: res.liked ? (c.likes || 0) + 1 : (c.likes || 1) - 1 
                                          };
                                        }
                                        return c;
                                      }));
                                    } catch (err) {
                                      console.error(err);
                                    }
                                  }}
                                  className={`absolute top-5 right-5 flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all ${
                                    comment.isLiked ? 'bg-rose-50 text-rose-500' : 'text-slate-300 hover:text-rose-400'
                                  }`}
                                >
                                  <IconMapper name="favorite" className={` text-lg ${comment.isLiked ? 'fill-rose-500' : ''}`} />
                                  <span className="text-[10px] font-black">{comment.likes || 0}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {comments.length === 0 && (
                      <div className="py-12 text-center flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-slate-50/50 rounded-2xl flex items-center justify-center text-slate-100">
                          <IconMapper name="chat_bubble" className=" text-3xl" />
                        </div>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Hệ thống chưa nhận được bình luận nào.</p>
                      </div>
                    )}
                  </div>
                )}
              </section>
            )}
          </div>

          {/* Right Column: Sprint & Actions */}
          <div className="lg:col-span-5 space-y-8 lg:space-y-12">
            <section className="bg-slate-950 p-10 sm:p-12 lg:p-14 rounded-[2.5rem] sm:rounded-[3.5rem] text-white shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)] relative overflow-hidden">
               <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                  <IconMapper name="sprint" className=" text-[150px] sm:text-[200px] text-white" />
               </div>
               <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-blue-400 mb-10 sm:mb-14 relative z-10">Chiến thuật cơ bản</h3>
               <div className="space-y-10 sm:space-y-14 relative z-10">
                 {scenario.deepAnalysis?.sprint90.map((phase: any, i: number) => (
                   <div key={i} className="flex gap-8 sm:gap-10 group">
                      <div className="flex flex-col items-center shrink-0">
                         <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-600/20 border border-blue-600/40 flex items-center justify-center text-[10px] sm:text-xs font-black text-blue-400 shadow-lg shadow-blue-900/40">
                           {i + 1}
                         </div>
                         {i < 2 && <div className="w-px h-full bg-slate-800 mt-6 shadow-[0_0_10px_rgba(37,99,235,0.2)]"></div>}
                      </div>
                      <div className="pb-4 sm:pb-6">
                        <h4 className="text-[11px] sm:text-sm font-black uppercase tracking-widest text-white mb-6 sm:mb-8">
                          {phase.phase}
                        </h4>
                        <ul className="space-y-4 sm:space-y-6">
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

            <div className="flex flex-col gap-4 sm:gap-6 pt-2">
               {/* 1. Nút Phân tích - Shown for visitors OR in history mode */}
               {!(state.fromCommunity && isOwner) && (
                 existingProgress ? (
                   <motion.button 
                     whileHover={{ scale: 1.02, boxShadow: '0 30px 60px -15px rgba(37,99,235,0.25)' }}
                     whileTap={{ scale: 0.98 }}
                     onClick={() => navigate(`/progress?id=${existingProgress.id}`)} 
                     className="w-full py-6 bg-gradient-to-br from-blue-500 to-blue-700 text-white font-black text-[10px] uppercase tracking-widest rounded-[1.5rem] sm:rounded-[2rem] shadow-[0_20px_40px_-10px_rgba(37,99,235,0.2)] flex items-center justify-center gap-4 relative overflow-hidden group"
                   >
                     VÀO TIẾN TRÌNH <IconMapper name="trending_up" className=" text-xl" />
                   </motion.button>
                 ) : (
                   <motion.button 
                     whileHover={{ scale: 1.02, boxShadow: '0 30px 60px -15px rgba(245,158,11,0.25)' }}
                     whileTap={{ scale: 0.98 }}
                     onClick={handlePremiumClick} 
                     className="w-full py-6 bg-gradient-to-br from-amber-400 to-amber-600 text-white font-black text-[10px] uppercase tracking-widest rounded-[1.5rem] sm:rounded-[2rem] shadow-[0_20px_40px_-10px_rgba(245,158,11,0.2)] flex items-center justify-center gap-4 relative overflow-hidden group"
                   >
                     <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                     KỊCH BẢN CHI TIẾT <IconMapper name="workspace_premium" className=" text-xl" />
                   </motion.button>
                 )
               )}

               {/* 2. Nút Xuất bản (Chỉ hiện nếu đang ở xem từ lịch sử) */}
               {!state.fromCommunity && (
                 <button onClick={() => setIsModalOpen(true)} className="w-full py-6 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-[1.5rem] sm:rounded-[2rem] hover:bg-blue-600 transition-all shadow-xl flex items-center justify-center gap-4 group">
                   XUẤT BẢN <IconMapper name="share" className=" text-xl group-hover:rotate-12 transition-transform" />
                 </button>
               )}

               {/* 3. Nút Xóa bài đăng (Chỉ hiện nếu là chủ sở hữu và đang xem từ cộng đồng) */}
               {state.fromCommunity && isOwner && (
                 <button onClick={handleDeletePost} className="w-full py-6 bg-rose-50 border border-rose-100 text-rose-600 font-black text-[10px] uppercase tracking-widest rounded-[1.5rem] sm:rounded-[2rem] hover:bg-rose-600 hover:text-white transition-all shadow-sm flex items-center justify-center gap-4">
                   XÓA BÀI ĐĂNG <IconMapper name="delete" className=" text-xl" />
                 </button>
               )}
               
               <button onClick={() => navigate(state.fromCommunity ? '/community' : '/history')} className="w-full py-6 bg-white border border-slate-200 text-slate-400 font-black text-[10px] uppercase tracking-widest rounded-[1.5rem] sm:rounded-[2rem] hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm text-center">
                 {state.fromCommunity ? 'QUAY LẠI CỘNG ĐỒNG' : 'QUAY LẠI LỊCH SỬ'}
               </button>
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {isTimeframeModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsTimeframeModalOpen(false)} className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }} className="relative w-full max-w-[480px] bg-white rounded-[3rem] p-10 sm:p-14 shadow-[0_80px_120px_-40px_rgba(0,0,0,0.4)] border border-slate-100 overflow-hidden">
              <div className="text-center mb-10">
                <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-inner border border-amber-100">
                  <IconMapper name="timer" className=" text-3xl" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 font-display uppercase tracking-tighter mb-3">Cấu hình lộ trình</h3>
                <p className="text-slate-600 text-xs font-medium">Bạn muốn hoàn thành mục tiêu này trong bao lâu?</p>
              </div>

              <div className="space-y-8 mb-10">
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center px-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Thời gian (Tháng)</label>
                    <span className="text-lg font-black text-blue-600">{timeframe} tháng</span>
                  </div>
                  <input
                    type="range" min="3" max="60" step="3"
                    className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-blue-600"
                    value={timeframe}
                    onChange={(e) => setTimeframe(parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleConfirmTimeframe}
                  className="w-full py-5 bg-slate-900 text-white font-black text-[11px] uppercase tracking-widest rounded-[1.5rem] hover:bg-blue-600 shadow-xl transition-all flex items-center justify-center gap-3"
                >
                  XÁC NHẬN & PHÂN TÍCH <IconMapper name="bolt" className=" text-lg" />
                </button>
                <button
                  onClick={() => setIsTimeframeModalOpen(false)}
                  className="w-full py-5 bg-white border border-slate-200 text-slate-300 font-black text-[9px] uppercase tracking-widest rounded-[1.5rem] hover:bg-slate-50 transition-all"
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
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }} className="relative w-full max-w-[500px] bg-white rounded-[3rem] p-10 sm:p-14 shadow-[0_80px_120px_-40px_rgba(0,0,0,0.4)] border border-slate-100 overflow-hidden">
              {isSaved ? (
                <div className="py-10 text-center space-y-6">
                  <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl border border-emerald-100"><IconMapper name="verified" className=" text-5xl font-bold" /></div>
                  <h3 className="text-2xl font-black text-slate-900 font-display uppercase tracking-tighter">Thành công!</h3>
                  <p className="text-slate-600 text-sm font-medium">Báo cáo của bạn đã được xuất bản an toàn.</p>
                </div>
              ) : (
                <form onSubmit={handleSaveSubmit} className="space-y-10 relative z-10">
                  <div className="text-center mb-10"><h3 className="text-2xl font-black text-slate-900 font-display uppercase tracking-tighter mb-3">Xuất bản báo cáo</h3><p className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Hệ thống bảo mật dữ liệu AES-256</p></div>
                  <div className="space-y-8">
                    <div className="flex flex-col gap-3"><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Tên báo cáo chính thức</label><input required value={saveForm.title} onChange={(e) => setSaveForm({...saveForm, title: e.target.value})} className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white focus:border-blue-600 transition-all font-bold text-slate-900 shadow-inner" placeholder="Ví dụ: Lộ trình sự nghiệp 2024" /></div>
                    <label className="flex items-center justify-between cursor-pointer p-5 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white transition-all group"><div className="flex items-center gap-4"><IconMapper name="visibility_off" className=" text-xl text-amber-500" /><span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Đăng ẩn danh</span></div><input type="checkbox" checked={saveForm.isAnonymous} onChange={(e) => setSaveForm({...saveForm, isAnonymous: e.target.checked})} className="w-6 h-6 rounded-lg text-amber-500 border-slate-200" /></label>
                  </div>
                  <button type="submit" disabled={isSaving} className="w-full py-6 bg-slate-900 text-white font-black text-[11px] uppercase tracking-widest rounded-[1.5rem] hover:bg-blue-600 shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-3">{isSaving ? "Đang mã hóa..." : "Xác nhận & Xuất bản"}</button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <SharedFooter />
    </AnimatedBackground>
  );
};

export default ScenarioDetailPage;
