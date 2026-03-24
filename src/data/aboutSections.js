const placeholderImage = (
  label,
  width = 1400,
  height = 900,
  background = "e6edf9",
  foreground = "1f2937"
) =>
  `https://placehold.co/${width}x${height}/${background}/${foreground}?text=${encodeURIComponent(label)}`;

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
    heroImage: placeholderImage("Hero%20Ve%20Thay%20Tai%20TOEIC", 1200, 860, "dbeafe", "0f172a"),
    heroNote: "Bạn có thể thay ảnh hero này bằng ảnh nhận diện trung tâm hoặc ảnh lớp học thật.",
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
      image: placeholderImage("Gap%20go%20truoc%20lop%20hoc%20cua%20Thay%20Tai", 1400, 920, "e2e8f0", "0f172a"),
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
        placeholderImage("Anh%20lop%20hoc%20dau%20tien%201", 900, 700, "fef3c7", "92400e"),
        placeholderImage("Anh%20lop%20hoc%20dau%20tien%202", 900, 700, "dbeafe", "1d4ed8"),
      ],
    },
    midFigure: {
      image: placeholderImage("Thay%20Tai%20lam%20viec%20cung%20doi%20ngu", 1400, 980, "f3f4f6", "111827"),
      caption: "Thầy Tài trong một buổi làm việc cùng đội ngũ học thuật và mentor",
    },
    campusGallery: {
      title: "Không gian học tập của Thầy Tài TOEIC",
      caption: "Bạn có thể thay cụm ảnh này bằng ảnh cơ sở, lớp học, khu vực tiếp đón hoặc ảnh workshop thực tế",
      images: [
        placeholderImage("Co%20so%20Thay%20Tai%2001", 900, 700, "fee2e2", "9f1239"),
        placeholderImage("Co%20so%20Thay%20Tai%2002", 900, 700, "e0f2fe", "075985"),
        placeholderImage("Co%20so%20Thay%20Tai%2003", 900, 700, "ecfccb", "365314"),
        placeholderImage("Co%20so%20Thay%20Tai%2004", 900, 700, "ede9fe", "6d28d9"),
      ],
    },
    pressLinks: [
      { source: "Báo Giáo Dục", title: "Hành trình xây dựng lớp học TOEIC chú trọng chiều sâu và cá nhân hóa", href: "https://example.com/thay-tai-bao-1" },
      { source: "VnExpress", title: "Một góc nhìn khác về việc học TOEIC: học để hiểu, không chỉ học để khoanh đáp án", href: "https://example.com/thay-tai-bao-2" },
      { source: "CafeBiz", title: "Cách một thương hiệu TOEIC phát triển từ sự theo sát trải nghiệm học viên", href: "https://example.com/thay-tai-bao-3" },
      { source: "Kenh14", title: "Người trẻ học tiếng Anh hiệu quả hơn khi có lộ trình và nhịp học đúng", href: "https://example.com/thay-tai-bao-4" },
      { source: "Tuổi Trẻ", title: "Câu chuyện phía sau những lớp TOEIC chữa bài sâu và rõ mục tiêu", href: "https://example.com/thay-tai-bao-5" },
    ],
    eventCards: [
      {
        image: placeholderImage("Su%20kien%20Noi%20bat%2001", 900, 620, "eff6ff", "1d4ed8"),
        title: "Workshop chiến lược chinh phục TOEIC cho người mới bắt đầu",
        excerpt: "Một chuỗi chia sẻ dành cho học viên cần xây lại nền tảng và tìm phương pháp học bền vững hơn.",
        href: "/contact",
      },
      {
        image: placeholderImage("Su%20kien%20Noi%20bat%2002", 900, 620, "fff7ed", "9a3412"),
        title: "Bộ tài liệu cấu trúc ngữ pháp trọng tâm trong hệ thống của Thầy Tài",
        excerpt: "Các tài liệu được biên soạn để học viên học gọn hơn, hiểu sâu hơn và bám đúng format đề.",
        href: "/ve-chung-toi/phuong-phap-dao-tao",
      },
      {
        image: placeholderImage("Su%20kien%20Noi%20bat%2003", 900, 620, "fdf2f8", "831843"),
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
    heroImage: placeholderImage("Phuong%20phap%20TAIL", 1200, 920, "dbeafe", "1e3a8a"),
    heroNote: "Thay bằng ảnh banner phương pháp đào tạo hoặc ảnh thầy Tài trong lớp học.",
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
          image: placeholderImage("Hoc%20vien%20Reading", 500, 500, "eff6ff", "0f172a"),
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
          image: placeholderImage("Hoc%20vien%20Listening", 500, 500, "f8fafc", "0f172a"),
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
          image: placeholderImage("Hoc%20vien%20Writing", 500, 500, "fff7ed", "7c2d12"),
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
          image: placeholderImage("Hoc%20vien%20Speaking", 500, 500, "fdf2f8", "831843"),
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
    proofImage: placeholderImage("Video%20review%20phuong%20phap", 1000, 620, "fee2e2", "7f1d1d"),
    resources: [
      {
        title: "Workbook",
        subtitle: "Bài tập cốt lõi",
        text: "Bộ worksheet và handout luyện theo từng mục tiêu điểm, bám sát format đề thật.",
        image: placeholderImage("Workbook", 700, 520, "eef2ff", "1d4ed8"),
      },
      {
        title: "Student Book",
        subtitle: "Sách học nội bộ",
        text: "Tài liệu tổng hợp cấu trúc, chiến lược và bài tập giúp học viên học theo lộ trình rõ ràng hơn.",
        image: placeholderImage("Student%20Book", 700, 520, "fff7ed", "9a3412"),
      },
      {
        title: "AI Chấm Chữa",
        subtitle: "Trợ lý học tập",
        text: "Kết hợp công cụ online để học viên tự luyện, xem feedback và quay lại lớp với câu hỏi đúng trọng tâm.",
        image: placeholderImage("AI%20Cham%20Chua", 700, 520, "ecfeff", "0f766e"),
      },
      {
        title: "App học online",
        subtitle: "Hệ sinh thái luyện tập",
        text: "Làm bài, xem kết quả, chữa lỗi và bám nhịp học trong cùng một tài khoản.",
        image: placeholderImage("App%20hoc%20online", 700, 520, "faf5ff", "7e22ce"),
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
    heroImage: placeholderImage("Hero%20He%20thong%20co%20so", 1200, 760, "dbeafe", "1e3a8a"),
    heroNote: "Thay bằng ảnh không gian lớp học, mặt tiền cơ sở hoặc ảnh khu vực tiếp đón học viên.",
    campuses: [
      {
        name: "Cơ sở Hồ Tùng Mậu",
        address: "Số 17, ngõ 20 Hồ Tùng Mậu, Cầu Giấy, Hà Nội",
        phone: "0344 772 436",
        schedule: "Tư vấn 08:00 - 21:00 | Lớp tối các ngày 2-4-6 và 3-5-7",
        mapHref: "https://maps.google.com",
        image: placeholderImage("Map%20Ho%20Tung%20Mau", 960, 700, "e2e8f0", "0f172a"),
      },
      {
        name: "Cơ sở Lê Đức Thọ",
        address: "Số 9 ngách 59 ngõ 21 Lê Đức Thọ, Nam Từ Liêm, Hà Nội",
        phone: "0344 772 436",
        schedule: "Tư vấn 08:00 - 21:00 | Có lớp tối và lớp cuối tuần",
        mapHref: "https://maps.google.com",
        image: placeholderImage("Map%20Le%20Duc%20Tho", 960, 700, "ecfccb", "365314"),
      },
      {
        name: "Campus mới đang mở rộng",
        address: "Thay bằng địa chỉ cơ sở mới của bạn",
        phone: "Thay bằng số hotline riêng nếu có",
        schedule: "Phù hợp để giới thiệu kế hoạch mở rộng thương hiệu hoặc campus mới",
        mapHref: "https://maps.google.com",
        image: placeholderImage("Map%20Campus%20moi", 960, 700, "fee2e2", "881337"),
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
        image: placeholderImage("Uu%20dai%20hoc%20vien%20moi", 900, 560, "fee2e2", "7f1d1d"),
      },
      {
        title: "Trả góp học phí",
        subtitle: "Tối ưu chi phí học tập",
        image: placeholderImage("Tra%20gop%20hoc%20phi", 900, 560, "dbeafe", "1e3a8a"),
      },
      {
        title: "Hệ sinh thái học tập trọn đời",
        subtitle: "Từ lớp học đến thư viện practice",
        image: placeholderImage("He%20sinh%20thai%20hoc%20tap", 900, 560, "ede9fe", "5b21b6"),
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
    heroImage: placeholderImage("Hero%20Doi%20ngu%20giao%20vien", 1200, 860, "fce7f3", "831843"),
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
        image: placeholderImage("Thay%20Tai", 800, 980, "fee2e2", "7f1d1d"),
        tags: ["Roadmap", "Reading", "Strategy"],
        text: "Xây chiến lược đào tạo, chuẩn hóa lộ trình và trực tiếp phụ trách những lớp mục tiêu điểm cao.",
      },
      {
        name: "Cô Minh Anh",
        role: "Lead Instructor",
        score: "Listening & Speaking Coach",
        image: placeholderImage("Co%20Minh%20Anh", 800, 980, "dbeafe", "1d4ed8"),
        tags: ["Listening", "Speaking", "Feedback"],
        text: "Phụ trách luyện phản xạ nghe - nói và hệ thống sửa lỗi phát âm theo từng nhóm học viên.",
      },
      {
        name: "Cô Lan Hạ",
        role: "Writing Mentor",
        score: "Writing & Grammar Specialist",
        image: placeholderImage("Co%20Lan%20Ha", 800, 980, "ecfccb", "365314"),
        tags: ["Writing", "Grammar", "Structure"],
        text: "Tập trung giúp học viên viết gọn, đúng và có hệ thống, đặc biệt ở phần sửa lỗi ngữ pháp.",
      },
      {
        name: "Thầy Quốc Bảo",
        role: "Reading Coach",
        score: "Part 7 & Speed Reading",
        image: placeholderImage("Thay%20Quoc%20Bao", 800, 980, "ede9fe", "5b21b6"),
        tags: ["Reading", "Part 7", "Skimming"],
        text: "Chuyên luyện đọc tốc độ cao, phân loại câu hỏi và xây chiến lược làm bài trong áp lực thời gian.",
      },
      {
        name: "Cô Thanh Vy",
        role: "Student Success Mentor",
        score: "Progress Tracking",
        image: placeholderImage("Co%20Thanh%20Vy", 800, 980, "fff7ed", "9a3412"),
        tags: ["Mentoring", "Accountability", "Support"],
        text: "Theo dõi tiến độ, nhắc nhịp học và giúp học viên bám kế hoạch giữa các buổi trên lớp.",
      },
      {
        name: "Thầy Đức Khôi",
        role: "Practice Lab Coach",
        score: "Mock Test & Review",
        image: placeholderImage("Thay%20Duc%20Khoi", 800, 980, "ecfeff", "0f766e"),
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
      "Đây là nơi bạn có thể kể lại những câu chuyện tăng điểm đáng nhớ nhất. Mỗi hồ sơ có thể thay bằng ảnh thật, điểm số thật và lời chia sẻ thật của học viên để tăng độ tin cậy cho thương hiệu.",
    heroImage: placeholderImage("Hero%20Hoc%20vien%20diem%20cao", 1200, 840, "fef3c7", "92400e"),
    resultStats: [
      { value: "800+", label: "Mốc điểm được chinh phục mỗi năm" },
      { value: "350+", label: "Ca tăng 150 điểm trở lên" },
      { value: "4.9/5", label: "Mức hài lòng về trải nghiệm học tập" },
    ],
    stories: [
      {
        name: "Lê Ngọc Vũ Thùy",
        school: "Đại học Ngoại ngữ - Tin học TP.HCM",
        score: "935 TOEIC",
        quote: "Điều mình thích nhất là học đến đâu biết ngay mình tiến bộ chỗ nào đến đó.",
        image: placeholderImage("Hoc%20vien%2001", 800, 620, "f8fafc", "0f172a"),
      },
      {
        name: "Bùi Ngọc Tuấn Huy",
        school: "Đại học Văn Hiến",
        score: "910 TOEIC",
        quote: "Lộ trình ngắn nhưng rất rõ, ít bị lan man và chữa bài rất sát.",
        image: placeholderImage("Hoc%20vien%2002", 800, 620, "eef2ff", "1d4ed8"),
      },
      {
        name: "Lê Huỳnh Anh Thư",
        school: "Đại học Nguyễn Tất Thành",
        score: "895 TOEIC",
        quote: "Mình tiến bộ mạnh nhất ở Part 7 vì được chỉ cách đọc và cách quản lý thời gian.",
        image: placeholderImage("Hoc%20vien%2003", 800, 620, "fff7ed", "9a3412"),
      },
      {
        name: "Trương Kim Tú",
        school: "Đại học Sài Gòn",
        score: "880 TOEIC",
        quote: "Không khí học rất có động lực, thầy cô theo sát nên khó bỏ cuộc giữa chừng.",
        image: placeholderImage("Hoc%20vien%2004", 800, 620, "ecfccb", "365314"),
      },
      {
        name: "Nguyễn Mai Ngọc Nhi",
        school: "Đại học Mở",
        score: "920 TOEIC",
        quote: "Điểm mình tăng nhanh vì mỗi tuần đều có checkpoint và bài tập đúng trọng tâm.",
        image: placeholderImage("Hoc%20vien%2005", 800, 620, "fdf2f8", "831843"),
      },
      {
        name: "Trần Nguyễn Khải Luân",
        school: "Đại học Khoa học Tự nhiên",
        score: "905 TOEIC",
        quote: "Hệ thống practice online giúp mình giữ nhịp học ngay cả khi bận lịch trên trường.",
        image: placeholderImage("Hoc%20vien%2006", 800, 620, "ecfeff", "0f766e"),
      },
    ],
  },
  "tuyen-dung": {
    slug: "tuyen-dung",
    kind: "careers",
    title: "Tuyển dụng",
    eyebrow: "Careers",
    summary:
      "Nếu bạn đang xây một đội ngũ giáo dục có tư duy phục vụ và yêu thích việc giúp học viên tiến bộ thật, trang này là nơi để kể rõ tiêu chuẩn đội ngũ mà bạn muốn tuyển.",
    heroImage: placeholderImage("Hero%20Tuyen%20dung", 1200, 860, "d1fae5", "065f46"),
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
    ctaLabel: "Gửi hồ sơ về email tuyển dụng",
    ctaHref: "mailto:realtoeiccentral@gmail.com",
  },
  "hoat-dong-noi-bo": {
    slug: "hoat-dong-noi-bo",
    kind: "culture",
    title: "Hoạt động nội bộ",
    eyebrow: "Culture & Team Life",
    summary:
      "Hoạt động nội bộ không chỉ để đẹp hình ảnh. Đây là nơi thương hiệu thể hiện nhịp sống đội ngũ, cách mọi người học cùng nhau, review công việc, nâng chuẩn dịch vụ và giữ tinh thần tích cực trong hành trình dài.",
    heroImage: placeholderImage("Hero%20Hoat%20dong%20noi%20bo", 1200, 860, "f3e8ff", "6b21a8"),
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
  },
};

const getAboutSection = (slug) => aboutSections[slug] || null;

module.exports = {
  aboutMenu,
  getAboutSection,
};
