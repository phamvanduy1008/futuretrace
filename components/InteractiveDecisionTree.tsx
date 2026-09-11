import React, { useState, useMemo, useRef } from "react";
import { ScenarioResult } from "../types";
import { IconMapper } from "./IconMapper";

export interface MilestoneNode {
  id: string;
  timeframe: string;
  periodLabel: string;
  stepNumber: string;
  title: string;
  focus: string;
  riskWarning: string;
  pivotAlternative: string;
  status: "completed" | "current" | "future";
}

export interface Branch {
  type: "Positive" | "Neutral" | "Risk";
  name: string;
  tagline: string;
  description: string;
  primaryColor: string;
  accentBg: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  roi: number;
  milestones: MilestoneNode[];
}

interface InteractiveDecisionTreeProps {
  decisionTitle: string;
  scenarios?: ScenarioResult[];
  className?: string;
  onSelectMilestone?: (milestone: MilestoneNode, branchType: string) => void;
}

export const InteractiveDecisionTree: React.FC<InteractiveDecisionTreeProps> = ({
  decisionTitle,
  scenarios,
  className = "",
  onSelectMilestone,
}) => {
  const initialType =
    scenarios && scenarios.length === 1 && scenarios[0].type
      ? scenarios[0].type
      : "Positive";
  const [selectedBranchType, setSelectedBranchType] = useState<string>(initialType);
  const [selectedNode, setSelectedNode] = useState<MilestoneNode | null>(null);
  const [displayedNode, setDisplayedNode] = useState<MilestoneNode | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const handleToggleNode = (node: MilestoneNode) => {
    if (selectedNode?.id === node.id) {
      setSelectedNode(null);
    } else {
      setSelectedNode(node);
      setDisplayedNode(node);
      onSelectMilestone?.(node, activeBranch.type);
    }
  };

  // Scenarios mapping
  const positiveScenario = scenarios?.find((s) => s.type === "Positive");
  const neutralScenario = scenarios?.find((s) => s.type === "Neutral");
  const riskScenario = scenarios?.find((s) => s.type === "Risk");

  // Helper to dynamically enrich milestones if AI returned sprint90 & deepAnalysis
  const enrichMilestones = (
    scenario: ScenarioResult | undefined,
    defaults: MilestoneNode[]
  ): MilestoneNode[] => {
    if (!scenario?.deepAnalysis?.sprint90 || scenario.deepAnalysis.sprint90.length === 0) {
      return defaults;
    }
    const sprint = scenario.deepAnalysis.sprint90;
    const threat = scenario.deepAnalysis?.swot?.find((s) => s.type === "T")?.value;

    return defaults.map((def, i) => {
      if (sprint[i]) {
        return {
          ...def,
          title: sprint[i].phase || def.title,
          focus: sprint[i].tasks && sprint[i].tasks.length > 0 ? sprint[i].tasks.join(". ") : def.focus,
          riskWarning: threat || scenario.deepAnalysis?.criticalAdvice || def.riskWarning,
          pivotAlternative: scenario.deepAnalysis?.riskMitigation || def.pivotAlternative,
        };
      }
      return def;
    });
  };

  const branches: Branch[] = useMemo(() => [
    {
      type: "Positive",
      name: "Nhánh Tăng Tốc",
      tagline: "Chuyên sâu thực tế & Thăng tiến nhanh",
      description:
        positiveScenario?.description ||
        "Tập trung rèn luyện các kỹ năng thực tế quan trọng nhất, mở rộng mối quan hệ uy tín trong ngành và nắm bắt các cơ hội thăng tiến tốt.",
      primaryColor: "#2563eb", // Royal Blue
      accentBg: "bg-blue-50/70",
      badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
      badgeText: "text-blue-700",
      borderColor: "border-blue-200",
      roi: positiveScenario?.roi || 88,
      milestones: enrichMilestones(positiveScenario, [
        {
          id: "pos_6m",
          timeframe: "6 Tháng",
          periodLabel: "Giai đoạn 1",
          stepNumber: "01",
          title: "Xây Dựng Nền Tảng & Hồ Sơ Năng Lực (Portfolio)",
          focus: "Hoàn thành 2 sản phẩm/dự án thực tế tiêu biểu, xây dựng hồ sơ cá nhân và học hỏi kinh nghiệm từ 3-5 anh chị đi trước trong ngành.",
          riskWarning: "Lịch học và làm việc dày đặc có thể gây căng thẳng nếu không biết cách nghỉ ngơi hợp lý.",
          pivotAlternative: "Nếu thấy có dấu hiệu quá sức, chủ động giảm bớt việc phụ và quay về nhịp độ cân bằng, bảo vệ sức khỏe trước tiên.",
          status: "current",
        },
        {
          id: "pos_12m",
          timeframe: "12 Tháng",
          periodLabel: "Giai đoạn 2",
          stepNumber: "02",
          title: "Khẳng Định Năng Lực & Tăng Thu Nhập",
          focus: "Trở thành nhân sự đáng tin cậy tại nơi làm việc, đạt mức lương mục tiêu hoặc giành các suất học bổng, dự án tốt.",
          riskWarning: "Yêu cầu công việc tăng cao đòi hỏi con phải rèn luyện tính kiên trì và khả năng quản lý cảm xúc.",
          pivotAlternative: "Chủ động trích một phần thu nhập lập quỹ tiết kiệm dự phòng (khoảng 3 - 6 tháng chi tiêu) để luôn an tâm.",
          status: "future",
        },
        {
          id: "pos_36m",
          timeframe: "36 Tháng",
          periodLabel: "Giai đoạn 3",
          stepNumber: "03",
          title: "Vững Vàng Vị Trí & Tự Chủ Lâu Dài",
          focus: "Đạt vị trí chuyên môn vững chắc hoặc bắt đầu hướng dẫn đội ngũ nhỏ, thu nhập ổn định và hoàn toàn tự chủ tài chính cá nhân.",
          riskWarning: "Xã hội và công nghệ luôn thay đổi, cần giữ tinh thần khiêm tốn học hỏi liên tục.",
          pivotAlternative: "Linh hoạt cập nhật kiến thức mới, chọn lọc các dự án bền vững có giá trị lâu dài.",
          status: "future",
        },
      ]),
    },
    {
      type: "Neutral",
      name: "Nhánh Cân Bằng",
      tagline: "Vững chắc từng bước & Bình yên cuộc sống",
      description:
        neutralScenario?.description ||
        "Tiến bước vững vàng theo từng giai đoạn, vừa chú trọng học tập chuyên môn vừa giữ gìn sức khỏe thể chất và tinh thần vui vẻ.",
      primaryColor: "#0d9488", // Teal
      accentBg: "bg-teal-50/70",
      badgeBg: "bg-teal-50 text-teal-700 border-teal-200",
      badgeText: "text-teal-700",
      borderColor: "border-teal-200",
      roi: neutralScenario?.roi || 65,
      milestones: enrichMilestones(neutralScenario, [
        {
          id: "neu_6m",
          timeframe: "6 Tháng",
          periodLabel: "Giai đoạn 1",
          stepNumber: "01",
          title: "Ổn Định Nhịp Học & Rèn Luyện Kỹ Năng",
          focus: "Cân đối hợp lý giữa việc học chuyên ngành, thể thao rèn sức khỏe và tích lũy các chứng chỉ cần thiết cho tương lai.",
          riskWarning: "Nhịp độ êm đềm có thể khiến con cảm thấy chậm hơn so với các bạn thích cạnh tranh gay gắt.",
          pivotAlternative: "Khi thấy bản thân đã tích lũy đủ năng lực và cơ hội chín muồi, có thể chủ động chuyển nhịp sang hướng tăng tốc.",
          status: "current",
        },
        {
          id: "neu_12m",
          timeframe: "12 Tháng",
          periodLabel: "Giai đoạn 2",
          stepNumber: "02",
          title: "Gắn Bó Công Việc & Hoàn Thiện Bản Thân",
          focus: "Ký hợp đồng chính thức hoặc nhận vị trí thực tập tốt, hoàn thành công việc đều đặn với tinh thần trách nhiệm cao.",
          riskWarning: "Quá quen với sự ổn định có thể làm giảm bớt hứng thú thử sức với những điều mới lạ.",
          pivotAlternative: "Chủ động đề xuất tham gia một việc mới trong tập thể để tìm thêm cảm hứng và phát triển bản thân.",
          status: "future",
        },
        {
          id: "neu_36m",
          timeframe: "36 Tháng",
          periodLabel: "Giai đoạn 3",
          stepNumber: "03",
          title: "Tích Lũy Bền Vững & Tự Do Tinh Thần",
          focus: "Công việc ổn định, thu nhập đều đặn, có khoản tiết kiệm an tâm và dành được nhiều thời gian ấm áp bên gia đình.",
          riskWarning: "Chi phí sinh hoạt và nhu cầu cuộc sống tăng theo thời gian cần có kế hoạch quản lý chi tiêu rõ ràng.",
          pivotAlternative: "Có thể nhận thêm các công việc yêu thích ngoài giờ để vừa tăng thêm thu nhập vừa thỏa đam mê.",
          status: "future",
        },
      ]),
    },
    {
      type: "Risk",
      name: "Nhánh Đột Phá",
      tagline: "Dám nghĩ dám làm & Bản lĩnh tiên phong",
      description:
        riskScenario?.description ||
        "Sẵn sàng thử sức với các cơ hội mới, chấp nhận thử thách ban đầu để học hỏi nhanh và gặt hái những kết quả vượt bậc.",
      primaryColor: "#e11d48", // Rose/Coral
      accentBg: "bg-rose-50/70",
      badgeBg: "bg-rose-50 text-rose-700 border-rose-200",
      badgeText: "text-rose-700",
      borderColor: "border-rose-200",
      roi: riskScenario?.roi || 115,
      milestones: enrichMilestones(riskScenario, [
        {
          id: "risk_6m",
          timeframe: "6 Tháng",
          periodLabel: "Giai đoạn 1",
          stepNumber: "01",
          title: "Thử Nghiệm Thực Tế & Học Hỏi Nhanh",
          focus: "Triển khai ý tưởng ở quy mô nhỏ, chủ động đón nhận phản hồi từ khách hàng hoặc thầy cô để nhanh chóng hoàn thiện.",
          riskWarning: "Thời gian đầu có thể gặp nhiều khó khăn, thu nhập chưa ổn định hoặc nhiều lúc cảm thấy nản lòng.",
          pivotAlternative: "Đặt ra hạn mức ngân sách an toàn; nếu tình hình không thuận lợi, chuyển về hướng đi cân bằng để giữ an toàn tài chính.",
          status: "current",
        },
        {
          id: "risk_12m",
          timeframe: "12 Tháng",
          periodLabel: "Giai đoạn 2",
          stepNumber: "02",
          title: "Thời Điểm Bứt Phá Quan Trọng",
          focus: "Mô hình hoặc kỹ năng bắt đầu mang lại kết quả rõ nét, tự chủ được chi phí vận hành và mở rộng được đối tượng khách hàng.",
          riskWarning: "Cạnh tranh thực tế rất khốc liệt, đòi hỏi sự kiên trì và khả năng thích nghi nhanh trước biến động.",
          pivotAlternative: "Kích hoạt phương án an toàn (Plan B): chuyển hướng sang làm việc chuyên môn tại các doanh nghiệp lớn để tích lũy thêm kinh nghiệm.",
          status: "future",
        },
        {
          id: "risk_36m",
          timeframe: "36 Tháng",
          periodLabel: "Giai đoạn 3",
          stepNumber: "03",
          title: "Thu Hoạch Quả Ngọt & Bản Lĩnh Vững Vàng",
          focus: "Nếu thành công: Đạt vị thế dẫn dắt và thu nhập đột phá; Nếu chưa trọn vẹn: Đã tôi luyện được bản lĩnh thực chiến vô giá mà sách vở không dạy.",
          riskWarning: "Đừng mải mê chạy theo thành tích bên ngoài mà quên chăm sóc sức khỏe và các mối quan hệ thân thương trong gia đình.",
          pivotAlternative: "Mang toàn bộ vốn kinh nghiệm thực chiến quý báu đó để làm tư vấn chuyên sâu hoặc giữ các vị trí quản lý nòng cốt.",
          status: "future",
        },
      ]),
    },
  ], [positiveScenario, neutralScenario, riskScenario]);

  const activeBranch = branches.find((b) => b.type === selectedBranchType) || branches[0];

  return (
    <div
      className={`bg-white rounded-[2.5rem] border border-slate-200/80 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.06)] p-6 sm:p-10 lg:p-12 relative overflow-hidden ${className}`}
    >
      {/* Top Header & Context */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-black uppercase tracking-wider mb-3">
            <IconMapper name="account_tree" className="text-sm text-blue-600" />
            Lộ Trình Quyết Định Phân Nhánh
          </div>
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black font-display tracking-tight text-slate-900">
            Cây Phân Nhánh Tương Lai (Decision Tree)
          </h3>
          <p className="text-sm sm:text-base text-slate-600 font-medium mt-1.5 max-w-2xl leading-relaxed">
            Mô phỏng 3 nhánh tương lai từ quyết định:{" "}
            <span className="text-slate-800 font-bold italic">
              "{decisionTitle.slice(0, 50)}..."
            </span>
          </p>
        </div>

        {/* Clean Segmented Tab Control */}
        <div className="flex items-center p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/60 shadow-inner flex-wrap gap-1">
          {branches.map((b) => {
            const isSelected = selectedBranchType === b.type;
            return (
              <button
                key={b.type}
                type="button"
                onClick={() => {
                  setSelectedBranchType(b.type);
                  setSelectedNode(null);
                }}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-200 flex items-center gap-2 ${
                  isSelected
                    ? "bg-white text-slate-900 shadow-md border border-slate-200/60"
                    : "text-slate-500 hover:text-slate-800 hover:bg-white/40"
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: b.primaryColor }}
                />
                <span>{b.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Branch Headline Banner */}
      <div
        className={`my-8 p-6 sm:p-7 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-5 transition-colors duration-300 ${activeBranch.accentBg} ${activeBranch.borderColor}`}
      >
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider border ${activeBranch.badgeBg}`}
            >
              {activeBranch.name}
            </span>
            <span className="text-sm sm:text-base font-bold text-slate-700">
              {activeBranch.tagline}
            </span>
          </div>
          <p className="text-sm sm:text-base text-slate-700 font-medium leading-relaxed pt-1">
            {activeBranch.description}
          </p>
        </div>

        <div className="flex items-center sm:flex-col items-start sm:items-end justify-between sm:justify-center shrink-0 border-t sm:border-t-0 sm:border-l border-slate-200/60 pt-3 sm:pt-0 sm:pl-6">
          <span className="text-xs font-black uppercase tracking-wider text-slate-500">
            Hiệu quả đầu tư (ROI 3 năm)
          </span>
          <span
            className="text-2xl sm:text-3xl font-black font-display tracking-tight"
            style={{ color: activeBranch.primaryColor }}
          >
            +{activeBranch.roi}%
          </span>
          <span className="text-[11px] text-slate-400 font-medium mt-0.5">
            Ước tính sau 3 năm đi làm
          </span>
        </div>
      </div>

      {/* Visual Branching Connector (SVG Curves) */}
      <div className="relative mb-6 hidden md:block">
        <div className="flex justify-center mb-2">
          {/* Origin Root Node */}
          <div className="px-5 py-2 rounded-full bg-slate-900 text-white text-xs font-black uppercase tracking-wider shadow-md flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Điểm Quyết Định Khởi Đầu</span>
          </div>
        </div>

        {/* Tree Curve Lines connecting to 3 cards */}
        <svg
          viewBox="0 0 900 60"
          className="w-full h-12 stroke-slate-300 overflow-visible"
          fill="none"
        >
          {/* Center line */}
          <path
            d="M 450 0 L 450 60"
            strokeWidth="2"
            strokeDasharray="4 4"
            className="text-slate-300"
          />
          {/* Left curve to milestone 1 */}
          <path
            d="M 450 0 C 450 35, 150 25, 150 60"
            strokeWidth="2"
            strokeDasharray="4 4"
            className="text-slate-300"
          />
          {/* Right curve to milestone 3 */}
          <path
            d="M 450 0 C 450 35, 750 25, 750 60"
            strokeWidth="2"
            strokeDasharray="4 4"
            className="text-slate-300"
          />
          {/* Dots on branches */}
          <circle cx="150" cy="60" r="4" fill={activeBranch.primaryColor} />
          <circle cx="450" cy="60" r="4" fill={activeBranch.primaryColor} />
          <circle cx="750" cy="60" r="4" fill={activeBranch.primaryColor} />
        </svg>
      </div>

      {/* 3 Milestone Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        {activeBranch.milestones.map((m, idx) => {
          const isNodeSelected = selectedNode?.id === m.id;

          return (
            <div
              key={m.id}
              onClick={() => handleToggleNode(m)}
              className={`p-6 sm:p-7 rounded-3xl border text-left cursor-pointer transition-all duration-200 hover:-translate-y-1 relative flex flex-col justify-between group ${
                isNodeSelected
                  ? "bg-slate-50/90 border-blue-600 ring-2 ring-blue-600/20 shadow-xl"
                  : "bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-lg hover:bg-slate-50/40 shadow-sm"
              }`}
            >
              <div>
                {/* Header info */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs sm:text-sm text-white shrink-0"
                      style={{ backgroundColor: activeBranch.primaryColor }}
                    >
                      {m.stepNumber}
                    </span>
                    <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800">
                      Mốc {m.timeframe}
                    </span>
                  </div>
                  <span className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {m.periodLabel}
                  </span>
                </div>

                {/* Milestone Title */}
                <h4 className="text-lg sm:text-xl font-black text-slate-900 font-display tracking-tight leading-snug mb-3 group-hover:text-blue-600 transition-colors">
                  {m.title}
                </h4>

                {/* Focus text */}
                <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed mb-6">
                  {m.focus}
                </p>
              </div>

              {/* Bottom Card Action */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span
                  className={`text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
                    isNodeSelected ? "text-blue-600" : "text-slate-500 group-hover:text-slate-900"
                  }`}
                >
                  <IconMapper
                    name={isNodeSelected ? "caret_up" : "compass"}
                    className="text-base"
                  />
                  {isNodeSelected ? "Thu gọn phân tích" : "Xem lưu ý & Kế hoạch bẻ lái"}
                </span>

                <IconMapper
                  name="arrow_forward"
                  className={`text-sm transition-transform duration-200 ${
                    isNodeSelected ? "rotate-90 text-blue-600" : "text-slate-400 group-hover:translate-x-1"
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Node Detail Inspection Drawer - Hardware-Accelerated Smooth CSS Grid Transition */}
      <div
        ref={drawerRef}
        className={`grid transition-[grid-template-rows,opacity,margin] duration-250 ease-out will-change-[grid-template-rows,opacity] ${
          selectedNode
            ? "grid-rows-[1fr] opacity-100 mt-8"
            : "grid-rows-[0fr] opacity-0 mt-0 pointer-events-none"
        }`}
      >
        <div className="overflow-hidden min-h-0">
          {displayedNode && (
            <div className="p-7 sm:p-9 rounded-3xl bg-slate-900 text-white shadow-2xl relative transition-transform duration-250 ease-out">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div className="flex items-center gap-3.5">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm text-white shrink-0"
                    style={{ backgroundColor: activeBranch.primaryColor }}
                  >
                    {displayedNode.stepNumber}
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                      Chi tiết cột mốc • {displayedNode.timeframe}
                    </span>
                    <h4 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white">
                      {displayedNode.title}
                    </h4>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedNode(null)}
                  className="self-end sm:self-center text-xs sm:text-sm text-slate-300 hover:text-white px-3.5 py-1.5 rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Đóng ✕
                </button>
              </div>

              {/* 3 Pillars in Drawer */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                {/* 1. Core Focus */}
                <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                  <div className="flex items-center gap-2 mb-3 text-blue-400">
                    <IconMapper name="target" className="text-base" />
                    <span className="text-xs sm:text-sm font-black uppercase tracking-wider">
                      Mục Tiêu Trọng Tâm
                    </span>
                  </div>
                  <p className="text-sm sm:text-base text-slate-200 font-normal leading-relaxed">
                    {displayedNode.focus}
                  </p>
                </div>

                {/* 2. Risk Warning */}
                <div className="p-5 rounded-2xl bg-amber-950/30 border border-amber-500/30">
                  <div className="flex items-center gap-2 mb-3 text-amber-400">
                    <IconMapper name="warning" className="text-base" />
                    <span className="text-xs sm:text-sm font-black uppercase tracking-wider">
                      Điểm Cần Lưu Ý & Cảnh Báo
                    </span>
                  </div>
                  <p className="text-sm sm:text-base text-amber-100 font-normal leading-relaxed">
                    {displayedNode.riskWarning}
                  </p>
                </div>

                {/* 3. Pivot Strategy */}
                <div className="p-5 rounded-2xl bg-teal-950/30 border border-teal-500/30">
                  <div className="flex items-center gap-2 mb-3 text-teal-400">
                    <IconMapper name="alt_route" className="text-base" />
                    <span className="text-xs sm:text-sm font-black uppercase tracking-wider">
                      Kế Hoạch Dự Phòng & Bẻ Lái An Toàn
                    </span>
                  </div>
                  <p className="text-sm sm:text-base text-teal-100 font-normal leading-relaxed">
                    {displayedNode.pivotAlternative}
                  </p>
                </div>
              </div>

              {/* Status bar inside Drawer */}
              <div className="mt-7 pt-5 border-t border-slate-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 font-medium">
                  <IconMapper name="verified" className="text-emerald-400 text-base" />
                  <span>Cột mốc được căn chỉnh theo hiệu quả đầu tư dự kiến (+{activeBranch.roi}%)</span>
                </div>
                <div className="text-xs font-semibold text-slate-400">
                  {displayedNode.periodLabel}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
