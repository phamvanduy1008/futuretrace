import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  SimulationStep,
  SimulationData,
  PredictionResult,
  ScenarioResult,
} from "../types";
import { generateSimulation } from "../services/geminiService";
import { saveToHistory } from "../data/mockDatabase";
import SharedHeader from "../components/SharedHeader";
import SharedFooter from "../components/SharedFooter";
import { IconMapper } from "../components/IconMapper";
import { AnimatedBackground } from "../components/AnimatedBackground";

const SimulationFlow: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<SimulationStep>(SimulationStep.DESCRIPTION);
  const [data, setData] = useState<SimulationData>({
    decision: "",
    stress: 3,
    personalFinance: 3,
    risk: 4,
    academicPerformance: 3,
    otherFactors: "",
    tier: "free",
  });
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [results, setResults] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<{
    message: string;
    type: "AUTH" | "NETWORK" | "LOCAL_CONFIG" | "GENERAL";
  } | null>(null);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [selectedScenario, setSelectedScenario] =
    useState<ScenarioResult | null>(null);

  const handleNextStep = async () => {
    if (step === SimulationStep.DESCRIPTION) {
      if (!data.decision.trim()) return;
      setStep(SimulationStep.CONTEXT);
    } else if (step === SimulationStep.CONTEXT) {
      setError(null);
      setStep(SimulationStep.PROCESSING);
      startSimulation();
    }
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
      setError({ message: e.message, type: "GENERAL" });
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
              className="px-6 py-2 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-blue-100"
            >
              Mô phỏng đa thời gian v4.2
            </motion.div>
            <h1 className="text-4xl sm:text-6xl font-black mb-4 font-display tracking-tighter text-slate-900 leading-[1.8]">
              Nhập biến số <span className="text-blue-600">đầu vào.</span>
            </h1>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium leading-relaxed">
              Trí tuệ nhân tạo sẽ quét các từ khóa để xây dựng cây quyết định
              tương lai.
            </p>
          </div>
          <div className="space-y-12">
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2.5rem] blur-xl opacity-10 group-focus-within:opacity-20 transition duration-1000"></div>
              <textarea
                className="relative w-full h-[320px] p-10 bg-white/70 backdrop-blur-xl border border-slate-200 rounded-[2.5rem] text-lg leading-relaxed focus:ring-4 focus:ring-blue-50 focus:border-blue-600 outline-none resize-none transition-all shadow-2xl shadow-slate-100/50 font-medium"
                placeholder="Ví dụ: Em đang phân vân giữa việc chọn học ngành Công nghệ thông tin tại Bách Khoa hay đi du học Đức..."
                maxLength={1000}
                value={data.decision}
                onChange={(e) => setData({ ...data, decision: e.target.value })}
              />
              <div className="absolute bottom-10 right-12 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-md border border-slate-100">
                {data.decision.length} / 1000 ký tự
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-8 pt-4">
              <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                {["Chọn ngành IT", "Du học", "Học đại học"].map((hint) => (
                  <button
                    key={hint}
                    onClick={() =>
                      setData({
                        ...data,
                        decision: `Dự án: ${hint} - Em đang lên kế hoạch cho việc...`,
                      })
                    }
                    className="px-6 py-3 text-[10px] font-black uppercase tracking-widest bg-white border border-slate-200 text-slate-600 hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50/30 transition-all rounded-2xl shadow-sm"
                  >
                    + {hint}
                  </button>
                ))}
              </div>
              <button
                onClick={handleNextStep}
                disabled={!data.decision.trim()}
                className="w-full sm:w-auto bg-slate-900 hover:bg-blue-600 disabled:bg-slate-100 disabled:text-slate-400 text-white font-black py-6 px-14 rounded-2xl shadow-2xl shadow-slate-200 transition-all flex items-center justify-center gap-4 text-xs uppercase tracking-widest"
              >
                Tiếp tục quy trình{" "}
                <IconMapper name="arrow_forward" className=" font-bold" />
              </button>
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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8 p-6 bg-white border-2 border-rose-100 rounded-[2.5rem] shadow-[0_20px_50px_rgba(244,63,94,0.1)] overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <IconMapper name="error" className=" text-8xl text-rose-600" />
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10">
                <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 shrink-0">
                  <IconMapper name="warning" className=" text-3xl font-bold" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-black text-rose-900 uppercase tracking-widest mb-1">
                    Cảnh báo hệ thống
                  </h3>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">
                    {error.message}
                  </p>
                </div>
                <div className="flex flex-col gap-3 w-full sm:w-auto">
                  <button
                    onClick={handleSelectKey}
                    className="bg-rose-600 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-100 flex items-center justify-center gap-2"
                  >
                    Cấu hình Key
                  </button>
                  <button
                    onClick={() => {
                      setError(null);
                      setStep(SimulationStep.PROCESSING);
                      startSimulation();
                    }}
                    className="bg-slate-900 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                  >
                    Thử lại
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-widest mb-4">
              Chuẩn hóa bối cảnh hệ thống
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tighter mb-4 font-display text-slate-900">
              Cấu hình <span className="text-emerald-600">Biến số.</span>
            </h1>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">
              Thiết lập các tham số môi trường để AI giả lập chính xác hơn.
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-xl p-8 sm:p-12 rounded-[3.5rem] border border-slate-100 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.12)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              {[
                {
                  id: "stress",
                  label: "Áp lực hiện tại",
                  icon: "psychology_alt",
                  labels: ["Thấp", "Nhẹ", "Điều độ", "Cao", "Cực hạn"],
                  color: "accent-blue-600",
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
                },
                {
                  id: "academicPerformance",
                  label: "Học lực / Năng lực chuyên môn",
                  icon: "school",
                  labels: ["Yếu", "Trung bình", "Khá", "Giỏi", "Xuất sắc"],
                  color: "accent-amber-600",
                },
                {
                  id: "risk",
                  label: "Chỉ số rủi ro",
                  icon: "bolt",
                  labels: [
                    "Cẩn trọng",
                    "Bảo thủ",
                    "Điều độ",
                    "Mạo hiểm",
                    "Quyết liệt",
                  ],
                  color: "accent-indigo-600",
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
                      {slider.label}
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
                    <span className="text-[8px] font-bold text-slate-300 uppercase text-slate-900 leading-[1.6] sm:leading-[1.4] mb-12">
                      {slider.labels[0]}
                    </span>
                    <span className="text-[8px] font-bold text-slate-300 uppercase text-slate-900 leading-[1.6] sm:leading-[1.4] mb-12">
                      {slider.labels[4]}
                    </span>
                  </div>
                </div>
              ))}

              <div className="md:col-span-2 space-y-4 pt-4 border-t border-slate-50 mt-4">
                <label
                  htmlFor="otherFactors"
                  className="flex items-center gap-4 font-black text-[10px] uppercase tracking-widest text-slate-800"
                >
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
                  label: "Tính toán ROI & Emotional Index",
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
            <h1 className="text-5xl sm:text-7xl font-black leading-[1.6] sm:leading-[1.3] mb-12 font-display text-slate-900 max-w-5xl">
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
                onClick={() => navigate("/premium")}
                className="mt-12 px-10 py-5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-black rounded-2xl hover:scale-105 transition-all shadow-2xl shadow-amber-200 uppercase tracking-widest text-xs flex items-center gap-4"
              >
                <IconMapper name="workspace_premium" className=" font-bold" />{" "}
                Nâng cấp lên bản dành cho doanh nghiệp
              </motion.button>
            )}
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-24 w-full">
          {!results.isEnterprise && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
                <AnimatePresence>
                  {(results?.scenarios || []).map((scenario, idx) => (
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
                                scenario?.type === "Positive"
                                  ? "trending_up"
                                  : scenario?.type === "Neutral"
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
                          },
                          {
                            label: "Chỉ số Hạnh phúc",
                            val: scenario.happiness,
                            color: "bg-emerald-500",
                          },
                          {
                            label: "ROI dự kiến (5 năm)",
                            val: scenario.roi,
                            color: "bg-indigo-600",
                          },
                        ].map((metric, mi) => (
                          <div key={mi} className="space-y-4">
                            <div className="flex justify-between items-end">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {metric.label}
                              </p>
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
                  <h3 className="text-4xl font-black text-white font-display uppercase tracking-tight leading-relaxed">
                    Timeline lộ trình tích hợp
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10 relative z-10">
                  {/* Timeline Cards */}
                  {[
                    {
                      label: "Khởi điểm",
                      text: results?.timeline?.start,
                      time: "Hiện tại",
                      icon: "flag",
                      ghost: "start",
                    },
                    {
                      label: "Thích ứng",
                      text: results?.timeline?.sixMonths,
                      time: "6 Tháng",
                      icon: "sync_alt",
                      ghost: "trending_up",
                    },
                    {
                      label: "Cân bằng",
                      text: results?.timeline?.oneYear,
                      time: "12 Tháng",
                      icon: "balance",
                      ghost: "equalizer",
                    },
                    {
                      label: "Đột phá",
                      text: results?.timeline?.threeYears,
                      time: "36 Tháng",
                      icon: "rocket_launch",
                      ghost: "star",
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
                {/* Header with Gradient Strip */}
                <div className="h-2 bg-gradient-to-r from-blue-400 via-indigo-500 to-blue-600"></div>

                <div className="p-10 sm:p-12">
                  <div className="flex items-start gap-6 mb-10">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 shadow-inner border border-blue-100">
                      <IconMapper
                        name="create_new_folder"
                        className=" text-3xl"
                      />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-2 italic">
                        Lưu kịch bản
                      </h3>
                      <p className="text-slate-500 text-sm font-medium leading-relaxed">
                        Bộ nhớ đám mây của riêng bạn.
                      </p>
                    </div>
                  </div>

                  <div className="relative mb-8">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                      Tên nhóm kịch bản
                    </label>
                    <input
                      type="text"
                      value={folderName}
                      onChange={(e) => setFolderName(e.target.value)}
                      placeholder={`Ví dụ: Lộ trình IT - ${new Date().toLocaleDateString()}`}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all shadow-inner italic"
                      autoFocus
                    />
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
