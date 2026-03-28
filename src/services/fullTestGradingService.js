const { buildExamReviewPayload } = require("./examReviewService");

function getRecommendationByToeicScore(score) {
  if (score < 250) {
    return {
      level: "Starter",
      course: "TOEIC Foundation Starter",
      note: "Cần xây dựng lại nền tảng từ vựng, ngữ pháp và nghe hiểu cơ bản.",
    };
  }

  if (score < 450) {
    return {
      level: "Elementary",
      course: "TOEIC 450+",
      note: "Phù hợp để củng cố Part 1-5, mở rộng từ vựng công việc và luyện reading căn bản.",
    };
  }

  if (score < 650) {
    return {
      level: "Pre-Intermediate",
      course: "TOEIC 650+",
      note: "Nên đẩy mạnh chiến lược làm bài, tăng tốc độ đọc và nghe cho bài thi thật.",
    };
  }

  if (score < 850) {
    return {
      level: "Intermediate",
      course: "TOEIC 850+",
      note: "Đã có nền tảng tốt, cần luyện đề chuyên sâu và tối ưu tốc độ + độ chính xác.",
    };
  }

  return {
    level: "Advanced",
    course: "TOEIC Mastery 900+",
    note: "Phù hợp để luyện đề khó, đạt độ chính xác cao và chạm mục tiêu điểm nhóm đầu.",
  };
}

function calculateScaledSkillScore(correctCount, totalQuestions) {
  if (!totalQuestions) {
    return 0;
  }

  return Math.round((correctCount / totalQuestions) * 495);
}

async function gradeToeicFullTest(exam, body = {}) {
  const questionResults = (Array.isArray(exam.flatQuestions) ? exam.flatQuestions : []).map(
    (question) => {
      const selectedAnswer = body[question.inputName] || null;
      const correctAnswer = question.correctAnswer || null;
      const isCorrect = Boolean(selectedAnswer && correctAnswer && selectedAnswer === correctAnswer);

      return {
        number: question.number,
        skill: question.skill,
        partNumber: question.partNumber,
        selectedAnswer,
        correctAnswer,
        isCorrect,
      };
    }
  );

  const listeningResults = questionResults.filter((item) => item.skill === "listening");
  const readingResults = questionResults.filter((item) => item.skill === "reading");
  const correctCount = questionResults.filter((item) => item.isCorrect).length;
  const unansweredCount = questionResults.filter((item) => !item.selectedAnswer).length;
  const listeningCorrect = listeningResults.filter((item) => item.isCorrect).length;
  const readingCorrect = readingResults.filter((item) => item.isCorrect).length;
  const rawPracticeScore = correctCount * 5;
  const listeningScore = calculateScaledSkillScore(listeningCorrect, listeningResults.length);
  const readingScore = calculateScaledSkillScore(readingCorrect, readingResults.length);
  const toeicScore = Math.min(listeningScore + readingScore, 990);
  const recommendation = getRecommendationByToeicScore(toeicScore);
  const review = await buildExamReviewPayload(exam, questionResults, {
    furthestQuestionNumber: body && body.furthest_question_number,
  });

  return {
    examId: exam.id,
    examSlug: exam.slug || null,
    examTitle: exam.title,
    bookName: exam.bookName,
    durationMinutes: exam.durationMinutes,
    totalQuestions: exam.totalQuestions,
    correctCount,
    incorrectCount: exam.totalQuestions - correctCount - unansweredCount,
    unansweredCount,
    rawPracticeScore,
    rawPracticeMax: exam.totalQuestions * 5,
    toeicScore,
    listeningScore,
    readingScore,
    listeningCorrect,
    readingCorrect,
    listeningTotal: listeningResults.length,
    readingTotal: readingResults.length,
    recommendation,
    submittedAt: new Date().toISOString(),
    questionResults,
    review,
  };
}

module.exports = {
  calculateScaledSkillScore,
  getRecommendationByToeicScore,
  gradeToeicFullTest,
};
