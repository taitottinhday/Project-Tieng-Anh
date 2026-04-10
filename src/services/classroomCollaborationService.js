const db = require("../models/db");
const { ensurePlatformSupport } = require("./platformSupport");

let collaborationReady = false;

function toNumber(value, fallback = 0) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
}

function toBooleanFlag(value) {
  return Number(value) === 1;
}

function normalizeRole(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return ["lead", "co_teacher", "mentor", "reviewer"].includes(normalized)
    ? normalized
    : "co_teacher";
}

function normalizeMeetingProvider(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return ["google_meet", "zoom", "teams", "other"].includes(normalized)
    ? normalized
    : "google_meet";
}

function normalizeImportance(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return ["normal", "priority", "urgent"].includes(normalized)
    ? normalized
    : "normal";
}

function normalizeDateTime(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(raw)) {
    return `${raw.replace("T", " ")}:00`;
  }

  return raw;
}

function getRoleDefaults(role) {
  switch (normalizeRole(role)) {
    case "lead":
      return {
        role: "lead",
        can_publish_posts: 1,
        can_review_submissions: 1,
        can_schedule_sessions: 1,
        can_view_progress: 1,
        can_manage_team: 1,
        visibility_scope: "full",
      };
    case "mentor":
      return {
        role: "mentor",
        can_publish_posts: 1,
        can_review_submissions: 1,
        can_schedule_sessions: 0,
        can_view_progress: 1,
        can_manage_team: 0,
        visibility_scope: "full",
      };
    case "reviewer":
      return {
        role: "reviewer",
        can_publish_posts: 0,
        can_review_submissions: 1,
        can_schedule_sessions: 0,
        can_view_progress: 1,
        can_manage_team: 0,
        visibility_scope: "limited",
      };
    default:
      return {
        role: "co_teacher",
        can_publish_posts: 1,
        can_review_submissions: 1,
        can_schedule_sessions: 1,
        can_view_progress: 1,
        can_manage_team: 0,
        visibility_scope: "full",
      };
  }
}

function getRoleLabel(role) {
  switch (normalizeRole(role)) {
    case "lead":
      return "Giáo viên chính";
    case "mentor":
      return "Giáo viên theo dõi";
    case "reviewer":
      return "Giáo viên chấm bài";
    default:
      return "Giáo viên phối hợp";
  }
}

function getImportanceLabel(level) {
  switch (normalizeImportance(level)) {
    case "urgent":
      return "Khẩn";
    case "priority":
      return "Ưu tiên";
    default:
      return "Thông thường";
  }
}

function getMeetingProviderLabel(provider) {
  switch (normalizeMeetingProvider(provider)) {
    case "zoom":
      return "Zoom";
    case "teams":
      return "Microsoft Teams";
    case "other":
      return "Liên kết ngoài";
    default:
      return "Google Meet";
  }
}

function mapTeamRow(row) {
  return {
    ...row,
    teacher_id: toNumber(row.teacher_id),
    class_id: toNumber(row.class_id),
    post_count: toNumber(row.post_count),
    live_session_count: toNumber(row.live_session_count),
    can_publish_posts: toBooleanFlag(row.can_publish_posts),
    can_review_submissions: toBooleanFlag(row.can_review_submissions),
    can_schedule_sessions: toBooleanFlag(row.can_schedule_sessions),
    can_view_progress: toBooleanFlag(row.can_view_progress),
    can_manage_team: toBooleanFlag(row.can_manage_team),
    role_label: getRoleLabel(row.role),
  };
}

function mapLiveSessionRow(row) {
  return {
    ...row,
    id: toNumber(row.id),
    class_id: toNumber(row.class_id),
    created_by_teacher_id: toNumber(row.created_by_teacher_id),
    host_teacher_id: toNumber(row.host_teacher_id),
    meeting_provider_label: getMeetingProviderLabel(row.meeting_provider),
  };
}

function mapTeacherUpdateRow(row) {
  return {
    ...row,
    id: toNumber(row.id),
    class_id: toNumber(row.class_id),
    author_teacher_id: toNumber(row.author_teacher_id),
    related_student_id: toNumber(row.related_student_id),
    importance_label: getImportanceLabel(row.importance),
  };
}

async function ensureClassroomCollaborationSupport() {
  if (collaborationReady) {
    return;
  }

  await ensurePlatformSupport();

  await db.query(`
    CREATE TABLE IF NOT EXISTS class_teacher_assignments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      class_id INT NOT NULL,
      teacher_id INT NOT NULL,
      role ENUM('lead','co_teacher','mentor','reviewer') NOT NULL DEFAULT 'co_teacher',
      can_publish_posts TINYINT(1) NOT NULL DEFAULT 1,
      can_review_submissions TINYINT(1) NOT NULL DEFAULT 1,
      can_schedule_sessions TINYINT(1) NOT NULL DEFAULT 1,
      can_view_progress TINYINT(1) NOT NULL DEFAULT 1,
      can_manage_team TINYINT(1) NOT NULL DEFAULT 0,
      visibility_scope ENUM('full','limited') NOT NULL DEFAULT 'full',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_class_teacher_assignment (class_id, teacher_id),
      INDEX idx_class_teacher_assignments_teacher (teacher_id),
      INDEX idx_class_teacher_assignments_role (class_id, role),
      CONSTRAINT fk_class_teacher_assignments_class FOREIGN KEY (class_id) REFERENCES classes(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT fk_class_teacher_assignments_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id)
        ON DELETE CASCADE ON UPDATE CASCADE
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS classroom_live_sessions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      class_id INT NOT NULL,
      created_by_teacher_id INT NOT NULL,
      host_teacher_id INT NOT NULL,
      title VARCHAR(180) NOT NULL,
      description TEXT NULL,
      meeting_provider ENUM('google_meet','zoom','teams','other') NOT NULL DEFAULT 'google_meet',
      meeting_url VARCHAR(500) NOT NULL,
      access_note VARCHAR(255) NULL,
      scheduled_start DATETIME NOT NULL,
      scheduled_end DATETIME NULL,
      status ENUM('scheduled','live','completed','canceled') NOT NULL DEFAULT 'scheduled',
      recording_url VARCHAR(500) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_classroom_live_sessions_class_start (class_id, scheduled_start),
      INDEX idx_classroom_live_sessions_status (status),
      CONSTRAINT fk_classroom_live_sessions_class FOREIGN KEY (class_id) REFERENCES classes(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT fk_classroom_live_sessions_creator FOREIGN KEY (created_by_teacher_id) REFERENCES teachers(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT fk_classroom_live_sessions_host FOREIGN KEY (host_teacher_id) REFERENCES teachers(id)
        ON DELETE CASCADE ON UPDATE CASCADE
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS classroom_teacher_updates (
      id INT AUTO_INCREMENT PRIMARY KEY,
      class_id INT NOT NULL,
      author_teacher_id INT NOT NULL,
      related_student_id INT NULL,
      title VARCHAR(180) NOT NULL,
      message TEXT NOT NULL,
      importance ENUM('normal','priority','urgent') NOT NULL DEFAULT 'normal',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_classroom_teacher_updates_class_created (class_id, created_at),
      INDEX idx_classroom_teacher_updates_student (related_student_id),
      CONSTRAINT fk_classroom_teacher_updates_class FOREIGN KEY (class_id) REFERENCES classes(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT fk_classroom_teacher_updates_author FOREIGN KEY (author_teacher_id) REFERENCES teachers(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT fk_classroom_teacher_updates_student FOREIGN KEY (related_student_id) REFERENCES students(id)
        ON DELETE SET NULL ON UPDATE CASCADE
    )
  `);

  collaborationReady = true;
}

async function syncPrimaryTeacherAssignments(classId = 0) {
  await ensureClassroomCollaborationSupport();

  const numericClassId = Number(classId || 0);
  const whereClause = numericClassId
    ? "WHERE c.teacher_id IS NOT NULL AND c.id = ?"
    : "WHERE c.teacher_id IS NOT NULL";
  const params = numericClassId ? [numericClassId] : [];

  await db.query(
    `
      UPDATE class_teacher_assignments cta
      INNER JOIN classes c ON c.id = cta.class_id
      SET
        cta.role = CASE
          WHEN c.teacher_id IS NOT NULL AND cta.teacher_id = c.teacher_id THEN 'lead'
          WHEN c.teacher_id IS NOT NULL AND cta.role = 'lead' AND cta.teacher_id <> c.teacher_id THEN 'co_teacher'
          ELSE cta.role
        END,
        cta.can_publish_posts = CASE
          WHEN c.teacher_id IS NOT NULL AND cta.teacher_id = c.teacher_id THEN 1
          ELSE cta.can_publish_posts
        END,
        cta.can_review_submissions = CASE
          WHEN c.teacher_id IS NOT NULL AND cta.teacher_id = c.teacher_id THEN 1
          ELSE cta.can_review_submissions
        END,
        cta.can_schedule_sessions = CASE
          WHEN c.teacher_id IS NOT NULL AND cta.teacher_id = c.teacher_id THEN 1
          ELSE cta.can_schedule_sessions
        END,
        cta.can_view_progress = CASE
          WHEN c.teacher_id IS NOT NULL AND cta.teacher_id = c.teacher_id THEN 1
          ELSE cta.can_view_progress
        END,
        cta.can_manage_team = CASE
          WHEN c.teacher_id IS NOT NULL AND cta.teacher_id = c.teacher_id THEN 1
          ELSE cta.can_manage_team
        END,
        cta.visibility_scope = CASE
          WHEN c.teacher_id IS NOT NULL AND cta.teacher_id = c.teacher_id THEN 'full'
          ELSE cta.visibility_scope
        END
      ${whereClause}
    `,
    params
  );

  await db.query(
    `
      INSERT INTO class_teacher_assignments (
        class_id,
        teacher_id,
        role,
        can_publish_posts,
        can_review_submissions,
        can_schedule_sessions,
        can_view_progress,
        can_manage_team,
        visibility_scope
      )
      SELECT
        c.id,
        c.teacher_id,
        'lead',
        1,
        1,
        1,
        1,
        1,
        'full'
      FROM classes c
      ${whereClause}
      ON DUPLICATE KEY UPDATE
        role = 'lead',
        can_publish_posts = 1,
        can_review_submissions = 1,
        can_schedule_sessions = 1,
        can_view_progress = 1,
        can_manage_team = 1,
        visibility_scope = 'full'
    `,
    params
  );
}

async function getTeacherClassroomPermission(teacherId, classId) {
  const numericTeacherId = Number(teacherId || 0);
  const numericClassId = Number(classId || 0);

  if (!numericTeacherId || !numericClassId) {
    return null;
  }

  await syncPrimaryTeacherAssignments(numericClassId);

  const [rows] = await db.query(
    `
      SELECT
        cta.*,
        c.code AS class_code,
        c.room,
        c.schedule_text,
        c.start_date,
        c.end_date,
        co.name AS course_name,
        co.category AS course_category
      FROM class_teacher_assignments cta
      INNER JOIN classes c ON c.id = cta.class_id
      LEFT JOIN courses co ON co.id = c.course_id
      WHERE cta.teacher_id = ? AND cta.class_id = ?
      LIMIT 1
    `,
    [numericTeacherId, numericClassId]
  );

  if (!rows.length) {
    return null;
  }

  return mapTeamRow(rows[0]);
}

async function assertTeacherPermission(teacherId, classId, permissionKey = "") {
  const permission = await getTeacherClassroomPermission(teacherId, classId);

  if (!permission) {
    throw new Error("Bạn không có quyền truy cập lớp học này.");
  }

  if (permissionKey && !permission[permissionKey]) {
    throw new Error("Bạn chưa được cấp quyền thực hiện thao tác này.");
  }

  return permission;
}

async function listClassTeachingTeam(classId) {
  const numericClassId = Number(classId || 0);

  if (!numericClassId) {
    return [];
  }

  await syncPrimaryTeacherAssignments(numericClassId);

  const [rows] = await db.query(
    `
      SELECT
        cta.*,
        t.full_name,
        t.email,
        t.phone,
        COUNT(DISTINCT cp.id) AS post_count,
        COUNT(DISTINCT cls.id) AS live_session_count,
        MAX(COALESCE(cls.scheduled_start, cp.created_at, cta.updated_at)) AS last_activity_at
      FROM class_teacher_assignments cta
      INNER JOIN teachers t ON t.id = cta.teacher_id
      LEFT JOIN classroom_posts cp
        ON cp.class_id = cta.class_id
        AND cp.teacher_id = cta.teacher_id
      LEFT JOIN classroom_live_sessions cls
        ON cls.class_id = cta.class_id
        AND cls.host_teacher_id = cta.teacher_id
      WHERE cta.class_id = ?
      GROUP BY
        cta.id,
        cta.class_id,
        cta.teacher_id,
        cta.role,
        cta.can_publish_posts,
        cta.can_review_submissions,
        cta.can_schedule_sessions,
        cta.can_view_progress,
        cta.can_manage_team,
        cta.visibility_scope,
        cta.created_at,
        cta.updated_at,
        t.full_name,
        t.email,
        t.phone
      ORDER BY
        CASE cta.role
          WHEN 'lead' THEN 0
          WHEN 'co_teacher' THEN 1
          WHEN 'mentor' THEN 2
          ELSE 3
        END,
        t.full_name ASC
    `,
    [numericClassId]
  );

  return rows.map(mapTeamRow);
}

async function listAssignableTeachers(classId) {
  const numericClassId = Number(classId || 0);

  if (!numericClassId) {
    return [];
  }

  await syncPrimaryTeacherAssignments(numericClassId);

  const [rows] = await db.query(
    `
      SELECT
        t.id,
        t.full_name,
        t.email,
        t.phone
      FROM teachers t
      WHERE t.id NOT IN (
        SELECT cta.teacher_id
        FROM class_teacher_assignments cta
        WHERE cta.class_id = ?
      )
      ORDER BY t.full_name ASC, t.id ASC
    `,
    [numericClassId]
  );

  return rows.map((row) => ({
    ...row,
    id: toNumber(row.id),
  }));
}

async function listClassLiveSessions(classId, options = {}) {
  const numericClassId = Number(classId || 0);

  if (!numericClassId) {
    return [];
  }

  await ensureClassroomCollaborationSupport();

  const limit = Math.max(1, Math.min(Number(options.limit || 8), 20));
  const includeCompleted = Boolean(options.includeCompleted);

  const conditions = ["cls.class_id = ?"];
  const params = [numericClassId];

  if (!includeCompleted) {
    conditions.push("cls.status IN ('scheduled','live')");
  }

  params.push(limit);

  const [rows] = await db.query(
    `
      SELECT
        cls.*,
        host.full_name AS host_teacher_name,
        creator.full_name AS created_by_teacher_name
      FROM classroom_live_sessions cls
      LEFT JOIN teachers host ON host.id = cls.host_teacher_id
      LEFT JOIN teachers creator ON creator.id = cls.created_by_teacher_id
      WHERE ${conditions.join(" AND ")}
      ORDER BY
        CASE
          WHEN cls.status = 'live' THEN 0
          WHEN cls.status = 'scheduled' AND cls.scheduled_start >= NOW() THEN 1
          WHEN cls.status = 'scheduled' THEN 2
          WHEN cls.status = 'completed' THEN 3
          ELSE 4
        END,
        CASE
          WHEN cls.status IN ('completed', 'canceled') THEN cls.scheduled_start
          ELSE NULL
        END DESC,
        CASE
          WHEN cls.status IN ('scheduled', 'live') THEN cls.scheduled_start
          ELSE NULL
        END ASC,
        cls.id DESC
      LIMIT ?
    `,
    params
  );

  return rows.map(mapLiveSessionRow);
}

async function listClassTeacherUpdates(classId, options = {}) {
  const numericClassId = Number(classId || 0);

  if (!numericClassId) {
    return [];
  }

  await ensureClassroomCollaborationSupport();

  const limit = Math.max(1, Math.min(Number(options.limit || 8), 20));
  const [rows] = await db.query(
    `
      SELECT
        ctu.*,
        t.full_name AS author_teacher_name,
        s.full_name AS related_student_name
      FROM classroom_teacher_updates ctu
      LEFT JOIN teachers t ON t.id = ctu.author_teacher_id
      LEFT JOIN students s ON s.id = ctu.related_student_id
      WHERE ctu.class_id = ?
      ORDER BY
        CASE ctu.importance
          WHEN 'urgent' THEN 0
          WHEN 'priority' THEN 1
          ELSE 2
        END,
        ctu.created_at DESC,
        ctu.id DESC
      LIMIT ?
    `,
    [numericClassId, limit]
  );

  return rows.map(mapTeacherUpdateRow);
}

async function getClassroomCollaborationData(classId, options = {}) {
  const numericClassId = Number(classId || 0);

  if (!numericClassId) {
    return {
      teachingTeam: [],
      assignableTeachers: [],
      liveSessions: [],
      teacherUpdates: [],
    };
  }

  const includeAssignableTeachers = Boolean(options.includeAssignableTeachers);
  const [teachingTeam, liveSessions, teacherUpdates, assignableTeachers] = await Promise.all([
    listClassTeachingTeam(numericClassId),
    listClassLiveSessions(numericClassId, { includeCompleted: true, limit: 10 }),
    listClassTeacherUpdates(numericClassId, { limit: 8 }),
    includeAssignableTeachers ? listAssignableTeachers(numericClassId) : Promise.resolve([]),
  ]);

  return {
    teachingTeam,
    liveSessions,
    teacherUpdates,
    assignableTeachers,
  };
}

async function assignTeacherToClass({
  actingTeacherId,
  classId,
  teacherId,
  role,
}) {
  const numericClassId = Number(classId || 0);
  const numericTeacherId = Number(teacherId || 0);

  if (!numericClassId || !numericTeacherId) {
    throw new Error("Thiếu thông tin giáo viên hoặc lớp học.");
  }

  await assertTeacherPermission(actingTeacherId, numericClassId, "can_manage_team");

  const [teacherRows] = await db.query(
    "SELECT id FROM teachers WHERE id = ? LIMIT 1",
    [numericTeacherId]
  );

  if (!teacherRows.length) {
    throw new Error("Không tìm thấy giáo viên cần thêm vào lớp.");
  }

  const defaults = getRoleDefaults(role);
  await db.query(
    `
      INSERT INTO class_teacher_assignments (
        class_id,
        teacher_id,
        role,
        can_publish_posts,
        can_review_submissions,
        can_schedule_sessions,
        can_view_progress,
        can_manage_team,
        visibility_scope
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        role = VALUES(role),
        can_publish_posts = VALUES(can_publish_posts),
        can_review_submissions = VALUES(can_review_submissions),
        can_schedule_sessions = VALUES(can_schedule_sessions),
        can_view_progress = VALUES(can_view_progress),
        can_manage_team = VALUES(can_manage_team),
        visibility_scope = VALUES(visibility_scope)
    `,
    [
      numericClassId,
      numericTeacherId,
      defaults.role,
      defaults.can_publish_posts,
      defaults.can_review_submissions,
      defaults.can_schedule_sessions,
      defaults.can_view_progress,
      defaults.can_manage_team,
      defaults.visibility_scope,
    ]
  );

  return getTeacherClassroomPermission(numericTeacherId, numericClassId);
}

async function createLiveSession({
  actingTeacherId,
  classId,
  title,
  description,
  meetingProvider,
  meetingUrl,
  accessNote,
  scheduledStart,
  scheduledEnd,
  hostTeacherId,
  recordingUrl,
}) {
  const numericClassId = Number(classId || 0);
  const normalizedTitle = String(title || "").trim();
  const normalizedUrl = String(meetingUrl || "").trim();
  const normalizedStart = normalizeDateTime(scheduledStart);
  const normalizedEnd = normalizeDateTime(scheduledEnd);
  const numericHostTeacherId = Number(hostTeacherId || actingTeacherId || 0);

  if (!numericClassId || !normalizedTitle || !normalizedUrl || !normalizedStart) {
    throw new Error("Cần nhập đủ tiêu đề, thời gian và liên kết buổi học online.");
  }

  await assertTeacherPermission(actingTeacherId, numericClassId, "can_schedule_sessions");

  const hostPermission = await getTeacherClassroomPermission(numericHostTeacherId, numericClassId);
  if (!hostPermission) {
    throw new Error("Giáo viên host chưa thuộc đội ngũ phụ trách lớp này.");
  }

  const [result] = await db.query(
    `
      INSERT INTO classroom_live_sessions (
        class_id,
        created_by_teacher_id,
        host_teacher_id,
        title,
        description,
        meeting_provider,
        meeting_url,
        access_note,
        scheduled_start,
        scheduled_end,
        status,
        recording_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'scheduled', ?)
    `,
    [
      numericClassId,
      Number(actingTeacherId || 0),
      numericHostTeacherId,
      normalizedTitle,
      String(description || "").trim() || null,
      normalizeMeetingProvider(meetingProvider),
      normalizedUrl,
      String(accessNote || "").trim() || null,
      normalizedStart,
      normalizedEnd,
      String(recordingUrl || "").trim() || null,
    ]
  );

  return toNumber(result.insertId);
}

async function createTeacherUpdate({
  actingTeacherId,
  classId,
  title,
  message,
  importance,
  relatedStudentId,
}) {
  const numericClassId = Number(classId || 0);
  const normalizedTitle = String(title || "").trim();
  const normalizedMessage = String(message || "").trim();
  const numericStudentId = Number(relatedStudentId || 0);

  if (!numericClassId || !normalizedTitle || !normalizedMessage) {
    throw new Error("Cần nhập đủ tiêu đề và nội dung ghi chú phối hợp.");
  }

  await assertTeacherPermission(actingTeacherId, numericClassId, "");

  if (numericStudentId) {
    const [studentRows] = await db.query(
      `
        SELECT student_id
        FROM enrollments
        WHERE class_id = ? AND student_id = ?
        LIMIT 1
      `,
      [numericClassId, numericStudentId]
    );

    if (!studentRows.length) {
      throw new Error("Học viên liên quan không thuộc lớp này.");
    }
  }

  const [result] = await db.query(
    `
      INSERT INTO classroom_teacher_updates (
        class_id,
        author_teacher_id,
        related_student_id,
        title,
        message,
        importance
      ) VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      numericClassId,
      Number(actingTeacherId || 0),
      numericStudentId || null,
      normalizedTitle,
      normalizedMessage,
      normalizeImportance(importance),
    ]
  );

  return toNumber(result.insertId);
}

module.exports = {
  assertTeacherPermission,
  assignTeacherToClass,
  createLiveSession,
  createTeacherUpdate,
  ensureClassroomCollaborationSupport,
  getClassroomCollaborationData,
  getMeetingProviderLabel,
  getRoleLabel,
  getTeacherClassroomPermission,
  listAssignableTeachers,
  listClassLiveSessions,
  listClassTeacherUpdates,
  listClassTeachingTeam,
  syncPrimaryTeacherAssignments,
};
