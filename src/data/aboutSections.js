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

const aboutMenu = [
  { slug: "ve-thay-tai-toeic", label: "Về Thầy Tài TOEIC" },
  { slug: "ve-thay-tai", label: "Về thầy Tài" },
  { slug: "phuong-phap-dao-tao", label: "Phương pháp đào tạo" },
  { slug: "he-thong-co-so", label: "Hệ thống cơ sở" },
  { slug: "doi-ngu-giao-vien", label: "Đội ngũ giáo viên" },
  { slug: "hoc-vien-diem-cao", label: "Học viên điểm cao" },
  { slug: "tuyen-dung", label: "Tuyển dụng" },
  { slug: "hoat-dong-noi-bo", label: "Hoạt động nội bộ" },
];

const aboutSections = {
  "ve-thay-tai-toeic": {
    slug: "ve-thay-tai-toeic",
    kind: "story",
    title: "Về Thầy Tài TOEIC",
    eyebrow: "About Brand",
    summary:
      "Thầy Tài TOEIC xây dựng một mô hình luyện thi gọn, chắc và có trách nhiệm với kết quả. Mỗi khóa học đều xoay quanh mục tiêu điểm số, thời gian học thực tế và năng lực hiện tại của từng học viên.",
    heroImage: "https://r2.ebomb.edu.vn/toeic_img/page/2026/01/15/9a063f28-cb45-476e-8a9e-ff923f58522b.png",
    heroNote: "",
    heroStats: [
      { value: "18.000+", label: "Học viên từng tham gia lộ trình TOEIC" },
      { value: "91%", label: "Học viên bám đúng kế hoạch trong 8 tuần" },
      { value: "04", label: "Trụ cột trong hệ phương pháp đào tạo" },
      { value: "01", label: "Hệ sinh thái online-offline thống nhất" },
    ],
    highlightCards: [
      {
        title: "Mục tiêu rõ ngay từ đầu",
        text: "Trước khi học, học viên được xác định đầu vào, mục tiêu band điểm và thời gian có thể dành cho việc học để tránh lãng phí công sức.",
      },
      {
        title: "Chương trình học có logic",
        text: "Bài học được sắp xếp theo lộ trình tăng dần độ khó, gắn trực tiếp với format đề thi và những lỗi thường gặp khi ôn TOEIC.",
      },
      {
        title: "Theo sát để đạt kết quả",
        text: "Không dừng ở giảng dạy trên lớp, đội ngũ học thuật theo dõi tiến độ, nhắc nhịp học và điều chỉnh bài tập cho từng giai đoạn.",
      },
    ],
    storyBlocks: [
      {
        title: "Tầm nhìn đào tạo",
        text: "Thầy Tài TOEIC không xem việc dạy TOEIC là truyền thật nhiều mẹo làm đề. Trọng tâm của trung tâm là xây một lộ trình học có cấu trúc, để học viên biết mình đang thiếu gì, cần luyện gì trước và vì sao phải luyện theo thứ tự đó.",
      },
      {
        title: "Cam kết trải nghiệm học tập",
        text: "Từ lớp học trực tiếp, practice online, chữa bài, kho đề đến tư vấn lộ trình, mọi điểm chạm đều được thiết kế để học viên nhìn thấy tiến bộ theo tuần thay vì học mơ hồ trong thời gian dài.",
      },
    ],
    timeline: [
      { year: "2019", title: "Khởi tạo mô hình lớp nhỏ", text: "Tập trung vào việc kèm sát đầu ra và chữa lỗi trực diện cho học viên mất gốc." },
      { year: "2021", title: "Chuẩn hóa tài liệu nội bộ", text: "Bắt đầu xây dựng bộ handout, worksheet và quy trình ôn đề theo từng mốc điểm." },
      { year: "2024", title: "Mở rộng practice online", text: "Đưa bài tập theo part, wordform, mini test và full test lên cùng một hệ thống." },
      { year: "2026", title: "Hoàn thiện hệ sinh thái học tập", text: "Kết nối lớp học, chấm chữa, lộ trình và thư viện practice thành một trải nghiệm thống nhất." },
    ],
    quote:
      "Chúng tôi muốn học viên cảm nhận rằng mỗi giờ học đều có mục đích, mỗi bài tập đều có lý do và mỗi giai đoạn đều đưa họ tiến gần hơn tới mục tiêu điểm số.",
  },
  "ve-thay-tai": {
    slug: "ve-thay-tai",
    kind: "founder",
    title: "Về thầy Tài",
    eyebrow: "Founder Story",
    summary:
      "Trang này kể câu chuyện cá nhân, triết lý giảng dạy và cách thầy Tài xây nên một thương hiệu đào tạo lấy tính rõ ràng, kỷ luật và sự đồng hành dài hạn làm điểm tựa.",
    heroImage: placeholderImage("Chan%20dung%20Thay%20Tai", 1100, 1300, "fef2f2", "7f1d1d"),
    heroNote: "Thay bằng ảnh chân dung chính của thầy Tài.",
    heroStats: [
      { value: "1:1", label: "Triết lý kèm sát và cá nhân hóa" },
      { value: "10+", label: "Mốc năng lực và checkpoint trong mỗi lộ trình" },
      { value: "03", label: "Giá trị cốt lõi khi đứng lớp" },
    ],
    bioParagraphs: [
      "Thầy Tài bước vào lĩnh vực TOEIC với một niềm tin rất đơn giản: học viên không cần quá nhiều lời hứa, họ cần một người chỉ đường rõ ràng và đủ trách nhiệm để theo sát cho đến khi đạt mục tiêu.",
      "Phong cách giảng dạy của thầy thiên về cấu trúc. Bài học được chia nhỏ, lỗi sai được gọi tên, chiến lược làm bài được giải thích bằng logic thay vì ghi nhớ máy móc. Điều này giúp học viên vừa tăng điểm vừa thực sự hiểu mình đang làm gì.",
      "Điểm khác biệt lớn nhất trong cách xây dựng thương hiệu cá nhân của thầy Tài là giữ chất gần gũi của một người mentor, nhưng vận hành lớp học và học liệu theo tiêu chuẩn của một hệ thống chuyên nghiệp.",
    ],
    values: [
      { title: "Dạy thật", text: "Nói đúng năng lực đầu vào và lộ trình cần thiết, không hứa hẹn thiếu cơ sở." },
      { title: "Theo sát", text: "Quan tâm đến tiến độ học ngoài giờ, không chỉ chất lượng của một buổi lên lớp." },
      { title: "Có hệ thống", text: "Biến kiến thức rời rạc thành lộ trình học rõ, dễ theo và dễ duy trì." },
    ],
    milestones: [
      { title: "Xây khung lớp học chuẩn", text: "Chuẩn hóa cách giao bài, chữa bài, kiểm tra đầu vào và giao mục tiêu đầu ra." },
      { title: "Phát triển hệ học liệu riêng", text: "Tự biên soạn bộ note, practice sheet, review checklist và bộ sửa lỗi trọng tâm." },
      { title: "Mở rộng sang hệ online", text: "Đưa phần practice và theo dõi tiến độ lên website để học viên học liên tục hơn." },
    ],
    headline:
      "Thầy Tài: Hành trình từ lớp học nhỏ đến sứ mệnh truyền cảm hứng chinh phục TOEIC cho người học Việt",
    introParagraphs: [
      "Nhiều năm qua, cái tên Thầy Tài TOEIC dần gắn với hình ảnh một người dạy kỹ, rõ và không chấp nhận sự mơ hồ trong lớp học. Đằng sau thương hiệu ấy là một hành trình dài của sự kiên trì, của những buổi chữa bài đến khuya, của việc liên tục mổ xẻ đề thi để tìm ra cách học giúp học viên tiến bộ thật.",
      "Điều khiến thầy Tài được nhớ đến không chỉ là điểm số đầu ra, mà còn là cách thầy biến việc học TOEIC từ một mục tiêu áp lực thành một quá trình có cấu trúc, có động lực và có người đồng hành.",
    ],
    leadFigure: {
      image: placeholderImage("https://i.pinimg.com/736x/c2/4e/da/c24edaaf9032e4fa4c3112c7a9dfc4cb.jpg", 1400, 920, "e2e8f0", "0f172a"),
      caption: "Thầy Tài trong một buổi chia sẻ chiến lược học tập cùng học viên và đội ngũ học thuật",
    },
    chapters: [
      {
        title: "Cội nguồn cảm hứng: Từ người học bền bỉ đến người thầy tâm huyết",
        paragraphs: [
          "Khởi đầu của thầy Tài không phải từ một thương hiệu lớn, mà từ niềm tin rất giản dị rằng người học cần được chỉ đường đúng cách. Từ những ngày còn trực tiếp tự ôn luyện, tự phân tích lỗi sai và tự tìm cách bứt khỏi cảm giác học mãi mà không tiến bộ, thầy đã hiểu rõ điều gì khiến một người học dễ bỏ cuộc nhất: thiếu phương pháp và thiếu người đồng hành.",
          "Cũng từ trải nghiệm đó, thầy chọn cách giảng dạy đi thẳng vào bản chất của vấn đề. Học viên không được học mẹo một cách rời rạc, mà được nhìn thấy lý do vì sao phải làm như vậy, vì sao đang sai ở chỗ đó và cần sửa bằng cách nào.",
          "Ngọn lửa nghề của thầy Tài lớn dần từ chính những lần nhìn thấy học viên thay đổi ánh mắt sau khi hiểu ra một vấn đề tưởng chừng rất khó. Với thầy, khoảnh khắc học viên bật được tư duy học mới luôn đáng giá hơn mọi lời quảng bá.",
        ],
      },
      {
        title: "Viên gạch đầu tiên: Từ lớp học đầu tiên đến một cộng đồng học tập rõ mục tiêu",
        paragraphs: [
          "Những lớp học đầu tiên của thầy Tài được xây trên tinh thần rất thực tế: lớp nhỏ, chữa sâu, theo sát và đo tiến độ liên tục. Chính sự chỉn chu ở giai đoạn còn nhỏ này đã tạo nên nền móng văn hóa giảng dạy cho cả hệ thống sau này.",
          "Thầy không chọn tăng trưởng bằng cách mở rộng thật nhanh, mà ưu tiên chuẩn hóa cách giao bài, chữa bài, review lỗi và dẫn dắt học viên. Mỗi giai đoạn phát triển đều bám vào câu hỏi cốt lõi: học viên có hiểu mình đang học gì và tiến bộ đến đâu không?",
          "Từ một lớp học nhỏ, dần dần hình thành nên một cộng đồng học tập có nhịp điệu rõ ràng hơn: vào học là biết mục tiêu, ra về là có bài tập đúng trọng tâm, và giữa hai buổi luôn có cơ chế theo dõi để tránh đứt mạch học tập.",
        ],
      },
      {
        title: "Sứ mệnh lớn: Giúp người học Việt tự tin dùng tiếng Anh trong học tập và công việc",
        paragraphs: [
          "Mục tiêu của thầy Tài không dừng ở việc tạo ra những lớp luyện đề có đầu ra tốt. Xa hơn, thầy muốn xây một cách học giúp người học Việt cảm thấy tiếng Anh là công cụ mình có thể nắm được, chứ không phải một áp lực kéo dài nhiều năm.",
          "Từ lớp học trực tiếp đến website practice, từ bài chữa lỗi chi tiết đến kho tài liệu nội bộ, tất cả đang được phát triển theo cùng một hướng: giảm sự mơ hồ, tăng tính chủ động và giúp mỗi người học có cảm giác mình đang thật sự tiến về phía trước.",
          "Đó cũng là lý do thương hiệu Thầy Tài TOEIC lựa chọn một phong cách đào tạo rõ ràng, có trách nhiệm và lâu dài: không chỉ kéo điểm cho một kỳ thi, mà xây năng lực tự học và sự tự tin để người học mang theo về sau.",
        ],
      },
    ],
    splitGallery: {
      caption: "Những hình ảnh đầu tiên từ lớp học và các buổi chia sẻ chiến lược học tập",
      images: [
        placeholderImage("https://i.postimg.cc/cHVpqGdw/s1.png", 900, 700, "fef3c7", "92400e"),
        placeholderImage("https://i.postimg.cc/T36QzYgV/s2.png", 900, 700, "dbeafe", "1d4ed8"),
      ],
    },
    midFigure: {
      image: placeholderImage("https://i.pinimg.com/1200x/38/f7/d8/38f7d86da0ae75e82b10b0b1679e54b6.jpg", 1400, 980, "f3f4f6", "111827"),
      caption: "Thầy Tài trong một buổi làm việc cùng đội ngũ học thuật và mentor",
    },
    campusGallery: {
      title: "Không gian học tập của Thầy Tài TOEIC",
      caption: "Bạn có thể thay cụm ảnh này bằng ảnh cơ sở, lớp học, khu vực tiếp đón hoặc ảnh workshop thực tế",
      images: [
        placeholderImage("https://i.pinimg.com/736x/c5/5f/17/c55f1712fb8b1cd5d0908d757cf8043d.jpg", 900, 700, "fee2e2", "9f1239"),
        placeholderImage("https://i.pinimg.com/736x/b7/08/95/b70895fede22516535ced4cf7569ead6.jpg", 900, 700, "e0f2fe", "075985"),
        placeholderImage("https://i.pinimg.com/736x/47/12/ed/4712ed89acf9b8f595c09906f9882c43.jpg", 900, 700, "ecfccb", "365314"),
        placeholderImage("https://i.pinimg.com/736x/3e/4c/f5/3e4cf5f0c19dca20021c1a1808450edb.jpg", 900, 700, "ede9fe", "6d28d9"),
      ],
    },
    pressLinks: [
      { source: "Báo Giáo Dục", title: "Hành trình xây dựng lớp học TOEIC chú trọng chiều sâu và cá nhân hóa", href: "https://www.anhngumshoa.com/tin-tuc/baongheanvn-co-giao-xu-nghe-thanh-cong-voi-triet-ly-dao-tao-va-phuong-phap-giang-day-doc-quyen-38300.html" },
      { source: "VnExpress", title: "Một góc nhìn khác về việc học TOEIC: học để hiểu, không chỉ học để khoanh đáp án", href: "https://www.anhngumshoa.com/tin-tuc/afamily-vn-ms-hoa-toeic-chu-tich-truong-anh-ngu-noi-tieng-ha-noi-tiet-lo-noi-lo-ve-2-co-con-gai-38301.html" },
      { source: "CafeBiz", title: "Cách một thương hiệu TOEIC phát triển từ sự theo sát trải nghiệm học viên", href: "https://www.anhngumshoa.com/tin-tuc/vnexpress-ung-dung-tieng-anh-trong-cong-viec-tu-vung-tieng-anh-nganh-nhan-su-38303.html" },
      { source: "Kenh14", title: "Người trẻ học tiếng Anh hiệu quả hơn khi có lộ trình và nhịp học đúng", href: "https://www.anhngumshoa.com/tin-tuc/vnexpress-meo-dat-diem-cao-mon-tieng-anh-ky-thi-tot-nghiep-thpt-quoc-gia-nho-bai-thi-toeic-38307.html" },
      { source: "Tuổi Trẻ", title: "Câu chuyện phía sau những lớp TOEIC chữa bài sâu và rõ mục tiêu", href: "https://www.anhngumshoa.com/tin-tuc/vnexpress-co-giao-tre-so-huu-7-trung-tam-ngoai-ngu-36564.html" },
    ],
    eventCards: [
      {
        image: placeholderImage("https://i.pinimg.com/1200x/68/0c/39/680c39a9ee63dde833ebf99ef2ed2360.jpg", 900, 620, "eff6ff", "1d4ed8"),
        title: "Workshop chiến lược chinh phục TOEIC cho người mới bắt đầu",
        excerpt: "Một chuỗi chia sẻ dành cho học viên cần xây lại nền tảng và tìm phương pháp học bền vững hơn.",
        href: "/contact",
      },
      {
        image: placeholderImage("https://i.pinimg.com/736x/95/fa/98/95fa98073a9e4c7dbd4694926aaa0b47.jpg", 900, 620, "fff7ed", "9a3412"),
        title: "Bộ tài liệu cấu trúc ngữ pháp trọng tâm trong hệ thống của Thầy Tài",
        excerpt: "Các tài liệu được biên soạn để học viên học gọn hơn, hiểu sâu hơn và bám đúng format đề.",
        href: "/ve-chung-toi/phuong-phap-dao-tao",
      },
      {
        image: placeholderImage("https://i.pinimg.com/736x/fd/7f/66/fd7f66bc4c5e06f718db85233a783a5a.jpg", 900, 620, "fdf2f8", "831843"),
        title: "Những dự án học liệu và sản phẩm học tập đang được phát triển",
        excerpt: "Từ practice online đến workbook nội bộ, mọi tài nguyên đều hướng đến trải nghiệm học đồng nhất.",
        href: "/goc-hoc-tap",
      },
    ],
  },
  "phuong-phap-dao-tao": {
    slug: "phuong-phap-dao-tao",
    kind: "method",
    title: "Phương pháp đào tạo T.A.I.L",
    eyebrow: "Training Method",
    summary:
      "T.A.I.L là khung đào tạo riêng của Thầy Tài TOEIC, giúp học viên đi từ chẩn đoán đúng vấn đề đến luyện tập chủ động, nhận phản hồi sâu và giữ được tư duy học tập có hệ thống.",
    announcement: {
      title: "Đã có lịch khai giảng tháng mới",
      text: "Các lớp mục tiêu 550+, 700+ và 850+ đang mở tư vấn lộ trình và giữ chỗ sớm cho học viên đăng ký online.",
      hrefLabel: "Xem lịch khai giảng",
      href: "/lich-khai-giang",
    },
    heroImage: placeholderImage("https://i.pinimg.com/736x/66/e3/41/66e3418ee7a9acd64bcf68283aaa7bc9.jpg", 1200, 920, "dbeafe", "1e3a8a"),
    heroNote: "",
    methodCards: [
      {
        letter: "T",
        title: "Target Blueprint",
        subtitle: "Mục tiêu rõ từ đầu",
        text: "Chẩn đoán đầu vào, chia mục tiêu theo tuần, xác định ngưỡng điểm của từng kỹ năng để học viên biết chính xác mình đang ở đâu và cần đi tới đâu.",
        tone: "amber",
      },
      {
        letter: "A",
        title: "Active Practice",
        subtitle: "Thực hành ngay trên bài thật",
        text: "Không chỉ nghe giảng, học viên liên tục làm bài, sửa bài và luyện phản xạ bằng task ngắn để kiến thức chuyển thành kỹ năng làm bài.",
        tone: "coral",
      },
      {
        letter: "I",
        title: "Insight Feedback",
        subtitle: "Phản hồi sâu từng lỗi",
        text: "Mỗi lỗi sai đều được phân tích nguyên nhân, gắn với checklist sửa lỗi để học viên không lặp lại cùng một dạng sai qua nhiều buổi học.",
        tone: "sky",
      },
      {
        letter: "L",
        title: "Logic Reinforcement",
        subtitle: "Kiến thức được hệ thống hóa",
        text: "Ngữ pháp, từ vựng, chiến lược đọc và kỹ thuật nghe được xâu chuỗi theo một logic thống nhất thay vì học rời rạc từng mẹo.",
        tone: "green",
      },
    ],
    differentiators: [
      { number: "01", title: "Lộ trình tinh gọn", text: "Bỏ phần lan man, tập trung đúng nhóm kỹ năng kéo điểm nhanh nhất." },
      { number: "02", title: "Thực hành dày hơn", text: "Mỗi buổi đều có đầu ra, học viên luôn phải làm, nói, đọc hoặc viết." },
      { number: "03", title: "Phản xạ làm đề tốt hơn", text: "Học viên luyện chiến lược xử lý đề trong điều kiện sát thực tế." },
      { number: "04", title: "Không học cứng nhắc", text: "Giảng viên luôn giải thích vì sao phải làm như vậy để học viên chủ động hơn." },
    ],
    skillApplications: [
      {
        title: "Reading",
        text: "Từ nền câu hỏi cơ bản đến Part 7, học viên luyện skimming, scanning, phân loại câu hỏi và chiến lược chọn câu làm trước để tối ưu thời gian.",
        bullets: [
          "Đi từ câu đơn đến đoạn dài và bài đọc kép theo thứ tự tăng độ khó.",
          "Có checklist xử lý ngữ pháp, từ loại, paraphrase và bẫy suy luận.",
          "Luyện cách phân phối thời gian giữa Part 5, 6 và 7.",
        ],
        student: {
          name: "Phần hồ sơ học viên",
          school: "Thay bằng tên trường hoặc đơn vị của học viên",
          score: "930 TOEIC",
          image: placeholderImage("https://image.ebomb.edu.vn/crop/350x235/toeic_img/news/2026/02/03/93f33732-b3b3-4c5a-a536-e6977c7ebbac.png", 500, 500, "eff6ff", "0f172a"),
        },
      },
      {
        title: "Listening",
        text: "Phương pháp nghe tập trung vào việc bóc ý nhanh, nắm từ khóa và làm quen tốc độ nói thật, thay vì phụ thuộc vào việc nghe đi nghe lại quá nhiều lần.",
        bullets: [
          "Phân tích cue words, distractor và cách đổi hướng thông tin.",
          "Luyện active listening theo từng part, từng dạng câu hỏi.",
          "Tăng band theo block mục tiêu để học viên cảm nhận rõ tiến độ.",
        ],
        student: {
          name: "Phần hồ sơ học viên",
          school: "Thay bằng tên trường hoặc đơn vị của học viên",
          score: "900 TOEIC",
          image: placeholderImage("https://image.ebomb.edu.vn/crop/350x235/toeic_img/news/2026/01/30/907c470c-ce7b-4f89-8771-5518ea1b705a.png", 500, 500, "f8fafc", "0f172a"),
        },
      },
      {
        title: "Writing",
        text: "Writing được chia thành từng mô thức dễ kiểm soát: dựng ý, chọn cấu trúc, sửa lỗi ngữ pháp và hoàn thiện theo rubric chấm điểm rõ ràng.",
        bullets: [
          "Phát triển tư duy triển khai ý đúng, đủ và mạch lạc.",
          "Có bộ lỗi mẫu và mẫu câu để học viên luyện theo tình huống thật.",
          "Giảng viên sửa trực tiếp trên bài viết để học viên nhìn ra vấn đề.",
        ],
        student: {
          name: "Phần hồ sơ học viên",
          school: "Thay bằng tên trường hoặc đơn vị của học viên",
          score: "890+ TOEIC",
          image: placeholderImage("https://image.ebomb.edu.vn/crop/350x235/toeic_img/news/2026/01/30/325f1cf6-6d4d-47b4-bec4-22b0bb3e3e35.png", 500, 500, "fff7ed", "7c2d12"),
        },
      },
      {
        title: "Speaking",
        text: "Speaking ưu tiên phản xạ, ngữ điệu và khả năng triển khai ý trong áp lực thời gian, giúp học viên nói đúng trọng tâm và đủ tự tin khi thi.",
        bullets: [
          "Chia kỹ năng thành từng cụm nhỏ để học viên luyện chắc nền trước.",
          "Tăng độ khó dần bằng các bài nói có feedback ngay.",
          "Kết hợp luyện phát âm, ngữ điệu và tư duy bố cục câu trả lời.",
        ],
        student: {
          name: "Phần hồ sơ học viên",
          school: "Thay bằng tên trường hoặc đơn vị của học viên",
          score: "Target 8.0",
          image: placeholderImage("https://image.ebomb.edu.vn/crop/350x235/toeic_img/news/2026/01/30/aa27ef32-2f8f-41ee-8cd4-8c7626336559.png", 500, 500, "fdf2f8", "831843"),
        },
      },
    ],
    proofStats: [
      { value: "18.000+", label: "Học viên đã đi qua lộ trình T.A.I.L" },
      { value: "120.000+", label: "Lượt bài practice được hoàn thành online" },
      { value: "94%", label: "Học viên đánh giá phần chữa bài là hữu ích nhất" },
    ],
    proofQuote:
      "Điều tạo nên sự khác biệt của T.A.I.L không phải những khẩu hiệu lớn, mà là cách mỗi mắt xích trong lộ trình được nối với nhau để học viên đi đều và không bị hụt hơi giữa chặng.",
    proofImage: placeholderImage("https://i.pinimg.com/1200x/38/2a/37/382a379c14a4a8d47daf15eb4ff10310.jpg", 1000, 620, "fee2e2", "7f1d1d"),
    proofVideoUrl: "https://youtu.be/CNQtIN5s4Yg",
    resources: [
      {
        title: "Workbook",
        subtitle: "Bài tập cốt lõi",
        text: "Bộ worksheet và handout luyện theo từng mục tiêu điểm, bám sát format đề thật.",
        image: placeholderImage("https://image.ebomb.edu.vn/crop/200x200/toeic_img/page/2026/03/04/a127e9a3-c8b7-473c-99dc-90cec3ec37e7.png", 700, 520, "eef2ff", "1d4ed8"),
      },
      {
        title: "Student Book",
        subtitle: "Sách học nội bộ",
        text: "Tài liệu tổng hợp cấu trúc, chiến lược và bài tập giúp học viên học theo lộ trình rõ ràng hơn.",
        image: placeholderImage("https://i.pinimg.com/736x/a5/3a/0e/a53a0e6d0533f8f4fdcf30c766e5420f.jpg", 700, 520, "fff7ed", "9a3412"),
      },
      {
        title: "AI Chấm Chữa",
        subtitle: "Trợ lý học tập",
        text: "Kết hợp công cụ online để học viên tự luyện, xem feedback và quay lại lớp với câu hỏi đúng trọng tâm.",
        image: placeholderImage("https://image.ebomb.edu.vn/crop/200x200/toeic_img/page/2026/03/04/7e0e0e5b-7c81-4357-b798-9409c8814dfc.png", 700, 520, "ecfeff", "0f766e"),
      },
      {
        title: "App học online",
        subtitle: "Hệ sinh thái luyện tập",
        text: "Làm bài, xem kết quả, chữa lỗi và bám nhịp học trong cùng một tài khoản.",
        image: placeholderImage("https://image.ebomb.edu.vn/crop/200x200/toeic_img/page/2026/01/15/8634c2e3-19f6-4152-aba2-d53a8bc50bb3.png", 700, 520, "faf5ff", "7e22ce"),
      },
    ],
  },
  "he-thong-co-so": {
    slug: "he-thong-co-so",
    kind: "campus",
    title: "Hệ thống cơ sở Thầy Tài TOEIC",
    eyebrow: "Campuses",
    summary:
      "Mỗi cơ sở đều được thiết kế như một điểm tư vấn - học tập - hỗ trợ lộ trình thống nhất. Nếu bạn chưa chắc mình nên học ở đâu, hãy dùng trang này để so sánh cơ sở, xem map và kết nối nhanh với đội ngũ tư vấn.",
    heroImage: placeholderImage("https://i.pinimg.com/736x/39/44/20/39442052bc12ab00e24cdd5d6b470cba.jpg", 1200, 760, "dbeafe", "1e3a8a"),
    heroNote: "",
    campuses: [
      {
        name: "Cơ sở Hồ Tùng Mậu",
        address: "Số 17, ngõ 20 Hồ Tùng Mậu, Cầu Giấy, Hà Nội",
        phone: "0344 772 436",
        schedule: "Tư vấn 08:00 - 21:00 | Lớp tối các ngày 2-4-6 và 3-5-7",
        mapHref: "https://maps.google.com",
        image: placeholderImage("https://i.postimg.cc/KYDmFz1r/s4.png", 960, 700, "e2e8f0", "0f172a"),
      },
      {
        name: "Cơ sở Lê Đức Thọ",
        address: "Số 9 ngách 59 ngõ 21 Lê Đức Thọ, Nam Từ Liêm, Hà Nội",
        phone: "0344 772 436",
        schedule: "Tư vấn 08:00 - 21:00 | Có lớp tối và lớp cuối tuần",
        mapHref: "https://maps.google.com",
        image: placeholderImage("https://i.postimg.cc/KYDmFz1r/s4.png", 960, 700, "ecfccb", "365314"),
      },
      {
        name: "Campus mới đang mở rộng",
        address: "Thay bằng địa chỉ cơ sở mới của bạn",
        phone: "Thay bằng số hotline riêng nếu có",
        schedule: "Phù hợp để giới thiệu kế hoạch mở rộng thương hiệu hoặc campus mới",
        mapHref: "https://maps.google.com",
        image: placeholderImage("https://i.postimg.cc/KYDmFz1r/s4.png", 960, 700, "fee2e2", "881337"),
      },
    ],
    supportCard: {
      title: "Bạn muốn được tư vấn lộ trình ngay tại cơ sở phù hợp?",
      bullets: [
        "Được gợi ý cơ sở phù hợp với khu vực sống, thời gian học và mục tiêu điểm.",
        "Có thể đặt lịch test đầu vào, nhận lộ trình và xem lớp gần ngày khai giảng.",
        "Hỗ trợ đăng ký online trước, xác nhận chỗ học sau để không bỏ lỡ lớp phù hợp.",
      ],
      primaryLabel: "Kết nối với giáo viên tư vấn",
      primaryHref: "/contact",
      secondaryLabel: "Test thử trình độ miễn phí",
      secondaryHref: "/placement-tests",
    },
    promoBanners: [
      {
        title: "Ưu đãi học viên mới",
        subtitle: "Dành cho học viên đăng ký sớm",
        image: placeholderImage("https://image.ebomb.edu.vn/crop/430x280/toeic_img/news/2026/03/06/58cdf66e-0d67-4bf9-be3f-5210296d209e.png", 900, 560, "fee2e2", "7f1d1d"),
      },
      {
        title: "Trả góp học phí",
        subtitle: "Tối ưu chi phí học tập",
        image: placeholderImage("https://image.ebomb.edu.vn/crop/430x280/toeic_img/news/2026/03/06/a55e6149-e3b5-41f7-8ff7-47b9e3808a21.png", 900, 560, "dbeafe", "1e3a8a"),
      },
      {
        title: "Hệ sinh thái học tập trọn đời",
        subtitle: "Từ lớp học đến thư viện practice",
        image: placeholderImage("https://image.ebomb.edu.vn/crop/430x280/toeic_img/news/2026/03/06/69d0898b-2fff-4cf6-a69a-f922e54eb467.png", 900, 560, "ede9fe", "5b21b6"),
      },
    ],
  },
  "doi-ngu-giao-vien": {
    slug: "doi-ngu-giao-vien",
    kind: "team",
    title: "Đội ngũ giáo viên",
    eyebrow: "Teaching Team",
    summary:
      "Đội ngũ giảng viên tại Thầy Tài TOEIC được xây dựng theo triết lý: giỏi chuyên môn là điều kiện cần, còn khả năng truyền đạt, chữa lỗi và giữ nhịp học cho học viên mới là yếu tố quyết định.",
    heroImage: placeholderImage("https://i.pinimg.com/736x/76/c5/75/76c575bfffcbb9e9d089cb50973149aa.jpg", 1200, 860, "fce7f3", "831843"),
    heroStats: [
      { value: "10+", label: "Mentor và giảng viên học thuật" },
      { value: "03", label: "Vai trò chính: dạy, chữa, theo dõi tiến độ" },
      { value: "100%", label: "Lớp học có checklist chữa lỗi sau buổi" },
    ],
    valuePoints: [
      "Dạy theo cùng một khung học thuật để học viên ở lớp nào cũng nhận được chất lượng thống nhất.",
      "Ưu tiên khả năng chữa lỗi và thúc đẩy học viên hành động, không chỉ giảng giải lý thuyết.",
      "Có mentor đứng cùng đội ngũ vận hành để theo sát tiến độ ngoài giờ học.",
    ],
    members: [
      {
        name: "Thầy Tài",
        role: "Academic Director",
        score: "TOEIC Mentor | Roadmap Design",
        image: placeholderImage("https://r2.ebomb.edu.vn/toeic_img/teacher/2026/03/04/707718b2-32ba-4a6b-b9f7-86e023e2c993.png", 800, 980, "fee2e2", "7f1d1d"),
        tags: ["Roadmap", "Reading", "Strategy"],
        text: "Xây chiến lược đào tạo, chuẩn hóa lộ trình và trực tiếp phụ trách những lớp mục tiêu điểm cao.",
      },
      {
        name: "Cô Minh Anh",
        role: "Lead Instructor",
        score: "Listening & Speaking Coach",
        image: placeholderImage("https://r2.ebomb.edu.vn/toeic_img/teacher/2026/03/04/66bf791d-a2c0-4592-8283-60a8efee961a.png", 800, 980, "dbeafe", "1d4ed8"),
        tags: ["Listening", "Speaking", "Feedback"],
        text: "Phụ trách luyện phản xạ nghe - nói và hệ thống sửa lỗi phát âm theo từng nhóm học viên.",
      },
      {
        name: "Cô Lan Hạ",
        role: "Writing Mentor",
        score: "Writing & Grammar Specialist",
        image: placeholderImage("https://r2.ebomb.edu.vn/toeic_img/teacher/2026/03/04/6090742c-b199-42ee-a6aa-2b27d066898f.png", 800, 980, "ecfccb", "365314"),
        tags: ["Writing", "Grammar", "Structure"],
        text: "Tập trung giúp học viên viết gọn, đúng và có hệ thống, đặc biệt ở phần sửa lỗi ngữ pháp.",
      },
      {
        name: "Thầy Quốc Bảo",
        role: "Reading Coach",
        score: "Part 7 & Speed Reading",
        image: placeholderImage("https://r2.ebomb.edu.vn/toeic_img/teacher/2026/02/11/927656ad-10f5-4ac2-9708-12bdc68e92f8.png", 800, 980, "ede9fe", "5b21b6"),
        tags: ["Reading", "Part 7", "Skimming"],
        text: "Chuyên luyện đọc tốc độ cao, phân loại câu hỏi và xây chiến lược làm bài trong áp lực thời gian.",
      },
      {
        name: "Cô Thanh Vy",
        role: "Student Success Mentor",
        score: "Progress Tracking",
        image: placeholderImage("https://r2.ebomb.edu.vn/toeic_img/teacher/2026/03/04/1e11ffb1-1322-445d-a0c7-a7af4f6de0c5.png", 800, 980, "fff7ed", "9a3412"),
        tags: ["Mentoring", "Accountability", "Support"],
        text: "Theo dõi tiến độ, nhắc nhịp học và giúp học viên bám kế hoạch giữa các buổi trên lớp.",
      },
      {
        name: "Thầy Đức Khôi",
        role: "Practice Lab Coach",
        score: "Mock Test & Review",
        image: placeholderImage("https://r2.ebomb.edu.vn/toeic_img/teacher/2026/02/26/2ded07f2-fbcf-42a8-917d-2d7442266afb.png", 800, 980, "ecfeff", "0f766e"),
        tags: ["Mock Test", "Review", "Analysis"],
        text: "Đi sâu vào bài test, chiến lược xử lý đề và phần chữa bài chi tiết sau mỗi đợt luyện đề.",
      },
    ],
  },
  "hoc-vien-diem-cao": {
    slug: "hoc-vien-diem-cao",
    kind: "results",
    title: "Học viên điểm cao",
    eyebrow: "Student Results",
    summary:
      "Những kết quả nổi bật dưới đây được trình bày theo kiểu landing page thành tích: có bảng vàng học viên, review ngắn và các câu chuyện thật để bạn dễ thay ảnh, thay điểm số và cập nhật thêm học viên mới về sau.",
    heroImage: placeholderImage("https://i.postimg.cc/4ygfT95V/s6.png", 1440, 560, "dbeafe", "1d4ed8"),
    promoStrip: {
      title: "Lộ trình TOEIC theo level",
      text: "Học viên đạt mốc mục tiêu sau khóa, có roadmap rõ ràng và theo sát tiến độ từng giai đoạn.",
      hrefLabel: "Xem thêm",
      href: "/lich-khai-giang",
      image: placeholderImage("", 220, 220, "fff7ed", "9a3412"),
    },
    achievementTitle: "Bảng vàng thành tích",
    reviewTitle: "Review học viên nhà Thầy Tài TOEIC",
    storyTitle: "Câu chuyện học viên",
    resultStats: [
      { value: "10+", label: "Năm đồng hành cùng người học TOEIC" },
      { value: "18.000+", label: "Học viên từng theo lộ trình tại Thầy Tài TOEIC" },
      { value: "3.500+", label: "Học viên chạm mốc 750+ TOEIC" },
    ],
    stories: [
      {
        name: "Nguyễn Đăng Khoa",
        school: "ĐH Thủy Lợi",
        score: "840",
        quote: "Từ chỗ học thiếu nhịp, mình dần quen với checklist ôn tập và lên điểm đều hơn sau từng tuần.",
        image: placeholderImage("https://r2.ebomb.edu.vn/toeic_img/news/2026/02/05/fcd5fc39-f6a9-4f12-8aaa-f58fffe37814.png", 860, 660, "f8fafc", "0f172a"),
      },
      {
        name: "Bùi Vân Khanh",
        school: "ĐH Thủ Đô",
        score: "840",
        quote: "Điểm mạnh nhất mình nhận được là cách chia nhỏ từng mục tiêu để bám học rất chắc.",
        image: placeholderImage("https://r2.ebomb.edu.vn/toeic_img/news/2026/01/30/980d49fd-0c68-4c5e-a82b-3ac2b021c59b.png", 860, 660, "eef2ff", "1d4ed8"),
      },
      {
        name: "https://r2.ebomb.edu.vn/toeic_img/news/2026/01/30/8d5d6c23-8998-4769-b49a-6976a86f677c.png",
        school: "ĐH Kinh tế Quốc dân",
        score: "940",
        quote: "Mình từ khá lo lắng với Reading chuyển sang làm đề tự tin hơn vì được chữa rất kỹ từng lỗi.",
        image: placeholderImage("Bang%20vang%2003", 860, 660, "fff7ed", "9a3412"),
      },
      {
        name: "Trương Đức Nhật",
        school: "ĐH Đại Nam",
        score: "925",
        quote: "Mình thích nhất cách thầy cô vừa giữ áp lực đủ tốt vừa không làm học viên bị ngợp.",
        image: placeholderImage("https://r2.ebomb.edu.vn/toeic_img/news/2026/01/30/2d9baa38-97c2-4970-9fbc-70a701a9a08b.png", 860, 660, "ecfccb", "365314"),
      },
      {
        name: "Vũ Nguyễn Huyền Trân",
        school: "Trường UEH",
        score: "900",
        quote: "Lộ trình học ngắn nhưng rất rõ, vào học là biết ngay tuần này cần làm gì.",
        image: placeholderImage("https://r2.ebomb.edu.vn/toeic_img/news/2026/01/30/55dd67c2-192d-4773-b800-0d6e1cab2dca.png", 860, 660, "fdf2f8", "831843"),
      },
      {
        name: "Võ Hoàng Hồng Ngọc",
        school: "ĐH Văn Lang",
        score: "860",
        quote: "Mình tăng nhanh nhất ở Listening vì được rèn phản xạ và làm lại lỗi sai rất đều.",
        image: placeholderImage("https://r2.ebomb.edu.vn/toeic_img/news/2026/01/30/55dd67c2-192d-4773-b800-0d6e1cab2dca.png", 860, 660, "ecfeff", "0f766e"),
      },
      {
        name: "Trần Duy Khoa",
        school: "ĐH Công nghệ TP.HCM",
        score: "790",
        quote: "Từ mức nền chưa vững, mình lên được mốc mục tiêu nhờ nhịp học bền và phần theo sát ngoài giờ.",
        image: placeholderImage("https://r2.ebomb.edu.vn/toeic_img/news/2026/01/30/248239e9-6472-4594-8e9d-0c63d5a0380c.png", 860, 660, "ede9fe", "6d28d9"),
      },
      {
        name: "Võ Ngọc Thùy Dương",
        school: "ĐH Kinh tế TP.HCM",
        score: "750",
        quote: "Điều khiến mình theo được đến cuối là bài tập luôn vừa sức nhưng vẫn đủ áp lực để tiến bộ.",
        image: placeholderImage("https://r2.ebomb.edu.vn/toeic_img/news/2026/01/30/ddcbfa3f-1f7b-4f08-af0d-263aaf21df1f.png", 860, 660, "fee2e2", "be123c"),
      },
      {
        name: "Võ Hoài Nam",
        school: "ĐH Nguyễn Tất Thành",
        score: "795",
        quote: "Practice online cộng với chữa đề chi tiết là phần giúp mình giữ được nhịp học ổn định.",
        image: placeholderImage("https://r2.ebomb.edu.vn/toeic_img/news/2026/01/30/1fb9a002-4cb4-443f-af50-3fc132a7be50.png", 860, 660, "dcfce7", "166534"),
      },
    ],
    resultPagination: ["1", "2"],
    reviewCards: [
      {
        name: "Ngô Việt Dũng",
        date: "2026/03/24",
        image: placeholderImage("https://image.ebomb.edu.vn/crop/350x170/toeic_img/news/2026/01/30/602cdd73-6ecd-4518-804d-8f47fb451b76.png", 860, 660, "eff6ff", "1d4ed8"),
        excerpt: "Em là Ngô Việt Dũng, học viên lớp đề của Thầy Tài TOEIC. Sau thời gian học tại trung tâm, em đã đạt được mốc điểm tốt hơn kỳ vọng ban đầu nhờ lộ trình rất rõ và chữa bài cực kỳ sát.",
      },
      {
        name: "Chu Anh Tú",
        date: "2026/03/24",
        image: placeholderImage("https://image.ebomb.edu.vn/crop/350x170/toeic_img/news/2026/01/30/e2b0c927-f402-401d-9998-32fe693da10f.png", 860, 660, "fff7ed", "9a3412"),
        excerpt: "Bản thân em là học sinh mất gốc, trước đây khá lo lắng khi học TOEIC. Nhưng sau khi theo lớp, em hiểu rõ từng phần cần cải thiện và không còn học lan man như trước.",
      },
      {
        name: "Đỗ Thành Trung",
        date: "2026/03/24",
        image: placeholderImage("https://image.ebomb.edu.vn/crop/350x170/toeic_img/news/2026/01/30/681fc86c-437b-45c5-9a6f-fa6cfb644db3.png", 860, 660, "fdf2f8", "831843"),
        excerpt: "Điểm số của mình vượt xa kỳ vọng ban đầu. Điều mình biết ơn nhất là các thầy cô luôn tạo động lực nhưng vẫn giữ yêu cầu rất rõ ràng trong suốt khóa học.",
      },
      {
        name: "Nguyễn Phan Chi",
        date: "2026/03/24",
        image: placeholderImage("https://image.ebomb.edu.vn/crop/350x170/toeic_img/news/2026/01/30/68feca65-22bc-4dd9-820a-86e139ebfb35.png", 860, 660, "ecfeff", "0f766e"),
        excerpt: "Khi mới bắt đầu ôn thi, em khá lo lắng vì thời gian không nhiều và cũng đã lâu chưa đụng lại kiến thức. Trung tâm giúp em đi lại từ nền tảng đến luyện đề rất chắc tay.",
      },
      {
        name: "Vũ Tùng Mạnh",
        date: "2026/03/24",
        image: placeholderImage("https://image.ebomb.edu.vn/crop/350x170/toeic_img/news/2026/01/30/0ff8f2d8-1765-4b06-9e61-b8559cac7cea.png", 860, 660, "ecfccb", "365314"),
        excerpt: "Sau một thời gian tìm hiểu, mình quyết định học vì lộ trình nhìn rất thực tế. Điểm mình thích là bài tập không nhiều vô nghĩa mà bám rất sát mục tiêu cần đạt.",
      },
      {
        name: "Nguyễn Danh Thái",
        date: "2026/03/24",
        image: placeholderImage("https://image.ebomb.edu.vn/crop/350x170/toeic_img/news/2026/01/30/ce9db310-a1e0-4d49-8753-7856597cdf45.png", 860, 660, "fee2e2", "9f1239"),
        excerpt: "Hữu duyên biết đến trung tâm qua một người bạn, lúc đầu mình còn khá nghi ngờ. Nhưng sau vài buổi đầu tiên, mình cảm nhận rõ cách dạy rất có hệ thống và dễ theo.",
      },
    ],
    reviewPagination: ["1", "2"],
    articleStories: [
      {
        title: "Sinh viên HUFLIT tiết lộ phương pháp luyện để bứt tốc đầu ra",
        excerpt: "Chuyển đầu ra trường Đại học trở nên dễ dàng hơn khi bạn biết cách chia mục tiêu và giữ nhịp ôn tập đều đặn mỗi tuần.",
        image: placeholderImage("https://image.ebomb.edu.vn/crop/350x170/toeic_img/news/2026/01/28/e9663f1e-7bcc-45b2-a2cb-8cd672f6ca14.jpg", 900, 560, "f8fafc", "0f172a"),
        href: "/contact",
      },
      {
        title: "Vượt mục tiêu đạt 800+ TOEIC sau khi đổi cách học Reading",
        excerpt: "Không chỉ đạt mà còn vượt xa mục tiêu điểm số ban đầu trong kỳ thi nhờ thay đổi cách đọc, cách phân loại câu hỏi và nhịp chữa lỗi.",
        image: placeholderImage("https://image.ebomb.edu.vn/crop/350x170/toeic_img/news/2025/thumbnail_1200x628_30.jpg", 900, 560, "eef2ff", "1d4ed8"),
        href: "/contact",
      },
      {
        title: "Bật mí chiến lược học TOEIC 750+ từ sinh viên năm cuối",
        excerpt: "Từ những buổi học đầu tiên đến ngày chạm mốc 750+, câu chuyện này cho thấy việc giữ nhịp ôn còn quan trọng hơn cố gắng dồn sức ngắn hạn.",
        image: placeholderImage("https://image.ebomb.edu.vn/crop/350x170/toeic_img/news/2025/thumbnail_1200x628_26.jpg", 900, 560, "fff7ed", "9a3412"),
        href: "/contact",
      },
      {
        title: "Sinh viên Đại học Kinh tế chia sẻ bí quyết học đúng lộ trình",
        excerpt: "Khi biết mình yếu phần nào và được giao đúng loại bài tập cần luyện, việc tiến bộ diễn ra đều đặn hơn rất nhiều.",
        image: placeholderImage("https://image.ebomb.edu.vn/crop/350x170/toeic_img/news/2025/b1.jpg", 900, 560, "ecfccb", "365314"),
        href: "/contact",
      },
      {
        title: "Từ mất gốc đến chinh phục mốc 700+ với lịch học bận rộn",
        excerpt: "Một case điển hình cho thấy cách tối ưu thời gian học khi vừa đi học vừa đi làm thêm nhưng vẫn cần đầu ra TOEIC rõ ràng.",
        image: placeholderImage("https://image.ebomb.edu.vn/crop/350x170/toeic_img/news/2025/thumbnail_1200x628_3.png", 900, 560, "fdf2f8", "831843"),
        href: "/contact",
      },
      {
        title: "Cách practice online giúp học viên không đứt mạch giữa tuần",
        excerpt: "Kho practice và phần chữa bài chi tiết đã giúp nhiều học viên giữ được nhịp học kể cả khi không thể lên lớp nhiều buổi liên tiếp.",
        image: placeholderImage("https://image.ebomb.edu.vn/crop/350x170/toeic_img/news/2025/thumbnail_1200x628_2.png", 900, 560, "ecfeff", "0f766e"),
        href: "/goc-hoc-tap",
      },
    ],
    articlePagination: ["1", "2", "3", "4", "...", "18"],
  },
  "tuyen-dung": {
    slug: "tuyen-dung",
    kind: "careers",
    title: "Tuyển dụng",
    eyebrow: "Careers",
    summary:
      "Trang này được dựng theo kiểu chuyên mục tin tuyển dụng: có bài nổi bật phía trên, danh sách vị trí đang mở và sidebar tư vấn/kết nối để bạn thay nội dung thật sau này.",
    heroImage: placeholderImage("https://image.ebomb.edu.vn/resize/540x320/toeic_img/news/2026/03/09/21c566eb-7947-4db6-ad8d-f06ab5c4c6a6.jpg", 1440, 700, "fee2e2", "9f1239"),
    newsTitle: "Tuyển dụng",
    featuredPosts: [
      {
        hot: true,
        title: "Tham gia nhóm Zalo tuyển dụng Thầy Tài TOEIC - cơ hội nghề nghiệp tại hệ thống đào tạo đang mở rộng",
        excerpt: "Nếu bạn tìm kiếm một môi trường làm việc trẻ trung, có kỷ luật và đề cao sự phát triển chuyên môn, đây là nơi để bắt đầu theo dõi những vị trí tuyển mới nhất.",
        date: "08/10/2025",
        image: placeholderImage("https://image.ebomb.edu.vn/resize/540x320/toeic_img/news/2026/03/09/21c566eb-7947-4db6-ad8d-f06ab5c4c6a6.jpg", 960, 620, "fff7ed", "9a3412"),
        href: "mailto:realtoeiccentral@gmail.com",
      },
      {
        hot: true,
        title: "Review công việc tại Thầy Tài TOEIC: vị trí đang tuyển, môi trường làm việc và định hướng phát triển",
        excerpt: "Từ giai đoạn xây dựng hệ thống đến lúc mở rộng đội ngũ, điều quan trọng nhất vẫn là tìm được những người phù hợp với văn hóa dạy thật và làm thật.",
        date: "05/06/2025",
        image: placeholderImage("https://image.ebomb.edu.vn/resize/350x210/toeic_img/news/2026/03/09/0890de6d-5cab-4bd5-a859-9f959a46fc08.jpg", 960, 620, "eff6ff", "1d4ed8"),
        href: "mailto:realtoeiccentral@gmail.com",
      },
    ],
    culturePoints: [
      "Ưu tiên người có trách nhiệm với kết quả hơn là chỉ mạnh về hình ảnh cá nhân.",
      "Tôn trọng tư duy hệ thống, tinh thần học hỏi và khả năng làm việc cùng đội ngũ.",
      "Đặt trải nghiệm học viên làm trung tâm trong mọi quyết định học thuật và vận hành.",
    ],
    roles: [
      {
        title: "TOEIC Mentor",
        type: "Full-time / Part-time",
        location: "Hybrid",
        bullets: [
          "Đứng lớp, chữa bài và phối hợp với đội học thuật để theo sát tiến độ học viên.",
          "Có khả năng giảng giải logic và giữ nhịp học tốt trong lớp đông lẫn lớp nhỏ.",
          "Ưu tiên ứng viên từng có kinh nghiệm luyện TOEIC hoặc đào tạo tiếng Anh học thuật.",
        ],
      },
      {
        title: "Academic Operations",
        type: "Full-time",
        location: "On-site",
        bullets: [
          "Điều phối lớp học, theo dõi lịch học, hỗ trợ kiểm tra đầu vào và tổng hợp tiến độ.",
          "Làm việc trực tiếp với giảng viên để chuẩn bị học liệu, checklist và report sau lớp.",
          "Phù hợp với người thích làm việc có hệ thống và theo sát chất lượng đầu ra.",
        ],
      },
      {
        title: "Student Success / CS",
        type: "Full-time",
        location: "On-site / Hybrid",
        bullets: [
          "Tư vấn lộ trình, follow học viên sau khi nhập học và hỗ trợ xử lý các điểm nghẽn trong quá trình học.",
          "Cần giao tiếp tốt, có khả năng tạo niềm tin và xử lý vấn đề nhẹ nhàng nhưng dứt khoát.",
          "Ưu tiên ứng viên có kinh nghiệm trong giáo dục, dịch vụ hoặc tư vấn khách hàng.",
        ],
      },
    ],
    process: [
      "Gửi CV và portfolio hoặc hồ sơ kinh nghiệm liên quan.",
      "Phỏng vấn nhanh để đánh giá tư duy, thái độ và mức phù hợp với văn hóa.",
      "Thử việc hoặc demo buổi dạy / mô phỏng tình huống công việc.",
      "Onboarding theo checklist để hòa nhập nhanh với hệ thống hiện có.",
    ],
    articleList: [
      {
        title: "Tuyển dụng giáo viên tiếng Anh TOEIC/Giao tiếp/Junior/IELTS tại Thầy Tài TOEIC",
        excerpt: "Nhu cầu mở rộng mạng lưới lớp học và hệ học liệu khiến đội ngũ giảng dạy tiếp tục được bổ sung ở nhiều vai trò khác nhau, từ lớp nền tảng đến lớp mục tiêu điểm cao.",
        image: placeholderImage("https://image.ebomb.edu.vn/resize/350x210/toeic_img/news/2026/03/06/1308dc8f-8b54-486b-b736-6d487fdbb462.png", 920, 580, "fee2e2", "be123c"),
        href: "mailto:realtoeiccentral@gmail.com",
      },
      {
        title: "Tuyển dụng giáo viên TOEIC toàn quốc với thu nhập theo năng lực và khung lớp rõ ràng",
        excerpt: "Dành cho các ứng viên muốn đồng hành dài hạn cùng mô hình luyện thi có hệ thống, có chuẩn lớp học, có mentor học thuật và cơ chế review đều đặn.",
        image: placeholderImage("https://image.ebomb.edu.vn/resize/350x210/toeic_img/news/2026/03/09/a8145a1e-0c87-4b8a-b8fd-57e69213651e.jpg", 920, 580, "f8fafc", "0f172a"),
        href: "mailto:realtoeiccentral@gmail.com",
      },
      {
        title: "Tuyển dụng tư vấn tuyển sinh tại Thầy Tài TOEIC với lộ trình nghề nghiệp rõ",
        excerpt: "Nếu bạn phù hợp với công việc định hướng học viên, giao tiếp tốt và có tư duy phục vụ, đây là nhóm vị trí quan trọng trong hành trình phát triển hệ thống.",
        image: placeholderImage("https://image.ebomb.edu.vn/resize/350x210/toeic_img/news/2026/03/09/ef9285af-4b33-4928-b56e-926b0dde5751.jpg", 920, 580, "ecfeff", "0f766e"),
        href: "mailto:realtoeiccentral@gmail.com",
      },
      {
        title: "Tuyển Academic Operations phụ trách lớp học, học liệu và nhịp vận hành sau buổi học",
        excerpt: "Vai trò dành cho người thích làm việc có hệ thống, theo sát quy trình và đảm bảo trải nghiệm học tập không bị đứt mạch giữa các điểm chạm.",
        image: placeholderImage("https://image.ebomb.edu.vn/crop/160x90/toeic_img/news/2024/toeic_4_ky_nang.png", 920, 580, "eef2ff", "1d4ed8"),
        href: "mailto:realtoeiccentral@gmail.com",
      },
      {
        title: "Mở tuyển thực tập sinh nội dung và media cho hệ sinh thái giáo dục của Thầy Tài TOEIC",
        excerpt: "Phù hợp với ứng viên muốn phát triển trong môi trường giáo dục số, tham gia sản xuất nội dung, landing page và chiến dịch tuyển sinh thực tế.",
        image: placeholderImage("https://image.ebomb.edu.vn/crop/160x90/toeic_img/news/2026/03/17/2d6c3f36-8f49-4efa-9a41-1a3cffbac5c8.jpg", 920, 580, "fff7ed", "b45309"),
        href: "mailto:realtoeiccentral@gmail.com",
      },
    ],
    sideHighlights: [
      {
        title: "Lộ trình học TOEIC 4 kỹ năng",
        image: placeholderImage("https://image.ebomb.edu.vn/crop/160x90/toeic_img/news/2024/toeic_4_ky_nang.png", 420, 260, "dbeafe", "1d4ed8"),
        href: "/khoa-hoc",
      },
      {
        title: "Lộ trình mục tiêu 500-750 TOEIC",
        image: placeholderImage("https://image.ebomb.edu.vn/crop/160x90/toeic_img/news/2026/03/17/2d6c3f36-8f49-4efa-9a41-1a3cffbac5c8.jpg", 420, 260, "eef2ff", "4338ca"),
        href: "/lich-khai-giang",
      },
      {
        title: "Lộ trình học cho người mất gốc",
        image: placeholderImage("https://image.ebomb.edu.vn/crop/160x90/toeic_img/news/2026/03/09/b980cca8-4661-4272-b3ed-c2b1651e3cd8.jpg", 420, 260, "ecfccb", "9a3412"),
        href: "/placement-tests",
      },
    ],
    quickLinks: [
      { label: "Tài liệu TOEIC hay nhất", href: "/goc-hoc-tap" },
      { label: "Thang điểm TOEIC", href: "/placement-tests" },
      { label: "Thi thử TOEIC online", href: "/goc-hoc-tap" },
      { label: "Chương trình TOEIC 4 kỹ năng", href: "/khoa-hoc" },
      { label: "Chương trình TOEIC theo level", href: "/lich-khai-giang" },
    ],
    consultBox: {
      title: "Tư vấn miễn phí",
      submitLabel: "Đăng ký nhận tư vấn",
      secondaryLabel: "Tư vấn qua Facebook Messenger",
      secondaryHref: "/contact",
      note: "Chúng tôi cam kết bảo mật thông tin của bạn tuyệt đối và chỉ sử dụng cho mục đích kết nối tư vấn riêng.",
    },
    socialBox: {
      title: "Hãy kết nối với chúng tôi",
      phoneLabel: "Gọi điện",
      phoneValue: "0969 296 466",
      links: [
        { label: "Facebook Thầy Tài TOEIC", href: "/contact" },
        { label: "Cộng đồng tự học TOEIC", href: "/goc-hoc-tap" },
        { label: "YouTube Thầy Tài TOEIC", href: "/contact" },
        { label: "TikTok Thầy Tài TOEIC", href: "/contact" },
        { label: "Instagram Thầy Tài TOEIC", href: "/contact" },
        { label: "Zalo hỗ trợ tuyển sinh", href: "/contact" },
      ],
    },
    pagination: {
      items: ["←", "1", "2", "→"],
      summary: "Trang 1 trong tổng số 2 trang",
    },
    ctaLabel: "Gửi hồ sơ về email tuyển dụng",
    ctaHref: "mailto:realtoeiccentral@gmail.com",
  },
  "hoat-dong-noi-bo": {
    slug: "hoat-dong-noi-bo",
    kind: "culture",
    title: "Hoạt động nội bộ",
    eyebrow: "Culture & Team Life",
    summary:
      "Trang này được dựng theo kiểu chuyên mục hoạt động nội bộ và sự kiện thương hiệu: có 2 bài nổi bật phía trên, danh sách hoạt động ở cột trái và sidebar tư vấn/kết nối ở cột phải.",
    heroImage: placeholderImage("Hoat%20dong%20noi%20bo%20banner", 1440, 700, "fee2e2", "be123c"),
    newsTitle: "Hoạt động nội bộ",
    featuredPosts: [
      {
        hot: true,
        title: "Thầy Tài TOEIC kỷ niệm hành trình phát triển thương hiệu và lan tỏa giá trị đào tạo",
        excerpt: "Một dấu mốc quan trọng không chỉ về quy mô mà còn về cách đội ngũ nhìn lại hành trình xây dựng hệ thống học tập rõ ràng, kỷ luật và giàu cảm hứng.",
        date: "17/06/2022",
        image: placeholderImage("https://i.postimg.cc/T2tgfVSs/s7.png", 960, 620, "fee2e2", "be123c"),
        href: "/ve-chung-toi/ve-thay-tai-toeic",
      },
      {
        hot: true,
        title: "Lễ ra mắt bộ nhận diện mới của thương hiệu Thầy Tài TOEIC",
        excerpt: "Một bước chuyển về hình ảnh thương hiệu để hệ sinh thái đào tạo, học liệu và truyền thông có cùng một tiếng nói rõ ràng và chuyên nghiệp hơn.",
        date: "08/04/2022",
        image: placeholderImage("https://i.postimg.cc/d3Ch2Csp/s8.png", 960, 620, "fff7ed", "9a3412"),
        href: "/ve-chung-toi/ve-thay-tai-toeic",
      },
    ],
    culturePillars: [
      { title: "Training nội bộ", text: "Review lesson plan, tình huống lớp học và tiêu chuẩn chữa bài." },
      { title: "Team bonding", text: "Các hoạt động gắn kết giúp đội ngũ hiểu nhau hơn ngoài áp lực công việc." },
      { title: "Vinh danh đóng góp", text: "Ghi nhận thành tích của giảng viên, mentor và đội ngũ hỗ trợ." },
    ],
    activities: [
      {
        title: "Workshop học thuật hàng tháng",
        tag: "Academic",
        text: "Buổi review chiến lược dạy, chia sẻ case học viên và cập nhật format đề.",
        image: placeholderImage("Workshop%20hoc%20thuat", 900, 660, "dbeafe", "1d4ed8"),
      },
      {
        title: "Ngày chụp profile đội ngũ",
        tag: "Branding",
        text: "Chuẩn hóa hình ảnh thương hiệu để mọi điểm chạm với học viên nhất quán hơn.",
        image: placeholderImage("Ngay%20chup%20profile", 900, 660, "fee2e2", "be123c"),
      },
      {
        title: "Review chất lượng lớp học",
        tag: "Quality",
        text: "Tổng hợp phản hồi học viên, đánh giá tiến độ và điều chỉnh lớp cho giai đoạn tiếp theo.",
        image: placeholderImage("Review%20chat%20luong", 900, 660, "ecfccb", "365314"),
      },
      {
        title: "Mini retreat của team",
        tag: "Team Life",
        text: "Hoạt động nội bộ giúp nạp lại năng lượng và giữ tinh thần cộng tác tích cực.",
        image: placeholderImage("Mini%20retreat", 900, 660, "ede9fe", "6d28d9"),
      },
      {
        title: "Lễ vinh danh học viên - giảng viên",
        tag: "Recognition",
        text: "Tôn vinh thành tích và những người đã tạo nên kết quả thật trong hành trình đào tạo.",
        image: placeholderImage("Le%20vinh%20danh", 900, 660, "fff7ed", "b45309"),
      },
      {
        title: "Ngày mở cửa trải nghiệm",
        tag: "Community",
        text: "Đón học viên mới tham quan lớp, tư vấn lộ trình và trải nghiệm practice lab.",
        image: placeholderImage("Open%20day", 900, 660, "ecfeff", "0f766e"),
      },
    ],
    articleList: [
      {
        title: "Chuyến xe đoàn viên - Cùng Thầy Tài TOEIC về quê đón Tết Giáp Thìn",
        excerpt: "Một hoạt động vì cộng đồng được tổ chức để kết nối đội ngũ, học viên và lan tỏa tinh thần đồng hành vượt ra ngoài khuôn khổ lớp học.",
        image: placeholderImage("https://image.ebomb.edu.vn/resize/350x210/toeic_img/news/chuyen-xe-doan-vien.png", 920, 580, "dbeafe", "1d4ed8"),
        href: "/ve-chung-toi/hoat-dong-noi-bo",
      },
      {
        title: "Bùng nổ chuỗi sự kiện nội bộ tại các cơ sở trong tháng 4",
        excerpt: "Từ workshop học thuật đến các hoạt động gắn kết nhỏ trong từng campus, nhịp sống thương hiệu được làm dày lên bằng nhiều điểm chạm có chủ đích.",
        image: placeholderImage("https://image.ebomb.edu.vn/resize/350x210/toeic_img/news/gala_for_you_1200__630_px.png", 920, 580, "fee2e2", "be123c"),
        href: "/ve-chung-toi/hoat-dong-noi-bo",
      },
      {
        title: "Tưng bừng khai trương cơ sở mới với sự tham gia của đội ngũ và học viên",
        excerpt: "Những ngày khai trương không chỉ là hoạt động thương hiệu mà còn là dịp để đội ngũ nhìn thấy thành quả của một chặng phát triển mới.",
        image: placeholderImage("https://image.ebomb.edu.vn/resize/350x210/toeic_img/news/ima07721.jpg", 920, 580, "fff7ed", "9a3412"),
        href: "/ve-chung-toi/he-thong-co-so",
      },
      {
        title: "Hội thảo đào tạo nội bộ nâng cao chất lượng giảng dạy cho toàn hệ thống",
        excerpt: "Các buổi đào tạo nội bộ được tổ chức định kỳ để chuẩn hóa tư duy chữa bài, cách giao bài và cách giữ nhịp học giữa các nhóm lớp khác nhau.",
        image: placeholderImage("https://image.ebomb.edu.vn/resize/350x210/toeic_img/news/dtnb.jpg", 920, 580, "eff6ff", "7c3aed"),
        href: "/ve-chung-toi/doi-ngu-giao-vien",
      },
      {
        title: "Workshop chiến lược truyền cảm hứng cho người học tại trường đại học",
        excerpt: "Chuỗi workshop ngoại khóa là nơi thương hiệu kết nối với cộng đồng sinh viên và tiếp tục mở rộng ảnh hưởng của phương pháp học có hệ thống.",
        image: placeholderImage("https://image.ebomb.edu.vn/resize/350x210/toeic_img/news/Tin%20tuc/workshop_tieng_anh_cho_nguoi_ban_ron_11_04_2021_dai_hoc_ky_thuat_y_-_duoc_da_nang.jpg", 920, 580, "ecfeff", "0f766e"),
        href: "/contact",
      },
      {
        title: "Lì xì lộc phát, đại cát đầu năm và không khí khởi động quý mới",
        excerpt: "Bên cạnh những hoạt động học thuật, các dịp lễ trong năm là cơ hội để tạo thêm năng lượng tích cực cho đội ngũ vận hành và giảng dạy.",
        image: placeholderImage("https://image.ebomb.edu.vn/resize/350x210/toeic_img/news/220210-to-web.jpg", 920, 580, "fef2f2", "b91c1c"),
        href: "/ve-chung-toi/hoat-dong-noi-bo",
      },
    ],
    sideHighlights: [
      {
        title: "Lộ trình học TOEIC 4 kỹ năng",
        image: placeholderImage("https://image.ebomb.edu.vn/crop/160x90/toeic_img/news/2024/toeic_4_ky_nang.png", 420, 260, "dbeafe", "1d4ed8"),
        href: "/khoa-hoc",
      },
      {
        title: "Lộ trình mục tiêu 500-750 TOEIC",
        image: placeholderImage("https://image.ebomb.edu.vn/crop/160x90/toeic_img/news/2026/03/17/2d6c3f36-8f49-4efa-9a41-1a3cffbac5c8.jpg", 420, 260, "eef2ff", "4338ca"),
        href: "/lich-khai-giang",
      },
      {
        title: "Lộ trình học cho người mất gốc",
        image: placeholderImage("https://image.ebomb.edu.vn/crop/160x90/toeic_img/news/2026/03/09/b980cca8-4661-4272-b3ed-c2b1651e3cd8.jpg", 420, 260, "ecfccb", "9a3412"),
        href: "/placement-tests",
      },
    ],
    quickLinks: [
      { label: "Tài liệu TOEIC hay nhất", href: "/goc-hoc-tap" },
      { label: "Thang điểm TOEIC", href: "/placement-tests" },
      { label: "Thi thử TOEIC online", href: "/goc-hoc-tap" },
      { label: "Chương trình TOEIC 4 kỹ năng", href: "/khoa-hoc" },
      { label: "Chương trình TOEIC theo level", href: "/lich-khai-giang" },
    ],
    consultBox: {
      title: "Tư vấn miễn phí",
      submitLabel: "Đăng ký nhận tư vấn",
      secondaryLabel: "Tư vấn qua Facebook Messenger",
      secondaryHref: "/contact",
      note: "Thông tin của bạn sẽ chỉ được dùng để kết nối tư vấn lộ trình và hỗ trợ đăng ký lớp phù hợp.",
    },
    socialBox: {
      title: "Hãy kết nối với chúng tôi",
      phoneLabel: "Gọi điện",
      phoneValue: "0969 296 466",
      links: [
        { label: "Facebook Thầy Tài TOEIC", href: "/contact" },
        { label: "Cộng đồng tự học TOEIC", href: "/goc-hoc-tap" },
        { label: "YouTube Thầy Tài TOEIC", href: "/contact" },
        { label: "TikTok Thầy Tài TOEIC", href: "/contact" },
        { label: "Instagram Thầy Tài TOEIC", href: "/contact" },
        { label: "Zalo hỗ trợ học viên", href: "/contact" },
      ],
    },
    pagination: {
      items: ["←", "1", "2", "→"],
      summary: "Trang 1 trong tổng số 2 trang",
    },
  },
};

const getAboutSection = (slug) => aboutSections[slug] || null;

module.exports = {
  aboutMenu,
  getAboutSection,
};
