import { ScenarioResult, SimulationData } from "../types";

export interface ParentReportData {
  scenarioTitle: string;
  scenarioType: "Positive" | "Neutral" | "Risk";
  executiveSummary: string;
  categoryTag: string; // VD: "Vừa học vừa làm (Hybrid)", "Công nghệ thông tin", "Kinh tế - Kinh doanh"...
  
  // 4 Trụ Cột Trăn Trở Của Cha Mẹ
  financialInvestment: {
    monthlyEstimate: string; // VD: "1.5 - 3.0 triệu VNĐ / tháng"
    fourYearTotal: string; // VD: "65 - 95 triệu VNĐ"
    costBreakdown: string[];
    adviceForParents: string;
  };

  financialIndependence: {
    expectedMilestone: string; // VD: "Cuối năm thứ 1 hoặc năm thứ 2"
    startingSalaryRange: string; // VD: "10 - 15 triệu VNĐ / tháng"
    fiveYearSalaryRange: string; // VD: "20 - 32 triệu VNĐ / tháng"
    selfSufficiencyVerdict: string;
  };

  employmentRiskAndPlanB: {
    mainRisks: string;
    contingencyPlanB: string; // Phương án dự phòng cụ thể
    marketDemandVerdict: string;
  };

  familyDialogueGuide: {
    question1: string;
    question2: string;
    question3: string;
    mentorTips: string;
  };

  // SWOT chuyển ngữ theo góc nhìn yêu thương của gia đình
  strengthsOfChild: string; // Con có thế mạnh gì
  areasToSupport: string; // Con cần gia đình hỗ trợ, động viên gì
  socialOpportunities: string; // Cơ hội thực tế ngoài xã hội
  emotionalSafetyNote: string; // Lời khuyên tâm lý cho cha mẹ
}

// Domain chính thức đã deploy trên cloud của hệ thống
export const CLOUD_APP_URL = "https://futuretrace.cloud";

/**
 * Trích xuất và chuẩn hóa tên huy hiệu chuyên ngành & kỹ năng đồng bộ 100% với từng kịch bản
 */
export function getScenarioSkillBadge(title: string, desc = "", decision = ""): string {
  // 1. Làm sạch tiêu đề (loại bỏ các hậu tố kỹ thuật như (Positive), (Neutral), (Risk), (Mặc định), v.v.)
  const cleanTitle = title
    .replace(/\s*\((positive|neutral|risk|tích cực|trung tính|rủi ro|mặc định|ưu tiên|tối ưu|thành công)\)/gi, "")
    .trim();

  const text = `${cleanTitle} ${desc} ${decision}`.toLowerCase();

  // 2. Nhận diện các chuyên ngành / kỹ năng cụ thể theo thứ tự ưu tiên
  if (text.includes("marketing sáng tạo")) {
    return "Chuyên ngành Marketing Sáng tạo";
  }
  if (text.includes("digital marketing") || text.includes("marketing số") || text.includes("quảng cáo trực tuyến")) {
    return "Kỹ năng Digital Marketing & Quảng cáo số";
  }
  if (text.includes("content") || text.includes("sáng tạo nội dung") || text.includes("copywriter")) {
    return "Kỹ năng Sáng tạo Nội dung (Content & Media)";
  }
  if (text.includes("ui/ux") || text.includes("thiết kế đồ họa") || text.includes("graphic design") || text.includes("mỹ thuật đa phương tiện")) {
    return "Chuyên ngành Thiết kế Đồ họa & UI/UX";
  }
  if (text.includes("vừa học vừa làm") || text.includes("hybrid") || text.includes("thực tập sớm")) {
    return "Mô hình Vừa học vừa làm (Hybrid Work-Study)";
  }
  if (text.includes("trí tuệ nhân tạo") || text.includes("ai engineer") || text.includes("machine learning") || text.includes("generative ai")) {
    return "Chuyên ngành Trí tuệ Nhân tạo (AI & Machine Learning)";
  }
  if (text.includes("khoa học dữ liệu") || text.includes("data science") || text.includes("data analyst") || text.includes("phân tích dữ liệu")) {
    return "Chuyên môn Phân tích Dữ liệu (Data Analytics)";
  }
  if (text.includes("an toàn thông tin") || text.includes("an ninh mạng") || text.includes("cyber security") || text.includes("hacker mũ trắng")) {
    return "Chuyên ngành An toàn Thông tin & An ninh mạng";
  }
  if (text.includes("phát triển phần mềm") || text.includes("kỹ sư phần mềm") || text.includes("software engineer") || text.includes("lập trình web") || text.includes("lập trình mobile") || text.includes("fullstack")) {
    return "Kỹ năng Lập trình & Kỹ thuật Phần mềm";
  }
  if (text.includes("it") || text.includes("công nghệ thông tin") || text.includes("khoa học máy tính")) {
    return "Khối ngành Công nghệ Thông tin (IT)";
  }
  if (text.includes("logistics") || text.includes("chuỗi cung ứng") || text.includes("xuất nhập khẩu") || text.includes("supply chain")) {
    return "Chuyên ngành Logistics & Chuỗi cung ứng";
  }
  if (text.includes("thương mại điện tử") || text.includes("e-commerce")) {
    return "Chuyên ngành Thương mại Điện tử (E-Commerce)";
  }
  if (text.includes("tài chính") || text.includes("ngân hàng") || text.includes("fintech") || text.includes("đầu tư tài chính")) {
    return "Khối ngành Tài chính - Ngân hàng & Fintech";
  }
  if (text.includes("kế toán") || text.includes("kiểm toán")) {
    return "Chuyên môn Kế toán - Kiểm toán (CPA/ACCA)";
  }
  if (text.includes("quản trị kinh doanh") || text.includes("kinh doanh quốc tế") || text.includes("quản trị doanh nghiệp")) {
    return "Khối ngành Quản trị Kinh doanh Quốc tế";
  }
  if (text.includes("khởi nghiệp") || text.includes("startup") || text.includes("kinh doanh riêng")) {
    return "Kỹ năng Khởi nghiệp & Vận hành Doanh nghiệp";
  }
  if (text.includes("du học") || text.includes("nước ngoài") || text.includes("quốc tế") || text.includes("overseas")) {
    return "Lộ trình Du học & Đào tạo Quốc tế";
  }
  if (text.includes("bác sĩ") || text.includes("y khoa") || text.includes("y đa khoa")) {
    return "Khối ngành Bác sĩ Y khoa & Lâm sàng";
  }
  if (text.includes("dược") || text.includes("dược sĩ")) {
    return "Chuyên ngành Dược học & Khoa học Dược";
  }
  if (text.includes("nha khoa") || text.includes("răng hàm mặt")) {
    return "Chuyên khoa Răng Hàm Mặt & Nha khoa";
  }
  if (text.includes("điều dưỡng") || text.includes("y tế công cộng")) {
    return "Khối ngành Điều dưỡng & Chăm sóc Y tế";
  }
  if (text.includes("luật") || text.includes("pháp lý") || text.includes("pháp chế")) {
    return "Khối ngành Luật & Pháp lý Doanh nghiệp";
  }
  if (text.includes("du lịch") || text.includes("khách sạn") || text.includes("lữ hành")) {
    return "Khối ngành Quản trị Du lịch & Khách sạn";
  }
  if (text.includes("kiến trúc") || text.includes("xây dựng") || text.includes("nội thất")) {
    return "Khối ngành Kiến trúc & Thiết kế Nội thất";
  }
  if (text.includes("ngôn ngữ anh") || text.includes("biên phiên dịch") || text.includes("tiếng anh thương mại")) {
    return "Chuyên ngành Ngôn ngữ Anh & Biên phiên dịch";
  }
  if (text.includes("ngôn ngữ nhật") || text.includes("tiếng nhật")) {
    return "Chuyên ngành Ngôn ngữ & Văn hóa Nhật Bản";
  }
  if (text.includes("ngôn ngữ hàn") || text.includes("tiếng hàn")) {
    return "Chuyên ngành Ngôn ngữ & Văn hóa Hàn Quốc";
  }
  if (text.includes("ngôn ngữ trung") || text.includes("tiếng trung")) {
    return "Chuyên ngành Ngôn ngữ Trung Quốc";
  }
  if (text.includes("sư phạm") || text.includes("giáo dục") || text.includes("giảng dạy")) {
    return "Khối ngành Sư phạm & Giáo dục";
  }
  if (text.includes("kỹ thuật ô tô") || text.includes("cơ khí") || text.includes("tự động hóa") || text.includes("robotics")) {
    return "Khối ngành Kỹ thuật & Tự động hóa";
  }
  if (text.includes("marketing")) {
    return "Chuyên ngành Marketing & Truyền thông";
  }

  // 3. Nếu tiêu đề đã làm sạch có ý nghĩa cụ thể (ngắn gọn), hiển thị trực tiếp chuyên môn đó
  if (cleanTitle && cleanTitle.length <= 40) {
    return `Chuyên ngành: ${cleanTitle}`;
  }

  return "Định hướng Chuyên môn & Kỹ năng";
}

/**
 * Phân tích ngành nghề và định hướng từ tiêu đề kịch bản và câu hỏi của người dùng
 */
function detectScenarioCategory(title: string, desc: string, decision: string): string {
  const text = `${title} ${desc} ${decision}`.toLowerCase();

  // 1. Vừa học vừa làm / Thực chiến sớm
  if (text.includes("vừa học vừa làm") || text.includes("hybrid") || text.includes("thực tập sớm") || text.includes("đi làm sớm") || text.includes("học nghề")) {
    return "hybrid";
  }
  // 2. Marketing / Truyền thông / Sáng tạo nội dung (Ưu tiên nhận diện chuẩn)
  if (text.includes("marketing") || text.includes("quảng cáo") || text.includes("truyền thông") || text.includes("content") || text.includes("digital marketing") || text.includes("branding") || text.includes("pr")) {
    return "marketing";
  }
  // 3. Du học / Quốc tế
  if (text.includes("du học") || text.includes("nước ngoài") || text.includes("quốc tế") || text.includes("overseas") || text.includes("ielts")) {
    return "abroad";
  }
  // 4. Công nghệ thông tin / AI / Phần mềm
  if (text.includes("công nghệ") || text.includes("it") || text.includes("phần mềm") || text.includes("ai") || text.includes("lập trình") || text.includes("khoa học máy tính") || text.includes("an toàn thông tin")) {
    return "tech";
  }
  // 5. Y khoa / Dược học / Sức khỏe (Dùng từ khóa chính xác, tuyệt đối không kiểm tra ký tự 'y' hay 'nha' đơn lẻ)
  if (/(bác sĩ|dược học|dược sĩ|y khoa|y tế|bệnh viện|điều dưỡng|nha khoa|răng hàm mặt|y học|khám chữa bệnh)/i.test(text)) {
    return "medical";
  }
  // 6. Khởi nghiệp / Startup
  if (text.includes("khởi nghiệp") || text.includes("startup") || text.includes("kinh doanh riêng") || text.includes("freelance")) {
    return "startup";
  }
  // 7. Kinh tế / Quản trị / Tài chính / Ngân hàng
  if (text.includes("kinh tế") || text.includes("quản trị") || text.includes("tài chính") || text.includes("ngân hàng") || text.includes("kế toán") || text.includes("thương mại")) {
    return "business";
  }
  // 8. Sư phạm / Giáo dục
  if (text.includes("sư phạm") || text.includes("giáo dục") || text.includes("giáo viên") || text.includes("giảng viên")) {
    return "education";
  }
  // 9. Ngôn ngữ / Ngoại ngữ
  if (text.includes("ngôn ngữ") || text.includes("tiếng anh") || text.includes("phiên dịch") || text.includes("ngoại giao")) {
    return "language";
  }
  return "general";
}

/**
 * Tạo bản báo cáo "Thấu Kính Phụ Huynh" đồng bộ chính xác với từng kế hoạch kịch bản
 */
export function generateParentReport(
  scenario: Partial<ScenarioResult> | undefined,
  context?: SimulationData
): ParentReportData {
  const type = scenario?.type || "Neutral";
  const title = scenario?.title || "Lộ trình học tập & sự nghiệp tương lai";
  const desc = scenario?.description || "";
  const decision = context?.decision || "";
  const swot = scenario?.deepAnalysis?.swot || [];
  const roiDetails = scenario?.roiDetails;

  const strengthItem = swot.find((s) => s.type === "S")?.value || "";
  const weaknessItem = swot.find((s) => s.type === "W")?.value || "";
  const opportunityItem = swot.find((s) => s.type === "O")?.value || "";
  const threatItem = swot.find((s) => s.type === "T")?.value || "";
  const customMitigation = scenario?.deepAnalysis?.riskMitigation || "";

  const category = detectScenarioCategory(title, desc, decision);

  // Đồng bộ huy hiệu kịch bản 100% theo chuyên ngành và kỹ năng
  let categoryTag = (scenario as any)?.categoryTag || getScenarioSkillBadge(title, desc, decision);
  let monthlyEstimate = "3.5 - 5.0 triệu VNĐ / tháng";
  let fourYearTotal = "140 - 190 triệu VNĐ (tổng 4 năm)";
  let costBreakdown = [
    "Học phí đại học chính quy: ~22 - 32 triệu VNĐ/năm.",
    "Chi phí sinh hoạt & chỗ ở: ~2.8 - 4.0 triệu VNĐ/tháng.",
    "Trang bị công cụ học tập cơ bản: ~15 - 20 triệu VNĐ ban đầu."
  ];
  let adviceForParents = "Gia đình có thể cân đối khoản ngân sách tích lũy từng học kỳ. Con có thể chủ động săn học bổng khuyến khích để san sẻ chi phí.";
  let expectedMilestone = "Năm thứ 3 hoặc sau khi tốt nghiệp (khoảng 3.5 - 4 năm)";
  let startingSalaryRange = "9 - 14 triệu VNĐ / tháng";
  let fiveYearSalaryRange = "18 - 28 triệu VNĐ / tháng";
  let selfSufficiencyVerdict = "Con sẽ bắt đầu trang trải được sinh hoạt cá nhân từ năm 3 và tự lập tài chính hoàn toàn sau khi nhận bằng tốt nghiệp.";
  let mainRisks = threatItem || "Cạnh tranh tuyển dụng tăng cao, thị trường yêu cầu kỹ năng thực hành và ngoại ngữ liên tục đổi mới.";
  let contingencyPlanB = customMitigation || "Nếu thị trường việc làm biến động, con có thể mở rộng sang các vị trí liên ngành như quản trị dự án, tư vấn hoặc dịch vụ khách hàng chuyên sâu.";
  let marketDemandVerdict = "Xã hội luôn cần nhân sự có kỹ năng thật, thái độ làm việc kỷ luật và khả năng thích ứng linh hoạt.";
  let question1 = `Ba mẹ thấy con rất quan tâm đến hướng đi '${title}'. Điều gì ở ngành này khiến con yêu thích nhất?`;
  let question2 = "Nếu gặp giai đoạn học tập áp lực hoặc khó khăn tài chính, con dự định sẽ vượt qua như thế nào?";
  let question3 = "Con đã tìm hiểu xem các anh chị đi trước trong ngành này sau 3 - 5 năm thì công việc và thu nhập ra sao chưa?";
  let mentorTips = "Thay vì vội vàng đánh giá, cha mẹ hãy đóng vai trò là điểm tựa lắng nghe, đặt câu hỏi gợi mở để con tự tin chia sẻ kế hoạch của mình.";

  // ================= TÙY BIẾN SÂU THEO TỪNG KỊCH BẢN CỤ THỂ =================

  if (category === "hybrid") {
    if (!categoryTag || categoryTag.includes("Định hướng")) {
      categoryTag = "Mô hình Vừa học vừa làm (Hybrid Work-Study)";
    }
    monthlyEstimate = "1.5 - 3.0 triệu VNĐ / tháng (Rất nhẹ gánh cho gia đình)";
    fourYearTotal = "65 - 95 triệu VNĐ (Tiết kiệm 50% nhờ có thu nhập sớm)";
    costBreakdown = [
      "Học phí tín chỉ theo học phần linh hoạt: ~14 - 20 triệu VNĐ/năm.",
      "Tiền ăn uống, sinh hoạt: Con tự chi trả 50% - 70% từ trợ cấp phụ việc/thực tập.",
      "Chi phí đi lại làm việc (xăng xe, phương tiện): ~600.000 - 1.0 triệu VNĐ/tháng."
    ];
    adviceForParents = "Gia đình không phải lo lắng quá nhiều về gánh nặng học phí. Điều quan trọng nhất là nhắc nhở con giữ gìn sức khỏe, ăn uống đủ chất, tránh tham làm thêm quá sức dẫn đến kiệt sức hoặc nợ môn học.";
    expectedMilestone = "Ngay từ cuối năm thứ 1 hoặc đầu năm 2 (Chỉ sau 1.5 - 2 năm)";
    startingSalaryRange = "10 - 15 triệu VNĐ / tháng (Được nhận làm nhân viên chính thức)";
    fiveYearSalaryRange = "20 - 32 triệu VNĐ / tháng";
    selfSufficiencyVerdict = "Con tự lập tài chính sớm nhất so với bạn bè cùng trang lứa. Khi tốt nghiệp, con đã tích lũy sẵn 1 - 2 năm kinh nghiệm thực chiến thực tế, một lợi thế tuyển dụng vượt trội.";
    mainRisks = threatItem || "Nguy cơ quá tải về thể lực và tinh thần khi vừa gánh deadline công ty vừa phải ôn thi, dễ bị phân tâm kéo dài thời gian tốt nghiệp.";
    contingencyPlanB = customMitigation || "Nếu lịch học quá căng thẳng, con sẽ chủ động đăng ký giãn môn (giảm tín chỉ trong kỳ đó), hoặc đề xuất công ty chuyển sang làm bán thời gian (Part-time / Ca linh hoạt) trong mùa thi.";
    marketDemandVerdict = "Doanh nghiệp hiện nay cực kỳ ưu tiên tuyển dụng các bạn trẻ có kinh nghiệm cọ xát thực tế hơn là bằng cấp lý thuyết thuần túy.";
    question1 = `Ba mẹ thấy con rất nỗ lực vừa học vừa làm. Công việc thực tế ở công ty con thấy có phù hợp và bổ trợ tốt cho ngành học không?`;
    question2 = `Lịch làm việc và ôn thi có bị trùng nhau không con? Con có bị mệt hay thiếu ngủ không, ăn uống sinh hoạt thế nào?`;
    question3 = `Công ty có lộ trình đào tạo và ký hợp đồng chính thức để con gắn bó lâu dài sau khi nhận bằng không con?`;
    mentorTips = "Đừng trách con 'sao không tập trung học cho xong rồi hẵng đi làm'. Hãy công nhận tinh thần tự lập đáng quý của con, đồng thời làm hậu phương nhắc nhở con ngủ đủ giấc và phân bổ thời gian hợp lý.";
  } 
  else if (category === "tech") {
    if (!categoryTag || categoryTag.includes("Định hướng")) {
      categoryTag = "Khối ngành Công nghệ Thông tin (IT & AI)";
    }
    monthlyEstimate = "3.8 - 5.8 triệu VNĐ / tháng";
    fourYearTotal = "150 - 210 triệu VNĐ (cho 4 năm)";
    costBreakdown = [
      "Học phí đại học CNTT chính quy: ~28 - 38 triệu VNĐ/năm.",
      "Chi phí sinh hoạt tại thành phố lớn: ~3.0 - 4.5 triệu VNĐ/tháng.",
      "Trang bị Laptop cấu hình cao & phần mềm chuyên sâu: ~20 - 28 triệu VNĐ (đầu tư ban đầu)."
    ];
    adviceForParents = "Khoản đầu tư ban đầu cho máy tính là thiết yếu. Con có thể sớm có thu nhập thực tập từ năm thứ 2 hoặc năm 3 để tự trang trải sinh hoạt.";
    expectedMilestone = "Năm thứ 2.5 - 3 (sớm hơn mặt bằng chung nhờ thực tập Tech)";
    startingSalaryRange = "12 - 18 triệu VNĐ / tháng";
    fiveYearSalaryRange = "25 - 45 triệu VNĐ / tháng";
    selfSufficiencyVerdict = "Con có khả năng tự lập tài chính nhanh chóng nhờ nhu cầu nhân lực công nghệ cao và mức lương khởi điểm thuộc top đầu thị trường.";
    mainRisks = threatItem || "Công nghệ và AI thay đổi từng tháng; áp lực phải tự học liên tục để không bị tụt hậu kiến thức.";
    contingencyPlanB = customMitigation || "Không chỉ học code đơn thuần, con trang bị thêm kỹ năng phân tích nghiệp vụ (BA), kiểm thử phần mềm (QA) hoặc tư vấn giải pháp IT để luôn có nhiều cửa rộng mở.";
    marketDemandVerdict = "Chuyển đổi số và AI đang bùng nổ toàn cầu, nhu cầu kỹ sư công nghệ có năng lực thực chiến luôn ở mức cao.";
    question1 = `Ba mẹ nghe nói ngành công nghệ giờ có AI rất phát triển, con định học chuyên sâu vào mảng nào để tạo lợi thế riêng?`;
    question2 = `Con có cần nâng cấp máy tính hay tài liệu gì đặc biệt để học tập hiệu quả hơn không?`;
    question3 = `Con đã tham gia dự án thực tế nào cùng thầy cô hay bạn bè chưa? Kể cho ba mẹ nghe sản phẩm con làm nhé!`;
    mentorTips = "Khuyến khích con rèn luyện thêm thể thao và kỹ năng giao tiếp, tránh ngồi trước màn hình máy tính quá nhiều giờ liên tục.";
  }
  else if (category === "abroad") {
    if (!categoryTag || categoryTag.includes("Định hướng")) {
      categoryTag = "Lộ trình Du học & Đào tạo Quốc tế";
    }
    monthlyEstimate = "22 - 38 triệu VNĐ / tháng (Tùy quốc gia & trường)";
    fourYearTotal = "650 triệu - 1.4 tỷ VNĐ (Khoản đầu tư lớn cho tương lai)";
    costBreakdown = [
      "Học phí quốc tế: ~180 - 320 triệu VNĐ/năm.",
      "Sinh hoạt phí, nhà ở & bảo hiểm nước ngoài: ~15 - 25 triệu VNĐ/tháng.",
      "Chi phí visa, vé máy bay & bảo chứng tài chính: ~40 - 60 triệu VNĐ ban đầu."
    ];
    adviceForParents = "Gia đình cần có kế hoạch ngoại tệ và quỹ dự phòng biến động tỷ giá. Con cần được rèn thói quen chi tiêu kỷ luật và săn học bổng giảm học phí.";
    expectedMilestone = "Sau khi tốt nghiệp và tìm việc làm tại bản địa (khoảng 3.5 - 4 năm)";
    startingSalaryRange = "30 - 55 triệu VNĐ/tháng (nếu ở lại) hoặc 18 - 28 triệu VNĐ/tháng (tại VN)";
    fiveYearSalaryRange = "50 - 90+ triệu VNĐ / tháng";
    selfSufficiencyVerdict = "Thời gian đầu phụ thuộc lớn vào tài chính gia đình, nhưng sau khi ra trường khả năng hoàn vốn rất nhanh nhờ thu nhập ngoại tệ.";
    mainRisks = threatItem || "Rào cản văn hóa, áp lực tâm lý khi sống xa nhà và chính sách visa lao động của nước sở tại có thể siết chặt.";
    contingencyPlanB = customMitigation || "Nếu gặp khó khăn về visa định cư, con hoàn toàn có thể trở về Việt Nam làm việc cho các tập đoàn đa quốc gia với lợi thế ngoại ngữ và tư duy quốc tế vượt trội.";
    marketDemandVerdict = "Nhân sự có bằng cấp quốc tế, thông thạo ngoại ngữ và tác phong chuyên nghiệp luôn được các tập đoàn săn đón.";
    question1 = `Con đã tìm hiểu kỹ về đời sống và văn hóa nơi con dự định đến chưa? Con thấy tự tin nhất ở điểm nào?`;
    question2 = `Về mặt chi tiêu hàng tháng ở bên đó, con đã lên kế hoạch tiết kiệm và tự nấu ăn như thế nào?`;
    question3 = `Nếu nhớ nhà hoặc gặp chuyện căng thẳng ở xứ người, con sẽ chia sẻ với ai để giữ tinh thần vững vàng?`;
    mentorTips = "Sự tin tưởng và những cuộc gọi ấm áp từ gia đình là liều thuốc tinh thần lớn nhất giúp con vượt qua cảm giác cô đơn nơi đất khách.";
  }
  else if (category === "medical") {
    if (!categoryTag || categoryTag.includes("Định hướng")) {
      categoryTag = "Khối ngành Y khoa & Chăm sóc Sức khỏe";
    }
    monthlyEstimate = "5.0 - 8.0 triệu VNĐ / tháng";
    fourYearTotal = "260 - 450 triệu VNĐ (Đào tạo dài hạn 5 - 6 năm)";
    costBreakdown = [
      "Học phí trường đại học y dược chính quy: ~35 - 55 triệu VNĐ/năm.",
      "Sinh hoạt phí & chi phí thực tập bệnh viện: ~3.5 - 5.0 triệu VNĐ/tháng.",
      "Giáo trình, tài liệu chuyên khảo & dụng cụ thực hành: ~15 - 20 triệu VNĐ."
    ];
    adviceForParents = "Đây là con đường cao quý nhưng đòi hỏi gia đình chuẩn bị nguồn tài chính bền bỉ trong suốt 5 - 6 năm. Cần chăm sóc thể lực tốt cho con trong các đợt trực đêm.";
    expectedMilestone = "Sau 5 - 6 năm (Chậm hơn các ngành khác nhưng cực kỳ bền vững)";
    startingSalaryRange = "9 - 15 triệu VNĐ / tháng (Năm đầu tích lũy chứng chỉ hành nghề)";
    fiveYearSalaryRange = "28 - 55+ triệu VNĐ / tháng";
    selfSufficiencyVerdict = "Thu nhập tăng dần theo thâm niên và tay nghề. Càng lớn tuổi, vị thế và thu nhập của con trong ngành y tế càng vững chắc.";
    mainRisks = threatItem || "Thời gian học kéo dài, cường độ làm việc trực viện cao, cần 18 tháng thực hành sau ra trường mới có chứng chỉ hành nghề.";
    contingencyPlanB = customMitigation || "Trong thời gian hoàn thiện chứng chỉ, con có thể làm việc tại các trung tâm chẩn đoán, phòng khám tư nhân hoặc các công ty dược phẩm / thiết bị y tế để có thu nhập tốt.";
    marketDemandVerdict = "Xã hội ngày càng già hóa và chú trọng sức khỏe, nhu cầu nhân lực y tế chuyên môn cao là vĩnh viễn không bao giờ lỗi thời.";
    question1 = `Học ngành y rất vất vả và kéo dài nhiều năm, điều gì thôi thúc con quyết tâm chọn con đường này?`;
    question2 = `Những đợt trực đêm ở viện con có ăn ngủ được không? Ba mẹ có thể bồi dưỡng thêm món gì cho con?`;
    question3 = `Con có định hướng thi nội trú hay làm chuyên khoa nào sau khi tốt nghiệp chưa?`;
    mentorTips = "Đừng nôn nóng so sánh lương của con với bạn bè làm kinh tế hay công nghệ trong vài năm đầu. Nghề y cần thời gian tôi luyện để trở thành chuyên gia.";
  }
  else if (category === "startup") {
    if (!categoryTag || categoryTag.includes("Định hướng")) {
      categoryTag = "Kỹ năng Khởi nghiệp & Vận hành Doanh nghiệp";
    }
    monthlyEstimate = "4.0 - 6.5 triệu VNĐ / tháng";
    fourYearTotal = "160 - 240 triệu VNĐ (Kèm vốn thử nghiệm sản phẩm ban đầu)";
    costBreakdown = [
      "Học phí chương trình đào tạo & chứng chỉ thực chiến: ~25 - 35 triệu VNĐ/năm.",
      "Chi phí sinh hoạt tối ưu: ~3.0 - 4.5 triệu VNĐ/tháng.",
      "Vốn thử nghiệm dự án ban đầu (công cụ, quảng cáo thử): ~25 - 40 triệu VNĐ."
    ];
    adviceForParents = "Khởi nghiệp cần nguồn vốn thử sai trong tầm kiểm soát. Thống nhất với con hạn mức đầu tư rõ ràng để con rèn luyện tư duy trách nhiệm tài chính.";
    expectedMilestone = "Năm thứ 2 - 3 nếu mô hình đạt điểm hòa vốn";
    startingSalaryRange = "8 - 18 triệu VNĐ / tháng (Tùy theo doanh số dự án)";
    fiveYearSalaryRange = "25 - 60+ triệu VNĐ / tháng";
    selfSufficiencyVerdict = "Thu nhập có thể đột phá cao nếu nắm bắt đúng cơ hội thị trường, nhưng đòi hỏi con có bản lĩnh chịu áp lực giỏi.";
    mainRisks = threatItem || "Dòng tiền không đều trong những tháng đầu, rủi ro sản phẩm chưa được thị trường chấp nhận.";
    contingencyPlanB = customMitigation || "Duy trì một nguồn thu bán thời gian (freelance / tư vấn) song song để trang trải cuộc sống cơ bản, tuyệt đối không dốc toàn bộ vốn khi chưa kiểm chứng nhu cầu khách hàng.";
    marketDemandVerdict = "Kinh tế số mở ra cơ hội lớn cho các mô hình kinh doanh tinh gọn và sáng tạo nội dung độc lập.";
    question1 = `Dự án kinh doanh của con giải quyết vấn đề gì cho khách hàng mà đối thủ chưa làm tốt?`;
    question2 = `Nếu kế hoạch ban đầu không đạt doanh số như mong đợi, con có kế hoạch dự phòng ra sao?`;
    question3 = `Con đã có những người bạn đồng hành tin cậy để chia sẻ công việc cùng nhau chưa?`;
    mentorTips = "Hãy là nơi con tìm về bình yên sau những ngày đàm phán căng thẳng. Động viên con rằng mỗi lần thử nghiệm chưa thành công đều là bài học quý giá.";
  }
  else if (category === "business") {
    if (!categoryTag || categoryTag.includes("Định hướng")) {
      categoryTag = "Khối ngành Quản trị Kinh doanh & Tài chính";
    }
    monthlyEstimate = "3.5 - 5.2 triệu VNĐ / tháng";
    fourYearTotal = "135 - 185 triệu VNĐ (cho 4 năm)";
    costBreakdown = [
      "Học phí đại học khối ngành kinh tế: ~24 - 34 triệu VNĐ/năm.",
      "Chi phí sinh hoạt & giao lưu kỹ năng mềm: ~3.0 - 4.2 triệu VNĐ/tháng.",
      "Học chứng chỉ quốc tế (CFA, ACCA, Digital Marketing, Data): ~15 - 22 triệu VNĐ."
    ];
    adviceForParents = "Khối ngành kinh tế đòi hỏi con năng nổ giao tiếp và tham gia câu lạc bộ, cuộc thi học thuật để làm đẹp hồ sơ ứng tuyển.";
    expectedMilestone = "Năm thứ 3 hoặc sau khi tốt nghiệp (khoảng 3 - 4 năm)";
    startingSalaryRange = "9 - 14 triệu VNĐ / tháng";
    fiveYearSalaryRange = "20 - 35 triệu VNĐ / tháng";
    selfSufficiencyVerdict = "Con sẽ nhanh chóng tự trang trải được chi tiêu và có nhiều cơ hội thăng tiến lên các vị trí quản lý sau 3 - 5 năm nỗ lực.";
    mainRisks = threatItem || "Số lượng sinh viên ra trường đông, cạnh tranh cao nếu chỉ có bằng cấp thông thường mà thiếu kỹ năng phân tích dữ liệu hoặc ngoại ngữ.";
    contingencyPlanB = customMitigation || "Tích lũy song song kỹ năng phân tích số liệu (SQL, PowerBI, Excel nâng cao) và tiếng Anh giao tiếp để ứng tuyển vào các công ty đa quốc gia thay vì chỉ làm vị trí văn phòng hành chính thông thường.";
    marketDemandVerdict = "Doanh nghiệp luôn tìm kiếm nhân sự kinh tế nhạy bén, biết ứng dụng công nghệ để tối ưu hóa chi phí và tăng trưởng doanh thu.";
    question1 = `Trong khối ngành kinh tế, con thích nhất là mảng nào (Marketing, Tài chính, Bán hàng hay Nhân sự)?`;
    question2 = `Con có dự định học thêm ngoại ngữ hay chứng chỉ nghề nghiệp nào trong 2 năm đầu không?`;
    question3 = `Con đã tham gia câu lạc bộ hay hoạt động ngoại khóa nào ở trường để rèn luyện kỹ năng làm việc nhóm chưa?`;
    mentorTips = "Khuyến khích con thực tập sớm từ năm thứ 2 hoặc 3 để hiểu văn hóa công sở và xây dựng mạng lưới quan hệ đồng nghiệp.";
  }
  else if (category === "marketing") {
    if (!categoryTag || categoryTag.includes("Định hướng")) {
      categoryTag = "Chuyên ngành Marketing & Truyền thông";
    }
    monthlyEstimate = "3.2 - 4.8 triệu VNĐ / tháng";
    fourYearTotal = "130 - 175 triệu VNĐ (cho 4 năm)";
    costBreakdown = [
      "Học phí chuyên ngành Marketing / Truyền thông: ~22 - 32 triệu VNĐ/năm.",
      "Chi phí sinh hoạt & hoạt động kết nối giao lưu: ~3.0 - 4.2 triệu VNĐ/tháng.",
      "Công cụ sáng tạo & chứng chỉ thực chiến (Canva Pro, Adobe, Google/Meta Ads): ~12 - 18 triệu VNĐ."
    ];
    adviceForParents = "Ngành Marketing đòi hỏi con năng động và cọ xát thực tế nhiều. Gia đình hãy tạo điều kiện cho con tham gia các dự án ngoại khóa, câu lạc bộ hoặc làm cộng tác viên từ sớm để tích lũy hồ sơ kinh nghiệm thực tế (portfolio).";
    expectedMilestone = "Năm thứ 2.5 - 3 (sinh viên Marketing thường có thu nhập thực tập từ sớm)";
    startingSalaryRange = "9 - 14 triệu VNĐ / tháng (chưa tính thưởng hiệu quả công việc & dự án)";
    fiveYearSalaryRange = "20 - 35+ triệu VNĐ / tháng";
    selfSufficiencyVerdict = "Con có thể sớm tự trang trải chi phí sinh hoạt từ năm 3 nhờ các dự án sáng tạo nội dung / chạy quảng cáo, và đạt mức thu nhập tốt sau 3 năm cọ xát.";
    mainRisks = threatItem || "Xu hướng thị trường thay đổi nhanh, con cần có tinh thần chủ động học hỏi các công cụ mới và rèn luyện sức bền trước áp lực công việc.";
    contingencyPlanB = customMitigation || "Không chỉ làm nội dung đơn thuần, con học thêm kỹ năng phân tích dữ liệu, ngoại ngữ và quản lý dự án để có thể làm việc tại các doanh nghiệp lớn hoặc tự vận hành dự án độc lập.";
    marketDemandVerdict = "Bất kỳ doanh nghiệp nào muốn giới thiệu sản phẩm và tiếp cận khách hàng đều cần nhân sự Marketing nhạy bén.";
    question1 = `Ba mẹ thấy ngành Marketing rất năng động, con thích làm mảng sáng tạo nội dung, chạy quảng cáo số hay tổ chức sự kiện?`;
    question2 = `Ngành này đòi hỏi ý tưởng mới liên tục, con đã rèn luyện cách giải tỏa căng thẳng và giữ gìn sức khỏe thế nào?`;
    question3 = `Con đã chuẩn bị hồ sơ các sản phẩm hoặc bài viết con từng làm để đi xin thực tập chưa? Kể ba mẹ nghe về sản phẩm con ưng ý nhất nhé.`;
    mentorTips = "Thay vì lo lắng 'ngành này viển vông', cha mẹ hãy công nhận sự nhạy bén của con, khuyến khích con trau dồi thêm tiếng Anh và kỹ năng đo lường hiệu quả bằng con số thực tế.";
  }

  // Nếu kịch bản có sẵn số liệu ROI đã tính toán chính xác, cập nhật theo ROI thực tế
  if (roiDetails) {
    if (roiDetails.estimatedCost) {
      fourYearTotal = `${roiDetails.estimatedCost} (Ước tính theo mô hình tài chính)`;
    }
    if (roiDetails.paybackPeriodYears && roiDetails.paybackPeriodYears > 0) {
      expectedMilestone = `Sau ${roiDetails.paybackPeriodYears} năm đi làm, con thu hồi toàn bộ vốn đầu tư học tập và bắt đầu có tích lũy tài sản ròng.`;
    }
  }

  // Điều chỉnh sắc thái theo kịch bản rủi ro (Risk) nếu người dùng đang xem kịch bản rủi ro
  if (type === "Risk") {
    adviceForParents = `${adviceForParents} Lưu ý đây là kịch bản có độ biến động cao, gia đình nên cùng con chuẩn bị kỹ tâm lý và các phương án dự phòng Plan B.`;
  }

  return {
    scenarioTitle: title,
    scenarioType: type,
    categoryTag,
    executiveSummary: desc || `Kế hoạch định hướng '${title}' được mô phỏng dựa trên năng lực cá nhân và thực tế thị trường.`,
    financialInvestment: {
      monthlyEstimate,
      fourYearTotal,
      costBreakdown,
      adviceForParents
    },
    financialIndependence: {
      expectedMilestone,
      startingSalaryRange,
      fiveYearSalaryRange,
      selfSufficiencyVerdict
    },
    employmentRiskAndPlanB: {
      mainRisks,
      contingencyPlanB,
      marketDemandVerdict
    },
    familyDialogueGuide: {
      question1,
      question2,
      question3,
      mentorTips
    },
    strengthsOfChild: strengthItem || "Con có tinh thần chủ động tìm hiểu, có ý thức suy nghĩ nghiêm túc về tương lai và mong muốn tự lập sớm.",
    areasToSupport: weaknessItem || "Con cần sự động viên bền bỉ của gia đình về mặt tinh thần, nhắc nhở cân đối giữa học tập và sức khỏe.",
    socialOpportunities: opportunityItem || "Xã hội và thị trường lao động đang mở rộng nhiều cơ hội việc làm mới cho những bạn trẻ có kỹ năng thực chất.",
    emotionalSafetyNote: "Sự thấu hiểu, không phán xét của cha mẹ trong các bữa cơm gia đình chính là điểm tựa an toàn nhất giúp con tự tin trưởng thành."
  };
}

/**
 * Mã hóa dữ liệu kịch bản cực kỳ tinh gọn (chỉ ~80-150 ký tự) để mã QR luôn to rõ, quét siêu nhanh
 */
export function encodeScenarioSharePayload(scenario: any, context?: any): string {
  try {
    const compactPayload = {
      t: (scenario?.title || "").slice(0, 60),
      tp: scenario?.type || "Neutral",
      cg: scenario?.careerGrowth || 0,
      hap: scenario?.happiness || 0,
      roi: scenario?.roi || 0,
      id: scenario?.id || scenario?._id || "",
      cat: getScenarioSkillBadge(scenario?.title || "", scenario?.description || "", context?.decision || "")
    };
    const jsonStr = JSON.stringify(compactPayload);
    return btoa(unescape(encodeURIComponent(jsonStr)));
  } catch (e) {
    console.error("Error encoding share payload:", e);
    return "";
  }
}

/**
 * Giải mã dữ liệu kịch bản từ URL string
 */
export function decodeScenarioSharePayload(encodedStr: string): Partial<ScenarioResult> & { categoryTag?: string } | null {
  try {
    if (!encodedStr) return null;
    const jsonStr = decodeURIComponent(escape(atob(encodedStr)));
    const parsed = JSON.parse(jsonStr);
    return {
      id: parsed.id || undefined,
      title: parsed.t || "Kịch bản định hướng nghề nghiệp",
      description: "",
      type: parsed.tp || "Neutral",
      roi: parsed.roi || 0,
      careerGrowth: parsed.cg || 0,
      happiness: parsed.hap || 0,
      categoryTag: parsed.cat || undefined,
      deepAnalysis: {
        swot: [],
        resources: [],
        sprint90: [],
        criticalAdvice: "",
        riskMitigation: ""
      }
    };
  } catch (e) {
    console.error("Error decoding share payload:", e);
    return null;
  }
}

/**
 * Tạo link chia sẻ CHÍNH THỨC luôn dùng domain cloud (không bao giờ dùng localhost)
 */
export function getParentShareUrl(scenario: any, context?: any): string {
  const payload = encodeScenarioSharePayload(scenario, context);
  const scenarioId = scenario?.id || scenario?._id;
  
  if (scenarioId) {
    return `${CLOUD_APP_URL}/#/parent-view?id=${encodeURIComponent(scenarioId)}&data=${payload}`;
  }
  return `${CLOUD_APP_URL}/#/parent-view?data=${payload}`;
}
