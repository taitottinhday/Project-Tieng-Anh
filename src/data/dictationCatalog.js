const rawCatalog = require("./dictationCatalog.json");

function normalizeBaseUrl(baseUrl) {
  if (!baseUrl || baseUrl === "/") {
    return "";
  }

  return String(baseUrl).replace(/\/+$/, "");
}

function cloneEntry(entry = {}) {
  return { ...entry };
}

function cloneLesson(lesson = {}) {
  return {
    ...lesson,
    entries: Array.isArray(lesson.entries) ? lesson.entries.map(cloneEntry) : []
  };
}

function cloneTopic(topic = {}) {
  return {
    ...topic,
    lessons: Array.isArray(topic.lessons) ? topic.lessons.map(cloneLesson) : []
  };
}

function getCatalog() {
  return Array.isArray(rawCatalog.topics) ? rawCatalog.topics.map(cloneTopic) : [];
}

function getCategories() {
  const topics = getCatalog();
  const categoryMap = new Map();

  topics.forEach((topic) => {
    if (!topic.categoryKey || categoryMap.has(topic.categoryKey)) {
      return;
    }

    categoryMap.set(topic.categoryKey, {
      key: topic.categoryKey,
      label: topic.categoryLabel
    });
  });

  return [
    { key: "all", label: "Tất cả" },
    ...Array.from(categoryMap.values())
  ];
}

function getTopicCards(baseUrl = "") {
  const safeBaseUrl = normalizeBaseUrl(baseUrl);

  return getCatalog().map((topic) => {
    const lessons = Array.isArray(topic.lessons) ? topic.lessons : [];
    const totalEntries = lessons.reduce((sum, lesson) => sum + (Array.isArray(lesson.entries) ? lesson.entries.length : 0), 0);

    return {
      id: topic.id,
      title: topic.title,
      categoryKey: topic.categoryKey,
      categoryLabel: topic.categoryLabel,
      searchText: `${topic.title} ${topic.categoryLabel} ${(topic.description || "")}`.toLowerCase(),
      description: topic.description || "Nghe & chép chính tả",
      lessonCount: lessons.length,
      totalEntries,
      href: `${safeBaseUrl}/student/dictation/${encodeURIComponent(topic.id)}`
    };
  });
}

function getTopicListPage(baseUrl = "") {
  const cards = getTopicCards(baseUrl);

  return {
    title: "Nghe - Chép chính tả",
    heroTitle: "Nghe - Chép chính tả theo topic",
    heroDescription: "Luyện nghe, gõ lại câu vừa nghe và tăng độ chính xác với thư viện topic được chia theo từng nhóm học viên.",
    categories: getCategories(),
    cards
  };
}

function getTopicById(topicId) {
  return getCatalog().find((topic) => topic.id === topicId) || null;
}

function getTopicDetail(topicId, baseUrl = "") {
  const safeBaseUrl = normalizeBaseUrl(baseUrl);
  const topic = getTopicById(topicId);

  if (!topic) {
    return null;
  }

  const lessons = topic.lessons.map((lesson) => ({
    id: lesson.id,
    title: lesson.title,
    description: lesson.description,
    totalEntries: lesson.entries.length,
    preview: lesson.entries[0] ? lesson.entries[0].transcript : "",
    href: `${safeBaseUrl}/student/dictation/${encodeURIComponent(topic.id)}/${encodeURIComponent(lesson.id)}`
  }));

  return {
    ...topic,
    breadcrumbs: [
      { label: "All topics", href: `${safeBaseUrl}/student/dictation` },
      { label: topic.title, href: `${safeBaseUrl}/student/dictation/${encodeURIComponent(topic.id)}` }
    ],
    lessons
  };
}

function getLessonDetail(topicId, lessonId, baseUrl = "") {
  const safeBaseUrl = normalizeBaseUrl(baseUrl);
  const topic = getTopicById(topicId);

  if (!topic) {
    return null;
  }

  const lesson = topic.lessons.find((item) => item.id === lessonId) || null;
  if (!lesson) {
    return null;
  }

  return {
    topic: {
      id: topic.id,
      title: topic.title,
      categoryKey: topic.categoryKey,
      categoryLabel: topic.categoryLabel
    },
    lesson: {
      ...lesson,
      entries: lesson.entries.map((entry, index) => ({
        ...entry,
        order: index + 1,
        audioUrl: `${safeBaseUrl}/uploads/dictation/${entry.audioFile}`
      }))
    },
    breadcrumbs: [
      { label: "All topics", href: `${safeBaseUrl}/student/dictation` },
      { label: topic.title, href: `${safeBaseUrl}/student/dictation/${encodeURIComponent(topic.id)}` },
      { label: lesson.title, href: `${safeBaseUrl}/student/dictation/${encodeURIComponent(topic.id)}/${encodeURIComponent(lesson.id)}` }
    ],
    backHref: `${safeBaseUrl}/student/dictation/${encodeURIComponent(topic.id)}`
  };
}

module.exports = {
  getCategories,
  getTopicCards,
  getTopicListPage,
  getTopicDetail,
  getLessonDetail
};
