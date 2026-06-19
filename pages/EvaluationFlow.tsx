import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { mapScoreToLevel, CategoryType } from '../data/evaluationQuestions'; // still using types and helper
import { getEvaluationQuestions, submitEvaluationResult } from '../services/evaluationService';
import SharedHeader from '../components/SharedHeader';
import SharedFooter from '../components/SharedFooter';
import { IconMapper } from '../components/IconMapper';
import { AnimatedBackground } from '../components/AnimatedBackground';

type EvaluationStep = 'loading' | 'onboarding' | 'questionnaire' | 'result';

interface Answer {
  questionId: number;
  selectedValue: number;
}

const CATEGORY_NAMES: Record<CategoryType, string> = {
  stress: 'Áp lực hiện tại',
  finance: 'Tài chính cá nhân',
  capability: 'Năng lực chuyên môn',
  risk: 'Chỉ số rủi ro'
};

const CATEGORY_ICONS: Record<CategoryType, string> = {
  stress: 'psychology_alt',
  finance: 'account_balance_wallet',
  capability: 'school',
  risk: 'bolt'
};

const EvaluationFlow: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isFromSimulate = location.state?.from === 'simulate';

  const [step, setStep] = useState<EvaluationStep>('loading');
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [evaluationQuestions, setEvaluationQuestions] = useState<any[]>([]);
  const [dbResults, setDbResults] = useState<any>(null);

  useEffect(() => {
    getEvaluationQuestions().then(data => {
      setEvaluationQuestions(data);
      setStep('onboarding');
    }).catch(err => {
      console.error(err);
      // Fallback or error handling
    });
  }, []);

  const handleStart = () => {
    if (evaluationQuestions.length === 0) {
      alert("Không tải được danh sách câu hỏi. Vui lòng tải lại trang.");
      return;
    }
    setStep('questionnaire');
    setCurrentQIndex(0);
    setAnswers([]);
  };

  const handleSelectOption = (questionId: number, selectedValue: number) => {
    let finalAnswers: Answer[] = [];
    
    setAnswers((prev) => {
      const existing = prev.find((a) => a.questionId === questionId);
      const newAnswers = existing 
        ? prev.map((a) => (a.questionId === questionId ? { ...a, selectedValue } : a))
        : [...prev, { questionId, selectedValue }];
      
      finalAnswers = newAnswers;
      return newAnswers;
    });

    setTimeout(async () => {
      if (currentQIndex < evaluationQuestions.length - 1) {
        setCurrentQIndex((prevIndex) => prevIndex + 1);
      } else {
        // Submit to API using newAnswers to avoid stale closure
        try {
          const res = await submitEvaluationResult(finalAnswers);
          setDbResults(res.normalizedScores);
          setStep('result');
        } catch (error) {
          console.error("Error submitting evaluation", error);
          alert("Lỗi lưu kết quả, vui lòng thử lại sau.");
        }
      }
    }, 400); // delay for animation
  };

  const currentQuestion = evaluationQuestions[currentQIndex];
  const progress = evaluationQuestions.length > 0 ? ((currentQIndex) / evaluationQuestions.length) * 100 : 0;
  
  const currentCategory = currentQuestion?.category;
  const questionsInCategory = evaluationQuestions.filter(q => q.category === currentCategory);
  const currentQInCategoryIndex = questionsInCategory.findIndex(q => q.questionId === currentQuestion?.questionId);

  // Results come from DB now
  const results = dbResults;

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const renderRadarChart = (data: Record<CategoryType, number>) => {
    const size = 300;
    const center = size / 2;
    const maxRadius = 100;
    const categories: CategoryType[] = ['stress', 'finance', 'capability', 'risk'];
    
    // Map scores to chart coordinates. 
    // Need to invert stress and risk if we want outer = good, or keep it raw so outer = high value.
    // Let's keep it raw: outer = high score (high stress, high risk, high finance, high capability).
    const getCoordinates = (value: number, index: number) => {
      const angle = (Math.PI * 2 * index) / categories.length - Math.PI / 2;
      const radius = (value / 100) * maxRadius;
      return {
        x: center + radius * Math.cos(angle),
        y: center + radius * Math.sin(angle)
      };
    };

    const points = categories.map((cat, i) => getCoordinates(data[cat], i));
    const pointsStr = points.map((p) => `${p.x},${p.y}`).join(' ');

    return (
      <div className="relative w-[300px] h-[300px] mx-auto my-8">
        <svg viewBox="0 0 300 300" className="w-full h-full drop-shadow-xl overflow-visible">
          {/* Background circles */}
          {[20, 40, 60, 80, 100].map((val) => (
            <circle key={val} cx={center} cy={center} r={(val / 100) * maxRadius} stroke="#e2e8f0" strokeWidth="1" fill="none" strokeDasharray="4 4" />
          ))}
          {/* Axes */}
          {categories.map((_, i) => {
            const { x, y } = getCoordinates(100, i);
            return <line key={i} x1={center} y1={center} x2={x} y2={y} stroke="#e2e8f0" strokeWidth="1" />;
          })}
          
          {/* Labels */}
          {categories.map((cat, i) => {
            const labelPos = getCoordinates(125, i);
            return (
              <text key={`label-${i}`} x={labelPos.x} y={labelPos.y} textAnchor="middle" alignmentBaseline="middle" className="text-[10px] font-black fill-slate-500 uppercase tracking-widest">
                {CATEGORY_NAMES[cat]}
              </text>
            );
          })}

          {/* Polygon */}
          <motion.polygon
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            points={pointsStr}
            fill="rgba(37, 99, 235, 0.2)"
            stroke="#2563eb"
            strokeWidth="3"
            style={{ transformOrigin: 'center' }}
          />

          {/* Data Points */}
          {points.map((p, i) => (
            <circle key={`pt-${i}`} cx={p.x} cy={p.y} r="5" fill="#2563eb" />
          ))}
        </svg>
      </div>
    );
  };

  return (
    <AnimatedBackground className="flex flex-col min-h-screen">
      <SharedHeader />

      <main className="flex-1 max-w-4xl mx-auto px-6 py-10 w-full flex flex-col justify-center">
        <AnimatePresence mode="wait">
          
          {/* ONBOARDING STEP */}
          {step === 'onboarding' && (
            <motion.div key="onboarding" initial="initial" animate="animate" exit="exit" variants={pageVariants} className="text-center">
              <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner border border-blue-100">
                <IconMapper name="query_stats" className="text-5xl" />
              </div>
              <h1 className="text-4xl sm:text-6xl uppercase italic font-black mb-6 font-display tracking-tighter text-slate-900 leading-none">
                Hồ sơ <span className="text-blue-600">Chỉ số cá nhân.</span>
              </h1>
              <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium leading-relaxed mb-12">
                Hoàn thành 40 câu hỏi chuyên sâu thuộc 4 nhóm (Áp lực, Tài chính, Năng lực, Rủi ro) để AI tự động trích xuất và cấu hình chuẩn xác nhất cho bạn.
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16 max-w-3xl mx-auto">
                {Object.entries(CATEGORY_NAMES).map(([key, name]) => (
                  <motion.div 
                    key={key} 
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-200 transition-all group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-4 group-hover:bg-blue-100 group-hover:scale-110 transition-all relative z-10">
                      <IconMapper name={CATEGORY_ICONS[key as CategoryType]} className="text-2xl text-slate-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-slate-700 text-center relative z-10 leading-relaxed">{name}</span>
                    <span className="text-[10px] font-bold text-slate-400 mt-3 bg-slate-100 px-3 py-1 rounded-full relative z-10 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">10 CÂU</span>
                  </motion.div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 20px 40px -10px rgba(37,99,235,0.3)" }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStart}
                className="bg-slate-900 hover:bg-blue-600 text-white font-black py-6 px-16 rounded-2xl shadow-2xl flex items-center justify-center gap-4 text-xs uppercase tracking-widest mx-auto transition-colors"
              >
                Bắt đầu đánh giá <IconMapper name="arrow_forward" className="text-xl" />
              </motion.button>
            </motion.div>
          )}

          {/* QUESTIONNAIRE STEP */}
          {step === 'questionnaire' && (
            <motion.div key="questionnaire" initial="initial" animate="animate" exit="exit" variants={pageVariants} className="w-full">
              {/* Progress */}
              <div className="mb-12">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-2">
                      <IconMapper name={CATEGORY_ICONS[currentCategory]} className="text-lg" />
                      {CATEGORY_NAMES[currentCategory]}
                    </span>
                    <h2 className="text-2xl font-black text-slate-900 mt-1">Câu {currentQInCategoryIndex + 1} / 10</h2>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Tổng tiến trình: {currentQIndex + 1}/40
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-blue-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: "easeInOut", duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Question Card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestion.questionId}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white/70 backdrop-blur-xl border border-slate-200 rounded-[3rem] p-8 sm:p-12 shadow-2xl shadow-slate-100/50"
                >
                  <h3 className="text-3xl font-black text-slate-900 leading-tight mb-10 font-display">
                    {currentQuestion.question}
                  </h3>

                  <div className="flex flex-col gap-4">
                    {currentQuestion.options.map((option: any, idx: number) => {
                      const isSelected = answers.find(a => a.questionId === currentQuestion.questionId)?.selectedValue === option.value;
                      return (
                        <motion.button
                          key={idx}
                          whileHover={{ scale: 1.01, x: 4 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => handleSelectOption(currentQuestion.questionId, option.value)}
                          className={`w-full p-5 rounded-2xl border-2 text-left font-bold flex items-center gap-4 ${
                            isSelected 
                              ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-md shadow-blue-500/10' 
                              : 'border-slate-100 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50/50 shadow-sm'
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                            isSelected ? 'border-blue-600' : 'border-slate-300'
                          }`}>
                            {isSelected && <div className="w-3 h-3 bg-blue-600 rounded-full" />}
                          </div>
                          {option.text}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}

          {/* RESULT STEP */}
          {step === 'result' && results && (
            <motion.div key="result" initial="initial" animate="animate" exit="exit" variants={pageVariants} className="w-full text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-widest mb-6">
                Đánh giá hoàn tất
              </div>
              <h1 className="text-4xl sm:text-6xl uppercase italic font-black mb-4 font-display tracking-tighter text-slate-900 leading-none">
                Kết quả <span className="text-emerald-600">Phân tích.</span>
              </h1>
              
              <div className="bg-white/70 backdrop-blur-xl border border-slate-200 rounded-[3rem] p-8 sm:p-12 shadow-2xl shadow-slate-100/50 my-10 max-w-3xl mx-auto">
                {renderRadarChart(results)}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-10 text-left border-t border-slate-100 pt-10">
                  {Object.entries(CATEGORY_NAMES).map(([key, name]) => {
                    const score = results[key as CategoryType];
                    const level = mapScoreToLevel(score);
                    // Determine color based on positive/negative
                    const isPositiveGroup = key === 'finance' || key === 'capability';
                    const colorClass = isPositiveGroup 
                      ? (score >= 60 ? 'text-emerald-600' : score <= 40 ? 'text-rose-600' : 'text-blue-600')
                      : (score >= 60 ? 'text-rose-600' : score <= 40 ? 'text-emerald-600' : 'text-amber-600');
                      
                    const bgClass = colorClass.replace('text-', 'bg-');

                    return (
                      <motion.div 
                        key={key} 
                        whileHover={{ scale: 1.02, y: -4 }}
                        className="relative overflow-hidden bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group"
                      >
                        <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-[0.15] blur-3xl transition-colors ${bgClass}`} />
                        
                        <div className="flex items-center gap-4 mb-6 relative z-10">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-50 group-hover:scale-110 transition-transform`}>
                            <IconMapper name={CATEGORY_ICONS[key as CategoryType]} className={`text-2xl ${colorClass}`} />
                          </div>
                          <span className="text-xs font-black uppercase tracking-widest text-slate-600">{name}</span>
                        </div>
                        
                        <div className="flex items-end justify-between mt-8 relative z-10">
                          <div>
                            <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-widest">Đánh giá</div>
                            <span className={`text-3xl font-black font-display uppercase ${colorClass}`}>{level}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-widest">Điểm số</div>
                            <span className="text-2xl font-bold text-slate-800">{score}<span className="text-sm text-slate-400 font-medium">/100</span></span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-6 mt-12">
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 20px 40px -10px rgba(37,99,235,0.3)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/simulate', { state: { evaluationResults: results, decisionContext: location.state?.decisionContext } })}
                  className="px-12 py-6 bg-slate-900 text-white font-black text-[11px] uppercase tracking-widest hover:bg-blue-600 rounded-2xl transition-colors shadow-2xl shadow-slate-200 flex items-center justify-center gap-4"
                >
                  {isFromSimulate ? 'Tiếp tục mô phỏng' : 'Bắt đầu mô phỏng tương lai'} 
                  <IconMapper name="auto_awesome" className="text-xl" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <SharedFooter />
    </AnimatedBackground>
  );
};

export default EvaluationFlow;
