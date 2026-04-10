const db = require("../models/db");
const { ensureStudentActivitySupport, getStudentActivityProfile } = require("./studentActivityService");
const {
  assertTeacherPermission,
  getClassroomCollaborationData,
  listClassLiveSessions,
} = require("./classroomCollaborationService");

function toNumber(value, fallback = 0) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
}

function toNullableNumber(value) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function round(value) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? Math.round(numericValue) : 0;
}

function average(values = []) {
  const numericValues = values.filter((value) => Number.isFinite(Number(value))).map(Number);
  if (!numericValues.length) {
    return null;
  }

  return numericValues.reduce((sum, value) => sum + value, 0) / numericValues.length;
}

function weightedAverage(items = []) {
  let totalWeight = 0;
  let weightedSum = 0;

  items.forEach((item) => {
    const numericValue = Number(item.value);
    const numericWeight = Number(item.weight || 0);
    if (!Number.isFinite(numericValue) || !numericWeight) {
      return;
    }

    totalWeight += numericWeight;
    weightedSum += numericValue * numericWeight;
  });

  return totalWeight ? weightedSum / totalWeight : null;
}

function percent(numerator, denominator) {
  if (!denominator) {
    return null;
  }

  return clamp((Number(numerator || 0) / Math.max(Number(denominator || 0), 1)) * 100);
}

function normalizeTeacherScore(score) {
  const numericScore = toNullableNumber(score);
  if (numericScore === null) {
    return null;
  }

  if (numericScore <= 10) {
    return clamp(numericScore * 10);
  }

  if (numericScore <= 20) {
    return clamp(numericScore * 5);
  }

  return clamp(numericScore);
}

function toDateValue(value) {
  const parsed = new Date(value || 0);
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
}

function getDaysSince(value) {
  const timestamp = toDateValue(value);
  if (!timestamp) {
    return null;
  }

  return Math.max(0, Math.floor((Date.now() - timestamp) / (24 * 60 * 60 * 1000)));
}

function compositeKey(studentId, classId = 0) {
  return `${Number(studentId || 0)}:${Number(classId || 0)}`;
}

function groupRowsByStudent(rows = []) {
  return rows.reduce((accumulator, row) => {
    const studentId = Number(row.student_id || 0);
    if (!studentId) {
      return accumulator;
    }

    if (!accumulator.has(studentId)) {
      accumulator.set(studentId, []);
    }

    accumulator.get(studentId).push(row);
    return accumulator;
  }, new Map());
}

function mapRowsByComposite(rows = []) {
  return rows.reduce((accumulator, row) => {
    accumulator.set(compositeKey(row.student_id, row.class_id), row);
    return accumulator;
  }, new Map());
}

function buildLatestMap(rows = []) {
  return rows.reduce((accumulator, row) => {
    const key = compositeKey(row.student_id, row.class_id);
    if (!accumulator.has(key)) {
      accumulator.set(key, row);
    }
    return accumulator;
  }, new Map());
}

function aggregateAttendanceRows(rows = []) {
  return rows.reduce(
    (summary, row) => {
      summary.total += toNumber(row.total);
      summary.present_count += toNumber(row.present_count);
      summary.absent_count += toNumber(row.absent_count);
      summary.late_count += toNumber(row.late_count);
      summary.excused_count += toNumber(row.excused_count);
      summary.last_attendance_at = toDateValue(row.last_attendance_at) > toDateValue(summary.last_attendance_at)
        ? row.last_attendance_at
        : summary.last_attendance_at;
      return summary;
    },
    {
      total: 0,
      present_count: 0,
      absent_count: 0,
      late_count: 0,
      excused_count: 0,
      last_attendance_at: null,
    }
  );
}

function aggregateSubmissionRows(rows = []) {
  return rows.reduce(
    (summary, row) => {
      const normalizedReviewScore = normalizeTeacherScore(row.average_teacher_score);
      summary.total += toNumber(row.total);
      summary.assigned_count += toNumber(row.assigned_count);
      summary.turned_in_count += toNumber(row.turned_in_count);
      summary.completed_count += toNumber(row.completed_count);
      summary.reviewed_count += toNumber(row.reviewed_count);
      summary.on_time_count += toNumber(row.on_time_count);
      if (normalizedReviewScore !== null) {
        summary.reviewScoreSamples.push(normalizedReviewScore);
      }
      summary.last_submission_at = toDateValue(row.last_submission_at) > toDateValue(summary.last_submission_at)
        ? row.last_submission_at
        : summary.last_submission_at;
      return summary;
    },
    {
      total: 0,
      assigned_count: 0,
      turned_in_count: 0,
      completed_count: 0,
      reviewed_count: 0,
      on_time_count: 0,
      reviewScoreSamples: [],
      last_submission_at: null,
    }
  );
}

function aggregateCommentRows(rows = []) {
  return rows.reduce(
    (summary, row) => {
      summary.comment_count += toNumber(row.comment_count);
      summary.last_comment_at = toDateValue(row.last_comment_at) > toDateValue(summary.last_comment_at)
        ? row.last_comment_at
        : summary.last_comment_at;
      return summary;
    },
    {
      comment_count: 0,
      last_comment_at: null,
    }
  );
}

function buildLearningSummary(sessions = []) {
  const safeSessions = Array.isArray(sessions) ? sessions : [];
  const sortedSessions = [...safeSessions].sort((a, b) => {
    return toDateValue(b.submitted_at || b.updated_at) - toDateValue(a.submitted_at || a.updated_at);
  });

  const byType = {
    full_test: [],
    practice: [],
    dictation: [],
  };

  const activeDays = new Set();
  const now = Date.now();
  const last30DaysMs = 30 * 24 * 60 * 60 * 1000;

  sortedSessions.forEach((session) => {
    const type = String(session.activity_type || "");
    if (byType[type]) {
      byType[type].push(session);
    }

    const activityTime = toDateValue(session.submitted_at || session.updated_at);
    if (activityTime && now - activityTime <= last30DaysMs) {
      activeDays.add(new Date(activityTime).toISOString().slice(0, 10));
    }
  });

  const practiceAccuracy = average(byType.practice.map((item) => toNullableNumber(item.accuracy)).filter((value) => value !== null));
  const dictationAccuracy = average(byType.dictation.map((item) => toNullableNumber(item.accuracy)).filter((value) => value !== null));
  const fullTestAccuracy = average(byType.full_test.map((item) => toNullableNumber(item.accuracy)).filter((value) => value !== null));
  const allAccuracy = average(sortedSessions.map((item) => toNullableNumber(item.accuracy)).filter((value) => value !== null));

  const learningScore = weightedAverage([
    { value: fullTestAccuracy, weight: 0.4 },
    { value: practiceAccuracy, weight: 0.35 },
    { value: dictationAccuracy, weight: 0.25 },
    { value: allAccuracy, weight: 0.2 },
  ]);

  const timelineSamples = sortedSessions
    .map((session) => {
      const accuracy = toNullableNumber(session.accuracy);
      const scoreValue = toNullableNumber(session.score_value);
      const scoreMax = toNullableNumber(session.score_max);
      const normalizedScore = scoreValue !== null && scoreMax !== null && scoreMax > 0
        ? clamp((scoreValue / scoreMax) * 100)
        : normalizeTeacherScore(scoreValue);

      return {
        submitted_at: session.submitted_at || session.updated_at || null,
        value: accuracy !== null ? accuracy : normalizedScore,
      };
    })
    .filter((item) => item.value !== null);

  const recentSamples = timelineSamples.slice(0, 3).map((item) => item.value);
  const previousSamples = timelineSamples.slice(3, 6).map((item) => item.value);
  const trendDelta = recentSamples.length && previousSamples.length
    ? average(recentSamples) - average(previousSamples)
    : 0;

  let trendKey = "stable";
  let trendLabel = "Ổn định";
  if (trendDelta >= 5) {
    trendKey = "improving";
    trendLabel = "Đang cải thiện";
  } else if (trendDelta <= -5) {
    trendKey = "declining";
    trendLabel = "Đang giảm nhịp";
  }

  const fullTestScores = byType.full_test
    .map((item) => toNullableNumber(item.score_value))
    .filter((value) => value !== null);

  return {
    totalSessions: sortedSessions.length,
    activeDaysLast30: activeDays.size,
    lastActivityAt: sortedSessions[0]
      ? (sortedSessions[0].submitted_at || sortedSessions[0].updated_at || null)
      : null,
    learningScore: learningScore === null ? null : clamp(learningScore),
    trendKey,
    trendLabel,
    practiceAccuracy: practiceAccuracy === null ? null : round(practiceAccuracy),
    dictationAccuracy: dictationAccuracy === null ? null : round(dictationAccuracy),
    fullTestAccuracy: fullTestAccuracy === null ? null : round(fullTestAccuracy),
    fullTestBestScore: fullTestScores.length ? Math.max(...fullTestScores) : null,
    fullTestLatestScore: fullTestScores[0] || null,
    byType: {
      fullTestCount: byType.full_test.length,
      practiceCount: byType.practice.length,
      dictationCount: byType.dictation.length,
    },
  };
}

function buildAttendanceMetrics(summary = {}) {
  const total = toNumber(summary.total);
  const presentCount = toNumber(summary.present_count);
  const lateCount = toNumber(summary.late_count);
  const excusedCount = toNumber(summary.excused_count);
  const absentCount = toNumber(summary.absent_count);

  const attendanceScore = total
    ? clamp(((presentCount + lateCount * 0.75 + excusedCount * 0.6) / total) * 100)
    : null;

  return {
    total,
    presentCount,
    lateCount,
    excusedCount,
    absentCount,
    attendanceScore: attendanceScore === null ? null : round(attendanceScore),
    engagedRate: total ? round(percent(presentCount + lateCount + excusedCount, total)) : null,
    absenceRate: total ? round(percent(absentCount, total)) : null,
    lastAttendanceAt: summary.last_attendance_at || null,
  };
}

function buildAssignmentMetrics(summary = {}) {
  const total = toNumber(summary.total);
  const turnedInCount = toNumber(summary.turned_in_count);
  const completedCount = toNumber(summary.completed_count);
  const reviewedCount = toNumber(summary.reviewed_count);
  const onTimeCount = toNumber(summary.on_time_count);
  const averageTeacherScore = average(summary.reviewScoreSamples || []);

  const completionRate = total ? round(percent(turnedInCount, total)) : null;
  const onTimeRate = turnedInCount ? round(percent(onTimeCount, turnedInCount)) : null;
  const assignmentScore = weightedAverage([
    { value: completionRate, weight: 0.55 },
    { value: onTimeRate, weight: 0.2 },
    { value: averageTeacherScore, weight: 0.25 },
  ]);

  return {
    total,
    turnedInCount,
    completedCount,
    reviewedCount,
    onTimeCount,
    completionRate,
    onTimeRate,
    averageTeacherScore: averageTeacherScore === null ? null : round(averageTeacherScore),
    assignmentScore: assignmentScore === null ? null : round(assignmentScore),
    lastSubmissionAt: summary.last_submission_at || null,
  };
}

function buildConsistencyMetrics(learningSummary = {}, lastSubmissionAt = null) {
  const activeDays = toNumber(learningSummary.activeDaysLast30);
  const lastActivityAt = [learningSummary.lastActivityAt, lastSubmissionAt]
    .sort((left, right) => toDateValue(right) - toDateValue(left))[0] || null;
  const daysSinceLastActivity = getDaysSince(lastActivityAt);

  let consistencyScore = clamp((activeDays / 12) * 70);

  if (daysSinceLastActivity !== null) {
    if (daysSinceLastActivity <= 2) {
      consistencyScore += 30;
    } else if (daysSinceLastActivity <= 7) {
      consistencyScore += 22;
    } else if (daysSinceLastActivity <= 14) {
      consistencyScore += 12;
    }
  }

  return {
    activeDaysLast30: activeDays,
    daysSinceLastActivity,
    lastActivityAt,
    consistencyScore: round(clamp(consistencyScore)),
  };
}

function buildProgressStatus(metrics = {}) {
  const overallScore = toNullableNumber(metrics.overallScore);
  const attendanceScore = toNullableNumber(metrics.attendanceScore);
  const completionRate = toNullableNumber(metrics.completionRate);
  const trendKey = String(metrics.trendKey || "stable");

  let riskKey = "low";
  let riskLabel = "Đúng nhịp";
  let readinessLabel = "Có thể tăng tốc";

  if (
    overallScore === null ||
    overallScore < 55 ||
    (attendanceScore !== null && attendanceScore < 65) ||
    (completionRate !== null && completionRate < 55)
  ) {
    riskKey = "high";
    riskLabel = "Cần can thiệp sớm";
    readinessLabel = "Ưu tiên củng cố nền tảng";
  } else if (
    overallScore < 72 ||
    (attendanceScore !== null && attendanceScore < 78) ||
    trendKey === "declining"
  ) {
    riskKey = "medium";
    riskLabel = "Cần theo dõi";
    readinessLabel = "Theo dõi sát và giữ nhịp";
  }

  return {
    riskKey,
    riskLabel,
    readinessLabel,
  };
}

function buildAreaInsights(areaScores = {}) {
  const entries = Object.entries(areaScores)
    .filter(([, value]) => Number.isFinite(Number(value)))
    .map(([key, value]) => ({ key, value: Number(value) }));

  if (!entries.length) {
    return {
      strongestAreaLabel: "Chưa đủ dữ liệu",
      focusAreaLabel: "Cần thêm hoạt động để đánh giá",
    };
  }

  const strongest = [...entries].sort((left, right) => right.value - left.value)[0];
  const weakest = [...entries].sort((left, right) => left.value - right.value)[0];
  const labelByKey = {
    attendance: "Kỷ luật học tập",
    assignment: "Bài tập và đầu ra",
    learning: "Năng lực luyện tập",
    consistency: "Độ đều và nhịp học",
  };

  return {
    strongestAreaLabel: labelByKey[strongest.key] || "Điểm mạnh",
    focusAreaLabel: labelByKey[weakest.key] || "Trọng tâm cần cải thiện",
  };
}

function buildStudentProgressModel({
  student,
  attendanceRows = [],
  submissionRows = [],
  commentRows = [],
  latestComment = null,
  learningSessions = [],
}) {
  const attendanceSummary = aggregateAttendanceRows(attendanceRows);
  const submissionSummary = aggregateSubmissionRows(submissionRows);
  const commentSummary = aggregateCommentRows(commentRows);
  const learningSummary = buildLearningSummary(learningSessions);
  const attendanceMetrics = buildAttendanceMetrics(attendanceSummary);
  const assignmentMetrics = buildAssignmentMetrics(submissionSummary);
  const consistencyMetrics = buildConsistencyMetrics(learningSummary, assignmentMetrics.lastSubmissionAt);
  const overallScore = weightedAverage([
    { value: attendanceMetrics.attendanceScore, weight: 0.25 },
    { value: assignmentMetrics.assignmentScore, weight: 0.3 },
    { value: learningSummary.learningScore, weight: 0.3 },
    { value: consistencyMetrics.consistencyScore, weight: 0.15 },
  ]);
  const status = buildProgressStatus({
    overallScore,
    attendanceScore: attendanceMetrics.attendanceScore,
    completionRate: assignmentMetrics.completionRate,
    trendKey: learningSummary.trendKey,
  });
  const areaInsights = buildAreaInsights({
    attendance: attendanceMetrics.attendanceScore,
    assignment: assignmentMetrics.assignmentScore,
    learning: learningSummary.learningScore,
    consistency: consistencyMetrics.consistencyScore,
  });

  return {
    studentId: toNumber(student.id || student.student_id),
    fullName: String(student.full_name || "").trim() || "Học viên",
    email: String(student.email || "").trim(),
    phone: String(student.phone || "").trim(),
    overallScore: overallScore === null ? null : round(overallScore),
    attendanceScore: attendanceMetrics.attendanceScore,
    assignmentScore: assignmentMetrics.assignmentScore,
    learningScore: learningSummary.learningScore === null ? null : round(learningSummary.learningScore),
    consistencyScore: consistencyMetrics.consistencyScore,
    attendanceRate: attendanceMetrics.attendanceScore,
    engagedRate: attendanceMetrics.engagedRate,
    assignmentCompletionRate: assignmentMetrics.completionRate,
    onTimeRate: assignmentMetrics.onTimeRate,
    averageTeacherScore: assignmentMetrics.averageTeacherScore,
    trendKey: learningSummary.trendKey,
    trendLabel: learningSummary.trendLabel,
    riskKey: status.riskKey,
    riskLabel: status.riskLabel,
    readinessLabel: status.readinessLabel,
    strongestAreaLabel: areaInsights.strongestAreaLabel,
    focusAreaLabel: areaInsights.focusAreaLabel,
    commentCount: commentSummary.comment_count,
    lastTeacherComment: latestComment
      ? {
          title: latestComment.title || latestComment.skill_focus || "Nhận xét gần nhất",
          message: String(latestComment.comment || latestComment.message || "").trim(),
          teacherName: latestComment.teacher_name || latestComment.author_teacher_name || "",
          createdAt: latestComment.lesson_date || latestComment.created_at || null,
          skillFocus: latestComment.skill_focus || "",
        }
      : null,
    learningSummary: {
      totalSessions: learningSummary.totalSessions,
      activeDaysLast30: learningSummary.activeDaysLast30,
      lastActivityAt: consistencyMetrics.lastActivityAt,
      practiceAccuracy: learningSummary.practiceAccuracy,
      dictationAccuracy: learningSummary.dictationAccuracy,
      fullTestAccuracy: learningSummary.fullTestAccuracy,
      fullTestBestScore: learningSummary.fullTestBestScore,
      fullTestLatestScore: learningSummary.fullTestLatestScore,
      byType: learningSummary.byType,
    },
    assignmentSummary: {
      total: assignmentMetrics.total,
      turnedInCount: assignmentMetrics.turnedInCount,
      completedCount: assignmentMetrics.completedCount,
      reviewedCount: assignmentMetrics.reviewedCount,
      onTimeCount: assignmentMetrics.onTimeCount,
      completionRate: assignmentMetrics.completionRate,
      onTimeRate: assignmentMetrics.onTimeRate,
      averageTeacherScore: assignmentMetrics.averageTeacherScore,
      lastSubmissionAt: assignmentMetrics.lastSubmissionAt,
    },
    attendanceSummary: {
      total: attendanceMetrics.total,
      presentCount: attendanceMetrics.presentCount,
      lateCount: attendanceMetrics.lateCount,
      absentCount: attendanceMetrics.absentCount,
      excusedCount: attendanceMetrics.excusedCount,
      engagedRate: attendanceMetrics.engagedRate,
      lastAttendanceAt: attendanceMetrics.lastAttendanceAt,
    },
    consistencySummary: consistencyMetrics,
  };
}

async function loadStudentRows(studentId) {
  const [rows] = await db.query(
    `
      SELECT
        s.*,
        COUNT(DISTINCT e.id) AS enrollment_count,
        COUNT(DISTINCT CASE WHEN e.status = 'active' THEN e.id END) AS active_enrollment_count
      FROM students s
      LEFT JOIN enrollments e ON e.student_id = s.id
      WHERE s.id = ?
      GROUP BY s.id
      LIMIT 1
    `,
    [studentId]
  );

  return rows[0] || null;
}

async function loadActiveStudentClasses(studentId) {
  const [rows] = await db.query(
    `
      SELECT
        e.class_id,
        e.status AS enrollment_status,
        e.enrolled_at,
        c.code AS class_code,
        c.room,
        c.schedule_text,
        c.start_date,
        c.end_date,
        co.name AS course_name,
        co.category,
        t.full_name AS teacher_name
      FROM enrollments e
      INNER JOIN classes c ON c.id = e.class_id
      LEFT JOIN courses co ON co.id = c.course_id
      LEFT JOIN teachers t ON t.id = c.teacher_id
      WHERE e.student_id = ? AND e.status = 'active'
      ORDER BY COALESCE(c.start_date, e.enrolled_at) DESC, c.id DESC
    `,
    [studentId]
  );

  return rows.map((row) => ({
    ...row,
    class_id: toNumber(row.class_id),
  }));
}

async function loadAttendanceSummaryRows(studentIds = [], classId = 0) {
  if (!studentIds.length) {
    return [];
  }

  const conditions = ["a.student_id IN (?)"];
  const params = [studentIds];
  if (classId) {
    conditions.push("a.class_id = ?");
    params.push(classId);
  }

  const [rows] = await db.query(
    `
      SELECT
        a.student_id,
        a.class_id,
        COUNT(*) AS total,
        SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) AS present_count,
        SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) AS absent_count,
        SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) AS late_count,
        SUM(CASE WHEN a.status = 'excused' THEN 1 ELSE 0 END) AS excused_count,
        MAX(a.lesson_date) AS last_attendance_at
      FROM attendance a
      WHERE ${conditions.join(" AND ")}
      GROUP BY a.student_id, a.class_id
    `,
    params
  );

  return rows;
}

async function loadCommentSummaryRows(studentIds = [], classId = 0) {
  if (!studentIds.length) {
    return [];
  }

  const conditions = ["sc.student_id IN (?)"];
  const params = [studentIds];
  if (classId) {
    conditions.push("sc.class_id = ?");
    params.push(classId);
  }

  const [rows] = await db.query(
    `
      SELECT
        sc.student_id,
        sc.class_id,
        COUNT(*) AS comment_count,
        MAX(sc.created_at) AS last_comment_at
      FROM student_comments sc
      WHERE ${conditions.join(" AND ")}
      GROUP BY sc.student_id, sc.class_id
    `,
    params
  );

  return rows;
}

async function loadLatestCommentRows(studentIds = [], classId = 0) {
  if (!studentIds.length) {
    return [];
  }

  const conditions = ["sc.student_id IN (?)"];
  const params = [studentIds];
  if (classId) {
    conditions.push("sc.class_id = ?");
    params.push(classId);
  }

  const [rows] = await db.query(
    `
      SELECT
        sc.student_id,
        sc.class_id,
        sc.lesson_date,
        sc.skill_focus,
        sc.comment,
        sc.created_at,
        t.full_name AS teacher_name
      FROM student_comments sc
      LEFT JOIN teachers t ON t.id = sc.teacher_id
      WHERE ${conditions.join(" AND ")}
      ORDER BY
        COALESCE(sc.lesson_date, DATE(sc.created_at)) DESC,
        sc.created_at DESC,
        sc.id DESC
    `,
    params
  );

  return rows;
}

async function loadSubmissionSummaryRows(studentIds = [], classId = 0) {
  if (!studentIds.length) {
    return [];
  }

  const conditions = ["cs.student_id IN (?)", "cp.post_type = 'assignment'"];
  const params = [studentIds];
  if (classId) {
    conditions.push("cp.class_id = ?");
    params.push(classId);
  }

  const [rows] = await db.query(
    `
      SELECT
        cs.student_id,
        cp.class_id,
        COUNT(*) AS total,
        SUM(CASE WHEN cs.status = 'assigned' THEN 1 ELSE 0 END) AS assigned_count,
        SUM(CASE WHEN cs.status IN ('submitted','completed','reviewed') THEN 1 ELSE 0 END) AS turned_in_count,
        SUM(CASE WHEN cs.status = 'completed' THEN 1 ELSE 0 END) AS completed_count,
        SUM(CASE WHEN cs.status = 'reviewed' THEN 1 ELSE 0 END) AS reviewed_count,
        SUM(
          CASE
            WHEN cs.status IN ('submitted','completed','reviewed')
              AND (
                cp.due_date IS NULL
                OR COALESCE(cs.completed_at, cs.reviewed_at, cs.submitted_at, cs.created_at) <= cp.due_date
              )
            THEN 1
            ELSE 0
          END
        ) AS on_time_count,
        AVG(CASE WHEN cs.teacher_score IS NOT NULL THEN cs.teacher_score END) AS average_teacher_score,
        MAX(COALESCE(cs.reviewed_at, cs.completed_at, cs.submitted_at, cs.updated_at, cs.created_at)) AS last_submission_at
      FROM classroom_submissions cs
      INNER JOIN classroom_posts cp ON cp.id = cs.post_id
      WHERE ${conditions.join(" AND ")}
      GROUP BY cs.student_id, cp.class_id
    `,
    params
  );

  return rows;
}

async function loadRecentSubmissionRows(studentId, limit = 8) {
  const [rows] = await db.query(
    `
      SELECT
        cs.id,
        cs.status,
        cs.teacher_feedback,
        cs.teacher_score,
        cs.submitted_at,
        cs.completed_at,
        cs.reviewed_at,
        cp.title AS post_title,
        cp.due_date,
        c.id AS class_id,
        c.code AS class_code,
        co.name AS course_name
      FROM classroom_submissions cs
      INNER JOIN classroom_posts cp ON cp.id = cs.post_id
      INNER JOIN classes c ON c.id = cp.class_id
      LEFT JOIN courses co ON co.id = c.course_id
      WHERE cs.student_id = ?
      ORDER BY COALESCE(cs.reviewed_at, cs.completed_at, cs.submitted_at, cs.created_at) DESC, cs.id DESC
      LIMIT ?
    `,
    [studentId, limit]
  );

  return rows.map((row) => ({
    ...row,
    id: toNumber(row.id),
    class_id: toNumber(row.class_id),
    teacher_score: normalizeTeacherScore(row.teacher_score),
  }));
}

async function loadLearningSessions(studentIds = []) {
  if (!studentIds.length) {
    return [];
  }

  const [rows] = await db.query(
    `
      SELECT *
      FROM student_learning_sessions
      WHERE student_id IN (?)
      ORDER BY submitted_at DESC, id DESC
    `,
    [studentIds]
  );

  return rows;
}

async function getStudentProgressHub(studentId, options = {}) {
  const numericStudentId = Number(studentId || 0);
  if (!numericStudentId) {
    return null;
  }

  await ensureStudentActivitySupport();

  const [student, classes, attendanceRows, commentSummaryRows, latestCommentRows, submissionSummaryRows, learningRows] = await Promise.all([
    loadStudentRows(numericStudentId),
    loadActiveStudentClasses(numericStudentId),
    loadAttendanceSummaryRows([numericStudentId]),
    loadCommentSummaryRows([numericStudentId]),
    loadLatestCommentRows([numericStudentId]),
    loadSubmissionSummaryRows([numericStudentId]),
    loadLearningSessions([numericStudentId]),
  ]);

  if (!student) {
    return null;
  }

  const attendanceByClass = mapRowsByComposite(attendanceRows);
  const commentSummaryByClass = mapRowsByComposite(commentSummaryRows);
  const latestCommentByClass = buildLatestMap(latestCommentRows);
  const submissionByClass = mapRowsByComposite(submissionSummaryRows);
  const learningByStudent = groupRowsByStudent(learningRows);
  const sessions = learningByStudent.get(numericStudentId) || [];

  const summary = buildStudentProgressModel({
    student,
    attendanceRows,
    submissionRows: submissionSummaryRows,
    commentRows: commentSummaryRows,
    latestComment: latestCommentRows[0] || null,
    learningSessions: sessions,
  });

  const activityProfile = await getStudentActivityProfile(numericStudentId, options.baseUrl || "");
  const recentSubmissions = await loadRecentSubmissionRows(numericStudentId, 8);

  const classroomProgress = classes.map((classItem) => {
    const classAttendance = attendanceByClass.get(compositeKey(numericStudentId, classItem.class_id));
    const classCommentSummary = commentSummaryByClass.get(compositeKey(numericStudentId, classItem.class_id));
    const classLatestComment = latestCommentByClass.get(compositeKey(numericStudentId, classItem.class_id)) || null;
    const classSubmission = submissionByClass.get(compositeKey(numericStudentId, classItem.class_id));
    const attendanceMetrics = buildAttendanceMetrics(classAttendance || {});
    const assignmentMetrics = buildAssignmentMetrics(
      classSubmission
        ? {
            ...classSubmission,
            reviewScoreSamples: [normalizeTeacherScore(classSubmission.average_teacher_score)].filter((value) => value !== null),
          }
        : {}
    );

    return {
      ...classItem,
      attendanceRate: attendanceMetrics.attendanceScore,
      engagedRate: attendanceMetrics.engagedRate,
      assignmentCompletionRate: assignmentMetrics.completionRate,
      onTimeRate: assignmentMetrics.onTimeRate,
      averageTeacherScore: assignmentMetrics.averageTeacherScore,
      commentCount: toNumber(classCommentSummary ? classCommentSummary.comment_count : 0),
      lastTeacherComment: classLatestComment
        ? {
            message: String(classLatestComment.comment || "").trim(),
            teacherName: classLatestComment.teacher_name || classItem.teacher_name || "",
            skillFocus: classLatestComment.skill_focus || "",
            createdAt: classLatestComment.lesson_date || classLatestComment.created_at || null,
          }
        : null,
    };
  });

  const liveSessionsByClass = await Promise.all(
    classes.map(async (classItem) => ({
      class_id: classItem.class_id,
      sessions: await listClassLiveSessions(classItem.class_id, { includeCompleted: false, limit: 3 }),
    }))
  );

  const upcomingLiveSessions = liveSessionsByClass
    .flatMap((item) => item.sessions.map((session) => ({
      ...session,
      class_id: item.class_id,
      classInfo: classes.find((classItem) => classItem.class_id === item.class_id) || null,
    })))
    .sort((left, right) => toDateValue(left.scheduled_start) - toDateValue(right.scheduled_start))
    .slice(0, 6);

  return {
    student: {
      ...student,
      enrollment_count: toNumber(student.enrollment_count),
      active_enrollment_count: toNumber(student.active_enrollment_count),
    },
    summary,
    classroomProgress,
    upcomingLiveSessions,
    recentTeacherNotes: latestCommentRows.slice(0, 6).map((row) => ({
      ...row,
      class_id: toNumber(row.class_id),
    })),
    recentSubmissions,
    recentExamSessions: activityProfile.examSessions.slice(0, 8),
    recentDictationSessions: activityProfile.dictationSessions.slice(0, 6),
  };
}

async function getClassProgressBoard(teacherId, classId) {
  const numericTeacherId = Number(teacherId || 0);
  const numericClassId = Number(classId || 0);

  if (!numericTeacherId || !numericClassId) {
    return null;
  }

  await assertTeacherPermission(numericTeacherId, numericClassId, "can_view_progress");

  const [classResult, studentResult, collaborationData] = await Promise.all([
    db.query(
      `
        SELECT
          c.id,
          c.code,
          c.room,
          c.schedule_text,
          c.start_date,
          c.end_date,
          co.name AS course_name,
          co.category,
          COUNT(DISTINCT CASE WHEN e.status = 'active' THEN e.student_id END) AS student_count
        FROM classes c
        LEFT JOIN courses co ON co.id = c.course_id
        LEFT JOIN enrollments e ON e.class_id = c.id
        WHERE c.id = ?
        GROUP BY
          c.id,
          c.code,
          c.room,
          c.schedule_text,
          c.start_date,
          c.end_date,
          co.name,
          co.category
        LIMIT 1
      `,
      [numericClassId]
    ),
    db.query(
      `
        SELECT
          s.id,
          s.full_name,
          s.email,
          s.phone,
          e.enrolled_at
        FROM enrollments e
        INNER JOIN students s ON s.id = e.student_id
        WHERE e.class_id = ? AND e.status = 'active'
        ORDER BY s.full_name ASC
      `,
      [numericClassId]
    ),
    getClassroomCollaborationData(numericClassId),
  ]);

  const [classRows] = classResult;
  const [studentRows] = studentResult;
  const classInfo = classRows[0] || null;

  if (!classInfo) {
    return null;
  }

  const studentIds = studentRows.map((item) => toNumber(item.id)).filter((value) => value > 0);
  const [attendanceRows, commentSummaryRows, latestCommentRows, submissionSummaryRows, learningRows] = studentIds.length
    ? await Promise.all([
        loadAttendanceSummaryRows(studentIds, numericClassId),
        loadCommentSummaryRows(studentIds, numericClassId),
        loadLatestCommentRows(studentIds, numericClassId),
        loadSubmissionSummaryRows(studentIds, numericClassId),
        loadLearningSessions(studentIds),
      ])
    : [[], [], [], [], []];

  const attendanceByClass = mapRowsByComposite(attendanceRows);
  const commentSummaryByClass = mapRowsByComposite(commentSummaryRows);
  const latestCommentByClass = buildLatestMap(latestCommentRows);
  const submissionByClass = mapRowsByComposite(submissionSummaryRows);
  const learningByStudent = groupRowsByStudent(learningRows);

  const students = studentRows
    .map((studentItem) => {
      const studentId = toNumber(studentItem.id);
      const progress = buildStudentProgressModel({
        student: studentItem,
        attendanceRows: [attendanceByClass.get(compositeKey(studentId, numericClassId))].filter(Boolean),
        submissionRows: [submissionByClass.get(compositeKey(studentId, numericClassId))].filter(Boolean),
        commentRows: [commentSummaryByClass.get(compositeKey(studentId, numericClassId))].filter(Boolean),
        latestComment: latestCommentByClass.get(compositeKey(studentId, numericClassId)) || null,
        learningSessions: learningByStudent.get(studentId) || [],
      });

      return {
        ...progress,
        enrolledAt: studentItem.enrolled_at || null,
      };
    })
    .sort((left, right) => {
      const riskWeight = { high: 0, medium: 1, low: 2 };
      const riskDiff = (riskWeight[left.riskKey] || 9) - (riskWeight[right.riskKey] || 9);
      if (riskDiff !== 0) {
        return riskDiff;
      }

      return String(left.fullName || "").localeCompare(String(right.fullName || ""), "vi");
    });

  const averageOverall = average(students.map((item) => toNullableNumber(item.overallScore)).filter((value) => value !== null));
  const averageAttendance = average(students.map((item) => toNullableNumber(item.attendanceRate)).filter((value) => value !== null));
  const averageAssignment = average(students.map((item) => toNullableNumber(item.assignmentCompletionRate)).filter((value) => value !== null));
  const averageLearning = average(students.map((item) => toNullableNumber(item.learningScore)).filter((value) => value !== null));

  return {
    classInfo: {
      ...classInfo,
      id: toNumber(classInfo.id),
      student_count: toNumber(classInfo.student_count),
    },
    summary: {
      studentCount: students.length,
      averageOverall: averageOverall === null ? null : round(averageOverall),
      averageAttendance: averageAttendance === null ? null : round(averageAttendance),
      averageAssignment: averageAssignment === null ? null : round(averageAssignment),
      averageLearning: averageLearning === null ? null : round(averageLearning),
      highRiskCount: students.filter((item) => item.riskKey === "high").length,
      mediumRiskCount: students.filter((item) => item.riskKey === "medium").length,
      lowRiskCount: students.filter((item) => item.riskKey === "low").length,
      improvingCount: students.filter((item) => item.trendKey === "improving").length,
      upcomingLiveCount: collaborationData.liveSessions.filter((item) => ["scheduled", "live"].includes(item.status)).length,
    },
    teachingTeam: collaborationData.teachingTeam,
    liveSessions: collaborationData.liveSessions,
    teacherUpdates: collaborationData.teacherUpdates,
    students,
  };
}

module.exports = {
  getClassProgressBoard,
  getStudentProgressHub,
};
