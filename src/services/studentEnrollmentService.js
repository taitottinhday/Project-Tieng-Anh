const db = require("../models/db");
const { createEnrollmentAccessToken } = require("../utils/paymentAccess");

const DAY_DEFINITIONS = [
  { key: "mon", label: "Thứ 2", shortLabel: "Mon", weekday: 1, patterns: [/\bT2\b/i, /\bTHỨ\s*2\b/i, /\bMON(?:DAY)?\b/i] },
  { key: "tue", label: "Thứ 3", shortLabel: "Tue", weekday: 2, patterns: [/\bT3\b/i, /\bTHỨ\s*3\b/i, /\bTUE(?:SDAY)?\b/i] },
  { key: "wed", label: "Thứ 4", shortLabel: "Wed", weekday: 3, patterns: [/\bT4\b/i, /\bTHỨ\s*4\b/i, /\bWED(?:NESDAY)?\b/i] },
  { key: "thu", label: "Thứ 5", shortLabel: "Thu", weekday: 4, patterns: [/\bT5\b/i, /\bTHỨ\s*5\b/i, /\bTHU(?:RSDAY)?\b/i] },
  { key: "fri", label: "Thứ 6", shortLabel: "Fri", weekday: 5, patterns: [/\bT6\b/i, /\bTHỨ\s*6\b/i, /\bFRI(?:DAY)?\b/i] },
  { key: "sat", label: "Thứ 7", shortLabel: "Sat", weekday: 6, patterns: [/\bT7\b/i, /\bTHỨ\s*7\b/i, /\bSAT(?:URDAY)?\b/i] },
  { key: "sun", label: "Chủ nhật", shortLabel: "Sun", weekday: 0, patterns: [/\bCN\b/i, /\bCHỦ\s*NHẬT\b/i, /\bSUN(?:DAY)?\b/i] },
];

function trimText(value) {
  return String(value || "").trim();
}

function normalizeIdentity(identity = {}) {
  return {
    studentId: Number(identity.studentId || identity.student_id || 0),
    userId: Number(identity.userId || identity.user_id || 0),
    email: trimText(identity.email).toLowerCase(),
  };
}

function buildStudentIdentityWhere(identity = {}) {
  const normalized = normalizeIdentity(identity);
  const conditions = [];
  const params = [];

  if (normalized.studentId) {
    conditions.push("s.id = ?");
    params.push(normalized.studentId);
  }

  if (normalized.userId) {
    conditions.push("s.user_id = ?");
    params.push(normalized.userId);
  }

  if (normalized.email) {
    conditions.push("LOWER(TRIM(s.email)) = ?");
    params.push(normalized.email);
  }

  if (!conditions.length) {
    return null;
  }

  return {
    whereSql: `(${conditions.join(" OR ")})`,
    params,
  };
}

function toDate(value) {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDisplayDate(value, options = { day: "2-digit", month: "2-digit", year: "numeric" }) {
  const date = toDate(value);
  if (!date) {
    return null;
  }

  return new Intl.DateTimeFormat("vi-VN", options).format(date);
}

function normalizeTimeToken(value) {
  const raw = trimText(value);
  if (!raw) {
    return "";
  }

  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) {
    return raw;
  }

  if (digits.length <= 2) {
    return `${digits.padStart(2, "0")}:00`;
  }

  if (digits.length === 3) {
    return `${digits.slice(0, 1).padStart(2, "0")}:${digits.slice(1).padEnd(2, "0").slice(0, 2)}`;
  }

  return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
}

function extractTimeRangeLabel(scheduleText = "") {
  const source = trimText(scheduleText).replace(/[–—]/g, "-");
  const matched = source.match(/(\d{1,2}(?::|\.)?\d{0,2}\s*-\s*\d{1,2}(?::|\.)?\d{0,2})/);

  if (!matched) {
    return "";
  }

  const [startRaw, endRaw] = matched[1].split("-").map((item) => normalizeTimeToken(item.replace(".", ":")));
  if (!startRaw || !endRaw) {
    return trimText(matched[1]);
  }

  return `${startRaw} - ${endRaw}`;
}

function parseScheduleText(scheduleText = "") {
  const source = trimText(scheduleText);
  const days = DAY_DEFINITIONS.filter((item) => item.patterns.some((pattern) => pattern.test(source)));
  return {
    scheduleText: source,
    days,
    timeRangeLabel: extractTimeRangeLabel(source),
  };
}

function buildWeekCards(scheduleMeta) {
  const dayKeySet = new Set((scheduleMeta.days || []).map((item) => item.key));
  return DAY_DEFINITIONS.map((item) => ({
    key: item.key,
    label: item.label,
    shortLabel: item.shortLabel,
    isStudyDay: dayKeySet.has(item.key),
    timeRangeLabel: dayKeySet.has(item.key) ? scheduleMeta.timeRangeLabel : "",
  }));
}

function buildUpcomingSessions(scheduleMeta, row, maxItems = 6) {
  const startDate = toDate(row.start_date);
  const endDate = toDate(row.end_date);
  const weekdays = Array.isArray(scheduleMeta.days) ? scheduleMeta.days : [];

  if (!weekdays.length || !startDate) {
    return [];
  }

  const allowedWeekdays = new Set(weekdays.map((item) => item.weekday));
  const sessions = [];
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  const loopLimit = 70;

  for (let offset = 0; offset <= loopLimit && sessions.length < maxItems; offset += 1) {
    const nextDate = new Date(cursor);
    nextDate.setDate(cursor.getDate() + offset);

    if (nextDate < startDate) {
      continue;
    }

    if (endDate && nextDate > endDate) {
      break;
    }

    if (!allowedWeekdays.has(nextDate.getDay())) {
      continue;
    }

    sessions.push({
      isoDate: nextDate.toISOString().slice(0, 10),
      weekdayLabel: DAY_DEFINITIONS.find((item) => item.weekday === nextDate.getDay())?.label || "",
      dateLabel: formatDisplayDate(nextDate, {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
      }),
      timeRangeLabel: scheduleMeta.timeRangeLabel || row.schedule_text || "Theo lịch lớp",
      isToday: offset === 0,
    });
  }

  return sessions;
}

async function findStudentOpenEnrollment(identity = {}) {
  const identityWhere = buildStudentIdentityWhere(identity);
  if (!identityWhere) {
    return null;
  }

  const [rows] = await db.query(
    `
      SELECT
        e.id AS enrollment_id,
        e.student_id,
        e.class_id,
        e.status AS enrollment_status,
        e.enrolled_at,
        s.user_id AS student_user_id,
        s.full_name AS student_name,
        s.email AS student_email,
        c.code AS class_code,
        c.room,
        c.schedule_text,
        c.start_date,
        c.end_date,
        co.id AS course_id,
        co.name AS course_name,
        t.full_name AS teacher_name,
        p.id AS payment_id,
        p.status AS payment_status,
        p.paid_at AS payment_paid_at
      FROM enrollments e
      INNER JOIN students s ON s.id = e.student_id
      INNER JOIN classes c ON c.id = e.class_id
      LEFT JOIN courses co ON co.id = c.course_id
      LEFT JOIN teachers t ON t.id = c.teacher_id
      LEFT JOIN (
        SELECT p1.id, p1.enrollment_id, p1.status, p1.paid_at
        FROM payments p1
        INNER JOIN (
          SELECT enrollment_id, MAX(id) AS latest_id
          FROM payments
          GROUP BY enrollment_id
        ) latest_payment ON latest_payment.latest_id = p1.id
      ) p ON p.enrollment_id = e.id
      WHERE ${identityWhere.whereSql}
        AND e.status IN ('pending', 'active')
      ORDER BY
        CASE WHEN e.status = 'active' THEN 0 ELSE 1 END,
        e.enrolled_at DESC,
        e.id DESC
      LIMIT 1
    `,
    identityWhere.params
  );

  const row = rows[0] || null;
  if (!row) {
    return null;
  }

  const scheduleMeta = parseScheduleText(row.schedule_text);
  return {
    ...row,
    scheduleMeta,
    weekCards: buildWeekCards(scheduleMeta),
    upcomingSessions: buildUpcomingSessions(scheduleMeta, row, 4),
    paymentHref:
      row.enrollment_status === "pending"
        ? `/payment/${row.enrollment_id}?token=${encodeURIComponent(createEnrollmentAccessToken(row.enrollment_id))}`
        : null,
    classroomHref: row.class_id ? `/student/classroom/${row.class_id}` : null,
    scheduleHref: "/student/schedule",
    enrolledLabel: formatDisplayDate(row.enrolled_at),
    startLabel: formatDisplayDate(row.start_date),
    endLabel: formatDisplayDate(row.end_date),
  };
}

async function listStudentActiveSchedules(studentId) {
  const numericStudentId = Number(studentId || 0);
  if (!numericStudentId) {
    return [];
  }

  const [rows] = await db.query(
    `
      SELECT
        e.id AS enrollment_id,
        e.status AS enrollment_status,
        e.enrolled_at,
        c.id AS class_id,
        c.code AS class_code,
        c.room,
        c.schedule_text,
        c.start_date,
        c.end_date,
        co.name AS course_name,
        co.category AS course_category,
        t.full_name AS teacher_name
      FROM enrollments e
      INNER JOIN classes c ON c.id = e.class_id
      LEFT JOIN courses co ON co.id = c.course_id
      LEFT JOIN teachers t ON t.id = c.teacher_id
      WHERE e.student_id = ? AND e.status = 'active'
      ORDER BY COALESCE(c.start_date, e.enrolled_at) ASC, e.id DESC
    `,
    [numericStudentId]
  );

  return rows.map((row) => {
    const scheduleMeta = parseScheduleText(row.schedule_text);
    return {
      ...row,
      scheduleMeta,
      weekCards: buildWeekCards(scheduleMeta),
      upcomingSessions: buildUpcomingSessions(scheduleMeta, row, 6),
      enrolledLabel: formatDisplayDate(row.enrolled_at),
      startLabel: formatDisplayDate(row.start_date),
      endLabel: formatDisplayDate(row.end_date),
      classroomHref: row.class_id ? `/student/classroom/${row.class_id}` : null,
    };
  });
}

module.exports = {
  DAY_DEFINITIONS,
  findStudentOpenEnrollment,
  listStudentActiveSchedules,
  parseScheduleText,
};
