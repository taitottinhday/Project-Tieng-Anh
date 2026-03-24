const placeholderImage = (
  label,
  width = 1400,
  height = 900,
  background = "e6edf9",
  foreground = "1f2937"
) =>
  `https://placehold.co/${width}x${height}/${background}/${foreground}?text=${encodeURIComponent(label)}`;

module.exports = {
  slug: "toeic-4-ky-nang",
  title: "TOEIC 4 kỹ năng",
  eyebrow: "Khóa học TOEIC",
  hero: {
    title: "Khóa học TOEIC 4 kỹ năng",
    text: "Lộ trình tinh gọn giúp bạn phát triển toàn diện 4 kỹ năng TOEIC, dễ dàng chinh phục mục tiêu cấp tốc tại Thầy Tài TOEIC.",
    ctaLabel: "Nhận tư vấn ngay",
    ctaHref: "/contact",
    image: placeholderImage("Hero TOEIC 4 ky nang", 960, 860, "dbeafe", "1d4ed8"),
    stats: [
      { value: "300+", label: "Giáo viên TOEIC hàng đầu VN" },
      { value: "1.000.000+", label: "Học viên đã chọn tin tưởng" },
      { value: "30+", label: "Cơ sở trên toàn quốc" },
    ],
  },
  valueGrid: {
    title: "Lợi ích khi có TOEIC 4 kỹ năng",
    subtitle: "Chìa khóa khơi mở cơ hội, bước đệm chinh phục tương lai",
    description:
      "Sở hữu chứng chỉ TOEIC 4 kỹ năng không chỉ chứng minh năng lực tiếng Anh toàn diện mà còn trở thành điểm cộng nổi bật trong mắt nhà tuyển dụng, mở lối vào môi trường làm việc chuyên nghiệp, học tập và giao tiếp quốc tế.",
    items: [
      {
        icon: "01",
        title: "Đáp ứng chuẩn đầu ra Đại học, làm đẹp CV",
        text: "Lộ trình cá nhân hóa, tinh gọn, bám sát mục tiêu đầu ra giúp tiết kiệm thời gian, học phí và đạt band điểm mục tiêu nhanh hơn.",
      },
      {
        icon: "02",
        title: "Lương cao gõ cửa, cơ hội việc làm rộng mở",
        text: "Hơn 300+ giáo viên TOEIC 950+ luôn đồng hành và sửa lỗi tỉ mỉ cùng bạn trong suốt hành trình học.",
        tone: "primary",
      },
      {
        icon: "03",
        title: "Tự tin giao tiếp trong môi trường quốc tế",
        text: "Giáo trình độc quyền kết hợp sổ tay học viên giúp hiểu sâu, nhớ lâu và dùng được ngay trong công việc và cuộc sống.",
      },
      {
        icon: "04",
        title: "Miễn thi THPT, xét tuyển thẳng Đại học",
        text: "Học theo chủ đề, dễ hiểu, dễ nhớ, tiết kiệm thời gian nhưng vẫn tăng điểm đều và bền vững ở cả 4 kỹ năng.",
      },
    ],
  },
  audience: {
    title: "TOEIC 4 kỹ năng dành cho ai...",
    intro:
      "Dù bạn là người mới bắt đầu với TOEIC, đã có nền tảng tiếng Anh nhưng muốn luyện sâu hơn hai kỹ năng trọng tâm, hay cần chứng chỉ để xét tốt nghiệp, đi làm, khóa học này đều phù hợp.",
    image: placeholderImage("Doi tuong TOEIC 4 ky nang", 760, 980, "eef6ff", "1d4ed8"),
    left: [
      {
        title: "Học lại sau thời gian dài bỏ tiếng Anh",
        text: "Học mãi không nhớ, làm hoài vẫn sai, dần nản và bỏ cuộc.",
      },
      {
        title: "Phương pháp học không phù hợp",
        text: "Học kiểu cũ quá tải, học mẹo thiếu gốc nên điểm chưa khá hơn.",
      },
    ],
    right: [
      {
        title: "Lộ trình rời rạc, điểm không tăng",
        text: "Không kiểm soát kiến thức đã học, gặp gì học đó nên kết quả khó bứt lên.",
      },
      {
        title: "Thiếu người đồng hành, mất động lực",
        text: "Học theo cảm xúc, lúc nhớ lúc quên phải học, không ai nhắc và không ai sửa.",
      },
    ],
  },
  solutions: {
    title: "Giải pháp đào tạo TOEIC toàn diện tại Thầy Tài",
    image: placeholderImage("Giai phap TOEIC 4 ky nang", 760, 1100, "edf7ff", "0f766e"),
    left: [
      {
        title: "Test đầu vào & định hình tư duy học ngôn ngữ đúng",
        text: "Học viên được kiểm tra năng lực toàn diện ngay từ đầu, từ đó định hình tư duy học tiếng Anh đúng cách và lộ trình học cá nhân hóa phù hợp.",
        tags: ["Lộ trình 500+ TOEIC", "Lộ trình 650+ TOEIC", "Lộ trình 750+ TOEIC"],
      },
      {
        title: "Phương pháp RIPL độc quyền - học tinh gọn, hiệu quả gấp đôi",
        text: "Tập trung vào kiến thức cốt lõi và dạng bài trọng tâm, kết hợp luyện tập sát đề để hiểu bản chất, ghi nhớ lâu và áp dụng ngay.",
      },
    ],
    right: [
      {
        title: "Tài liệu & công nghệ học tập cá nhân hóa",
        text: "Học viên được hưởng hệ thống giáo trình độc quyền kết hợp nền tảng công nghệ học tập hiện đại giúp theo sát tiến trình và tối ưu hiệu quả học tập.",
        tags: ["LMS 5.0 Plus", "AI chấm chữa TOEIC 24/7", "Lớp bổ trợ kỹ năng hàng tuần"],
      },
      {
        title: "Đội ngũ giảng viên TOEIC chất lượng cao toàn quốc",
        text: "Quy tụ 300+ giáo viên đạt 950+ TOEIC, được tuyển chọn và đào tạo bài bản theo triết lý M-K-S để đồng hành cùng học viên lâu dài.",
      },
    ],
    ctaLabel: "Trải nghiệm học thử",
    ctaHref: "/register-course",
  },
  roadmap: {
    stamp: "Cam kết đầu ra bằng văn bản",
    title: "Lộ trình TOEIC Mastery",
    subtitle: "TOEIC 4 kỹ năng - Giao tiếp thành thạo",
    tiers: [
      {
        duration: "26 buổi",
        level: "A2",
        label: "FOUNDATION",
        tone: "blue",
        active: true,
        scores: [
          { label: "Listening & Reading", value: "300-350" },
          { label: "Speaking & Writing", value: "35-65" },
        ],
      },
      {
        duration: "26 buổi",
        level: "A2+",
        label: "DEVELOPMENT",
        tone: "sky",
        scores: [
          { label: "Listening & Reading", value: "450-500" },
          { label: "Speaking & Writing", value: "70-110" },
        ],
      },
      {
        duration: "26 buổi",
        level: "B1",
        label: "INTENSIVE",
        tone: "teal",
        scores: [
          { label: "Listening & Reading", value: "600-650" },
          { label: "Speaking & Writing", value: "115-150" },
        ],
      },
      {
        duration: "14 buổi",
        level: "B1+",
        label: "TOEIC MASTERY (S & W)",
        tone: "pink",
        scores: [{ label: "Speaking & Writing", value: "Tăng 20-50" }],
      },
      {
        duration: "14 buổi",
        level: "B1+",
        label: "TOEIC MASTERY (L & R)",
        tone: "hotpink",
        scores: [{ label: "Listening & Reading", value: "Tăng 50-100" }],
      },
    ],
    supportRows: [
      { label: "Đầu vào", text: "Mất gốc, mới bắt đầu học TOEIC hoặc đã học rời rạc nhưng cần hệ thống lại toàn bộ nền tảng." },
      { label: "Dịch vụ bổ trợ", text: "Bổ trợ 1 buổi/tuần + tutoring 5 buổi/tuần cùng mentor, kho practice online và lịch chữa bài định kỳ." },
      { label: "Kiến thức bổ trợ", text: "Xây nền vững chắc với phát âm, từ vựng nền và ngữ pháp cốt lõi để dùng được ngay trong giao tiếp và bài thi." },
      { label: "Các bài kiểm tra", text: "Luyện tập có hệ thống theo từng nhóm chủ đề, mini test định kỳ, progress test giữa kỳ và cuối kỳ cho đủ 4 kỹ năng." },
    ],
    knowledgeCards: [
      {
        title: "Ngữ âm",
        text: "Học nghe và luyện tập cách phát âm từ đơn vị nhỏ nhất cho tới từng thành phần lớn như từ, cụm từ và câu mẫu.",
      },
      {
        title: "Từ vựng",
        text: "250+ từ vựng A1-A2 CEFR theo 17 chủ đề quen thuộc, gắn trực tiếp với giao tiếp đời sống và bài thi TOEIC.",
      },
      {
        title: "Ngữ pháp",
        text: "8 thì, 8 loại từ, 5 loại câu cùng các điểm ngữ pháp cốt lõi như bị động, hòa hợp chủ vị và câu điều kiện.",
      },
    ],
    rows: [
      { session: "Buổi 1", topic: "Daily routines", content: "Vocab<br>- Daily routines<br>- Days of the week<br><br>Grammar<br>- Present Simple<br>- Adverbs of frequency", review: "" },
      { session: "Buổi 2", topic: "Sports & exercises", content: "Vocab<br>- Sports, exercise, hobbies<br><br>Grammar<br>- Modal verbs: can<br>- Imperatives", review: "" },
      { session: "Buổi 3", topic: "Life events", content: "Vocab<br>- Past events<br>- Life stages<br><br>Grammar<br>- Past Simple<br>- Time expressions", review: "" },
      { session: "Buổi 4", topic: "Technology", content: "Vocab<br>- Devices & online activities<br><br>Grammar<br>- Present Continuous", review: "Minitest 1" },
      { session: "Buổi 5", topic: "Recommendations", content: "Vocab<br>- Places & services<br><br>Grammar<br>- Should for advice", review: "" },
      { session: "Buổi 6", topic: "Shopping", content: "Vocab<br>- Shopping & prices<br><br>Grammar<br>- Countable / uncountable nouns", review: "" },
      { session: "Buổi 7", topic: "Food and drinks", content: "Vocab<br>- Food & drinks<br><br>Grammar<br>- Singular & plural nouns<br>- This, that, these, those", review: "Minitest 2" },
      { session: "Buổi 8", topic: "Future plans", content: "Vocab<br>- Action verbs<br><br>Grammar<br>- Will<br>- Be going to", review: "" },
      { session: "Buổi 9", topic: "Clothing", content: "Vocab<br>- Clothes & colors<br><br>Grammar<br>- Adjectives to describe clothes", review: "" },
      { session: "Buổi 10", topic: "Review 2", content: "Adjectives, adverbs, demonstratives, quantities, likes & dislikes", review: "Minitest 3" },
      { session: "Buổi 11", topic: "Practice 1", content: "Speaking prompts + Listening checkpoint + Writing correction", review: "" },
      { session: "Buổi 12", topic: "PROGRESS TEST 1", content: "Midterm test Reading & Listening & Writing", review: "", milestone: true },
      { session: "Buổi 13", topic: "At the office", content: "Vocab<br>- Office affairs, office supplies<br><br>Grammar<br>- Nouns<br>- Pronouns", review: "" },
      { session: "Buổi 14", topic: "Travelling", content: "Vocab<br>- Travelling, booking a flight<br><br>Grammar<br>- Verb tenses tổng hợp", review: "" },
      { session: "Buổi 15", topic: "Dining out", content: "Vocab<br>- Food terms, restaurants<br><br>Grammar<br>- Subject-verb agreement", review: "Minitest 4" },
      { session: "Buổi 16", topic: "Technology 2", content: "Vocab<br>- Devices & activities with technology<br><br>Grammar<br>- Passive voice", review: "" },
      { session: "Buổi 17", topic: "Review 3", content: "Review tenses, pronouns, passive voice và các topic đã học", review: "" },
      { session: "Buổi 18", topic: "Leisure activities", content: "Vocab<br>- Hobbies & leisure activities<br><br>Grammar<br>- Comparisons", review: "" },
      { session: "Buổi 19", topic: "Health", content: "Vocab<br>- Symptoms, treatment<br><br>Grammar<br>- Too / enough", review: "Minitest 5" },
      { session: "Buổi 20", topic: "Transportation", content: "Vocab<br>- Means of transport, schedules<br><br>Grammar<br>- Prepositions of movement", review: "" },
      { session: "Buổi 21", topic: "Accommodation", content: "Vocab<br>- Hotels, booking, facilities<br><br>Grammar<br>- Relative clauses cơ bản", review: "" },
      { session: "Buổi 22", topic: "Customer service", content: "Vocab<br>- Problems with services<br><br>Grammar<br>- Conditional sentences cơ bản", review: "Minitest 6" },
      { session: "Buổi 23", topic: "Review 4", content: "Hệ thống hóa toàn bộ nhóm chủ đề giao tiếp thông dụng trước bài test cuối", review: "" },
      { session: "Buổi 24", topic: "Practice 2", content: "Speaking simulation + Writing task + Listening / Reading wrap-up", review: "" },
      { session: "Buổi 25", topic: "PROGRESS TEST 2", content: "Final test Reading & Listening", review: "", milestone: true },
      { session: "Buổi 26", topic: "PROGRESS TEST 2", content: "Final test Writing & Speaking", review: "", milestone: true },
    ],
  },
  resources: {
    title: "Giáo trình 4.0 - Bệ phóng đạt điểm cao TOEIC",
    items: [
      { title: "Work Book", subtitle: "Bài tập", image: placeholderImage("Workbook 4 ky nang", 720, 520, "eef2ff", "1d4ed8") },
      { title: "Student Book", subtitle: "Sách học", image: placeholderImage("Student Book 4 ky nang", 720, 520, "fff7ed", "9a3412") },
      { title: "AI Chấm Chữa", subtitle: "Trợ lý học", image: placeholderImage("AI cham chua 4 ky nang", 720, 520, "ecfeff", "0f766e") },
      { title: "App Học Online", subtitle: "Ứng dụng học", image: placeholderImage("App hoc online 4 ky nang", 720, 520, "fdf2f8", "831843") },
    ],
  },
  stories: {
    title: "Chúng tớ đã bứt phá TOEIC",
    highlight: "Như thế nào?",
    featured: {
      title: "Hành trình đến 990 TOEIC - Nữ sinh đại học Đại Nam đã học thế nào?",
      excerpt: "Thùy Dương từng là một học viên có nền tảng tiếng Anh nhưng học theo bản năng, ngại luyện đề và lười học ngữ pháp. Nhờ phương pháp giảng dạy chỉn chu, sát đề và sự tận tâm của đội ngũ giáo viên, bạn đã thay đổi hoàn toàn tư duy làm bài và chạm mốc 990 TOEIC.",
      metaTitle: "Học viên",
      metaValue: "Lại Thùy Dương — Sinh viên năm 4",
      image: placeholderImage("Story featured 4 ky nang", 900, 640, "fdf2f8", "831843"),
    },
    items: [
      {
        title: "14 tuổi sở hữu chứng chỉ TOEIC 915 điểm - học viên bứt phá sớm",
        excerpt: "Quốc Khánh là một trong những gương mặt học viên bứt tốc sớm nhờ học đều, học đúng trọng tâm và được theo sát qua từng giai đoạn.",
        metaTitle: "Học viên",
        metaValue: "Quốc Khánh — Học sinh cấp 2",
        image: placeholderImage("Story 915 4 ky nang", 760, 620, "fff7ed", "9a3412"),
      },
      {
        title: "Từ 615 đến 890 TOEIC, Đắc Hiếu bứt phá ngoạn mục",
        excerpt: "Tấm gương sáng cho bất kỳ ai đang tìm cách cải thiện điểm số. Từ mốc 615, Hiếu đã xuất sắc đạt 890 điểm nhờ lộ trình học rõ ràng và kỷ luật.",
        metaTitle: "Học viên",
        metaValue: "Khắc Hiếu — Sinh viên năm 4",
        image: placeholderImage("Story 890 4 ky nang", 760, 620, "dbeafe", "1d4ed8"),
      },
    ],
    ctaLabel: "Xem thêm...",
    ctaHref: "/ve-chung-toi/hoc-vien-diem-cao",
  },
  steps: {
    title: "Sẵn sàng chinh phục TOEIC!",
    highlight: "Chỉ mất 3 bước để bắt đầu",
    desc: "Ghi danh lớp học TOEIC đơn giản, thao tác cực nhanh. Đa dạng học OFFLINE/ONLINE, đáp ứng mọi nhu cầu học tập.",
    items: [
      "Đăng ký tư vấn",
      "Test thử và nhận tư vấn trực tiếp",
      "Chọn lớp học phù hợp",
    ],
    banner: "Cơ hội luôn thuộc về người biết nắm bắt! Hơn 800.000 học viên mất gốc / mới bắt đầu học TOEIC đã thành công.",
    ctaLabel: "Khám phá ngay",
    ctaHref: "/register-course",
  },
  teachers: {
    title: "Đồng hành cùng 300+ giáo viên",
    highlight: "truyền cảm hứng",
    desc: "Chuyên môn giỏi, giàu kinh nghiệm và tận tâm trong từng giờ học.",
    badge: "990 TOEIC Overall",
    items: [
      { name: "Mr. Minh Đồng", role: "Teacher at Thầy Tài TOEIC", image: placeholderImage("Teacher 01 4 ky nang", 480, 620, "dbeafe", "1d4ed8") },
      { name: "Ms. Ngọc Phụng", role: "Teacher at Thầy Tài TOEIC", image: placeholderImage("Teacher 02 4 ky nang", 480, 620, "fee2e2", "be123c") },
      { name: "Mr. Lê Phương", role: "Teacher at Thầy Tài TOEIC", image: placeholderImage("Teacher 03 4 ky nang", 480, 620, "fff7ed", "9a3412") },
      { name: "Ms. Thu Hà", role: "Teacher at Thầy Tài TOEIC", image: placeholderImage("Teacher 04 4 ky nang", 480, 620, "ecfeff", "0f766e") },
      { name: "Ms. Mỹ Duyên", role: "Teacher at Thầy Tài TOEIC", image: placeholderImage("Teacher 05 4 ky nang", 480, 620, "ede9fe", "7c3aed") },
    ],
    ctaLabel: "Tìm hiểu đội ngũ giáo viên",
    ctaHref: "/ve-chung-toi/doi-ngu-giao-vien",
  },
  consult: {
    title: "Tham vấn 1-1 cùng giáo viên!",
    text: "Chinh phục thần tốc mục tiêu TOEIC với Thầy Tài TOEIC. Hơn 1.000.000 học viên đã thành công cán đích. Bạn có muốn trở thành người tiếp theo?",
    posterImage: placeholderImage("Qua tang bung no", 900, 1220, "dbeafe", "1d4ed8"),
    fields: [
      { type: "text", placeholder: "Họ và tên" },
      { type: "tel", placeholder: "Số điện thoại" },
      { type: "email", placeholder: "Email" },
      { type: "select", placeholder: "Bạn hiện đang là?", options: ["Học sinh", "Sinh viên", "Người đi làm"] },
      { type: "select", placeholder: "Cơ sở gần bạn nhất", options: ["Cầu Giấy", "Nam Từ Liêm", "Online", "Khác"] },
      { type: "textarea", placeholder: "Mục tiêu điểm / nhu cầu học của bạn" },
    ],
    submitLabel: "Đăng ký ngay, nhận ưu đãi liền tay.",
    note: "Cơ hội chỉ dành cho 100 bạn đầu tiên.",
  },
};
