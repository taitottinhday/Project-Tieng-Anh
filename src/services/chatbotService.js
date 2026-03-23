const KNOWLEDGE_BASE = [
  {
    id: "courses",
    keywords: ["khóa học", "toeic a", "toeic b", "tập sự", "speaking", "writing", "lộ trình"],
    answer:
      "Trung tâm hiện có các lộ trình Tập sự TOEIC, TOEIC A, TOEIC B và Speaking & Writing. Nếu bạn chưa rõ mục tiêu, hãy để lại mức điểm mong muốn và khung giờ học, hệ thống sẽ gợi ý lộ trình phù hợp ngay.",
    suggestions: ["Muốn học từ mất gốc", "Cần lộ trình 650+", "Hỏi học phí"],
  },
  {
    id: "pricing",
    keywords: ["học phí", "giá", "phí", "discount", "giảm giá", "25%"],
    answer:
      "Hiện tại hệ thống đang nhấn mạnh ưu đãi giảm 25% cho khóa học trên luồng khách và học viên. Bạn có thể nhận tư vấn để được gợi ý khóa học phù hợp và cách áp dụng ưu đãi vào lớp sắp khai giảng.",
    suggestions: ["Xem lớp sắp khai giảng", "Cần tư vấn ngay", "Hỏi cách đăng ký"],
  },
  {
    id: "schedule",
    keywords: ["lịch", "khai giảng", "giờ học", "ca học", "lịch học", "cuối tuần"],
    answer:
      "Bạn có thể xem lịch khai giảng ngay trên website. Nếu cần khung giờ cụ thể như tối 2-4-6, 3-5-7 hoặc cuối tuần, hãy nhập rõ yêu cầu để trung tâm sắp lớp phù hợp hơn.",
    suggestions: ["Xem lịch khai giảng", "Cần lớp buổi tối", "Cần lớp cuối tuần"],
  },
  {
    id: "contact",
    keywords: ["hotline", "tổng đài", "gọi", "liên hệ", "sđt", "số điện thoại"],
    answer:
      "Bạn có thể gọi tổng đài ngay qua số 0344772436 để được tư vấn nhanh. Nếu đang cần hỗ trợ gấp, hãy bấm nút gọi cố định ở góc màn hình để kết nối trực tiếp.",
    suggestions: ["Gọi tổng đài", "Gửi yêu cầu tư vấn", "Hỏi bằng chatbot"],
  },
  {
    id: "registration",
    keywords: ["đăng ký", "otp", "gmail", "xác minh", "tạo tài khoản"],
    answer:
      "Đăng ký mới sử dụng Gmail thật và có mã OTP gửi về email. Sau khi nhập đúng OTP, tài khoản mới được kích hoạt thành công. Mỗi Gmail chỉ được gắn với một tài khoản duy nhất trong hệ thống.",
    suggestions: ["Tôi chưa nhận OTP", "Gmail nào được chấp nhận", "Muốn đăng nhập bằng Google"],
  },
  {
    id: "assignment",
    keywords: ["bài tập", "bài giảng", "nộp bài", "giáo viên", "tài liệu", "lớp học"],
    answer:
      "Học viên trong lớp sẽ nhận tài liệu ngay sau khi giáo viên đăng bài giảng hoặc bài tập. Sau khi làm xong, học viên có thể nộp file, đánh dấu hoàn thành và giáo viên sẽ nhận bài trong khu quản trị để chấm và phản hồi.",
    suggestions: ["Xem lớp học của tôi", "Cách nộp bài", "Cách giáo viên chấm bài"],
  },
];

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s+]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreEntry(message, entry) {
  return entry.keywords.reduce((score, keyword) => {
    return score + (message.includes(normalizeText(keyword)) ? 1 : 0);
  }, 0);
}

function buildFallbackResponse() {
  return {
    answer:
      "Tôi có thể tư vấn nhanh về khóa học, học phí, lịch khai giảng, đăng ký Gmail + OTP, nộp bài và liên hệ tổng đài 0344772436. Bạn hãy nói rõ hơn mục tiêu điểm, khung giờ học hoặc vấn đề bạn đang gặp.",
    suggestions: ["Hỏi học phí", "Hỏi lịch khai giảng", "Gọi tổng đài"],
    matchedTopic: null,
  };
}

function getChatbotReply(message) {
  const normalizedMessage = normalizeText(message);

  if (!normalizedMessage) {
    return buildFallbackResponse();
  }

  const ranked = KNOWLEDGE_BASE
    .map((entry) => ({
      ...entry,
      score: scoreEntry(normalizedMessage, entry),
    }))
    .sort((left, right) => right.score - left.score);

  if (!ranked.length || ranked[0].score <= 0) {
    return buildFallbackResponse();
  }

  return {
    answer: ranked[0].answer,
    suggestions: ranked[0].suggestions,
    matchedTopic: ranked[0].id,
  };
}

module.exports = {
  getChatbotReply,
};
