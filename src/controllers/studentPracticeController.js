const renderWithLayout = require('../utils/renderHelper');
const {
  getPartPracticeCatalog,
  getReadingPracticeCatalog,
  buildPartPracticeExam,
  buildReadingPracticeExam,
  serializeExamQuestions,
  getAnswerPayload,
  gradePracticeExam
} = require('../data/practiceCatalog');
const { syncStudentProfileFromUser } = require("../services/platformSupport");
const { recordPracticeSession } = require("../services/studentActivityService");

function getSafeBaseUrl(res) {
  return res.locals.baseUrl || '';
}

function respondWithError(res, error, options = {}) {
  const {
    api = false,
    statusCode = 500,
    fallbackMessage = 'Đã xảy ra lỗi trong khi tải dữ liệu luyện tập.'
  } = options;

  console.error('studentPractice error:', error);

  if (api) {
    return res.status(statusCode).json({
      ok: false,
      message: error && error.message ? error.message : fallbackMessage
    });
  }

  return res.status(statusCode).send(error && error.message ? error.message : fallbackMessage);
}

function isStudentSession(req) {
  const role = req.session?.user?.role;
  return Boolean(role && role !== "admin" && role !== "teacher");
}

function listPartPractice(req, res) {
  try {
    const safeBaseUrl = getSafeBaseUrl(res);
    const library = getPartPracticeCatalog(safeBaseUrl);

    return renderWithLayout(res, 'student-practice-library', {
      title: library.title,
      library
    });
  } catch (error) {
    return respondWithError(res, error);
  }
}

function listReadingPractice(req, res) {
  try {
    const safeBaseUrl = getSafeBaseUrl(res);
    const library = getReadingPracticeCatalog(safeBaseUrl);

    return renderWithLayout(res, 'student-practice-library', {
      title: library.title,
      library
    });
  } catch (error) {
    return respondWithError(res, error);
  }
}

function showPracticeStart(req, res, mode) {
  try {
    const safeBaseUrl = getSafeBaseUrl(res);
    const exam = mode === 'reading'
      ? buildReadingPracticeExam(req.params.practiceId, safeBaseUrl)
      : buildPartPracticeExam(req.params.practiceId, safeBaseUrl);

    return renderWithLayout(res, 'student-practice-start', {
      title: exam.title,
      exam
    });
  } catch (error) {
    return respondWithError(res, error, {
      statusCode: 404,
      fallbackMessage: mode === 'reading'
        ? 'Không tìm thấy trang giới thiệu bộ luyện Reading.'
        : 'Không tìm thấy trang giới thiệu bộ luyện Part.'
    });
  }
}

function showPartPracticeStart(req, res) {
  return showPracticeStart(req, res, 'part');
}

function showReadingPracticeStart(req, res) {
  return showPracticeStart(req, res, 'reading');
}

function takePartPractice(req, res) {
  try {
    const safeBaseUrl = getSafeBaseUrl(res);
    const exam = buildPartPracticeExam(req.params.practiceId, safeBaseUrl);

    return res.render('practice-session', {
      pageTitle: exam.title,
      exam
    });
  } catch (error) {
    return respondWithError(res, error, {
      statusCode: 404,
      fallbackMessage: 'Không tìm thấy bộ luyện Part.'
    });
  }
}

function takeReadingPractice(req, res) {
  try {
    const safeBaseUrl = getSafeBaseUrl(res);
    const exam = buildReadingPracticeExam(req.params.practiceId, safeBaseUrl);

    return res.render('practice-session', {
      pageTitle: exam.title,
      exam
    });
  } catch (error) {
    return respondWithError(res, error, {
      statusCode: 404,
      fallbackMessage: 'Không tìm thấy bộ luyện Reading.'
    });
  }
}

async function submitPractice(req, res, mode) {
  try {
    const safeBaseUrl = getSafeBaseUrl(res);
    const exam = mode === 'reading'
      ? buildReadingPracticeExam(req.params.practiceId, safeBaseUrl)
      : buildPartPracticeExam(req.params.practiceId, safeBaseUrl);
    const result = gradePracticeExam(exam, req.body || {});

    req.session.lastStudentPracticeResult = result;

    if (isStudentSession(req)) {
      const student = await syncStudentProfileFromUser(req.session?.user);
      if (student?.id) {
        await recordPracticeSession(student.id, result);
      }
    }

    return res.redirect(`${safeBaseUrl}/student/practice/result/latest`);
  } catch (error) {
    return respondWithError(res, error, {
      statusCode: 400,
      fallbackMessage: 'Không thể nộp bài luyện tập.'
    });
  }
}

function submitPartPractice(req, res) {
  return submitPractice(req, res, 'part');
}

function submitReadingPractice(req, res) {
  return submitPractice(req, res, 'reading');
}

function showLatestPracticeResult(req, res) {
  try {
    const result = req.session && req.session.lastStudentPracticeResult
      ? req.session.lastStudentPracticeResult
      : null;

    if (!result) {
      return res.redirect(`${getSafeBaseUrl(res)}/student/practice/parts`);
    }

    res.locals.currentPath = result.mode === 'reading'
      ? `${getSafeBaseUrl(res)}/student/practice/reading`
      : `${getSafeBaseUrl(res)}/student/practice/parts`;

    return renderWithLayout(res, 'student-practice-result', {
      title: 'Kết quả luyện tập',
      result
    });
  } catch (error) {
    return respondWithError(res, error);
  }
}

function listPartPracticeApi(req, res) {
  try {
    return res.json({
      ok: true,
      ...getPartPracticeCatalog(getSafeBaseUrl(res))
    });
  } catch (error) {
    return respondWithError(res, error, { api: true });
  }
}

function listReadingPracticeApi(req, res) {
  try {
    return res.json({
      ok: true,
      ...getReadingPracticeCatalog(getSafeBaseUrl(res))
    });
  } catch (error) {
    return respondWithError(res, error, { api: true });
  }
}

function getPartQuestionsApi(req, res) {
  try {
    const exam = buildPartPracticeExam(req.params.practiceId, getSafeBaseUrl(res));
    return res.json({
      ok: true,
      exam: serializeExamQuestions(exam)
    });
  } catch (error) {
    return respondWithError(res, error, {
      api: true,
      statusCode: 404,
      fallbackMessage: 'Không tìm thấy bộ câu hỏi Part.'
    });
  }
}

function getPartAnswersApi(req, res) {
  try {
    const exam = buildPartPracticeExam(req.params.practiceId, getSafeBaseUrl(res));
    return res.json({
      ok: true,
      ...getAnswerPayload(exam)
    });
  } catch (error) {
    return respondWithError(res, error, {
      api: true,
      statusCode: 404,
      fallbackMessage: 'Không tìm thấy bộ đáp án Part.'
    });
  }
}

function getReadingQuestionsApi(req, res) {
  try {
    const exam = buildReadingPracticeExam(req.params.practiceId, getSafeBaseUrl(res));
    return res.json({
      ok: true,
      exam: serializeExamQuestions(exam)
    });
  } catch (error) {
    return respondWithError(res, error, {
      api: true,
      statusCode: 404,
      fallbackMessage: 'Không tìm thấy bộ câu hỏi Reading.'
    });
  }
}

function getReadingAnswersApi(req, res) {
  try {
    const exam = buildReadingPracticeExam(req.params.practiceId, getSafeBaseUrl(res));
    return res.json({
      ok: true,
      ...getAnswerPayload(exam)
    });
  } catch (error) {
    return respondWithError(res, error, {
      api: true,
      statusCode: 404,
      fallbackMessage: 'Không tìm thấy bộ đáp án Reading.'
    });
  }
}

module.exports = {
  listPartPractice,
  listReadingPractice,
  showPartPracticeStart,
  showReadingPracticeStart,
  takePartPractice,
  takeReadingPractice,
  submitPartPractice,
  submitReadingPractice,
  showLatestPracticeResult,
  listPartPracticeApi,
  listReadingPracticeApi,
  getPartQuestionsApi,
  getPartAnswersApi,
  getReadingQuestionsApi,
  getReadingAnswersApi
};
