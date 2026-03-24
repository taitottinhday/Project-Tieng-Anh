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
  slug: "khoa-hoc-cap-toc",
  title: "Khóa học cấp tốc",
  eyebrow: "Khóa học TOEIC",
  hero: {
    title: "Khóa học TOEIC cấp tốc",
    text: "Chương trình học được thiết kế cá nhân hóa phù hợp với trình độ, thời gian của mỗi học viên muốn đạt điểm cao trong thời gian ngắn. Thầy Tài TOEIC cam kết chất lượng đầu ra 100%.",
    chips: ["TOEIC 450+", "TOEIC 600+", "TOEIC 800+"],
    ctaLabel: "Nhận tư vấn ngay",
    ctaHref: "/contact",
    image: placeholderImage("https://r2.ebomb.edu.vn/toeic_img/page/2026/01/15/483843c7-a64b-4a4b-884c-ca6131901fff.png", 980, 860, "dbeafe", "1d4ed8"),
  },
  solutionHighlights: {
    lead: "Bạn hoàn toàn có thể bứt tốc TOEIC nhanh hơn hiệu quả hơn, khi sở hữu",
    title: '"Bộ giải pháp ưu việt" tại Thầy Tài TOEIC',
    items: [
      {
        title: "Lộ trình TOEIC tinh gọn & hiệu quả",
        text: "Lộ trình cá nhân hóa, tinh gọn, bám sát mục tiêu đầu ra giúp tiết kiệm thời gian, học phí và đạt band điểm mục tiêu nhanh hơn.",
        image: placeholderImage("https://image.ebomb.edu.vn/resize/320x260/toeic_img/page/2026/03/19/6d2e8b82-5097-4e60-a020-204fcf2e1e3b.jpg", 720, 520, "eef6ff", "2563eb"),
      },
      {
        title: "Đội ngũ sứ giả truyền cảm hứng",
        text: "Hơn 300+ giáo viên TOEIC 950+ giỏi kiến thức, giỏi kỹ năng và luôn đồng hành, sửa lỗi tỉ mỉ cùng bạn trong suốt hành trình.",
        image: placeholderImage("https://image.ebomb.edu.vn/resize/320x260/toeic_img/page/2026/03/19/d55a3594-d51d-4d24-9774-38ea48b2bdba.jpg", 720, 520, "fef2f2", "b91c1c"),
      },
      {
        title: "Giáo trình độc quyền, NXB uy tín",
        text: "Giáo trình độc quyền kết hợp cùng NXB uy tín và sổ tay học viên giúp hiểu sâu, tiết kiệm 50% thời gian ôn luyện TOEIC.",
        image: placeholderImage("https://image.ebomb.edu.vn/resize/320x260/toeic_img/page/2026/03/19/28a9b1ff-c79f-4162-9772-1ddbe99bc7f0.jpg", 720, 520, "eff6ff", "0f766e"),
      },
      {
        title: "Phương pháp RIPL độc quyền",
        text: "Phương pháp học tinh gọn, tiết kiệm thời gian, thực hành tối đa, phát triển đều các kỹ năng TOEIC. Học dễ hiểu, dễ nhớ và dễ về đích.",
        image: placeholderImage("https://image.ebomb.edu.vn/resize/320x260/toeic_img/page/2026/03/19/8c17adbf-b348-4724-b72b-79aa49d6ac92.jpg", 720, 520, "eef6ff", "7c3aed"),
      },
    ],
  },
  roadmap: {
    ...toeic4SkillsPage.roadmap,
    title: "Lộ trình TOEIC cấp tốc",
    subtitle: "Cùng bạn bứt tốc, học đúng trọng tâm",
  },
  learningModel: {
    title: "Mô hình học tập linh hoạt",
    subtitle: "Chọn cách phù hợp nhất cho bạn!",
    primary: {
      title: "Lớp học nhóm nhỏ",
      bullets: [
        "Sĩ số giới hạn, dễ tương tác cùng giáo viên.",
        "Môi trường học tập năng động, thực hành nhiều.",
        "Học hỏi từ bạn bè, tạo động lực và sự gắn kết.",
      ],
      image: placeholderImage("https://image.ebomb.edu.vn/crop/540x320/toeic_img/page/2026/01/15/ac4c72b8-d3d9-4f36-8361-a62b40dd79bc.png", 900, 620, "eef6ff", "2563eb"),
    },
    secondary: {
      title: "Lớp học 1 kèm 1",
      bullets: [
        "Giáo viên theo sát, chỉnh sửa chi tiết từng lỗi.",
        "Lộ trình cá nhân hóa theo đúng mục tiêu của bạn.",
        "Tốc độ học nhanh, tập trung tối đa vào điểm yếu.",
      ],
      image: placeholderImage("https://image.ebomb.edu.vn/crop/540x320/toeic_img/page/2026/01/15/159b6cd8-887e-4369-b59c-4ace26b09f53.png", 900, 620, "fef2f2", "b91c1c"),
    },
  },
  resources: toeic4SkillsPage.resources,
  steps: toeic4SkillsPage.steps,
  stories: {
    ...toeic4SkillsPage.stories,
    title: "Những hành trình rực rỡ",
    highlight: "đã được viết lên tại Thầy Tài TOEIC",
  },
  faq: [
    {
      q: "Trung tâm có test đầu vào không?",
      a: "Có. Học viên sẽ được test đầu vào miễn phí để xác định đúng trình độ hiện tại, từ đó được tư vấn lộ trình cấp tốc phù hợp với mục tiêu và thời gian học.",
    },
    {
      q: "Thầy Tài có cam kết đầu ra không?",
      a: "Có. Lộ trình được tư vấn rõ đầu vào, mục tiêu đầu ra và điều kiện theo sát. Khi học viên bám đúng nhịp học và hoàn thành checkpoint, trung tâm sẽ đồng hành đến khi chạm mốc đã thống nhất.",
    },
    {
      q: "Nên chọn TOEIC hay IELTS?",
      a: "Nếu mục tiêu của bạn là đầu ra Đại học, xin việc hoặc môi trường doanh nghiệp trong nước thì TOEIC thường là lựa chọn phù hợp và tối ưu thời gian hơn. IELTS phù hợp hơn cho du học hoặc môi trường học thuật quốc tế.",
    },
    {
      q: "Cách đăng ký thi TOEIC",
      a: "Bạn có thể đăng ký tại các đơn vị tổ chức chính thức như IIG. Trung tâm có thể hỗ trợ bạn xác định thời điểm thi phù hợp và kế hoạch ôn bám sát trước kỳ thi.",
    },
  ],
  consult: {
    title: "Tham vấn 1-1 cùng giáo viên!",
    text: "Chinh phục thần tốc mục tiêu TOEIC với Thầy Tài TOEIC. Hơn 1.000.000 học viên đã thành công cán đích. Bạn có muốn trở thành người tiếp theo?",
    posterImage: placeholderImage("https://r2.ebomb.edu.vn/toeic_img/page/2026/01/15/a92e3dff-7ba2-48e2-8d8f-4c39f0c77ccf.png", 900, 1220, "dbeafe", "1d4ed8"),
    fields: [
      { type: "text", placeholder: "Họ và tên" },
      { type: "tel", placeholder: "Số điện thoại" },
      { type: "email", placeholder: "Email" },
      { type: "select", placeholder: "Bạn hiện đang là?", options: ["Học sinh", "Sinh viên", "Người đi làm"] },
      { type: "select", placeholder: "Cơ sở gần bạn nhất", options: ["Cầu Giấy", "Nam Từ Liêm", "Online", "Khác"] },
      { type: "textarea", placeholder: "Mục tiêu điểm / nhu cầu học của bạn" },
    ],
    submitLabel: "Giữ chỗ ngay",
    note: "Vui lòng để ý điện thoại, chúng tôi sẽ liên hệ bạn sớm (trong vòng 24h).",
    promo: "Nhanh tay lên, chỉ còn 100 suất thôi!",
  },
  supportContact: {
    title: "Đăng ký test trình độ miễn phí",
    highlight: "và nhận tư vấn chuyên sâu",
    bullets: [
      "Inbox để được hỗ trợ nhanh chóng",
      "Liên hệ qua hotline 0934 489 666",
      "Khám phá địa chỉ 30+ cơ sở trên toàn quốc",
    ],
    collage: [
      placeholderImage("https://image.ebomb.edu.vn/crop/400x500/toeic_img/teacher/2026/03/04/707718b2-32ba-4a6b-b9f7-86e023e2c993.png", 420, 320, "fef2f2", "be123c"),
      placeholderImage("https://image.ebomb.edu.vn/crop/400x500/toeic_img/teacher/2026/03/04/66bf791d-a2c0-4592-8283-60a8efee961a.png", 420, 320, "dbeafe", "1d4ed8"),
      placeholderImage("https://image.ebomb.edu.vn/crop/400x500/toeic_img/teacher/2026/03/04/39c0abbe-9f7a-4645-8a44-2eb16973a9fd.png", 420, 320, "fff7ed", "9a3412"),
      placeholderImage("https://image.ebomb.edu.vn/crop/400x500/toeic_img/teacher/2026/03/04/6090742c-b199-42ee-a6aa-2b27d066898f.png", 420, 320, "ecfeff", "0f766e"),
      placeholderImage("https://image.ebomb.edu.vn/crop/400x500/toeic_img/teacher/2026/03/04/596be1c4-f342-453a-980e-f4adad599543.png", 420, 320, "ede9fe", "7c3aed"),
    ],
  },
};
