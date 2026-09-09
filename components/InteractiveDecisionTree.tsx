import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

  const branches: Branch[] = [
    {
      type: "Positive",
      name: "Nhánh Tối Ưu",
      tagline: "Tăng tốc chuyên sâu & Bứt phá vị thế",
      description:
        positiveScenario?.description ||
        "Tập trung dồn nguồn lực vào kỹ năng cốt lõi, xây dựng network chiến lược và tận dụng cơ hội đòn bẩy cao.",
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
          title: "Xây Dựng Nền Tảng & Portfolio Thực Chiến",
          focus: "Hoàn tất 2 dự án trọng điểm, tạo lập portfolio cá nhân và kết nối với 3-5 chuyên gia đầu ngành.",
          riskWarning: "Áp lực dồn dập có thể gây quá tải nếu không phân bổ giờ nghỉ ngơi hợp lý.",
          pivotAlternative: "Nếu thấy có dấu hiệu kiệt sức, giảm 25% khối lượng phụ và chuyển nhịp về Nhánh Cân Bằng.",
          status: "current",
        },
        {
          id: "pos_12m",
          timeframe: "12 Tháng",
          periodLabel: "Giai đoạn 2",
          stepNumber: "02",
          title: "Khẳng Định Năng Lực & Tăng Thu Nhập",
          focus: "Thăng tiến lên vị trí nòng cốt, nhận mức lương mục tiêu hoặc học bổng / gói tài trợ dự án.",
          riskWarning: "Kỳ vọng công việc tăng cao đòi hỏi rèn luyện kỹ năng quản lý căng thẳng.",
          pivotAlternative: "Xây dựng quỹ dự phòng tài chính tương đương 6 tháng chi tiêu để an tâm phát triển.",
          status: "future",
        },
        {
          id: "pos_36m",
          timeframe: "36 Tháng",
          periodLabel: "Giai đoạn 3",
          stepNumber: "03",
          title: "Bứt Phá Vị Thế & Tự Chủ Dài Hạn",
          focus: "Đạt vị trí chuyên gia hoặc dẫn dắt đội ngũ riêng, hoàn vốn đầu tư dự kiến vượt 180%.",
          riskWarning: "Công nghệ và thị trường thay đổi nhanh cần duy trì tâm thế học hỏi liên tục.",
          pivotAlternative: "Tái cấu trúc danh mục sự nghiệp, phân bổ nguồn lực sang các dự án bền vững.",
          status: "future",
        },
      ]),
    },
    {
      type: "Neutral",
      name: "Nhánh Cân Bằng",
      tagline: "Ổn định bền vững & An toàn tài chính",
      description:
        neutralScenario?.description ||
        "Tiến bước vững chắc từng giai đoạn, bảo vệ sức khỏe tâm lý và duy trì cân bằng giữa công việc và đời sống.",
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
          title: "Ổn Định Nhịp Độ & Nâng Chuẩn Kỹ Năng",
          focus: "Cân đối giữa việc học/làm và thể thao, tích lũy các chứng chỉ chuyên môn nền tảng.",
          riskWarning: "Tiến độ tăng trưởng ổn định nhưng có thể chậm hơn nhóm tích cực mạo hiểm.",
          pivotAlternative: "Khi xuất hiện cơ hội đột phá rõ ràng, có thể linh hoạt chuyển hướng sang Nhánh Tối Ưu.",
          status: "current",
        },
        {
          id: "neu_12m",
          timeframe: "12 Tháng",
          periodLabel: "Giai đoạn 2",
          stepNumber: "02",
          title: "Xác Lập Vị Trí Vững Vàng",
          focus: "Ký hợp đồng chính thức, mở rộng phạm vi phụ trách với hiệu suất công việc đều đặn.",
          riskWarning: "Vùng an toàn kéo dài có thể làm giảm phản xạ nắm bắt xu hướng mới.",
          pivotAlternative: "Chủ động nhận thêm một sáng kiến đổi mới trong tổ chức để duy trì động lực.",
          status: "future",
        },
        {
          id: "neu_36m",
          timeframe: "36 Tháng",
          periodLabel: "Giai đoạn 3",
          stepNumber: "03",
          title: "Tích Lũy Bền Vững & Tự Do Tinh Thần",
          focus: "Thu nhập ổn định, quỹ tài chính an toàn, đạt mức hài lòng cao về cuộc sống gia đình.",
          riskWarning: "Chi phí sinh hoạt và lạm phát dài hạn cần được tính toán quỹ đầu tư dự phòng.",
          pivotAlternative: "Đa dạng hóa nguồn thu nhập bằng kỹ năng chuyên môn tự do ngoài giờ.",
          status: "future",
        },
      ]),
    },
    {
      type: "Risk",
      name: "Nhánh Đột Phá / Mạo Hiểm",
      tagline: "Đổi mới mạnh mẽ & Tiềm năng bùng nổ",
      description:
        riskScenario?.description ||
        "Chấp nhận biến động và rủi ro ngắn hạn để tìm kiếm lợi nhuận đột biến hoặc xây dựng mô hình độc lập.",
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
          title: "Thử Nghiệm Thực Tế & Thích Ứng Cao",
          focus: "Tung bản thử nghiệm (MVP), chấp nhận sai số nhanh để hoàn thiện giải pháp và quy trình.",
          riskWarning: "Dòng tiền âm ngắn hạn hoặc áp lực tâm lý từ sự thiếu ổn định ban đầu.",
          pivotAlternative: "Thiết lập mốc giới hạn an toàn (stop-loss); nếu cạn 60% vốn, chuyển về Nhánh Cân Bằng.",
          status: "current",
        },
        {
          id: "risk_12m",
          timeframe: "12 Tháng",
          periodLabel: "Giai đoạn 2",
          stepNumber: "02",
          title: "Khúc Cua Quyết Định (Make or Break)",
          focus: "Đạt điểm hòa vốn, kêu gọi được vốn hạt giống hoặc đạt mức tăng trưởng người dùng vượt bậc.",
          riskWarning: "Tỷ lệ đào thải cao nếu thị trường biến động không thuận lợi.",
          pivotAlternative: "Kích hoạt kế hoạch dự phòng: chuyển sang vị trí chuyên môn tại doanh nghiệp lớn.",
          status: "future",
        },
        {
          id: "risk_36m",
          timeframe: "36 Tháng",
          periodLabel: "Giai đoạn 3",
          stepNumber: "03",
          title: "Thu Hoạch Trái Ngọt & Kinh Nghiệm Quý",
          focus: "Nếu thành công: Đạt vị thế dẫn dắt; Nếu thất bại: Tích lũy bản lĩnh thực chiến không trường lớp nào dạy.",
          riskWarning: "Chi phí cơ hội về thời gian nếu không xác định rõ mục tiêu cốt lõi.",
          pivotAlternative: "Tận dụng triệt để kinh nghiệm quản trị và xây dựng dự án để tư vấn chuyên sâu.",
          status: "future",
        },
      ]),
    },
  ];

  const activeBranch = branches.find((b) => b.type === selectedBranchType) || branches[0];

  return (
    <div
      className={`bg-white rounded-[2.5rem] border border-slate-200/80 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.06)] p-6 sm:p-10 lg:p-12 relative overflow-hidden transition-all duration-500 ${className}`}
    >
      {/* Top Header & Context */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-wider mb-3">
            <IconMapper name="account_tree" className="text-sm text-blue-600" />
            Lộ Trình Quyết Định Phân Nhánh
          </div>
          <h3 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-slate-900">
            Cây Phân Nhánh Tương Lai (Decision Tree)
          </h3>
          <p className="text-sm text-slate-500 font-medium mt-1.5 max-w-2xl leading-relaxed">
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
                className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center gap-2 ${
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
        className={`my-8 p-6 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors duration-300 ${activeBranch.accentBg} ${activeBranch.borderColor}`}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${activeBranch.badgeBg}`}
            >
              {activeBranch.name}
            </span>
            <span className="text-xs font-bold text-slate-600">
              {activeBranch.tagline}
            </span>
          </div>
          <p className="text-sm text-slate-600 font-medium leading-relaxed max-w-3xl pt-1">
            {activeBranch.description}
          </p>
        </div>

        <div className="flex items-center sm:flex-col items-start sm:items-end justify-between sm:justify-center shrink-0 border-t sm:border-t-0 sm:border-l border-slate-200/60 pt-3 sm:pt-0 sm:pl-6">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Kỳ vọng ROI 3 năm
          </span>
          <span
            className="text-2xl font-black font-display tracking-tight"
            style={{ color: activeBranch.primaryColor }}
          >
            +{activeBranch.roi}%
          </span>
        </div>
      </div>

      {/* Visual Branching Connector (SVG Curves) */}
      <div className="relative mb-6 hidden md:block">
        <div className="flex justify-center mb-2">
          {/* Origin Root Node */}
          <div className="px-5 py-2 rounded-full bg-slate-900 text-white text-[11px] font-black uppercase tracking-wider shadow-md flex items-center gap-2">
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
            <motion.div
              key={m.id}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              onClick={() => {
                setSelectedNode(isNodeSelected ? null : m);
                onSelectMilestone?.(m, activeBranch.type);
              }}
              className={`p-6 sm:p-7 rounded-3xl border text-left cursor-pointer transition-all duration-300 relative flex flex-col justify-between group ${
                isNodeSelected
                  ? "bg-slate-50/90 border-blue-600 ring-2 ring-blue-600/20 shadow-xl"
                  : "bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-lg hover:bg-slate-50/40 shadow-sm"
              }`}
            >
              <div>
                {/* Header info */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs text-white"
                      style={{ backgroundColor: activeBranch.primaryColor }}
                    >
                      {m.stepNumber}
                    </span>
                    <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                      Mốc {m.timeframe}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {m.periodLabel}
                  </span>
                </div>

                {/* Milestone Title */}
                <h4 className="text-base font-black text-slate-900 font-display tracking-tight leading-snug mb-3 group-hover:text-blue-600 transition-colors">
                  {m.title}
                </h4>

                {/* Focus text */}
                <p className="text-xs text-slate-600 font-medium leading-relaxed mb-6">
                  {m.focus}
                </p>
              </div>

              {/* Bottom Card Action */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span
                  className={`text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
                    isNodeSelected ? "text-blue-600" : "text-slate-500 group-hover:text-slate-900"
                  }`}
                >
                  <IconMapper
                    name={isNodeSelected ? "expand_less" : "tune"}
                    className="text-sm"
                  />
                  {isNodeSelected ? "Thu gọn phân tích" : "Xem rủi ro & Bẻ lái"}
                </span>

                <IconMapper
                  name="arrow_forward"
                  className={`text-sm transition-transform duration-200 ${
                    isNodeSelected ? "rotate-90 text-blue-600" : "text-slate-400 group-hover:translate-x-1"
                  }`}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Node Detail Inspection Drawer */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-8 overflow-hidden"
          >
            <div className="p-7 sm:p-9 rounded-3xl bg-slate-900 text-white shadow-2xl relative">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm text-white"
                    style={{ backgroundColor: activeBranch.primaryColor }}
                  >
                    {selectedNode.stepNumber}
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Chi tiết cột mốc • {selectedNode.timeframe}
                    </span>
                    <h4 className="text-xl font-black font-display tracking-tight text-white">
                      {selectedNode.title}
                    </h4>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedNode(null)}
                  className="self-end sm:self-center text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Đóng ✕
                </button>
              </div>

              {/* 3 Pillars in Drawer */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                {/* 1. Core Focus */}
                <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                  <div className="flex items-center gap-2 mb-2.5 text-blue-400">
                    <IconMapper name="target" className="text-base" />
                    <span className="text-xs font-black uppercase tracking-wider">
                      Mục Tiêu Trọng Tâm
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">
                    {selectedNode.focus}
                  </p>
                </div>

                {/* 2. Risk Warning */}
                <div className="p-5 rounded-2xl bg-amber-950/30 border border-amber-500/30">
                  <div className="flex items-center gap-2 mb-2.5 text-amber-400">
                    <IconMapper name="warning" className="text-base" />
                    <span className="text-xs font-black uppercase tracking-wider">
                      Cảnh Báo Rủi Ro
                    </span>
                  </div>
                  <p className="text-xs text-amber-200/90 font-medium leading-relaxed">
                    {selectedNode.riskWarning}
                  </p>
                </div>

                {/* 3. Pivot Strategy */}
                <div className="p-5 rounded-2xl bg-teal-950/30 border border-teal-500/30">
                  <div className="flex items-center gap-2 mb-2.5 text-teal-400">
                    <IconMapper name="alt_route" className="text-base" />
                    <span className="text-xs font-black uppercase tracking-wider">
                      Chiến Lược Xoay Trục (Pivot)
                    </span>
                  </div>
                  <p className="text-xs text-teal-200/90 font-medium leading-relaxed">
                    {selectedNode.pivotAlternative}
                  </p>
                </div>
              </div>

              {/* Status bar inside Drawer */}
              <div className="mt-7 pt-5 border-t border-slate-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <IconMapper name="verified" className="text-emerald-500 text-sm" />
                  <span>Cột mốc được căn chỉnh theo chỉ số ROI (+{activeBranch.roi}%)</span>
                </div>
                <div className="text-[11px] font-semibold text-slate-400">
                  {selectedNode.periodLabel}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
