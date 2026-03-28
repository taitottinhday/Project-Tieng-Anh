const testModel = require('../models/testModel');
const db = require("../models/db");
const renderWithLayout = require('../utils/renderHelper');
const { syncStudentProfileFromUser } = require("../services/platformSupport");
const { recordFullTestSession } = require("../services/studentActivityService");
const {
    getFullTestCards,
    getFullTestCollections,
    findManagedFullTestDefinition,
    loadManagedFullTest
} = require('../data/fullTestRegistry');
const { gradeToeicFullTest } = require("../services/fullTestGradingService");
const { sendPublicError } = require('../utils/publicError');

function isStudentSession(req) {
    const role = req.session?.user?.role;
    return Boolean(role && role !== 'admin' && role !== 'teacher');
}

async function hydrateSessionUser(sessionUser) {
    if (!sessionUser || !sessionUser.id) {
        return sessionUser || null;
    }

    if (sessionUser.email && sessionUser.username) {
        return sessionUser;
    }

    const [rows] = await db.query(
        "SELECT id, username, email, role FROM users WHERE id = ? LIMIT 1",
        [sessionUser.id]
    );

    return rows[0] || sessionUser;
}

async function resolveViewerContext(req) {
    const sessionUser = await hydrateSessionUser(req.session?.user || null);

    if (req.session?.user && sessionUser) {
        req.session.user = {
            ...req.session.user,
            ...sessionUser
        };
    }

    const student = sessionUser && sessionUser.role !== 'admin' && sessionUser.role !== 'teacher'
        ? await syncStudentProfileFromUser(sessionUser)
        : null;

    return {
        sessionUser,
        student,
        viewerName: student?.full_name || sessionUser?.username || null,
        viewerEmail: student?.email || sessionUser?.email || null
    };
}

function getLegacyRecommendation(score, totalQuestions) {
    const percent = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;

    if (percent < 40) {
        return {
            level: 'Beginner',
            course: 'General English A1/A2'
        };
    }

    if (percent < 70) {
        return {
            level: 'Elementary - Pre Intermediate',
            course: 'TOEIC 450+'
        };
    }

    return {
        level: 'Intermediate',
        course: 'IELTS Foundation'
    };
}

function buildStartPageTest(config, baseUrl = '') {
    const safeBaseUrl = baseUrl || '';
    const durationMinutes = Number(config.durationMinutes || 120);
    const totalQuestions = Number(config.totalQuestions || 0);
    const partsCount = Number(config.partsCount || 7);
    const maxScore = Number(config.maxScore || 990);

    return {
        id: String(config.id),
        title: config.title || 'TOEIC Full Test',
        description: config.description || 'Bấm vào nút bắt đầu thi để vào trang làm bài.',
        badgeLabel: config.badgeLabel || config.bookName || 'ETS',
        bookName: config.bookName || config.badgeLabel || 'ETS',
        accessLabel: config.accessLabel || 'Free',
        durationMinutes,
        totalQuestions,
        partsCount,
        maxScore,
        statusText: config.statusText || 'Đề thi đã sẵn sàng.',
        isDemo: Boolean(config.isDemo),
        isLegacy: Boolean(config.isLegacy),
        listeningCount: Number(config.listeningCount || 0),
        readingCount: Number(config.readingCount || 0),
        startHref: `${safeBaseUrl}/placement-tests/${encodeURIComponent(config.id)}/take`,
        listHref: `${safeBaseUrl}/placement-tests`
    };
}

function buildManagedStartPageTest(definition, baseUrl = '') {
    return buildStartPageTest({
        id: definition.id,
        title: definition.title,
        description: definition.description,
        badgeLabel: definition.badgeLabel,
        bookName: definition.badgeLabel,
        accessLabel: definition.accessLabel,
        durationMinutes: definition.durationMinutes,
        totalQuestions: definition.totalQuestions,
        partsCount: definition.partsCount,
        maxScore: definition.maxScore,
        statusText: definition.statusText,
        isDemo: definition.isDemo
    }, baseUrl);
}

function buildLegacyStartPageTest(test, questions, baseUrl = '') {
    const listeningCount = questions.filter((question) => question.skill_type === 'listening').length;
    const readingCount = questions.filter((question) => question.skill_type === 'reading').length;

    return buildStartPageTest({
        id: String(test.id),
        title: test.title,
        description: test.description || 'Bài test sẽ mở sau khi bạn nhấn bắt đầu.',
        badgeLabel: test.category_name || 'Placement',
        bookName: test.category_name || 'Placement',
        durationMinutes: Number(test.duration_minutes || 45),
        totalQuestions: questions.length,
        partsCount: listeningCount && readingCount ? 2 : 1,
        maxScore: questions.length ? questions.length * 5 : 0,
        statusText: 'Bài test đã sẵn sàng. Bấm bắt đầu để vào trang làm bài.',
        listeningCount,
        readingCount,
        isLegacy: true
    }, baseUrl);
}

async function listTests(req, res) {
    try {
        const safeBaseUrl = res.locals.baseUrl || '';
        const tests = getFullTestCards(safeBaseUrl);
        const collections = getFullTestCollections(tests);

        return renderWithLayout(res, 'placement-tests', {
            title: 'Thi thử Full Test',
            pageTitle: 'Tổng hợp đề thi',
            tests,
            collections,
            totalTests: tests.length,
            activeTests: tests.filter((test) => test.isAvailable).length,
            pendingTests: tests.filter((test) => !test.isAvailable).length
        });
    } catch (error) {
        console.error('listTests error:', error);
        return sendPublicError(res, error, 500, 'Không thể tải danh sách bài test lúc này.');
    }
}

async function showTest(req, res) {
    try {
        const testId = req.params.id;
        const safeBaseUrl = res.locals.baseUrl || '';
        const managedDefinition = findManagedFullTestDefinition(testId);

        if (managedDefinition) {
            const test = buildManagedStartPageTest(managedDefinition, safeBaseUrl);

            return renderWithLayout(res, 'test-start', {
                title: test.title,
                pageTitle: test.title,
                test
            });
        }

        const test = await testModel.getTestById(testId);

        if (!test || !test.is_public || !test.is_active) {
            return res.status(404).send('Không tìm thấy bài test');
        }

        const questions = await testModel.getQuestionsByTestId(testId);
        const previewTest = buildLegacyStartPageTest(test, questions, safeBaseUrl);

        return renderWithLayout(res, 'test-start', {
            title: previewTest.title,
            pageTitle: previewTest.title,
            test: previewTest
        });
    } catch (error) {
        console.error('showTest error:', error);
        return sendPublicError(res, error, 500, 'Không thể tải bài test lúc này.');
    }
}

async function takeTest(req, res) {
    try {
        const testId = req.params.id;
        const managedExam = loadManagedFullTest(testId);

        if (managedExam) {
            return res.render('test-taking', {
                pageTitle: managedExam.title,
                exam: managedExam
            });
        }

        const test = await testModel.getTestById(testId);

        if (!test || !test.is_public || !test.is_active) {
            return res.status(404).send('Không tìm thấy bài test');
        }

        const questions = await testModel.getQuestionsByTestId(testId);

        return res.render('test-taking', {
            pageTitle: test.title,
            exam: {
                id: String(test.id),
                title: test.title,
                bookName: test.category_name || 'Placement',
                durationMinutes: Number(test.duration_minutes || 45),
                totalQuestions: questions.length,
                listeningCount: questions.filter((question) => question.skill_type === 'listening').length,
                readingCount: questions.filter((question) => question.skill_type === 'reading').length,
                partSummary: [],
                groups: [],
                flatQuestions: [],
                isDemo: false,
                isLegacy: true
            }
        });
    } catch (error) {
        console.error('takeTest error:', error);
        return sendPublicError(res, error, 500, 'Không thể tải bài test lúc này.');
    }
}

async function submitTest(req, res) {
    try {
        const testId = req.params.id;
        const { guest_name, guest_email } = req.body || {};
        const managedExam = loadManagedFullTest(testId);
        const { student, viewerName, viewerEmail } = await resolveViewerContext(req);

        if (managedExam) {
            const result = await gradeToeicFullTest(managedExam, req.body || {});

            req.session.lastPlacementResult = {
                ...result,
                guestName: guest_name || null,
                guestEmail: guest_email || null,
                viewerName,
                viewerEmail
            };

            if (student?.id) {
                await recordFullTestSession(student.id, result);
            }

            return res.redirect('/placement-tests/result/latest');
        }

        const test = await testModel.getTestById(testId);
        if (!test) {
            return res.status(404).send('Bài test không tồn tại');
        }

        const questions = await testModel.getListeningQuestionsByTestId(testId);

        const attemptId = await testModel.createAttempt({
            testId,
            guestName: guest_name || null,
            guestEmail: guest_email || null
        });

        let totalScore = 0;

        for (const question of questions) {
            const selectedOptionId = req.body[`question_${question.id}`];
            const correctOption = await testModel.getCorrectOption(question.id);
            const isCorrect = correctOption && Number(correctOption.id) === Number(selectedOptionId);
            const score = isCorrect ? Number(question.points) : 0;
            totalScore += score;

            await testModel.saveAnswer({
                attemptId,
                questionId: question.id,
                selectedOptionId: selectedOptionId || null,
                isCorrect,
                score
            });
        }

        const recommendation = getLegacyRecommendation(totalScore, questions.length);

        await testModel.updateAttemptResult({
            attemptId,
            score: totalScore,
            recommendedLevel: recommendation.level,
            recommendedCourse: recommendation.course
        });

        if (student?.id) {
            await recordFullTestSession(student.id, {
                examId: String(testId),
                examTitle: test.title,
                bookName: test.category_name || 'Placement',
                toeicScore: totalScore,
                correctCount: 0,
                incorrectCount: 0,
                unansweredCount: 0,
                totalQuestions: questions.length,
                submittedAt: new Date().toISOString(),
                recommendation
            });
        }

        res.redirect(`/placement-tests/result/${attemptId}`);
    } catch (error) {
        console.error('submitTest error FULL:', error);
        return sendPublicError(res, error, 500, 'Không thể nộp bài test lúc này.');
    }
}

async function showResult(req, res) {
    try {
        const { sessionUser, viewerName, viewerEmail } = await resolveViewerContext(req);

        if (req.session && req.session.lastPlacementResult) {
            return res.render('test-result', {
                pageTitle: 'Kết quả TOEIC placement',
                user: sessionUser,
                studentName: viewerName,
                result: {
                    ...req.session.lastPlacementResult,
                    viewerName,
                    viewerEmail
                }
            });
        }

        const attemptId = req.params.attemptId;
        const attempt = await testModel.getAttemptById(attemptId);

        if (!attempt) {
            return res.status(404).send('Không tìm thấy kết quả');
        }

        res.render('test-result', {
            pageTitle: 'Kết quả bài test',
            user: sessionUser,
            studentName: viewerName,
            result: {
                toeicScore: attempt.score,
                recommendation: {
                    level: attempt.recommended_level || 'Chưa xác định',
                    course: attempt.recommended_course || 'Chưa có gợi ý',
                    note: ''
                },
                examTitle: attempt.test_title,
                correctCount: 0,
                totalQuestions: 0,
                rawPracticeScore: attempt.score,
                rawPracticeMax: attempt.score,
                listeningScore: 0,
                readingScore: 0,
                guestName: attempt.guest_name || null,
                guestEmail: attempt.guest_email || null,
                bookName: 'Placement',
                durationMinutes: 0,
                listeningCorrect: 0,
                readingCorrect: 0,
                listeningTotal: 0,
                readingTotal: 0,
                unansweredCount: 0,
                incorrectCount: 0,
                viewerName,
                viewerEmail
            }
        });
    } catch (error) {
        console.error('showResult error:', error);
        return sendPublicError(res, error, 500, 'Không thể tải kết quả bài test lúc này.');
    }
}

module.exports = {
    listTests,
    showTest,
    takeTest,
    submitTest,
    showResult
};
