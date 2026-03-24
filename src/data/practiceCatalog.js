const {
  PART_META,
  loadExamFromFiles
} = require('./toeicPlacementProvider');
const {
  getFullTestCards,
  loadManagedFullTest
} = require('./fullTestRegistry');

const PART_PRACTICE_META = Object.freeze({
  1: { durationMinutes: 4, totalQuestions: 6, maxScore: 30 },
  2: { durationMinutes: 12, totalQuestions: 25, maxScore: 125 },
  3: { durationMinutes: 18, totalQuestions: 39, maxScore: 195 },
  4: { durationMinutes: 15, totalQuestions: 30, maxScore: 150 },
  5: { durationMinutes: 14, totalQuestions: 30, maxScore: 150 },
  6: { durationMinutes: 12, totalQuestions: 16, maxScore: 80 },
  7: { durationMinutes: 36, totalQuestions: 54, maxScore: 270 }
});

const READING_META = Object.freeze({
  durationMinutes: 75,
  totalQuestions: 100,
  maxScore: 495,
  partsCount: 3,
  parts: [5, 6, 7]
});

const PART56_META = Object.freeze({
  durationMinutes: 25,
  totalQuestions: 46,
  maxScore: 230,
  parts: [5, 6]
});

const WORDFORM_META = Object.freeze({
  durationMinutes: 0,
  totalQuestions: 40,
  maxScore: 200,
  parts: [5],
  totalItems: 2
});

const READING_BANDS = Object.freeze([
  { key: 'all', label: 'Tất cả' },
  { key: '500-plus', label: '500 +' },
  { key: '650-plus', label: '650 +' },
  { key: '750-plus', label: '750 +' }
]);

const SOURCE_EXAM_CACHE = new Map();

function normalizeBaseUrl(baseUrl) {
  if (!baseUrl || baseUrl === '/') {
    return '';
  }

  return String(baseUrl).replace(/\/+$/, '');
}

function sanitizeLabel(value) {
  return String(value || '').trim();
}

function extractTestNumber(value) {
  const match = String(value || '').match(/test-(\d+)/i) || String(value || '').match(/test\s*(\d+)/i);
  return match ? Number(match[1]) : null;
}

function formatManagedTitle(card) {
  const year = sanitizeLabel(card.collectionKey);
  const testNumber = extractTestNumber(card.id) || extractTestNumber(card.title);

  if (year && testNumber) {
    return `Đề ${year} Test ${testNumber}`;
  }

  return sanitizeLabel(card.title).replace(/^Đề\s+ETS\s+/i, 'Đề ');
}

function sortSourceCards(cards = []) {
  return cards.slice().sort((left, right) => {
    const yearGap = Number(right.collectionKey || 0) - Number(left.collectionKey || 0);
    if (yearGap !== 0) {
      return yearGap;
    }

    return (extractTestNumber(right.id) || 0) - (extractTestNumber(left.id) || 0);
  });
}

function getAvailableSourceCards(baseUrl = '') {
  return sortSourceCards(
    getFullTestCards(baseUrl).filter((card) => Boolean(card.isAvailable))
  );
}

function resolveReadingBand(card) {
  const year = Number(card.collectionKey || 0);

  if (year >= 2024) {
    return { key: '750-plus', label: '750 +' };
  }

  if (year >= 2022) {
    return { key: '650-plus', label: '650 +' };
  }

  return { key: '500-plus', label: '500 +' };
}

function buildPartPracticeId(sourceId, partNumber) {
  return `${sourceId}__part__${partNumber}`;
}

function buildReadingPracticeId(sourceId) {
  return `${sourceId}__reading`;
}

function buildPart56PracticeId(sourceId) {
  return `${sourceId}__part56`;
}

function buildWordformPracticeId(index) {
  return `wordform-test-${String(index).padStart(3, '0')}`;
}

function parsePartPracticeId(practiceId) {
  const match = String(practiceId || '').match(/^(.*)__part__(\d+)$/);

  if (!match) {
    return null;
  }

  return {
    sourceId: match[1],
    partNumber: Number(match[2])
  };
}

function parseReadingPracticeId(practiceId) {
  const match = String(practiceId || '').match(/^(.*)__reading$/);

  if (!match) {
    return null;
  }

  return {
    sourceId: match[1]
  };
}

function parsePart56PracticeId(practiceId) {
  const match = String(practiceId || '').match(/^(.*)__part56$/);

  if (!match) {
    return null;
  }

  return {
    sourceId: match[1]
  };
}

function parseWordformPracticeId(practiceId) {
  const match = String(practiceId || '').match(/^wordform-test-(\d{3})$/i);

  if (!match) {
    return null;
  }

  return {
    index: Number(match[1])
  };
}

function getPartPracticeFilters() {
  return [
    { key: 'all', label: 'Tất cả' },
    ...Object.entries(PART_META).map(([partNumber]) => ({
      key: `part-${partNumber}`,
      label: `Part ${partNumber}`
    }))
  ];
}

function getYearFilters(cards = []) {
  const keys = Array.from(new Set(cards.map((card) => sanitizeLabel(card.collectionKey)).filter(Boolean)));

  return [
    { key: 'all', label: 'Tất cả' },
    ...keys.map((key) => ({
      key,
      label: `Đề ${key}`
    }))
  ];
}

function buildPartPracticeCard(card, partNumber, baseUrl = '') {
  const practiceMeta = PART_PRACTICE_META[partNumber] || {};
  const partMeta = PART_META[partNumber] || PART_META[7];
  const safeBaseUrl = normalizeBaseUrl(baseUrl);
  const sourceLabel = formatManagedTitle(card);
  const practiceId = buildPartPracticeId(card.id, partNumber);

  return {
    id: practiceId,
    sourceId: card.id,
    title: `${sourceLabel} Part ${partNumber}`,
    summary: partMeta.instructions,
    ribbon: 'Free',
    badge: `Part ${partNumber}`,
    levelBadge: card.collectionLabel || '',
    durationMinutes: practiceMeta.durationMinutes || 0,
    totalQuestions: practiceMeta.totalQuestions || 0,
    maxScore: practiceMeta.maxScore || 0,
    partsCount: 1,
    primaryKey: `part-${partNumber}`,
    secondaryKey: sanitizeLabel(card.collectionKey) || 'other',
    searchText: `${sourceLabel} part ${partNumber} ${partMeta.title} ${card.collectionLabel || ''}`.toLowerCase(),
    actionHref: `${safeBaseUrl}/student/practice/parts/${encodeURIComponent(practiceId)}`,
    actionLabel: 'Làm bài',
    metaItems: [
      `Thời gian: ${practiceMeta.durationMinutes || 0} phút`,
      `Câu hỏi: ${practiceMeta.totalQuestions || 0} câu`,
      'Phần thi: 1 phần',
      `Điểm tối đa: ${practiceMeta.maxScore || 0} điểm`
    ]
  };
}

function buildReadingPracticeCard(card, baseUrl = '') {
  const safeBaseUrl = normalizeBaseUrl(baseUrl);
  const sourceLabel = formatManagedTitle(card);
  const band = resolveReadingBand(card);
  const practiceId = buildReadingPracticeId(card.id);

  return {
    id: practiceId,
    sourceId: card.id,
    title: `${sourceLabel} Reading`,
    summary: 'Ôn trọn bộ Part 5, 6, 7 với nhịp làm bài như một phiên Reading hoàn chỉnh.',
    ribbon: 'Free',
    badge: band.label,
    levelBadge: sanitizeLabel(card.collectionLabel) || '',
    durationMinutes: READING_META.durationMinutes,
    totalQuestions: READING_META.totalQuestions,
    maxScore: READING_META.maxScore,
    partsCount: READING_META.partsCount,
    primaryKey: band.key,
    secondaryKey: 'reading',
    searchText: `${sourceLabel} reading ${band.label} ${card.collectionLabel || ''}`.toLowerCase(),
    actionHref: `${safeBaseUrl}/student/practice/reading/${encodeURIComponent(practiceId)}`,
    actionLabel: 'Làm bài',
    metaItems: [
      `Thời gian: ${READING_META.durationMinutes} phút`,
      `Câu hỏi: ${READING_META.totalQuestions} câu`,
      `Phần thi: ${READING_META.partsCount} phần`,
      `Điểm tối đa: ${READING_META.maxScore} điểm`
    ]
  };
}

function buildPart56PracticeCard(card, index, baseUrl = '', pathPrefix = '/goc-hoc-tap/part-5-6') {
  const safeBaseUrl = normalizeBaseUrl(baseUrl);
  const sourceLabel = formatManagedTitle(card);
  const practiceId = buildPart56PracticeId(card.id);
  const serialLabel = String(index + 1).padStart(3, '0');

  return {
    id: practiceId,
    sourceId: card.id,
    serialLabel,
    title: `BÀI TẬP TOEIC ONLINE ${serialLabel}`,
    subtitle: sourceLabel,
    description: 'Bài test kiểm tra ôn tập phần Part 5 – Part 6.',
    description: 'BÃ i test kiá»ƒm tra Ã´n táº­p pháº§n Part 5 â€“ Part 6.',
    durationMinutes: PART56_META.durationMinutes,
    totalQuestions: PART56_META.totalQuestions,
    maxScore: PART56_META.maxScore,
    href: `${safeBaseUrl}${pathPrefix}/${encodeURIComponent(practiceId)}`
  };
}

function getPublicSequenceSourceCards(baseUrl = '') {
  return getAvailableSourceCards(baseUrl)
    .slice()
    .sort((left, right) => {
      const yearGap = Number(right.collectionKey || 0) - Number(left.collectionKey || 0);
      if (yearGap !== 0) {
        return yearGap;
      }

      return (extractTestNumber(left.id) || 0) - (extractTestNumber(right.id) || 0);
    });
}

function getWordformPracticeBlueprints(baseUrl = '', options = {}) {
  const safeBaseUrl = normalizeBaseUrl(baseUrl);
  const pathPrefix = options.pathPrefix || '/goc-hoc-tap/wordform';
  const totalItems = Number(options.totalItems || WORDFORM_META.totalItems || 2);
  const totalQuestions = Number(options.totalQuestions || WORDFORM_META.totalQuestions || 40);
  const questionPool = [];

  getPublicSequenceSourceCards(baseUrl).forEach((card) => {
    const sourceExam = getSourceExam(card.id);
    const sourceLabel = formatManagedTitle(card);
    const partFiveQuestions = (Array.isArray(sourceExam.flatQuestions) ? sourceExam.flatQuestions : [])
      .filter((question) => Number(question.partNumber) === 5)
      .map((question) => ({
        sourceId: card.id,
        sourceLabel,
        question: cloneQuestion(question)
      }));

    questionPool.push(...partFiveQuestions);
  });

  const requiredQuestions = totalItems * totalQuestions;
  if (questionPool.length < requiredQuestions) {
    throw new Error(`Wordform practice requires ${requiredQuestions} part 5 questions but only found ${questionPool.length}.`);
  }

  return Array.from({ length: totalItems }, (_, index) => {
    const serialLabel = String(index + 1).padStart(3, '0');
    const startIndex = index * totalQuestions;
    const entries = questionPool.slice(startIndex, startIndex + totalQuestions);
    const sourceLabels = Array.from(new Set(entries.map((entry) => entry.sourceLabel)));
    const practiceId = buildWordformPracticeId(index + 1);

    return {
      id: practiceId,
      serialLabel,
      title: `Wordform Test ${serialLabel}`,
      subtitle: sourceLabels.join(' + '),
      description: 'Bài thi gồm 40 câu hỏi, kèm đáp án và giải thích bằng Video. Chúc bạn học tốt ^^',
      href: `${safeBaseUrl}${pathPrefix}/${encodeURIComponent(practiceId)}`,
      entries
    };
  });
}

function getPartPracticeCatalog(baseUrl = '') {
  const sourceCards = getAvailableSourceCards(baseUrl);
  const cards = sourceCards.flatMap((card) =>
    Object.keys(PART_META).map((partNumber) => buildPartPracticeCard(card, Number(partNumber), baseUrl))
  );

  return {
    pageKey: 'parts',
    title: 'Luyện tập theo Part',
    eyebrow: 'Student Practice',
    heroTitle: 'Chọn Part bạn muốn ôn luyện',
    heroDescription: 'Tách trực tiếp từ kho full test hiện có để học viên tập trung đúng phần đang yếu và vào làm bài ngay trong tài khoản.',
    primaryFilters: getPartPracticeFilters(),
    secondaryFilters: getYearFilters(sourceCards),
    searchPlaceholder: 'Nhập tên đề hoặc part muốn tìm...',
    cards,
    totalCards: cards.length
  };
}

function getReadingPracticeCatalog(baseUrl = '') {
  const sourceCards = getAvailableSourceCards(baseUrl);
  const cards = sourceCards.map((card) => buildReadingPracticeCard(card, baseUrl));

  return {
    pageKey: 'reading',
    title: 'Luyện tập Reading',
    eyebrow: 'Reading Focus',
    heroTitle: 'Luyện tập Full Test Reading theo band điểm',
    heroDescription: 'Mỗi đề reading lấy từ bộ full test đang có trong hệ thống, gom sẵn Part 5, 6, 7 để học viên luyện sâu đúng nhịp 75 phút.',
    primaryFilters: READING_BANDS,
    secondaryFilters: [],
    searchPlaceholder: 'Nhập tên đề reading muốn tìm...',
    cards,
    totalCards: cards.length
  };
}

function getPart56PracticeCatalog(baseUrl = '', options = {}) {
  const safeBaseUrl = normalizeBaseUrl(baseUrl);
  const limit = Number(options.limit || 12);
  const pathPrefix = options.pathPrefix || '/goc-hoc-tap/part-5-6';
  const heroImage = options.heroImage || 'https://i.postimg.cc/zBCnk3Nt/giangthuy.png';
  const sourceCards = getPublicSequenceSourceCards(baseUrl)
    .slice(0, limit);
  const items = sourceCards.map((card, index) => buildPart56PracticeCard(card, index, safeBaseUrl, pathPrefix));

  return {
    pageKey: 'part56',
    title: 'Bài Tập TOEIC Part 5-6',
    heroTitle: 'Bài Tập TOEIC Part 5-6',
    heroQuote: 'Practice makes perfect',
    heroImage,
    pathPrefix,
    items,
    totalItems: items.length
  };
}

function getWordformPracticeCatalog(baseUrl = '', options = {}) {
  const pathPrefix = options.pathPrefix || '/goc-hoc-tap/wordform';
  const items = getWordformPracticeBlueprints(baseUrl, {
    pathPrefix,
    totalItems: options.totalItems || WORDFORM_META.totalItems,
    totalQuestions: options.totalQuestions || WORDFORM_META.totalQuestions
  }).map((item) => ({
    id: item.id,
    serialLabel: item.serialLabel,
    title: item.title,
    subtitle: '',
    description: item.description,
    href: item.href
  }));

  return {
    pageKey: 'wordform',
    title: 'Wordform Test',
    heroTitle: 'Wordform Test',
    heroQuote: '',
    heroImage: '',
    heroSpacerHeight: 180,
    pathPrefix,
    items,
    totalItems: items.length,
    showStats: false,
    showSource: false,
    showBrandBar: false,
    showTimer: false,
    showRepeatTitle: false
  };
}

function getSourceExam(sourceId) {
  if (!sourceId) {
    throw new Error('Missing source exam id');
  }

  if (!SOURCE_EXAM_CACHE.has(sourceId)) {
    const loaded = loadManagedFullTest(sourceId);
    if (!loaded) {
      throw new Error(`Cannot find managed full test: ${sourceId}`);
    }
    SOURCE_EXAM_CACHE.set(sourceId, loaded);
  }

  return SOURCE_EXAM_CACHE.get(sourceId);
}

function cloneQuestion(question) {
  return {
    ...question,
    options: Array.isArray(question.options)
      ? question.options.map((option) => ({ ...option }))
      : []
  };
}

function filterExamByParts(sourceExam, partNumbers, practiceConfig) {
  const allowedParts = new Set(partNumbers.map(Number));
  const groups = (Array.isArray(sourceExam.groups) ? sourceExam.groups : [])
    .map((group) => ({
      ...group,
      questions: (Array.isArray(group.questions) ? group.questions : [])
        .filter((question) => allowedParts.has(Number(question.partNumber)))
        .map(cloneQuestion)
    }))
    .filter((group) => group.questions.length > 0);

  const flatQuestions = (Array.isArray(sourceExam.flatQuestions) ? sourceExam.flatQuestions : [])
    .filter((question) => allowedParts.has(Number(question.partNumber)))
    .map(cloneQuestion);

  const partSummary = (Array.isArray(sourceExam.partSummary) ? sourceExam.partSummary : [])
    .filter((part) => allowedParts.has(Number(part.partNumber)))
    .map((part) => ({
      ...part,
      totalQuestions: flatQuestions.filter((question) => question.partNumber === Number(part.partNumber)).length
    }));

  const listeningCount = flatQuestions.filter((question) => question.skill === 'listening').length;
  const readingCount = flatQuestions.filter((question) => question.skill === 'reading').length;

  return {
    id: practiceConfig.id,
    sourceId: sourceExam.id,
    title: practiceConfig.title,
    subtitle: practiceConfig.subtitle,
    description: practiceConfig.description || '',
    bookName: sourceExam.bookName,
    collectionKey: sourceExam.collectionKey || '',
    collectionLabel: sourceExam.collectionLabel || '',
    durationMinutes: practiceConfig.durationMinutes,
    totalQuestions: flatQuestions.length,
    listeningCount,
    readingCount,
    partsCount: partSummary.length,
    groups,
    flatQuestions,
    partSummary,
    mode: practiceConfig.mode,
    modeLabel: practiceConfig.modeLabel,
    libraryHref: practiceConfig.libraryHref,
    libraryLabel: practiceConfig.libraryLabel,
    previewHref: practiceConfig.previewHref,
    takeHref: practiceConfig.takeHref,
    submitHref: practiceConfig.submitHref,
    retryHref: practiceConfig.retryHref,
    maxScore: practiceConfig.maxScore,
    sourceLabel: practiceConfig.sourceLabel,
    badgeLabel: practiceConfig.badgeLabel,
    accessLabel: practiceConfig.accessLabel,
    ctaLabel: practiceConfig.ctaLabel
  };
}

function buildPartPracticeExam(practiceId, baseUrl = '') {
  const parsed = parsePartPracticeId(practiceId);
  if (!parsed) {
    throw new Error(`Invalid part practice id: ${practiceId}`);
  }

  const sourceExam = getSourceExam(parsed.sourceId);
  const safeBaseUrl = normalizeBaseUrl(baseUrl);
  const sourceLabel = formatManagedTitle({
    id: parsed.sourceId,
    title: sourceExam.title,
    collectionKey: sourceExam.collectionKey
  });
  const partMeta = PART_META[parsed.partNumber] || PART_META[7];
  const practiceMeta = PART_PRACTICE_META[parsed.partNumber] || {};

  return filterExamByParts(sourceExam, [parsed.partNumber], {
    id: practiceId,
    mode: 'part',
    modeLabel: 'Luyện tập theo Part',
    title: `${sourceLabel} Part ${parsed.partNumber}`,
    subtitle: partMeta.title,
    durationMinutes: practiceMeta.durationMinutes || 0,
    maxScore: practiceMeta.maxScore || 0,
    sourceLabel,
    badgeLabel: sourceExam.collectionLabel || sourceExam.bookName || '',
    accessLabel: 'Free',
    ctaLabel: `Luy\u1ec7n t\u1eadp Part ${parsed.partNumber}`,
    libraryHref: `${safeBaseUrl}/student/practice/parts`,
    libraryLabel: 'V\u1ec1 th\u01b0 vi\u1ec7n Part',
    previewHref: `${safeBaseUrl}/student/practice/parts/${encodeURIComponent(practiceId)}`,
    takeHref: `${safeBaseUrl}/student/practice/parts/${encodeURIComponent(practiceId)}/take`,
    submitHref: `${safeBaseUrl}/student/practice/parts/${encodeURIComponent(practiceId)}/submit`,
    retryHref: `${safeBaseUrl}/student/practice/parts/${encodeURIComponent(practiceId)}`
  });
}

function buildReadingPracticeExam(practiceId, baseUrl = '') {
  const parsed = parseReadingPracticeId(practiceId);
  if (!parsed) {
    throw new Error(`Invalid reading practice id: ${practiceId}`);
  }

  const sourceExam = getSourceExam(parsed.sourceId);
  const safeBaseUrl = normalizeBaseUrl(baseUrl);
  const sourceLabel = formatManagedTitle({
    id: parsed.sourceId,
    title: sourceExam.title,
    collectionKey: sourceExam.collectionKey
  });

  return filterExamByParts(sourceExam, READING_META.parts, {
    id: practiceId,
    mode: 'reading',
    modeLabel: 'Luyện tập Reading',
    title: `${sourceLabel} Reading`,
    subtitle: 'Full Reading Practice',
    durationMinutes: READING_META.durationMinutes,
    maxScore: READING_META.maxScore,
    sourceLabel,
    badgeLabel: resolveReadingBand({ collectionKey: sourceExam.collectionKey }).label,
    accessLabel: 'Free',
    ctaLabel: 'Luy\u1ec7n t\u1eadp Reading',
    libraryHref: `${safeBaseUrl}/student/practice/reading`,
    libraryLabel: 'V\u1ec1 th\u01b0 vi\u1ec7n Reading',
    previewHref: `${safeBaseUrl}/student/practice/reading/${encodeURIComponent(practiceId)}`,
    takeHref: `${safeBaseUrl}/student/practice/reading/${encodeURIComponent(practiceId)}/take`,
    submitHref: `${safeBaseUrl}/student/practice/reading/${encodeURIComponent(practiceId)}/submit`,
    retryHref: `${safeBaseUrl}/student/practice/reading/${encodeURIComponent(practiceId)}`
  });
}

function buildPart56PracticeExam(practiceId, baseUrl = '', options = {}) {
  const parsed = parsePart56PracticeId(practiceId);
  if (!parsed) {
    throw new Error(`Invalid part 5-6 practice id: ${practiceId}`);
  }

  const sourceExam = getSourceExam(parsed.sourceId);
  const safeBaseUrl = normalizeBaseUrl(baseUrl);
  const pathPrefix = options.pathPrefix || '/goc-hoc-tap/part-5-6';
  const libraryLabel = options.libraryLabel || 'Bài Tập TOEIC Part 5-6';
  const sourceLabel = formatManagedTitle({
    id: parsed.sourceId,
    title: sourceExam.title,
    collectionKey: sourceExam.collectionKey
  });

  return filterExamByParts(sourceExam, PART56_META.parts, {
    id: practiceId,
    mode: 'part56',
    modeLabel: 'Bài Tập TOEIC Part 5-6',
    title: options.itemTitle || `${sourceLabel} Part 5-6`,
    subtitle: 'Bài test kiểm tra ôn tập phần Part 5 – Part 6.',
    durationMinutes: PART56_META.durationMinutes,
    maxScore: PART56_META.maxScore,
    sourceLabel,
    badgeLabel: sourceExam.collectionLabel || sourceExam.bookName || '',
    accessLabel: 'Free',
    ctaLabel: 'Start Quiz',
    libraryHref: `${safeBaseUrl}${pathPrefix}`,
    libraryLabel,
    previewHref: `${safeBaseUrl}${pathPrefix}/${encodeURIComponent(practiceId)}`,
    takeHref: `${safeBaseUrl}${pathPrefix}/${encodeURIComponent(practiceId)}/take`,
    submitHref: `${safeBaseUrl}${pathPrefix}/${encodeURIComponent(practiceId)}/submit`,
    retryHref: `${safeBaseUrl}${pathPrefix}/${encodeURIComponent(practiceId)}`
  });
}

function buildWordformPracticeExam(practiceId, baseUrl = '', options = {}) {
  const parsed = parseWordformPracticeId(practiceId);
  if (!parsed) {
    throw new Error(`Invalid wordform practice id: ${practiceId}`);
  }

  const safeBaseUrl = normalizeBaseUrl(baseUrl);
  const pathPrefix = options.pathPrefix || '/goc-hoc-tap/wordform';
  const libraryLabel = options.libraryLabel || 'Wordform Test';
  const blueprint = getWordformPracticeBlueprints(baseUrl, {
    pathPrefix,
    totalItems: options.totalItems || WORDFORM_META.totalItems,
    totalQuestions: options.totalQuestions || WORDFORM_META.totalQuestions
  }).find((item) => item.id === practiceId);

  if (!blueprint) {
    throw new Error(`Cannot find wordform practice: ${practiceId}`);
  }

  const flatQuestions = blueprint.entries.map((entry, index) => {
    const nextQuestion = cloneQuestion(entry.question);
    const displayNumber = 101 + index;

    return {
      ...nextQuestion,
      number: displayNumber,
      displayOrder: displayNumber,
      inputName: `question_${displayNumber}`
    };
  });

  const groups = [
    {
      id: `${practiceId}__group`,
      partNumber: 5,
      title: 'Wordform',
      instructions: '',
      questions: flatQuestions.map(cloneQuestion)
    }
  ];

  return {
    id: practiceId,
    sourceId: blueprint.entries.map((entry) => entry.sourceId).join('+'),
    title: options.itemTitle || blueprint.title,
    subtitle: 'Wordform Test',
    description: blueprint.description,
    bookName: 'Wordform',
    collectionKey: '',
    collectionLabel: '',
    durationMinutes: WORDFORM_META.durationMinutes,
    totalQuestions: flatQuestions.length,
    listeningCount: 0,
    readingCount: flatQuestions.length,
    partsCount: 1,
    groups,
    flatQuestions,
    partSummary: [
      {
        partNumber: 5,
        title: 'Wordform',
        totalQuestions: flatQuestions.length
      }
    ],
    mode: 'wordform',
    modeLabel: 'Wordform Test',
    libraryHref: `${safeBaseUrl}${pathPrefix}`,
    libraryLabel,
    previewHref: `${safeBaseUrl}${pathPrefix}/${encodeURIComponent(practiceId)}`,
    takeHref: `${safeBaseUrl}${pathPrefix}/${encodeURIComponent(practiceId)}/take`,
    submitHref: `${safeBaseUrl}${pathPrefix}/${encodeURIComponent(practiceId)}/submit`,
    retryHref: `${safeBaseUrl}${pathPrefix}/${encodeURIComponent(practiceId)}`,
    maxScore: WORDFORM_META.maxScore,
    sourceLabel: blueprint.subtitle,
    badgeLabel: 'Wordform',
    accessLabel: 'Free',
    ctaLabel: 'Start Quiz'
  };
}

function serializeExamQuestions(exam) {
  const sanitizeQuestion = (question) => {
    const nextQuestion = cloneQuestion(question);
    delete nextQuestion.correctAnswer;
    return nextQuestion;
  };

  return {
    id: exam.id,
    sourceId: exam.sourceId,
    title: exam.title,
    subtitle: exam.subtitle,
    description: exam.description || '',
    durationMinutes: exam.durationMinutes,
    totalQuestions: exam.totalQuestions,
    bookName: exam.bookName,
    mode: exam.mode,
    modeLabel: exam.modeLabel,
    partSummary: Array.isArray(exam.partSummary) ? exam.partSummary.map((part) => ({ ...part })) : [],
    groups: Array.isArray(exam.groups)
      ? exam.groups.map((group) => ({
          ...group,
          questions: (Array.isArray(group.questions) ? group.questions : []).map(sanitizeQuestion)
        }))
      : [],
    flatQuestions: Array.isArray(exam.flatQuestions)
      ? exam.flatQuestions.map(sanitizeQuestion)
      : []
  };
}

function getAnswerPayload(exam) {
  return {
    id: exam.id,
    sourceId: exam.sourceId,
    totalQuestions: exam.totalQuestions,
    answers: (Array.isArray(exam.flatQuestions) ? exam.flatQuestions : []).reduce((result, question) => {
      result[question.number] = question.correctAnswer || null;
      return result;
    }, {})
  };
}

function buildFocusMessage(accuracy, exam) {
  const skillLabel = exam.mode === 'reading' ? 'Reading' : exam.subtitle || 'phần luyện tập';

  if (accuracy >= 85) {
    return `Bạn đang rất chắc ${skillLabel}. Giữ nhịp làm bài này và tăng thêm độ ổn định ở các đề mới hơn.`;
  }

  if (accuracy >= 70) {
    return `Nền tảng ${skillLabel} đang ổn. Hãy làm lại các câu sai để khóa chiến lược và tăng độ chính xác.`;
  }

  if (accuracy >= 50) {
    return `Bạn đã có điểm tựa ban đầu ở ${skillLabel}, nhưng vẫn nên ôn lại nhóm câu sai và làm thêm 1-2 đề cùng dạng.`;
  }

  return `Phần ${skillLabel} vẫn còn khá hở. Nên học lại mẹo nhận diện dạng bài và luyện thêm từng cụm nhỏ trước khi làm lại toàn bộ.`;
}

function gradePracticeExam(exam, body = {}) {
  const questionResults = (Array.isArray(exam.flatQuestions) ? exam.flatQuestions : []).map((question) => {
    const selectedAnswer = body[question.inputName] || null;
    const correctAnswer = question.correctAnswer || null;
    const isCorrect = Boolean(selectedAnswer && correctAnswer && selectedAnswer === correctAnswer);

    return {
      number: question.number,
      partNumber: question.partNumber,
      skill: question.skill,
      selectedAnswer,
      correctAnswer,
      isCorrect
    };
  });

  const correctCount = questionResults.filter((item) => item.isCorrect).length;
  const unansweredCount = questionResults.filter((item) => !item.selectedAnswer).length;
  const incorrectCount = Math.max(questionResults.length - correctCount - unansweredCount, 0);
  const rawMax = Number(exam.maxScore || 0) || (exam.mode === 'reading'
    ? READING_META.maxScore
    : ((PART_PRACTICE_META[questionResults[0] && questionResults[0].partNumber] || {}).maxScore || questionResults.length * 5));
  const rawScore = exam.mode === 'reading'
    ? Math.round((correctCount / Math.max(questionResults.length, 1)) * READING_META.maxScore)
    : correctCount * 5;
  const accuracy = questionResults.length
    ? Math.round((correctCount / questionResults.length) * 100)
    : 0;

  const partBreakdown = (Array.isArray(exam.partSummary) ? exam.partSummary : []).map((part) => {
    const partQuestions = questionResults.filter((item) => item.partNumber === part.partNumber);
    const partCorrect = partQuestions.filter((item) => item.isCorrect).length;
    const partAccuracy = partQuestions.length ? Math.round((partCorrect / partQuestions.length) * 100) : 0;

    return {
      partNumber: part.partNumber,
      title: part.title,
      totalQuestions: partQuestions.length,
      correctCount: partCorrect,
      accuracy: partAccuracy
    };
  });

  return {
    id: exam.id,
    sourceId: exam.sourceId,
    title: exam.title,
    subtitle: exam.subtitle,
    mode: exam.mode,
    modeLabel: exam.modeLabel,
    sourceLabel: exam.sourceLabel,
    totalQuestions: questionResults.length,
    correctCount,
    incorrectCount,
    unansweredCount,
    accuracy,
    rawScore,
    rawMax,
    partBreakdown,
    focusMessage: buildFocusMessage(accuracy, exam),
    libraryHref: exam.libraryHref,
    libraryLabel: exam.libraryLabel,
    retryHref: exam.retryHref,
    submittedAt: new Date().toISOString()
  };
}

function loadDemoPracticeExam() {
  const safeExam = loadExamFromFiles();
  return filterExamByParts(safeExam, [1], {
    id: 'demo__part__1',
    mode: 'part',
    modeLabel: 'Luyện tập theo Part',
    title: 'Demo Practice Part 1',
    subtitle: PART_META[1].title,
    durationMinutes: PART_PRACTICE_META[1].durationMinutes,
    maxScore: PART_PRACTICE_META[1].maxScore,
    sourceLabel: 'Demo',
    libraryHref: '/student/practice/parts',
    libraryLabel: 'Về thư viện Part',
    submitHref: '/student/practice/parts/demo__part__1/submit',
    retryHref: '/student/practice/parts/demo__part__1/take'
  });
}

module.exports = {
  PART_PRACTICE_META,
  PART56_META,
  WORDFORM_META,
  READING_META,
  getPartPracticeCatalog,
  getReadingPracticeCatalog,
  getPart56PracticeCatalog,
  getWordformPracticeCatalog,
  buildPartPracticeExam,
  buildReadingPracticeExam,
  buildPart56PracticeExam,
  buildWordformPracticeExam,
  serializeExamQuestions,
  getAnswerPayload,
  gradePracticeExam,
  loadDemoPracticeExam
};
