export type CategoryType = 'stress' | 'finance' | 'capability' | 'risk';

export interface QuestionOption {
  text: string;
  score: number;
}

export interface EvaluationQuestion {
  id: number;
  category: CategoryType;
  text: string;
  options: QuestionOption[];
}

export const evaluationQuestions: EvaluationQuestion[] = [
  // 1. Stress (Áp lực) - Negative (0: low, 100: high)
  {
    id: 1, category: 'stress',
    text: "Bạn cảm thấy mức độ căng thẳng chung trong cuộc sống hiện tại như thế nào?",
    options: [
      { text: "Hoàn toàn thoải mái", score: 0 },
      { text: "Đôi lúc căng thẳng nhẹ", score: 25 },
      { text: "Thỉnh thoảng khá áp lực", score: 50 },
      { text: "Thường xuyên căng thẳng", score: 75 },
      { text: "Lúc nào cũng kiệt sức và quá tải", score: 100 }
    ]
  },
  {
    id: 2, category: 'stress',
    text: "Giấc ngủ của bạn trong tháng qua ra sao?",
    options: [
      { text: "Ngủ rất ngon, đủ giấc", score: 0 },
      { text: "Đôi khi khó ngủ", score: 25 },
      { text: "Thiếu ngủ nhẹ, hay tỉnh giấc", score: 50 },
      { text: "Khó ngủ thường xuyên, mệt mỏi khi dậy", score: 75 },
      { text: "Mất ngủ trầm trọng, phải dùng thuốc", score: 100 }
    ]
  },
  {
    id: 3, category: 'stress',
    text: "Bạn cảm thấy thế nào về khối lượng công việc/học tập hiện tại?",
    options: [
      { text: "Rất nhàn rỗi, kiểm soát tốt", score: 0 },
      { text: "Vừa sức, thỉnh thoảng mới bận", score: 25 },
      { text: "Khá bận rộn nhưng vẫn xử lý được", score: 50 },
      { text: "Quá tải, phải làm thêm giờ liên tục", score: 75 },
      { text: "Hoàn toàn mất kiểm soát, không thể hoàn thành", score: 100 }
    ]
  },
  {
    id: 4, category: 'stress',
    text: "Khả năng cân bằng giữa công việc và cuộc sống cá nhân của bạn?",
    options: [
      { text: "Rất tốt, có nhiều thời gian cho bản thân", score: 0 },
      { text: "Khá tốt, vẫn duy trì được sở thích", score: 25 },
      { text: "Trung bình, thời gian rảnh bị hạn chế", score: 50 },
      { text: "Kém, hầu như không có thời gian nghỉ ngơi", score: 75 },
      { text: "Không có khái niệm nghỉ ngơi, chỉ xoay quanh công việc", score: 100 }
    ]
  },
  {
    id: 5, category: 'stress',
    text: "Tần suất bạn gặp phải các triệu chứng thể chất do áp lực (đau đầu, đau dạ dày...)?",
    options: [
      { text: "Không bao giờ", score: 0 },
      { text: "Rất hiếm khi", score: 25 },
      { text: "Vài lần một tháng", score: 50 },
      { text: "Vài lần một tuần", score: 75 },
      { text: "Gần như mỗi ngày", score: 100 }
    ]
  },
  {
    id: 6, category: 'stress',
    text: "Bạn có thường xuyên cảm thấy lo âu về tương lai không?",
    options: [
      { text: "Không, tôi rất lạc quan", score: 0 },
      { text: "Thỉnh thoảng có nghĩ tới", score: 25 },
      { text: "Khá thường xuyên nhưng kiểm soát được", score: 50 },
      { text: "Rất hay lo lắng, ảnh hưởng đến tâm trạng", score: 75 },
      { text: "Ám ảnh, luôn trong trạng thái hoang mang", score: 100 }
    ]
  },
  {
    id: 7, category: 'stress',
    text: "Bạn nhận được sự hỗ trợ tinh thần từ người thân/bạn bè ở mức nào?",
    options: [
      { text: "Rất nhiều, luôn có người chia sẻ", score: 0 },
      { text: "Khá đầy đủ khi cần thiết", score: 25 },
      { text: "Trung bình, có thể chia sẻ một số chuyện", score: 50 },
      { text: "Rất ít, chủ yếu tự giải quyết", score: 75 },
      { text: "Hoàn toàn cô độc, không biết tâm sự cùng ai", score: 100 }
    ]
  },
  {
    id: 8, category: 'stress',
    text: "Mức độ hài lòng của bạn với các mối quan hệ hiện tại?",
    options: [
      { text: "Rất hài lòng và gắn kết", score: 0 },
      { text: "Khá ổn, thỉnh thoảng có xích mích nhỏ", score: 25 },
      { text: "Bình thường, không quá thân thiết", score: 50 },
      { text: "Thường xuyên có mâu thuẫn, căng thẳng", score: 75 },
      { text: "Các mối quan hệ đang đổ vỡ hoặc rất độc hại", score: 100 }
    ]
  },
  {
    id: 9, category: 'stress',
    text: "Bạn có thời gian để tập thể dục và chăm sóc bản thân không?",
    options: [
      { text: "Rất đều đặn hàng ngày", score: 0 },
      { text: "Vài ngày một tuần", score: 25 },
      { text: "Thỉnh thoảng khi rảnh rỗi", score: 50 },
      { text: "Rất hiếm khi", score: 75 },
      { text: "Hoàn toàn không có thời gian và sức lực", score: 100 }
    ]
  },
  {
    id: 10, category: 'stress',
    text: "Bạn có hay sử dụng các biện pháp tiêu cực (rượu, bia, thuốc lá, ăn uống vô độ) để giải tỏa căng thẳng không?",
    options: [
      { text: "Không bao giờ", score: 0 },
      { text: "Rất hiếm khi", score: 25 },
      { text: "Thỉnh thoảng trong các dịp đặc biệt", score: 50 },
      { text: "Thường xuyên dùng khi bị stress", score: 75 },
      { text: "Phụ thuộc hoàn toàn hàng ngày", score: 100 }
    ]
  },

  // 2. Finance (Tài chính) - Positive (0: bad, 100: good)
  {
    id: 11, category: 'finance',
    text: "Tình trạng thu nhập hiện tại của bạn so với chi phí sinh hoạt cơ bản?",
    options: [
      { text: "Hoàn toàn không đủ sống", score: 0 },
      { text: "Thường xuyên thiếu hụt nhẹ", score: 25 },
      { text: "Đủ sống, vừa vặn", score: 50 },
      { text: "Khá thoải mái, có dư một chút", score: 75 },
      { text: "Dư dả rất nhiều", score: 100 }
    ]
  },
  {
    id: 12, category: 'finance',
    text: "Bạn có đang gánh các khoản nợ tiêu dùng không?",
    options: [
      { text: "Nợ ngập đầu, mất khả năng chi trả", score: 0 },
      { text: "Nợ khá nhiều, áp lực trả nợ cao", score: 25 },
      { text: "Có nợ vừa phải, vẫn trả đều đặn", score: 50 },
      { text: "Nợ rất ít, trả ngay trong tháng", score: 75 },
      { text: "Hoàn toàn không có nợ", score: 100 }
    ]
  },
  {
    id: 13, category: 'finance',
    text: "Tình trạng quỹ dự phòng khẩn cấp của bạn hiện tại?",
    options: [
      { text: "Hoàn toàn không có đồng nào dự phòng", score: 0 },
      { text: "Dưới 1 tháng sinh hoạt", score: 25 },
      { text: "Đủ sống trong 1-3 tháng", score: 50 },
      { text: "Đủ sống trong 3-6 tháng", score: 75 },
      { text: "Đủ sống từ 6 tháng trở lên", score: 100 }
    ]
  },
  {
    id: 14, category: 'finance',
    text: "Thói quen tiết kiệm hàng tháng của bạn như thế nào?",
    options: [
      { text: "Phải tiêu lẹm vào tiền tiết kiệm cũ", score: 0 },
      { text: "Hầu như không dư dả để tiết kiệm", score: 25 },
      { text: "Thỉnh thoảng tiết kiệm được một ít", score: 50 },
      { text: "Tiết kiệm được 10-30% thu nhập", score: 75 },
      { text: "Tiết kiệm đều đặn >30% thu nhập", score: 100 }
    ]
  },
  {
    id: 15, category: 'finance',
    text: "Mức độ đa dạng của các nguồn thu nhập?",
    options: [
      { text: "Hiện tại đang thất nghiệp hoặc thu nhập rất bấp bênh", score: 0 },
      { text: "Hoàn toàn phụ thuộc vào 1 công việc duy nhất", score: 25 },
      { text: "Chủ yếu từ 1 nguồn nhưng thỉnh thoảng có thu nhập phụ", score: 50 },
      { text: "Có 2-3 nguồn thu nhập ổn định", score: 75 },
      { text: "Có nhiều nguồn thu nhập thụ động và chủ động", score: 100 }
    ]
  },
  {
    id: 16, category: 'finance',
    text: "Khả năng kiểm soát chi tiêu cá nhân của bạn?",
    options: [
      { text: "Mua sắm bốc đồng, không biết tiền đi đâu", score: 0 },
      { text: "Thường xuyên chi tiêu vượt kế hoạch", score: 25 },
      { text: "Chi tiêu theo cảm tính nhưng hiếm khi vung tay quá trán", score: 50 },
      { text: "Có kế hoạch chi tiêu khá tốt", score: 75 },
      { text: "Ghi chép và tuân thủ ngân sách rất nghiêm ngặt", score: 100 }
    ]
  },
  {
    id: 17, category: 'finance',
    text: "Kiến thức và kinh nghiệm đầu tư của bạn?",
    options: [
      { text: "Đầu tư thua lỗ nặng, dính vào lừa đảo", score: 0 },
      { text: "Không biết đầu tư, chỉ để tiền mặt", score: 25 },
      { text: "Mới bắt đầu tìm hiểu và thử nghiệm nhỏ", score: 50 },
      { text: "Có hiểu biết cơ bản, đầu tư an toàn", score: 75 },
      { text: "Đầu tư chuyên nghiệp, đa dạng hóa danh mục", score: 100 }
    ]
  },
  {
    id: 18, category: 'finance',
    text: "Mức độ tự tin về khả năng tài chính để đạt các mục tiêu lớn?",
    options: [
      { text: "Hoàn toàn tuyệt vọng, không dám nghĩ tới", score: 0 },
      { text: "Rất lo lắng, có vẻ ngoài tầm với", score: 25 },
      { text: "Tự tin vừa phải, cần cố gắng nhiều", score: 50 },
      { text: "Khá tự tin, đã có kế hoạch rõ ràng", score: 75 },
      { text: "Rất tự tin, mọi thứ đang đi đúng hướng", score: 100 }
    ]
  },
  {
    id: 19, category: 'finance',
    text: "Bạn có tham gia các loại bảo hiểm để phòng ngừa rủi ro tài chính không?",
    options: [
      { text: "Hoàn toàn không có, từ chối tham gia", score: 0 },
      { text: "Gần như không có bảo hiểm gì", score: 25 },
      { text: "Chỉ có bảo hiểm y tế cơ bản của công ty", score: 50 },
      { text: "Có bảo hiểm y tế và một số bảo hiểm phụ", score: 75 },
      { text: "Đầy đủ các loại bảo hiểm cần thiết", score: 100 }
    ]
  },
  {
    id: 20, category: 'finance',
    text: "Tỷ lệ chi trả cho nhà ở (thuê/trả góp) chiếm bao nhiêu % thu nhập?",
    options: [
      { text: "Trên 50%", score: 0 },
      { text: "35% - 50%", score: 25 },
      { text: "25% - 35%", score: 50 },
      { text: "15% - 25%", score: 75 },
      { text: "Dưới 15%", score: 100 }
    ]
  },

  // 3. Capability (Năng lực) - Positive (0: weak, 100: strong)
  {
    id: 21, category: 'capability',
    text: "Bằng cấp/trình độ học vấn cao nhất hiện tại của bạn là gì?",
    options: [
      { text: "Chưa hoàn thành chương trình phổ thông", score: 0 },
      { text: "Tốt nghiệp THPT hoặc đang học nghề", score: 25 },
      { text: "Cao đẳng/Đại học loại trung bình", score: 50 },
      { text: "Cử nhân/Kỹ sư tốt nghiệp loại khá/giỏi", score: 75 },
      { text: "Thạc sĩ/Tiến sĩ hoặc Chuyên gia hàng đầu", score: 100 }
    ]
  },
  {
    id: 22, category: 'capability',
    text: "Kinh nghiệm thực tế trong lĩnh vực chuyên môn của bạn?",
    options: [
      { text: "Trái ngành, chưa có bất kỳ kinh nghiệm nào", score: 0 },
      { text: "Mới ra trường, thực tập sinh", score: 25 },
      { text: "Nhân viên mới (Junior/Fresher 1-2 năm)", score: 50 },
      { text: "Người đi làm có kinh nghiệm vững vàng (2-5 năm)", score: 75 },
      { text: "Chuyên gia dạn dày kinh nghiệm (>5 năm)", score: 100 }
    ]
  },
  {
    id: 23, category: 'capability',
    text: "Khả năng ngoại ngữ (đặc biệt là tiếng Anh) của bạn ở mức nào?",
    options: [
      { text: "Hoàn toàn không biết ngoại ngữ", score: 0 },
      { text: "Biết rất ít, chỉ đủ giao tiếp xã giao", score: 25 },
      { text: "Giao tiếp cơ bản, đọc hiểu tài liệu mất thời gian", score: 50 },
      { text: "Đọc hiểu và giao tiếp chuyên ngành tốt", score: 75 },
      { text: "Sử dụng thành thạo như người bản xứ", score: 100 }
    ]
  },
  {
    id: 24, category: 'capability',
    text: "Kỹ năng tin học và áp dụng công nghệ vào công việc?",
    options: [
      { text: "Mù công nghệ, rất sợ sử dụng thiết bị mới", score: 0 },
      { text: "Cần người hỗ trợ nhiều khi dùng phần mềm mới", score: 25 },
      { text: "Sử dụng tốt tin học văn phòng cơ bản", score: 50 },
      { text: "Dùng thành thạo các phần mềm chuyên ngành", score: 75 },
      { text: "Sử dụng công cụ tiên tiến rất thạo", score: 100 }
    ]
  },
  {
    id: 25, category: 'capability',
    text: "Khả năng tự học và cập nhật kiến thức mới của bạn?",
    options: [
      { text: "Kháng cự sự thay đổi, không chịu học cái mới", score: 0 },
      { text: "Lười cập nhật, chỉ làm theo những gì đã biết", score: 25 },
      { text: "Thỉnh thoảng mới đọc thêm kiến thức mới", score: 50 },
      { text: "Chủ động học hỏi khi cần thiết", score: 75 },
      { text: "Tự học liên tục, nắm bắt trend rất nhanh", score: 100 }
    ]
  },
  {
    id: 26, category: 'capability',
    text: "Khả năng giải quyết vấn đề khi đối mặt với tình huống khó?",
    options: [
      { text: "Bỏ cuộc hoặc né tránh vấn đề", score: 0 },
      { text: "Thường xuyên bị bối rối, giải quyết chậm chạp", score: 25 },
      { text: "Cần sự hỗ trợ để tìm ra hướng đi", score: 50 },
      { text: "Giải quyết tốt các vấn đề quen thuộc", score: 75 },
      { text: "Bình tĩnh phân tích và đưa ra giải pháp sáng tạo", score: 100 }
    ]
  },
  {
    id: 27, category: 'capability',
    text: "Kỹ năng làm việc nhóm và giao tiếp?",
    options: [
      { text: "Hoàn toàn không thể làm việc với người khác", score: 0 },
      { text: "Hay xảy ra xung đột khi làm chung", score: 25 },
      { text: "Làm việc độc lập tốt hơn nhưng vẫn hợp tác được", score: 50 },
      { text: "Phối hợp tốt, biết lắng nghe và hỗ trợ", score: 75 },
      { text: "Lãnh đạo nhóm xuất sắc, giao tiếp cực kỳ hiệu quả", score: 100 }
    ]
  },
  {
    id: 28, category: 'capability',
    text: "Định hướng nghề nghiệp tương lai của bạn rõ ràng đến đâu?",
    options: [
      { text: "Hoàn toàn mất phương hướng", score: 0 },
      { text: "Khá mông lung, chưa biết mình thích gì", score: 25 },
      { text: "Có hướng đi mờ nhạt, đang vừa làm vừa tìm hiểu", score: 50 },
      { text: "Có mục tiêu rõ ràng cho 1-3 năm tới", score: 75 },
      { text: "Có lộ trình chi tiết cho 5-10 năm tới", score: 100 }
    ]
  },
  {
    id: 29, category: 'capability',
    text: "Hiệu suất làm việc/học tập thực tế so với kỳ vọng?",
    options: [
      { text: "Kết quả rất kém, nguy cơ bị sa thải/đuổi học", score: 0 },
      { text: "Thường xuyên trễ deadline hoặc chậm tiến độ", score: 25 },
      { text: "Lúc đạt lúc không, hiệu suất không ổn định", score: 50 },
      { text: "Thường xuyên đạt chỉ tiêu", score: 75 },
      { text: "Luôn vượt mức kỳ vọng", score: 100 }
    ]
  },
  {
    id: 30, category: 'capability',
    text: "Khả năng chịu áp lực và thích nghi với môi trường làm việc thay đổi?",
    options: [
      { text: "Hoàn toàn sụp đổ khi môi trường thay đổi", score: 0 },
      { text: "Rất vất vả để theo kịp sự thay đổi", score: 25 },
      { text: "Thích nghi được nhưng mất thời gian và căng thẳng", score: 50 },
      { text: "Thích nghi nhanh sau một thời gian ngắn", score: 75 },
      { text: "Rất thích thú và phát triển mạnh trong thay đổi", score: 100 }
    ]
  },

  // 4. Risk (Rủi ro) - Negative (0: low risk, 100: high risk)
  {
    id: 31, category: 'risk',
    text: "Bạn đánh giá mức độ rủi ro sức khỏe hiện tại như thế nào?",
    options: [
      { text: "Hoàn toàn khỏe mạnh, khám định kỳ tốt", score: 0 },
      { text: "Khỏe mạnh nhưng có thói quen chưa tốt (ít vận động)", score: 25 },
      { text: "Có bệnh vặt hoặc chỉ số cơ thể ở mức cảnh báo nhẹ", score: 50 },
      { text: "Đang mắc bệnh mãn tính cần điều trị thường xuyên", score: 75 },
      { text: "Sức khỏe rất yếu, nguy cơ bệnh hiểm nghèo cao", score: 100 }
    ]
  },
  {
    id: 32, category: 'risk',
    text: "Tính chất công việc/ngành nghề của bạn có rủi ro thay thế cao không?",
    options: [
      { text: "Không thể thay thế, nhu cầu xã hội cực cao", score: 0 },
      { text: "Rủi ro thấp, ngành nghề ổn định", score: 25 },
      { text: "Có khả năng bị ảnh hưởng nhưng vẫn chuyển đổi được", score: 50 },
      { text: "Rủi ro cao, ngành đang bị thu hẹp hoặc AI đe dọa", score: 75 },
      { text: "Đang trong quá trình đào thải mạnh mẽ", score: 100 }
    ]
  },
  {
    id: 33, category: 'risk',
    text: "Mức độ rủi ro trong danh mục đầu tư/tài sản của bạn?",
    options: [
      { text: "Rất an toàn (tiết kiệm, trái phiếu)", score: 0 },
      { text: "An toàn vừa phải (BĐS chuẩn, ETF)", score: 25 },
      { text: "Rủi ro trung bình (cổ phiếu cơ bản)", score: 50 },
      { text: "Rủi ro cao (cổ phiếu đầu cơ, crypto vốn ít)", score: 75 },
      { text: "Đánh bạc, margin lớn, vay nợ đầu tư", score: 100 }
    ]
  },
  {
    id: 34, category: 'risk',
    text: "Môi trường sống hiện tại (an ninh, ô nhiễm, thiên tai) của bạn có an toàn không?",
    options: [
      { text: "Rất an toàn, trong lành, không có tội phạm", score: 0 },
      { text: "Khá an toàn, đôi khi có bất tiện nhỏ", score: 25 },
      { text: "Mức độ an ninh trung bình, ô nhiễm vừa phải", score: 50 },
      { text: "Môi trường khá độc hại, nhiều tệ nạn xung quanh", score: 75 },
      { text: "Khu vực cực kỳ nguy hiểm, thường xuyên xảy ra sự cố", score: 100 }
    ]
  },
  {
    id: 35, category: 'risk',
    text: "Rủi ro pháp lý trong công việc/kinh doanh hiện tại của bạn?",
    options: [
      { text: "Tuân thủ pháp luật 100%, không có rủi ro", score: 0 },
      { text: "Rủi ro thấp, đôi khi giấy tờ phức tạp", score: 25 },
      { text: "Kinh doanh trong vùng xám, rủi ro trung bình", score: 50 },
      { text: "Thường xuyên lách luật, rủi ro bị phạt cao", score: 75 },
      { text: "Đang dính líu hoạt động phạm pháp/kiện tụng", score: 100 }
    ]
  },
  {
    id: 36, category: 'risk',
    text: "Bạn có thói quen điều khiển phương tiện giao thông an toàn không?",
    options: [
      { text: "Luôn tuân thủ luật, lái xe rất cẩn thận", score: 0 },
      { text: "Lái xe an toàn nhưng thỉnh thoảng đi nhanh", score: 25 },
      { text: "Hay vi phạm luật nhỏ (vượt đèn, lấn làn)", score: 50 },
      { text: "Lái xe ẩu, từng gây/gặp tai nạn", score: 75 },
      { text: "Thường xuyên lái xe khi say xỉn hoặc đua xe", score: 100 }
    ]
  },
  {
    id: 37, category: 'risk',
    text: "Tình trạng mối quan hệ của bạn có rủi ro đổ vỡ lớn không?",
    options: [
      { text: "Không, rất bền vững và tôn trọng nhau", score: 0 },
      { text: "Đôi khi có mâu thuẫn nhưng kiểm soát được", score: 25 },
      { text: "Đang có dấu hiệu lạnh nhạt, xa cách", score: 50 },
      { text: "Thường xuyên cãi vã lớn, nghi ngờ lẫn nhau", score: 75 },
      { text: "Đang đối mặt ly hôn, phản bội hoặc bạo hành", score: 100 }
    ]
  },
  {
    id: 38, category: 'risk',
    text: "Bạn có dễ bị dụ dỗ bởi lời hứa làm giàu nhanh hay đa cấp không?",
    options: [
      { text: "Rất tỉnh táo, luôn tìm hiểu kỹ", score: 0 },
      { text: "Khá cảnh giác, hiếm khi tin", score: 25 },
      { text: "Đôi lúc bị lung lay nhưng vẫn giữ được tiền", score: 50 },
      { text: "Từng bị lừa vài lần vì nhẹ dạ", score: 75 },
      { text: "Rất dễ tin, sẵn sàng vay mượn để tham gia", score: 100 }
    ]
  },
  {
    id: 39, category: 'risk',
    text: "Khả năng bảo mật thông tin cá nhân trên không gian mạng?",
    options: [
      { text: "Mật khẩu mạnh, bảo mật 2 lớp cho mọi thứ", score: 0 },
      { text: "Bảo mật khá tốt, ít chia sẻ thông tin", score: 25 },
      { text: "Dùng chung 1 mật khẩu cho nhiều tài khoản", score: 50 },
      { text: "Thường xuyên click link lạ, wifi không an toàn", score: 75 },
      { text: "Đã từng bị hack tài khoản gần đây", score: 100 }
    ]
  },
  {
    id: 40, category: 'risk',
    text: "Nhìn chung, bạn có phải là người thích mạo hiểm bất chấp hậu quả không?",
    options: [
      { text: "Luôn tính toán rất kỹ rủi ro trước khi làm", score: 0 },
      { text: "Thích an toàn, thỉnh thoảng mới mạo hiểm", score: 25 },
      { text: "Sẵn sàng mạo hiểm nếu phần thưởng xứng đáng", score: 50 },
      { text: "Thích cảm giác mạnh, hay quyết định liều", score: 75 },
      { text: "Sống bất cần, không quan tâm hậu quả", score: 100 }
    ]
  }
];

export const mapScoreToLevel = (score: number) => {
  if (score <= 20) return "Rất thấp";
  if (score <= 40) return "Thấp";
  if (score <= 60) return "Trung bình";
  if (score <= 80) return "Cao";
  return "Rất cao";
};
