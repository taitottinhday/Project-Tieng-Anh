const renderWithLayout = require("../utils/renderHelper");
const {
  getPart56PracticeCatalog,
  buildPart56PracticeExam,
  getWordformPracticeCatalog,
  buildWordformPracticeExam,
  getPart7GuidePracticeCatalog,
  buildPart7GuidePracticeExam,
  gradePracticeExam
} = require("../data/practiceCatalog");
const { sendPublicError } = require("../utils/publicError");

const PART56_PATH_PREFIX = "/goc-hoc-tap/part-5-6";
const WORDFORM_PATH_PREFIX = "/goc-hoc-tap/wordform";
const PART7_PATH_PREFIX = "/goc-hoc-tap/part-7";

const FLOW_CONFIG = Object.freeze({
  part56: {
    pathPrefix: PART56_PATH_PREFIX,
    catalogView: "public-part56-library",
    detailView: "public-part56-detail",
    quizView: "public-part56-quiz",
    sessionKey: "lastPublicPart56Result",
    resultTitle: "Kết quả TOEIC Part 5-6",
    entityLabel: "bài tập TOEIC Part 5-6",
    introLabel: "trang giới thiệu bài tập TOEIC Part 5-6",
    quizLabel: "bài quiz TOEIC Part 5-6",
    submitLabel: "bài TOEIC Part 5-6",
    getCatalog(baseUrl) {
      return getPart56PracticeCatalog(baseUrl, {
        pathPrefix: PART56_PATH_PREFIX
      });
    },
    buildExam(currentItem, baseUrl, catalog) {
      return buildPart56PracticeExam(currentItem.id, baseUrl, {
        pathPrefix: PART56_PATH_PREFIX,
        itemTitle: currentItem.title,
        libraryLabel: catalog.title
      });
    }
  },
  wordform: {
    pathPrefix: WORDFORM_PATH_PREFIX,
    catalogView: "public-part56-library",
    detailView: "public-part56-detail",
    quizView: "public-wordform-quiz",
    sessionKey: "lastPublicWordformResult",
    resultTitle: "Kết quả Wordform Test",
    entityLabel: "bài Wordform",
    introLabel: "trang giới thiệu Wordform Test",
    quizLabel: "bài quiz Wordform",
    submitLabel: "Wordform Test",
    getCatalog(baseUrl) {
      return getWordformPracticeCatalog(baseUrl, {
        pathPrefix: WORDFORM_PATH_PREFIX
      });
    },
    buildExam(currentItem, baseUrl, catalog) {
      return buildWordformPracticeExam(currentItem.id, baseUrl, {
        pathPrefix: WORDFORM_PATH_PREFIX,
        itemTitle: currentItem.title,
        libraryLabel: catalog.title
      });
    }
  },
  part7: {
    pathPrefix: PART7_PATH_PREFIX,
    catalogView: "public-part7-library",
    detailView: "public-part56-detail",
    quizView: "public-wordform-quiz",
    sessionKey: "lastPublicPart7Result",
    resultTitle: "Kết quả TOEIC Part 7",
    entityLabel: "bài TOEIC Part 7",
    introLabel: "trang giới thiệu TOEIC Part 7",
    quizLabel: "bài quiz TOEIC Part 7",
    submitLabel: "bài TOEIC Part 7",
    getCatalog(baseUrl) {
      return getPart7GuidePracticeCatalog(baseUrl, {
        pathPrefix: PART7_PATH_PREFIX
      });
    },
    buildExam(currentItem, baseUrl, catalog) {
      return buildPart7GuidePracticeExam(currentItem.id, baseUrl, {
        pathPrefix: PART7_PATH_PREFIX,
        itemTitle: currentItem.title,
        libraryLabel: catalog.title
      });
    }
  }
});

function getSafeBaseUrl(res) {
  return res.locals.baseUrl || "";
}

function respondWithError(res, error, options = {}) {
  const statusCode = Number(options.statusCode || 500);
  const fallbackMessage = options.fallbackMessage || "Đã xảy ra lỗi trong khi tải bài luyện tập public.";

  console.error("publicPractice error:", error);
  return sendPublicError(res, error, statusCode, fallbackMessage);
}

function getFlowConfig(flowKey) {
  const config = FLOW_CONFIG[flowKey];
  if (!config) {
    throw new Error(`Unsupported public practice flow: ${flowKey}`);
  }
  return config;
}

function getCatalog(flowKey, baseUrl = "") {
  return getFlowConfig(flowKey).getCatalog(baseUrl);
}

function resolveCatalogItem(flowKey, baseUrl, practiceId) {
  const config = getFlowConfig(flowKey);
  const catalog = getCatalog(flowKey, baseUrl);
  const currentItem = (catalog.items || []).find((item) => item.id === String(practiceId));

  if (!currentItem) {
    throw new Error(`Không tìm thấy ${config.entityLabel}.`);
  }

  return {
    catalog,
    currentItem
  };
}

function buildExamForItem(flowKey, currentItem, baseUrl, catalog) {
  return getFlowConfig(flowKey).buildExam(currentItem, baseUrl, catalog);
}

function listPractice(flowKey, req, res) {
  try {
    const safeBaseUrl = getSafeBaseUrl(res);
    const config = getFlowConfig(flowKey);
    const catalog = getCatalog(flowKey, safeBaseUrl);

    return renderWithLayout(res, config.catalogView, {
      title: catalog.title,
      catalog
    });
  } catch (error) {
    return respondWithError(res, error);
  }
}

function showPractice(flowKey, req, res) {
  try {
    const safeBaseUrl = getSafeBaseUrl(res);
    const config = getFlowConfig(flowKey);
    const { catalog, currentItem } = resolveCatalogItem(flowKey, safeBaseUrl, req.params.practiceId);
    const exam = buildExamForItem(flowKey, currentItem, safeBaseUrl, catalog);

    return renderWithLayout(res, config.detailView, {
      title: currentItem.title,
      catalog,
      currentItem,
      exam
    });
  } catch (error) {
    return respondWithError(res, error, {
      statusCode: 404,
      fallbackMessage: `Không tìm thấy ${getFlowConfig(flowKey).introLabel}.`
    });
  }
}

function takePractice(flowKey, req, res) {
  try {
    const safeBaseUrl = getSafeBaseUrl(res);
    const config = getFlowConfig(flowKey);
    const { catalog, currentItem } = resolveCatalogItem(flowKey, safeBaseUrl, req.params.practiceId);
    const exam = buildExamForItem(flowKey, currentItem, safeBaseUrl, catalog);

    return res.render(config.quizView, {
      pageTitle: currentItem.title,
      catalog,
      currentItem,
      exam,
      baseUrl: safeBaseUrl
    });
  } catch (error) {
    return respondWithError(res, error, {
      statusCode: 404,
      fallbackMessage: `Không tìm thấy ${getFlowConfig(flowKey).quizLabel}.`
    });
  }
}

async function submitPractice(flowKey, req, res) {
  try {
    const safeBaseUrl = getSafeBaseUrl(res);
    const config = getFlowConfig(flowKey);
    const { catalog, currentItem } = resolveCatalogItem(flowKey, safeBaseUrl, req.params.practiceId);
    const exam = buildExamForItem(flowKey, currentItem, safeBaseUrl, catalog);
    const result = await gradePracticeExam(exam, req.body || {});

    result.libraryHref = `${safeBaseUrl}${config.pathPrefix}`;
    result.libraryLabel = catalog.title;
    req.session[config.sessionKey] = result;

    return res.redirect(`${safeBaseUrl}${config.pathPrefix}/result/latest`);
  } catch (error) {
    return respondWithError(res, error, {
      statusCode: 400,
      fallbackMessage: `Không thể nộp ${getFlowConfig(flowKey).submitLabel}.`
    });
  }
}

function showLatestResult(flowKey, req, res) {
  try {
    const safeBaseUrl = getSafeBaseUrl(res);
    const config = getFlowConfig(flowKey);
    const result = req.session?.[config.sessionKey] || null;

    if (!result) {
      return res.redirect(`${safeBaseUrl}${config.pathPrefix}`);
    }

    return renderWithLayout(res, "student-practice-result", {
      title: config.resultTitle,
      result
    });
  } catch (error) {
    return respondWithError(res, error);
  }
}

function listPart56Practice(req, res) {
  return listPractice("part56", req, res);
}

function showPart56Practice(req, res) {
  return showPractice("part56", req, res);
}

function takePart56Practice(req, res) {
  return takePractice("part56", req, res);
}

function submitPart56Practice(req, res) {
  return submitPractice("part56", req, res);
}

function showLatestPart56Result(req, res) {
  return showLatestResult("part56", req, res);
}

function listWordformPractice(req, res) {
  return listPractice("wordform", req, res);
}

function showWordformPractice(req, res) {
  return showPractice("wordform", req, res);
}

function takeWordformPractice(req, res) {
  return takePractice("wordform", req, res);
}

function submitWordformPractice(req, res) {
  return submitPractice("wordform", req, res);
}

function showLatestWordformResult(req, res) {
  return showLatestResult("wordform", req, res);
}

function listPart7GuidePractice(req, res) {
  return listPractice("part7", req, res);
}

function showPart7GuidePractice(req, res) {
  return showPractice("part7", req, res);
}

function takePart7GuidePractice(req, res) {
  return takePractice("part7", req, res);
}

function submitPart7GuidePractice(req, res) {
  return submitPractice("part7", req, res);
}

function showLatestPart7GuideResult(req, res) {
  return showLatestResult("part7", req, res);
}

module.exports = {
  listPart56Practice,
  showPart56Practice,
  takePart56Practice,
  submitPart56Practice,
  showLatestPart56Result,
  listWordformPractice,
  showWordformPractice,
  takeWordformPractice,
  submitWordformPractice,
  showLatestWordformResult,
  listPart7GuidePractice,
  showPart7GuidePractice,
  takePart7GuidePractice,
  submitPart7GuidePractice,
  showLatestPart7GuideResult
};
