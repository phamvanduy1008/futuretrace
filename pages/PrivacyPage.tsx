import React from "react";
import SharedHeader from "../components/SharedHeader";
import SharedFooter from "../components/SharedFooter";

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: "1. Dữ liệu chúng tôi xử lý",
    body: [
      "Thông tin tài khoản: email, họ tên, ảnh đại diện (nếu đăng nhập Google), năm sinh.",
      "Thông tin bạn nhập khi mô phỏng: mong muốn học tập/nghề nghiệp, trường và ngành quan tâm, điểm dự kiến, khu vực, mức học lực, mức áp lực, khả năng tài chính gia đình, ngân sách.",
      "Kết quả đánh giá 40 câu hỏi, kết quả mô phỏng, lộ trình, phản hồi (👍/👎) và lịch sử giao dịch mua token.",
      "Mức áp lực tâm lý và tình hình tài chính là dữ liệu nhạy cảm; chúng tôi chỉ xử lý khi bạn đồng ý.",
    ],
  },
  {
    title: "2. Mục đích",
    body: [
      "Tạo kết quả mô phỏng, lộ trình và số liệu định lượng cho chính bạn.",
      "Cải thiện chất lượng mô hình (ví dụ dùng phản hồi 👍/👎 và kết quả đã ẩn danh để đánh giá, huấn luyện).",
      "Thống kê vận hành tổng hợp (không định danh cá nhân).",
    ],
  },
  {
    title: "3. Chuyển dữ liệu ra nước ngoài",
    body: [
      "Nội dung mô phỏng được gửi tới máy chủ AI (dịch vụ GPU Modal và Google Gemini, có thể đặt ngoài Việt Nam) để tạo văn bản phân tích. Chúng tôi không gửi họ tên, email hay thông tin liên hệ của bạn tới các dịch vụ này.",
      "Cơ sở dữ liệu được lưu trên MongoDB Atlas.",
    ],
  },
  {
    title: "4. Người dùng dưới 16 tuổi",
    body: [
      "Người dùng dưới 16 tuổi chỉ được sử dụng khi cha mẹ hoặc người giám hộ đã đồng ý. Cha mẹ có quyền yêu cầu xem, sửa hoặc xóa dữ liệu của con.",
    ],
  },
  {
    title: "5. Quyền của bạn",
    body: [
      "Xem và sửa thông tin hồ sơ trong trang Hồ sơ.",
      "Rút lại đồng ý và xóa tài khoản cùng toàn bộ dữ liệu cá nhân (mô phỏng, lộ trình, đánh giá, phản hồi, bài cộng đồng) trong trang Hồ sơ. Chứng từ giao dịch thanh toán được giữ lại theo nghĩa vụ kế toán.",
      "Liên hệ nhóm phát triển để được hỗ trợ về dữ liệu cá nhân.",
    ],
  },
  {
    title: "6. Giới hạn của kết quả",
    body: [
      "Số liệu lương, điểm chuẩn, xác suất trúng tuyển và ROI là ước tính dựa trên dữ liệu thị trường và mô hình thống kê, có sai số (xem trang Phương pháp luận). Kết quả không phải cam kết và không thay thế tư vấn của giáo viên, chuyên gia hướng nghiệp hay cha mẹ.",
    ],
  },
];

const PrivacyPage: React.FC = () => (
  <div className="min-h-screen bg-white flex flex-col">
    <SharedHeader />
    <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-12">
      <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2">Chính sách xử lý dữ liệu cá nhân</h1>
      <p className="text-sm text-slate-500 mb-10">Phiên bản 2026-10 · Áp dụng theo Luật Bảo vệ dữ liệu cá nhân 2025 và Nghị định 356/2025/NĐ-CP</p>
      <div className="space-y-8">
        {SECTIONS.map((s) => (
          <section key={s.title}>
            <h2 className="text-lg font-black text-slate-900 mb-3">{s.title}</h2>
            <ul className="space-y-2 list-disc pl-5 text-slate-700 leading-relaxed">
              {s.body.map((b) => <li key={b}>{b}</li>)}
            </ul>
          </section>
        ))}
      </div>
    </main>
    <SharedFooter />
  </div>
);

export default PrivacyPage;
