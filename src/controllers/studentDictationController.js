const renderWithLayout = require("../utils/renderHelper");
const {
  getTopicListPage,
  getTopicDetail,
  getLessonDetail
} = require("../data/dictationCatalog");
const { syncStudentProfileFromUser } = require("../services/platformSupport");
const { upsertDictationSession } = require("../services/studentActivityService");
const { sendPublicError, sendPublicJsonError } = require("../utils/publicError");

function getSafeBaseUrl(res) {
  return res.locals.baseUrl || "";
}

function respondWithError(res, error, options = {}) {
  const {
    statusCode = 500,
    fallbackMessage = "Không thể tải dữ liệu nghe-chép chính tả."
  } = options;

  console.error("studentDictation error:", error);

  return sendPublicError(res, error, statusCode, fallbackMessage);
}

function listDictationTopics(req, res) {
  try {
    const page = getTopicListPage(getSafeBaseUrl(res));

    return renderWithLayout(res, "student-dictation-topics", {
      title: page.title,
      page
    });
  } catch (error) {
    return respondWithError(res, error);
  }
}

function showDictationTopic(req, res) {
  try {
    const topic = getTopicDetail(req.params.topicId, getSafeBaseUrl(res));

    if (!topic) {
      return respondWithError(res, new Error("Không tìm thấy topic nghe-chép."), {
        statusCode: 404
      });
    }

    return renderWithLayout(res, "student-dictation-topic", {
      title: topic.title,
      topic
    });
  } catch (error) {
    return respondWithError(res, error, {
      statusCode: 404,
      fallbackMessage: "Không tìm thấy topic nghe-chép."
    });
  }
}

function showDictationLesson(req, res) {
  try {
    const detail = getLessonDetail(req.params.topicId, req.params.lessonId, getSafeBaseUrl(res));

    if (!detail) {
      return respondWithError(res, new Error("Không tìm thấy bài nghe-chép."), {
        statusCode: 404
      });
    }

    return renderWithLayout(res, "student-dictation-player", {
      title: `${detail.topic.title} - ${detail.lesson.title}`,
      detail
    });
  } catch (error) {
    return respondWithError(res, error, {
      statusCode: 404,
      fallbackMessage: "Không tìm thấy bài nghe-chép."
    });
  }
}

async function saveDictationSession(req, res) {
  try {
    const student = await syncStudentProfileFromUser(req.session?.user);
    const detail = getLessonDetail(req.params.topicId, req.params.lessonId, getSafeBaseUrl(res));

    if (!student?.id || !detail) {
      return res.status(404).json({
        ok: false,
        message: "Không tìm thấy dữ liệu dictation để lưu session."
      });
    }

    await upsertDictationSession(student.id, {
      sessionToken: String(req.body?.sessionToken || "").trim(),
      topicId: detail.topic.id,
      topicTitle: detail.topic.title,
      categoryLabel: detail.topic.categoryLabel,
      lessonId: detail.lesson.id,
      lessonTitle: detail.lesson.title,
      statusLabel: req.body?.statusLabel || "Chưa hoàn thành",
      totalCount: Number(req.body?.totalCount || detail.lesson.entries.length || 0),
      completedCount: Number(req.body?.completedCount || 0),
      correctCount: Number(req.body?.correctCount || 0),
      skippedCount: Number(req.body?.skippedCount || 0),
      accuracy: Number(req.body?.accuracy || 0),
      resetCount: Number(req.body?.resetCount || 0),
      startedAt: req.body?.startedAt || null,
      lastActivityAt: req.body?.lastActivityAt || null,
      results: req.body?.results || {}
    });

    return res.json({ ok: true });
  } catch (error) {
    console.error("studentDictation saveSession error:", error);
    return sendPublicJsonError(res, error, 500, "Không thể lưu session dictation.");
  }
}

module.exports = {
  listDictationTopics,
  showDictationTopic,
  showDictationLesson,
  saveDictationSession
};
