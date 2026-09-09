import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  decodeScenarioSharePayload,
  generateParentReport,
  ParentReportData,
} from "../services/parentPerspectiveService";
import {
  Heart,
  Bank,
  Coins,
  ChartLineUp,
  ShieldCheck,
  Question,
  ChatCircleDots,
  TextAa,
  Printer,
  Check,
  Copy,
  Sparkle,
  Lightbulb,
  ArrowLeft,
  CalendarCheck,
  Users,
  Tag,
  Info,
} from "@phosphor-icons/react";

export const ParentPerspectivePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const dataParam = searchParams.get("data");
  const idParam = searchParams.get("id");

  const [isLargeFont, setIsLargeFont] = useState(false);
  const [report, setReport] = useState<ParentReportData | null>(null);
  const [copiedResponse, setCopiedResponse] = useState(false);
  const [parentReplyText, setParentReplyText] = useState(
    "Ba mẹ đã đọc bản định hướng của con rồi. Rất rõ ràng và ba mẹ thấy an tâm hơn nhiều. Tối nay cả nhà cùng nói chuyện thêm nhé!"
  );

  useEffect(() => {
    let targetScenario: any = null;

    // 1. Giải mã từ payload ?data= (URL-safe compact)
    if (dataParam) {
      const decoded = decodeScenarioSharePayload(dataParam);
      if (decoded) {
        targetScenario = decoded;
      }
    }

    // 2. Nếu có idParam, thử tìm kiếm thêm từ lịch sử lưu trữ cục bộ để có dữ liệu phong phú hơn
    if (idParam) {
      try {
        const localHistory = JSON.parse(localStorage.getItem("futuretrace_history") || "[]");
        for (const item of localHistory) {
          if (item.id === idParam || item._id === idParam) {
            targetScenario = item;
            break;
          }
          if (item.scenarios && Array.isArray(item.scenarios)) {
            const found = item.scenarios.find(
              (s: any) => s.id === idParam || s._id === idParam || s.type === idParam
            );
            if (found) {
              targetScenario = found;
              break;
            }
          }
        }
      } catch (e) {
        console.error("Error reading local history for parent view:", e);
      }
    }

    // 3. Nếu tìm thấy kịch bản hợp lệ, sinh báo cáo cụ thể theo kịch bản đó
    if (targetScenario) {
      setReport(generateParentReport(targetScenario));
      return;
    }

    // 4. Mặc định fallback nếu không có tham số
    setReport(
      generateParentReport({
        id: "default",
        title: "Vừa học vừa làm (Hybrid - Thực chiến & Tự lập sớm)",
        type: "Positive",
        description: "Lộ trình học tập tích hợp làm việc thực tế tại doanh nghiệp, giúp sinh viên tự trang trải học phí và tự lập tài chính sớm.",
        deepAnalysis: {
          swot: [
            {
              type: "S",
              value: "Con có tinh thần tự lập cao, năng động và muốn va chạm thực tế từ sớm.",
              label: "Điểm mạnh",
              color: "text-emerald-600"
            },
            {
              type: "W",
              value: "Cần rèn luyện thêm kỹ năng quản lý thời gian và giữ gìn sức khỏe khi chạy cả 2 việc.",
              label: "Điểm cần cải thiện",
              color: "text-amber-600"
            },
            {
              type: "O",
              value: "Doanh nghiệp luôn ưu tiên tuyển dụng ứng viên có kinh nghiệm thực chiến thực tế.",
              label: "Cơ hội",
              color: "text-blue-600"
            },
            {
              type: "T",
              value: "Nguy cơ quá tải nếu không sắp xếp tốt giữa lịch thi cử và deadline công việc.",
              label: "Thách thức",
              color: "text-rose-600"
            },
          ],
        },
      })
    );
  }, [dataParam, idParam]);

  if (!report) return null;

  const handleCopyReply = async () => {
    try {
      await navigator.clipboard.writeText(parentReplyText);
      setCopiedResponse(true);
      setTimeout(() => setCopiedResponse(false), 2500);
    } catch {
      setCopiedResponse(true);
      setTimeout(() => setCopiedResponse(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className={`min-h-screen bg-slate-50 text-slate-800 ${
        isLargeFont ? "text-base sm:text-lg" : "text-sm sm:text-base"
      } transition-all duration-150`}
    >
      {/* Top Header Bar - Clean Executive Style */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-sm px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="w-9 h-9 rounded-2xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors"
            title="Trang chủ FutureTrace"
          >
            <ArrowLeft size={18} weight="bold" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-slate-900 tracking-tight text-base sm:text-lg uppercase italic">
                FUTURETRACE
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px] uppercase tracking-wider border border-blue-200">
                Thấu Kính Phụ Huynh
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Báo cáo định hướng nghề nghiệp thấu hiểu & đồng hành cùng con
            </p>
          </div>
        </div>

        {/* Tools: Font Toggle & Print */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setIsLargeFont(!isLargeFont)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-bold transition-all ${
              isLargeFont
                ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
            title="Tăng cỡ chữ giúp cha mẹ dễ đọc trên điện thoại"
          >
            <TextAa size={18} weight="bold" />
            <span className="hidden sm:inline">
              {isLargeFont ? "Cỡ chữ lớn: Bật" : "Cỡ chữ lớn"}
            </span>
            <span className="sm:hidden">{isLargeFont ? "A+" : "A"}</span>
          </button>

          <button
            onClick={handlePrint}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold transition-all"
            title="In hoặc Lưu thành bản PDF"
          >
            <Printer size={18} weight="bold" />
            <span>In / Lưu PDF</span>
          </button>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-7">
        {/* Warm Letter to Parents */}
        <div className="bg-white rounded-[2rem] p-6 sm:p-8 border-2 border-slate-100 shadow-[0_15px_30px_-5px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wider">
              <Heart size={18} weight="fill" />
              <span>Thư gửi Ba Mẹ / Quý Phụ Huynh</span>
            </div>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
              <Tag size={12} />
              {report.categoryTag}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-900 leading-tight">
            Định hướng: <span className="text-blue-600">{report.scenarioTitle}</span>
          </h1>

          <p className="text-slate-600 leading-relaxed italic bg-slate-50 p-4 rounded-2xl border border-slate-100">
            "Kính gửi Ba Mẹ, con đã dành thời gian nghiên cứu nghiêm túc về kế hoạch tương lai của mình trên hệ thống FutureTrace. Báo cáo dưới đây được tổng hợp dành riêng cho ba mẹ, tập trung giải đáp 4 băn khoăn thiết thực nhất: <strong className="text-slate-900">chi phí học tập mỗi tháng</strong>, <strong className="text-slate-900">sau bao lâu con tự lập tài chính</strong>, <strong className="text-slate-900">rủi ro việc làm và phương án dự phòng (Plan B)</strong>, cùng những câu hỏi để cả nhà cùng chia sẻ trong bữa cơm. Rất mong ba mẹ đọc qua để cùng đồng hành với con."
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span className="flex items-center gap-1.5 font-medium text-emerald-700">
              <CalendarCheck size={16} /> Dữ liệu đồng bộ theo kịch bản cá nhân của con
            </span>
            <span className="flex items-center gap-1.5 font-medium text-blue-700">
              <Users size={16} /> Ngôn ngữ ấm áp, gần gũi với gia đình Việt
            </span>
          </div>
        </div>

        {/* 4 Trụ Cột Trọng Tâm */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 font-display flex items-center gap-2">
              <Sparkle size={18} weight="fill" className="text-amber-500" />
              4 Trụ Cột Cha Mẹ Quan Tâm Nhất
            </h2>
            <span className="text-xs text-slate-400 font-medium">
              Ước tính theo thực tế thị trường
            </span>
          </div>

          {/* Trụ cột 1: Học phí & Chi phí hàng tháng */}
          <section className="bg-white rounded-[2rem] p-6 sm:p-7 border-2 border-slate-100 shadow-[0_15px_30px_-5px_rgba(0,0,0,0.03)] space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 text-blue-600 flex items-center justify-center shrink-0">
                <Bank size={24} weight="duotone" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Câu hỏi 1
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Mức đầu tư học phí & sinh hoạt là bao nhiêu triệu/tháng?
                </h3>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-100 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <span className="text-xs sm:text-sm font-semibold text-slate-600">
                  Khoản tiền trung bình mỗi tháng:
                </span>
                <span className="text-base sm:text-lg font-bold text-blue-700 font-display">
                  {report.financialInvestment.monthlyEstimate}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 pt-2 border-t border-slate-200">
                <span className="text-xs sm:text-sm font-semibold text-slate-600">
                  Tổng kinh phí ước tính cả khóa:
                </span>
                <span className="text-sm sm:text-base font-bold text-slate-900 font-display">
                  {report.financialInvestment.fourYearTotal}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs sm:text-sm text-slate-700">
              <span className="font-bold text-slate-900 block">Chi tiết các khoản chi dự trù:</span>
              <ul className="space-y-2">
                {report.financialInvestment.costBreakdown.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs sm:text-sm text-amber-950 flex items-start gap-3">
              <Lightbulb size={20} weight="fill" className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Lời khuyên cho gia đình:</strong>{" "}
                {report.financialInvestment.adviceForParents}
              </div>
            </div>
          </section>

          {/* Trụ cột 2: Tự lập tài chính */}
          <section className="bg-white rounded-[2rem] p-6 sm:p-7 border-2 border-slate-100 shadow-[0_15px_30px_-5px_rgba(0,0,0,0.03)] space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 text-emerald-600 flex items-center justify-center shrink-0">
                <ChartLineUp size={24} weight="duotone" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Câu hỏi 2
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Sau bao nhiêu năm con tự lập được tài chính?
                </h3>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-100 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <span className="text-xs sm:text-sm font-semibold text-slate-600">
                  Thời điểm con bắt đầu tự chi trả sinh hoạt:
                </span>
                <span className="text-base sm:text-lg font-bold text-emerald-700 font-display">
                  {report.financialIndependence.expectedMilestone}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-200">
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-400 block font-medium">Lương khởi điểm ra trường:</span>
                  <span className="text-sm sm:text-base font-bold text-slate-900">
                    {report.financialIndependence.startingSalaryRange}
                  </span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-400 block font-medium">Thu nhập sau 3 - 5 năm:</span>
                  <span className="text-sm sm:text-base font-bold text-emerald-700">
                    {report.financialIndependence.fiveYearSalaryRange}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              <strong className="text-slate-900 font-bold">Khả năng tự lập:</strong>{" "}
              {report.financialIndependence.selfSufficiencyVerdict}
            </p>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-600 flex items-center gap-2.5">
              <Coins size={18} weight="fill" className="text-emerald-600 shrink-0" />
              <span>
                <strong className="text-slate-800">Ý nghĩa thực tế:</strong> Cha mẹ chỉ cần trợ lực tài chính trong giai đoạn đầu; khi con đã có kinh nghiệm và nhận bằng, con hoàn toàn tự nuôi sống bản thân.
              </span>
            </div>
          </section>

          {/* Trụ cột 3: Rủi ro & Kế hoạch dự phòng (Plan B) */}
          <section className="bg-white rounded-[2rem] p-6 sm:p-7 border-2 border-slate-100 shadow-[0_15px_30px_-5px_rgba(0,0,0,0.03)] space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 text-amber-600 flex items-center justify-center shrink-0">
                <ShieldCheck size={24} weight="duotone" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Câu hỏi 3
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Rủi ro việc làm là gì và phương án dự phòng (Plan B) ra sao?
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-1.5">
                <h4 className="text-xs sm:text-sm font-bold text-amber-950 flex items-center gap-1.5">
                  <Info size={18} weight="fill" className="text-amber-600" />
                  Rủi ro thực tế cần lưu ý:
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {report.employmentRiskAndPlanB.mainRisks}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-1.5">
                <h4 className="text-xs sm:text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                  <ShieldCheck size={18} weight="fill" className="text-emerald-600" />
                  Kế hoạch dự phòng an toàn (Plan B):
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {report.employmentRiskAndPlanB.contingencyPlanB}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-600">
              <strong className="text-slate-900">Nhu cầu xã hội:</strong>{" "}
              {report.employmentRiskAndPlanB.marketDemandVerdict}
            </div>
          </section>

          {/* Trụ cột 4: Cẩm nang đối thoại cha mẹ - con cái */}
          <section className="bg-white rounded-[2rem] p-6 sm:p-7 border-2 border-slate-100 shadow-[0_15px_30px_-5px_rgba(0,0,0,0.03)] space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 text-rose-600 flex items-center justify-center shrink-0">
                <ChatCircleDots size={24} weight="duotone" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Câu hỏi 4
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Cẩm nang lắng nghe & 3 câu hỏi gợi mở cho ba mẹ
                </h3>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Thay vì nói: <em className="text-rose-700 font-medium">"Ngành này khó lắm, con không theo nổi đâu"</em>, ba mẹ có thể khơi gợi để lắng nghe suy nghĩ của con bằng 3 câu hỏi ấm áp sau:
            </p>

            <div className="space-y-2.5">
              <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  1
                </span>
                <span className="text-xs sm:text-sm text-slate-800 font-medium italic">
                  "{report.familyDialogueGuide.question1}"
                </span>
              </div>

              <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  2
                </span>
                <span className="text-xs sm:text-sm text-slate-800 font-medium italic">
                  "{report.familyDialogueGuide.question2}"
                </span>
              </div>

              <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  3
                </span>
                <span className="text-xs sm:text-sm text-slate-800 font-medium italic">
                  "{report.familyDialogueGuide.question3}"
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 text-xs sm:text-sm text-rose-950 flex items-start gap-3">
              <Heart size={20} weight="fill" className="text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Bí quyết từ chuyên gia:</strong>{" "}
                {report.familyDialogueGuide.mentorTips}
              </div>
            </div>
          </section>
        </div>

        {/* Phản Hồi Nhanh Dành Cho Phụ Huynh */}
        <div className="bg-slate-900 text-white rounded-[2rem] p-6 sm:p-8 shadow-xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/30 text-blue-400 flex items-center justify-center">
              <ChatCircleDots size={22} weight="fill" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-display uppercase tracking-tight">
                Gửi Lời Nhắn Động Viên Cho Con
              </h3>
              <p className="text-xs text-slate-400">
                Ba mẹ có thể chỉnh sửa lời nhắn dưới đây và bấm sao chép để gửi qua Zalo cho con
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <textarea
              rows={3}
              value={parentReplyText}
              onChange={(e) => setParentReplyText(e.target.value)}
              className="w-full bg-slate-800/80 text-white text-xs sm:text-sm rounded-2xl p-3.5 border border-slate-700 outline-none focus:border-blue-500 transition-colors leading-relaxed"
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={handleCopyReply}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md ${
                  copiedResponse
                    ? "bg-emerald-500 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {copiedResponse ? (
                  <>
                    <Check size={18} weight="bold" /> Đã sao chép tin nhắn
                  </>
                ) : (
                  <>
                    <Copy size={18} weight="bold" /> Sao chép lời nhắn gửi qua Zalo
                  </>
                )}
              </button>

              <span className="text-[11px] text-slate-400">
                Dán vào đoạn chat Zalo với con sau khi sao chép
              </span>
            </div>
          </div>
        </div>

        {/* Footer Disclaimer */}
        <div className="text-center py-4 text-xs text-slate-400 space-y-1">
          <p>
            © 2026 FutureTrace • Hệ thống tư vấn & mô phỏng định hướng học tập và sự nghiệp thông minh.
          </p>
          <p className="text-[11px] text-slate-400">
            * Toàn bộ dữ liệu mô phỏng nhằm mục đích tham khảo, khuyến khích đối thoại cởi mở trong gia đình.
          </p>
        </div>
      </main>
    </div>
  );
};

export default ParentPerspectivePage;
