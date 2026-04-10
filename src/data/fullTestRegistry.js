const fs = require("fs");
const path = require("path");
const {
  getExamCard,
  loadPlacementExam,
  loadExamFromFiles,
} = require("./toeicPlacementProvider");
const { getUploadedExamEntries } = require("../services/adminContentService");

const ETS_YEARS = Object.freeze(["2024", "2023", "2022", "2021", "2020"]);
const YEAR_TEST_NUMBERS = Object.freeze({
  2024: Object.freeze(Array.from({ length: 10 }, (_, index) => index + 1)),
  2023: Object.freeze(Array.from({ length: 10 }, (_, index) => index + 1)),
  2022: Object.freeze(Array.from({ length: 10 }, (_, index) => index + 1)),
  2021: Object.freeze(Array.from({ length: 5 }, (_, index) => index + 1)),
  2020: Object.freeze(Array.from({ length: 10 }, (_, index) => index + 1)),
});

const DEFAULT_TEST_META = Object.freeze({
  durationMinutes: 120,
  totalQuestions: 200,
  partsCount: 7,
  maxScore: 990,
  accessLabel: "Miễn phí",
});

const SPECIAL_SLOT_CONFIGS = Object.freeze({
  "2024-1": {
    type: "default",
    sourceLabel: "bộ dữ liệu mặc định của dự án",
  },
  "2024-2": {
    type: "file",
    dataFileName: "2026-test1.js",
    answerKeyFileName: "ets2024Test2AnswerKey.js",
    sourceLabel: "src/data/2026-test1.js",
  },
});

function extractTestLabel(rawTitle) {
  const match = String(rawTitle || "").match(/test\s*(\d+)/i);
  return match ? `Test ${match[1]}` : "";
}

function buildProviderDisplayTitle(card) {
  const bookLabel = card.bookName || "ETS 2024";
  const testLabel = extractTestLabel(card.title);
  return testLabel ? `Đề ${bookLabel} ${testLabel}` : `Đề ${bookLabel}`;
}

function buildManagedExamDefinition(config) {
  const exam = config.loadExam();
  const card = getExamCard(exam);

  return {
    ...DEFAULT_TEST_META,
    id: config.id || exam.id,
    kind: "provider",
    collectionKey: config.collectionKey,
    collectionLabel: config.collectionLabel,
    badgeLabel: config.badgeLabel || exam.bookName || "ETS 2024",
    title: config.title || buildProviderDisplayTitle(card),
    description: config.description,
    isAvailable: true,
    isDemo: Boolean(exam.isDemo),
    actionLabel: "Làm bài",
    statusTone: exam.isDemo ? "demo" : "ready",
    statusText: exam.isDemo
      ? "Đề demo đã sẵn sàng."
      : "Đề đã sẵn sàng để làm bài ngay.",
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
        bookName: config.badgeLabel || loadedExam.bookName || "ETS 2024",
        collectionKey: config.collectionKey,
        collectionLabel: config.collectionLabel,
      };
    },
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
      statusText: "Đề này tạm thời chưa khả dụng.",
    });
  }
}

function createPlaceholderExam(config) {
  return {
    ...DEFAULT_TEST_META,
    kind: "placeholder",
    isAvailable: false,
    actionLabel: "Sắp cập nhật",
    statusTone: "coming-soon",
    statusText: "Đề này đang được cập nhật.",
    description: "Nội dung đề sẽ sớm có mặt trong thư viện.",
    ...config,
  };
}

function buildYearTestIdentity(year, testNumber) {
  return {
    id: `ets-${year}-test-${testNumber}`,
    title: `Đề ETS ${year} Test ${testNumber}`,
    collectionKey: String(year),
    collectionLabel: `Đề ${year}`,
    badgeLabel: `ETS ${year}`,
  };
}

function createYearPlaceholderExam(year, testNumber, override = {}) {
  const identity = buildYearTestIdentity(year, testNumber);

  return createPlaceholderExam({
    ...identity,
    description: `${identity.badgeLabel} Test ${testNumber} đang được cập nhật.`,
    statusText: "Đề này hiện chưa mở làm bài.",
    ...override,
  });
}

function loadAnswerKey(answerKeyFilePath) {
  delete require.cache[require.resolve(answerKeyFilePath)];
  return require(answerKeyFilePath);
}

function buildFileManagedDefinition(year, testNumber, dataFilePath, answerKeyFilePath) {
  const identity = buildYearTestIdentity(year, testNumber);

  return buildManagedExamOrPlaceholder({
    ...identity,
    fallbackTitle: identity.title,
    description: "",
    loadExam: () =>
      loadExamFromFiles({
        fileCandidates: [dataFilePath],
        answerKey: loadAnswerKey(answerKeyFilePath),
        fallbackBookName: identity.badgeLabel,
        allowDemoFallback: false,
      }),
  });
}

function resolveSpecialSlotDefinition(year, testNumber) {
  const slotKey = `${year}-${testNumber}`;
  const slotConfig = SPECIAL_SLOT_CONFIGS[slotKey];
  const identity = buildYearTestIdentity(year, testNumber);

  if (!slotConfig) {
    return null;
  }

  if (slotConfig.type === "default") {
    return buildManagedExamDefinition({
      ...identity,
      description: "",
      loadExam: () => loadPlacementExam(),
    });
  }

  const dataFilePath = path.join(__dirname, slotConfig.dataFileName);
  const answerKeyFilePath = path.join(__dirname, slotConfig.answerKeyFileName);

  if (!fs.existsSync(dataFilePath)) {
    return createYearPlaceholderExam(year, testNumber, {
      description: `${identity.badgeLabel} Test ${testNumber} đang được cập nhật.`,
      statusText: "Đề này hiện chưa khả dụng.",
    });
  }

  if (fs.statSync(dataFilePath).size === 0) {
    return createYearPlaceholderExam(year, testNumber, {
      description: `${identity.badgeLabel} Test ${testNumber} đang được cập nhật.`,
      statusText: "Đề này hiện chưa khả dụng.",
    });
  }

  if (!fs.existsSync(answerKeyFilePath)) {
    return createYearPlaceholderExam(year, testNumber, {
      description: `${identity.badgeLabel} Test ${testNumber} đang được cập nhật.`,
      statusText: "Đề này hiện chưa khả dụng.",
    });
  }

  return buildFileManagedDefinition(year, testNumber, dataFilePath, answerKeyFilePath);
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
      description: `${identity.badgeLabel} Test ${testNumber} đang được cập nhật.`,
      statusText: "Đề này hiện chưa khả dụng.",
    });
  }

  if (!fs.existsSync(answerKeyFilePath)) {
    return createYearPlaceholderExam(year, testNumber, {
      description: `${identity.badgeLabel} Test ${testNumber} đang được cập nhật.`,
      statusText: "Đề này hiện chưa khả dụng.",
    });
  }

  return buildFileManagedDefinition(year, testNumber, dataFilePath, answerKeyFilePath);
}

function resolveSlotDefinition(year, testNumber) {
  return resolveSpecialSlotDefinition(year, testNumber)
    || resolveStandardSlotDefinition(year, testNumber);
}

function buildUploadedExamDefinition(entry = {}) {
  const year = Number(entry.year || 0);
  const testNumber = Number(entry.testNumber || 0);
  const collectionKey = String(year || "");
  const collectionLabel = collectionKey ? `Đề ${collectionKey}` : "Đề upload";
  const badgeLabel = String(entry.bookName || `ETS ${collectionKey}`).trim() || `ETS ${collectionKey}`;
  const dataFilePath = path.join(process.cwd(), String(entry.dataFilePath || ""));
  const answerKeyFilePath = path.join(process.cwd(), String(entry.answerKeyFilePath || ""));

  if (!entry.id || !year || !testNumber) {
    return null;
  }

  if (!fs.existsSync(dataFilePath) || !fs.existsSync(answerKeyFilePath)) {
    return createPlaceholderExam({
      id: entry.id,
      title: entry.title || `Đề ETS ${year} Test ${testNumber}`,
      collectionKey,
      collectionLabel,
      badgeLabel,
      statusText: "Đề này tạm thời chưa khả dụng.",
      description: "Vui lòng quay lại sau.",
    });
  }

  return buildManagedExamOrPlaceholder({
    id: entry.id,
    fallbackTitle: entry.title || `Đề ETS ${year} Test ${testNumber}`,
    title: entry.title || `Đề ETS ${year} Test ${testNumber}`,
    collectionKey,
    collectionLabel,
    badgeLabel,
    description: "Đề thi được quản trị viên tải lên trực tiếp từ khu admin.",
    loadExam: () =>
      loadExamFromFiles({
        fileCandidates: [dataFilePath],
        answerKey: loadAnswerKey(answerKeyFilePath),
        fallbackBookName: badgeLabel,
        allowDemoFallback: false,
      }),
  });
}

function getStaticFullTestDefinitions() {
  return ETS_YEARS.flatMap((year) => {
    const testNumbers = YEAR_TEST_NUMBERS[String(year)] || [];
    return testNumbers.map((testNumber) => resolveSlotDefinition(year, testNumber));
  });
}

function sortDefinitions(definitions = []) {
  return definitions.slice().sort((left, right) => {
    const leftYear = Number(left.collectionKey || 0);
    const rightYear = Number(right.collectionKey || 0);
    if (rightYear !== leftYear) {
      return rightYear - leftYear;
    }

    const leftTest = Number(String(left.id || "").match(/test-(\d+)/i)?.[1] || 0);
    const rightTest = Number(String(right.id || "").match(/test-(\d+)/i)?.[1] || 0);
    return leftTest - rightTest;
  });
}

function getFullTestDefinitions() {
  const definitionsById = new Map();

  getStaticFullTestDefinitions().forEach((definition) => {
    if (definition && definition.id) {
      definitionsById.set(definition.id, definition);
    }
  });

  getUploadedExamEntries().forEach((entry) => {
    const definition = buildUploadedExamDefinition(entry);
    if (definition && definition.id) {
      definitionsById.set(definition.id, definition);
    }
  });

  return sortDefinitions(Array.from(definitionsById.values()));
}

function normalizeBaseUrl(baseUrl) {
  if (!baseUrl || baseUrl === "/") {
    return "";
  }

  return String(baseUrl).replace(/\/+$/, "");
}

function getFullTestCards(baseUrl = "") {
  const safeBaseUrl = normalizeBaseUrl(baseUrl);

  return getFullTestDefinitions().map((definition) => ({
    ...definition,
    href: definition.isAvailable
      ? `${safeBaseUrl}/placement-tests/${encodeURIComponent(definition.id)}`
      : null,
  }));
}

function sortCollectionKeys(keys = []) {
  return keys.slice().sort((left, right) => {
    const leftYear = Number(left || 0);
    const rightYear = Number(right || 0);

    if (leftYear && rightYear && leftYear !== rightYear) {
      return rightYear - leftYear;
    }

    return String(right).localeCompare(String(left));
  });
}

function getCollectionDefinitions(cards = getFullTestCards()) {
  const keys = sortCollectionKeys(
    Array.from(new Set(cards.map((card) => String(card.collectionKey || "").trim()).filter(Boolean)))
  );

  return [
    { key: "all", label: "Tất cả" },
    ...keys.map((key) => ({
      key,
      label: `Đề ${key}`,
    })),
  ];
}

function getFullTestCollections(cards = getFullTestCards()) {
  return getCollectionDefinitions(cards).map((collection) => ({
    ...collection,
    total: collection.key === "all"
      ? cards.length
      : cards.filter((card) => card.collectionKey === collection.key).length,
  }));
}

function findManagedFullTestDefinition(testId) {
  return getFullTestDefinitions().find(
    (definition) =>
      definition.isAvailable &&
      definition.id === testId &&
      typeof definition.loadExam === "function"
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
  getFullTestCards,
  getFullTestCollections,
  findManagedFullTestDefinition,
  loadManagedFullTest,
};

Object.defineProperty(module.exports, "FULL_TEST_COLLECTIONS", {
  enumerable: true,
  get() {
    return getCollectionDefinitions(getFullTestCards());
  },
});
