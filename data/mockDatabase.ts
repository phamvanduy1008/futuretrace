
import { User, Comment, ProgressItem } from '../types';

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Dr. Nguyen An', avatar: 'https://i.pravatar.cc/150?img=11', role: 'AI Researcher', bio: 'Chuyên gia phân tích dữ liệu tại MIT.' },
  { id: 'u2', name: 'Thanh Hằng', avatar: 'https://i.pravatar.cc/150?img=32', role: 'Fintech Manager', bio: 'Hơn 10 năm kinh nghiệm trong lĩnh vực tài chính.' },
  { id: 'u3', name: 'Minh Tuấn', avatar: 'https://i.pravatar.cc/150?img=12', role: 'Digital Nomad', bio: 'Nhà thiết kế sản phẩm tự do.' },
  { id: 'u4', name: 'Elena Trần', avatar: 'https://i.pravatar.cc/150?img=44', role: 'Startup Founder', bio: 'Sáng lập FutureTech Lab.' }
];

export const DEFAULT_HISTORY = [
  { 
    id: "FT-8821", 
    title: "Tái định cư: Tokyo vs. London", 
    category: "SỰ NGHIỆP", 
    date: "12 TH10, 2023", 
    desc: "Mô phỏng đa biến về quỹ đạo nghề nghiệp 5 năm khi chuyển từ Việt Nam sang Tokyo.",
    reliability: 84, 
    color: "bg-emerald-500",
    type: "Positive",
    metrics: { career: 75, happiness: 60, roi: 45 },
    deepAnalysis: {
      swot: [
        { label: "ĐIỂM MẠNH", value: "Môi trường làm việc kỷ luật cao.", color: "emerald", type: "S" },
        { label: "ĐIỂM YẾU", value: "Rào cản ngôn ngữ và văn hóa.", color: "rose", type: "W" },
        { label: "CƠ HỘI", value: "Thị trường công nghệ phát triển mạnh.", color: "blue", type: "O" },
        { label: "THÁCH THỨC", value: "Chi phí sinh hoạt đắt đỏ.", color: "amber", type: "T" }
      ],
      resources: [
        { label: "THỜI GIAN", value: 40, unit: "%", icon: "schedule", ghostLabel: "TIME" },
        { label: "TÀI CHÍNH", value: 30, unit: "%", icon: "payments", ghostLabel: "DOLLAR" },
        { label: "NĂNG LƯỢNG", value: 30, unit: "%", icon: "bolt", ghostLabel: "ZAP" }
      ],
      sprint90: [
        { phase: "NGHIÊN CỨU & KẾT NỐI", tasks: ["Học tiếng Nhật cấp tốc", "Tìm mentor tại Tokyo", "Xác nhận bằng cấp"] },
        { phase: "CHUẨN BỊ LOGISTICS", tasks: ["Nộp Visa lao động", "Bán/Ký gửi tài sản tại VN", "Đàm phán gói trợ cấp chuyển vùng"] },
        { phase: "THỰC THI & THÍCH NGHI", tasks: ["Phỏng vấn trực tiếp", "Tìm nhà tại Minato-ku", "Đăng ký bảo hiểm xã hội"] }
      ],
      criticalAdvice: "Tập trung vào mạng lưới quan hệ địa phương và học văn hóa làm việc trước khi bay."
    }
  },
  { 
    id: "FT-9902", 
    title: "Chuyển hướng sang Freelance AI", 
    category: "CÔNG NGHỆ", 
    date: "05 TH12, 2023", 
    desc: "Nghỉ việc ngân hàng để tập trung làm dịch vụ tích hợp AI cho SMB.",
    reliability: 92, 
    color: "bg-blue-500",
    type: "Positive",
    metrics: { career: 88, happiness: 85, roi: 110 },
    deepAnalysis: {
      swot: [
        { label: "ĐIỂM MẠNH", value: "Kiến thức tài chính sâu rộng.", color: "emerald", type: "S" },
        { label: "ĐIỂM YẾU", value: "Chưa có thương hiệu cá nhân Freelance.", color: "rose", type: "W" },
        { label: "CƠ HỘI", value: "Nhu cầu tự động hóa AI đang bùng nổ.", color: "blue", type: "O" },
        { label: "THÁCH THỨC", value: "Cạnh tranh từ các Agency quốc tế.", color: "amber", type: "T" }
      ],
      resources: [
        { label: "THỜI GIAN", value: 50, unit: "%", icon: "schedule", ghostLabel: "TIME" },
        { label: "TÀI CHÍNH", value: 10, unit: "%", icon: "payments", ghostLabel: "DOLLAR" },
        { label: "NĂNG LƯỢNG", value: 40, unit: "%", icon: "bolt", ghostLabel: "ZAP" }
      ],
      sprint90: [
        { phase: "XÂY DỰNG NỀN TẢNG", tasks: ["Hoàn thiện Portfolio 5 dự án AI mẫu", "Thiết lập Profile LinkedIn chuyên nghiệp", "Học sâu về Prompt Engineering"] },
        { phase: "TIẾP CẬN THỊ TRƯỜNG", tasks: ["Gửi đề xuất cho 20 SMB tiềm năng", "Xây dựng gói dịch vụ chuẩn", "Tổ chức webinar chia sẻ giá trị"] },
        { phase: "TỐI ƯU VẬN HÀNH", tasks: ["Ký kết hợp đồng đầu tiên", "Tự động hóa quy trình chăm sóc khách", "Mở rộng mạng lưới đối tác cung ứng"] }
      ],
      criticalAdvice: "Đừng bán công nghệ, hãy bán giải pháp giúp doanh nghiệp tiết kiệm thời gian."
    }
  },
  { 
    id: "FT-1122", 
    title: "Đầu tư bất động sản Phan Thiết", 
    category: "TÀI CHÍNH", 
    date: "15 TH01, 2024", 
    desc: "Mua đất nền kỳ vọng cao tốc và sân bay hoàn thiện trong 24 tháng.",
    reliability: 72, 
    color: "bg-rose-500",
    type: "Risk",
    metrics: { career: 10, happiness: 40, roi: -15 },
    deepAnalysis: {
      swot: [
        { label: "ĐIỂM MẠNH", value: "Vị trí gần hạ tầng trọng điểm.", color: "emerald", type: "S" },
        { label: "ĐIỂM YẾU", value: "Tính thanh khoản thấp trong ngắn hạn.", color: "rose", type: "W" },
        { label: "CƠ HỘI", value: "Tăng giá mạnh khi cao tốc thông xe.", color: "blue", type: "O" },
        { label: "THÁCH THỨC", value: "Rủi rủi pháp lý và quy hoạch treo.", color: "amber", type: "T" }
      ],
      resources: [
        { label: "THỜI GIAN", value: 10, unit: "%", icon: "schedule", ghostLabel: "TIME" },
        { label: "TÀI CHÍNH", value: 80, unit: "%", icon: "payments", ghostLabel: "DOLLAR" },
        { label: "NĂNG LƯỢNG", value: 10, unit: "%", icon: "bolt", ghostLabel: "ZAP" }
      ],
      sprint90: [
        { phase: "THẨM ĐỊNH PHÁP LÝ", tasks: ["Kiểm tra quy hoạch tại sở tài nguyên", "Xác minh sổ đỏ gốc", "Tìm hiểu tranh chấp hàng xóm"] },
        { phase: "GIAO DỊCH & CHỐT", tasks: ["Đàm phán giá giảm 10% so với thị trường", "Công chứng sang tên", "Cắm mốc ranh giới"] },
        { phase: "QUẢN TRỊ RỦI RO", tasks: ["Thiết lập quỹ dự phòng thanh toán lãi", "Theo dõi tiến độ cao tốc hàng tháng", "Tìm kiếm môi giới địa phương uy tín"] }
      ],
      criticalAdvice: "Chỉ sử dụng tối đa 30% vốn vay cho thương vụ này để tránh đứt gãy dòng tiền."
    }
  },
  { 
    id: "FT-4455", 
    title: "Mở quán cà phê đặc sản (Specialty)", 
    category: "KHỞI NGHIỆP", 
    date: "20 TH02, 2024", 
    desc: "Mô hình cà phê trải nghiệm tại quận 1 với vốn đầu tư ban đầu 1.2 tỷ.",
    reliability: 65, 
    color: "bg-amber-500",
    type: "Risk",
    metrics: { career: 40, happiness: 75, roi: 5 },
    deepAnalysis: {
      swot: [
        { label: "ĐIỂM MẠNH", value: "Nguồn hạt trực tiếp từ nông trại.", color: "emerald", type: "S" },
        { label: "ĐIỂM YẾU", value: "Mặt bằng giá cao, cạnh tranh khốc liệt.", color: "rose", type: "W" },
        { label: "CƠ HỘI", value: "Xu hướng thưởng thức cà phê chất lượng tăng.", color: "blue", type: "O" },
        { label: "THÁCH THỨC", value: "Biến động giá nguyên liệu đầu vào.", color: "amber", type: "T" }
      ],
      resources: [
        { label: "THỜI GIAN", value: 35, unit: "%", icon: "schedule", ghostLabel: "TIME" },
        { label: "TÀI CHÍNH", value: 45, unit: "%", icon: "payments", ghostLabel: "DOLLAR" },
        { label: "NĂNG LƯỢNG", value: 20, unit: "%", icon: "bolt", ghostLabel: "ZAP" }
      ],
      sprint90: [
        { phase: "SETUP & ĐÀO TẠO", tasks: ["Thiết kế không gian quán", "Tuyển dụng & training Barista", "Lên menu Signature"] },
        { phase: "MARKETING KHAI TRƯƠNG", tasks: ["Booking KOLs review", "Chạy quảng cáo địa điểm", "Tổ chức Workshop nếm thử"] },
        { phase: "VẬN HÀNH & TỐI ƯU", tasks: ["Kiểm soát giá vốn (COGS)", "Xây dựng hệ thống khách hàng thân thiết", "Lấy feedback điều chỉnh menu"] }
      ],
      criticalAdvice: "Focus vào trải nghiệm khách hàng tại quán để tạo sự khác biệt với chuỗi lớn."
    }
  },
  { 
    id: "FT-7788", 
    title: "Học thạc sĩ Data Science tại Đức", 
    category: "GIÁO DỤC", 
    date: "01 TH03, 2024", 
    desc: "Tạm dừng công việc 2 năm để nâng cao chuyên môn tại TU Munich.",
    reliability: 95, 
    color: "bg-blue-500",
    type: "Positive",
    metrics: { career: 98, happiness: 55, roi: 200 },
    deepAnalysis: {
      swot: [
        { label: "ĐIỂM MẠNH", value: "Bằng cấp quốc tế danh giá.", color: "emerald", type: "S" },
        { label: "ĐIỂM YẾU", value: "Mất thu nhập trong 2 năm học.", color: "rose", type: "W" },
        { label: "CƠ HỘI", value: "Làm việc tại các tập đoàn công nghệ EU.", color: "blue", type: "O" },
        { label: "THÁCH THỨC", value: "Khó khăn trong việc học tiếng Đức.", color: "amber", type: "T" }
      ],
      resources: [
        { label: "THỜI GIAN", value: 60, unit: "%", icon: "schedule", ghostLabel: "TIME" },
        { label: "TÀI CHÍNH", value: 20, unit: "%", icon: "payments", ghostLabel: "DOLLAR" },
        { label: "NĂNG LƯỢNG", value: 20, unit: "%", icon: "bolt", ghostLabel: "ZAP" }
      ],
      sprint90: [
        { phase: "HỒ SƠ & VISA", tasks: ["Thi chứng chỉ APS/TestAS", "Hoàn thiện SOP/LOM", "Chứng minh tài chính"] },
        { phase: "NGÔN NGỮ & VĂN HÓA", tasks: ["Học tiếng Đức cấp tốc B1", "Tìm kiếm nhà ở Munich", "Kết nối cộng đồng du học sinh"] },
        { phase: "NHẬP HỌC & INTERN", tasks: ["Hoàn tất thủ tục ghi danh", "Tìm kiếm công việc Werkstudent", "Xây dựng mạng lưới nghiên cứu"] }
      ],
      criticalAdvice: "Hãy tận dụng thời gian học để đi thực tập tại các lab nghiên cứu của Siemens hoặc BMW."
    }
  }
];

export const MOCK_COMMUNITY = [
  {
    id: "CP-101",
    author: "Dr. Nguyen An",
    authorAvatar: MOCK_USERS[0].avatar,
    isAnonymous: false,
    date: "15 TH05, 2024",
    title: "Chiến lược Fintech 2025: Từ Quản lý sang Sáng lập",
    desc: "Phân tích kịch bản cho nhân sự cấp cao muốn bứt phá trong kỷ nguyên AI tài chính.",
    type: "Positive",
    category: "SỰ NGHIỆP",
    careerGrowth: 85,
    happiness: 70,
    roi: 120,
    likes: 142,
    commentsCount: 12,
    reliability: 96,
    deepAnalysis: {
      swot: [
        { label: "ĐIỂM MẠNH", value: "Mạng lưới quan hệ trong ngành ngân hàng.", color: "emerald", type: "S" },
        { label: "ĐIỂM YẾU", value: "Thiếu kỹ năng lập trình AI trực tiếp.", color: "rose", type: "W" },
        { label: "CƠ HỘI", value: "Thị trường Embedded Finance đang trống.", color: "blue", type: "O" },
        { label: "THÁCH THỨC", value: "Quy định pháp lý Fintech thắt chặt.", color: "amber", type: "T" }
      ],
      resources: [
        { label: "THỜI GIAN", value: 30, unit: "%", icon: "schedule", ghostLabel: "TIME" },
        { label: "TÀI CHÍNH", value: 40, unit: "%", icon: "payments", ghostLabel: "DOLLAR" },
        { label: "NĂNG LƯỢNG", value: 30, unit: "%", icon: "bolt", ghostLabel: "ZAP" }
      ],
      sprint90: [
        { phase: "THIẾT KẾ MÔ HÌNH", tasks: ["Xác định vấn đề cốt lõi của khách hàng", "Viết Business Plan chi tiết", "Tuyển CTO co-founder"] },
        { phase: "PHÁT TRIỂN MVP", tasks: ["Xây dựng bản thử nghiệm tính năng lõi", "Kiểm thử bảo mật dữ liệu", "Đăng ký giấy phép kinh doanh"] },
        { phase: "GỌI VỐN THỬ NGHIỆM", tasks: ["Thuyết trình trước 5 nhà đầu tư thiên thần", "Chạy chiến dịch marketing du kích", "Thu thập 100 người dùng đầu tiên"] }
      ],
      criticalAdvice: "Tập trung vào tính tuân thủ pháp lý ngay từ dòng code đầu tiên."
    }
  },
  {
    id: "CP-102",
    author: "Elena Trần",
    authorAvatar: MOCK_USERS[3].avatar,
    isAnonymous: false,
    date: "14 TH05, 2024",
    title: "Mô phỏng: Digital Nomad tại Bali vs Đà Lạt",
    desc: "Nghiên cứu về chi phí cơ hội và khả năng sáng tạo khi làm việc từ xa hoàn toàn.",
    type: "Neutral",
    category: "LỐI SỐNG",
    careerGrowth: 40,
    happiness: 95,
    roi: 20,
    likes: 89,
    commentsCount: 5,
    reliability: 88,
    deepAnalysis: {
      swot: [
        { label: "ĐIỂM MẠNH", value: "Tự do tuyệt đối về thời gian.", color: "emerald", type: "S" },
        { label: "ĐIỂM YẾU", value: "Khó duy trì sự kỷ luật cá nhân.", color: "rose", type: "W" },
        { label: "CƠ HỘI", value: "Tiếp cận cộng đồng Nomad quốc tế.", color: "blue", type: "O" },
        { label: "THÁCH THỨC", value: "Sự cô đơn và bất ổn định hạ tầng.", color: "amber", type: "T" }
      ],
      resources: [
        { label: "THỜI GIAN", value: 20, unit: "%", icon: "schedule", ghostLabel: "TIME" },
        { label: "TÀI CHÍNH", value: 30, unit: "%", icon: "payments", ghostLabel: "DOLLAR" },
        { label: "NĂNG LƯỢNG", value: 50, unit: "%", icon: "bolt", ghostLabel: "ZAP" }
      ],
      sprint90: [
        { phase: "LẬP KẾ HOẠCH DI CHUYỂN", tasks: ["Đặt vé và tìm chỗ ở dài hạn", "Mua bảo hiểm sức khỏe quốc tế", "Nâng cấp thiết bị làm việc di động"] },
        { phase: "THIẾT LẬP NHỊP SỐNG", tasks: ["Tìm kiếm Co-working space tốt nhất", "Xây dựng lịch biểu làm việc cố định", "Tham gia các buổi meetup cộng đồng"] },
        { phase: "ĐÁNH GIÁ HIỆU QUẢ", tasks: ["Đo lường năng suất công việc", "Cân đối chi phí sinh hoạt thực tế", "Quyết định có gia hạn lưu trú không"] }
      ],
      criticalAdvice: "Luôn có ít nhất 2 phương án internet dự phòng (SIM 4G/5G) tại mỗi điểm đến."
    }
  },
  {
    id: "CP-103",
    author: "Minh Tuấn",
    authorAvatar: MOCK_USERS[2].avatar,
    isAnonymous: false,
    date: "10 TH05, 2024",
    title: "Mô phỏng: Đầu tư Năng lượng Xanh cho gia đình",
    desc: "Lắp đặt hệ thống điện mặt trời và pin lưu trữ: ROI trong bao lâu?",
    type: "Positive",
    category: "TÀI CHÍNH",
    careerGrowth: 15,
    happiness: 80,
    roi: 35,
    likes: 56,
    commentsCount: 8,
    reliability: 92,
    deepAnalysis: {
      swot: [
        { label: "ĐIỂM MẠNH", value: "Tiết kiệm chi phí điện năng dài hạn.", color: "emerald", type: "S" },
        { label: "ĐIỂM YẾU", value: "Chi phí đầu tư ban đầu cao.", color: "rose", type: "W" },
        { label: "CƠ HỘI", value: "Chính sách mua điện dư của nhà nước.", color: "blue", type: "O" },
        { label: "THÁCH THỨC", value: "Bảo trì và hiệu suất pin sụt giảm.", color: "amber", type: "T" }
      ],
      resources: [
        { label: "THỜI GIAN", value: 10, unit: "%", icon: "schedule", ghostLabel: "TIME" },
        { label: "TÀI CHÍNH", value: 80, unit: "%", icon: "payments", ghostLabel: "DOLLAR" },
        { label: "NĂNG LƯỢNG", value: 10, unit: "%", icon: "bolt", ghostLabel: "ZAP" }
      ],
      sprint90: [
        { phase: "KHẢO SÁT & BÁO GIÁ", tasks: ["Đo diện tích mái và hướng nắng", "Liên hệ 3 nhà thầu uy tín", "Phân tích hóa đơn điện 12 tháng"] },
        { phase: "THI CÔNG & LẮP ĐẶT", tasks: ["Lắp đặt tấm pin & biến tần", "Đấu nối lưới điện quốc gia", "Cài đặt app theo dõi hiệu suất"] },
        { phase: "ĐÁNH GIÁ & BẢO TRÌ", tasks: ["Kiểm tra sản lượng thực tế", "Vệ sinh tấm pin định kỳ", "Tính toán thời gian hoàn vốn thực tế"] }
      ],
      criticalAdvice: "Nên đầu tư pin lưu trữ (Lithium) nếu muốn tự chủ năng lượng vào ban đêm."
    }
  },
  {
    id: "CP-104",
    author: "Jane Doe (Bạn)",
    authorAvatar: "https://i.pravatar.cc/150?img=10",
    isAnonymous: false,
    date: "08 TH05, 2024",
    title: "EdTech: Xây dựng khóa học AI cho trẻ em",
    desc: "Thị trường giáo dục sớm về tư duy máy tính tại Việt Nam.",
    type: "Positive",
    category: "GIÁO DỤC",
    careerGrowth: 75,
    happiness: 90,
    roi: 65,
    likes: 112,
    commentsCount: 24,
    reliability: 85,
    deepAnalysis: {
      swot: [
        { label: "ĐIỂM MẠNH", value: "Thị trường ngách tiềm năng lớn.", color: "emerald", type: "S" },
        { label: "ĐIỂM YẾU", value: "Nội dung giáo dục khó biên soạn.", color: "rose", type: "W" },
        { label: "CƠ HỘI", value: "Nhu cầu phụ huynh đầu tư công nghệ cho con.", color: "blue", type: "O" },
        { label: "THÁCH THỨC", value: "Các nền tảng học online quốc tế miễn phí.", color: "amber", type: "T" }
      ],
      resources: [
        { label: "THỜI GIAN", value: 50, unit: "%", icon: "schedule", ghostLabel: "TIME" },
        { label: "TÀI CHÍNH", value: 20, unit: "%", icon: "payments", ghostLabel: "DOLLAR" },
        { label: "NĂNG LƯỢNG", value: 30, unit: "%", icon: "bolt", ghostLabel: "ZAP" }
      ],
      sprint90: [
        { phase: "BIÊN SOẠN CURRICULUM", tasks: ["Thiết kế lộ trình học gamified", "Xây dựng các project mẫu sinh động", "Tham khảo chuẩn giáo dục K12"] },
        { phase: "QUAY DỰNG & NỀN TẢNG", tasks: ["Quay video bài giảng 4K", "Thiết lập hệ thống LMS", "Tích hợp AI trợ giảng cho bé"] },
        { phase: "LAUNCH & FEEDBACK", tasks: ["Mở lớp Trial cho 50 học viên", "Thu thập video testimonial", "Điều chỉnh độ khó của bài học"] }
      ],
      criticalAdvice: "Hãy làm cho việc học AI giống như chơi game để trẻ em không bị áp lực."
    }
  },
  {
    id: "CP-105",
    author: "Thanh Hằng",
    authorAvatar: MOCK_USERS[1].avatar,
    isAnonymous: false,
    date: "05 TH05, 2024",
    title: "E-commerce: Xây dựng Brand Mỹ phẩm Thuần chay",
    desc: "Thâm nhập thị trường Gen Z với cam kết bảo vệ môi trường.",
    type: "Neutral",
    category: "KINH DOANH",
    careerGrowth: 60,
    happiness: 65,
    roi: 40,
    likes: 245,
    commentsCount: 31,
    reliability: 90,
    deepAnalysis: {
      swot: [
        { label: "ĐIỂM MẠNH", value: "Concept sản phẩm đúng xu hướng.", color: "emerald", type: "S" },
        { label: "ĐIỂM YẾU", value: "Vòng đời sản phẩm ngắn, trend nhanh.", color: "rose", type: "W" },
        { label: "CƠ HỘI", value: "Bán hàng đa kênh TikTok/Shopee.", color: "blue", type: "O" },
        { label: "THÁCH THỨC", value: "Hàng giả và các đối thủ lớn phá giá.", color: "amber", type: "T" }
      ],
      resources: [
        { label: "THỜI GIAN", value: 20, unit: "%", icon: "schedule", ghostLabel: "TIME" },
        { label: "TÀI CHÍNH", value: 60, unit: "%", icon: "payments", ghostLabel: "DOLLAR" },
        { label: "NĂNG LƯỢNG", value: 20, unit: "%", icon: "bolt", ghostLabel: "ZAP" }
      ],
      sprint90: [
        { phase: "R&D & PACKAGING", tasks: ["Kiểm định chất lượng tại Lab", "Thiết kế bao bì tái chế", "Sản xuất lô hàng đầu tiên (MOQ)"] },
        { phase: "OMNICHANNEL SETUP", tasks: ["Xây dựng kênh TikTok Content", "Livestream bán hàng mỗi ngày", "Quản lý kho vận tự động"] },
        { phase: "BRANDING & SCALE", tasks: ["Hợp tác với KOCs uy tín", "Mở rộng đại lý phân phối", "Nghiên cứu sản phẩm bổ trợ"] }
      ],
      criticalAdvice: "Xây dựng cộng đồng người dùng trung thành thông qua kể chuyện (Storytelling)."
    }
  },
  {
    id: "CP-106",
    author: "Người dùng ẩn danh",
    isAnonymous: true,
    date: "01 TH05, 2024",
    title: "Kịch bản: Chuyển từ Software Engineer sang Crypto Researcher",
    desc: "Lộ trình học tập và thâm nhập thị trường Web3 đầy biến động.",
    type: "Risk",
    category: "CÔNG NGHỆ",
    careerGrowth: 90,
    happiness: 45,
    roi: 300,
    likes: 312,
    commentsCount: 45,
    reliability: 78,
    deepAnalysis: {
      swot: [
        { label: "ĐIỂM MẠNH", value: "Nền tảng code cứng cáp.", color: "emerald", type: "S" },
        { label: "ĐIỂM YẾU", value: "Thiếu kiến thức kinh tế vĩ mô.", color: "rose", type: "W" },
        { label: "CƠ HỘI", value: "Mức lương và thưởng cực cao.", color: "blue", type: "O" },
        { label: "THÁCH THỨC", value: "Thị trường biến động, rủi ro pháp lý.", color: "amber", type: "T" }
      ],
      resources: [
        { label: "THỜI GIAN", value: 40, unit: "%", icon: "schedule", ghostLabel: "TIME" },
        { label: "TÀI CHÍNH", value: 10, unit: "%", icon: "payments", ghostLabel: "DOLLAR" },
        { label: "NĂNG LƯỢNG", value: 50, unit: "%", icon: "bolt", ghostLabel: "ZAP" }
      ],
      sprint90: [
        { phase: "DEEP DIVE WEB3", tasks: ["Học Solidity/Rust", "Đọc 50 Whitepapers hàng đầu", "Tham gia các Hackathon"] },
        { phase: "NETWORK & RESEARCH", tasks: ["Viết blog phân tích On-chain", "Kết nối với các VC Web3", "Làm cộng tác viên dự án Open Source"] },
        { phase: "JOB SEARCH & PIVOT", tasks: ["Phỏng vấn các Foundation lớn", "Đàm phán gói token incentive", "Xây dựng danh tiếng trong cộng đồng"] }
      ],
      criticalAdvice: "Hãy học cách đọc dữ liệu On-chain trước khi bắt đầu đầu tư vào bất kỳ dự án nào."
    }
  }
];

export const MOCK_COMMENTS: Record<string, Comment[]> = {
  "CP-101": [
    { id: "c1", authorId: "u2", authorName: "Thanh Hằng", authorAvatar: MOCK_USERS[1].avatar, content: "Bản phân tích rất sâu sắc, đặc biệt là phần Chiến thuật cơ bản. Tôi sẽ thử áp dụng.", date: "16 TH05, 2024", likes: 12 },
    { id: "c2", authorId: "u3", authorName: "Minh Tuấn", authorAvatar: MOCK_USERS[2].avatar, content: "Bạn có tính đến rủi ro lạm phát trong ROI 120% không?", date: "17 TH05, 2024", likes: 4 }
  ],
  "CP-103": [
    { id: "c3", authorId: "u1", authorName: "Dr. Nguyen An", authorAvatar: MOCK_USERS[0].avatar, content: "Cảnh báo này rất kịp thời. Nhiều startup hiện nay chỉ là lớp vỏ trên OpenAI API.", date: "11 TH05, 2024", likes: 45 },
    { id: "c4", authorId: "u4", authorName: "Elena Trần", authorAvatar: MOCK_USERS[3].avatar, content: "Đúng vậy, sự phụ thuộc vào big tech là rủi ro lớn nhất.", date: "12 TH05, 2024", likes: 8 }
  ]
};

export const MATRIX_DATA = {
  columns: [
    { id: 'tokyo', label: 'Tokyo Research', color: 'text-emerald-500' },
    { id: 'london', label: 'London Hub', color: 'text-blue-500' },
    { id: 'startup', label: 'Local Startup', color: 'text-indigo-500' }
  ],
  rows: [
    {
      icon: 'trending_up',
      label: 'Tăng trưởng sự nghiệp',
      values: {
        tokyo: { type: 'bar', label: 'Chuyên sâu', value: 85, barColor: 'bg-emerald-500' },
        london: { type: 'bar', label: 'Quản lý', value: 75, barColor: 'bg-blue-600' },
        startup: { type: 'bar', label: 'Đa nhiệm', value: 90, barColor: 'bg-indigo-600' }
      }
    },
    {
      icon: 'payments',
      label: 'ROI Tài chính (5 năm)',
      values: {
        tokyo: { type: 'badge', value: '75%', color: 'bg-emerald-50 text-emerald-600 border-emerald-100', sub: 'Ổn định' },
        london: { type: 'badge', value: '45%', color: 'bg-blue-50 text-blue-600 border-blue-100', sub: 'Chi phí cao' },
        startup: { type: 'badge', value: '120%', color: 'bg-indigo-50 text-indigo-600 border-indigo-100', sub: 'Rủi ro cao' }
      }
    }
  ]
};

export const getHistory = () => {
  const stored = localStorage.getItem('futuretrace_history');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return parsed.length > 0 ? parsed : DEFAULT_HISTORY;
    } catch (e) {
      return DEFAULT_HISTORY;
    }
  }
  localStorage.setItem('futuretrace_history', JSON.stringify(DEFAULT_HISTORY));
  return DEFAULT_HISTORY;
};

export const getCommunity = () => {
  const stored = localStorage.getItem('futuretrace_community');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return parsed.length > 0 ? parsed : MOCK_COMMUNITY;
    } catch (e) {
      return MOCK_COMMUNITY;
    }
  }
  localStorage.setItem('futuretrace_community', JSON.stringify(MOCK_COMMUNITY));
  return MOCK_COMMUNITY;
};

export const getComments = (postId: string): Comment[] => {
  return MOCK_COMMENTS[postId] || [];
};

export const saveToHistory = (item: any, shareToCommunity: boolean) => {
  const currentHistory = getHistory();
  const updatedHistory = [item, ...currentHistory];
  localStorage.setItem('futuretrace_history', JSON.stringify(updatedHistory));

  if (shareToCommunity) {
    publishToCommunity(item);
  }
};

export const publishToCommunity = (item: any) => {
  const communityPost = {
    ...item,
    id: item.id.replace('FT', 'CP'),
    likes: 0,
    commentsCount: 0,
    careerGrowth: item.metrics?.career || 0,
    happiness: item.metrics?.happiness || 0,
    roi: item.metrics?.roi || 0
  };
  const currentCommunity = getCommunity();
  const updatedCommunity = [communityPost, ...currentCommunity];
  localStorage.setItem('futuretrace_community', JSON.stringify(updatedCommunity));
};

export const getProgress = (): ProgressItem[] => {
  const stored = localStorage.getItem('futuretrace_progress');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      return [];
    }
  }
  return [];
};

export const saveProgress = (progress: ProgressItem) => {
  const currentProgress = getProgress();
  const existingIndex = currentProgress.findIndex(p => p.scenarioId === progress.scenarioId);
  
  let updatedProgress;
  if (existingIndex >= 0) {
    updatedProgress = [...currentProgress];
    updatedProgress[existingIndex] = progress;
  } else {
    updatedProgress = [progress, ...currentProgress];
  }
  
  localStorage.setItem('futuretrace_progress', JSON.stringify(updatedProgress));
};

export const getProgressByScenarioId = (scenarioId: string, title?: string): ProgressItem | undefined => {
  const currentProgress = getProgress();
  if (scenarioId) {
    return currentProgress.find(p => p.scenarioId === scenarioId);
  }
  if (title) {
    return currentProgress.find(p => p.title === title);
  }
  return undefined;
};

export const deleteHistoryItem = (id: string) => {
  const currentHistory = getHistory();
  const updatedHistory = currentHistory.filter(item => item.id !== id);
  localStorage.setItem('futuretrace_history', JSON.stringify(updatedHistory));
};

export const deleteProgressItem = (id: string) => {
  const currentProgress = getProgress();
  const updatedProgress = currentProgress.filter(item => item.id !== id);
  localStorage.setItem('futuretrace_progress', JSON.stringify(updatedProgress));
};

export const MOCK_RISKS = [
  { 
    id: 1,
    title: "Kiệt sức Nguồn nhân lực", 
    desc: "Dự báo cạn kiệt tài nguyên trong 18 tháng do tốc độ tăng trưởng siêu tốc kéo dài.", 
    prob: 85, 
    status: "NGHIÊM TRỌNG", 
    statusColor: "text-rose-600 bg-rose-50 border-rose-100",
    time: "2 giờ trước",
    loss: "$1.2M",
    score: 8.4,
    icon: "psychology_alt"
  }
];
