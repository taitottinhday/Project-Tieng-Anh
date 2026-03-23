const db = require("../models/db");
const { ensurePlatformSupport } = require("./platformSupport");

let studentActivityReady = false;

function normalizeBaseUrl(baseUrl) {
  if (!baseUrl || baseUrl === "/") {
    return "";
  }

  return String(baseUrl).replace(/\/+$/, "");
}

function safeStringify(payload) {
  try {
    return JSON.stringify(payload || {});
  } catch (error) {
    return "{}";
  }
}

function safeParse(payload) {
  if (!payload) {
    return null;
  }

  try {
    return JSON.parse(payload);
  } catch (error) {
    return null;
  }
}

function toDate(value) {
  if (!value) {
    return new Date();
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function toInt(value, fallback = 0) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? Math.round(numericValue) : fallback;
}

async function ensureStudentActivitySupport() {
  if (studentActivityReady) {
    return;
  }

  await ensurePlatformSupport();

  await db.query(`
    CREATE TABLE IF NOT EXISTS student_learning_sessions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT NOT NULL,
      activity_type ENUM('full_test','practice','dictation') NOT NULL,
      session_token VARCHAR(191) NULL,
      activity_key VARCHAR(191) NULL,
      secondary_key VARCHAR(191) NULL,
      title VARCHAR(255) NOT NULL,
      subtitle VARCHAR(255) NULL,
      source_label VARCHAR(255) NULL,
      badge_label VARCHAR(80) NULL,
      status_label VARCHAR(80) NOT NULL DEFAULT 'Hoàn thành',
      score_value INT NULL,
      score_max INT NULL,
      accuracy INT NULL,
      correct_count INT NULL,
      incorrect_count INT NULL,
      unanswered_count INT NULL,
      completed_count INT NULL,
      skipped_count INT NULL,
      total_count INT NULL,
      reset_count INT NOT NULL DEFAULT 0,
      payload LONGTEXT NULL,
      submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_student_learning_sessions_student FOREIGN KEY (student_id) REFERENCES students(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
      UNIQUE KEY uniq_student_learning_sessions_token (student_id, session_token),
      INDEX idx_student_learning_sessions_student_type (student_id, activity_type),
      INDEX idx_student_learning_sessions_student_date (student_id, submitted_at)
    )
  `);

  studentActivityReady = true;
}

async function recordFullTestSession(studentId, result = {}) {
  await ensureStudentActivitySupport();

  if (!studentId || !result.examTitle) {
    return null;
  }

  const accuracy = result.totalQuestions
    ? Math.round((toInt(result.correctCount) / Math.max(toInt(result.totalQuestions), 1)) * 100)
    : null;

  const [insertResult] = await db.query(
    `
      INSERT INTO student_learning_sessions (
        student_id,
        activity_type,
        activity_key,
        title,
        subtitle,
        source_label,
        badge_label,
        status_label,
        score_value,
        score_max,
        accuracy,
        correct_count,
        incorrect_count,
        unanswered_count,
        total_count,
        payload,
        submitted_at
      ) VALUES (?, 'full_test', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      studentId,
      result.examId || null,
      result.examTitle,
      result.bookName || null,
      result.bookName || null,
      "Full Test",
      "Hoàn thành",
      toInt(result.toeicScore),
      990,
      accuracy,
      toInt(result.correctCount),
      toInt(result.incorrectCount),
      toInt(result.unansweredCount),
      toInt(result.totalQuestions),
      safeStringify(result),
      toDate(result.submittedAt),
    ]
  );

  return insertResult.insertId || null;
}

async function recordPracticeSession(studentId, result = {}) {
  await ensureStudentActivitySupport();

  if (!studentId || !result.id || !result.title) {
    return null;
  }

  const badgeLabel = result.mode === "reading" ? "Reading" : "By Part";

  const [insertResult] = await db.query(
    `
      INSERT INTO student_learning_sessions (
        student_id,
        activity_type,
        activity_key,
        title,
        subtitle,
        source_label,
        badge_label,
        status_label,
        score_value,
        score_max,
        accuracy,
        correct_count,
        incorrect_count,
        unanswered_count,
        total_count,
        payload,
        submitted_at
      ) VALUES (?, 'practice', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      studentId,
      result.id,
      result.title,
      result.subtitle || result.modeLabel || null,
      result.sourceLabel || null,
      badgeLabel,
      "Hoàn thành",
      toInt(result.rawScore),
      toInt(result.rawMax),
      toInt(result.accuracy),
      toInt(result.correctCount),
      toInt(result.incorrectCount),
      toInt(result.unansweredCount),
      toInt(result.totalQuestions),
      safeStringify(result),
      toDate(result.submittedAt),
    ]
  );

  return insertResult.insertId || null;
}

async function upsertDictationSession(studentId, session = {}) {
  await ensureStudentActivitySupport();

  if (!studentId || !session.sessionToken || !session.lessonId || !session.topicId) {
    return null;
  }

  await db.query(
    `
      INSERT INTO student_learning_sessions (
        student_id,
        activity_type,
        session_token,
        activity_key,
        secondary_key,
        title,
        subtitle,
        source_label,
        badge_label,
        status_label,
        score_value,
        score_max,
        accuracy,
        correct_count,
        completed_count,
        skipped_count,
        total_count,
        reset_count,
        payload,
        submitted_at
      ) VALUES (?, 'dictation', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        id = LAST_INSERT_ID(id),
        activity_key = VALUES(activity_key),
        secondary_key = VALUES(secondary_key),
        title = VALUES(title),
        subtitle = VALUES(subtitle),
        source_label = VALUES(source_label),
        badge_label = VALUES(badge_label),
        status_label = VALUES(status_label),
        score_value = VALUES(score_value),
        score_max = VALUES(score_max),
        accuracy = VALUES(accuracy),
        correct_count = VALUES(correct_count),
        completed_count = VALUES(completed_count),
        skipped_count = VALUES(skipped_count),
        total_count = VALUES(total_count),
        reset_count = VALUES(reset_count),
        payload = VALUES(payload)
    `,
    [
      studentId,
      session.sessionToken,
      session.lessonId,
      session.topicId,
      session.lessonTitle || "Dictation Lesson",
      session.topicTitle || null,
      session.categoryLabel || null,
      "Dictation",
      session.statusLabel || "Chưa hoàn thành",
      toInt(session.correctCount),
      toInt(session.totalCount),
      toInt(session.accuracy),
      toInt(session.correctCount),
      toInt(session.completedCount),
      toInt(session.skippedCount),
      toInt(session.totalCount),
      toInt(session.resetCount),
      safeStringify(session),
      toDate(session.startedAt || session.lastActivityAt),
    ]
  );

  return true;
}

function buildSessionAction(session, baseUrl = "") {
  const safeBaseUrl = normalizeBaseUrl(baseUrl);
  const payload = session.payloadData || {};

  if (session.activity_type === "full_test") {
    return {
      href: session.activity_key
        ? `${safeBaseUrl}/placement-tests/${encodeURIComponent(session.activity_key)}`
        : `${safeBaseUrl}/placement-tests`,
      label: "Mở lại",
    };
  }

  if (session.activity_type === "practice") {
    const mode = payload.mode === "reading" ? "reading" : "parts";
    return {
      href: session.activity_key
        ? `${safeBaseUrl}/student/practice/${mode}/${encodeURIComponent(session.activity_key)}`
        : `${safeBaseUrl}/student/practice/${mode}`,
      label: "Mở lại",
    };
  }

  return {
    href: session.secondary_key && session.activity_key
      ? `${safeBaseUrl}/student/dictation/${encodeURIComponent(session.secondary_key)}/${encodeURIComponent(session.activity_key)}`
      : `${safeBaseUrl}/student/dictation`,
    label: "Mở lại",
  };
}

function mapSessionRow(row, baseUrl = "") {
  const payloadData = safeParse(row.payload);
  const action = buildSessionAction({ ...row, payloadData }, baseUrl);

  return {
    id: row.id,
    activityType: row.activity_type,
    activityKey: row.activity_key,
    secondaryKey: row.secondary_key,
    sessionToken: row.session_token,
    title: row.title,
    subtitle: row.subtitle,
    sourceLabel: row.source_label,
    badgeLabel: row.badge_label,
    statusLabel: row.status_label,
    scoreValue: row.score_value,
    scoreMax: row.score_max,
    accuracy: row.accuracy,
    correctCount: row.correct_count,
    incorrectCount: row.incorrect_count,
    unansweredCount: row.unanswered_count,
    completedCount: row.completed_count,
    skippedCount: row.skipped_count,
    totalCount: row.total_count,
    resetCount: row.reset_count,
    submittedAt: row.submitted_at,
    updatedAt: row.updated_at,
    payloadData,
    actionHref: action.href,
    actionLabel: action.label,
  };
}

async function getStudentActivityProfile(studentId, baseUrl = "") {
  await ensureStudentActivitySupport();

  const [[studentSummary]] = await db.query(
    `
      SELECT
        s.*,
        COUNT(DISTINCT e.id) AS enrollment_count,
        COUNT(DISTINCT CASE WHEN e.status = 'active' THEN e.id END) AS active_enrollment_count,
        COUNT(DISTINCT sls.id) AS activity_count
      FROM students s
      LEFT JOIN enrollments e ON e.student_id = s.id
      LEFT JOIN student_learning_sessions sls ON sls.student_id = s.id
      WHERE s.id = ?
      GROUP BY s.id
      LIMIT 1
    `,
    [studentId]
  );

  const [rows] = await db.query(
    `
      SELECT *
      FROM student_learning_sessions
      WHERE student_id = ?
      ORDER BY updated_at DESC, submitted_at DESC, id DESC
      LIMIT 200
    `,
    [studentId]
  );

  const sessions = rows.map((row) => mapSessionRow(row, baseUrl));

  return {
    studentSummary: studentSummary || null,
    examSessions: sessions.filter((item) => item.activityType === "full_test" || item.activityType === "practice"),
    dictationSessions: sessions.filter((item) => item.activityType === "dictation"),
    allSessions: sessions,
  };
}

module.exports = {
  ensureStudentActivitySupport,
  getStudentActivityProfile,
  recordFullTestSession,
  recordPracticeSession,
  upsertDictationSession,
};
