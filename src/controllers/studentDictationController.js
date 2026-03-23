const renderWithLayout = require("../utils/renderHelper");
const {
  getTopicListPage,
  getTopicDetail,
  getLessonDetail
} = require("../data/dictationCatalog");

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

module.exports = {
  listDictationTopics,
  showDictationTopic,
  showDictationLesson
};
