const testModel = require('../models/testModel');
const renderWithLayout = require('../utils/renderHelper');
const {
    getFullTestCards,
    getFullTestCollections,
    findManagedFullTestDefinition,
    loadManagedFullTest
} = require('../data/fullTestRegistry');

function getRecommendationByToeicScore(score) {
    if (score < 250) {
        return {
            level: 'Starter',
            course: 'TOEIC Foundation Starter',
            note: 'Can xay dung lai nen tang tu vung, ngu phap va nghe hieu co ban.'
        };
    }

    if (score < 450) {
        return {
            level: 'Elementary',
            course: 'TOEIC 450+',
            note: 'Phu hop de cung co Part 1-5, mo rong tu vung cong viec va luyen reading can ban.'
        };
    }

    if (score < 650) {
        return {
            level: 'Pre-Intermediate',
            course: 'TOEIC 650+',
            note: 'Nen day manh chien luoc lam bai, tang toc do doc va nghe cho bai thi that.'
        };
    }

    if (score < 850) {
        return {
            level: 'Intermediate',
            course: 'TOEIC 850+',
            note: 'Da co nen tang tot, can luyen de chuyen sau va toi uu toc do + do chinh xac.'
        };
    }

    return {
        level: 'Advanced',
        course: 'TOEIC Mastery 900+',
        note: 'Phu hop de luyen de kho, cham chinh xac cao va dat muc tieu diem nhom dau.'
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

function calculateScaledSkillScore(correctCount, totalQuestions) {
    if (!totalQuestions) {
        return 0;
    }

    return Math.round((correctCount / totalQuestions) * 495);
}

function gradeToeicPlacementExam(exam, body) {
    const questionResults = exam.flatQuestions.map((question) => {
        const selectedAnswer = body[question.inputName] || null;
        const correctAnswer = question.correctAnswer;
        const isCorrect = Boolean(selectedAnswer && correctAnswer && selectedAnswer === correctAnswer);

        return {
            number: question.number,
            skill: question.skill,
            partNumber: question.partNumber,
            selectedAnswer,
            correctAnswer,
            isCorrect
        };
    });

    const listeningResults = questionResults.filter((item) => item.skill === 'listening');
    const readingResults = questionResults.filter((item) => item.skill === 'reading');
    const correctCount = questionResults.filter((item) => item.isCorrect).length;
    const unansweredCount = questionResults.filter((item) => !item.selectedAnswer).length;
    const listeningCorrect = listeningResults.filter((item) => item.isCorrect).length;
    const readingCorrect = readingResults.filter((item) => item.isCorrect).length;
    const rawPracticeScore = correctCount * 5;
    const listeningScore = calculateScaledSkillScore(listeningCorrect, listeningResults.length);
    const readingScore = calculateScaledSkillScore(readingCorrect, readingResults.length);
    const toeicScore = Math.min(listeningScore + readingScore, 990);
    const recommendation = getRecommendationByToeicScore(toeicScore);

    return {
        examId: exam.id,
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
        questionResults
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
        res.status(500).send(`Lỗi khi tải danh sách bài test: ${error.message}`);
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
        res.status(500).send(`Lỗi khi tải bài test: ${error.message}`);
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
        res.status(500).send(`Lỗi khi tải bài test: ${error.message}`);
    }
}

async function submitTest(req, res) {
    try {
        const testId = req.params.id;
        const { guest_name, guest_email } = req.body || {};
        const managedExam = loadManagedFullTest(testId);

        if (managedExam) {
            const result = gradeToeicPlacementExam(managedExam, req.body || {});

            req.session.lastPlacementResult = {
                ...result,
                guestName: guest_name || null,
                guestEmail: guest_email || null
            };

            return res.redirect('/placement-tests/result/latest');
        }

        const test = await testModel.getTestById(testId);
        if (!test) {
            return res.status(404).send('Bai test khong ton tai');
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

        res.redirect(`/placement-tests/result/${attemptId}`);
    } catch (error) {
        console.error('submitTest error FULL:', error);
        res.status(500).send(`Loi khi nop bai test: ${error.message}`);
    }
}

async function showResult(req, res) {
    try {
        if (req.session && req.session.lastPlacementResult) {
            return res.render('test-result', {
                pageTitle: 'Ket qua TOEIC placement',
                result: req.session.lastPlacementResult
            });
        }

        const attemptId = req.params.attemptId;
        const attempt = await testModel.getAttemptById(attemptId);

        if (!attempt) {
            return res.status(404).send('Không tìm thấy kết quả');
        }

        res.render('test-result', {
            pageTitle: 'Kết quả bài test',
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
                incorrectCount: 0
            }
        });
    } catch (error) {
        console.error('showResult error:', error);
        res.status(500).send(`Loi khi tai ket qua: ${error.message}`);
    }
}

module.exports = {
    listTests,
    showTest,
    takeTest,
    submitTest,
    showResult
};
