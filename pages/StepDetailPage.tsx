import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { apiFetch } from '../services/apiClient';
import { PremiumAnalysisReport, MilestoneStep } from '../types';
import SharedHeader from '../components/SharedHeader';
import SharedFooter from '../components/SharedFooter';
import { IconMapper } from '../components/IconMapper';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { motion } from 'framer-motion';
import { expandStepDetail } from '../services/geminiService';

const StepDetailPage: React.FC = () => {
  const { scenarioId, stepId } = useParams<{ scenarioId: string; stepId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<PremiumAnalysisReport | null>(null);
  const [activeStep, setActiveStep] = useState<MilestoneStep | null>(null);
  const [milestoneIndex, setMilestoneIndex] = useState<number | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
  const [expandError, setExpandError] = useState<string | null>(null);

  // Extract navigation states to return back nicely
  const { scenario, context, timeframe, existingProgress } = (location.state as any) || {};

  const handleExpandStep = async () => {
    if (!scenarioId || !stepId || isExpanding) return;

    setIsExpanding(true);
    setExpandError(null);

    try {
      const res = await expandStepDetail(scenarioId, stepId);
      setActiveStep(res.step);
      if (res.report) {
        setReport(res.report);
      }
    } catch (err: any) {
      console.error(err);
      setExpandError(err.message || 'Không thể tối ưu chi tiết nhiệm vụ.');
    } finally {
      setIsExpanding(false);
    }
  };

  const fetchScenarioData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`/premium/progress/${scenarioId}`);
      if (!res.ok) {
        throw new Error('Không thể tải thông tin kịch bản.');
      }
      const data = await res.json();
      setReport(data.report);
      findActiveStep(data.report);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Lỗi hệ thống khi tải chi tiết nhiệm vụ.');
    } finally {
      setLoading(false);
    }
  };

  const findActiveStep = (currentReport: PremiumAnalysisReport) => {
    if (!currentReport || !stepId) return;
    
    let foundStep: MilestoneStep | null = null;
    let foundMilestoneIdx: number | null = null;

    for (let i = 0; i < currentReport.milestones.length; i++) {
      const milestone = currentReport.milestones[i];
      if (Array.isArray(milestone.details)) {
        const step = milestone.details.find((s: MilestoneStep) => s.id === stepId);
        if (step) {
          foundStep = step;
          foundMilestoneIdx = i;
          break;
        }
      }
    }

    if (foundStep) {
      setActiveStep(foundStep);
      setMilestoneIndex(foundMilestoneIdx);
    } else {
      setError('Không tìm thấy nhiệm vụ chi tiết.');
    }
  };

  useEffect(() => {
    if (scenarioId && stepId) {
      fetchScenarioData();
    }
  }, [scenarioId, stepId]);

  const handleToggleCompletion = async () => {
    if (!activeStep || !report || milestoneIndex === null || isUpdating) return;

    const originalCompletedState = activeStep.completed;
    const targetState = !originalCompletedState;
    setIsUpdating(true);

    // Optimistic UI Update
    const updatedStep = { ...activeStep, completed: targetState };
    setActiveStep(updatedStep);

    const updatedReport = { ...report };
    const m = updatedReport.milestones[milestoneIndex];
    if (Array.isArray(m.details)) {
      const s = m.details.find((step: MilestoneStep) => step.id === stepId);
      if (s) {
        s.completed = targetState;
      }
    }
    setReport(updatedReport);

    try {
      const res = await apiFetch('/scenario/step-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId,
          stepId,
          completed: targetState
        })
      });
      if (!res.ok) {
        throw new Error('Failed to update status');
      }
    } catch (err) {
      console.error(err);
      // Revert optimistic update on failure
      setActiveStep({ ...activeStep, completed: originalCompletedState });
      
      const revertedReport = { ...report };
      const mRev = revertedReport.milestones[milestoneIndex];
      if (Array.isArray(mRev.details)) {
        const sRev = mRev.details.find((step: MilestoneStep) => step.id === stepId);
        if (sRev) {
          sRev.completed = originalCompletedState;
        }
      }
      setReport(revertedReport);
      alert('Lỗi kết nối khi cập nhật trạng thái. Vui lòng thử lại.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleGoBack = () => {
    if (scenario) {
      // Return to PremiumAnalysisPage and restore its state
      navigate('/premium-analysis', {
        state: {
          scenario,
          context,
          timeframe,
          existingProgress: {
            ...existingProgress,
            id: scenarioId,
            report: report || existingProgress?.report
          }
        }
      });
    } else {
      // Fallback
      navigate('/progress');
    }
  };

  return (
    <AnimatedBackground className="min-h-screen bg-slate-50 flex flex-col relative font-sans selection:bg-blue-200">
      <SharedHeader />

      <main className="flex-1 w-full max-w-[1200px] mx-auto px-6 py-12 relative z-10">
        {/* Back Button */}
        <button
          onClick={handleGoBack}
          className="mb-8 flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-semibold text-sm"
        >
          <IconMapper name="arrow_back" className="text-lg" />
          Quay lại Lộ trình chi tiết
        </button>

        {loading ? (
          <div className="bg-white rounded-[2.5rem] p-16 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400 font-medium text-sm">Đang tải chi tiết nhiệm vụ...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-[2.5rem] p-16 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col items-center justify-center min-h-[400px] text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
              <IconMapper name="error" className="text-3xl" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Đã xảy ra lỗi</h3>
            <p className="text-slate-500 max-w-md mb-8">{error}</p>
            <button
              onClick={fetchScenarioData}
              className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
            >
              Thử lại
            </button>
          </div>
        ) : activeStep ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start"
          >
            {/* Left Column: Main Task Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Header and description in a beautiful integrated banner */}
              <div className="p-8 sm:p-12 bg-slate-900 text-white rounded-[2.5rem] shadow-xl relative overflow-hidden border border-slate-800">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                  <IconMapper name="description" className="text-9xl" />
                </div>
                <div className="relative z-10">
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3 block">
                    Nhiệm vụ chi tiết
                  </span>
                  <h1 className="text-2xl sm:text-4xl font-black font-display leading-[1.2] uppercase italic mb-6">
                    {activeStep.title}
                  </h1>
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-medium">
                    {activeStep.description}
                  </p>
                </div>
              </div>

              {/* Action Stepper */}
              {activeStep.actions && activeStep.actions.length > 0 && (
                <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] space-y-6">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <IconMapper name="format_list_numbered" className="text-sm" /> Các bước thực hiện chi tiết
                  </h3>
                  <div className="relative pl-6 border-l-2 border-blue-100/60 ml-4 space-y-8">
                    {activeStep.actions.map((act, i) => (
                      <div key={i} className="relative group">
                        {/* Dot indicator */}
                        <div className="absolute -left-[35px] top-0 w-6 h-6 rounded-full bg-blue-600 border-4 border-white text-white font-black text-[9px] flex items-center justify-center shadow-md">
                          {i + 1}
                        </div>
                        <div className="space-y-1">
                          <p className="text-slate-800 text-sm sm:text-base font-semibold leading-relaxed">
                            {act}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Expected Result */}
              {activeStep.expectedResult && (
                <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 rounded-[2.5rem] p-8 sm:p-12 shadow-[0_20px_50px_rgba(16,185,129,0.02)] space-y-3">
                  <h3 className="text-[10px] font-black text-emerald-800 uppercase tracking-widest flex items-center gap-2">
                    <IconMapper name="workspace_premium" className="text-sm" /> Kết quả đầu ra mong muốn
                  </h3>
                  <p className="text-slate-850 text-sm sm:text-base font-semibold leading-relaxed">
                    {activeStep.expectedResult}
                  </p>
                </div>
              )}
            </div>

            {/* Right Column: Status & Sidebar Metadata */}
            <div className="space-y-6">
              {/* Status and Completion Toggle */}
              <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] flex flex-col items-center text-center gap-6">
                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-slate-50 border border-slate-100 shadow-inner">
                  <IconMapper 
                    name={activeStep.completed ? 'check_circle' : 'pending'} 
                    className={`text-3xl ${activeStep.completed ? 'text-emerald-500' : 'text-amber-500'}`} 
                  />
                </div>
                <div>
                  <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-1">
                    Trạng thái tiến độ
                  </h4>
                  <p className={`text-sm font-black uppercase tracking-wider ${activeStep.completed ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {activeStep.completed ? 'Đã hoàn thành' : 'Đang thực hiện'}
                  </p>
                </div>
                <button
                  onClick={handleToggleCompletion}
                  disabled={isUpdating}
                  className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-2 ${
                    activeStep.completed
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100 shadow-lg'
                      : 'bg-slate-900 text-white hover:bg-blue-600 shadow-slate-200'
                  }`}
                >
                  <IconMapper name={activeStep.completed ? 'check_circle' : 'radio_button_unchecked'} className="text-lg" />
                  {activeStep.completed ? 'Đã hoàn thành' : 'Đánh dấu hoàn thành'}
                </button>
              </div>

              {/* Objectives Checklist */}
              {activeStep.objectives && activeStep.objectives.length > 0 && (
                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] space-y-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <IconMapper name="track_changes" className="text-sm" /> Mục tiêu cần đạt
                  </h3>
                  <ul className="space-y-3">
                    {activeStep.objectives.map((obj, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 p-4 bg-slate-50/50 rounded-2xl text-slate-700 font-semibold text-xs border border-slate-100/50"
                      >
                        <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                          <IconMapper name="done" className="text-[10px] font-bold" />
                        </span>
                        <span className="leading-relaxed">{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tools & Resources */}
              {activeStep.tools && activeStep.tools.length > 0 && (
                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] space-y-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <IconMapper name="build" className="text-sm" /> Công cụ khuyên dùng
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {activeStep.tools.map((tool, i) => (
                      <span
                        key={i}
                        className="px-3.5 py-2 bg-blue-50/50 border border-blue-100 rounded-xl text-blue-700 font-bold text-xs flex items-center gap-1.5"
                      >
                        <IconMapper name="construction" className="text-xs" />
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ) : null}
      </main>

      <SharedFooter />
    </AnimatedBackground>
  );
};

export default StepDetailPage;
