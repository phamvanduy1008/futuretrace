import { AnimatedBackground } from '../components/AnimatedBackground';

import React, { useState, useEffect } from 'react';
import SharedHeader from '../components/SharedHeader';
import SharedFooter from '../components/SharedFooter';
import { motion, AnimatePresence } from 'framer-motion';
import { ProgressItem } from '../types';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiFetch } from '../services/apiClient';
import { IconMapper } from '../components/IconMapper';

const syncRemainingToken = (remainingToken?: number, remainingTokens?: any) => {
  if (typeof remainingToken !== 'number' && !remainingTokens) return;
  const storedUser = localStorage.getItem('user');
  if (!storedUser) return;
  try {
    const user = JSON.parse(storedUser);
    localStorage.setItem('user', JSON.stringify({
      ...user,
      token: remainingToken ?? user.token,
      token_free: remainingTokens?.token_free ?? user.token_free,
      token_premium: remainingTokens?.token_premium ?? user.token_premium
    }));
  } catch {
    // Ignore malformed local user data.
  }
};

const ProgressPage: React.FC = () => {
  const [progressList, setProgressList] = useState<ProgressItem[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [isPivotModalOpen, setIsPivotModalOpen] = useState(false);
  const [pivotFeedback, setPivotFeedback] = useState('');
  const [isPivoting, setIsPivoting] = useState(false);

  const fetchProgress = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/premium/progress');
      if (!res.ok) {
        throw new Error('Không thể lấy danh sách tiến trình. Vui lòng thử lại sau.');
      }
      const data = await res.json();
      setProgressList(data);

      const id = searchParams.get('id');
      if (id && data.length > 0) {
        const idx = data.findIndex((p: ProgressItem) => p.id === id);
        if (idx >= 0) {
          setSelectedIdx(idx);
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Đã có lỗi kết nối đến máy chủ.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, [searchParams, navigate]);

  const selectedProgress = progressList[selectedIdx];

  const handleToggleMilestone = async (pIdx: number, mIdx: number) => {
    const item = progressList[pIdx];
    let newCompleted = [...item.completedMilestones];

    if (newCompleted.includes(mIdx)) {
      newCompleted = newCompleted.filter(i => i !== mIdx);
    } else {
      newCompleted.push(mIdx);
      newCompleted.sort((a, b) => a - b);
    }

    // Optimistic update
    const newList = [...progressList];
    newList[pIdx] = { ...item, completedMilestones: newCompleted };
    setProgressList(newList);

    try {
      const res = await apiFetch(`/premium/progress/${item.id}`, {
        method: 'PUT',
        body: JSON.stringify({ completedMilestones: newCompleted })
      });
      if (!res.ok) throw new Error('Cập nhật thất bại');
    } catch (err) {
      console.error(err);
      // Rollback on error
      fetchProgress();
      alert('Không thể cập nhật trạng thái cột mốc. Vui lòng thử lại sau.');
    }
  };

  const handlePivot = async () => {
    if (!pivotFeedback.trim()) return;
    setIsPivoting(true);
    const item = progressList[selectedIdx];

    try {
      const res = await apiFetch('/premium/pivot', {
        method: 'POST',
        body: JSON.stringify({
          progressId: item.id,
          currentReport: item.report,
          completedMilestones: item.completedMilestones.map(idx => item.report.milestones[idx]),
          feedback: pivotFeedback,
          context: item.context,
          timeframe: item.timeframe
        })
      });
      const responseData = await res.json().catch(() => ({}));
      (res as any).json = async () => responseData;
      if (!res.ok) {
        throw new Error(responseData.message || 'Không thể điều chỉnh lộ trình.');
      }
      syncRemainingToken(responseData.remainingToken, responseData.remainingTokens);

      if (!res.ok) {
        throw new Error('Không thể điều chỉnh lộ trình.');
      }

      const { report: newReport } = await res.json();

      // Update local state
      const newList = [...progressList];
      newList[selectedIdx] = { ...item, report: newReport };
      setProgressList(newList);

      setIsPivotModalOpen(false);
      setPivotFeedback('');
      alert('Lộ trình của bạn đã được điều chỉnh thành công dựa trên phản hồi mới!');
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Lỗi khi điều chỉnh lộ trình.');
    } finally {
      setIsPivoting(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Bạn có chắc chắn muốn xóa tiến trình này?')) {
      try {
        const res = await apiFetch(`/premium/progress/${id}`, {
          method: 'DELETE'
        });

        if (!res.ok) {
          throw new Error('Không thể xóa tiến trình');
        }

        const updatedList = progressList.filter(p => p.id !== id);
        setProgressList(updatedList);
        if (selectedIdx >= updatedList.length) {
          setSelectedIdx(Math.max(0, updatedList.length - 1));
        }
      } catch (err) {
        console.error('Lỗi khi xóa tiến trình:', err);
        alert('Đã xảy ra lỗi khi xóa tiến trình. Vui lòng thử lại sau.');
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

  if (isLoading) {
    return (
      <AnimatedBackground className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
        <SharedHeader />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div>
          <p className="text-slate-600 font-medium tracking-widest uppercase text-sm">Đang tải dữ liệu tiến trình...</p>
        </main>
        <SharedFooter />
      </AnimatedBackground>
    );
  }

  if (error) {
    return (
      <AnimatedBackground className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
        <SharedHeader />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-24 h-24 bg-rose-100 rounded-3xl flex items-center justify-center mb-8">
            <IconMapper name="warning" className=" text-rose-500 text-5xl" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4 uppercase italic">Lỗi kết nối</h2>
          <p className="text-slate-600 max-w-md mb-10 font-medium">{error}</p>
          <button onClick={fetchProgress} className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-blue-500/20">Thử lại</button>
        </main>
        <SharedFooter />
      </AnimatedBackground>
    );
  }

  if (progressList.length === 0) {
    return (
      <AnimatedBackground className=" bg-[#f8fafc] flex flex-col font-sans">
        <SharedHeader />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center mb-8">
            <IconMapper name="trending_up" className=" text-slate-400 text-5xl" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4 uppercase italic">Chưa có tiến trình nào</h2>
          <p className="text-slate-600 max-w-md mb-10 font-medium">Hãy tạo kịch bản chi tiết từ các kịch bản mô phỏng để bắt đầu theo dõi tiến trình của bạn.</p>
          <button onClick={() => navigate('/simulate')} className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-blue-500/20">Bắt đầu mô phỏng</button>
        </main>
        <SharedFooter />
      </AnimatedBackground>
    );
  }

  return (
    <AnimatedBackground className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      <SharedHeader />
      <main className="flex-1 max-w-[1440px] h-[1200px] mx-auto w-full px-4 sm:px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16">
        <div className="lg:col-span-8 flex flex-col gap-10">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-2 text-[9px] font-black text-blue-600 uppercase tracking-widest mb-4">
              BẢNG ĐIỀU KHIỂN <IconMapper name="chevron_right" className=" text-[10px]" /> TIẾN TRÌNH CỦA TÔI
            </div>
            <h1 className="text-3xl sm:text-6xl font-black tracking-tight mb-4 font-display text-slate-900 leading-[1.8] uppercase italic">Theo dõi Tiến trình Thực tế</h1>
            <p className="text-slate-600 text-sm sm:text-lg leading-relaxed max-w-2xl font-medium italic">
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
                className={`group p-8 sm:p-10 flex flex-col gap-8 cursor-pointer transition-all rounded-[2.5rem] border bg-white ${selectedIdx === i
                  ? 'border-blue-600 ring-2 ring-blue-600/10 shadow-[0_40px_80px_-15px_rgba(37,99,235,0.15)]'
                  : 'border-slate-100 hover:border-slate-200 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)]'
                  }`}
              >
                <div className="flex justify-between items-start">
                  <div className={`w-14 h-14 flex items-center justify-center rounded-2xl border transition-all ${selectedIdx === i ? 'bg-blue-600 text-white border-blue-600 scale-110 shadow-lg shadow-blue-500/20' : 'bg-slate-50 text-slate-400 border-slate-100'
                    }`}>
                    <IconMapper name="trending_up" className=" text-2xl" />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleDelete(e, item.id)}
                      className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center shadow-sm"
                      title="Xóa tiến trình"
                    >
                      <IconMapper name="delete" className=" text-xl" />
                    </button>
                    <span className={`text-[8px] sm:text-[10px] font-black uppercase px-4 py-1.5 rounded-xl border shadow-sm bg-blue-50 text-blue-600 border-blue-100`}>
                      {item.category}
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-black mb-3 text-slate-900 group-hover:text-blue-600 transition-colors font-display tracking-tight leading-relaxed uppercase italic">{item.title}</h3>
                  <p className="text-xs text-slate-400 font-black uppercase tracking-widest mb-2">{item.date}</p>
                  <p className="text-sm text-slate-600 leading-relaxed line-clamp-2 font-medium italic opacity-80">"{item.scenario.description}"</p>
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
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block mb-4">CHI TIẾT TIẾN TRÌNH</span>
                <h2 className="text-2xl sm:text-4xl font-black text-slate-900 font-display leading-[1.6] sm:leading-[1.4] mb-12 uppercase italic">{selectedProgress.title}</h2>
              </div>

              <div className="p-10 sm:p-12 space-y-12">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                      <IconMapper name="list_alt" className=" text-blue-600 text-xl" /> CÁC CỘT MỐC TIẾP THEO
                    </h4>
                    <button
                      onClick={() => setIsPivotModalOpen(true)}
                      className="flex items-center gap-2 text-[9px] font-black text-amber-600 hover:text-amber-700 uppercase tracking-widest transition-colors bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100"
                    >
                      <IconMapper name="psychology" className=" text-sm" /> ĐIỀU CHỈNH LỘ TRÌNH
                    </button>
                  </div>

                  <div className="space-y-4">
                    {selectedProgress.report.milestones.map((m, idx) => {
                      const status = getMilestoneStatus(selectedProgress, idx);
                      return (
                        <div key={idx} className={`p-6 rounded-3xl border flex items-center gap-6 transition-all ${status === 'Đã hoàn thành'
                            ? 'bg-emerald-50/50 border-emerald-100 opacity-60'
                            : status === 'Đang tiến hành'
                              ? 'bg-amber-50 border-amber-200 ring-1 ring-amber-500/20 shadow-md'
                              : 'bg-slate-50 border-slate-100'
                          }`}>
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{m.month}</span>
                            <span className={`text-base font-black break-words leading-snug ${status === 'Đã hoàn thành' ? 'text-emerald-700 line-through' : 'text-slate-900'}`}>{m.event}</span>
                          </div>
                          <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center border transition-all ${status === 'Đã hoàn thành' ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-200' :
                              status === 'Đang tiến hành' ? 'bg-amber-500 text-white border-amber-500 animate-pulse shadow-lg shadow-amber-200' :
                                'bg-slate-100 text-slate-400 border-slate-200'
                            }`}>
                            <IconMapper name={status === 'Đã hoàn thành' ? 'check_circle' : status === 'Đang tiến hành' ? 'pending' : 'circle'} className=" text-2xl" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={() => navigate('/premium-analysis', {
                    state: {
                      scenario: selectedProgress.scenario,
                      context: selectedProgress.context,
                      timeframe: selectedProgress.timeframe,
                      existingProgress: selectedProgress
                    }
                  })}
                  className="w-full py-6 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-blue-600 shadow-2xl shadow-slate-200 transition-all flex items-center justify-center gap-4 hover:gap-6 group"
                >
                  XEM CHI TIẾT LỘ TRÌNH <IconMapper name="arrow_forward" className=" text-xl group-hover:scale-125 transition-transform" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </aside>
      </main>

      {/* Pivot Modal */}
      {/* Pivot Modal */}
      <AnimatePresence>
        {isPivotModalOpen && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-6">

            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isPivoting && setIsPivotModalOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            {/* Modal */}
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden"
            >

              {/* Header Gradient */}
              <div className="h-2 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600"></div>

              <div className="p-10 sm:p-12">

                {/* Header */}
                <div className="flex items-start gap-6 mb-10">
                  <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0 shadow-inner border border-amber-100">
                    <IconMapper name="psychology" className="text-3xl" />
                  </div>

                  <div>
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-2 italic">
                      Điều chỉnh lộ trình
                    </h3>

                    <p className="text-slate-500 text-sm font-medium leading-relaxed">
                      AI sẽ điều chỉnh lộ trình dựa trên phản hồi của bạn.
                    </p>
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 mb-8 flex gap-4">
                  <IconMapper name="info" className="text-blue-500 text-xl shrink-0 mt-0.5" />
                  <p className="text-[11px] text-blue-700 font-medium leading-relaxed italic">
                    Hệ thống sẽ giữ lại các cột mốc đã hoàn thành và thiết kế lại kịch bản từ thời điểm hiện tại
                    trở đi dựa trên ý kiến mới của bạn.
                  </p>
                </div>

                {/* Textarea */}
                <textarea
                  className="w-full h-40 p-6 bg-slate-50 border border-slate-200 rounded-3xl text-sm focus:ring-4 focus:ring-blue-50 focus:border-blue-600 outline-none resize-none transition-all mb-8 font-medium italic shadow-inner"
                  placeholder="Ví dụ: Tôi thấy bước tiếp theo quá mạo hiểm, tôi muốn chuyển hướng sang ổn định tài chính trước..."
                  value={pivotFeedback}
                  onChange={(e) => setPivotFeedback(e.target.value)}
                  disabled={isPivoting}
                />

                {/* Buttons */}
                <div className="flex flex-col gap-4">

                  <button
                    onClick={handlePivot}
                    disabled={!pivotFeedback.trim() || isPivoting}
                    className="w-full py-5 bg-slate-900 text-white font-black text-[11px] uppercase tracking-widest rounded-2xl hover:bg-amber-600 disabled:opacity-20 transition-all shadow-xl flex items-center justify-center gap-3"
                  >
                    {isPivoting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ĐANG ĐIỀU CHỈNH LỘ TRÌNH...
                      </>
                    ) : (
                      <>
                        CẬP NHẬT LỘ TRÌNH MỚI
                        <IconMapper name="bolt" className="text-lg" />
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setIsPivotModalOpen(false)}
                    disabled={isPivoting}
                    className="w-full py-5 bg-white border border-slate-200 text-slate-400 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all"
                  >
                    Hủy bỏ
                  </button>

                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <SharedFooter />
    </AnimatedBackground>
  );
};

export default ProgressPage;
