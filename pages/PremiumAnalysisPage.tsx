
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { generatePremiumAnalysis, pivotPremiumAnalysis } from '../services/geminiService';
import { PremiumAnalysisReport, SimulationData, ProgressItem } from '../types';
import { apiFetch } from '../services/apiClient';
import { saveProgress, getProgressByScenarioId } from '../data/mockDatabase';
import SharedHeader from '../components/SharedHeader';
import SharedFooter from '../components/SharedFooter';
import { IconMapper } from '../components/IconMapper';
import { AnimatedBackground } from '../components/AnimatedBackground';

const formatNarrative = (text: string) => {
  if (!text) return [];

  // Split text by sentence ending with a period followed by whitespace
  const sentences = text.split(/(?<=\.|\?|!)\s+/);
  const sections: { time?: string; content: string; type: 'intro' | 'outro' | 'step' | 'general' }[] = [];
  
  let currentStepContent: string[] = [];
  let currentStepTime: string | undefined = undefined;

  sentences.forEach((sentence, idx) => {
    const trimmed = sentence.trim();
    if (!trimmed) return;

    // The first sentence is treated as introduction ONLY if it does not contain a time marker
    if (idx === 0) {
      const hasTimeMarker = trimmed.match(/(bắt đầu từ\s+tháng\s+\d+(?:-\d+)?|giai đoạn từ\s+tháng\s+\d+(?:-\d+)?|cuối cùng,\s+tháng\s+\d+(?:-\d+)?|tháng\s+\d+(?:-\d+)?|trong suốt\s+\d+\s+tháng|song song đó)/i);
      if (!hasTimeMarker) {
        sections.push({
          content: trimmed,
          type: 'intro'
        });
        return;
      }
    }

    // Regex to match various time phases
    const timeMatch = trimmed.match(/(bắt đầu từ\s+tháng\s+\d+(?:-\d+)?|giai đoạn từ\s+tháng\s+\d+(?:-\d+)?|cuối cùng,\s+tháng\s+\d+(?:-\d+)?|tháng\s+\d+(?:-\d+)?|trong suốt\s+\d+\s+tháng|song song đó)/i);
    
    if (timeMatch) {
      // Push any accumulated step content before starting a new step
      if (currentStepContent.length > 0) {
        sections.push({
          time: currentStepTime,
          content: currentStepContent.join(' '),
          type: currentStepTime ? 'step' : 'general'
        });
        currentStepContent = [];
      }
      
      const marker = timeMatch[1];
      if (marker.toLowerCase().includes('trong suốt')) {
        sections.push({
          content: trimmed,
          type: 'outro'
        });
        currentStepTime = undefined;
      } else {
        currentStepTime = marker;
        currentStepContent.push(trimmed);
      }
    } else {
      if (currentStepTime) {
        currentStepContent.push(trimmed);
      } else {
        // If it's the last sentence and no current step, treat as outro
        if (idx === sentences.length - 1) {
          sections.push({
            content: trimmed,
            type: 'outro'
          });
        } else {
          sections.push({
            content: trimmed,
            type: 'general'
          });
        }
      }
    }
  });

  // Push remaining step content
  if (currentStepContent.length > 0) {
    sections.push({
      time: currentStepTime,
      content: currentStepContent.join(' '),
      type: currentStepTime ? 'step' : 'general'
    });
  }

  return sections;
};

const renderNarrative = (text: string) => {
  const sections = formatNarrative(text);
  if (!sections || sections.length === 0) {
    return (
      <p className="text-lg text-slate-700 leading-relaxed font-medium italic opacity-90 text-justify">
        {text}
      </p>
    );
  }

  const hasSteps = sections.some(s => s.type === 'step');

  if (!hasSteps) {
    return (
      <div className="space-y-6 relative my-2 px-1">
        {sections.map((sec, idx) => {
          // The first section serves as the callout introduction
          if (idx === 0) {
            return (
              <p key={idx} className="text-lg text-slate-800 leading-relaxed font-semibold opacity-95 text-justify italic">
                {sec.content}
              </p>
            );
          }
          return (
            <div key={idx} className="flex gap-3 items-start">
              <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
              <p className="text-base text-slate-600 leading-relaxed font-medium text-justify">
                {sec.content}
              </p>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      {/* Intro */}
      {sections.filter(s => s.type === 'intro').map((sec, idx) => (
        <div key={idx} className="relative pl-6 border-l-4 border-blue-500 py-3 my-6 bg-blue-50/40 rounded-r-2xl pr-4">
          <p className="text-lg text-slate-800 font-semibold leading-relaxed italic">
            "{sec.content}"
          </p>
        </div>
      ))}

      {/* Steps (Timeline style) */}
      <div className="relative border-l-2 border-slate-100 ml-4 pl-8 space-y-8 my-8">
        {sections.filter(s => s.type === 'step').map((sec, idx) => {
          let badgeText = sec.time || 'Giai đoạn';
          // Capitalize and format the badge text
          if (badgeText.toLowerCase().includes('tháng')) {
            const match = badgeText.match(/tháng\s+\d+(?:-\d+)?/i);
            if (match) {
              badgeText = match[0].replace(/tháng\s+/i, 'Tháng ').replace('-', ' - ');
            }
          } else if (badgeText.toLowerCase() === 'song song đó') {
            badgeText = 'Hoạt động song song';
          }

          return (
            <div key={idx} className="relative group/timeline">
              {/* Dot */}
              <div className="absolute -left-[41px] top-1.5 w-6 h-6 rounded-full bg-white border-4 border-blue-500 shadow-md group-hover/timeline:scale-110 transition-transform duration-200"></div>
              
              {/* Card */}
              <div className="bg-slate-50/50 hover:bg-slate-50 border border-slate-100/60 hover:border-slate-200/80 p-6 rounded-2xl transition-all duration-300 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)]">
                <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-wider rounded-lg mb-3">
                  {badgeText}
                </span>
                <p className="text-base text-slate-700 leading-relaxed font-medium">
                  {sec.content}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Outro */}
      {sections.filter(s => s.type === 'outro').map((sec, idx) => (
        <div key={idx} className="p-6 bg-slate-900 text-slate-300 rounded-3xl border border-slate-800 shadow-lg mt-8 flex items-start gap-4">
          <div className="p-3 bg-slate-800 rounded-2xl text-blue-400 shrink-0">
            <IconMapper name="verified" className="text-xl" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Định hướng tổng thể</h4>
            <p className="text-sm leading-relaxed font-medium italic">
              {sec.content}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

const PremiumAnalysisPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<PremiumAnalysisReport | null>(null);
  const [error, setError] = useState<{ message: string; type?: string } | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<any>(null);
  const [selectedMilestoneIndex, setSelectedMilestoneIndex] = useState<number | null>(null);
  const [currentMilestoneIndex, setCurrentMilestoneIndex] = useState(0);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isConfirmPivotModalOpen, setIsConfirmPivotModalOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isPivoting, setIsPivoting] = useState(false);
  const [progressId, setProgressId] = useState<string | null>(null);

  const { scenario, context, timeframe, existingProgress } = (location.state as any) || {};

  const fetchReport = React.useCallback(async () => {
    // If we already have the progress from state (e.g. Navigated from Progress Page)
    // Use it immediately for an "instant" experience
    if (existingProgress) {
      setReport(existingProgress.report);
      setProgressId(existingProgress.id);
      setCurrentMilestoneIndex(existingProgress.completedMilestones?.length || 0);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Backend now checks for existing record by scenario.id
      // Scenario.id must be the real MongoDB _id or the one from the simulation
      const data = await generatePremiumAnalysis(scenario.title, scenario.description, scenario.id, context, timeframe);
      
      setReport(data.report);
      setProgressId(data.id);
      setCurrentMilestoneIndex(data.completedMilestones?.length || 0);
    } catch (e: any) {
      setError({ message: e.message, type: e.type || 'GENERAL' });
    } finally {
      setLoading(false);
    }
  }, [scenario, context, timeframe, existingProgress]);

  useEffect(() => {
    if (scenario) {
      fetchReport();
    }
  }, [scenario, fetchReport]);

  const getMilestoneStatus = (index: number) => {
    if (index < currentMilestoneIndex) return 'Đã hoàn thành';
    if (index === currentMilestoneIndex) return 'Đang tiến hành';
    return 'Chưa hoàn thành';
  };

  const handleCompleteMilestone = (index: number) => {
    if (index === currentMilestoneIndex) {
      setIsFeedbackModalOpen(true);
    }
  };

  const handleToggleStepStatus = async (milestoneIndex: number, stepId: string, currentCompleted: boolean) => {
    if (!report || !progressId) return;

    // 1. Update UI optimistically
    const updatedReport = { ...report };
    const milestone = updatedReport.milestones[milestoneIndex];
    if (Array.isArray(milestone.details)) {
      const step = milestone.details.find(s => s.id === stepId);
      if (step) {
        step.completed = !currentCompleted;
      }
    }
    setReport(updatedReport);

    // Also update selectedMilestone state if it is currently open in modal
    if (selectedMilestone && selectedMilestoneIndex === milestoneIndex) {
      const updatedSelected = { ...selectedMilestone };
      if (Array.isArray(updatedSelected.details)) {
        const step = updatedSelected.details.find((s: any) => s.id === stepId);
        if (step) {
          step.completed = !currentCompleted;
        }
      }
      setSelectedMilestone(updatedSelected);
    }

    // 2. Call PATCH API to update in database
    try {
      const res = await apiFetch('/scenario/step-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId: progressId,
          stepId,
          completed: !currentCompleted
        })
      });
      if (!res.ok) {
        throw new Error('Failed to update step status');
      }
    } catch (err) {
      console.error("Error updating step status on backend:", err);
      // Revert if failed
      const revertedReport = { ...report };
      const m = revertedReport.milestones[milestoneIndex];
      if (Array.isArray(m.details)) {
        const step = m.details.find(s => s.id === stepId);
        if (step) {
          step.completed = currentCompleted;
        }
      }
      setReport(revertedReport);
      
      if (selectedMilestone && selectedMilestoneIndex === milestoneIndex) {
        const revertedSelected = { ...selectedMilestone };
        if (Array.isArray(revertedSelected.details)) {
          const step = revertedSelected.details.find((s: any) => s.id === stepId);
          if (step) {
            step.completed = currentCompleted;
          }
        }
        setSelectedMilestone(revertedSelected);
      }
      alert("Lỗi khi cập nhật trạng thái nhiệm vụ.");
    }
  };

  const updateBackendProgress = async (newIndex: number, newReport?: any) => {
    if (!progressId) return;
    try {
      await apiFetch(`/premium/progress/${progressId}`, {
        method: "PUT",
        body: JSON.stringify({
          completedMilestones: Array.from({ length: newIndex }, (_, i) => i),
          report: newReport || undefined
        })
      });
    } catch (err) {
      console.error("Error updating progress on backend:", err);
    }
  };

  const submitFeedback = () => {
    setIsFeedbackModalOpen(false);
    setIsConfirmPivotModalOpen(true);
  };

  const handleNoFeedback = async () => {
    setIsFeedbackModalOpen(false);
    const newIndex = currentMilestoneIndex + 1;
    setCurrentMilestoneIndex(newIndex);
    setSelectedMilestone(null);
    setSelectedMilestoneIndex(null);

    // Update progress on backend
    await updateBackendProgress(newIndex);
  };

  const handleConfirmPivot = async (agree: boolean) => {
    setIsConfirmPivotModalOpen(false);
    
    if (agree && report && scenario) {
      setIsPivoting(true);
      try {
        const completed = report.milestones.slice(0, currentMilestoneIndex + 1);
        const newReport = await pivotPremiumAnalysis(report, completed, feedback, context, timeframe);
        setReport(newReport);
        const newIndex = currentMilestoneIndex + 1;
        setCurrentMilestoneIndex(newIndex);
        setFeedback('');

        // Update progress on backend
        await updateBackendProgress(newIndex, newReport);
      } catch (e: any) {
        alert("Lỗi khi điều chỉnh lộ trình: " + e.message);
      } finally {
        setIsPivoting(false);
      }
    } else {
      const newIndex = currentMilestoneIndex + 1;
      setCurrentMilestoneIndex(newIndex);
      await updateBackendProgress(newIndex);
    }
    
    setSelectedMilestone(null);
    setSelectedMilestoneIndex(null);
  };

  const translateInfluence = (inf: string) => {
    switch (inf) {
      case 'High': return 'Cao';
      case 'Medium': return 'Trung bình';
      case 'Low': return 'Thấp';
      default: return inf;
    }
  };

  if (loading) {
    return (
      <AnimatedBackground className="flex items-center justify-center text-white font-sans p-6 overflow-hidden">
        <div className="relative w-40 h-40 mb-10">
          <div className="absolute inset-0 border-4 border-amber-500/20 rounded-full"></div>
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-4 border-transparent border-t-amber-500 rounded-full"
          ></motion.div>
          <div className="absolute inset-0 flex items-center justify-center">
            <IconMapper name="workspace_premium" className=" text-amber-500 text-4xl animate-pulse" />
          </div>
        </div>
        <h2 className="text-xl font-black uppercase tracking-widest mb-4 text-amber-500">Phân tích Chuyên sâu Premium</h2>
        <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest animate-pulse">Hệ thống đang mô phỏng lộ trình chi tiết...</p>
      </AnimatedBackground>
    );
  }

  if (error || !report) {
    return (
      <AnimatedBackground className="flex flex-col font-sans min-h-screen">
        <SharedHeader />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto w-full">
          <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-8 shadow-xl ${
            error?.type === 'OVERLOADED' ? 'bg-amber-50 text-amber-600 shadow-amber-500/20' :
            error?.type === 'RATE_LIMIT' ? 'bg-rose-50 text-rose-600 shadow-rose-500/20' :
            'bg-slate-50 text-slate-600 shadow-slate-500/10'
          }`}>
            <IconMapper name={
              error?.type === 'OVERLOADED' ? 'hourglass_empty' :
              error?.type === 'RATE_LIMIT' ? 'block' :
              'error'
            } className="text-5xl font-bold" />
          </div>
          <h3 className={`text-2xl font-black mb-4 uppercase tracking-tight font-display ${
            error?.type === 'OVERLOADED' ? 'text-amber-900' :
            error?.type === 'RATE_LIMIT' ? 'text-rose-900' :
            'text-slate-900'
          }`}>
            {error?.type === 'OVERLOADED' ? 'Hệ thống AI quá tải' :
             error?.type === 'RATE_LIMIT' ? 'Hết lượt sử dụng AI' :
             'Lỗi trích xuất dữ liệu'}
          </h3>
          <p className="text-slate-600 mb-10 max-w-md text-sm font-medium leading-relaxed">
            {error?.message || "Đã xảy ra lỗi không xác định. Vui lòng thử lại sau."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <button onClick={() => navigate(-1)} className="px-8 py-4 bg-white border-2 border-slate-200 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
              Quay lại
            </button>
            <button onClick={() => fetchReport()} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-600 transition-all shadow-xl flex items-center justify-center gap-2">
              Thử lại ngay <IconMapper name="refresh" className="text-sm" />
            </button>
          </div>
        </div>
        <SharedFooter />
      </AnimatedBackground>
    );
  }

  return (
    <AnimatedBackground className="flex flex-col font-sans">
      <SharedHeader />
      
      <main className="flex-1 max-w-[1200px] mx-auto w-full px-6 py-12 sm:py-20">
        <header className="mb-20 relative">
          <div className="flex items-center gap-3 text-[10px] font-black text-amber-600 uppercase tracking-widest mb-8">
            <IconMapper name="workspace_premium" className=" text-[16px]" /> BÁO CÁO PHÂN TÍCH ĐẶC QUYỀN
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-[1.6] sm:leading-[1.4] mb-12 uppercase italic">
            Lộ trình: <span className="text-blue-600">"{scenario.title}"</span>
          </h1>
          
          <div className="p-10 bg-white border border-slate-100 rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
               <IconMapper name="auto_awesome" className=" text-[180px] text-slate-900" />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-6 flex items-center gap-3">
               <IconMapper name="history_edu" className=" text-lg" /> Diễn biến kịch bản chi tiết
            </h3>
            <div className="mt-4">
              {renderNarrative(report.detailedNarrative)}
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-20">
           {/* Milestones & Timeline */}
           <div className="lg:col-span-8 space-y-10">
              <section className="bg-slate-950 p-10 sm:p-14 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-12">Cột mốc quan trọng (Cột mốc)</h3>
                <div className="space-y-0">
                  {report.milestones.map((m, i) => {
                    const status = getMilestoneStatus(i);
                    return (
                      <div key={i} className="flex gap-5 group">
                        {/* Timeline column */}
                        <div className="flex flex-col items-center shrink-0">
                          <div className={`w-20 min-h-[4rem] rounded-2xl border flex flex-col items-center justify-center px-2 py-3 text-center transition-all ${
                            status === 'Đã hoàn thành' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' :
                            status === 'Đang tiến hành' ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 animate-pulse' :
                            'bg-white/5 border-white/10 text-slate-500'
                          }`}>
                            <span className="text-[11px] font-black leading-snug whitespace-pre-wrap break-words">{m.month}</span>
                          </div>
                          {i < report.milestones.length - 1 && (
                            <div className={`w-px flex-1 min-h-[2rem] my-2 opacity-20 ${
                              status === 'Đã hoàn thành' ? 'bg-emerald-500' : 'bg-gradient-to-b from-amber-500/30 to-transparent'
                            }`}></div>
                          )}
                        </div>

                        {/* Content column */}
                        <div className="flex-1 min-w-0 pt-1 pb-8">
                          <div className="flex items-start justify-between gap-3">
                            {/* Left: title → badge (own row) → impact */}
                            <div className="flex-1 min-w-0">
                              {/* Row 1: title */}
                              <h4 className={`text-base font-black font-display leading-relaxed transition-colors uppercase italic break-words mb-2 ${
                                status === 'Đã hoàn thành' ? 'text-emerald-400' : 
                                status === 'Đang tiến hành' ? 'text-amber-400' : 'text-white'
                              }`}>
                                {m.event}
                              </h4>
                              {/* Row 2: badge — always on its own line */}
                              <div className="mb-2">
                                <span className={`inline-block text-[8px] font-black px-2 py-1 rounded-md border whitespace-nowrap ${
                                  status === 'Đã hoàn thành' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                  status === 'Đang tiến hành' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                  'bg-white/5 text-slate-500 border-white/10'
                                }`}>
                                  {status.toUpperCase()}
                                </span>
                              </div>
                              {/* Row 3: impact */}
                              <p className="text-slate-400 text-[11px] font-medium leading-relaxed italic opacity-70 line-clamp-2">
                                {m.impact}
                              </p>
                            </div>

                            {/* Right: probability + view button */}
                            <div className="flex flex-col items-end gap-2 shrink-0 ml-3">
                              <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest text-emerald-400 whitespace-nowrap">
                                {m.probability > 1 ? Math.round(m.probability) : Math.round(m.probability * 100)}%
                              </div>
                              <button 
                                onClick={() => { setSelectedMilestone(m); setSelectedMilestoneIndex(i); }}
                                className="w-9 h-9 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-blue-400 hover:bg-blue-600 hover:text-white transition-all shadow-lg"
                              >
                                <IconMapper name="visibility" className=" text-lg" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="bg-white p-10 sm:p-14 rounded-[3rem] border border-slate-100 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)]">
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900 mb-10 flex items-center gap-3">
                  Phương án dự phòng (Điểm điều chỉnh)
                 </h3>
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {report.strategicPivotPoints.map((p, i) => (
                      <div key={i} className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 group hover:bg-slate-900 transition-all shadow-sm hover:shadow-xl">
                      
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 group-hover:text-slate-600">Nếu xảy ra:</p>
                        <p className="text-xs font-black text-slate-900 mb-4 group-hover:text-white leading-tight uppercase italic">{p.condition}</p>
                        <div className="pt-4 border-t border-slate-200 group-hover:border-white/10">
                           <p className="text-[9px] font-black uppercase tracking-widest text-blue-600 group-hover:text-blue-400 mb-2">Hành động:</p>
                           <p className="text-[11px] font-medium text-slate-600 group-hover:text-slate-300 leading-relaxed italic">"{p.action}"</p>
                        </div>
                      </div>
                    ))}
                 </div>
              </section>
           </div>

           {/* Factors column */}
           <div className="lg:col-span-4 space-y-10">
              <section className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)]">
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900 mb-10">Nhân tố ảnh hưởng</h3>
                 <div className="space-y-8">
                    {report.influencingFactors.map((f, i) => (
                      <div key={i} className="space-y-3">
                         <div className="flex justify-between items-center">
                            <span className="text-[9px] font-black uppercase tracking-widest text-blue-600">{f.category}</span>
                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-md border ${
                               f.influence === 'High' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                               f.influence === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                               'bg-emerald-50 text-emerald-600 border-emerald-100'
                            }`}>
                               {translateInfluence(f.influence).toUpperCase()}
                            </span>
                         </div>
                         <h5 className="font-black text-slate-900 text-sm leading-relaxed uppercase italic">{f.factor}</h5>
                         <p className="text-xs text-slate-600 leading-relaxed font-medium italic opacity-80">{f.description}</p>
                      </div>
                    ))}
                 </div>
              </section>

              <section className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden border border-slate-800">
                 <div className="absolute top-0 right-0 p-8 opacity-10">
                    <IconMapper name="rocket_launch" className=" text-7xl" />
                 </div>
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-8">Viễn cảnh dài hạn (3-5 năm)</h3>
                 <p className="text-sm font-medium leading-relaxed italic relative z-10 opacity-90">
                    "{report.longTermProjection}"
                 </p>
              </section>

              <div className="flex flex-col gap-4">
                 <button onClick={() => window.print()} className="w-full py-5 bg-blue-600 text-white font-black text-[11px] uppercase tracking-widest rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-3">
                    XUẤT BÁO CÁO (.PDF) <IconMapper name="download" className=" text-lg" />
                 </button>
                 <button onClick={() => navigate(-1)} className="w-full py-5 bg-white border border-slate-200 text-slate-600 font-black text-[11px] uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
                    QUAY LẠI TỔNG QUAN
                 </button>
              </div>
           </div>
        </div>
      </main>

      <AnimatePresence>
        {selectedMilestone && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedMilestone(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-[0_80px_160px_-40px_rgba(0,0,0,0.6)] overflow-hidden border border-slate-100"
            >
              <div className="p-8 sm:p-10 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div>
                   <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 block">CHI TIẾT THỰC THI</span>
                   <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-display leading-[1.4] uppercase italic">{selectedMilestone.event}</h3>
                </div>
                <button 
                  onClick={() => setSelectedMilestone(null)}
                  className="w-10 h-10 rounded-full hover:bg-white flex items-center justify-center transition-all text-slate-400 hover:text-slate-950"
                >
                  <IconMapper name="close" className=" text-2xl" />
                </button>
              </div>
              <div className="p-8 sm:p-10 max-h-[50vh] overflow-y-auto">
                <div className="flex items-center gap-4 mb-8">
                   <div className="px-4 py-1.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">THÁNG: {selectedMilestone.month}</div>
                   <div className="px-4 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-[10px] font-black uppercase tracking-widest">XÁC SUẤT: {selectedMilestone.probability}%</div>
                </div>
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                    <IconMapper name="tips_and_updates" className=" text-blue-600 text-lg" /> HƯỚNG DẪN CỤ THỂ:
                  </h4>
                  {Array.isArray(selectedMilestone.details) ? (
                    <div className="space-y-4">
                      {selectedMilestone.details.map((step: any, stepIdx: number) => (
                        <div 
                          key={step.id || stepIdx}
                          className={`p-5 rounded-2xl border transition-all duration-300 ${
                            step.completed 
                              ? 'bg-slate-50 border-slate-200 opacity-75' 
                              : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <button
                              onClick={() => handleToggleStepStatus(selectedMilestoneIndex!, step.id, step.completed)}
                              className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border transition-all ${
                                step.completed 
                                  ? 'bg-emerald-500 border-emerald-500 text-white scale-105' 
                                  : 'bg-white border-slate-300 text-transparent hover:border-slate-400'
                              }`}
                            >
                              <IconMapper name="check" className="text-xs font-bold" />
                            </button>
                            
                            <div className="flex-1 min-w-0">
                              <h5 className={`text-sm font-bold text-slate-900 leading-snug transition-all ${
                                step.completed ? 'line-through text-slate-400 font-medium' : ''
                              }`}>
                                {stepIdx + 1}. {step.title}
                              </h5>
                              {step.description && (
                                <p className={`text-xs text-slate-500 mt-2 leading-relaxed ${
                                  step.completed ? 'text-slate-400/80' : ''
                                }`}>
                                  Mô tả ngắn: {step.description}
                                </p>
                              )}
                              <div className="mt-3 flex justify-start">
                                <button
                                  onClick={() => {
                                    setSelectedMilestone(null);
                                    setSelectedMilestoneIndex(null);
                                    navigate(`/scenario/${progressId}/step/${step.id}`, {
                                      state: {
                                        scenario,
                                        context,
                                        timeframe,
                                        existingProgress: {
                                          id: progressId,
                                          report,
                                          completedMilestones: report.milestones.map((_, i) => i).filter(i => getMilestoneStatus(i) === 'Đã hoàn thành')
                                        }
                                      }
                                    });
                                  }}
                                  className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 hover:underline flex items-center gap-1"
                                >
                                  Xem chi tiết <IconMapper name="arrow_forward" className="text-[10px]" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-600 text-base leading-relaxed font-medium whitespace-pre-wrap italic opacity-90">
                      {selectedMilestone.details}
                    </p>
                  )}
                </div>
              </div>
              <div className="p-8 sm:p-10 border-t border-slate-50 flex justify-end gap-6 bg-slate-50/20">
                 <button 
                   onClick={() => { setSelectedMilestone(null); setSelectedMilestoneIndex(null); }}
                   className="px-8 py-4 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-900 transition-colors"
                 >
                   Đóng
                 </button>
                 {selectedMilestoneIndex !== null && getMilestoneStatus(selectedMilestoneIndex) === 'Đang tiến hành' && (
                   <button 
                    onClick={() => handleCompleteMilestone(selectedMilestoneIndex)}
                    className="px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 flex items-center gap-2"
                   >
                     <IconMapper name="check_circle" className=" text-lg" /> Đánh dấu hoàn thành
                   </button>
                 )}
                 {selectedMilestoneIndex !== null && getMilestoneStatus(selectedMilestoneIndex) === 'Đã hoàn thành' && (
                   <div className="px-10 py-4 bg-slate-100 text-emerald-600 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                     <IconMapper name="verified" className=" text-lg" /> Đã hoàn thành
                   </div>
                 )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPivoting && (
          <div className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-xl text-white">
            <div className="relative w-32 h-32 mb-10">
              <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full"
              ></motion.div>
              <div className="absolute inset-0 flex items-center justify-center">
                <IconMapper name="refresh" className=" text-blue-500 text-4xl animate-pulse" />
              </div>
            </div>
            <h2 className="text-xl font-black uppercase tracking-widest mb-4 text-blue-500">Đang điều chỉnh lộ trình</h2>
            <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest animate-pulse">AI đang phân tích phản hồi và tối ưu các cột mốc tiếp theo...</p>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isFeedbackModalOpen && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/85 backdrop-blur-lg" />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 24 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] border border-slate-100 overflow-hidden"
            >
              {/* Header gradient strip */}
              <div className="h-1.5 w-full bg-gradient-to-r" />

              <div className="p-8 sm:p-10">
                {/* Icon + Title */}
                <div className="flex items-center gap-5 mb-6">
                  <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0">
                    <IconMapper name="chat_bubble" className=" text-2xl" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Cột mốc hoàn thành</p>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">Phản hồi cột mốc</h3>
                  </div>
                </div>

                {/* Description */}
                <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6 pl-1">
                  Bạn có gặp khó khăn, vấn đề hoặc kết quả không mong muốn nào khi thực hiện cột mốc này không? Chia sẻ để AI tối ưu lộ trình tiếp theo.
                </p>

                {/* Textarea */}
                <textarea
                  className="w-full h-36 p-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none resize-none transition-all mb-6 font-medium text-slate-700 placeholder:text-slate-400 placeholder:italic"
                  placeholder="Ví dụ: Tôi gặp khó khăn ở bước học toán tích phân, kết quả thi thử chỉ đạt 6 điểm thay vì 8 điểm mong muốn..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />

                {/* Actions */}
                <div className="flex flex-col gap-3">
                  <button
                    onClick={submitFeedback}
                    disabled={!feedback.trim()}
                    className="w-full py-4 bg-blue-600 text-white font-black text-[11px] uppercase tracking-widest rounded-2xl hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                  >
                    <IconMapper name="send" className=" text-base" /> Gửi phản hồi &amp; Tối ưu lộ trình
                  </button>
                  <button
                    onClick={handleNoFeedback}
                    className="w-full py-4 bg-slate-50 border border-slate-200 text-slate-500 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-all"
                  >
                    Bỏ qua — Đánh dấu hoàn thành ngay
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isConfirmPivotModalOpen && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/85 backdrop-blur-lg" />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 24 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] border border-slate-100 overflow-hidden"
            >
              {/* Amber gradient header strip */}
              <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500" />

              <div className="p-8 sm:p-10">
                {/* Icon + Title */}
                <div className="flex items-center gap-5 mb-6">
                  <div className="w-14 h-14 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0">
                    <IconMapper name="psychology" className=" text-2xl" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">AI Điều chỉnh</p>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">Tối ưu lộ trình</h3>
                  </div>
                </div>

                {/* Description */}
                <p className="text-slate-600 text-sm font-medium leading-relaxed mb-4">
                  Dựa trên phản hồi của bạn, AI sẽ phân tích và đề xuất các cột mốc mới phù hợp hơn với tình trạng hiện tại.
                </p>

                {/* Info box */}
                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl mb-8">
                  <IconMapper name="info" className=" text-amber-600 text-lg shrink-0 mt-0.5" />
                  <p className="text-[11px] text-amber-700 font-bold leading-relaxed">
                    Các cột mốc bạn đã hoàn thành sẽ được giữ nguyên. Chỉ các cột mốc chưa thực hiện mới được điều chỉnh.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => handleConfirmPivot(true)}
                    className="w-full py-4 bg-amber-500 text-white font-black text-[11px] uppercase tracking-widest rounded-2xl hover:bg-amber-600 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <IconMapper name="bolt" className=" text-base" /> Đồng ý &amp; Cập nhật lộ trình
                  </button>
                  <button
                    onClick={() => handleConfirmPivot(false)}
                    className="w-full py-4 bg-slate-50 border border-slate-200 text-slate-500 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-all"
                  >
                    Không, giữ nguyên lộ trình cũ
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

export default PremiumAnalysisPage;
