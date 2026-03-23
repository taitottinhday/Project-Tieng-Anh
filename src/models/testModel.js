const db = require('../config/db');

async function getPublicPlacementTests() {
    const [rows] = await db.query(`
    SELECT t.*, tc.name AS category_name, tc.slug AS category_slug
    FROM tests t
    JOIN test_categories tc ON t.category_id = tc.id
    WHERE t.is_public = 1
      AND t.is_active = 1
      AND tc.slug = 'placement'
    ORDER BY t.id DESC
  `);

    return rows;
}

async function getTestById(testId) {
    const [rows] = await db.query(`
    SELECT t.*, tc.name AS category_name, tc.slug AS category_slug
    FROM tests t
    JOIN test_categories tc ON t.category_id = tc.id
    WHERE t.id = ?
    LIMIT 1
  `, [testId]);

    return rows[0];
}

async function attachOptionsToQuestions(questions) {
    await Promise.all(
        questions.map(async (question) => {
            const [options] = await db.query(`
      SELECT id, question_id, option_label, option_text
      FROM question_options
      WHERE question_id = ?
      ORDER BY id ASC
    `, [question.id]);

            question.options = options;
        })
    );

    return questions;
}

async function getQuestionsByTestId(testId) {
    const [questions] = await db.query(`
    SELECT *
    FROM questions
    WHERE test_id = ?
    ORDER BY question_order ASC, id ASC
  `, [testId]);

    return attachOptionsToQuestions(questions);
}

async function getListeningQuestionsByTestId(testId) {
    const [questions] = await db.query(`
    SELECT *
    FROM questions
    WHERE test_id = ?
      AND skill_type = 'listening'
    ORDER BY question_order ASC, id ASC
  `, [testId]);

    return attachOptionsToQuestions(questions);
}

async function createAttempt({ testId, guestName, guestEmail, userId = null }) {
    const [result] = await db.query(`
    INSERT INTO test_attempts (
      test_id, user_id, guest_name, guest_email, started_at, status
    ) VALUES (?, ?, ?, ?, NOW(), 'in_progress')
  `, [testId, userId, guestName, guestEmail]);

    return result.insertId;
}

async function getCorrectOption(questionId) {
    const [rows] = await db.query(`
    SELECT id
    FROM question_options
    WHERE question_id = ? AND is_correct = 1
    LIMIT 1
  `, [questionId]);

    return rows[0];
}

async function getQuestionById(questionId) {
    const [rows] = await db.query(`
    SELECT *
    FROM questions
    WHERE id = ?
    LIMIT 1
  `, [questionId]);

    return rows[0];
}

async function saveAnswer({ attemptId, questionId, selectedOptionId, isCorrect, score }) {
    await db.query(`
    INSERT INTO attempt_answers (
      attempt_id, question_id, selected_option_id, is_correct, score
    ) VALUES (?, ?, ?, ?, ?)
  `, [attemptId, questionId, selectedOptionId, isCorrect ? 1 : 0, score]);
}

async function updateAttemptResult({ attemptId, score, recommendedLevel, recommendedCourse }) {
    await db.query(`
    UPDATE test_attempts
    SET score = ?,
        status = 'submitted',
        submitted_at = NOW(),
        recommended_level = ?,
        recommended_course = ?
    WHERE id = ?
  `, [score, recommendedLevel, recommendedCourse, attemptId]);
}

async function getAttemptById(attemptId) {
    const [rows] = await db.query(`
    SELECT ta.*, t.title AS test_title, t.description AS test_description
    FROM test_attempts ta
    JOIN tests t ON ta.test_id = t.id
    WHERE ta.id = ?
    LIMIT 1
  `, [attemptId]);

    return rows[0];
}
async function getStructuredQuestionsByTestId(testId) {
    const questions = await getQuestionsByTestId(testId);

    const listeningQuestions = questions.filter(q => q.skill_type === 'listening');
    const readingQuestions = questions.filter(q => q.skill_type === 'reading');

    return {
        listeningQuestions,
        readingQuestions,
        allQuestions: questions
    };
}
module.exports = {
    getPublicPlacementTests,
    getTestById,
    getQuestionsByTestId,
    getListeningQuestionsByTestId,
    getStructuredQuestionsByTestId,
    createAttempt,
    getCorrectOption,
    saveAnswer,
    updateAttemptResult,
    getAttemptById
};
