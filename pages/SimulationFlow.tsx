import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  SimulationStep,
  SimulationData,
  PredictionResult,
  ScenarioResult,
} from "../types";
import {
  generateSimulation,
  analyzeInputReadiness,
} from "../services/geminiService";
import { saveToHistory } from "../data/mockDatabase";
import SharedHeader from "../components/SharedHeader";
import SharedFooter from "../components/SharedFooter";
import { IconMapper } from "../components/IconMapper";
import { AnimatedBackground } from "../components/AnimatedBackground";

import { getLatestEvaluation } from "../services/evaluationService";

const DECISION_TEMPLATES = [
  {
    id: "highschool_choice",
    label: "Chọn ngành & Trường ĐH",
    icon: "school",
    theme: {
      bg: "bg-blue-50/80",
      text: "text-blue-600",
      border: "border-blue-100/50",
      activeBg: "bg-blue-600",
      activeShadow: "shadow-blue-600/20",
      hoverBg: "group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-100/50"
    },
    content: `[BỐI CẢNH CHỌN NGÀNH & TRƯỜNG ĐH]
- Quyết định: Phân vân giữa [Lựa chọn A: Ví dụ học ngành CNTT tại ĐH Bách Khoa] và [Lựa chọn B: Học ngành Thiết kế Đồ họa tại ĐH Mỹ thuật].
- Hiện trạng học tập: Học sinh lớp [Lớp 11/12], khối học sở trường là [Khối A00/A01/D01...], điểm trung bình (GPA) khoảng [Điểm số].
- Năng lực nổi trội: [Ví dụ: Tư duy logic toán tốt, thích vẽ, biết giao tiếp ngoại ngữ].
- Ngân sách học phí: Bố mẹ có thể hỗ trợ khoảng [Số tiền] triệu/năm.
- Định hướng nghề nghiệp mong muốn: Trở thành [Vị trí mong muốn] sau khi tốt nghiệp.
- Lo ngại lớn nhất: [Sợ không đủ điểm chuẩn / Học phí quá cao / Ngành học không phù hợp thực tế].`,
  },
  {
    id: "university_career",
    label: "Định hướng việc làm ra trường",
    icon: "work",
    theme: {
      bg: "bg-emerald-50/80",
      text: "text-emerald-600",
      border: "border-emerald-100/50",
      activeBg: "bg-emerald-600",
      activeShadow: "shadow-emerald-600/20",
      hoverBg: "group-hover:bg-emerald-50 group-hover:text-emerald-600 group-hover:border-emerald-100/50"
    },
    content: `[BỐI CẢNH ĐỊNH HƯỚNG RA TRƯỜNG]
- Quyết định: Sau khi tốt nghiệp ngành [Tên ngành hiện tại] sẽ chọn đi làm ngay ở vị trí [Lựa chọn A: Ví dụ Nhân viên Marketing tại Agency] hay học tiếp lên [Lựa chọn B: Học Thạc sĩ hoặc đổi sang ngành Quản trị nhân sự].
- Hiện trạng học tập: Sinh viên năm [Năm 3/Năm cuối] trường [Tên trường], GPA hiện tại là [Điểm số/4.0]. Đã có kinh nghiệm [Thực tập/Làm thêm/Dự án CLB].
- Mục tiêu 3 năm đầu ra trường: Đạt mức lương [Thu nhập kỳ vọng] triệu/tháng và thăng tiến lên [Vị trí].
- Lo ngại lớn nhất: [Thiếu kinh nghiệm thực tế / Thị trường việc làm cạnh tranh / Sợ chọn sai hướng đi đầu đời].`,
  },
  {
    id: "study_abroad",
    label: "Du học vs Học trong nước",
    icon: "rocket_launch",
    theme: {
      bg: "bg-violet-50/80",
      text: "text-violet-600",
      border: "border-violet-100/50",
      activeBg: "bg-violet-600",
      activeShadow: "shadow-violet-600/20",
      hoverBg: "group-hover:bg-violet-50 group-hover:text-violet-650 group-hover:border-violet-100/50"
    },
    content: `[BỐI CẢNH DU HỌC VS TRONG NƯỚC]
- Quyết định: Đi du học bậc [Đại học/Thạc sĩ] tại [Tên quốc gia: Ví dụ Đức, Úc, Nhật] hay học chương trình liên kết/chính quy trong nước tại [Tên trường].
- Hiện trạng năng lực: GPA đạt [Điểm GPA], chứng chỉ ngoại ngữ đạt [Ví dụ: IELTS 6.5, JLPT N3].
- Điều kiện tài chính: Cần tìm học bổng [Toàn phần/Bán phần] vì ngân sách gia đình chỉ tự túc được khoảng [Số tiền] triệu/năm.
- Định hướng sau tốt nghiệp: [Muốn ở lại làm việc định cư nước ngoài / Trở về Việt Nam cống hiến].
- Lo ngại lớn nhất: [Rủi ro trượt học bổng / Chi phí sinh hoạt đắt đỏ / Sốc văn hóa và cô đơn].`,
  },
  {
    id: "work_study_balance",
    label: "Học tập vs Đi làm thêm",
    icon: "account_balance_wallet",
    theme: {
      bg: "bg-amber-50/80",
      text: "text-amber-600",
      border: "border-amber-100/50",
      activeBg: "bg-amber-600",
      activeShadow: "shadow-amber-600/20",
      hoverBg: "group-hover:bg-amber-50 group-hover:text-amber-650 group-hover:border-amber-100/50"
    },
    content: `[BỐI CẢNH HỌC TẬP VS ĐI LÀM THÊM]
- Quyết định: Dành thời gian [Số giờ] giờ/tuần để đi làm thêm [Tên việc làm thêm: Ví dụ gia sư, phục vụ, chạy grab] kiếm tiền tự trang trải hay tập trung 100% thời gian cho việc học để giành học bổng của trường.
- Hiện trạng tài chính: [Khó khăn/Tự túc một phần], học phí mỗi kỳ là [Số tiền] triệu đồng.
- Mục tiêu học tập: Duy trì GPA trên [GPA mong muốn] để không bị ảnh hưởng bằng tốt nghiệp.
- Lo ngại lớn nhất: [Đi làm thêm gây kiệt sức, sụt giảm điểm số / Thiếu chi phí sinh hoạt hàng ngày nếu không đi làm].`,
  },
  {
    id: "relocation_hometown",
    label: "Thành phố lớn vs Quê nhà",
    icon: "balance",
    theme: {
      bg: "bg-indigo-50/80",
      text: "text-indigo-600",
      border: "border-indigo-100/50",
      activeBg: "bg-indigo-600",
      activeShadow: "shadow-indigo-600/20",
      hoverBg: "group-hover:bg-indigo-50 group-hover:text-indigo-650 group-hover:border-indigo-100/50"
    },
    content: `[BỐI CẢNH LẬP NGHIỆP XA NHÀ VS QUÊ NHÀ]
- Quyết định: Ở lại lập nghiệp tại [Lựa chọn A: Thành phố lớn như Hà Nội, TP.HCM] hay trở về quê hương [Lựa chọn B: Tên tỉnh/thành phố quê nhà] để làm việc gần bố mẹ.
- Hiện trạng: Sinh viên sắp tốt nghiệp, chưa có nhà riêng ở thành phố lớn, chi phí thuê nhà và ăn uống tốn khoảng [Số tiền] triệu/tháng.
- Sự ủng hộ từ gia đình: [Bố mẹ muốn ở gần / Bố mẹ ủng hộ tự lập ở thành phố].
- Lo ngại lớn nhất: [Chi phí đắt đỏ và áp lực cạnh tranh ở thành phố / Cơ hội việc làm hạn chế ở quê nhà].`,
  },
  {
    id: "student_startup",
    label: "Dự án Khởi nghiệp sinh viên",
    icon: "psychology",
    theme: {
      bg: "bg-rose-50/80",
      text: "text-rose-600",
      border: "border-rose-100/50",
      activeBg: "bg-rose-600",
      activeShadow: "shadow-rose-600/20",
      hoverBg: "group-hover:bg-rose-50 group-hover:text-rose-650 group-hover:border-rose-100/50"
    },
    content: `[BỐI CẢNH KHỞI NGHIỆP/NGHIÊN CỨU SINH VIÊN]
- Quyết định: Thành lập nhóm khởi nghiệp dự án sinh viên [Mô hình: Ví dụ Phát triển ứng dụng học tập, kinh doanh đồ handmade online] hay tập trung tham gia Nghiên cứu Khoa học tại trường.
- Hiện trạng nguồn lực: Số vốn ban đầu tự góp là [Số tiền] triệu đồng, có nhóm [Số người] sinh viên cùng tham gia. Có sự bảo trợ/hướng dẫn từ giảng viên [Có/Không].
- Mục tiêu ngắn hạn: [Tham gia cuộc thi khởi nghiệp sinh viên / Công bố bài báo khoa học / Có doanh thu nhỏ].
- Lo ngại lớn nhất: [Thiếu kiến thức thực tế / Nhóm tan vỡ vì xung đột thời gian học / Mất số vốn tích lũy].`,
  },
];

const SimulationFlow: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Loading state for fetching evaluation
  const [isFetchingEval, setIsFetchingEval] = useState(true);

  // Helper to map 0-100 to 1-5
  const mapEvalToSlider = (score: number) => {
    if (score <= 20) return 1;
    if (score <= 40) return 2;
    if (score <= 60) return 3;
    if (score <= 80) return 4;
    return 5;
  };

  // We set initial state to step passed from evaluation flow if any, otherwise description
  const [step, setStep] = useState<SimulationStep>(
    location.state?.evaluationResults
      ? SimulationStep.CONTEXT
      : SimulationStep.DESCRIPTION,
  );

  const [data, setData] = useState<SimulationData>({
    decision: location.state?.decisionContext || "",
    stress: 3,
    personalFinance: 3,
    risk: 3,
    academicPerformance: 3,
    otherFactors: "",
    tier: "free",
  });

  useEffect(() => {
    // Check if we already received results from state (after completing test)
    if (location.state?.evaluationResults) {
      const evalResults = location.state.evaluationResults;
      setData((prev) => ({
        ...prev,
        stress: mapEvalToSlider(evalResults.stress),
        personalFinance: mapEvalToSlider(evalResults.finance),
        risk: mapEvalToSlider(evalResults.risk),
        academicPerformance: mapEvalToSlider(evalResults.capability),
      }));
      setIsFetchingEval(false);
      return;
    }

    // Otherwise fetch latest from API
    getLatestEvaluation()
      .then((res) => {
        if (res && res.normalizedScores) {
          setData((prev) => ({
            ...prev,
            stress: mapEvalToSlider(res.normalizedScores.stress),
            personalFinance: mapEvalToSlider(res.normalizedScores.finance),
            risk: mapEvalToSlider(res.normalizedScores.risk),
            academicPerformance: mapEvalToSlider(
              res.normalizedScores.capability,
            ),
          }));
        }
      })
      .catch((err) => console.error("Could not fetch latest evaluation", err))
      .finally(() => setIsFetchingEval(false));
  }, [location.state]);

  const [loadingProgress, setLoadingProgress] = useState(0);
  const [clarificationQuestions, setClarificationQuestions] = useState<any[]>([]);
  const [clarificationAnswers, setClarificationAnswers] = useState<Record<number, string[]>>({});
  const [results, setResults] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<{
    message: string;
    type: "AUTH" | "NETWORK" | "LOCAL_CONFIG" | "GENERAL" | "OVERLOADED" | "RATE_LIMIT";
  } | null>(null);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [selectedScenario, setSelectedScenario] =
    useState<ScenarioResult | null>(null);

  const handleNextStep = async () => {
    if (step === SimulationStep.DESCRIPTION) {
      setStep(SimulationStep.CONTEXT);
    } else if (step === SimulationStep.CONTEXT) {
      setError(null);
      setStep(SimulationStep.PROCESSING);
      checkInputReadiness();
    }
  };

  const checkInputReadiness = async () => {
    setLoadingProgress(15);
    try {
      const readiness = await analyzeInputReadiness(data.decision);
      if (
        readiness.status === "needs_clarification" &&
        readiness.questions &&
        readiness.questions.length > 0
      ) {
        setClarificationQuestions(readiness.questions);
        setStep(SimulationStep.CONTEXT);
      } else {
        startSimulation();
      }
    } catch (e: any) {
      startSimulation();
    }
  };

  const handleToggleAnswerOption = (questionIdx: number, option: string) => {
    setClarificationAnswers(prev => {
      const currentOptions = prev[questionIdx] || [];
      if (currentOptions.includes(option)) {
        return {
          ...prev,
          [questionIdx]: currentOptions.filter(item => item !== option)
        };
      } else {
        return {
          ...prev,
          [questionIdx]: [...currentOptions, option]
        };
      }
    });
  };

  const submitClarification = () => {
    const additionalContext = clarificationQuestions.map((q, idx) => {
      const answers = clarificationAnswers[idx] || [];
      return `- ${q.question}: ${answers.join(', ') || 'Bỏ qua'}`;
    }).join('\\n');
    
    setData(prev => ({
      ...prev,
      decision:
        prev.decision +
        "\\n\\n[THÔNG TIN BỔ SUNG TỪ NGƯỜI DÙNG]\\n" +
        additionalContext,
    }));

    setClarificationQuestions([]);
    setClarificationAnswers({});
    setStep(SimulationStep.PROCESSING);
    startSimulation();
  };

  const handleSelectKey = async () => {
    if ((window as any).aistudio?.openSelectKey) {
      try {
        await (window as any).aistudio.openSelectKey();
        setError(null);
      } catch (e) {
        console.error("Failed to open key selector", e);
      }
    } else {
      setError({
        type: "LOCAL_CONFIG",
        message:
          "Bạn đang chạy ứng dụng ở môi trường Local. Vui lòng cấu hình API_KEY để tiếp tục.",
      });
    }
  };

  const startSimulation = async () => {
    setLoadingProgress(0);
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 8;
      if (progress >= 95) {
        progress = 95;
        clearInterval(interval);
      }
      setLoadingProgress(Math.floor(progress));
    }, 250);

    try {
      const result = await generateSimulation(data);
      // Assign IDs to scenarios if they don't have them
      const scenariosWithIds = result.scenarios.map((s, idx) => ({
        ...s,
        id: s.id || `SC-${Date.now()}-${idx}`,
      }));
      const finalResult = { ...result, scenarios: scenariosWithIds };

      setResults(finalResult);
      setLoadingProgress(100);
      setTimeout(() => setStep(SimulationStep.RESULTS), 800);
    } catch (e: any) {
      clearInterval(interval);
      if (e.code === "INSUFFICIENT_TOKENS") {
        setError({ message: e.message, type: "AUTH" });
      } else {
        setError({ message: e.message, type: "GENERAL" });
      }
      setStep(SimulationStep.CONTEXT);
    } finally {
      clearInterval(interval);
    }
  };

  const handleDeepAnalysis = (scenario: ScenarioResult) => {
    navigate(`/detail/${scenario.type.toLowerCase()}`, {
      state: { scenario, context: data },
    });
  };

  const handleSaveToHistory = () => {
    if (!results) return;
    setIsSaved(true);
    setIsSaveModalOpen(false);
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        delay: i * 0.15,
        type: "spring" as const,
        stiffness: 80,
        damping: 15,
      },
    }),
  };

  if (step === SimulationStep.DESCRIPTION) {
    return (
      <AnimatedBackground className="flex flex-col min-h-screen">
        <SharedHeader />
        <motion.div
          initial="initial"
          animate="animate"
          variants={pageVariants}
          className="flex-1 max-w-5xl mx-auto px-6 py-10 w-full"
        >
          <div className="flex flex-col items-center mb-10 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="px-6 py-2 bg-blue-50/80 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-blue-100/50 shadow-sm"
            >
              Mô phỏng lộ trình tương lai
            </motion.div>
            <h1 className="text-4xl sm:text-6xl uppercase italic font-black mb-4 font-display tracking-tighter text-slate-900 leading-none">
              Nhập bối cảnh <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">quyết định.</span>
            </h1>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium leading-relaxed">
              Trí tuệ nhân tạo sẽ quét các từ khóa để xây dựng các hướng đi
              tương lai.
            </p>
          </div>
          <div className="space-y-10">
            <div className="relative group">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur-lg opacity-5 group-focus-within:opacity-15 transition duration-500"></div>
              
              <div className="relative w-full bg-white/70 backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.03)] focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all duration-300 overflow-hidden flex flex-col">
                <textarea
                  id="tour-decision-textarea"
                  className="w-full h-[240px] sm:h-[280px] p-8 sm:p-10 bg-transparent text-base sm:text-lg leading-relaxed outline-none resize-none font-medium text-slate-800 placeholder:text-slate-400/80 placeholder:italic border-none"
                  placeholder="Ví dụ: Em là học sinh lớp 12 khối D01, đang phân vân giữa chọn học ngành Ngôn ngữ Anh tại ĐH Ngoại thương hay đi du học Úc ngành Quản trị Khách sạn..."
                  maxLength={1000}
                  value={data.decision}
                  onChange={(e) => setData({ ...data, decision: e.target.value })}
                />
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-end gap-4 px-8 py-4 bg-slate-50/50 border-t border-slate-100/80">
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end sm:ml-auto">
                    {data.decision.trim() && (
                      <button
                        onClick={() => setData({ ...data, decision: "" })}
                        className="text-[9px] font-black uppercase tracking-widest text-slate-450 hover:text-rose-500 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-rose-50 border border-transparent hover:border-rose-100"
                      >
                        Xóa tất cả
                      </button>
                    )}
                    <span className={`px-2.5 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg border shadow-sm transition-all ${
                      data.decision.length > 900
                        ? "bg-rose-50 border-rose-100 text-rose-600"
                        : "bg-slate-50 border-slate-200/50 text-slate-500"
                    }`}>
                      {data.decision.length} / 1000 ký tự
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div id="tour-decision-hints" className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 whitespace-nowrap">
                  Hoặc chọn biểu mẫu gợi ý chi tiết
                </span>
                <span className="h-px bg-slate-200/60 flex-1"></span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {DECISION_TEMPLATES.map((tmpl) => {
                  const isActive = data.decision === tmpl.content;
                  const theme = tmpl.theme;
                  return (
                    <motion.button
                      key={tmpl.id}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() =>
                        setData({ ...data, decision: tmpl.content })
                      }
                      className={`group flex items-center gap-3 p-3 rounded-2xl border text-left transition-all duration-300 ${
                        isActive
                          ? "border-blue-500 bg-blue-50/20 ring-2 ring-blue-500/10 shadow-sm"
                          : "border-slate-200/60 bg-white/50 backdrop-blur-sm hover:border-slate-300 hover:bg-white/90 shadow-sm"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center border shrink-0 transition-all duration-300 ${
                          isActive
                            ? `${theme.activeBg} text-white border-transparent`
                            : "bg-slate-50/85 text-slate-500 border-slate-100 group-hover:bg-blue-50/40 group-hover:text-blue-600 group-hover:border-blue-100/50"
                        }`}
                      >
                        <IconMapper name={tmpl.icon} className="text-sm" />
                      </div>
                      <div className="min-w-0 flex-1 flex items-center justify-between gap-2">
                        <span
                          className={`text-[10px] font-black uppercase tracking-wide truncate transition-colors duration-300 ${
                            isActive
                              ? "text-blue-750"
                              : "text-slate-700 group-hover:text-blue-600"
                          }`}
                        >
                          {tmpl.label}
                        </span>
                        {isActive ? (
                          <IconMapper
                            name="check_circle"
                            className="text-blue-600 text-sm shrink-0"
                          />
                        ) : (
                          <IconMapper
                            name="arrow_forward"
                            className="text-slate-300 group-hover:text-blue-500 text-xs shrink-0 transition-all duration-300 translate-x-[-2px] group-hover:translate-x-0 opacity-0 group-hover:opacity-100"
                          />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-8 pt-4">
              <motion.button
                whileHover={data.decision.trim() ? { scale: 1.02 } : {}}
                whileTap={data.decision.trim() ? { scale: 0.98 } : {}}
                id="tour-decision-btn"
                onClick={handleNextStep}
                disabled={!data.decision.trim()}
                className="w-full sm:w-auto bg-slate-900 hover:bg-blue-600 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold py-5 px-12 rounded-[2rem] shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 disabled:shadow-none transition-all duration-300 flex items-center justify-center gap-4 text-xs uppercase tracking-widest group"
              >
                Tiếp tục quy trình{" "}
                <IconMapper name="arrow_forward" className="text-sm transition-transform group-hover:translate-x-1" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </AnimatedBackground>
    );
  }

  if (step === SimulationStep.CONTEXT) {
    return (
      <AnimatedBackground className="flex flex-col min-h-screen">
        <SharedHeader />
        <motion.div
          initial="initial"
          animate="animate"
          variants={pageVariants}
          className="flex-1 max-w-6xl mx-auto px-6 py-10 w-full"
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className={`mb-8 p-6 bg-white border-2 rounded-[2.5rem] overflow-hidden relative ${
                error.type === 'OVERLOADED' ? 'border-amber-100 shadow-[0_20px_50px_rgba(245,158,11,0.1)]' :
                'border-rose-100 shadow-[0_20px_50px_rgba(244,63,94,0.1)]'
              }`}
            >
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <IconMapper name={
                  error.type === 'RATE_LIMIT' ? 'block' :
                  error.type === 'OVERLOADED' ? 'hourglass_empty' :
                  error.type === 'AUTH' ? 'toll' : 'error'
                } className={`text-8xl ${
                  error.type === 'OVERLOADED' ? 'text-amber-600' : 'text-rose-600'
                }`} />
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10">
                <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 shrink-0">
                  <IconMapper
                    name={error.type === "AUTH" ? "toll" : "warning"}
                    className=" text-3xl font-bold"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-black text-rose-900 uppercase tracking-widest mb-1">
                    {error.type === "AUTH"
                      ? "Không đủ token"
                      : "Cảnh báo hệ thống"}
                  </h3>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">
                    {error.message}
                  </p>
                </div>
                <div className="flex flex-col gap-3 w-full sm:w-auto">
                  {error.type === "AUTH" ? (
                    <button
                      onClick={() => navigate("/store")}
                      className="bg-blue-600 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                    >
                      Mua thêm token
                    </button>
                  ) : error.type === 'GENERAL' || error.type === 'LOCAL_CONFIG' ? (
                    <button
                      onClick={handleSelectKey}
                      className="bg-rose-600 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-100 flex items-center justify-center gap-2"
                    >
                      Cấu hình Key
                    </button>
                  ) : null}
                  <button
                    onClick={() => {
                      setError(null);
                      setStep(SimulationStep.PROCESSING);
                      startSimulation();
                    }}
                    className="bg-slate-900 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                  >
                    Thử lại ngay
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-widest mb-4">
              Thiết lập yếu tố ảnh hưởng
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tighter mb-4 font-display text-slate-900">
              Cấu hình <span className="text-emerald-600">Chỉ số.</span>
            </h1>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">
              Thiết lập các chỉ số thực tế để AI mô phỏng chính xác hơn.
            </p>
          </div>

          <div
            id="tour-sliders-container"
            className="bg-white/70 backdrop-blur-xl p-8 sm:p-12 rounded-[3.5rem] border border-slate-100 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.12)]"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              {[
                {
                  id: "stress",
                  label: "Áp lực hiện tại",
                  icon: "psychology_alt",
                  labels: ["Thấp", "Nhẹ", "Trung bình", "Cao", "Cực hạn"],
                  color: "accent-blue-600",
                  tooltip:
                    "Đánh giá mức độ căng thẳng hiện tại của bạn. Áp lực cao có thể làm giảm mạnh chỉ số Hạnh phúc trong kịch bản.",
                },
                {
                  id: "personalFinance",
                  label: "Tình hình tài chính cá nhân",
                  icon: "account_balance_wallet",
                  labels: [
                    "Rất yếu",
                    "Khó khăn",
                    "Ổn định",
                    "Dư dả",
                    "Thịnh vượng",
                  ],
                  color: "accent-emerald-600",
                  tooltip:
                    "Mức độ tự chủ và sẵn có về tài chính. Tài chính tốt giúp tăng tính ổn định và chỉ số ROI của lộ trình.",
                },
                {
                  id: "academicPerformance",
                  label: "Học lực / Năng lực chuyên môn",
                  icon: "school",
                  labels: ["Yếu", "Trung bình", "Khá", "Giỏi", "Xuất sắc"],
                  color: "accent-amber-600",
                  tooltip:
                    "Năng lực học tập hoặc trình độ chuyên môn hiện tại. Điểm số cao giúp tăng trưởng sự nghiệp diễn ra nhanh hơn.",
                },
                {
                  id: "risk",
                  label: "Chỉ số rủi ro",
                  icon: "bolt",
                  labels: [
                    "Cẩn trọng",
                    "Bảo thủ",
                    "Trung bình",
                    "Mạo hiểm",
                    "Quyết liệt",
                  ],
                  color: "accent-indigo-600",
                  tooltip:
                    "Mức độ sẵn sàng đối mặt rủi ro. Chỉ số cao giúp bạn có cơ hội bứt phá lớn nhưng cũng gặp nhiều biến cố hơn.",
                },
              ].map((slider) => (
                <div key={slider.id} className="space-y-6">
                  <div className="flex justify-between items-center">
                    <label
                      htmlFor={slider.id}
                      className="flex items-center gap-4 font-black text-[10px] uppercase tracking-widest text-slate-800"
                    >
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-blue-600 border border-slate-100 shadow-sm">
                        <IconMapper name={slider.icon} className=" text-xl" />
                      </div>
                      <span className="flex items-center gap-2">
                        {slider.label}
                        <span className="group/tooltip relative inline-block">
                          <IconMapper
                            name="help"
                            className="text-slate-400 hover:text-blue-600 cursor-help text-[14px]"
                          />
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 text-white text-[10px] rounded-xl shadow-xl opacity-0 group-hover/tooltip:opacity-100 transition-all duration-300 pointer-events-none z-50 normal-case tracking-normal font-medium leading-relaxed border border-slate-800 block text-center">
                            {slider.tooltip}
                            <span className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-slate-900 block"></span>
                          </span>
                        </span>
                      </span>
                    </label>
                    <motion.div
                      key={(data as any)[slider.id]}
                      initial={{ y: 5, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="text-[9px] font-black text-white px-4 py-1.5 bg-slate-900 rounded-lg uppercase tracking-widest shadow-lg shadow-slate-200"
                    >
                      {slider.labels[(data as any)[slider.id] - 1]}
                    </motion.div>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    className={`w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer ${slider.color}`}
                    value={(data as any)[slider.id]}
                    onChange={(e) =>
                      setData({
                        ...data,
                        [slider.id]: parseInt(e.target.value),
                      })
                    }
                  />
                  <div className="flex justify-between px-1">
                    <span className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter">
                      {slider.labels[0]}
                    </span>
                    <span className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter">
                      {slider.labels[4]}
                    </span>
                  </div>
                </div>
              ))}
              
              

              <div className="md:col-span-2 space-y-4 pt-6 border-t border-slate-50 mt-4">
                <label htmlFor="otherFactors" className="flex items-center gap-4 font-black text-[10px] uppercase tracking-widest text-slate-800">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-blue-600 border border-slate-100 shadow-sm">
                    <IconMapper name="more_horiz" className=" text-xl" />
                  </div>
                  Yếu tố khác (Khách quan/Chủ quan)
                </label>
                <textarea
                  id="otherFactors"
                  className="w-full h-24 p-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all resize-none"
                  placeholder="Nhập thêm các yếu tố khác ảnh hưởng đến quyết định của bạn..."
                  value={data.otherFactors}
                  onChange={(e) =>
                    setData({ ...data, otherFactors: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="mt-8 p-6 bg-blue-50/50 border border-blue-100 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                  <IconMapper name="assignment" className="text-2xl" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 mb-1">
                    Chưa rõ chỉ số của bản thân?
                  </h4>
                  <p className="text-xs text-slate-600 font-medium">
                    Làm bài test 40 câu hỏi chuyên sâu để AI tự động cấu hình
                    chuẩn xác nhất.
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() =>
                  navigate("/evaluate", {
                    state: { decisionContext: data.decision, from: "simulate" },
                  })
                }
                className="whitespace-nowrap px-6 py-3 bg-white text-blue-600 border border-blue-200 font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm"
              >
                Đánh giá chi tiết
              </motion.button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-10 pt-8 border-t border-slate-100">
              <button
                onClick={() => setStep(SimulationStep.DESCRIPTION)}
                className="flex-1 px-8 py-5 border border-slate-200 text-slate-400 font-black rounded-2xl hover:bg-slate-50 transition-all uppercase tracking-widest text-[10px]"
              >
                Quay lại
              </button>
              <button
                onClick={handleNextStep}
                className="flex-[2] bg-slate-900 text-white px-8 py-5 font-black rounded-2xl hover:bg-blue-600 transition-all shadow-2xl shadow-slate-200 flex items-center justify-center gap-4 text-[10px] uppercase tracking-widest"
              >
                Bắt đầu dự đoán{" "}
                <IconMapper name="play_arrow" className=" text-xl" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Clarification Modal */}
        <AnimatePresence>
          {clarificationQuestions.length > 0 && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                className="relative w-full max-w-2xl bg-white rounded-[3rem] p-10 sm:p-14 shadow-[0_100px_150px_-50px_rgba(0,0,0,0.5)] border border-slate-100 overflow-hidden max-h-[90vh] overflow-y-auto no-scrollbar"
              >
                <div className="text-center mb-10">
                  <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-amber-100">
                    <IconMapper name="contact_support" className=" text-4xl" />
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 font-display uppercase tracking-tighter mb-4">
                    Làm rõ thông tin
                  </h3>
                  <p className="text-slate-600 text-sm font-medium leading-relaxed">
                    Mô tả của bạn khá ngắn hoặc chưa đủ rõ ràng. Để AI dự báo chính xác hơn, vui lòng chọn thêm thông tin dưới đây (có thể chọn nhiều ý):
                  </p>
                </div>

                <div className="space-y-8 mb-10">
                  {clarificationQuestions.map((q, qIdx) => (
                    <div key={qIdx} className="space-y-4">
                      <h4 className="text-sm font-bold text-slate-800 leading-snug">
                        {qIdx + 1}. {q.question}
                      </h4>
                      <div className="flex flex-col gap-3">
                        {q.options.map((opt: string, oIdx: number) => {
                          const isSelected = (clarificationAnswers[qIdx] || []).includes(opt);
                          return (
                            <button
                              key={oIdx}
                              onClick={() => handleToggleAnswerOption(qIdx, opt)}
                              className={`p-4 text-left text-sm font-medium rounded-xl border transition-all ${
                                isSelected 
                                  ? 'bg-amber-50 border-amber-400 text-amber-800 shadow-md ring-2 ring-amber-400/20' 
                                  : 'bg-white border-slate-200 text-slate-650 hover:border-amber-300 hover:bg-amber-50/50'
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-4">
                  <button
                    onClick={submitClarification}
                    disabled={clarificationQuestions.some((_, qIdx) => !clarificationAnswers[qIdx] || clarificationAnswers[qIdx].length === 0)}
                    className="w-full py-6 bg-slate-900 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black text-[12px] uppercase tracking-widest rounded-2xl hover:bg-blue-600 transition-all shadow-2xl flex items-center justify-center gap-4"
                  >
                    Tiếp tục phân tích{" "}
                    <IconMapper name="arrow_forward" className=" text-xl" />
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </AnimatedBackground>
    );
  }

  if (step === SimulationStep.PROCESSING) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col font-sans overflow-hidden scan-effect">
        <main className="flex-1 flex flex-col items-center justify-center px-6 relative">
          <div className="absolute inset-0 opacity-20">
            <div
              className="w-full h-full"
              style={{
                backgroundImage:
                  "radial-gradient(#2563eb 1px, transparent 1px)",
                backgroundSize: "60px 60px",
              }}
            ></div>
          </div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative z-10"
          >
            <div className="relative w-80 h-80 mb-20 flex items-center justify-center">
              <svg
                viewBox="0 0 288 288"
                className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-[0_0_30px_rgba(37,99,235,0.4)]"
              >
                <circle
                  cx="144"
                  cy="144"
                  r="120"
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="4"
                  fill="none"
                />
                <motion.circle
                  cx="144"
                  cy="144"
                  r="120"
                  stroke="#2563eb"
                  strokeWidth="8"
                  fill="none"
                  pathLength="100"
                  strokeDasharray="100"
                  animate={{ strokeDashoffset: 100 - loadingProgress }}
                  transition={{ type: "tween" as const, ease: "linear" }}
                  strokeLinecap="round"
                />
              </svg>
              <div className="text-center relative z-20">
                <span className="text-8xl font-black tracking-tighter text-white font-display block">
                  {loadingProgress}
                  <span className="text-3xl ml-1 text-blue-500">%</span>
                </span>
                <p className="text-[11px] font-black text-blue-400 uppercase tracking-widest mt-6">
                  Đang Phân tích
                </p>
              </div>
            </div>
          </motion.div>

          <div className="text-center space-y-12 z-10">
            <h2 className="text-3xl font-black text-white tracking-widest uppercase font-display max-w-xl mx-auto leading-relaxed">
              Tiến độ dự đoán
            </h2>
            <div className="flex flex-col gap-6 mt-4 max-w-sm mx-auto text-left">
              {[
                {
                  label: "Phân tích từ khóa mô tả",
                  done: loadingProgress > 30,
                },
                {
                  label: "Mô phỏng 10,000 kịch bản",
                  done: loadingProgress > 60,
                },
                {
                  label:
                    "Tính toán Hiệu quả tài chính (ROI) & Chỉ số Hạnh phúc",
                  done: loadingProgress > 85,
                },
              ].map((task, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-6 transition-all duration-700 ${task.done ? "opacity-100 text-emerald-400 translate-x-4" : "opacity-20 text-white"}`}
                >
                  <IconMapper
                    name={task.done ? "check_circle" : "hourglass_top"}
                    className={` text-2xl ${task.done ? "scale-125" : ""}`}
                  />
                  <span className="text-xs font-black uppercase tracking-widest">
                    {task.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (step === SimulationStep.RESULTS && results) {
    return (
      <AnimatedBackground className="flex flex-col min-h-screen">
        <SharedHeader />

        <header className="py-24 px-6 bg-white border-b border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <IconMapper
              name="verified"
              className=" text-[300px] text-slate-900"
            />
          </div>
          <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-6 py-2 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest mb-12 shadow-2xl shadow-slate-200"
            >
              Phân tích hoàn tất • Report FT-
              {Math.floor(Math.random() * 9000) + 1000}
            </motion.div>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-12 font-display text-slate-900 leading-[0.95] max-w-5xl">
              {results.isEnterprise ? (
                <span className="text-rose-600">Thông báo</span>
              ) : (
                <>
                  Phân tích:{" "}
                  <span className="text-blue-600">
                    "{data.decision.slice(0, 30)}..."
                  </span>
                </>
              )}
            </h1>
            <p className="text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium">
              {results.summary}
            </p>
            {(results.summary.includes("Premium") || results.isEnterprise) && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => navigate("/simulate")}
                className="mt-12 px-10 py-5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-black rounded-2xl hover:scale-105 transition-all shadow-2xl shadow-amber-200 uppercase tracking-widest text-xs flex items-center gap-4"
              >
                <IconMapper name="workspace_premium" className=" font-bold" />{" "}
                Tinh năng này sẽ sớm ra mắt.
              </motion.button>
            )}
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-24 w-full">
          {!results.isEnterprise && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
                <AnimatePresence>
                  {results.scenarios.map((scenario, idx) => (
                    <motion.div
                      key={idx}
                      custom={idx}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      className={`flex flex-col bg-white border-2 border-slate-200 rounded-[3rem] overflow-hidden group hover:border-blue-600 hover:ring-4 hover:ring-blue-600/20 hover:shadow-2xl transition-all duration-700 relative ${
                        scenario.type === "Positive"
                          ? "ring-4 ring-emerald-50/50"
                          : scenario.type === "Risk"
                            ? "ring-4 ring-rose-50/50"
                            : ""
                      }`}
                    >
                      <div
                        className={`p-10 border-b border-slate-50 ${
                          scenario.type === "Positive"
                            ? "bg-emerald-50/30"
                            : scenario.type === "Neutral"
                              ? "bg-blue-50/30"
                              : "bg-rose-50/30"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-8">
                          <span
                            className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                              scenario.type === "Positive"
                                ? "bg-white text-emerald-600 border-emerald-100 shadow-sm"
                                : scenario.type === "Neutral"
                                  ? "bg-white text-blue-600 border-blue-100 shadow-sm"
                                  : "bg-white text-rose-600 border-rose-100 shadow-sm"
                            }`}
                          >
                            {scenario.type === "Positive"
                              ? "Tối ưu"
                              : scenario.type === "Neutral"
                                ? "Cân bằng"
                                : "Rủi ro cao"}
                          </span>
                          <div
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-white shadow-sm ${
                              scenario.type === "Positive"
                                ? "text-emerald-500"
                                : scenario.type === "Neutral"
                                  ? "text-blue-500"
                                  : "text-rose-500"
                            }`}
                          >
                            <IconMapper
                              name={
                                scenario.type === "Positive"
                                  ? "trending_up"
                                  : scenario.type === "Neutral"
                                    ? "equalizer"
                                    : "warning"
                              }
                              className=" text-2xl font-bold"
                            />
                          </div>
                        </div>
                        <h3 className="text-2xl font-black mb-4 group-hover:text-blue-600 transition-colors font-display tracking-tight leading-tight uppercase">
                          {scenario.title}
                        </h3>
                        <p className="text-sm text-slate-600 leading-relaxed min-h-[5rem] font-medium italic">
                          "{scenario.description}"
                        </p>
                      </div>

                      <div className="p-10 space-y-12 flex-grow">
                        {[
                          {
                            label: "Tăng trưởng sự nghiệp",
                            val: scenario.careerGrowth,
                            color: "bg-blue-600",
                            tooltip:
                              "Đánh giá mức độ thăng tiến chuyên môn và cơ hội nghề nghiệp trong kịch bản.",
                          },
                          {
                            label: "Chỉ số Hạnh phúc",
                            val: scenario.happiness,
                            color: "bg-emerald-500",
                            tooltip:
                              "Đo lường mức độ thỏa mãn tinh thần, giảm áp lực và cân bằng cuộc sống.",
                          },
                          {
                            label: `Hiệu quả tài chính dự kiến (ROI) (${data.timeHorizon || 5} năm)`,
                            val: scenario.roi,
                            color: "bg-indigo-600",
                            tooltip: `Tỷ suất hoàn vốn đầu tư từ tiền bạc và thời gian của bạn sau đúng ${data.timeHorizon || 5} năm.`,
                          },
                        ].map((metric, mi) => (
                          <div key={mi} className="space-y-4">
                            <div className="flex justify-between items-end">
                              <div className="flex items-center gap-1.5">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                  {metric.label}
                                </p>
                                <span className="group/tooltip relative inline-block">
                                  <IconMapper
                                    name="help"
                                    className="text-slate-300 hover:text-blue-600 cursor-help text-[12px] mb-0.5"
                                  />
                                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 bg-slate-900 text-white text-[10px] rounded-xl shadow-xl opacity-0 group-hover/tooltip:opacity-100 transition-all duration-300 pointer-events-none z-50 normal-case tracking-normal font-medium leading-relaxed border border-slate-800 block text-center">
                                    {metric.tooltip}
                                    <span className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-slate-900 block"></span>
                                  </span>
                                </span>
                              </div>
                              <p className="text-xl font-black text-slate-900">
                                +{metric.val}%
                              </p>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${metric.val}%` }}
                                transition={{
                                  duration: 1.5,
                                  delay: 0.8 + idx * 0.2 + mi * 0.1,
                                }}
                                className={`h-full ${metric.color}`}
                              ></motion.div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="px-10 pb-10">
                        <button
                          onClick={() => handleDeepAnalysis(scenario)}
                          className="w-full py-5 bg-slate-900 hover:bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest transition-all rounded-2xl shadow-xl shadow-slate-200 flex items-center justify-center gap-4 group-hover:gap-6"
                        >
                          Phân tích sâu{" "}
                          <IconMapper name="science" className=" text-lg" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="p-16 bg-slate-950 rounded-[4rem] relative overflow-hidden mb-24 shadow-2xl"
              >
                <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none">
                  <IconMapper
                    name="timeline"
                    className=" text-[250px] text-white"
                  />
                </div>
                <div className="flex flex-col items-center mb-20 text-center">
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-6">
                    Cột mốc chiến lược
                  </span>
                  <h3 className="text-4xl font-black text-white font-display uppercase tracking-tight">
                    Dòng thời gian lộ trình chi tiết
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10 relative z-10">
                  {[
                    {
                      label: "Khởi điểm",
                      text: results.timeline.start,
                      time: "Hiện tại",
                      icon: "flag",
                    },
                    {
                      label: "Thích ứng",
                      text: results.timeline.sixMonths,
                      time: "6 Tháng",
                      icon: "sync_alt",
                    },
                    {
                      label: "Cân bằng",
                      text: results.timeline.oneYear,
                      time: "12 Tháng",
                      icon: "balance",
                    },
                    {
                      label: "Đột phá",
                      text: results.timeline.threeYears,
                      time: "36 Tháng",
                      icon: "rocket_launch",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex flex-col gap-8 p-10 rounded-[2.5rem] bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
                    >
                      <div className="flex items-center gap-5">
                        <div className="w-13 h-13 rounded-full bg-blue-600/20 border border-blue-600/50 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-xl">
                          <IconMapper name={item.icon} className="" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black uppercase tracking-widest text-blue-400">
                            {item.label}
                          </span>
                          <span className="text-xl font-black text-white font-display">
                            {item.time}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed font-medium">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </>
          )}

          <div className="flex flex-col sm:flex-row justify-center gap-8">
            <button
              onClick={() => navigate("/dashboard")}
              className="px-16 py-6 bg-white border border-slate-200 text-slate-900 font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all shadow-sm"
            >
              Quay lại Dashboard
            </button>
            {!results.isEnterprise && (
              <>
                {/* <button 
                   onClick={() => !isSaved && setIsSaveModalOpen(true)}
                   disabled={isSaved}
                   className={`px-16 py-6 ${isSaved ? 'bg-emerald-500' : 'bg-blue-600 hover:bg-blue-700'} text-white font-black text-[11px] uppercase tracking-widest rounded-2xl transition-all shadow-2xl shadow-blue-200 flex items-center gap-5`}
                 >
                   <IconMapper name={isSaved ? 'check_circle' : 'save'} className=" text-xl" /> 
                   {isSaved ? 'Đã lưu vào lịch sử' : 'Lưu vào lịch sử'}
                 </button> */}
                <button className="px-16 py-6 bg-slate-900 text-white font-black text-[11px] uppercase tracking-widest hover:bg-slate-800 rounded-2xl transition-all shadow-2xl shadow-slate-200 flex items-center gap-5">
                  <IconMapper name="download" className=" text-xl" /> Xuất chiến
                  lược (.PDF)
                </button>
              </>
            )}
          </div>
        </main>
        <SharedFooter />

        <AnimatePresence>
          {isSaveModalOpen && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSaveModalOpen(false)}
                className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                className="relative w-full max-w-[480px] bg-white rounded-[3rem] p-10 sm:p-14 shadow-[0_100px_150px_-50px_rgba(0,0,0,0.5)] border border-slate-100 overflow-hidden"
              >
                <div className="text-center mb-10">
                  <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-blue-100">
                    <IconMapper
                      name="create_new_folder"
                      className=" text-4xl"
                    />
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 font-display uppercase tracking-tighter mb-4">
                    Lưu kịch bản
                  </h3>
                  <p className="text-slate-600 text-sm font-medium leading-relaxed mb-8">
                    Nhập tên cho nhóm kịch bản này để dễ dàng tìm kiếm trong
                    lịch sử.
                  </p>

                  <div className="relative">
                    <input
                      type="text"
                      value={folderName}
                      onChange={(e) => setFolderName(e.target.value)}
                      placeholder={`Nhóm kịch bản: ${data.decision.slice(0, 20)}...`}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <button
                    onClick={handleSaveToHistory}
                    className="w-full py-6 bg-blue-600 text-white font-black text-[12px] uppercase tracking-widest rounded-2xl hover:bg-blue-700 shadow-2xl shadow-blue-100 transition-all flex items-center justify-center gap-4"
                  >
                    LƯU NGAY <IconMapper name="save" className=" text-xl" />
                  </button>
                  <button
                    onClick={() => setIsSaveModalOpen(false)}
                    className="w-full py-6 bg-white border border-slate-200 text-slate-400 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all"
                  >
                    Hủy bỏ
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </AnimatedBackground>
    );
  }

  return null;
};

export default SimulationFlow;
