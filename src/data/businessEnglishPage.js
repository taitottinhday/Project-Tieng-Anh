const toeic4SkillsPage = require("./toeic4SkillsPage");

const decodePlaceholderLabel = (value) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const placeholderImage = (
  label,
  width = 1400,
  height = 900,
  background = "e6edf9",
  foreground = "1f2937"
) => {
  const value = typeof label === "string" ? label.trim() : "";
  if (!value) return "";
  if (
    /^(?:https?:)?\/\//i.test(value) ||
    value.startsWith("/") ||
    value.startsWith("./") ||
    value.startsWith("../") ||
    value.startsWith("data:")
  ) {
    return value;
  }

  return `https://placehold.co/${width}x${height}/${background}/${foreground}?text=${encodeURIComponent(
    decodePlaceholderLabel(value)
  )}`;
};

module.exports = {
  slug: "tieng-anh-doanh-nghiep",
  title: "Tiếng Anh doanh nghiệp",
  hero: {
    title: "Khóa học tiếng Anh doanh nghiệp",
    text: "Khóa học Tiếng Anh Doanh nghiệp của Thầy Tài TOEIC được xây dựng để đáp ứng sát nhu cầu thực tế của môi trường làm việc hiện đại. Chương trình linh hoạt với hình thức đào tạo theo nhóm hoặc 1:1, tập trung phát triển các kỹ năng ứng dụng trực tiếp trong công việc như giao tiếp, họp, thuyết trình, đàm phán và từ vựng chuyên ngành.",
    ctaLabel: "Nhận tư vấn ngay!",
    ctaHref: "/contact",
    image: placeholderImage("https://r2.ebomb.edu.vn/toeic_img/page/2026/03/17/a7f1ce19-854d-47ea-9925-5d072d572fdf.png", 1040, 860, "dbeafe", "1d4ed8"),
  },
  audience: {
    title: "Doanh nghiệp của bạn có đang gặp tình trạng này?",
    intro:
      "Trong môi trường kinh doanh hội nhập, tiếng Anh là năng lực bắt buộc. Tuy nhiên, nhiều doanh nghiệp vẫn đang đối mặt với những rào cản khiến hiệu quả công việc và cơ hội phát triển bị hạn chế.",
    image: placeholderImage("https://r2.ebomb.edu.vn/toeic_img/page/2026/03/13/3cda91c3-94a3-4b03-a24a-5d7223069df3.png", 760, 980, "eef6ff", "1d4ed8"),
    left: [
      {
        title: "Nhân sự giỏi chuyên môn nhưng thiếu tự tin khi họp, thuyết trình hoặc làm việc với đối tác quốc tế.",
      },
      {
        title: "Đã đầu tư đào tạo tiếng Anh nhưng không đo lường được hiệu quả thực tế.",
      },
    ],
    right: [
      {
        title: "Năng lực tiếng Anh trong đội ngũ không đồng đều, phụ thuộc vào một vài cá nhân.",
      },
      {
        title: "Bỏ lỡ cơ hội hợp tác, mở rộng thị trường vì rào cản ngôn ngữ.",
      },
    ],
  },
  benefits: {
    title: "Lợi ích khi doanh nghiệp chuẩn hóa TOEIC 4 kỹ năng cho đội ngũ",
    subtitle: "Nâng chuẩn năng lực - Gia tăng lợi thế cạnh tranh",
    description:
      "Sở hữu chuẩn đánh giá TOEIC 4 kỹ năng giúp doanh nghiệp chuẩn hóa năng lực giao tiếp tiếng Anh trong môi trường làm việc, nâng cao hình ảnh chuyên nghiệp và tối ưu chi phí đào tạo trong dài hạn.",
    items: [
      {
        icon: "🎓",
        title: "Chuẩn hóa năng lực, dễ dàng đo lường & quản lý",
        text: "Thiết lập chuẩn tiếng Anh rõ ràng cho từng vị trí. Hệ thống đánh giá 4 kỹ năng giúp doanh nghiệp kiểm soát chất lượng nhân sự và theo dõi tiến độ học tập minh bạch hơn.",
        tone: "primary",
      },
      {
        icon: "📈",
        title: "Nâng cao hiệu suất, mở rộng cơ hội kinh doanh",
        text: "Đội ngũ có năng lực giao tiếp quốc tế giúp doanh nghiệp tự tin làm việc với đối tác nước ngoài, mở rộng thị trường và tăng khả năng ký kết hợp đồng.",
      },
      {
        icon: "🌐",
        title: "Gia tăng tính chuyên nghiệp cho doanh nghiệp",
        text: "Nhân sự có khả năng họp, thuyết trình, trao đổi và xử lý tình huống bằng tiếng Anh chủ động hơn, nâng cao hình ảnh doanh nghiệp trong mắt khách hàng và đối tác.",
      },
      {
        icon: "🎯",
        title: "Tối ưu chi phí đào tạo nhân sự, đầu tư hiệu quả dài hạn",
        text: "Lộ trình đào tạo bài bản, đánh giá theo từng giai đoạn giúp doanh nghiệp tránh đào tạo dàn trải, đảm bảo hiệu quả đầu tư và tối đa hóa giá trị nguồn lực.",
      },
    ],
  },
  ripl: {
    title: "Khám phá 04 giá trị khác biệt của RIPL",
    subtitle: "& tư duy khoa học chỉ có tại Thầy Tài TOEIC.",
    videoImage: placeholderImage("RIPL doanh nghiep", 960, 620, "eef6ff", "1d4ed8"),
    points: [
      { number: "01", title: "Lộ trình tinh gọn", text: "Hiệu quả tối đa" },
      { number: "02", title: "x2 thời lượng thực hành,", text: "tăng phản xạ nghe nói" },
      { number: "03", title: "Giúp học viên trở thành", text: "phiên bản tốt nhất của mình" },
      { number: "04", title: "Lớp học truyền cảm hứng", text: "không cứng nhắc kiến thức" },
    ],
  },
  partners: {
    title: "Hơn 200 đối tác uy tín tin tưởng đồng hành",
    text: "Thầy Tài TOEIC hợp tác cùng các đối tác uy tín hàng đầu, mang đến giá trị vượt trội và trải nghiệm học tập xuất sắc cho học viên. Chính sự tin tưởng từ doanh nghiệp là minh chứng rõ nhất cho chất lượng đào tạo và năng lực triển khai bài bản của đội ngũ.",
    backgroundImage: placeholderImage("https://i.pinimg.com/736x/f9/12/d5/f912d52ef4bf3f58b509c9bb556a5c27.jpg", 1600, 900, "183b74", "ffffff"),
    logos: [
      { name: "Viettel", image: placeholderImage("Viettel", 360, 240, "ffffff", "d71920"), large: true },
      { name: "Panasonic", image: placeholderImage("Panasonic", 240, 180, "ffffff", "1d4ed8") },
      { name: "VPBank", image: placeholderImage("VPBank", 240, 180, "ffffff", "16a34a") },
      { name: "BIDV", image: placeholderImage("BIDV", 240, 180, "ffffff", "1d4ed8") },
      { name: "SNP", image: placeholderImage("SNP", 240, 180, "ffffff", "2563eb") },
      { name: "Agribank", image: placeholderImage("Agribank", 320, 180, "ffffff", "b91c1c") },
      { name: "ENKEI", image: placeholderImage("ENKEI", 240, 180, "ffffff", "2563eb") },
    ],
  },
  roadmap: {
    ...toeic4SkillsPage.roadmap,
  },
  resources: {
    ...toeic4SkillsPage.resources,
  },
  stories: {
    title: "Câu chuyện học viên",
    items: [
      {
        title: "Cảm nhận học viên lớp Viettel KV3 HCM",
        excerpt: "Không khí học tập tập trung, lộ trình rõ ràng và sự đồng hành sát sao giúp đội ngũ giữ nhịp đều, học tới đâu ứng dụng tới đó.",
        image: placeholderImage("https://image.ebomb.edu.vn/crop/350x170/toeic_img/news/2026/03/17/59b1187a-5150-4ade-a5d6-852b89acc02e.jpg", 720, 420, "eef6ff", "1d4ed8"),
        href: "/ve-chung-toi/hoc-vien-diem-cao",
      },
      {
        title: "Không khí học tập sôi nổi của cán bộ công ty",
        excerpt: "Từ lớp học nội bộ đến các buổi workshop thực chiến, doanh nghiệp có thể chủ động xây văn hóa học tập tích cực và bền vững hơn.",
        image: placeholderImage("https://image.ebomb.edu.vn/crop/350x170/toeic_img/news/2026/03/17/1d2c9f5e-f0d3-4acd-a798-dc329693042c.jpg", 720, 420, "fff7ed", "9a3412"),
        href: "/ve-chung-toi/hoc-vien-diem-cao",
      },
      {
        title: "Thầy Tài TOEIC tổ chức thi thử cho nhân viên theo chuẩn đầu ra",
        excerpt: "Bài test mô phỏng bám sát năng lực công việc giúp HR và quản lý nhìn rõ chỗ mạnh, chỗ yếu trước khi thiết kế lộ trình đào tạo tiếp theo.",
        image: placeholderImage("https://image.ebomb.edu.vn/crop/350x170/toeic_img/news/2026/03/17/f541c02a-e77f-4496-89b8-a47d23385dcc.jpg", 720, 420, "fef2f2", "be123c"),
        href: "/ve-chung-toi/hoc-vien-diem-cao",
      },
      {
        title: "Khóa học tiếng Anh doanh nghiệp - từ học đến dùng được ngay",
        excerpt: "Điểm khác biệt không chỉ nằm ở kết quả test, mà ở khả năng nhân sự tự tin họp, trao đổi và xử lý tình huống tiếng Anh sau khóa học.",
        image: placeholderImage("https://image.ebomb.edu.vn/crop/350x170/toeic_img/news/2026/03/17/ad71c054-af8c-4d43-9334-ded6ba2ee7b8.jpg", 720, 420, "ecfeff", "0f766e"),
        href: "/ve-chung-toi/hoc-vien-diem-cao",
      },
    ],
  },
  steps: {
    ...toeic4SkillsPage.steps,
  },
  consult: {
    title: "Tham vấn 1-1 cho doanh nghiệp!",
    text: "Thiết kế lộ trình tiếng Anh phù hợp với mục tiêu, vị trí công việc và ngân sách đào tạo của đội ngũ. Chúng tôi sẽ giúp bạn bắt đầu bằng một kế hoạch rõ ràng và thực tế.",
    posterImage: placeholderImage("https://i.pinimg.com/736x/6c/e3/d7/6ce3d726b03253409e76b21f5e63afd1.jpg", 900, 1220, "dbeafe", "1d4ed8"),
    fields: [
      { type: "text", placeholder: "Họ và tên" },
      { type: "tel", placeholder: "Số điện thoại" },
      { type: "email", placeholder: "Email" },
      { type: "select", placeholder: "Bạn hiện đang là?", options: ["HR", "Training", "Manager", "Khác"] },
      { type: "select", placeholder: "Quy mô đội ngũ cần đào tạo", options: ["Dưới 10 người", "10 - 30 người", "30 - 100 người", "Trên 100 người"] },
      { type: "textarea", placeholder: "Mục tiêu đào tạo / kỹ năng doanh nghiệp đang cần" },
    ],
    submitLabel: "Giữ chỗ ngay",
    note: "* Vui lòng để ý điện thoại, chúng tôi sẽ liên hệ bạn sớm trong vòng 24h.",
    promo: "Nhanh tay lên, chỉ còn 100 suất thôi!",
  },
  teachers: {
    ...toeic4SkillsPage.teachers,
  },
};
