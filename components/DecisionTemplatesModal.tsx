import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconMapper } from "./IconMapper";

export interface DecisionTemplate {
  id: string;
  category: "highschool" | "university" | "career" | "global";
  categoryName: string;
  label: string;
  subtitle: string;
  icon: string;
  badgeColor: string;
  defaultParams: {
    stress: number;
    personalFinance: number;
    risk: number;
    academicPerformance: number;
  };
  content: string;
  highlights: string[];
}

export const CURATED_TEMPLATES: DecisionTemplate[] = [
  {
    id: "highschool_choice",
    category: "highschool",
    categoryName: "Học sinh THPT",
    label: "Chọn Ngành & Chọn Trường Đại Học",
    subtitle: "Phân vân giữa đam mê cá nhân và ngành nghề 'hot' dễ xin việc",
    icon: "school",
    badgeColor: "bg-blue-50 text-blue-600 border-blue-100",
    defaultParams: {
      stress: 4,
      personalFinance: 3,
      risk: 3,
      academicPerformance: 4,
    },
    highlights: ["Đại học Bách Khoa vs Mỹ thuật", "Khối A00/D01", "Học phí gia đình"],
    content: `[BỐI CẢNH CHỌN NGÀNH & TRƯỜNG ĐH]
- Quyết định: Phân vân giữa [Lựa chọn A: Học ngành Công nghệ Thông tin tại ĐH Bách Khoa] và [Lựa chọn B: Học Thiết kế Đồ họa / Truyền thông số tại trường Nghệ thuật].
- Hiện trạng học tập: Học sinh lớp 12, khối học sở trường là A00/D01, điểm trung bình tích lũy (GPA) 8.4/10.
- Năng lực nổi trội: Tư duy logic toán học tốt, nhạy bén với công nghệ, thích vẽ và sáng tạo nội dung số.
- Ngân sách học phí: Bố mẹ có thể chu cấp khoảng 30-45 triệu đồng/năm.
- Định hướng nghề nghiệp mong muốn: Trở thành Kỹ sư phần mềm hoặc Chuyên viên Thiết kế sản phẩm công nghệ sau 4 năm.
- Lo ngại lớn nhất: Sợ ngành CNTT bão hòa và áp lực học dồn dập / Sợ ngành Thiết kế khó xin việc lương cao trong những năm đầu.`,
  },
  {
    id: "study_abroad_vs_local",
    category: "global",
    categoryName: "Hội nhập Quốc tế",
    label: "Du Học Tự Túc vs Học Liên Kết Trong Nước",
    subtitle: "Cân đối gánh nặng tài chính ngoại tệ và trải nghiệm quốc tế",
    icon: "rocket_launch",
    badgeColor: "bg-violet-50 text-violet-600 border-violet-100",
    defaultParams: {
      stress: 4,
      personalFinance: 2,
      risk: 4,
      academicPerformance: 4,
    },
    highlights: ["Du học Úc/Đức vs RMIT/VNUK", "IELTS 6.5", "Bài toán hoàn vốn (ROI)"],
    content: `[BỐI CẢNH DU HỌC VS TRONG NƯỚC]
- Quyết định: Đi du học tự túc ngành Khoa học Dữ liệu tại [Úc / CHLB Đức] hay học chương trình Cử nhân liên kết quốc tế ngay tại Việt Nam.
- Hiện trạng năng lực: Điểm GPA 8.2, chứng chỉ tiếng Anh IELTS 6.5 (đủ điều kiện nhập học trực tiếp).
- Điều kiện tài chính: Cần tìm kiếm học bổng bán phần (30-50%) vì ngân sách gia đình chỉ tự túc tối đa 250 triệu/năm, phần còn lại phải tự làm thêm.
- Định hướng sau tốt nghiệp: Muốn tích lũy 2 năm kinh nghiệm làm việc tại nước ngoài rồi trở về Việt Nam phát triển sự nghiệp.
- Lo ngại lớn nhất: Chi phí sinh hoạt ngoại tệ quá đắt đỏ, rủi ro không cân bằng được giữa đi làm thêm và điểm số tốt nghiệp.`,
  },
  {
    id: "university_career",
    category: "university",
    categoryName: "Sinh viên ĐH",
    label: "Đi Làm Ngay Lấy Kinh Nghiệm vs Học Thạc Sĩ",
    subtitle: "Thời điểm vàng sau khi tốt nghiệp đại học để bứt phá",
    icon: "work",
    badgeColor: "bg-emerald-50 text-emerald-600 border-emerald-100",
    defaultParams: {
      stress: 3,
      personalFinance: 3,
      risk: 3,
      academicPerformance: 4,
    },
    highlights: ["Sinh viên năm cuối", "Lương khởi điểm vs Bằng cấp", "Kinh nghiệm thực chiến"],
    content: `[BỐI CẢNH ĐỊNH HƯỚNG RA TRƯỜNG]
- Quyết định: Sau khi tốt nghiệp ngành Kinh tế / Quản trị, nên chấp nhận đi làm ngay vị trí Junior với lương khởi điểm 10-12 triệu/tháng hay học tiếp lên Thạc sĩ (Master) để nâng cao vị thế.
- Hiện trạng học tập: Sinh viên năm cuối, GPA 3.4/4.0, từng tham gia 1 kỳ thực tập và làm trợ lý nghiên cứu tại trường.
- Mục tiêu 3 năm đầu: Đạt mức thu nhập 25 triệu/tháng và thăng tiến lên vị trí Trưởng nhóm dự án.
- Lo ngại lớn nhất: Đi làm ngay sợ bị cuốn vào vòng xoáy công việc không nâng được học vị; học Thạc sĩ ngay lại sợ thiếu kinh nghiệm thực tế khi thị trường đòi hỏi kỹ năng cọ xát.`,
  },
  {
    id: "work_study_balance",
    category: "university",
    categoryName: "Sinh viên ĐH",
    label: "Học Tập Chuyên Cần vs Đi Làm Thêm Kiếm Sống",
    subtitle: "Bài toán cân bằng giữa học bổng và chi phí sinh hoạt",
    icon: "account_balance_wallet",
    badgeColor: "bg-amber-50 text-amber-600 border-amber-100",
    defaultParams: {
      stress: 5,
      personalFinance: 1,
      risk: 4,
      academicPerformance: 3,
    },
    highlights: ["Tự lập tài chính", "Nguy cơ kiệt sức", "Học bổng khuyến khích"],
    content: `[BỐI CẢNH HỌC TẬP VS ĐI LÀM THÊM]
- Quyết định: Dành 25-30 giờ/tuần đi làm thêm (gia sư, phục vụ quán, trợ giảng) để tự trang trải sinh hoạt phí hay giảm tối đa làm thêm để tập trung 100% giành học bổng xuất sắc của trường.
- Hiện trạng tài chính: Gia đình ở quê hỗ trợ hạn chế, học phí mỗi kỳ 18 triệu đồng và tiền trọ 3.5 triệu/tháng.
- Mục tiêu học tập: Duy trì GPA trên 3.2 để đủ điều kiện xét tuyển học bổng và không bị nợ môn.
- Lo ngại lớn nhất: Đi làm thêm quá sức dẫn đến kiệt sức thể chất, ngủ gật trên giảng đường và kết quả học tập sụt giảm nghiêm trọng.`,
  },
  {
    id: "student_startup",
    category: "career",
    categoryName: "Khởi nghiệp",
    label: "Dự Án Khởi Nghiệp Sinh Viên vs Thực Tập Công Ty Lớn",
    subtitle: "Dấn thân mạo hiểm làm chủ hay an toàn tích lũy quy trình tập đoàn",
    icon: "psychology",
    badgeColor: "bg-rose-50 text-rose-600 border-rose-100",
    defaultParams: {
      stress: 4,
      personalFinance: 2,
      risk: 5,
      academicPerformance: 3,
    },
    highlights: ["Sáng lập dự án AI EduTech", "Thực tập sinh MNC", "Vốn tự có 50 triệu"],
    content: `[BỐI CẢNH KHỞI NGHIỆP SINH VIÊN VS THỰC TẬP TẬP ĐOÀN]
- Quyết định: Cùng 3 người bạn thân phát triển dự án công nghệ EdTech phục vụ ôn thi THPT hay nộp hồ sơ ứng tuyển chương trình Quản trị viên tập sự (Management Trainee) tại tập đoàn đa quốc gia.
- Hiện trạng nguồn lực: Nhóm có 50 triệu đồng vốn tích lũy, có sản phẩm thử nghiệm (MVP) được 500 học sinh dùng thử; đồng thời vừa nhận được thư mời phỏng vấn vòng 2 của công ty MNC.
- Mục tiêu 2 năm tới: Đưa dự án gọi vốn hạt giống (Seed Round) hoặc trở thành nhân viên chính thức với lộ trình quản lý cấp trung.
- Lo ngại lớn nhất: Dự án khởi nghiệp hết tiền và tan rã, mất cơ hội vàng gia nhập môi trường tập đoàn chuyên nghiệp đầu đời.`,
  },
];

interface DecisionTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: DecisionTemplate) => void;
  currentContent?: string;
}

export const DecisionTemplatesModal: React.FC<DecisionTemplatesModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  currentContent = "",
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [previewTemplate, setPreviewTemplate] = useState<DecisionTemplate>(CURATED_TEMPLATES[0]);

  if (!isOpen) return null;

  const categories = [
    { id: "all", label: "Tất cả mẫu" },
    { id: "highschool", label: "Học sinh THPT" },
    { id: "university", label: "Sinh viên ĐH" },
    { id: "global", label: "Du học & Quốc tế" },
    { id: "career", label: "Khởi nghiệp" },
  ];

  const filteredTemplates =
    selectedCategory === "all"
      ? CURATED_TEMPLATES
      : CURATED_TEMPLATES.filter((t) => t.category === selectedCategory);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[120] flex items-center justify-center p-4"
        style={{ backdropFilter: "blur(20px)", background: "rgba(15, 23, 42, 0.75)" }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.35)] w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-8 pb-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50/80 via-white to-blue-50/40">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                <IconMapper name="auto_awesome" className="text-2xl" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase font-display tracking-tight">
                  Thư Viện Biểu Mẫu Quyết Định
                </h3>
                <p className="text-xs font-medium text-slate-500">
                  Các kịch bản thực tế được thiết kế riêng cho học sinh & sinh viên Việt Nam
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
            >
              <IconMapper name="close" className="text-base" />
            </button>
          </div>

          {/* Category Tabs */}
          <div className="px-8 pt-4 pb-2 border-b border-slate-100/80 flex items-center gap-2 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                    : "bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Body: Split View (List + Preview) */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
            {/* Left: Template List (5 cols) */}
            <div className="lg:col-span-5 p-6 overflow-y-auto space-y-3 border-r border-slate-100 max-h-[60vh]">
              {filteredTemplates.map((tmpl) => {
                const isSelected = previewTemplate.id === tmpl.id;
                const isCurrentlyActive = currentContent === tmpl.content;

                return (
                  <motion.div
                    key={tmpl.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setPreviewTemplate(tmpl)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20 shadow-md"
                        : "border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                          <IconMapper name={tmpl.icon} className="text-base" />
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${tmpl.badgeColor}`}>
                          {tmpl.categoryName}
                        </span>
                      </div>
                      {isCurrentlyActive && (
                        <span className="text-[9px] font-black uppercase text-blue-600 bg-blue-100/60 px-2 py-0.5 rounded-full">
                          Đang dùng
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-black text-slate-900 leading-snug mb-1">
                      {tmpl.label}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium line-clamp-2 leading-relaxed">
                      {tmpl.subtitle}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            {/* Right: Detailed Preview & Parameter Pre-sets (7 cols) */}
            <div className="lg:col-span-7 p-8 overflow-y-auto max-h-[60vh] bg-slate-50/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border ${previewTemplate.badgeColor}`}>
                    {previewTemplate.categoryName}
                  </span>
                  <div className="h-px bg-slate-200 flex-1"></div>
                </div>

                <h3 className="text-2xl font-black text-slate-900 mb-2 font-display uppercase tracking-tight">
                  {previewTemplate.label}
                </h3>
                <p className="text-xs text-slate-600 font-medium mb-6 leading-relaxed">
                  {previewTemplate.subtitle}
                </p>

                {/* Preset Parameters Preview */}
                <div className="mb-6 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                    Thông số bối cảnh được tự động hiệu chỉnh (1 - 5)
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Áp lực</span>
                      <span className="text-lg font-black text-rose-600">{previewTemplate.defaultParams.stress}/5</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Tài chính</span>
                      <span className="text-lg font-black text-emerald-600">{previewTemplate.defaultParams.personalFinance}/5</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Rủi ro</span>
                      <span className="text-lg font-black text-amber-600">{previewTemplate.defaultParams.risk}/5</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Học lực</span>
                      <span className="text-lg font-black text-blue-600">{previewTemplate.defaultParams.academicPerformance}/5</span>
                    </div>
                  </div>
                </div>

                {/* Content Box */}
                <div className="relative">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    Nội dung mô tả mẫu sẽ điền vào form:
                  </p>
                  <div className="p-5 bg-white border border-slate-200/80 rounded-2xl text-xs font-mono text-slate-700 leading-relaxed whitespace-pre-line shadow-inner max-h-56 overflow-y-auto">
                    {previewTemplate.content}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6 mt-6 border-t border-slate-200/80 flex items-center justify-between gap-4">
                <span className="text-[11px] font-medium text-slate-500">
                  Bạn có thể chỉnh sửa lại các thông tin sau khi áp dụng mẫu.
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onSelectTemplate(previewTemplate);
                    onClose();
                  }}
                  className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2 shrink-0 active:scale-[0.98]"
                >
                  <IconMapper name="check_circle" className="text-base" />
                  Áp dụng mẫu này
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
