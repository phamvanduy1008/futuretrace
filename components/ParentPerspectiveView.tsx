import React, { useState } from "react";
import { ScenarioResult, SimulationData } from "../types";
import {
  generateParentReport,
  getParentShareUrl,
} from "../services/parentPerspectiveService";
import { ParentShareModal } from "./ParentShareModal";
import {
  Bank,
  Coins,
  ChartLineUp,
  ShieldCheck,
  Heart,
  ChatCircleDots,
  ShareNetwork,
  ArrowSquareOut,
  Info,
  Sparkle,
  UserFocus,
  Lightbulb,
  CheckCircle,
  Question,
  Tag,
} from "@phosphor-icons/react";

interface ParentPerspectiveViewProps {
  scenario?: Partial<ScenarioResult>;
  context?: SimulationData;
}

export const ParentPerspectiveView: React.FC<ParentPerspectiveViewProps> = ({
  scenario,
  context,
}) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const report = generateParentReport(scenario, context);
  const shareUrl = getParentShareUrl(scenario, context);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner - Executive Style aligned with system theme */}
      <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border-2 border-slate-100 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-black uppercase tracking-wider border border-blue-100">
              <UserFocus size={16} weight="fill" className="text-blue-600" />
              Thấu Kính Phụ Huynh • Góc Nhìn Gia Đình
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold tracking-wide">
              <Tag size={14} />
              {report.categoryTag}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-black text-slate-900 tracking-tight leading-tight uppercase italic">
            Báo Cáo Thấu Hiểu: <span className="text-blue-600 font-sans normal-case not-italic">{report.scenarioTitle}</span>
          </h2>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            Ngôn ngữ được Việt hóa ấm áp, giải đáp rõ 4 băn khoăn thiết thực nhất:{" "}
            <strong className="text-slate-900">mức học phí từng tháng</strong>,{" "}
            <strong className="text-slate-900">thời gian tự lập tài chính</strong>,{" "}
            <strong className="text-slate-900">rủi ro & phương án dự phòng (Plan B)</strong>, và{" "}
            <strong className="text-slate-900">3 câu hỏi lắng nghe con</strong>.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs sm:text-sm text-slate-500 font-medium">
            <span className="flex items-center gap-1.5 text-emerald-700">
              <CheckCircle size={16} weight="fill" /> Dữ liệu đồng bộ theo kịch bản cá nhân
            </span>
            <span className="flex items-center gap-1.5 text-blue-700">
              <CheckCircle size={16} weight="fill" /> Link cloud an toàn không cần đăng nhập
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-600 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-95"
          >
            <ShareNetwork size={18} weight="bold" />
            Gửi Cho Cha Mẹ (Zalo/FB/QR)
          </button>
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm transition-all border border-slate-200"
          >
            <ArrowSquareOut size={16} weight="bold" />
            Mở Trang Độc Lập
          </a>
        </div>
      </div>

      {/* 4 Core Pillars Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pillar 1: Mức Đầu Tư Tài Chính */}
        <div className="bg-white rounded-[2rem] p-6 sm:p-8 border-2 border-slate-100 shadow-[0_15px_30px_-5px_rgba(0,0,0,0.03)] hover:border-blue-300/40 transition-all flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-13 h-13 rounded-2xl bg-slate-50 border border-slate-100 text-blue-600 flex items-center justify-center shadow-inner p-3">
                  <Bank size={28} weight="duotone" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Trụ Cột 1</span>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-display">
                    Mức Đầu Tư Học Phí & Sinh Hoạt
                  </h3>
                </div>
              </div>
              <span className="text-xs px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 font-bold border border-blue-100">
                Dự trù học tập & sinh hoạt
              </span>
            </div>

            {/* Stat box */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1.5">
                <span className="text-sm sm:text-base text-slate-600 font-medium">Chi phí trung bình mỗi tháng:</span>
                <span className="text-xl sm:text-2xl font-bold text-blue-700 font-display">
                  {report.financialInvestment.monthlyEstimate}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1.5 pt-3 border-t border-slate-200/80">
                <span className="text-sm sm:text-base text-slate-600 font-medium">Tổng ước tính cả khóa học:</span>
                <span className="text-base sm:text-lg font-bold text-slate-900 font-display">
                  {report.financialInvestment.fourYearTotal}
                </span>
              </div>
            </div>

            {/* Breakdown */}
            <div className="space-y-2.5">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 block">
                Bóc tách chi tiết các khoản:
              </span>
              <ul className="space-y-2.5 text-sm sm:text-base text-slate-700 leading-relaxed">
                {report.financialInvestment.costBreakdown.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 bg-slate-50/80 p-4 sm:p-5 rounded-2xl">
            <div className="flex items-start gap-2.5 text-sm sm:text-base text-slate-700 leading-relaxed">
              <Lightbulb size={22} weight="fill" className="text-amber-500 shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-900">Lời khuyên cho gia đình:</strong>{" "}
                {report.financialInvestment.adviceForParents}
              </span>
            </div>
          </div>
        </div>

        {/* Pillar 2: Tự Lập Tài Chính */}
        <div className="bg-white rounded-[2rem] p-6 sm:p-8 border-2 border-slate-100 shadow-[0_15px_30px_-5px_rgba(0,0,0,0.03)] hover:border-emerald-300/40 transition-all flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-13 h-13 rounded-2xl bg-slate-50 border border-slate-100 text-emerald-600 flex items-center justify-center shadow-inner p-3">
                  <ChartLineUp size={28} weight="duotone" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Trụ Cột 2</span>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-display">
                    Mốc Thời Gian Con Tự Lập Tài Chính
                  </h3>
                </div>
              </div>
              <span className="text-xs px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold border border-emerald-100">
                Tự chủ tài chính
              </span>
            </div>

            {/* Stat box */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1.5">
                <span className="text-sm sm:text-base text-slate-600 font-medium">Thời điểm tự trang trải sinh hoạt:</span>
                <span className="text-base sm:text-lg font-bold text-emerald-700 font-display">
                  {report.financialIndependence.expectedMilestone}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-3 border-t border-slate-200/80">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                  <span className="text-xs uppercase font-bold text-slate-500 block">Lương khởi điểm ra trường:</span>
                  <span className="text-base sm:text-lg font-bold text-slate-900">
                    {report.financialIndependence.startingSalaryRange}
                  </span>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                  <span className="text-xs uppercase font-bold text-slate-500 block">Sau 3 - 5 năm đi làm:</span>
                  <span className="text-base sm:text-lg font-bold text-emerald-700">
                    {report.financialIndependence.fiveYearSalaryRange}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              <strong className="text-slate-900">Đánh giá mức độ tự lập:</strong>{" "}
              {report.financialIndependence.selfSufficiencyVerdict}
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 bg-slate-50/80 p-4 sm:p-5 rounded-2xl">
            <div className="flex items-start gap-2.5 text-sm sm:text-base text-slate-700 leading-relaxed">
              <Coins size={22} weight="fill" className="text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-900">Ý nghĩa với ba mẹ:</strong> Con sớm có khả năng tự chủ chi tiêu, giảm gánh nặng chu cấp lâu dài cho gia đình và có tích lũy tài sản vững vàng.
              </span>
            </div>
          </div>
        </div>

        {/* Pillar 3: Rủi Ro & Kế Hoạch Dự Phòng */}
        <div className="bg-white rounded-[2rem] p-6 sm:p-8 border-2 border-slate-100 shadow-[0_15px_30px_-5px_rgba(0,0,0,0.03)] hover:border-amber-300/40 transition-all flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-13 h-13 rounded-2xl bg-slate-50 border border-slate-100 text-amber-600 flex items-center justify-center shadow-inner p-3">
                  <ShieldCheck size={28} weight="duotone" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Trụ Cột 3</span>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-display">
                    Rủi Ro Việc Làm & Kế Hoạch Dự Phòng
                  </h3>
                </div>
              </div>
              <span className="text-xs px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 font-bold border border-amber-100">
                Dự phòng an toàn
              </span>
            </div>

            <div className="bg-amber-50/60 p-4 sm:p-5 rounded-2xl border border-amber-200/70 space-y-2">
              <h4 className="text-sm sm:text-base font-bold text-amber-900 flex items-center gap-2">
                <Info size={20} weight="fill" className="text-amber-600" />
                Rủi ro thực tế cần chuẩn bị tâm lý:
              </h4>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                {report.employmentRiskAndPlanB.mainRisks}
              </p>
            </div>

            <div className="bg-emerald-50/60 p-4 sm:p-5 rounded-2xl border border-emerald-200/70 space-y-2">
              <h4 className="text-sm sm:text-base font-bold text-emerald-900 flex items-center gap-2">
                <ShieldCheck size={20} weight="fill" className="text-emerald-600" />
                Kế hoạch dự phòng an toàn (Plan B):
              </h4>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                {report.employmentRiskAndPlanB.contingencyPlanB}
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 bg-slate-50/80 p-4 sm:p-5 rounded-2xl text-sm sm:text-base text-slate-700 leading-relaxed">
            <strong className="text-slate-900">Nhu cầu xã hội:</strong>{" "}
            {report.employmentRiskAndPlanB.marketDemandVerdict}
          </div>
        </div>

        {/* Pillar 4: Cẩm Nang Đối Thoại Gia Đình */}
        <div className="bg-white rounded-[2rem] p-6 sm:p-8 border-2 border-slate-100 shadow-[0_15px_30px_-5px_rgba(0,0,0,0.03)] hover:border-rose-300/40 transition-all flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-13 h-13 rounded-2xl bg-slate-50 border border-slate-100 text-rose-600 flex items-center justify-center shadow-inner p-3">
                  <Heart size={28} weight="duotone" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Trụ Cột 4</span>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-display">
                    Cẩm Nang Lắng Nghe & Đối Thoại Với Con
                  </h3>
                </div>
              </div>
              <span className="text-xs px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 font-bold border border-rose-100">
                Gợi ý trò chuyện
              </span>
            </div>

            <div className="space-y-3">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 block">
                3 Câu hỏi gợi mở ba mẹ có thể hỏi con trong bữa cơm:
              </span>

              <div className="space-y-3">
                <div className="p-4 sm:p-4.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3.5">
                  <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs sm:text-sm font-bold shrink-0 mt-0.5">
                    1
                  </span>
                  <span className="text-base sm:text-lg text-slate-800 italic leading-relaxed">
                    "{report.familyDialogueGuide.question1}"
                  </span>
                </div>
                <div className="p-4 sm:p-4.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3.5">
                  <span className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs sm:text-sm font-bold shrink-0 mt-0.5">
                    2
                  </span>
                  <span className="text-base sm:text-lg text-slate-800 italic leading-relaxed">
                    "{report.familyDialogueGuide.question2}"
                  </span>
                </div>
                <div className="p-4 sm:p-4.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3.5">
                  <span className="w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs sm:text-sm font-bold shrink-0 mt-0.5">
                    3
                  </span>
                  <span className="text-base sm:text-lg text-slate-800 italic leading-relaxed">
                    "{report.familyDialogueGuide.question3}"
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 bg-slate-50/80 p-4 sm:p-5 rounded-2xl">
            <div className="flex items-start gap-2.5 text-sm sm:text-base text-slate-700 leading-relaxed">
              <ChatCircleDots size={22} weight="fill" className="text-rose-500 shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-900 font-semibold">Lời khuyên chuyên gia:</strong>{" "}
                {report.familyDialogueGuide.mentorTips}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SWOT Re-articulated for Family Section */}
      <div className="bg-white rounded-[2rem] p-6 sm:p-8 border-2 border-slate-100 shadow-[0_15px_30px_-5px_rgba(0,0,0,0.03)] space-y-6">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 text-amber-500 flex items-center justify-center p-2.5">
            <Sparkle size={24} weight="fill" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-display">
              Thế Mạnh Của Con & Điểm Cần Gia Đình Tiếp Sức
            </h3>
            <p className="text-sm text-slate-500">
              Chuyển hóa phân tích cá nhân thành góc nhìn yêu thương và thấu hiểu
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/70 space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm uppercase tracking-wide">
              <CheckCircle size={18} weight="fill" /> Thế mạnh nổi bật của con:
            </div>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              {report.strengthsOfChild}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200/70 space-y-2.5">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-sm uppercase tracking-wide">
              <Heart size={18} weight="fill" /> Điểm con cần gia đình hỗ trợ, động viên:
            </div>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              {report.areasToSupport}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200/70 space-y-2.5">
            <div className="flex items-center gap-2 text-blue-800 font-bold text-sm uppercase tracking-wide">
              <ChartLineUp size={18} weight="fill" /> Cơ hội rộng mở ngoài xã hội:
            </div>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              {report.socialOpportunities}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-rose-50/60 border border-rose-200/70 space-y-2.5">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-sm uppercase tracking-wide">
              <ShieldCheck size={18} weight="fill" /> Tâm lý thấu hiểu cho cha mẹ:
            </div>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              {report.emotionalSafetyNote}
            </p>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ParentShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        shareUrl={shareUrl}
        scenarioTitle={report.scenarioTitle}
        categoryTag={report.categoryTag}
      />
    </div>
  );
};
