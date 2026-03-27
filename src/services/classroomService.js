const db = require("../models/db");
const {
  ensurePlatformSupport,
  ensureStudentSubmissionRecord,
  persistMaterialFiles,
  persistSubmissionFiles,
} = require("./platformSupport");

function toNumber(value, fallback = 0) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
}

function normalizeDateTimeInput(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(raw)) {
    return raw.replace("T", " ") + ":00";
  }

  return raw;
}

function mapBy(items, key) {
  return items.reduce((accumulator, item) => {
    const mapKey = item[key];
    if (!accumulator.has(mapKey)) {
      accumulator.set(mapKey, []);
    }
    accumulator.get(mapKey).push(item);
    return accumulator;
  }, new Map());
}

async function getMaterialsByPostIds(postIds = []) {
  await ensurePlatformSupport();

  if (!postIds.length) {
    return new Map();
  }

  const [rows] = await db.query(
    `
      SELECT *
      FROM classroom_materials
      WHERE post_id IN (?)
      ORDER BY id ASC
    `,
    [postIds]
  );

  return mapBy(rows, "post_id");
}

async function getSubmissionFilesBySubmissionIds(submissionIds = []) {
  await ensurePlatformSupport();

  if (!submissionIds.length) {
    return new Map();
  }

  const [rows] = await db.query(
    `
      SELECT *
      FROM classroom_submission_files
      WHERE submission_id IN (?)
      ORDER BY id ASC
    `,
    [submissionIds]
  );

  return mapBy(rows, "submission_id");
}

async function getTeacherClassroomList(teacherId) {
  await ensurePlatformSupport();

  const [rows] = await db.query(
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
        COUNT(DISTINCT CASE WHEN e.status = 'active' THEN e.id END) AS student_count,
        COUNT(DISTINCT CASE WHEN cp.post_type = 'lecture' THEN cp.id END) AS lecture_count,
        COUNT(DISTINCT CASE WHEN cp.post_type = 'assignment' THEN cp.id END) AS assignment_count,
        COUNT(DISTINCT CASE WHEN cs.status IN ('submitted', 'completed', 'reviewed') THEN cs.id END) AS submission_count,
        COUNT(DISTINCT CASE WHEN cs.status = 'reviewed' THEN cs.id END) AS reviewed_count,
        MAX(cp.created_at) AS latest_post_at
      FROM classes c
      LEFT JOIN courses co ON co.id = c.course_id
      LEFT JOIN enrollments e ON e.class_id = c.id
      LEFT JOIN classroom_posts cp ON cp.class_id = c.id
      LEFT JOIN classroom_submissions cs ON cs.post_id = cp.id
      WHERE c.teacher_id = ?
      GROUP BY
        c.id,
        c.code,
        c.room,
        c.schedule_text,
        c.start_date,
        c.end_date,
        co.name,
        co.category
      ORDER BY COALESCE(c.start_date, c.created_at) DESC, c.id DESC
    `,
    [teacherId]
  );

  return rows.map((row) => ({
    ...row,
    student_count: toNumber(row.student_count),
    lecture_count: toNumber(row.lecture_count),
    assignment_count: toNumber(row.assignment_count),
    submission_count: toNumber(row.submission_count),
    reviewed_count: toNumber(row.reviewed_count),
  }));
}

async function getTeacherClassroomHome(teacherId, classId) {
  await ensurePlatformSupport();

  const [classRows] = await db.query(
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
        COUNT(DISTINCT CASE WHEN e.status = 'active' THEN e.id END) AS student_count,
        COUNT(DISTINCT CASE WHEN cp.post_type = 'lecture' THEN cp.id END) AS lecture_count,
        COUNT(DISTINCT CASE WHEN cp.post_type = 'assignment' THEN cp.id END) AS assignment_count
      FROM classes c
      LEFT JOIN courses co ON co.id = c.course_id
      LEFT JOIN enrollments e ON e.class_id = c.id
      LEFT JOIN classroom_posts cp ON cp.class_id = c.id
      WHERE c.id = ? AND c.teacher_id = ?
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
    [classId, teacherId]
  );

  const classInfo = classRows[0] || null;
  if (!classInfo) {
    return null;
  }

  const [postRows] = await db.query(
    `
      SELECT
        cp.id,
        cp.title,
        cp.description,
        cp.post_type,
        cp.due_date,
        cp.created_at,
        cp.updated_at,
        COUNT(DISTINCT cm.id) AS material_count,
        COUNT(DISTINCT CASE WHEN cs.status IN ('submitted', 'completed', 'reviewed') THEN cs.id END) AS turned_in_count,
        COUNT(DISTINCT CASE WHEN cs.status = 'reviewed' THEN cs.id END) AS reviewed_count,
        MAX(cs.submitted_at) AS latest_submission_at
      FROM classroom_posts cp
      LEFT JOIN classroom_materials cm ON cm.post_id = cp.id
      LEFT JOIN classroom_submissions cs ON cs.post_id = cp.id
      WHERE cp.class_id = ?
      GROUP BY
        cp.id,
        cp.title,
        cp.description,
        cp.post_type,
        cp.due_date,
        cp.created_at,
        cp.updated_at
      ORDER BY cp.created_at DESC, cp.id DESC
    `,
    [classId]
  );

  const [studentRows] = await db.query(
    `
      SELECT
        s.id,
        s.full_name,
        s.email,
        s.phone,
        e.status AS enrollment_status
      FROM enrollments e
      INNER JOIN students s ON s.id = e.student_id
      WHERE e.class_id = ? AND e.status = 'active'
      ORDER BY s.full_name ASC
    `,
    [classId]
  );

  const materialsMap = await getMaterialsByPostIds(postRows.map((row) => row.id));
  const posts = postRows.map((row) => ({
    ...row,
    material_count: toNumber(row.material_count),
    turned_in_count: toNumber(row.turned_in_count),
    reviewed_count: toNumber(row.reviewed_count),
    materials: materialsMap.get(row.id) || [],
  }));

  return {
    classInfo: {
      ...classInfo,
      student_count: toNumber(classInfo.student_count),
      lecture_count: toNumber(classInfo.lecture_count),
      assignment_count: toNumber(classInfo.assignment_count),
    },
    posts,
    students: studentRows,
  };
}

async function createClassroomPost({
  teacherId,
  classId,
  title,
  description,
  postType,
  dueDate,
  files = [],
}) {
  await ensurePlatformSupport();

  const [classRows] = await db.query(
    `
      SELECT id
      FROM classes
      WHERE id = ? AND teacher_id = ?
      LIMIT 1
    `,
    [classId, teacherId]
  );

  if (!classRows.length) {
    throw new Error("Ban khong co quyen dang bai cho lop hoc nay.");
  }

  const normalizedPostType = postType === "assignment" ? "assignment" : "lecture";
  const [result] = await db.query(
    `
      INSERT INTO classroom_posts (
        class_id,
        teacher_id,
        title,
        description,
        post_type,
        due_date
      ) VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      classId,
      teacherId,
      String(title || "").trim(),
      String(description || "").trim() || null,
      normalizedPostType,
      normalizedPostType === "assignment" ? normalizeDateTimeInput(dueDate) : null,
    ]
  );

  const postId = result.insertId;
  await persistMaterialFiles(postId, files);

  if (normalizedPostType === "assignment") {
    const [students] = await db.query(
      `
        SELECT student_id
        FROM enrollments
        WHERE class_id = ? AND status = 'active'
      `,
      [classId]
    );

    for (const row of students) {
      await ensureStudentSubmissionRecord(postId, row.student_id);
    }
  }

  return postId;
}

async function getTeacherAssignmentBoard(teacherId, classId, postId) {
  await ensurePlatformSupport();

  const [postRows] = await db.query(
    `
      SELECT
        cp.*,
        c.code AS class_code,
        c.room,
        c.schedule_text,
        co.name AS course_name
      FROM classroom_posts cp
      INNER JOIN classes c ON c.id = cp.class_id
      LEFT JOIN courses co ON co.id = c.course_id
      WHERE cp.id = ? AND cp.class_id = ? AND c.teacher_id = ?
      LIMIT 1
    `,
    [postId, classId, teacherId]
  );

  const post = postRows[0] || null;
  if (!post) {
    return null;
  }

  const materialsMap = await getMaterialsByPostIds([postId]);
  const materials = materialsMap.get(postId) || [];

  const [studentRows] = await db.query(
    `
      SELECT
        s.id AS student_id,
        s.full_name,
        s.email,
        s.phone,
        COALESCE(cs.id, 0) AS submission_id,
        COALESCE(cs.status, 'assigned') AS submission_status,
        cs.student_note,
        cs.teacher_feedback,
        cs.teacher_score,
        cs.submitted_at,
        cs.completed_at,
        cs.reviewed_at
      FROM enrollments e
      INNER JOIN students s ON s.id = e.student_id
      LEFT JOIN classroom_submissions cs
        ON cs.post_id = ? AND cs.student_id = s.id
      WHERE e.class_id = ? AND e.status = 'active'
      ORDER BY s.full_name ASC
    `,
    [postId, classId]
  );

  const submissionIds = studentRows
    .map((row) => toNumber(row.submission_id))
    .filter((value) => value > 0);
  const submissionFilesMap = await getSubmissionFilesBySubmissionIds(submissionIds);
  const students = studentRows.map((row) => ({
    ...row,
    submission_id: toNumber(row.submission_id),
    files: submissionFilesMap.get(toNumber(row.submission_id)) || [],
  }));

  return {
    post: {
      ...post,
      materials,
    },
    students,
  };
}

async function saveTeacherReview({
  teacherId,
  classId,
  postId,
  studentId,
  teacherFeedback,
  teacherScore,
}) {
  await ensurePlatformSupport();

  const [postRows] = await db.query(
    `
      SELECT cp.id
      FROM classroom_posts cp
      INNER JOIN classes c ON c.id = cp.class_id
      WHERE cp.id = ? AND cp.class_id = ? AND c.teacher_id = ?
      LIMIT 1
    `,
    [postId, classId, teacherId]
  );

  if (!postRows.length) {
    throw new Error("Ban khong co quyen cham bai nay.");
  }

  const submission = await ensureStudentSubmissionRecord(postId, studentId);
  const normalizedScore = String(teacherScore || "").trim();
  const safeScore = normalizedScore && Number.isFinite(Number(normalizedScore))
    ? Number(normalizedScore)
    : null;

  await db.query(
    `
      UPDATE classroom_submissions
      SET
        teacher_feedback = ?,
        teacher_score = ?,
        status = 'reviewed',
        reviewed_at = NOW()
      WHERE id = ?
    `,
    [
      String(teacherFeedback || "").trim() || null,
      safeScore,
      submission.id,
    ]
  );
}

async function getStudentClassroomList(studentId) {
  await ensurePlatformSupport();

  const [rows] = await db.query(
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
        t.full_name AS teacher_name,
        COUNT(DISTINCT CASE WHEN cp.post_type = 'lecture' THEN cp.id END) AS lecture_count,
        COUNT(DISTINCT CASE WHEN cp.post_type = 'assignment' THEN cp.id END) AS assignment_count,
        COUNT(DISTINCT CASE WHEN cs.status IN ('submitted', 'completed', 'reviewed') THEN cp.id END) AS submitted_count,
        MAX(cp.created_at) AS latest_post_at
      FROM enrollments e
      INNER JOIN classes c ON c.id = e.class_id
      LEFT JOIN courses co ON co.id = c.course_id
      LEFT JOIN teachers t ON t.id = c.teacher_id
      LEFT JOIN classroom_posts cp ON cp.class_id = c.id
      LEFT JOIN classroom_submissions cs
        ON cs.post_id = cp.id
        AND cs.student_id = ?
      WHERE e.student_id = ? AND e.status = 'active'
      GROUP BY
        c.id,
        c.code,
        c.room,
        c.schedule_text,
        c.start_date,
        c.end_date,
        co.name,
        co.category,
        t.full_name
      ORDER BY COALESCE(c.start_date, c.created_at) DESC, c.id DESC
    `,
    [studentId, studentId]
  );

  return rows.map((row) => ({
    ...row,
    lecture_count: toNumber(row.lecture_count),
    assignment_count: toNumber(row.assignment_count),
    submitted_count: toNumber(row.submitted_count),
  }));
}

async function getStudentClassroomFeed(studentId, classId) {
  await ensurePlatformSupport();

  const [classRows] = await db.query(
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
        t.full_name AS teacher_name
      FROM enrollments e
      INNER JOIN classes c ON c.id = e.class_id
      LEFT JOIN courses co ON co.id = c.course_id
      LEFT JOIN teachers t ON t.id = c.teacher_id
      WHERE e.class_id = ? AND e.student_id = ? AND e.status = 'active'
      LIMIT 1
    `,
    [classId, studentId]
  );

  const classInfo = classRows[0] || null;
  if (!classInfo) {
    return null;
  }

  const [postRows] = await db.query(
    `
      SELECT
        cp.id,
        cp.title,
        cp.description,
        cp.post_type,
        cp.due_date,
        cp.created_at,
        COUNT(DISTINCT cm.id) AS material_count,
        cs.id AS submission_id,
        COALESCE(cs.status, 'assigned') AS my_status,
        cs.student_note,
        cs.teacher_feedback,
        cs.teacher_score,
        cs.submitted_at,
        cs.completed_at,
        cs.reviewed_at
      FROM classroom_posts cp
      LEFT JOIN classroom_materials cm ON cm.post_id = cp.id
      LEFT JOIN classroom_submissions cs
        ON cs.post_id = cp.id
        AND cs.student_id = ?
      WHERE cp.class_id = ?
      GROUP BY
        cp.id,
        cp.title,
        cp.description,
        cp.post_type,
        cp.due_date,
        cp.created_at,
        cs.id,
        cs.status,
        cs.student_note,
        cs.teacher_feedback,
        cs.teacher_score,
        cs.submitted_at,
        cs.completed_at,
        cs.reviewed_at
      ORDER BY cp.created_at DESC, cp.id DESC
    `,
    [studentId, classId]
  );

  const materialsMap = await getMaterialsByPostIds(postRows.map((row) => row.id));

  const posts = postRows.map((row) => ({
    ...row,
    material_count: toNumber(row.material_count),
    submission_id: toNumber(row.submission_id),
    materials: materialsMap.get(row.id) || [],
  }));

  return {
    classInfo,
    posts,
  };
}

async function getStudentPostDetail(studentId, classId, postId) {
  await ensurePlatformSupport();

  const [postRows] = await db.query(
    `
      SELECT
        cp.*,
        c.code AS class_code,
        c.room,
        c.schedule_text,
        co.name AS course_name,
        t.full_name AS teacher_name
      FROM enrollments e
      INNER JOIN classes c ON c.id = e.class_id
      INNER JOIN classroom_posts cp ON cp.class_id = c.id
      LEFT JOIN courses co ON co.id = c.course_id
      LEFT JOIN teachers t ON t.id = c.teacher_id
      WHERE e.student_id = ? AND e.class_id = ? AND cp.id = ? AND e.status = 'active'
      LIMIT 1
    `,
    [studentId, classId, postId]
  );

  const post = postRows[0] || null;
  if (!post) {
    return null;
  }

  const materialsMap = await getMaterialsByPostIds([postId]);
  let submission = null;

  if (post.post_type === "assignment") {
    submission = await ensureStudentSubmissionRecord(postId, studentId);
  }

  const submissionFilesMap = await getSubmissionFilesBySubmissionIds(
    submission ? [submission.id] : []
  );

  return {
    post: {
      ...post,
      materials: materialsMap.get(postId) || [],
    },
    submission: submission
      ? {
          ...submission,
          files: submissionFilesMap.get(submission.id) || [],
        }
      : null,
  };
}

async function saveStudentSubmission({
  studentId,
  classId,
  postId,
  note,
  files = [],
  markComplete = false,
}) {
  await ensurePlatformSupport();

  const [postRows] = await db.query(
    `
      SELECT cp.id, cp.post_type
      FROM enrollments e
      INNER JOIN classroom_posts cp ON cp.class_id = e.class_id
      WHERE e.student_id = ? AND e.class_id = ? AND cp.id = ? AND e.status = 'active'
      LIMIT 1
    `,
    [studentId, classId, postId]
  );

  const post = postRows[0] || null;
  if (!post || post.post_type !== "assignment") {
    throw new Error("Không tìm thấy bài tập hợp lệ để nộp bài.");
  }

  const submission = await ensureStudentSubmissionRecord(postId, studentId);
  const nextStatus = markComplete ? "completed" : "submitted";

  await db.query(
    `
      UPDATE classroom_submissions
      SET
        student_note = ?,
        status = ?,
        submitted_at = COALESCE(submitted_at, NOW()),
        teacher_feedback = NULL,
        teacher_score = NULL,
        reviewed_at = NULL,
        completed_at = CASE
          WHEN ? = 'completed' THEN NOW()
          ELSE NULL
        END
      WHERE id = ?
    `,
    [String(note || "").trim() || null, nextStatus, nextStatus, submission.id]
  );

  await persistSubmissionFiles(submission.id, files);
}

async function markStudentSubmissionComplete({
  studentId,
  classId,
  postId,
}) {
  await ensurePlatformSupport();

  const [postRows] = await db.query(
    `
      SELECT cp.id, cp.post_type
      FROM enrollments e
      INNER JOIN classroom_posts cp ON cp.class_id = e.class_id
      WHERE e.student_id = ? AND e.class_id = ? AND cp.id = ? AND e.status = 'active'
      LIMIT 1
    `,
    [studentId, classId, postId]
  );

  const post = postRows[0] || null;
  if (!post || post.post_type !== "assignment") {
    throw new Error("Không tìm thấy bài tập hợp lệ.");
  }

  const submission = await ensureStudentSubmissionRecord(postId, studentId);

  await db.query(
    `
      UPDATE classroom_submissions
      SET
        status = 'completed',
        submitted_at = COALESCE(submitted_at, NOW()),
        completed_at = NOW()
      WHERE id = ?
    `,
    [submission.id]
  );
}

module.exports = {
  createClassroomPost,
  getStudentClassroomFeed,
  getStudentClassroomList,
  getStudentPostDetail,
  getTeacherAssignmentBoard,
  getTeacherClassroomHome,
  getTeacherClassroomList,
  markStudentSubmissionComplete,
  saveStudentSubmission,
  saveTeacherReview,
};
