import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconMapper } from "./IconMapper";
import { ComputedRoiResult } from "../services/roiCalculator";

interface RoiFinancialBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  roiData: ComputedRoiResult;
  scenarioTitle: string;
}

export const RoiFinancialBreakdownModal: React.FC<RoiFinancialBreakdownModalProps> = ({
  isOpen,
  onClose,
  roiData,
  scenarioTitle,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-3xl bg-white rounded-[2.5rem] shadow-2xl border-2 border-slate-100 overflow-hidden z-10 my-8 flex flex-col max-h-[92vh]"
          >
            {/* Header */}
            <div className="px-6 sm:px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                  <IconMapper name="calculator" className="text-2xl" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 uppercase italic font-display tracking-tight leading-tight">
                    Bóc Tách Tài Chính & Cơ Sở Tính ROI
                  </h3>
                  <p className="text-xs text-slate-500 font-medium italic line-clamp-1 mt-0.5">
                    Kịch bản: "{scenarioTitle}"
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-10 h-10 rounded-2xl hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors border border-transparent hover:border-slate-200"
              >
                <IconMapper name="close" className="text-2xl" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="px-6 sm:px-8 py-6 overflow-y-auto space-y-6">
              {/* Executive Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-100/80 shadow-sm">
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-700 block mb-1 font-display">
                    Bình Quân Hàng Năm
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-blue-600 font-display tracking-tight">
                    +{roiData.annualizedRoi}%
                    <span className="text-xs font-bold text-blue-500 ml-1 font-sans">/ năm</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mt-1">
                    Tỷ suất tăng trưởng kép (CAGR)
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 shadow-sm">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1 font-display">
                    Lũy Kế {roiData.timeHorizon} Năm
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-slate-900 font-display tracking-tight">
                    +{roiData.cumulativeRoi}%
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mt-1">
                    Tổng lợi nhuận ròng cả kỳ
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100/80 shadow-sm">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 block mb-1 font-display">
                    Thời Gian Hoàn Vốn
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-emerald-600 font-display tracking-tight">
                    ~ {roiData.paybackPeriodYears}
                    <span className="text-xs font-bold text-emerald-500 ml-1 font-sans">năm</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mt-1">
                    Điểm hòa vốn đầu tư (Break-even)
                  </p>
                </div>
              </div>

              {/* Verdict Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white border border-slate-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0">
                    <IconMapper name="verified" className="text-2xl" />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 block font-display">
                      ĐÁNH GIÁ HIỆU QUẢ ĐẦU TƯ
                    </span>
                    <span className="text-sm sm:text-base font-bold text-white font-display uppercase italic tracking-tight">
                      {roiData.verdict}
                    </span>
                  </div>
                </div>
                <div className="text-left sm:text-right text-xs text-slate-400 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                  <span className="block text-[10px] uppercase font-black tracking-widest text-slate-500">Mô hình tham chiếu</span>
                  <strong className="text-slate-200">Georgetown CEW</strong>
                </div>
              </div>

              {/* Explanation Note */}
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200/70 text-xs text-amber-950 leading-relaxed flex items-start gap-3.5 shadow-sm">
                <IconMapper name="lightbulb" className="text-amber-600 text-xl shrink-0 mt-0.5" />
                <div>
                  <strong className="font-display font-black uppercase text-[10px] tracking-wider text-amber-900 block mb-1">
                    Tại sao chỉ số ROI tổng có thể trên 100%?
                  </strong>
                  <span className="text-amber-900/90 font-medium leading-relaxed block">
                    Chỉ số <strong>+{roiData.cumulativeRoi}%</strong> là tổng dòng thặng dư thu nhập tích lũy sau cả {roiData.timeHorizon} năm gộp lại so với chi phí ban đầu. 
                    Khi chia đều theo chu kỳ hoàn vốn từng năm, mức tăng trưởng thực tế là <strong>+{roiData.annualizedRoi}% / năm</strong>.
                  </span>
                </div>
              </div>

              {/* Line Items Table */}
              <div>
                <h4 className="text-xs font-black uppercase italic tracking-wider text-slate-900 mb-3.5 flex items-center gap-2 font-display">
                  <IconMapper name="receipt_long" className="text-blue-600 text-base" />
                  BẢNG DỰ TOÁN CHI PHÍ & DÒNG THU NHẬP THẶNG DƯ
                </h4>

                <div className="border-2 border-slate-100 rounded-2xl overflow-hidden shadow-sm divide-y divide-slate-100 bg-white">
                  {roiData.lineItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-slate-50/70 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border ${
                              item.type === "cost"
                                ? "bg-rose-50 text-rose-600 border-rose-200/70"
                                : "bg-emerald-50 text-emerald-600 border-emerald-200/70"
                            }`}
                          >
                            {item.type === "cost" ? "Chi phí" : "Thu nhập"}
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-slate-900">
                            {item.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">{item.description}</p>
                      </div>

                      <div
                        className={`text-sm sm:text-base font-black font-display whitespace-nowrap sm:text-right ${
                          item.type === "cost" ? "text-slate-800" : "text-emerald-600"
                        }`}
                      >
                        {item.amount}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mathematical Formula Steps */}
              <div>
                <h4 className="text-xs font-black uppercase italic tracking-wider text-slate-900 mb-3.5 flex items-center gap-2 font-display">
                  <IconMapper name="functions" className="text-blue-600 text-base" />
                  CÔNG THỨC TÍNH TOÁN MINH BẠCH
                </h4>

                <div className="space-y-3">
                  {roiData.formulaSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:border-blue-200 transition-colors shadow-sm"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-bold text-slate-800 mb-2 font-display uppercase tracking-tight">
                        <span className="italic">{step.title}</span>
                        <span className="text-blue-600 font-black text-sm not-italic">{step.result}</span>
                      </div>
                      <div className="font-mono text-[11px] text-slate-700 bg-white px-3.5 py-2.5 rounded-xl border border-slate-200/80 shadow-inner">
                        {step.formula}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prominent Legal / Reference Disclaimer Note */}
              <div className="p-4 rounded-2xl bg-slate-100/90 border border-slate-200/90 text-slate-600 text-xs flex items-start gap-3 leading-relaxed">
                <IconMapper name="info" className="text-blue-600 text-lg shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="text-slate-900 font-bold uppercase tracking-wider text-[10px] block font-display">
                    LƯU Ý QUAN TRỌNG VỀ THÔNG SỐ:
                  </strong>
                  <p className="text-slate-600 font-medium text-[11px] leading-relaxed">
                    Mọi dữ liệu, chi phí dự toán và thông số tỷ suất hoàn vốn (ROI) được hệ thống phân tích <strong>chỉ mang tính chất tham khảo dựa vào bối cảnh cá nhân</strong>, trình độ học vấn, tài chính và mục tiêu mà người dùng đã cung cấp; không phải là cam kết tài chính cố định hay sự đảm bảo thu nhập tuyệt đối trong thực tế.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 sm:px-8 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <span className="text-[11px] text-slate-500 font-medium italic text-center sm:text-left">
                * Mọi dữ liệu thông số chỉ mang tính chất tham khảo dựa vào bối cảnh cá nhân của người dùng.
              </span>
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-blue-600 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 shrink-0"
              >
                Đã Hiểu
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

