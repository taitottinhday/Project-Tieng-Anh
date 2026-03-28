const db = require("../models/db");

function normalizeHref(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return null;
  }

  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("://")) {
    return null;
  }

  return raw;
}

function normalizeHrefList(values = []) {
  return Array.isArray(values)
    ? values.map((value) => normalizeHref(value)).filter(Boolean)
    : [];
}

function buildHrefConditions(options = {}) {
  const conditions = [];
  const params = [];
  const href = normalizeHref(options.href);
  const excludeHrefs = normalizeHrefList(options.excludeHrefs);

  if (href) {
    conditions.push("href = ?");
    params.push(href);
  }

  if (excludeHrefs.length) {
    const placeholders = excludeHrefs.map(() => "?").join(", ");
    conditions.push(`(href IS NULL OR href NOT IN (${placeholders}))`);
    params.push(...excludeHrefs);
  }

  return { conditions, params };
}

function mapNotification(row) {
  return {
    id: Number(row.id || 0),
    user_id: Number(row.user_id || 0),
    title: String(row.title || "").trim(),
    message: String(row.message || "").trim(),
    href: normalizeHref(row.href),
    is_read: Boolean(Number(row.is_read || 0)),
    read_at: row.read_at || null,
    created_at: row.created_at || null,
  };
}

async function createStudentNotification(payload = {}, executor = db) {
  const userId = Number(payload.userId || payload.user_id || 0);
  const title = String(payload.title || "").trim();

  if (!userId || !title) {
    return null;
  }

  const message = String(payload.message || "").trim() || null;
  const href = normalizeHref(payload.href);

  const [result] = await executor.query(
    `
      INSERT INTO student_notifications (user_id, title, message, href)
      VALUES (?, ?, ?, ?)
    `,
    [userId, title, message, href]
  );

  return Number(result.insertId || 0);
}

async function listStudentNotifications(userId, options = {}) {
  const numericUserId = Number(userId || 0);
  if (!numericUserId) {
    return [];
  }

  const limit = Math.max(1, Math.min(Number(options.limit || 5), 20));
  const unreadOnly = Boolean(options.unreadOnly);

  const conditions = ["user_id = ?"];
  const params = [numericUserId];
  const hrefFilters = buildHrefConditions(options);

  if (unreadOnly) {
    conditions.push("is_read = 0");
  }

  conditions.push(...hrefFilters.conditions);
  params.push(...hrefFilters.params);
  params.push(limit);

  const [rows] = await db.query(
    `
      SELECT id, user_id, title, message, href, is_read, read_at, created_at
      FROM student_notifications
      WHERE ${conditions.join(" AND ")}
      ORDER BY is_read ASC, created_at DESC, id DESC
      LIMIT ?
    `,
    params
  );

  return rows.map(mapNotification);
}

async function countUnreadStudentNotifications(userId, options = {}) {
  const numericUserId = Number(userId || 0);
  if (!numericUserId) {
    return 0;
  }
  const conditions = ["user_id = ?", "is_read = 0"];
  const params = [numericUserId];
  const hrefFilters = buildHrefConditions(options);

  conditions.push(...hrefFilters.conditions);
  params.push(...hrefFilters.params);

  const [rows] = await db.query(
    `
      SELECT COUNT(*) AS total
      FROM student_notifications
      WHERE ${conditions.join(" AND ")}
    `,
    params
  );

  return Number(rows[0]?.total || 0);
}

async function markStudentNotificationsRead(userId, options = {}) {
  const numericUserId = Number(userId || 0);
  if (!numericUserId) {
    return 0;
  }

  const conditions = ["user_id = ?", "is_read = 0"];
  const params = [numericUserId];
  const hrefFilters = buildHrefConditions(options);

  conditions.push(...hrefFilters.conditions);
  params.push(...hrefFilters.params);

  const [result] = await db.query(
    `
      UPDATE student_notifications
      SET is_read = 1, read_at = COALESCE(read_at, NOW())
      WHERE ${conditions.join(" AND ")}
    `,
    params
  );

  return Number(result.affectedRows || 0);
}

async function markAllStudentNotificationsRead(userId) {
  return markStudentNotificationsRead(userId);
}

module.exports = {
  countUnreadStudentNotifications,
  createStudentNotification,
  listStudentNotifications,
  markStudentNotificationsRead,
  markAllStudentNotificationsRead,
};
