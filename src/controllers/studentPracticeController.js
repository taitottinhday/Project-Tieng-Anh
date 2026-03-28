const renderWithLayout = require('../utils/renderHelper');
const {
  getPartPracticeCatalog,
  getReadingPracticeCatalog,
  getMockFullTestCatalog,
  buildPartPracticeExam,
  buildReadingPracticeExam,
  buildMockFullTestExam,
  serializeExamQuestions,
  getAnswerPayload,
  gradePracticeExam
} = require('../data/practiceCatalog');
const { syncStudentProfileFromUser } = require("../services/platformSupport");
const { recordFullTestSession, recordPracticeSession } = require("../services/studentActivityService");
const { gradeToeicFullTest } = require("../services/fullTestGradingService");
const { sendPublicError, sendPublicJsonError } = require("../utils/publicError");

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
    return sendPublicJsonError(res, error, statusCode, fallbackMessage);
  }

  return sendPublicError(res, error, statusCode, fallbackMessage);
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

function listMockFullTest(req, res) {
  try {
    const safeBaseUrl = getSafeBaseUrl(res);
    const library = getMockFullTestCatalog(safeBaseUrl);

    return renderWithLayout(res, 'student-practice-library', {
      title: library.title,
      library
    });
  } catch (error) {
    return respondWithError(res, error, {
      statusCode: 500,
      fallbackMessage: 'Không thể tải thư viện thi thử full test lúc này.'
    });
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

function showMockFullTestStart(req, res) {
  try {
    const safeBaseUrl = getSafeBaseUrl(res);
    const exam = buildMockFullTestExam(req.params.practiceId, safeBaseUrl);

    return renderWithLayout(res, 'student-practice-start', {
      title: exam.title,
      exam
    });
  } catch (error) {
    return respondWithError(res, error, {
      statusCode: 404,
      fallbackMessage: 'Không tìm thấy trang giới thiệu cho đề thi thử này.'
    });
  }
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

function takeMockFullTest(req, res) {
  try {
    const safeBaseUrl = getSafeBaseUrl(res);
    const exam = buildMockFullTestExam(req.params.practiceId, safeBaseUrl);

    return res.render('student-mock-test-taking', {
      pageTitle: exam.title,
      exam
    });
  } catch (error) {
    return respondWithError(res, error, {
      statusCode: 404,
      fallbackMessage: 'Không tìm thấy đề thi thử full test.'
    });
  }
}

async function submitPractice(req, res, mode) {
  try {
    const safeBaseUrl = getSafeBaseUrl(res);
    const exam = mode === 'reading'
      ? buildReadingPracticeExam(req.params.practiceId, safeBaseUrl)
      : buildPartPracticeExam(req.params.practiceId, safeBaseUrl);
    const result = await gradePracticeExam(exam, req.body || {});

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

async function submitMockFullTest(req, res) {
  try {
    const safeBaseUrl = getSafeBaseUrl(res);
    const exam = buildMockFullTestExam(req.params.practiceId, safeBaseUrl);
    const result = await gradeToeicFullTest(exam, req.body || {});
    const student = await syncStudentProfileFromUser(req.session?.user);
    const viewerName = student?.full_name || req.session?.user?.username || null;
    const viewerEmail = student?.email || req.session?.user?.email || null;
    const finalResult = {
      ...result,
      viewerName,
      viewerEmail,
      libraryHref: `${safeBaseUrl}/student/mock-tests`,
      libraryLabel: 'Thi thử Full Test',
      retryHref: `${safeBaseUrl}/student/mock-tests/${encodeURIComponent(req.params.practiceId)}`,
      sessionMode: 'student_mock_test'
    };

    req.session.lastPlacementResult = finalResult;

    if (student?.id) {
      await recordFullTestSession(student.id, finalResult);
    }

    return res.redirect(`${safeBaseUrl}/placement-tests/result/latest`);
  } catch (error) {
    return respondWithError(res, error, {
      statusCode: 400,
      fallbackMessage: 'Không thể nộp bài thi thử full test.'
    });
  }
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
  listMockFullTest,
  showPartPracticeStart,
  showReadingPracticeStart,
  showMockFullTestStart,
  takePartPractice,
  takeReadingPractice,
  takeMockFullTest,
  submitPartPractice,
  submitReadingPractice,
  submitMockFullTest,
  showLatestPracticeResult,
  listPartPracticeApi,
  listReadingPracticeApi,
  getPartQuestionsApi,
  getPartAnswersApi,
  getReadingQuestionsApi,
  getReadingAnswersApi
};
