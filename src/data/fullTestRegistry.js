const fs = require('fs');
const path = require('path');
const {
  getExamCard,
  loadPlacementExam,
  loadExamFromFiles
} = require('./toeicPlacementProvider');

const ETS_YEARS = Object.freeze(['2024', '2023', '2022', '2021', '2020']);
const YEAR_TEST_NUMBERS = Object.freeze({
  2024: Object.freeze(Array.from({ length: 10 }, (_, index) => index + 1)),
  2023: Object.freeze(Array.from({ length: 10 }, (_, index) => index + 1)),
  2022: Object.freeze(Array.from({ length: 10 }, (_, index) => index + 1)),
  2021: Object.freeze(Array.from({ length: 5 }, (_, index) => index + 1)),
  2020: Object.freeze(Array.from({ length: 10 }, (_, index) => index + 1))
});

const DEFAULT_TEST_META = Object.freeze({
  durationMinutes: 120,
  totalQuestions: 200,
  partsCount: 7,
  maxScore: 990,
  accessLabel: 'Free'
});

const FULL_TEST_COLLECTIONS = Object.freeze([
  { key: 'all', label: 'Tất cả' },
  ...ETS_YEARS.map((year) => ({
    key: year,
    label: `Đề ${year}`
  }))
]);

const SPECIAL_SLOT_CONFIGS = Object.freeze({
  '2024-1': {
    type: 'default',
    sourceLabel: 'bộ dữ liệu mặc định của project'
  },
  '2024-2': {
    type: 'file',
    dataFileName: '2026-test1.js',
    answerKeyFileName: 'ets2024Test2AnswerKey.js',
    sourceLabel: 'src/data/2026-test1.js'
  }
});

function extractTestLabel(rawTitle) {
  const match = String(rawTitle || '').match(/test\s*(\d+)/i);
  return match ? `Test ${match[1]}` : '';
}

function buildProviderDisplayTitle(card) {
  const bookLabel = card.bookName || 'ETS 2024';
  const testLabel = extractTestLabel(card.title);
  return testLabel ? `Đề ${bookLabel} ${testLabel}` : `Đề ${bookLabel}`;
}

function buildManagedExamDefinition(config) {
  const exam = config.loadExam();
  const card = getExamCard(exam);

  return {
    ...DEFAULT_TEST_META,
    id: config.id || exam.id,
    kind: 'provider',
    collectionKey: config.collectionKey,
    collectionLabel: config.collectionLabel,
    badgeLabel: config.badgeLabel || exam.bookName || 'ETS 2024',
    title: config.title || buildProviderDisplayTitle(card),
    description: config.description,
    isAvailable: true,
    isDemo: Boolean(exam.isDemo),
    actionLabel: 'Làm bài',
    statusTone: exam.isDemo ? 'demo' : 'ready',
    statusText: exam.isDemo
      ? 'Đề thi đã sẵn sàng để trải nghiệm giao diện và cấu trúc bài làm.'
      : 'Đề đã sẵn sàng để làm bài ngay.',
    durationMinutes: card.durationMinutes || DEFAULT_TEST_META.durationMinutes,
    totalQuestions: card.expectedTotalQuestions || card.totalQuestions || DEFAULT_TEST_META.totalQuestions,
    maxScore: DEFAULT_TEST_META.maxScore,
    partsCount: DEFAULT_TEST_META.partsCount,
    loadExam: () => {
      const loadedExam = config.loadExam();

      return {
        ...loadedExam,
        id: config.id || loadedExam.id,
        title: config.title || buildProviderDisplayTitle(getExamCard(loadedExam)),
        sourceTitle: loadedExam.title,
        bookName: config.badgeLabel || loadedExam.bookName || 'ETS 2024',
        collectionKey: config.collectionKey,
        collectionLabel: config.collectionLabel
      };
    }
  };
}

function buildManagedExamOrPlaceholder(config) {
  try {
    return buildManagedExamDefinition(config);
  } catch (error) {
    return createPlaceholderExam({
      id: config.id,
      title: config.fallbackTitle,
      collectionKey: config.collectionKey,
      collectionLabel: config.collectionLabel,
      badgeLabel: config.badgeLabel,
      statusText: `File đề chưa hợp lệ: ${error.message}`
    });
  }
}

function createPlaceholderExam(config) {
  return {
    ...DEFAULT_TEST_META,
    kind: 'placeholder',
    isAvailable: false,
    actionLabel: 'Sắp cập nhật',
    statusTone: 'coming-soon',
    statusText: 'Khung đề đã sẵn sàng, chỉ cần nối thêm file JS/API 200 câu là dùng được.',
    description: 'Bạn có thể gắn file đề 200 câu vào card này sau mà không cần làm lại giao diện.',
    ...config
  };
}

function buildYearTestIdentity(year, testNumber) {
  return {
    id: `ets-${year}-test-${testNumber}`,
    title: `Đề ETS ${year} Test ${testNumber}`,
    collectionKey: String(year),
    collectionLabel: `Đề ${year}`,
    badgeLabel: `ETS ${year}`
  };
}

function createYearPlaceholderExam(year, testNumber, override = {}) {
  const identity = buildYearTestIdentity(year, testNumber);

  return createPlaceholderExam({
    ...identity,
    description: `Khung này đã sẵn cho ${identity.badgeLabel} Test ${testNumber}. Khi bạn thêm file JS/API 200 câu và answer key, card sẽ dùng lại ngay.`,
    statusText: `Chưa gắn dữ liệu cho ${identity.badgeLabel} Test ${testNumber}. Bạn có thể thêm file đề sau mà không cần làm lại giao diện.`,
    ...override
  });
}

function loadAnswerKey(answerKeyFilePath) {
  delete require.cache[require.resolve(answerKeyFilePath)];
  return require(answerKeyFilePath);
}

function buildFileManagedDefinition(year, testNumber, dataFilePath, answerKeyFilePath, sourceLabel) {
  const identity = buildYearTestIdentity(year, testNumber);

  return buildManagedExamOrPlaceholder({
    ...identity,
    fallbackTitle: identity.title,
    description: "",
    loadExam: () => loadExamFromFiles({
      fileCandidates: [dataFilePath],
      answerKey: loadAnswerKey(answerKeyFilePath),
      fallbackBookName: identity.badgeLabel,
      allowDemoFallback: false
    })
  });
}

function resolveSpecialSlotDefinition(year, testNumber) {
  const slotKey = `${year}-${testNumber}`;
  const slotConfig = SPECIAL_SLOT_CONFIGS[slotKey];
  const identity = buildYearTestIdentity(year, testNumber);

  if (!slotConfig) {
    return null;
  }

  if (slotConfig.type === 'default') {
    return buildManagedExamDefinition({
      ...identity,
      description: "",
      loadExam: () => loadPlacementExam()
    });
  }

  const dataFilePath = path.join(__dirname, slotConfig.dataFileName);
  const answerKeyFilePath = path.join(__dirname, slotConfig.answerKeyFileName);

  if (!fs.existsSync(dataFilePath)) {
    return createYearPlaceholderExam(year, testNumber, {
      description: `Slot này đang chờ file ${slotConfig.dataFileName} để bật đề thật.`,
      statusText: `Chưa tìm thấy file ${slotConfig.dataFileName} cho ${identity.badgeLabel} Test ${testNumber}.`
    });
  }

  if (fs.statSync(dataFilePath).size === 0) {
    return createYearPlaceholderExam(year, testNumber, {
      description: `File ${slotConfig.dataFileName} đã được tạo nhưng chưa có nội dung JSON 200 câu.`,
      statusText: `File ${slotConfig.dataFileName} đang trống nên chưa thể render đề này.`
    });
  }

  if (!fs.existsSync(answerKeyFilePath)) {
    return createYearPlaceholderExam(year, testNumber, {
      description: `Đã có file ${slotConfig.dataFileName}, chỉ còn thiếu answer key để bật nút làm bài.`,
      statusText: `Chưa tìm thấy ${slotConfig.answerKeyFileName} cho ${identity.badgeLabel} Test ${testNumber}.`
    });
  }

  return buildFileManagedDefinition(
    year,
    testNumber,
    dataFilePath,
    answerKeyFilePath,
    slotConfig.sourceLabel
  );
}

function resolveStandardSlotDefinition(year, testNumber) {
  const identity = buildYearTestIdentity(year, testNumber);
  const dataFileName = `${year}-test${testNumber}.js`;
  const answerKeyFileName = `ets${year}Test${testNumber}AnswerKey.js`;
  const dataFilePath = path.join(__dirname, dataFileName);
  const answerKeyFilePath = path.join(__dirname, answerKeyFileName);

  if (!fs.existsSync(dataFilePath)) {
    return createYearPlaceholderExam(year, testNumber);
  }

  if (fs.statSync(dataFilePath).size === 0) {
    return createYearPlaceholderExam(year, testNumber, {
      description: `File ${dataFileName} đã được tạo nhưng hiện vẫn chưa có nội dung JSON 200 câu.`,
      statusText: `File ${dataFileName} đang trống nên hệ thống giữ slot này ở trạng thái chờ.`
    });
  }

  if (!fs.existsSync(answerKeyFilePath)) {
    return createYearPlaceholderExam(year, testNumber, {
      description: `Đã có file ${dataFileName}, chỉ còn thiếu answer key để bật đề thật.`,
      statusText: `Chưa có ${answerKeyFileName} nên ${identity.badgeLabel} Test ${testNumber} chưa thể chấm điểm.`
    });
  }

  return buildFileManagedDefinition(
    year,
    testNumber,
    dataFilePath,
    answerKeyFilePath,
    `src/data/${dataFileName}`
  );
}

function resolveSlotDefinition(year, testNumber) {
  return resolveSpecialSlotDefinition(year, testNumber)
    || resolveStandardSlotDefinition(year, testNumber);
}

function getFullTestDefinitions() {
  return ETS_YEARS.flatMap((year) => {
    const testNumbers = YEAR_TEST_NUMBERS[String(year)] || [];
    return testNumbers.map((testNumber) => resolveSlotDefinition(year, testNumber));
  });
}

function normalizeBaseUrl(baseUrl) {
  if (!baseUrl || baseUrl === '/') {
    return '';
  }

  return String(baseUrl).replace(/\/+$/, '');
}

function getFullTestCards(baseUrl = '') {
  const safeBaseUrl = normalizeBaseUrl(baseUrl);

  return getFullTestDefinitions().map((definition) => ({
    ...definition,
    href: definition.isAvailable
      ? `${safeBaseUrl}/placement-tests/${encodeURIComponent(definition.id)}`
      : null
  }));
}

function getFullTestCollections(cards = getFullTestCards()) {
  return FULL_TEST_COLLECTIONS.map((collection) => ({
    ...collection,
    total: collection.key === 'all'
      ? cards.length
      : cards.filter((card) => card.collectionKey === collection.key).length
  }));
}

function findManagedFullTestDefinition(testId) {
  return getFullTestDefinitions().find(
    (definition) => definition.isAvailable && definition.id === testId && typeof definition.loadExam === 'function'
  ) || null;
}

function loadManagedFullTest(testId) {
  const definition = findManagedFullTestDefinition(testId);

  if (!definition) {
    return null;
  }

  return definition.loadExam();
}

module.exports = {
  FULL_TEST_COLLECTIONS,
  getFullTestCards,
  getFullTestCollections,
  findManagedFullTestDefinition,
  loadManagedFullTest
};
