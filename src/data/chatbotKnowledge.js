const CENTER_INFO = {
  brandName: "Thầy Tài TOEIC",
  hotline: "0344772436",
  email: "realtoeiccentral@gmail.com",
  discountLabel: "Giảm 25% khóa học",
  comboOffer: {
    title: "Combo Tập Sự + TOEIC A",
    price: "6.000.000đ",
    note: "Tiết kiệm 700.000đ khi đăng ký sớm.",
  },
  campuses: [
    {
      id: "htm",
      name: "Cơ sở Hồ Tùng Mậu",
      address: "Số 17, ngõ 20 Hồ Tùng Mậu, Cầu Giấy, Hà Nội",
      aliases: ["hồ tùng mậu", "ho tung mau", "cầu giấy", "cau giay", "cs1", "cơ sở 1"],
    },
    {
      id: "ldt",
      name: "Cơ sở Lê Đức Thọ",
      address: "Số 9 ngách 59 ngõ 21 Lê Đức Thọ, Nam Từ Liêm, Hà Nội",
      aliases: ["lê đức thọ", "le duc tho", "nam từ liêm", "nam tu liem", "cs2", "cơ sở 2"],
    },
  ],
};

const COURSE_CATALOG = [
  {
    id: "tap-su",
    title: "Tập Sự TOEIC",
    aliases: ["tập sự", "tap su", "lớp tập sự", "lop tap su", "mất gốc toeic", "mat goc toeic"],
    level: "Mất gốc - xây nền tảng",
    targetBand: "0 - 350+ TOEIC",
    price: "3.200.000đ",
    sessions: "25 buổi",
    focus: [
      "Ngữ pháp và từ vựng nền tảng",
      "Nghe cơ bản theo nhịp chậm",
      "Tạo thói quen học đều và sửa lỗi gốc",
    ],
    summary:
      "Dành cho học viên mất gốc hoặc cần làm lại nền tảng trước khi vào lộ trình TOEIC chính.",
  },
  {
    id: "toeic-a",
    title: "TOEIC A",
    aliases: ["toeic a"],
    level: "Đầu vào cơ bản",
    targetBand: "350 - 550+ TOEIC",
    price: "3.900.000đ",
    sessions: "27 buổi",
    focus: [
      "Part 1-4 ở mức nền tảng",
      "Hệ thống lại ngữ pháp trọng tâm",
      "Làm quen Reading cơ bản",
    ],
    summary:
      "Phù hợp khi bạn đã có nền tảng ban đầu và muốn lên mốc 450 - 550+ theo lộ trình có hệ thống.",
  },
  {
    id: "toeic-b",
    title: "TOEIC B",
    aliases: ["toeic b"],
    level: "Trung cấp - cần bứt điểm",
    targetBand: "550 - 750+ TOEIC",
    price: "3.500.000đ",
    sessions: "25 buổi",
    focus: [
      "Reading sâu hơn",
      "Mở rộng từ vựng và kỹ thuật làm bài",
      "Hoàn thiện kỹ năng để bứt mốc điểm",
    ],
    summary:
      "Phù hợp cho học viên đã học nền tảng và cần đẩy tốc độ lẫn độ chính xác để lên band cao hơn.",
  },
  {
    id: "toeic-sw",
    title: "TOEIC Speaking & Writing",
    aliases: ["toeic s&w", "speaking writing", "speaking & writing", "toeic speaking", "toeic writing"],
    level: "Mở rộng 4 kỹ năng",
    targetBand: "TOEIC LR 600 - 650+ trước khi vào lớp",
    price: "4.000.000đ",
    sessions: "30 buổi",
    focus: [
      "Phản xạ nói",
      "Task viết ứng dụng",
      "Feedback sửa bài chi tiết",
    ],
    summary:
      "Dành cho học viên muốn mở rộng sang nói và viết, phục vụ học tập, công việc hoặc đầu ra doanh nghiệp.",
  },
  {
    id: "toeic-starter-350",
    title: "TOEIC Starter 350+",
    aliases: ["starter 350", "toeic starter", "350+"],
    level: "Lấy lại nền cơ bản",
    targetBand: "0 - 350+ TOEIC",
    price: "3.300.000đ",
    sessions: "24 buổi",
    focus: [
      "Từ vựng và ngữ pháp trọng tâm",
      "Nghe Part 1-3 theo nhịp cơ bản",
      "Chữa lỗi cá nhân",
    ],
    summary:
      "Một lựa chọn khác cho người mất gốc cần lấy lại nền nhưng muốn đi theo roadmap điểm số rõ hơn.",
  },
  {
    id: "toeic-roadmap-550",
    title: "TOEIC Roadmap 550+",
    aliases: ["roadmap 550", "toeic roadmap", "550+"],
    level: "Củng cố và tăng điểm",
    targetBand: "400 - 550+ TOEIC",
    price: "3.850.000đ",
    sessions: "28 buổi",
    focus: [
      "Part 3-4-5-6 theo dạng",
      "Skimming và scanning",
      "Mini test hằng tuần",
    ],
    summary:
      "Hợp với học viên đã có nền cơ bản và muốn lên khoảng 500 - 550+ một cách đều và chắc.",
  },
  {
    id: "toeic-intensive-650",
    title: "TOEIC Intensive 650+",
    aliases: ["intensive 650", "650+", "toeic 650"],
    level: "Tăng tốc trung cấp",
    targetBand: "500 - 650+ TOEIC",
    price: "4.200.000đ",
    sessions: "30 buổi",
    focus: [
      "Tăng tốc Reading",
      "Nghe paraphrase và suy luận",
      "Full test định kỳ",
    ],
    summary:
      "Phù hợp cho mục tiêu 600 - 700 khi bạn đã qua giai đoạn nền tảng và cần tăng tốc thực chiến.",
  },
  {
    id: "toeic-fast-track-750",
    title: "TOEIC Fast Track 750+",
    aliases: ["fast track 750", "750+", "toeic 750"],
    level: "Rút ngắn thời gian bứt điểm",
    targetBand: "650 - 750+ TOEIC",
    price: "4.600.000đ",
    sessions: "30 buổi",
    focus: [
      "Xử lý part khó và dài",
      "Bộ đề nâng cao",
      "Tập trung band 700 - 780",
    ],
    summary:
      "Hợp với học viên đã có nền khá và muốn bứt nhanh lên mốc 700 - 750+.",
  },
  {
    id: "toeic-elite-850",
    title: "TOEIC Elite 850+",
    aliases: ["elite 850", "850+", "toeic 850"],
    level: "Nâng cao",
    targetBand: "750 - 850+ TOEIC",
    price: "5.200.000đ",
    sessions: "34 buổi",
    focus: [
      "Bẫy nâng cao Part 3-4-7",
      "Tư duy chọn đáp án nhanh",
      "Phục vụ hồ sơ xin việc và đầu ra doanh nghiệp",
    ],
    summary:
      "Dành cho người đã có nền tốt và cần tối ưu tốc độ, độ chính xác để chạm band cao.",
  },
  {
    id: "speaking-jumpstart",
    title: "Speaking Jumpstart",
    aliases: ["speaking jumpstart", "lớp speaking", "lop speaking", "khóa speaking", "khoa speaking"],
    level: "Speaking nền tảng",
    targetBand: "Giao tiếp và phản xạ nói",
    price: "3.600.000đ",
    sessions: "18 buổi",
    focus: [
      "Phản xạ nói câu ngắn",
      "Phát âm và ngữ điệu",
      "Q&A và mô tả tranh",
    ],
    summary:
      "Hợp nếu bạn cần luyện nói từ nền cơ bản trước khi vào lớp speaking chuyên sâu hơn.",
  },
  {
    id: "writing-lab",
    title: "Writing Lab",
    aliases: ["writing lab", "lớp writing", "lop writing", "khóa writing", "khoa writing"],
    level: "Writing ứng dụng",
    targetBand: "Viết email và phản hồi",
    price: "3.400.000đ",
    sessions: "16 buổi",
    focus: [
      "Email và phản hồi ngắn",
      "Opinion và proposal",
      "Feedback sửa bài trực tiếp",
    ],
    summary:
      "Phù hợp khi bạn muốn cải thiện kỹ năng viết cho học tập hoặc công việc.",
  },
  {
    id: "business-english",
    title: "Business English",
    aliases: ["business english", "tiếng anh công việc", "tieng anh cong viec"],
    level: "Ứng dụng công sở",
    targetBand: "Email, meeting, presentation",
    price: "4.800.000đ",
    sessions: "20 buổi",
    focus: [
      "Email, meeting, thuyết trình",
      "Mẫu câu làm việc với khách hàng",
      "Case study doanh nghiệp",
    ],
    summary:
      "Hợp cho người đi làm cần dùng tiếng Anh trong môi trường công sở.",
  },
  {
    id: "ielts-foundation",
    title: "IELTS Foundation 5.5",
    aliases: ["ielts foundation", "ielts 5.5", "foundation 5.5"],
    level: "IELTS nền tảng",
    targetBand: "0 - 5.5 IELTS",
    price: "4.300.000đ",
    sessions: "28 buổi",
    focus: [
      "Làm quen 4 kỹ năng IELTS",
      "Từ vựng học thuật nền tảng",
      "Phù hợp người chuyển từ TOEIC sang IELTS",
    ],
    summary:
      "Dành cho học viên muốn chuyển hướng sang IELTS với lộ trình nền tảng bài bản.",
  },
  {
    id: "ielts-mastery",
    title: "IELTS 6.5 Mastery",
    aliases: ["ielts mastery", "ielts 6.5", "mastery 6.5"],
    level: "IELTS nâng cao",
    targetBand: "5.5 - 6.5+ IELTS",
    price: "5.600.000đ",
    sessions: "32 buổi",
    focus: [
      "Reading và Writing band cao",
      "Speaking mock test",
      "Mục tiêu du học hoặc đầu ra học thuật",
    ],
    summary:
      "Phù hợp khi bạn đã có nền IELTS và muốn lên khoảng 6.5 cho học thuật hoặc du học.",
  },
  {
    id: "pronunciation-lab",
    title: "Pronunciation Lab",
    aliases: ["pronunciation lab", "phát âm", "phat am"],
    level: "Phát âm nền tảng",
    targetBand: "Sửa âm và nối âm",
    price: "2.900.000đ",
    sessions: "14 buổi",
    focus: [
      "Âm cuối, trọng âm, nối âm",
      "Shadowing hằng ngày",
      "Giảm ngại nói",
    ],
    summary:
      "Hợp cho người cần sửa phát âm trước khi luyện speaking chuyên sâu.",
  },
  {
    id: "interview-english",
    title: "Interview English",
    aliases: ["interview english", "phỏng vấn tiếng anh", "phong van tieng anh"],
    level: "Tiếng Anh phỏng vấn",
    targetBand: "Intern - fresher - đi làm",
    price: "3.700.000đ",
    sessions: "15 buổi",
    focus: [
      "CV pitch và self-introduction",
      "Q&A phỏng vấn thực tế",
      "Hợp cho sinh viên sắp đi thực tập hoặc xin việc",
    ],
    summary:
      "Dành cho học viên cần tiếng Anh phỏng vấn và giới thiệu bản thân trong bối cảnh tuyển dụng.",
  },
];

const SCHEDULE_GROUPS = [
  {
    campusId: "htm",
    campus: "Cơ sở Hồ Tùng Mậu",
    address: "Số 17, ngõ 20 Hồ Tùng Mậu, Cầu Giấy, Hà Nội",
    classes: [
      { code: "TA-HTM-01", course: "Tập Sự TOEIC", time: "19:00 - 20:30", days: "Thứ 2 - Thứ 4 - Thứ 6", opening: "05/04/2026" },
      { code: "TA-HTM-02", course: "TOEIC A", time: "18:30 - 20:00", days: "Thứ 3 - Thứ 5 - Thứ 7", opening: "08/04/2026" },
      { code: "TA-HTM-03", course: "TOEIC B", time: "20:00 - 21:30", days: "Thứ 2 - Thứ 4 - Thứ 6", opening: "12/04/2026" },
      { code: "TA-HTM-04", course: "TOEIC Roadmap 550+", time: "18:15 - 19:45", days: "Thứ 2 - Thứ 4 - Thứ 6", opening: "15/04/2026" },
      { code: "TA-HTM-05", course: "IELTS Foundation 5.5", time: "19:15 - 21:15", days: "Thứ 3 - Thứ 5", opening: "18/04/2026" },
    ],
  },
  {
    campusId: "ldt",
    campus: "Cơ sở Lê Đức Thọ",
    address: "Số 9 ngách 59 ngõ 21 Lê Đức Thọ, Nam Từ Liêm, Hà Nội",
    classes: [
      { code: "TA-LDT-01", course: "Tập Sự TOEIC", time: "17:45 - 19:15", days: "Thứ 3 - Thứ 5", opening: "06/04/2026" },
      { code: "TA-LDT-02", course: "TOEIC A", time: "19:15 - 20:45", days: "Thứ 3 - Thứ 5 - Chủ nhật", opening: "10/04/2026" },
      { code: "TA-LDT-03", course: "Speaking & Writing", time: "09:00 - 11:00", days: "Thứ 7 - Chủ nhật", opening: "17/04/2026" },
      { code: "TA-LDT-04", course: "Business English", time: "18:45 - 20:45", days: "Thứ 2 - Thứ 4", opening: "20/04/2026" },
      { code: "TA-LDT-05", course: "TOEIC Elite 850+", time: "20:00 - 21:30", days: "Thứ 3 - Thứ 5 - Thứ 7", opening: "24/04/2026" },
    ],
  },
];

const FAQ_TOPICS = [
  {
    id: "pricing",
    title: "Học phí và ưu đãi",
    scope: "all",
    keywords: ["học phí", "giá", "bao nhiêu tiền", "phí", "ưu đãi", "giảm giá", "combo"],
    content:
      "Website đang hiển thị học phí tham khảo theo từng khóa, đồng thời có ưu đãi giảm 25% và combo Tập Sự + TOEIC A giá 6.000.000đ. Nếu bạn cần mức phù hợp theo đầu vào và lịch học, nên để lại mục tiêu và khung giờ để được tư vấn chốt lớp.",
    actions: [
      { type: "message", label: "Hỏi khóa phù hợp", value: "Mình mất gốc thì nên học khóa nào?" },
      { type: "link", label: "Xem lịch khai giảng", href: "/lich-khai-giang" },
      { type: "link", label: "Gửi yêu cầu tư vấn", href: "/contact" },
    ],
  },
  {
    id: "registration",
    title: "Đăng ký tài khoản",
    scope: "all",
    keywords: ["đăng ký", "register", "tạo tài khoản", "otp", "gmail", "email", "không phải robot"],
    content:
      "Luồng đăng ký hiện tại đã bỏ OTP. Người dùng chỉ cần nhập tên hiển thị, email hợp lệ, mật khẩu tối thiểu 6 ký tự, tick ô xác nhận không phải robot và hệ thống sẽ tạo tài khoản ngay.",
    actions: [
      { type: "link", label: "Mở trang đăng ký", href: "/register" },
      { type: "message", label: "Hỏi đăng nhập Google", value: "Đăng nhập bằng Google thế nào?" },
      { type: "message", label: "Hỏi đăng nhập", value: "Mình muốn đăng nhập thì làm thế nào?" },
    ],
  },
  {
    id: "login",
    title: "Đăng nhập và hỗ trợ tài khoản",
    scope: "all",
    keywords: ["đăng nhập", "login", "mật khẩu", "quên mật khẩu", "google", "facebook", "social login"],
    content:
      "Người dùng có thể đăng nhập bằng email + mật khẩu. Nút Google/Facebook chỉ hoạt động khi hệ thống đã cấu hình OAuth. Nếu quên mật khẩu, bạn có thể mở trang Quên mật khẩu, nhập email đăng nhập và nhận liên kết đặt lại mật khẩu qua email.",
    actions: [
      { type: "link", label: "Mở đăng nhập", href: "/login" },
      { type: "link", label: "Quên mật khẩu", href: "/forgot-password" },
      { type: "message", label: "Hỏi đăng ký", value: "Tạo tài khoản mới như thế nào?" },
    ],
  },
  {
    id: "placement",
    title: "Placement test và full test",
    scope: "all",
    keywords: ["placement", "full test", "thi thử", "kiểm tra đầu vào", "kiểm tra trình độ", "đề thi", "toeic test"],
    content:
      "Hệ thống có trang tổng hợp đề thi và placement test để đo đầu vào, chấm điểm và gợi ý lộ trình. Đây là cách nhanh nhất nếu bạn chưa chắc nên học Tập Sự, TOEIC A, TOEIC B hay band cao hơn.",
    actions: [
      { type: "link", label: "Mở placement test", href: "/placement-tests" },
      { type: "message", label: "Hỏi lộ trình 650+", value: "Mình muốn lên 650 thì nên học gì?" },
      { type: "link", label: "Xem khóa học", href: "/courses-blog" },
    ],
  },
  {
    id: "contact",
    title: "Liên hệ trung tâm",
    scope: "all",
    keywords: ["liên hệ", "hotline", "số điện thoại", "email", "tư vấn", "gọi", "địa chỉ"],
    content:
      "Bạn có thể liên hệ trung tâm qua hotline 0344772436, email realtoeiccentral@gmail.com, hoặc gửi form tư vấn trên website. Hiện có hai cơ sở tại Hồ Tùng Mậu và Lê Đức Thọ, Hà Nội.",
    actions: [
      { type: "link", label: "Mở form tư vấn", href: "/contact" },
      { type: "link", label: "Xem lịch khai giảng", href: "/lich-khai-giang" },
      { type: "message", label: "Hỏi cơ sở gần nhất", value: "Cho mình địa chỉ 2 cơ sở" },
    ],
  },
  {
    id: "payment",
    title: "Đăng ký khóa học và thanh toán",
    scope: "all",
    keywords: ["đăng ký khóa học", "giữ chỗ", "thanh toán", "payment", "enrollment"],
    content:
      "Luồng đăng ký khóa học hiện tại là: chọn khóa học, nhập thông tin, hệ thống tạo đăng ký rồi chuyển sang bước thanh toán. Nếu bạn chưa chắc khóa phù hợp, nên làm placement test hoặc nhắn mục tiêu điểm để bot gợi ý trước.",
    actions: [
      { type: "link", label: "Đăng ký khóa học", href: "/register-course" },
      { type: "link", label: "Làm placement test", href: "/placement-tests" },
      { type: "message", label: "Hỏi khóa phù hợp", value: "Mình đang 400 muốn lên 650 nên học gì?" },
    ],
  },
];

const STUDENT_FEATURES = [
  {
    id: "student-classroom",
    title: "Classroom học viên",
    keywords: ["classroom", "lớp học", "bài giảng", "tài liệu", "giáo viên", "lớp của tôi"],
    content:
      "Trong tài khoản học viên, bạn có thể vào mục Classroom để xem lớp đang học, bảng tin lớp, bài đăng của giáo viên, tài liệu và trạng thái bài nộp.",
    actions: [
      { type: "link", label: "Mở Classroom", href: "/student/classroom" },
      { type: "message", label: "Cách nộp bài", value: "Nộp bài trong classroom như thế nào?" },
      { type: "link", label: "Mở hồ sơ", href: "/student/profile" },
    ],
  },
  {
    id: "student-submission",
    title: "Nộp bài và đánh dấu hoàn thành",
    keywords: ["nộp bài", "submit", "đánh dấu hoàn thành", "upload file", "bài tập"],
    content:
      "Học viên có thể mở bài đăng trong Classroom, tải lên tối đa 6 tệp nộp bài, thêm ghi chú và đánh dấu hoàn thành. Sau khi nộp, giáo viên sẽ nhận bài trong khu quản trị để chấm và phản hồi.",
    actions: [
      { type: "link", label: "Mở Classroom", href: "/student/classroom" },
      { type: "message", label: "Hỏi file nộp bài", value: "Một bài có thể nộp bao nhiêu file?" },
      { type: "message", label: "Hỏi xem bài giảng", value: "Làm sao xem bài giảng trong lớp?" },
    ],
  },
  {
    id: "student-practice",
    title: "Luyện tập theo Part và Reading",
    keywords: ["part 5", "part 6", "part 7", "luyện part", "reading", "practice", "luyện reading"],
    content:
      "Tài khoản học viên có mục luyện tập theo Part và Reading riêng. Bạn có thể vào /student/practice/parts để luyện theo dạng câu hỏi, hoặc /student/practice/reading để làm phiên Reading 75 phút.",
    actions: [
      { type: "link", label: "Luyện theo Part", href: "/student/practice/parts" },
      { type: "link", label: "Luyện Reading", href: "/student/practice/reading" },
      { type: "link", label: "Xem full test", href: "/placement-tests" },
    ],
  },
  {
    id: "student-dictation",
    title: "Nghe - chép chính tả",
    keywords: ["dictation", "nghe chép", "chính tả", "nghe chép chính tả"],
    content:
      "Học viên có khu riêng để luyện nghe - chép chính tả theo topic và lesson. Đây là phần phù hợp để tăng độ chắc nghe câu ngắn, số liệu, lịch hẹn và các mẫu câu công việc.",
    actions: [
      { type: "link", label: "Mở Dictation", href: "/student/dictation" },
      { type: "message", label: "Hỏi lộ trình nghe", value: "Mình nghe yếu thì nên luyện gì trước?" },
      { type: "link", label: "Luyện theo Part", href: "/student/practice/parts" },
    ],
  },
  {
    id: "student-contact-feedback",
    title: "Liên hệ và góp ý trong tài khoản học viên",
    keywords: ["góp ý", "feedback", "liên hệ trung tâm", "student contact", "student feedback"],
    content:
      "Ngay trong tài khoản học viên có trang liên hệ và góp ý riêng, giúp bạn gửi câu hỏi về lộ trình, lịch học, học phí hoặc phản hồi về trải nghiệm học tập mà không cần quay lại trang khách.",
    actions: [
      { type: "link", label: "Liên hệ học viên", href: "/student/contact" },
      { type: "link", label: "Gửi góp ý", href: "/student/feedback" },
      { type: "message", label: "Hỏi lịch mới", value: "Có lớp mới nào phù hợp buổi tối không?" },
    ],
  },
];

const STUDY_GUIDES = [
  {
    id: "study-mat-goc",
    title: "Lộ trình cho người mất gốc",
    keywords: ["mất gốc", "mat goc", "bắt đầu từ đâu", "bat dau tu dau", "học từ đầu"],
    content:
      "Nếu bạn mất gốc, nên đi theo thứ tự: lấy lại ngữ pháp nền + từ vựng cốt lõi, luyện nghe ngắn và câu cơ bản, rồi mới chuyển sang đề TOEIC hoàn chỉnh. Thực tế trong hệ thống này, nhóm phù hợp nhất thường là Tập Sự TOEIC hoặc TOEIC Starter 350+ trước khi lên TOEIC A.",
    actions: [
      { type: "message", label: "Gợi ý khóa cho người mất gốc", value: "Mình mất gốc thì nên học khóa nào?" },
      { type: "link", label: "Làm placement test", href: "/placement-tests" },
      { type: "link", label: "Xem khóa học", href: "/courses-blog" },
    ],
  },
  {
    id: "study-toeic-vs-ielts",
    title: "Nên học TOEIC hay IELTS",
    keywords: ["toeic hay ielts", "nên học toeic hay ielts", "nen hoc toeic hay ielts", "so sánh toeic ielts"],
    content:
      "Nếu mục tiêu chính là đi làm, hồ sơ tốt nghiệp, tuyển dụng doanh nghiệp hoặc cần thước đo nhanh cho Listening/Reading, TOEIC thường hợp hơn. Nếu mục tiêu là du học, học thuật hoặc cần chứng chỉ 4 kỹ năng học thuật, IELTS sẽ phù hợp hơn.",
    actions: [
      { type: "message", label: "Hỏi lộ trình TOEIC", value: "Mình muốn lên 650 TOEIC thì nên học gì?" },
      { type: "message", label: "Hỏi lộ trình IELTS", value: "Mình muốn bắt đầu IELTS thì nên học khóa nào?" },
      { type: "link", label: "Xem khóa học", href: "/courses-blog" },
    ],
  },
  {
    id: "study-part7",
    title: "Cách cải thiện Part 7",
    keywords: ["part 7", "reading dài", "đọc chậm", "doc cham", "skim", "scan"],
    content:
      "Để cải thiện Part 7, bạn nên luyện theo ba bước: đọc câu hỏi trước để chốt từ khóa, quét văn bản theo cụm thông tin thay vì dịch từng câu, rồi đánh dấu lỗi sai theo từng dạng như detail, inference hay purpose. Nếu học ngay trên hệ thống, mục Reading practice là nơi phù hợp nhất để luyện nhịp này.",
    actions: [
      { type: "link", label: "Luyện Reading", href: "/student/practice/reading" },
      { type: "message", label: "Hỏi lộ trình 650+", value: "Mình muốn lên 650 thì nên học gì?" },
      { type: "link", label: "Làm full test", href: "/placement-tests" },
    ],
  },
  {
    id: "study-plan",
    title: "Gợi ý kế hoạch học",
    keywords: ["kế hoạch học", "plan học", "study plan", "lịch học cá nhân", "lộ trình học"],
    content:
      "Một kế hoạch học hiệu quả thường cần 4 buổi mỗi tuần: 2 buổi học kỹ thuật và chữa lỗi, 1 buổi luyện part hoặc reading/listening có giờ, 1 buổi full test hoặc mini test để đo tiến độ. Khi bạn nói rõ điểm hiện tại, mục tiêu và khung giờ rảnh, bot có thể gợi ý lộ trình sát hơn.",
    actions: [
      { type: "message", label: "Gợi ý lộ trình 450+", value: "Mình đang 250 muốn lên 450 thì nên học gì?" },
      { type: "message", label: "Gợi ý lộ trình 650+", value: "Mình đang 400 muốn lên 650 thì nên học gì?" },
      { type: "link", label: "Làm placement test", href: "/placement-tests" },
    ],
  },
];

module.exports = {
  CENTER_INFO,
  COURSE_CATALOG,
  SCHEDULE_GROUPS,
  FAQ_TOPICS,
  STUDENT_FEATURES,
  STUDY_GUIDES,
};
