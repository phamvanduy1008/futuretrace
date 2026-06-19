export type CategoryType = 'stress' | 'finance' | 'capability' | 'risk';

export interface QuestionOption {
  text: string;
  value: number;
}

export interface EvaluationQuestion {
  id: number;
  category: CategoryType;
  question: string;
  isReverse?: boolean;
  options: QuestionOption[];
}

const LIKERT_OPTIONS: QuestionOption[] = [
  { text: "Hoàn toàn không đúng / Không bao giờ", value: 1 },
  { text: "Hiếm khi / Ít khi đúng", value: 2 },
  { text: "Thỉnh thoảng / Đúng một phần", value: 3 },
  { text: "Thường xuyên / Khá đúng", value: 4 },
  { text: "Hoàn toàn đúng / Rất thường xuyên", value: 5 }
];

export const evaluationQuestions: EvaluationQuestion[] = [
  // --- STRESS (Perceived Stress Scale) ---
  // High raw score = High stress
  {
    id: 1, category: 'stress',
    question: "Trong tháng qua, bạn cảm thấy bực tức vì một điều gì đó xảy ra ngoài dự kiến?",
    options: LIKERT_OPTIONS
  },
  {
    id: 2, category: 'stress',
    question: "Trong tháng qua, bạn cảm thấy mình không thể kiểm soát những điều quan trọng trong cuộc sống?",
    options: LIKERT_OPTIONS
  },
  {
    id: 3, category: 'stress',
    question: "Trong tháng qua, bạn cảm thấy căng thẳng và áp lực?",
    options: LIKERT_OPTIONS
  },
  {
    id: 4, category: 'stress',
    question: "Trong tháng qua, bạn cảm thấy tự tin về khả năng giải quyết các vấn đề cá nhân của mình?",
    isReverse: true, // Tự tin = ít stress
    options: LIKERT_OPTIONS
  },
  {
    id: 5, category: 'stress',
    question: "Trong tháng qua, bạn cảm thấy mọi việc đang diễn ra đúng như ý muốn của mình?",
    isReverse: true,
    options: LIKERT_OPTIONS
  },
  {
    id: 6, category: 'stress',
    question: "Trong tháng qua, bạn thấy mình không thể hoàn thành tất cả những việc cần làm?",
    options: LIKERT_OPTIONS
  },
  {
    id: 7, category: 'stress',
    question: "Trong tháng qua, bạn có thể kiểm soát được sự tức giận và cảm xúc tiêu cực của mình?",
    isReverse: true,
    options: LIKERT_OPTIONS
  },
  {
    id: 8, category: 'stress',
    question: "Trong tháng qua, bạn cảm thấy mình đang vượt qua được mọi khó khăn?",
    isReverse: true,
    options: LIKERT_OPTIONS
  },
  {
    id: 9, category: 'stress',
    question: "Trong tháng qua, bạn tức giận vì những chuyện nằm ngoài tầm kiểm soát của bản thân?",
    options: LIKERT_OPTIONS
  },
  {
    id: 10, category: 'stress',
    question: "Trong tháng qua, bạn cảm thấy khó khăn chồng chất đến mức không thể vượt qua nổi?",
    options: LIKERT_OPTIONS
  },

  // --- FINANCE (Financial Well-being Scale) ---
  // High raw score = High financial well-being
  {
    id: 11, category: 'finance',
    question: "Tôi có thể xử lý một khoản chi phí lớn, đột xuất phát sinh một cách dễ dàng.",
    options: LIKERT_OPTIONS
  },
  {
    id: 12, category: 'finance',
    question: "Tôi hoàn toàn kiểm soát được chi tiêu hàng ngày của mình.",
    options: LIKERT_OPTIONS
  },
  {
    id: 13, category: 'finance',
    question: "Tôi thường xuyên lo lắng về việc liệu tiền của mình có đủ đến cuối tháng hay không.",
    isReverse: true, // Lo lắng = Tài chính kém
    options: LIKERT_OPTIONS
  },
  {
    id: 14, category: 'finance',
    question: "Tôi đang đi đúng hướng trong việc đạt được các mục tiêu tài chính dài hạn của mình.",
    options: LIKERT_OPTIONS
  },
  {
    id: 15, category: 'finance',
    question: "Tôi cảm thấy tài chính hiện tại đang cản trở tôi làm những việc mình muốn.",
    isReverse: true,
    options: LIKERT_OPTIONS
  },
  {
    id: 16, category: 'finance',
    question: "Tôi có các khoản tiền tiết kiệm hoặc dự phòng rủi ro đáng tin cậy.",
    options: LIKERT_OPTIONS
  },
  {
    id: 17, category: 'finance',
    question: "Tôi luôn thanh toán các hóa đơn và nợ đúng hạn.",
    options: LIKERT_OPTIONS
  },
  {
    id: 18, category: 'finance',
    question: "Khoản nợ hiện tại của tôi (nếu có) đang tạo ra áp lực tâm lý lớn.",
    isReverse: true,
    options: LIKERT_OPTIONS
  },
  {
    id: 19, category: 'finance',
    question: "Tôi hoàn toàn yên tâm về tương lai tài chính của bản thân.",
    options: LIKERT_OPTIONS
  },
  {
    id: 20, category: 'finance',
    question: "Tôi phải vay mượn từ bạn bè, gia đình hoặc tín dụng để duy trì mức sống cơ bản.",
    isReverse: true,
    options: LIKERT_OPTIONS
  },

  // --- CAPABILITY (Self-efficacy & Career Adaptability) ---
  // High raw score = High capability
  {
    id: 21, category: 'capability',
    question: "Tôi luôn có thể xoay sở và tìm ra cách giải quyết khi đối mặt với thử thách khó khăn.",
    options: LIKERT_OPTIONS
  },
  {
    id: 22, category: 'capability',
    question: "Nếu có ai phản đối ý kiến của tôi, tôi vẫn có thể thuyết phục hoặc tìm ra tiếng nói chung.",
    options: LIKERT_OPTIONS
  },
  {
    id: 23, category: 'capability',
    question: "Tôi thấy dễ dàng trong việc gắn bó với các mục tiêu đã đề ra và hoàn thành chúng.",
    options: LIKERT_OPTIONS
  },
  {
    id: 24, category: 'capability',
    question: "Tôi cảm thấy mình khó có thể học hỏi những kỹ năng mới nhanh chóng khi công việc thay đổi.",
    isReverse: true, // Khó học hỏi = Năng lực kém
    options: LIKERT_OPTIONS
  },
  {
    id: 25, category: 'capability',
    question: "Nhờ nỗ lực cá nhân, tôi có thể xử lý tốt các tình huống bất ngờ xảy ra.",
    options: LIKERT_OPTIONS
  },
  {
    id: 26, category: 'capability',
    question: "Tôi sẵn sàng nhận trách nhiệm và vai trò lãnh đạo khi làm việc nhóm.",
    options: LIKERT_OPTIONS
  },
  {
    id: 27, category: 'capability',
    question: "Khi tiếp xúc với một vấn đề hoàn toàn mới, tôi tự tin rằng mình sẽ phân tích và hiểu được nó.",
    options: LIKERT_OPTIONS
  },
  {
    id: 28, category: 'capability',
    question: "Tôi bị hoang mang và mất phương hướng khi môi trường làm việc/học tập biến động.",
    isReverse: true,
    options: LIKERT_OPTIONS
  },
  {
    id: 29, category: 'capability',
    question: "Tôi thường chủ động tìm kiếm và nắm bắt các cơ hội thăng tiến hoặc phát triển bản thân.",
    options: LIKERT_OPTIONS
  },
  {
    id: 30, category: 'capability',
    question: "Tôi đánh giá được điểm mạnh, điểm yếu của mình và biết cách tận dụng chúng hợp lý.",
    options: LIKERT_OPTIONS
  },

  // --- RISK (Risk Exposure & Resilience) ---
  // High raw score = High risk level
  {
    id: 31, category: 'risk',
    question: "Tôi thường đưa ra các quyết định (tài chính, công việc) một cách bốc đồng, không suy nghĩ kỹ.",
    options: LIKERT_OPTIONS
  },
  {
    id: 32, category: 'risk',
    question: "Tôi luôn có kế hoạch dự phòng (Plan B) rõ ràng cho các rủi ro có thể xảy ra.",
    isReverse: true, // Có phương án dự phòng = Rủi ro thấp
    options: LIKERT_OPTIONS
  },
  {
    id: 33, category: 'risk',
    question: "Tôi có xu hướng tham gia vào các khoản đầu tư lợi nhuận cao mà chưa tìm hiểu ngọn ngành.",
    options: LIKERT_OPTIONS
  },
  {
    id: 34, category: 'risk',
    question: "Thu nhập hiện tại của tôi phụ thuộc hoàn toàn vào một nguồn duy nhất.",
    options: LIKERT_OPTIONS
  },
  {
    id: 35, category: 'risk',
    question: "Tôi mua sắm bảo hiểm sức khỏe hoặc có quỹ y tế riêng cho trường hợp đau ốm.",
    isReverse: true, // An toàn = Rủi ro thấp
    options: LIKERT_OPTIONS
  },
  {
    id: 36, category: 'risk',
    question: "Tôi sẵn sàng bỏ việc ngay lập tức dù chưa có bến đỗ mới an toàn.",
    options: LIKERT_OPTIONS
  },
  {
    id: 37, category: 'risk',
    question: "Mối quan hệ gia đình/cá nhân của tôi đang không ổn định và có thể gây khủng hoảng bất cứ lúc nào.",
    options: LIKERT_OPTIONS
  },
  {
    id: 38, category: 'risk',
    question: "Tôi tuân thủ nghiêm ngặt các quy tắc bảo mật thông tin, tài khoản trên mạng.",
    isReverse: true,
    options: LIKERT_OPTIONS
  },
  {
    id: 39, category: 'risk',
    question: "Nghề nghiệp hoặc kỹ năng của tôi rất dễ bị thay thế bởi AI hoặc máy móc trong vài năm tới.",
    options: LIKERT_OPTIONS
  },
  {
    id: 40, category: 'risk',
    question: "Tôi liên tục xây dựng và duy trì mạng lưới quan hệ chất lượng để hỗ trợ khi gặp khó khăn.",
    isReverse: true, // Mạng lưới tốt = Rủi ro thấp
    options: LIKERT_OPTIONS
  }
];

export const mapScoreToLevel = (score: number) => {
  if (score <= 20) return "Mức 1";
  if (score <= 40) return "Mức 2";
  if (score <= 60) return "Mức 3";
  if (score <= 80) return "Mức 4";
  return "Mức 5";
};
