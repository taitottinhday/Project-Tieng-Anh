const placeholderImage = (
  label,
  width = 1400,
  height = 900,
  background = "e6edf9",
  foreground = "1f2937"
) =>
  `https://placehold.co/${width}x${height}/${background}/${foreground}?text=${encodeURIComponent(label)}`;

const courseMenu = [
  { slug: "toeic-2-ky-nang", label: "TOEIC 2 kỹ năng" },
  { slug: "toeic-4-ky-nang", label: "TOEIC 4 kỹ năng" },
  { slug: "khoa-hoc-cap-toc", label: "Khóa học cấp tốc" },
  { slug: "tieng-anh-doanh-nghiep", label: "Tiếng Anh doanh nghiệp" },
  { slug: "khoa-toeic-online", label: "Khóa TOEIC online" },
];

const coursePages = {
  "toeic-2-ky-nang": {
    slug: "toeic-2-ky-nang",
    title: "TOEIC 2 kỹ năng",
    eyebrow: "Khóa học TOEIC",
    promoStrip: {
      title: "Khóa TOEIC theo level",
      text: "Học viên đạt band TOEIC ngay sau khóa, cam kết đầu ra rõ ràng.",
      href: "/lich-khai-giang",
      hrefLabel: "Xem thêm",
      image: placeholderImage("Promo TOEIC 2 ky nang", 220, 220, "fff7ed", "9a3412"),
    },
    hero: {
      title: "Khóa học TOEIC",
      badge: "2 kỹ năng",
      subtitle: "Cam kết chỉ 10-12 tháng, từ mất gốc đạt 800+ TOEIC",
      text: "Lộ trình được thiết kế theo kiểu học cá nhân hóa: không dạy dàn trải tất cả mọi phần ngay từ đầu, mà chọn đúng nhóm kiến thức và kỹ năng cần cho từng giai đoạn để người học rút ngắn thời gian chinh phục mục tiêu.",
      ctaLabel: "Nhận tư vấn ngay",
      ctaHref: "/contact",
      stats: [
        { value: "300+", label: "Giáo viên TOEIC giàu kinh nghiệm" },
        { value: "1.000.000+", label: "Học viên đã chọn tin tưởng" },
        { value: "30+", label: "Cơ sở và điểm học trên toàn quốc" },
      ],
      collage: [
        { type: "text", label: "TOEIC 950+" },
        { type: "image", image: placeholderImage("GV 01", 420, 420, "dbeafe", "1d4ed8"), alt: "Giáo viên 1" },
        { type: "text", label: "300+ giáo viên" },
        { type: "image", image: placeholderImage("GV 02", 420, 420, "fee2e2", "be123c"), alt: "Giáo viên 2" },
        { type: "image", image: placeholderImage("GV 03", 420, 420, "fff7ed", "9a3412"), alt: "Giáo viên 3" },
        { type: "image", image: placeholderImage("GV 04", 420, 420, "ecfeff", "0f766e"), alt: "Giáo viên 4" },
        { type: "text", label: "Phương pháp R.I.P.L" },
        { type: "image", image: placeholderImage("GV 05", 420, 420, "ede9fe", "7c3aed"), alt: "Giáo viên 5" },
        { type: "image", image: placeholderImage("GV 06", 420, 420, "fef2f2", "b91c1c"), alt: "Giáo viên 6" },
        { type: "image", image: placeholderImage("GV 07", 420, 420, "dbeafe", "1d4ed8"), alt: "Giáo viên 7" },
        { type: "image", image: placeholderImage("GV 08", 420, 420, "fef3c7", "a16207"), alt: "Giáo viên 8" },
        { type: "text", label: "Đội ngũ giáo viên" },
      ],
    },
    benefits: {
      title: "Khám phá 04 lợi ích",
      highlight: "khi bạn có TOEIC 2 kỹ năng!",
      subtitle: "Có TOEIC rồi, cơ hội mở ra nhiều hơn bạn nghĩ đấy!",
      levels: ["450+", "650+", "700+"],
      items: [
        "Đáp ứng nhu cầu đầu ra đại học",
        "Tăng khả năng trúng job xịn ở các tập đoàn lớn",
        "Được miễn 1 số học phần ở trường Đại học",
        "Xét tuyển thẳng vào các trường Đại học top",
      ],
      image: placeholderImage("Sinh vien tot nghiep", 860, 980, "dbeafe", "1d4ed8"),
    },
    stories: {
      title: "Chúng tớ đã bứt phá TOEIC",
      highlight: "như thế nào?",
      featured: {
        title: "Hành trình đến 990 TOEIC - Nữ sinh đại học Đại Nam đã học thế nào?",
        excerpt: "Thùy Dương từng là một học viên có nền tảng tiếng Anh nhưng học theo bản năng, ngại luyện đề và dễ hụt nhịp ở phần ngữ pháp. Với nhịp học chỉn chu, chữa bài sát và sự đồng hành của giáo viên, bạn đã đạt kết quả 990 TOEIC và thay đổi hoàn toàn cách tiếp cận đề thi.",
        metaTitle: "Học viên",
        metaValue: "Lại Thùy Dương — Sinh viên năm 4",
        image: placeholderImage("Story featured 990", 900, 640, "fdf2f8", "831843"),
      },
      items: [
        {
          title: "14 tuổi sở hữu chứng chỉ TOEIC 915 điểm - học viên bứt phá sớm",
          excerpt: "Bản đồ học tập rõ ràng giúp Quốc Khánh giữ nhịp đều và tạo đà bứt phá dù tuổi còn rất nhỏ.",
          metaTitle: "Học viên",
          metaValue: "Quốc Khánh — Học sinh cấp 2",
          image: placeholderImage("Story 915", 760, 620, "fff7ed", "9a3412"),
        },
        {
          title: "Từ 615 đến 890 TOEIC - Đắc Hiếu bứt phá ngoạn mục",
          excerpt: "Câu chuyện dành cho những ai đang tìm cách tăng điểm nhanh nhưng vẫn cần nền tảng bền và không học mẹo.",
          metaTitle: "Học viên",
          metaValue: "Khắc Hiếu — Sinh viên năm 4",
          image: placeholderImage("Story 890", 760, 620, "dbeafe", "1d4ed8"),
        },
      ],
      ctaLabel: "Xem thêm...",
      ctaHref: "/ve-chung-toi/hoc-vien-diem-cao",
    },
    pillars: {
      title: "Bí quyết giúp 800.000+ học viên",
      highlight: "cán đích TOEIC thành công!",
      items: [
        {
          title: "Lộ trình TOEIC tinh gọn & hiệu quả",
          text: "Lộ trình cá nhân hóa bám sát mục tiêu đầu ra, giúp tiết kiệm thời gian, học phí và đạt band điểm mục tiêu nhanh hơn.",
          tone: "soft",
        },
        {
          title: "Đội ngũ sứ giả truyền cảm hứng",
          text: "Hơn 300+ giáo viên TOEIC giỏi kiến thức, giỏi sửa lỗi và luôn đồng hành cùng bạn trong suốt hành trình.",
          tone: "primary",
        },
        {
          title: "Giáo trình độc quyền & NXB uy tín",
          text: "Giáo trình kết hợp cùng workbook nội bộ và sổ tay học viên, giúp tiết kiệm 50% thời gian ôn luyện.",
          tone: "soft",
        },
        {
          title: "Phương pháp RIPL độc quyền",
          text: "Học theo chủ đề, dễ hiểu, dễ nhớ và dễ vận dụng để tăng điểm đều qua từng giai đoạn.",
          tone: "soft",
        },
      ],
      ctaLabel: "Đăng ký học thử",
      ctaHref: "/register-course",
    },
    roadmap: {
      title: "Lộ trình TOEIC 2 kỹ năng",
      subtitle: "Cùng bạn tự tin chinh phục điểm cao",
      desc: "Tự tin làm chủ TOEIC với phương pháp RIPL cùng sự đồng hành tận tình từ giáo viên và trợ giảng, sử dụng giáo trình quốc tế và kho practice online đồng bộ.",
      tiers: [
        { duration: "24 buổi", range: "300 - 350", label: "TOEIC PRE", tone: "gold" },
        { duration: "24 buổi", range: "450 - 500", label: "TOEIC A", tone: "amber" },
        { duration: "24 buổi", range: "600 - 650", label: "TOEIC B", tone: "mint" },
        { duration: "12 buổi", range: "Tăng 50 - 70 điểm", label: "TOEIC LUYỆN ĐỀ", tone: "teal" },
      ],
      supportRows: [
        { label: "Đầu vào", text: "Mất gốc, mới bắt đầu học TOEIC" },
        { label: "Dịch vụ bổ trợ", text: "Bổ trợ 1 buổi/tuần + tutoring 5 buổi/tuần với mentor và kho practice online" },
        { label: "Kiến thức bổ trợ", text: "Xây nền vững chắc với phát âm, từ vựng căn bản và các cấu trúc nền tảng xuất hiện nhiều trong đề" },
        { label: "Các bài kiểm tra", text: "Luyện tập có hệ thống theo từng nhóm chủ đề, mini test định kỳ và checkpoint cuối chặng" },
      ],
      knowledgeCards: [
        {
          title: "Ngữ âm",
          text: "200+ từ vựng A1-A2 CEFR, luyện 12 chủ đề từ vựng cơ bản quen thuộc hay xuất hiện trong mỗi phần thi TOEIC.",
        },
        {
          title: "Từ vựng",
          text: "Học phát âm từ đơn vị nhỏ nhất cho tới tổ hợp thành phần lớn như từ, cụm từ và collocation nền tảng.",
        },
        {
          title: "Ngữ pháp",
          text: "6 thì, hiện tại đơn, quá khứ đơn, tương lai, 7 loại từ, 4 loại câu và các điểm ngữ pháp quan trọng cho Part 5-7.",
        },
      ],
      tableRows: [
        { session: "Buổi 1", skill: "Reading 1", content: "Parts 5, 6, 7 - Nouns & Pronouns", review: "" },
        { session: "Buổi 2", skill: "Listening 1", content: "Part 1 - Photos of People", review: "" },
        { session: "Buổi 3", skill: "Reading 2", content: "Parts 5, 6, 7 - Adjectives & Adverbs", review: "Minitest Part 1" },
        { session: "Buổi 4", skill: "Listening 2", content: "Part 1 - Photos of Objects & Scenes", review: "" },
        { session: "Buổi 5", skill: "Reading 3", content: "Parts 5, 6, 7 - Verb Tenses", review: "" },
        { session: "Buổi 6", skill: "Listening 3", content: "Part 2 - Information Questions", review: "Minitest Part 5" },
        { session: "Buổi 7", skill: "Reading 4", content: "Parts 5, 6, 7 - Active & Passive", review: "" },
        { session: "Buổi 8", skill: "Listening 4", content: "Part 2 - Yes/No Questions & Negatives", review: "" },
      ],
    },
    resources: {
      title: "Giáo trình 4.0 – Bệ phóng đạt điểm cao TOEIC",
      items: [
        { title: "Work Book", subtitle: "Bài tập", image: placeholderImage("Workbook", 720, 520, "eef2ff", "1d4ed8") },
        { title: "Student Book", subtitle: "Sách học", image: placeholderImage("Student Book", 720, 520, "fff7ed", "9a3412") },
        { title: "AI Chấm Chữa", subtitle: "Trợ lý học", image: placeholderImage("AI cham chua", 720, 520, "ecfeff", "0f766e") },
        { title: "App Học Online", subtitle: "Ứng dụng học", image: placeholderImage("App hoc online", 720, 520, "fdf2f8", "831843") },
      ],
    },
    steps: {
      title: "Sẵn sàng chinh phục TOEIC!",
      highlight: "Chỉ mất 3 bước để bắt đầu",
      desc: "Ghi danh lớp học TOEIC đơn giản, thao tác cực nhanh. Đa dạng học offline/online, đáp ứng mọi nhu cầu học tập.",
      items: [
        "Đăng ký tư vấn",
        "Test thử và nhận tư vấn trực tiếp",
        "Chọn lớp học phù hợp",
      ],
      banner: "Cơ hội luôn thuộc về người biết nắm bắt! Hơn 800.000 học viên mất gốc/mới bắt đầu học TOEIC đã thành công.",
      ctaLabel: "Khám phá ngay",
      ctaHref: "/register-course",
    },
    consult: {
      title: "Đăng ký test trình độ miễn phí và nhận tư vấn chuyên sâu",
      bullets: [
        "Inbox để được hỗ trợ nhanh chóng",
        "Liên hệ qua hotline 0934 489 666",
        "Khám phá địa chỉ 30+ cơ sở trên toàn quốc",
      ],
      collage: [
        placeholderImage("Consult 01", 420, 320, "fef2f2", "be123c"),
        placeholderImage("Consult 02", 420, 320, "dbeafe", "1d4ed8"),
        placeholderImage("Consult 03", 420, 320, "fff7ed", "9a3412"),
        placeholderImage("Consult 04", 420, 320, "ecfeff", "0f766e"),
        placeholderImage("Consult 05", 420, 320, "ede9fe", "7c3aed"),
      ],
      formTitle: "Tham vấn 1-1 cùng giáo viên!",
      formText: "Chinh phục thần tốc mục tiêu TOEIC với Thầy Tài TOEIC. Hơn 1.000.000 học viên đã thành công cán đích.",
      primaryLabel: "Đăng ký nhận tư vấn",
      secondaryLabel: "Tư vấn qua Facebook Messenger",
      secondaryHref: "/contact",
    },
    teachers: {
      title: "Đồng hành cùng 300+ giáo viên",
      highlight: "truyền cảm hứng",
      desc: "Chuyên môn giỏi, giàu kinh nghiệm và tận tâm trong từng giờ học.",
      items: [
        { name: "Mr. Minh Đồng", role: "Teacher at Thầy Tài TOEIC", image: placeholderImage("Teacher 01", 480, 620, "dbeafe", "1d4ed8") },
        { name: "Ms. Ngọc Phụng", role: "Teacher at Thầy Tài TOEIC", image: placeholderImage("Teacher 02", 480, 620, "fee2e2", "be123c") },
        { name: "Mr. Lê Phương", role: "Teacher at Thầy Tài TOEIC", image: placeholderImage("Teacher 03", 480, 620, "fff7ed", "9a3412") },
        { name: "Ms. Thu Hà", role: "Teacher at Thầy Tài TOEIC", image: placeholderImage("Teacher 04", 480, 620, "ecfeff", "0f766e") },
        { name: "Ms. Mỹ Duyên", role: "Teacher at Thầy Tài TOEIC", image: placeholderImage("Teacher 05", 480, 620, "ede9fe", "7c3aed") },
      ],
      ctaLabel: "Tìm hiểu đội ngũ giáo viên",
      ctaHref: "/ve-chung-toi/doi-ngu-giao-vien",
    },
    faq: [
      {
        q: "TOEIC là gì?",
        a: "TOEIC là bài thi đánh giá năng lực tiếng Anh giao tiếp quốc tế, tập trung vào môi trường học tập và làm việc. Đây là chứng chỉ phổ biến khi xét đầu ra đại học, tuyển dụng và thăng tiến.",
      },
      {
        q: "Tôi có thể tự học TOEIC được không?",
        a: "Bạn có thể tự học, nhưng với người mất gốc hoặc cần chạm mốc điểm trong thời gian ngắn thì một lộ trình có giáo viên theo sát sẽ giúp tiết kiệm rất nhiều thời gian thử sai.",
      },
      {
        q: "TOEIC có giao tiếp được không?",
        a: "TOEIC 2 kỹ năng tập trung vào nghe và đọc, nhưng nếu học đúng cách bạn vẫn phát triển được vốn từ, phản xạ nghe và nền tảng để bước sang giao tiếp hoặc TOEIC 4 kỹ năng.",
      },
      {
        q: "Chứng chỉ TOEIC có được công nhận không?",
        a: "TOEIC được nhiều trường đại học, doanh nghiệp và tổ chức tại Việt Nam sử dụng để xét đầu ra, tuyển dụng và đánh giá năng lực tiếng Anh thực tế.",
      },
      {
        q: "Học TOEIC bao lâu đạt mục tiêu?",
        a: "Điều này phụ thuộc đầu vào và thời lượng học của bạn. Với người mất gốc, lộ trình 10-12 tháng được thiết kế để đi từ nền tảng đến mốc 700-800+ một cách bền vững hơn.",
      },
      {
        q: "Thầy Tài TOEIC có cam kết đầu ra không?",
        a: "Lộ trình được tư vấn rõ đầu vào, mục tiêu đầu ra và điều kiện theo sát. Khi học viên bám đúng nhịp học và hoàn thành checkpoint, hệ thống sẽ đồng hành đến khi chạm mốc mục tiêu đã thống nhất.",
      },
      {
        q: "Nên chọn TOEIC hay IELTS?",
        a: "Nếu mục tiêu của bạn là đầu ra đại học, xin việc hoặc môi trường doanh nghiệp trong nước, TOEIC thường là lựa chọn phù hợp hơn. Nếu hướng đến du học hoặc học thuật quốc tế, IELTS sẽ phù hợp hơn.",
      },
      {
        q: "Cách đăng ký thi TOEIC như thế nào?",
        a: "Bạn có thể đăng ký tại các đơn vị tổ chức chính thức như IIG. Trung tâm có thể hỗ trợ bạn xác định thời điểm thi phù hợp và ôn bám sát trước kỳ thi.",
      },
    ],
  },
  "toeic-4-ky-nang": {
    slug: "toeic-4-ky-nang",
    title: "TOEIC 4 kỹ năng",
    eyebrow: "Khóa học TOEIC",
    placeholder: true,
    summary: "Trang chi tiết cho TOEIC 4 kỹ năng sẽ được dựng tiếp ở bước sau. Hiện tại bạn có thể xem overview khóa học hoặc đăng ký tư vấn trước.",
  },
  "khoa-hoc-cap-toc": {
    slug: "khoa-hoc-cap-toc",
    title: "Khóa học cấp tốc",
    eyebrow: "Khóa học TOEIC",
    placeholder: true,
    summary: "Phần landing page cấp tốc sẽ được bổ sung sau khi bạn gửi mẫu tiếp theo.",
  },
  "tieng-anh-doanh-nghiep": {
    slug: "tieng-anh-doanh-nghiep",
    title: "Tiếng Anh doanh nghiệp",
    eyebrow: "Khóa học TOEIC",
    placeholder: true,
    summary: "Landing page tiếng Anh doanh nghiệp đang chờ bộ ảnh và định hướng nội dung tiếp theo của bạn.",
  },
  "khoa-toeic-online": {
    slug: "khoa-toeic-online",
    title: "Khóa TOEIC online",
    eyebrow: "Khóa học TOEIC",
    placeholder: true,
    summary: "Landing page khóa TOEIC online sẽ được triển khai tiếp ở vòng sau để đồng bộ với các chương trình còn lại.",
  },
};

const getCoursePage = (slug) => coursePages[slug] || null;

module.exports = {
  courseMenu,
  getCoursePage,
};
