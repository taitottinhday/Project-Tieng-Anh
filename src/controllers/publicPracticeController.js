const renderWithLayout = require("../utils/renderHelper");
const {
  getPart56PracticeCatalog,
  buildPart56PracticeExam,
  gradePracticeExam
} = require("../data/practiceCatalog");

const PART56_PATH_PREFIX = "/goc-hoc-tap/part-5-6";

function getSafeBaseUrl(res) {
  return res.locals.baseUrl || "";
}

function respondWithError(res, error, options = {}) {
  const statusCode = Number(options.statusCode || 500);
  const fallbackMessage = options.fallbackMessage || "Đã xảy ra lỗi trong khi tải bài tập TOEIC Part 5-6.";

  console.error("publicPractice error:", error);
  return res.status(statusCode).send(error && error.message ? error.message : fallbackMessage);
}

function getCatalog(baseUrl = "") {
  return getPart56PracticeCatalog(baseUrl, {
    pathPrefix: PART56_PATH_PREFIX
  });
}

function resolveCatalogItem(baseUrl, practiceId) {
  const catalog = getCatalog(baseUrl);
  const currentItem = (catalog.items || []).find((item) => item.id === String(practiceId));

  if (!currentItem) {
    throw new Error("Không tìm thấy bài tập TOEIC Part 5-6.");
  }

  return {
    catalog,
    currentItem
  };
}

function buildExamForItem(currentItem, baseUrl, catalog) {
  return buildPart56PracticeExam(currentItem.id, baseUrl, {
    pathPrefix: PART56_PATH_PREFIX,
    itemTitle: currentItem.title,
    libraryLabel: catalog.title
  });
}

function listPart56Practice(req, res) {
  try {
    const safeBaseUrl = getSafeBaseUrl(res);
    const catalog = getCatalog(safeBaseUrl);

    return renderWithLayout(res, "public-part56-library", {
      title: catalog.title,
      catalog
    });
  } catch (error) {
    return respondWithError(res, error);
  }
}

function showPart56Practice(req, res) {
  try {
    const safeBaseUrl = getSafeBaseUrl(res);
    const { catalog, currentItem } = resolveCatalogItem(safeBaseUrl, req.params.practiceId);
    const exam = buildExamForItem(currentItem, safeBaseUrl, catalog);

    return renderWithLayout(res, "public-part56-detail", {
      title: currentItem.title,
      catalog,
      currentItem,
      exam
    });
  } catch (error) {
    return respondWithError(res, error, {
      statusCode: 404,
      fallbackMessage: "Không tìm thấy trang giới thiệu bài tập TOEIC Part 5-6."
    });
  }
}

function takePart56Practice(req, res) {
  try {
    const safeBaseUrl = getSafeBaseUrl(res);
    const { catalog, currentItem } = resolveCatalogItem(safeBaseUrl, req.params.practiceId);
    const exam = buildExamForItem(currentItem, safeBaseUrl, catalog);

    return res.render("public-part56-quiz", {
      pageTitle: currentItem.title,
      catalog,
      currentItem,
      exam,
      baseUrl: safeBaseUrl
    });
  } catch (error) {
    return respondWithError(res, error, {
      statusCode: 404,
      fallbackMessage: "Không tìm thấy bài quiz TOEIC Part 5-6."
    });
  }
}

function submitPart56Practice(req, res) {
  try {
    const safeBaseUrl = getSafeBaseUrl(res);
    const { catalog, currentItem } = resolveCatalogItem(safeBaseUrl, req.params.practiceId);
    const exam = buildExamForItem(currentItem, safeBaseUrl, catalog);
    const result = gradePracticeExam(exam, req.body || {});

    result.libraryHref = `${safeBaseUrl}${PART56_PATH_PREFIX}`;
    result.libraryLabel = catalog.title;
    req.session.lastPublicPart56Result = result;

    return res.redirect(`${safeBaseUrl}${PART56_PATH_PREFIX}/result/latest`);
  } catch (error) {
    return respondWithError(res, error, {
      statusCode: 400,
      fallbackMessage: "Không thể nộp bài TOEIC Part 5-6."
    });
  }
}

function showLatestPart56Result(req, res) {
  try {
    const result = req.session?.lastPublicPart56Result || null;

    if (!result) {
      return res.redirect(`${getSafeBaseUrl(res)}${PART56_PATH_PREFIX}`);
    }

    return renderWithLayout(res, "student-practice-result", {
      title: "Kết quả TOEIC Part 5-6",
      result
    });
  } catch (error) {
    return respondWithError(res, error);
  }
}

module.exports = {
  listPart56Practice,
  showPart56Practice,
  takePart56Practice,
  submitPart56Practice,
  showLatestPart56Result
};
