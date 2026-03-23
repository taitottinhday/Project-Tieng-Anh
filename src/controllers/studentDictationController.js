const renderWithLayout = require("../utils/renderHelper");
const {
  getTopicListPage,
  getTopicDetail,
  getLessonDetail
} = require("../data/dictationCatalog");
const { syncStudentProfileFromUser } = require("../services/platformSupport");
const { upsertDictationSession } = require("../services/studentActivityService");

function getSafeBaseUrl(res) {
  return res.locals.baseUrl || "";
}

function respondWithError(res, error, options = {}) {
  const {
    statusCode = 500,
    fallbackMessage = "Khong the tai du lieu nghe-chep chinh ta."
  } = options;

  console.error("studentDictation error:", error);

  return res.status(statusCode).send(error && error.message ? error.message : fallbackMessage);
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
      return respondWithError(res, new Error("Khong tim thay topic nghe-chep."), {
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
      fallbackMessage: "Khong tim thay topic nghe-chep."
    });
  }
}

function showDictationLesson(req, res) {
  try {
    const detail = getLessonDetail(req.params.topicId, req.params.lessonId, getSafeBaseUrl(res));

    if (!detail) {
      return respondWithError(res, new Error("Khong tim thay bai nghe-chep."), {
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
      fallbackMessage: "Khong tim thay bai nghe-chep."
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
        message: "Khong tim thay du lieu dictation de luu session."
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
    return res.status(500).json({
      ok: false,
      message: error && error.message ? error.message : "Khong the luu session dictation."
    });
  }
}

module.exports = {
  listDictationTopics,
  showDictationTopic,
  showDictationLesson,
  saveDictationSession
};
