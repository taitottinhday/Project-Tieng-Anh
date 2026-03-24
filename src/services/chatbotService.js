const {
  CENTER_INFO,
  COURSE_CATALOG,
  SCHEDULE_GROUPS,
  FAQ_TOPICS,
  STUDENT_FEATURES,
  STUDY_GUIDES,
} = require("../data/chatbotKnowledge");

const MAX_HISTORY_ITEMS = 10;

const INTENT_KEYWORDS = {
  greeting: ["chào", "hello", "hi", "xin chao", "alo", "hey"],
  reset: ["bắt đầu lại", "reset", "làm mới chat", "xóa hội thoại", "xoa hoi thoai"],
  recommendation: ["nên học", "nen hoc", "gợi ý", "goi y", "tư vấn", "tu van", "lộ trình", "lo trinh", "học khóa nào", "hoc khoa nao"],
  pricing: ["học phí", "gia", "giá", "bao nhiêu tiền", "chi phí", "phi", "ưu đãi", "uu dai", "combo"],
  schedule: ["lịch", "lich", "khai giảng", "khai giang", "ca học", "ca hoc", "buổi tối", "buoi toi", "cuối tuần", "cuoi tuan"],
  placement: ["placement", "full test", "thi thử", "thi thu", "kiểm tra đầu vào", "kiem tra dau vao", "kiểm tra trình độ", "kiem tra trinh do"],
  registration: ["đăng ký", "dang ky", "tạo tài khoản", "tao tai khoan", "otp", "gmail", "email"],
  login: ["đăng nhập", "dang nhap", "login", "mật khẩu", "mat khau", "quên mật khẩu", "quen mat khau"],
  social: ["google", "facebook", "social login"],
  contact: ["liên hệ", "lien he", "hotline", "số điện thoại", "so dien thoai", "email", "địa chỉ", "dia chi", "cơ sở", "co so"],
  classroom: ["classroom", "lớp học", "lop hoc", "bài giảng", "bai giang", "tài liệu", "tai lieu"],
  submission: ["nộp bài", "nop bai", "submit", "upload file", "đánh dấu hoàn thành", "danh dau hoan thanh", "bài tập", "bai tap"],
  practice: ["part 5", "part 6", "part 7", "luyện part", "luyen part", "reading", "practice", "thi thử", "thi thu"],
  dictation: ["dictation", "nghe chép", "nghe chep", "chính tả", "chinh ta"],
  profile: ["hồ sơ", "ho so", "profile", "thông tin cá nhân", "thong tin ca nhan"],
  feedback: ["góp ý", "gop y", "feedback", "phản hồi", "phan hoi"],
  payment: ["thanh toán", "thanh toan", "giữ chỗ", "giu cho", "payment"],
  studyAdvice: ["mất gốc", "mat goc", "toeic hay ielts", "nên học toeic hay ielts", "cách học", "cach hoc", "kế hoạch học", "ke hoach hoc", "part 7"],
  generative: ["giải thích", "giai thich", "so sánh", "so sanh", "viết", "viet", "dịch", "dich", "phân tích", "phan tich", "tại sao", "tai sao"],
};

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s+.-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildHref(baseUrl = "", href = "") {
  if (!href) return baseUrl || "";
  if (/^https?:\/\//i.test(href)) return href;
  const safeBaseUrl = String(baseUrl || "").replace(/\/+$/, "");
  const safeHref = String(href || "").startsWith("/") ? href : `/${href}`;
  return `${safeBaseUrl}${safeHref}`;
}

function buildMessageAction(label, value) {
  return { type: "message", label, value };
}

function buildLinkAction(label, href, baseUrl) {
  return { type: "link", label, href: buildHref(baseUrl, href) };
}

function hydrateActions(actions = [], baseUrl = "") {
  return actions.map((action) => {
    if (action.type === "link") {
      return buildLinkAction(action.label, action.href, baseUrl);
    }
    return buildMessageAction(action.label, action.value || action.label);
  });
}

function dedupeActions(actions = []) {
  const seen = new Set();
  return actions.filter((action) => {
    const key = `${action.type}:${action.label}:${action.href || action.value || ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function actionsToSuggestions(actions = []) {
  return actions
    .slice(0, 4)
    .map((action) => (action.type === "message" ? action.value : action.label))
    .filter(Boolean);
}

function matchesKeyword(normalizedMessage, keyword) {
  return normalizedMessage.includes(normalizeText(keyword));
}

function countKeywordMatches(normalizedMessage, keywords = []) {
  return keywords.reduce((score, keyword) => score + (matchesKeyword(normalizedMessage, keyword) ? 1 : 0), 0);
}

function hasAnyKeyword(normalizedMessage, keywords = []) {
  return countKeywordMatches(normalizedMessage, keywords) > 0;
}

function firstNonEmpty(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== "");
}

function clampHistory(history = []) {
  return history
    .filter((item) => item && item.role && item.text)
    .slice(-MAX_HISTORY_ITEMS);
}

function createInitialState(rawState = {}) {
  return {
    history: clampHistory(rawState.history || []),
    profile: rawState.profile && typeof rawState.profile === "object" ? rawState.profile : {},
    lastTopic: rawState.lastTopic || null,
  };
}

function addHistoryItem(history, role, text) {
  if (!text) return clampHistory(history);
  return clampHistory([...(history || []), { role, text, at: new Date().toISOString() }]);
}

function extractAllScores(normalizedMessage) {
  return [...normalizedMessage.matchAll(/\b(\d{2,3})(?:\+)?\b/g)]
    .map((match) => Number(match[1]))
    .filter((value) => value >= 100 && value <= 990);
}

function extractScoreNearKeywords(normalizedMessage, keywords = []) {
  for (const keyword of keywords) {
    const pattern = new RegExp(`${normalizeText(keyword)}[^\\d]{0,16}(\\d{2,3})(?:\\+)?`);
    const match = normalizedMessage.match(pattern);
    if (match) {
      const value = Number(match[1]);
      if (value >= 100 && value <= 990) return value;
    }
  }
  return null;
}

function detectSchedulePreference(normalizedMessage) {
  if (hasAnyKeyword(normalizedMessage, ["cuối tuần", "cuoi tuan", "thứ 7", "thu 7", "chủ nhật", "chu nhat", "weekend"])) return "cuối tuần";
  if (hasAnyKeyword(normalizedMessage, ["buổi tối", "buoi toi", "tối", "toi", "sau giờ làm", "sau gio lam"])) return "buổi tối";
  if (hasAnyKeyword(normalizedMessage, ["buổi sáng", "buoi sang", "sáng", "sang"])) return "buổi sáng";
  if (hasAnyKeyword(normalizedMessage, ["buổi chiều", "buoi chieu", "chiều", "chieu"])) return "buổi chiều";
  return null;
}

function detectCampus(normalizedMessage) {
  return CENTER_INFO.campuses.find((campus) => countKeywordMatches(normalizedMessage, campus.aliases) > 0) || null;
}

function detectLevelHint(normalizedMessage) {
  if (hasAnyKeyword(normalizedMessage, ["mất gốc", "mat goc", "từ đầu", "tu dau", "beginner"])) return "mat-goc";
  if (hasAnyKeyword(normalizedMessage, ["đi làm", "di lam", "công việc", "cong viec", "business"])) return "work";
  return null;
}

function detectTrack(normalizedMessage) {
  if (hasAnyKeyword(normalizedMessage, ["ielts"])) return "ielts";
  if (hasAnyKeyword(normalizedMessage, ["speaking", "nói", "noi", "writing", "viết", "viet"])) return "skills";
  return "toeic";
}

function scoreCourse(normalizedMessage, course) {
  const aliasScore = countKeywordMatches(normalizedMessage, course.aliases) * 5;
  const titleScore = matchesKeyword(normalizedMessage, course.title) ? 4 : 0;
  const focusScore = countKeywordMatches(normalizedMessage, course.focus) * 2;
  return aliasScore + titleScore + focusScore;
}

function findCourseById(id) {
  return COURSE_CATALOG.find((course) => course.id === id) || null;
}

function findBestCourseMatch(normalizedMessage, fallbackState) {
  const rankedCourses = COURSE_CATALOG
    .map((course) => ({ course, score: scoreCourse(normalizedMessage, course) }))
    .sort((left, right) => right.score - left.score);

  if (rankedCourses[0] && rankedCourses[0].score > 0) {
    return rankedCourses[0].course;
  }

  if (fallbackState?.lastTopic && String(fallbackState.lastTopic).startsWith("course:")) {
    return findCourseById(String(fallbackState.lastTopic).replace("course:", ""));
  }

  return null;
}

function matchKnowledgeEntries(normalizedMessage, entries = [], titleField = "title") {
  return entries
    .map((entry) => ({
      entry,
      score:
        countKeywordMatches(normalizedMessage, entry.keywords || []) * 4 +
        (matchesKeyword(normalizedMessage, entry[titleField] || "") ? 2 : 0),
    }))
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score)
    .map((item) => item.entry);
}

function inferProfile(normalizedMessage, state, matchedCourse) {
  const previousProfile = state?.profile || {};
  const allScores = extractAllScores(normalizedMessage);
  const explicitCurrentScore =
    extractScoreNearKeywords(normalizedMessage, ["hiện tại", "hien tai", "đang", "dang", "đầu vào", "dau vao"]) || null;
  const explicitTargetScore =
    extractScoreNearKeywords(normalizedMessage, ["mục tiêu", "muc tieu", "muốn", "muon", "target", "đầu ra", "dau ra", "lên", "len"]) || null;

  let currentScore = explicitCurrentScore;
  let targetScore = explicitTargetScore;

  if (!currentScore && !targetScore && allScores.length === 1) {
    targetScore = allScores[0];
  }

  if ((!currentScore || !targetScore) && allScores.length >= 2) {
    const first = allScores[0];
    const last = allScores[allScores.length - 1];
    if (!currentScore) currentScore = Math.min(first, last);
    if (!targetScore) targetScore = Math.max(first, last);
  }

  return {
    currentScore: firstNonEmpty(currentScore, previousProfile.currentScore, null),
    targetScore: firstNonEmpty(targetScore, previousProfile.targetScore, null),
    schedulePreference: firstNonEmpty(detectSchedulePreference(normalizedMessage), previousProfile.schedulePreference, null),
    campusId: firstNonEmpty(detectCampus(normalizedMessage)?.id, previousProfile.campusId, null),
    levelHint: firstNonEmpty(detectLevelHint(normalizedMessage), previousProfile.levelHint, null),
    track: firstNonEmpty(detectTrack(normalizedMessage), previousProfile.track, "toeic"),
    lastCourseId: firstNonEmpty(matchedCourse?.id, previousProfile.lastCourseId, null),
  };
}

function parseClassStartHour(timeLabel = "") {
  const match = String(timeLabel).match(/(\d{1,2}):/);
  return match ? Number(match[1]) : null;
}

function classMatchesCourse(classItem, course) {
  if (!course) return true;
  const normalizedClassCourse = normalizeText(classItem.course);
  return [course.title, ...(course.aliases || [])].some((alias) => normalizedClassCourse.includes(normalizeText(alias)));
}

function classMatchesPreference(classItem, profile) {
  const startHour = parseClassStartHour(classItem.time);
  const days = normalizeText(classItem.days);

  if (profile.schedulePreference === "buổi sáng" && startHour !== null && startHour >= 12) return false;
  if (profile.schedulePreference === "buổi chiều" && (startHour === null || startHour < 12 || startHour >= 18)) return false;
  if (profile.schedulePreference === "buổi tối" && (startHour === null || startHour < 17)) return false;
  if (profile.schedulePreference === "cuối tuần" && !(days.includes("thu 7") || days.includes("chu nhat"))) return false;
  return true;
}

function findMatchingClasses(profile = {}, course = null) {
  const matches = [];

  for (const group of SCHEDULE_GROUPS) {
    if (profile.campusId && group.campusId !== profile.campusId) continue;

    for (const classItem of group.classes) {
      if (!classMatchesCourse(classItem, course)) continue;
      if (!classMatchesPreference(classItem, profile)) continue;

      matches.push({
        ...classItem,
        campus: group.campus,
        address: group.address,
      });
    }
  }

  return matches.slice(0, 4);
}

function formatBulletList(items = []) {
  return items.map((item) => `- ${item}`).join("\n");
}

function getCourseRecommendation(profile, normalizedMessage) {
  const isIelts = profile.track === "ielts" || hasAnyKeyword(normalizedMessage, ["ielts"]);
  const wantsSpeaking = hasAnyKeyword(normalizedMessage, ["speaking", "nói", "noi"]);
  const wantsWriting = hasAnyKeyword(normalizedMessage, ["writing", "viết", "viet"]);
  const wantsPronunciation = hasAnyKeyword(normalizedMessage, ["phát âm", "phat am", "pronunciation"]);
  const wantsInterview = hasAnyKeyword(normalizedMessage, ["phỏng vấn", "phong van", "interview"]);
  const wantsBusiness = hasAnyKeyword(normalizedMessage, ["business", "công việc", "cong viec", "đi làm", "di lam"]);

  if (isIelts) {
    if (hasAnyKeyword(normalizedMessage, ["6.5", "6 5"]) || (profile.targetScore && profile.targetScore >= 650)) {
      return [findCourseById("ielts-mastery"), findCourseById("ielts-foundation")].filter(Boolean);
    }
    return [findCourseById("ielts-foundation"), findCourseById("ielts-mastery")].filter(Boolean);
  }

  if (wantsSpeaking && wantsWriting) {
    return [findCourseById("toeic-sw"), findCourseById("speaking-jumpstart"), findCourseById("writing-lab")].filter(Boolean);
  }
  if (wantsSpeaking) {
    return [findCourseById("speaking-jumpstart"), findCourseById("toeic-sw"), findCourseById("pronunciation-lab")].filter(Boolean);
  }
  if (wantsWriting) {
    return [findCourseById("writing-lab"), findCourseById("toeic-sw")].filter(Boolean);
  }
  if (wantsPronunciation) {
    return [findCourseById("pronunciation-lab"), findCourseById("speaking-jumpstart")].filter(Boolean);
  }
  if (wantsInterview) {
    return [findCourseById("interview-english"), findCourseById("business-english")].filter(Boolean);
  }
  if (wantsBusiness) {
    return [findCourseById("business-english"), findCourseById("toeic-b")].filter(Boolean);
  }
  if (profile.levelHint === "mat-goc") {
    return [findCourseById("tap-su"), findCourseById("toeic-starter-350"), findCourseById("toeic-a")].filter(Boolean);
  }

  const currentScore = Number(profile.currentScore || 0);
  const targetScore = Number(profile.targetScore || 0);
  const referenceScore = targetScore || currentScore;

  if (currentScore && targetScore) {
    if (currentScore < 300 && targetScore >= 550) {
      return [findCourseById("tap-su"), findCourseById("toeic-a"), findCourseById("toeic-roadmap-550")].filter(Boolean);
    }
    if (currentScore < 450 && targetScore >= 650) {
      return [findCourseById("toeic-a"), findCourseById("toeic-roadmap-550"), findCourseById("toeic-intensive-650")].filter(Boolean);
    }
    if (currentScore >= 500 && targetScore >= 750) {
      return [findCourseById("toeic-intensive-650"), findCourseById("toeic-fast-track-750")].filter(Boolean);
    }
  }

  if (referenceScore <= 350) return [findCourseById("tap-su"), findCourseById("toeic-starter-350")].filter(Boolean);
  if (referenceScore <= 550) return [findCourseById("toeic-a"), findCourseById("toeic-roadmap-550")].filter(Boolean);
  if (referenceScore <= 650) return [findCourseById("toeic-b"), findCourseById("toeic-intensive-650")].filter(Boolean);
  if (referenceScore <= 750) return [findCourseById("toeic-fast-track-750"), findCourseById("toeic-b")].filter(Boolean);

  return [findCourseById("toeic-elite-850"), findCourseById("toeic-fast-track-750"), findCourseById("toeic-sw")].filter(Boolean);
}

function isOAuthEnabled(provider) {
  if (provider === "google") {
    return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  }
  if (provider === "facebook") {
    return Boolean(process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET);
  }
  return false;
}

function buildWelcomeReply(scope, baseUrl) {
  const answer =
    scope === "student"
      ? "Chào bạn. Mình có thể hỗ trợ về Classroom, cách nộp bài, luyện Part, Reading, Dictation, lịch học mới, khóa học phù hợp và liên hệ trung tâm."
      : "Chào bạn. Mình có thể tư vấn khóa học, lộ trình điểm, học phí, lịch khai giảng, placement test, đăng ký tài khoản và cách liên hệ trung tâm.";

  const actions =
    scope === "student"
      ? [
          buildLinkAction("Mở Classroom", "/student/classroom", baseUrl),
          buildLinkAction("Luyện theo Part", "/student/practice/parts", baseUrl),
          buildLinkAction("Mở Dictation", "/student/dictation", baseUrl),
          buildMessageAction("Cách nộp bài", "Nộp bài trong classroom như thế nào?"),
        ]
      : [
          buildMessageAction("Khóa phù hợp", "Mình mất gốc thì nên học khóa nào?"),
          buildLinkAction("Làm placement test", "/placement-tests", baseUrl),
          buildLinkAction("Xem lịch khai giảng", "/lich-khai-giang", baseUrl),
          buildLinkAction("Liên hệ tư vấn", "/contact", baseUrl),
        ];

  return { answer, actions, matchedTopic: "welcome", mode: "deterministic" };
}

function buildResetReply(scope, baseUrl) {
  return {
    ...buildWelcomeReply(scope, baseUrl),
    answer:
      scope === "student"
        ? "Mình đã làm mới hội thoại. Bạn có thể hỏi lại về Classroom, luyện tập, Dictation, lịch học hoặc khóa học phù hợp."
        : "Mình đã làm mới hội thoại. Bạn có thể hỏi lại về khóa học, lịch khai giảng, placement test, đăng ký tài khoản hoặc liên hệ tư vấn.",
    matchedTopic: "reset",
  };
}

function buildCourseDetailReply(course, baseUrl, extraClasses = []) {
  const classLines = extraClasses.length
    ? `\nLớp đang khớp với yêu cầu của bạn:\n${formatBulletList(
        extraClasses.map((item) => `${item.code} | ${item.course} | ${item.time} | ${item.days} | khai giảng ${item.opening} | ${item.campus}`)
      )}`
    : "";

  const answer =
    `${course.title} phù hợp cho nhóm ${course.level}, mục tiêu khoảng ${course.targetBand}. ` +
    `Học phí tham khảo hiện là ${course.price} cho ${course.sessions}. ` +
    `Trọng tâm khóa học:\n${formatBulletList(course.focus)}\n` +
    `Tóm tắt: ${course.summary}${classLines}`;

  const actions = dedupeActions([
    buildLinkAction("Đăng ký khóa này", "/register-course", baseUrl),
    buildLinkAction("Xem lịch khai giảng", "/lich-khai-giang", baseUrl),
    buildLinkAction("Làm placement test", "/placement-tests", baseUrl),
    buildMessageAction("Hỏi khóa tiếp theo", "Nếu học xong khóa này thì nên học tiếp gì?"),
  ]);

  return { answer, actions, matchedTopic: `course:${course.id}`, mode: "deterministic" };
}

function buildPricingReply(course, baseUrl) {
  if (course) {
    return {
      answer: `${course.title} hiện đang hiển thị học phí tham khảo ${course.price} cho ${course.sessions}. Nếu bạn muốn mình so thêm với các khóa gần band mục tiêu của bạn, hãy cho mình biết điểm hiện tại hoặc mục tiêu.`,
      actions: dedupeActions([
        buildLinkAction("Đăng ký khóa học", "/register-course", baseUrl),
        buildLinkAction("Xem lịch khai giảng", "/lich-khai-giang", baseUrl),
        buildMessageAction("Khóa phù hợp", "Mình đang 400 muốn lên 650 nên học gì?"),
      ]),
      matchedTopic: `pricing:${course.id}`,
      mode: "deterministic",
    };
  }

  const examples = COURSE_CATALOG.slice(0, 6).map((item) => `${item.title}: ${item.price}`);
  return {
    answer:
      `Học phí tham khảo trên website hiện dao động tùy khóa, ví dụ:\n${formatBulletList(examples)}\n` +
      `Ngoài ra còn có ${CENTER_INFO.discountLabel.toLowerCase()} và ${CENTER_INFO.comboOffer.title} giá ${CENTER_INFO.comboOffer.price}. ` +
      `Nếu bạn nói rõ mục tiêu điểm, mình sẽ gợi ý luôn khóa hợp lý thay vì báo giá chung.`,
    actions: dedupeActions([
      buildMessageAction("Mất gốc học gì", "Mình mất gốc thì nên học khóa nào?"),
      buildMessageAction("Mục tiêu 650+", "Mình muốn lên 650 thì nên học gì?"),
      buildLinkAction("Gửi yêu cầu tư vấn", "/contact", baseUrl),
    ]),
    matchedTopic: "pricing",
    mode: "deterministic",
  };
}

function buildScheduleReply(profile, course, baseUrl) {
  const matches = findMatchingClasses(profile, course);

  if (matches.length) {
    const scopeNote = [
      course ? `khóa ${course.title}` : null,
      profile.schedulePreference || null,
      profile.campusId ? (CENTER_INFO.campuses.find((campus) => campus.id === profile.campusId)?.name || null) : null,
    ]
      .filter(Boolean)
      .join(" | ");

    return {
      answer:
        `${scopeNote ? `Mình đã lọc theo ${scopeNote}. ` : ""}Các lớp đang phù hợp nhất là:\n` +
        formatBulletList(
          matches.map(
            (item) =>
              `${item.code} | ${item.course} | ${item.time} | ${item.days} | khai giảng ${item.opening} | ${item.campus}`
          )
        ),
      actions: dedupeActions([
        buildLinkAction("Mở lịch khai giảng", "/lich-khai-giang", baseUrl),
        buildLinkAction("Đăng ký khóa học", "/register-course", baseUrl),
        buildMessageAction("Hỏi khóa phù hợp", "Mình đang 400 muốn lên 650 nên học gì?"),
      ]),
      matchedTopic: course ? `schedule:${course.id}` : "schedule",
      mode: "deterministic",
    };
  }

  return {
    answer:
      "Mình chưa lọc được lớp khớp chính xác theo yêu cầu hiện tại. Bạn có thể nói rõ thêm khóa muốn học, cơ sở ưu tiên hoặc khung giờ như buổi tối hay cuối tuần để mình lọc sát hơn.",
    actions: dedupeActions([
      buildLinkAction("Xem lịch đầy đủ", "/lich-khai-giang", baseUrl),
      buildMessageAction("Lọc lớp buổi tối", "Cho mình lớp buổi tối"),
      buildMessageAction("Lọc lớp cuối tuần", "Cho mình lớp cuối tuần"),
    ]),
    matchedTopic: "schedule",
    mode: "deterministic",
  };
}

function buildRecommendationReply(profile, normalizedMessage, baseUrl) {
  const recommendations = getCourseRecommendation(profile, normalizedMessage);
  const primary = recommendations[0];
  const matches = findMatchingClasses(profile, primary);

  if (!primary) {
    return {
      answer: "Mình cần thêm một chút dữ liệu để gợi ý chính xác hơn. Bạn hãy cho mình biết điểm hiện tại, mục tiêu điểm và khung giờ rảnh.",
      actions: dedupeActions([
        buildMessageAction("Mình mất gốc", "Mình mất gốc thì nên học khóa nào?"),
        buildMessageAction("Mục tiêu 650+", "Mình đang 400 muốn lên 650 nên học gì?"),
        buildLinkAction("Làm placement test", "/placement-tests", baseUrl),
      ]),
      matchedTopic: "recommendation",
      mode: "advisory",
    };
  }

  const contextParts = [];
  if (profile.currentScore) contextParts.push(`điểm hiện tại khoảng ${profile.currentScore}`);
  if (profile.targetScore) contextParts.push(`mục tiêu ${profile.targetScore}+`);
  if (profile.schedulePreference) contextParts.push(profile.schedulePreference);

  const secondaryTitles = recommendations.slice(1, 3).map((course) => course.title);
  const scheduleText = matches.length
    ? `\nLớp khớp gần nhất với yêu cầu của bạn:\n${formatBulletList(
        matches.map((item) => `${item.code} | ${item.time} | ${item.days} | khai giảng ${item.opening} | ${item.campus}`)
      )}`
    : "";

  return {
    answer:
      `${contextParts.length ? `Với ${contextParts.join(", ")}, ` : ""}mình ưu tiên gợi ý ${primary.title}. ` +
      `${primary.summary} Học phí tham khảo hiện là ${primary.price} cho ${primary.sessions}.\n` +
      `Trọng tâm khóa học:\n${formatBulletList(primary.focus)}` +
      `${secondaryTitles.length ? `\nBạn cũng có thể cân nhắc thêm: ${secondaryTitles.join(", ")}.` : ""}` +
      scheduleText,
    actions: dedupeActions([
      buildLinkAction("Làm placement test", "/placement-tests", baseUrl),
      buildLinkAction("Xem lịch khai giảng", "/lich-khai-giang", baseUrl),
      buildLinkAction("Đăng ký khóa học", "/register-course", baseUrl),
      buildMessageAction("Hỏi học phí", `Học phí ${primary.title} là bao nhiêu?`),
    ]),
    matchedTopic: `course:${primary.id}`,
    mode: "advisory",
  };
}

function buildPlacementReply(baseUrl) {
  return {
    answer:
      "Nếu bạn chưa chắc nên học khóa nào, placement test là bước nên làm đầu tiên. Hệ thống có trang tổng hợp đề thi và placement test để đo đầu vào, chấm điểm và gợi ý lộ trình theo band phù hợp.",
    actions: dedupeActions([
      buildLinkAction("Mở placement test", "/placement-tests", baseUrl),
      buildMessageAction("Hỏi lộ trình 450+", "Mình đang 250 muốn lên 450 thì nên học gì?"),
      buildMessageAction("Hỏi lộ trình 650+", "Mình đang 400 muốn lên 650 thì nên học gì?"),
    ]),
    matchedTopic: "placement",
    mode: "deterministic",
  };
}

function buildAuthReply(normalizedMessage, baseUrl) {
  const asksOtp = hasAnyKeyword(normalizedMessage, ["otp"]);
  const asksForgotPassword = hasAnyKeyword(normalizedMessage, ["quên mật khẩu", "quen mat khau"]);
  const asksGoogle = hasAnyKeyword(normalizedMessage, ["google"]);
  const asksFacebook = hasAnyKeyword(normalizedMessage, ["facebook"]);
  let answer = "";

  if (asksOtp) {
    answer += "Luồng đăng ký hiện tại đã bỏ OTP. Bạn chỉ cần nhập tên hiển thị, email hợp lệ, mật khẩu tối thiểu 6 ký tự, tick ô xác nhận không phải robot và hệ thống sẽ tạo tài khoản ngay. ";
  }
  if (asksForgotPassword) {
    answer += "Hiện website chưa có trang tự đặt lại mật khẩu riêng. Nếu quên mật khẩu, bạn nên liên hệ trung tâm để được hỗ trợ nhanh. ";
  }
  if (asksGoogle || asksFacebook) {
    const googleEnabled = isOAuthEnabled("google");
    const facebookEnabled = isOAuthEnabled("facebook");
    answer += `Bạn có thể dùng nút Google/Facebook trên trang đăng nhập khi hệ thống đã bật OAuth. Trạng thái hiện tại: Google ${googleEnabled ? "đã bật" : "chưa bật"}, Facebook ${facebookEnabled ? "đã bật" : "chưa bật"}. `;
  }
  if (!answer) {
    answer =
      "Bạn có thể đăng ký bằng email + mật khẩu hoặc đăng nhập trực tiếp trên trang tài khoản. Nếu muốn dùng Google/Facebook, hệ thống cần bật OAuth tương ứng. Nếu quên mật khẩu, hiện nên liên hệ trung tâm để được hỗ trợ.";
  }

  return {
    answer: answer.trim(),
    actions: dedupeActions([
      buildLinkAction("Mở đăng ký", "/register", baseUrl),
      buildLinkAction("Mở đăng nhập", "/login", baseUrl),
      buildLinkAction("Liên hệ hỗ trợ", "/contact", baseUrl),
    ]),
    matchedTopic: "auth",
    mode: "deterministic",
  };
}

function buildContactReply(baseUrl) {
  const campusLines = CENTER_INFO.campuses.map((campus) => `${campus.name}: ${campus.address}`);
  return {
    answer:
      `Bạn có thể liên hệ trung tâm qua hotline ${CENTER_INFO.hotline}, email ${CENTER_INFO.email}, hoặc form tư vấn trên website.\n` +
      `Địa chỉ hiện có:\n${formatBulletList(campusLines)}`,
    actions: dedupeActions([
      buildLinkAction("Mở form tư vấn", "/contact", baseUrl),
      buildLinkAction("Xem lịch khai giảng", "/lich-khai-giang", baseUrl),
      buildMessageAction("Hỏi cơ sở gần nhất", "Cho mình địa chỉ 2 cơ sở"),
    ]),
    matchedTopic: "contact",
    mode: "deterministic",
  };
}

function buildPaymentReply(baseUrl) {
  return {
    answer:
      "Luồng đăng ký khóa học hiện tại là: chọn khóa học, nhập thông tin, hệ thống tạo đăng ký rồi chuyển sang bước thanh toán. Nếu bạn chưa chắc khóa phù hợp, nên làm placement test hoặc nói rõ mục tiêu điểm để mình gợi ý trước.",
    actions: dedupeActions([
      buildLinkAction("Đăng ký khóa học", "/register-course", baseUrl),
      buildLinkAction("Làm placement test", "/placement-tests", baseUrl),
      buildMessageAction("Hỏi khóa phù hợp", "Mình đang 400 muốn lên 650 nên học gì?"),
    ]),
    matchedTopic: "payment",
    mode: "deterministic",
  };
}

function buildStudentReply(intentKey, baseUrl) {
  const map = {
    classroom: "student-classroom",
    submission: "student-submission",
    practice: "student-practice",
    dictation: "student-dictation",
    feedback: "student-contact-feedback",
    profile: "student-classroom",
  };

  const topic = STUDENT_FEATURES.find((item) => item.id === map[intentKey]) || STUDENT_FEATURES[0];
  return {
    answer: topic.content,
    actions: hydrateActions(topic.actions, baseUrl),
    matchedTopic: topic.id,
    mode: "deterministic",
  };
}

function buildKnowledgeFallback(scope, baseUrl) {
  return {
    answer:
      scope === "student"
        ? "Mình chưa đủ ngữ cảnh cho câu hỏi này. Bạn có thể hỏi cụ thể hơn về Classroom, nộp bài, luyện Part, Reading, Dictation, lịch học hoặc khóa học phù hợp."
        : "Mình chưa đủ ngữ cảnh cho câu hỏi này. Bạn có thể hỏi cụ thể hơn về khóa học, lộ trình điểm, học phí, lịch khai giảng, placement test, đăng ký tài khoản hoặc liên hệ trung tâm.",
    actions:
      scope === "student"
        ? [
            buildLinkAction("Mở Classroom", "/student/classroom", baseUrl),
            buildLinkAction("Luyện Reading", "/student/practice/reading", baseUrl),
            buildLinkAction("Mở Dictation", "/student/dictation", baseUrl),
            buildMessageAction("Cách nộp bài", "Nộp bài trong classroom như thế nào?"),
          ]
        : [
            buildMessageAction("Mất gốc học gì", "Mình mất gốc thì nên học khóa nào?"),
            buildLinkAction("Làm placement test", "/placement-tests", baseUrl),
            buildLinkAction("Xem lịch khai giảng", "/lich-khai-giang", baseUrl),
            buildLinkAction("Liên hệ tư vấn", "/contact", baseUrl),
          ],
    matchedTopic: "fallback",
    mode: "fallback",
  };
}

function buildStudyGuideReply(normalizedMessage, baseUrl) {
  const guide = matchKnowledgeEntries(normalizedMessage, STUDY_GUIDES)[0] || STUDY_GUIDES[0];
  return {
    answer: guide.content,
    actions: hydrateActions(guide.actions, baseUrl),
    matchedTopic: guide.id,
    mode: "advisory",
  };
}

function buildFaqReply(normalizedMessage, baseUrl) {
  const faq = matchKnowledgeEntries(normalizedMessage, FAQ_TOPICS)[0] || FAQ_TOPICS[0];
  return {
    answer: faq.content,
    actions: hydrateActions(faq.actions, baseUrl),
    matchedTopic: faq.id,
    mode: "deterministic",
  };
}

function analyzeMessage({ message, scope, state }) {
  const normalizedMessage = normalizeText(message);
  const matchedCourse = findBestCourseMatch(normalizedMessage, state);
  const profile = inferProfile(normalizedMessage, state, matchedCourse);

  const intents = {
    greeting: hasAnyKeyword(normalizedMessage, INTENT_KEYWORDS.greeting),
    reset: hasAnyKeyword(normalizedMessage, INTENT_KEYWORDS.reset),
    recommendation:
      hasAnyKeyword(normalizedMessage, INTENT_KEYWORDS.recommendation) ||
      Boolean(profile.currentScore || profile.targetScore || profile.levelHint),
    pricing: hasAnyKeyword(normalizedMessage, INTENT_KEYWORDS.pricing),
    schedule: hasAnyKeyword(normalizedMessage, INTENT_KEYWORDS.schedule),
    placement: hasAnyKeyword(normalizedMessage, INTENT_KEYWORDS.placement),
    registration: hasAnyKeyword(normalizedMessage, INTENT_KEYWORDS.registration),
    login: hasAnyKeyword(normalizedMessage, INTENT_KEYWORDS.login),
    social: hasAnyKeyword(normalizedMessage, INTENT_KEYWORDS.social),
    contact: hasAnyKeyword(normalizedMessage, INTENT_KEYWORDS.contact),
    classroom: scope === "student" && hasAnyKeyword(normalizedMessage, INTENT_KEYWORDS.classroom),
    submission: scope === "student" && hasAnyKeyword(normalizedMessage, INTENT_KEYWORDS.submission),
    practice: scope === "student" && hasAnyKeyword(normalizedMessage, INTENT_KEYWORDS.practice),
    dictation: scope === "student" && hasAnyKeyword(normalizedMessage, INTENT_KEYWORDS.dictation),
    profile: scope === "student" && hasAnyKeyword(normalizedMessage, INTENT_KEYWORDS.profile),
    feedback: scope === "student" && hasAnyKeyword(normalizedMessage, INTENT_KEYWORDS.feedback),
    payment: hasAnyKeyword(normalizedMessage, INTENT_KEYWORDS.payment),
    studyAdvice: hasAnyKeyword(normalizedMessage, INTENT_KEYWORDS.studyAdvice),
    generative: hasAnyKeyword(normalizedMessage, INTENT_KEYWORDS.generative),
  };

  if (matchedCourse && !intents.pricing && !intents.schedule && !intents.recommendation) {
    intents.recommendation = true;
  }

  return {
    scope,
    normalizedMessage,
    profile,
    matchedCourse,
    intents,
    faqMatches: matchKnowledgeEntries(normalizedMessage, FAQ_TOPICS),
    studyMatches: matchKnowledgeEntries(normalizedMessage, STUDY_GUIDES),
    studentMatches: scope === "student" ? matchKnowledgeEntries(normalizedMessage, STUDENT_FEATURES) : [],
  };
}

function resolveLocalReply({ analysis, baseUrl }) {
  const { normalizedMessage, profile, matchedCourse, intents, scope } = analysis;

  if (!normalizedMessage) return buildWelcomeReply(scope, baseUrl);
  if (intents.reset) return buildResetReply(scope, baseUrl);
  if (intents.greeting && normalizedMessage.split(" ").length <= 3) return buildWelcomeReply(scope, baseUrl);
  if (intents.registration || intents.login || intents.social) return buildAuthReply(normalizedMessage, baseUrl);
  if (scope === "student" && intents.submission) return buildStudentReply("submission", baseUrl);
  if (scope === "student" && intents.classroom) return buildStudentReply("classroom", baseUrl);
  if (scope === "student" && intents.practice) return buildStudentReply("practice", baseUrl);
  if (scope === "student" && intents.dictation) return buildStudentReply("dictation", baseUrl);
  if (scope === "student" && (intents.feedback || intents.profile)) return buildStudentReply(intents.feedback ? "feedback" : "profile", baseUrl);
  if (intents.contact) return buildContactReply(baseUrl);
  if (intents.payment) return buildPaymentReply(baseUrl);
  if (intents.placement) return buildPlacementReply(baseUrl);
  if (intents.schedule) return buildScheduleReply(profile, matchedCourse, baseUrl);
  if (intents.recommendation && (profile.currentScore || profile.targetScore || profile.levelHint || matchedCourse)) {
    if (matchedCourse && !profile.currentScore && !profile.targetScore && !profile.levelHint) {
      return buildCourseDetailReply(matchedCourse, baseUrl, findMatchingClasses(profile, matchedCourse));
    }
    return buildRecommendationReply(profile, normalizedMessage, baseUrl);
  }
  if (intents.pricing) return buildPricingReply(matchedCourse, baseUrl);
  if (intents.studyAdvice) return buildStudyGuideReply(normalizedMessage, baseUrl);
  if (analysis.faqMatches.length) return buildFaqReply(normalizedMessage, baseUrl);
  return buildKnowledgeFallback(scope, baseUrl);
}

function selectContextEntries(analysis) {
  const entries = [];
  const matchedCourse = analysis.matchedCourse;

  entries.push(`Trung tâm: ${CENTER_INFO.brandName}. Hotline: ${CENTER_INFO.hotline}. Email: ${CENTER_INFO.email}. Ưu đãi: ${CENTER_INFO.discountLabel}.`);

  if (matchedCourse) {
    entries.push(
      `Khóa được nhắc tới: ${matchedCourse.title}. Học phí ${matchedCourse.price}. Số buổi ${matchedCourse.sessions}. Tóm tắt: ${matchedCourse.summary}.`
    );
  }

  if (analysis.faqMatches[0]) {
    entries.push(`FAQ liên quan: ${analysis.faqMatches[0].content}`);
  }

  if (analysis.studyMatches[0]) {
    entries.push(`Hướng dẫn học liên quan: ${analysis.studyMatches[0].content}`);
  }

  if (analysis.scope === "student" && analysis.studentMatches[0]) {
    entries.push(`Tính năng học viên liên quan: ${analysis.studentMatches[0].content}`);
  }

  const classMatches = findMatchingClasses(analysis.profile, matchedCourse);
  if (classMatches.length) {
    entries.push(
      `Lịch phù hợp: ${classMatches
        .map((item) => `${item.code} | ${item.course} | ${item.time} | ${item.days} | khai giảng ${item.opening} | ${item.campus}`)
        .join(" || ")}`
    );
  }

  if (analysis.profile.currentScore || analysis.profile.targetScore || analysis.profile.schedulePreference) {
    entries.push(
      `Hồ sơ suy ra: điểm hiện tại ${analysis.profile.currentScore || "chưa rõ"}, mục tiêu ${analysis.profile.targetScore || "chưa rõ"}, khung giờ ${
        analysis.profile.schedulePreference || "chưa rõ"
      }, track ${analysis.profile.track || "toeic"}.`
    );
  }

  return entries.slice(0, 6);
}

function buildConversationTranscript(history = []) {
  return history
    .slice(-6)
    .map((item) => `${item.role === "assistant" ? "Assistant" : "User"}: ${item.text}`)
    .join("\n");
}

function isOpenAIConfigured() {
  return Boolean(process.env.OPENAI_API_KEY);
}

function extractOpenAIText(payload) {
  if (!payload || typeof payload !== "object") return "";
  if (typeof payload.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  const texts = [];
  for (const item of payload.output || []) {
    if (item.type === "message" && Array.isArray(item.content)) {
      for (const contentItem of item.content) {
        if (contentItem.type === "output_text" && contentItem.text) {
          texts.push(contentItem.text);
        }
      }
    }
  }

  return texts.join("\n").trim();
}

async function callOpenAI({ message, analysis, state }) {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = String(process.env.OPENAI_API_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, "");
  const model = process.env.OPENAI_CHATBOT_MODEL || "gpt-5.2-chat-latest";
  const maxOutputTokens = Number(process.env.OPENAI_CHATBOT_MAX_OUTPUT || 500);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  const instructions = [
    "Bạn là chatbot của Thầy Tài TOEIC trên website trung tâm tiếng Anh.",
    "Quy tắc:",
    "- Trả lời bằng tiếng Việt tự nhiên, gọn nhưng đủ ý.",
    "- Nếu câu hỏi liên quan đến khóa học, lịch khai giảng, tính năng website, đăng ký tài khoản hoặc luồng học viên, phải ưu tiên tuyệt đối dữ liệu nội bộ được cung cấp.",
    "- Không bịa lịch khai giảng, học phí, địa chỉ, hotline, tính năng hay route không có trong dữ liệu nội bộ.",
    "- Nếu dữ liệu nội bộ chưa đủ cho câu hỏi đặc thù về trung tâm, hãy nói rõ là chưa có dữ liệu chính xác và đề xuất liên hệ hotline hoặc form tư vấn.",
    "- Với câu hỏi học TOEIC, tiếng Anh hoặc câu hỏi mở, bạn có thể trả lời như một trợ lý học tập thông minh kiểu ChatGPT nhưng vẫn ưu tiên tính thực tế.",
    "- Không nhắc tới prompt, hệ thống hay chain of thought.",
  ].join("\n");

  const input = [
    "Ngữ cảnh nội bộ:",
    ...selectContextEntries(analysis).map((entry, index) => `${index + 1}. ${entry}`),
    "",
    "Hội thoại gần đây:",
    buildConversationTranscript(state.history) || "Chưa có.",
    "",
    "Câu hỏi mới:",
    message,
  ].join("\n");

  try {
    const response = await fetch(`${baseUrl}/responses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        instructions,
        input,
        max_output_tokens: maxOutputTokens,
      }),
      signal: controller.signal,
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const detail = payload?.error?.message || `OpenAI request failed with status ${response.status}`;
      throw new Error(detail);
    }

    return extractOpenAIText(payload);
  } finally {
    clearTimeout(timeout);
  }
}

function shouldUseOpenAI(analysis, localReply) {
  if (!isOpenAIConfigured()) return false;
  if (localReply.mode === "deterministic") return false;
  if (localReply.mode === "fallback") return true;
  if (analysis.intents.generative) return true;
  if (analysis.intents.studyAdvice && analysis.normalizedMessage.length > 35) return true;
  return false;
}

function finalizeReply(reply) {
  const actions = dedupeActions(reply.actions || []);
  return {
    answer: reply.answer,
    actions,
    suggestions: actionsToSuggestions(actions),
    matchedTopic: reply.matchedTopic || null,
    source: reply.source || "local",
  };
}

async function getChatbotReply({
  message,
  scope = "guest",
  baseUrl = "",
  currentPath = "",
  conversationState = {},
} = {}) {
  const state = createInitialState(conversationState);
  const resolvedScope = scope === "student" ? "student" : "guest";
  const analysis = analyzeMessage({
    message,
    scope: resolvedScope,
    state,
    currentPath,
  });

  let reply = resolveLocalReply({ analysis, baseUrl });

  if (shouldUseOpenAI(analysis, reply)) {
    try {
      const aiAnswer = await callOpenAI({ message, analysis, state });
      if (aiAnswer) {
        reply = {
          ...reply,
          answer: aiAnswer,
          source: "openai",
        };
      }
    } catch (error) {
      console.error("[chatbot] OpenAI fallback to local:", error.message);
      reply = {
        ...reply,
        source: "local-fallback",
      };
    }
  }

  const nextState = {
    history: addHistoryItem(addHistoryItem(state.history, "user", message), "assistant", reply.answer),
    profile: {
      ...state.profile,
      ...analysis.profile,
    },
    lastTopic: reply.matchedTopic || state.lastTopic || null,
  };

  return {
    ...finalizeReply(reply),
    nextState,
  };
}

module.exports = {
  getChatbotReply,
  normalizeText,
};
