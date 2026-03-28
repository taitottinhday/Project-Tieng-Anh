const bcrypt = require("bcrypt");
const db = require("../models/db");
const { createStudentNotification } = require("./studentNotificationService");

const USER_ROLES = new Set(["user", "teacher", "admin"]);
const ENROLLMENT_STATUSES = new Set(["pending", "active", "completed", "canceled"]);
const PAYMENT_STATUSES = new Set(["pending", "confirmed", "rejected"]);
const PAYMENT_METHODS = new Set(["cash", "bank", "momo", "other"]);

function trimText(value) {
  return String(value || "").trim();
}

function normalizeEmail(value) {
  return trimText(value).toLowerCase();
}

function normalizeNullableText(value) {
  const normalized = trimText(value);
  return normalized || null;
}

function normalizeNullableDate(value) {
  const normalized = trimText(value);
  return normalized || null;
}

function normalizeBoolean(value, fallback = false) {
  if (typeof value === "boolean") {
    return value;
  }

  const normalized = trimText(value).toLowerCase();
  if (!normalized) {
    return fallback;
  }

  return ["1", "true", "on", "yes"].includes(normalized);
}

function normalizeEnum(value, allowedValues, fallback) {
  const normalized = trimText(value);
  return allowedValues.has(normalized) ? normalized : fallback;
}

function normalizeIdArray(value) {
  const source = Array.isArray(value) ? value : [value];
  return Array.from(
    new Set(
      source
        .flatMap((item) => String(item || "").split(","))
        .map((item) => Number(item))
        .filter((item) => Number.isInteger(item) && item > 0)
    )
  );
}

function normalizeMoney(value, fallback = 0) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue) || numericValue < 0) {
    return fallback;
  }

  return Math.round(numericValue);
}

async function findUserByEmail(email, executor = db) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    return null;
  }

  const [rows] = await executor.query(
    "SELECT id, username, email, role FROM users WHERE email = ? LIMIT 1",
    [normalizedEmail]
  );

  return rows[0] || null;
}

async function ensurePortalUser({
  email,
  username,
  password,
  role,
  allowExistingRole = null,
}, executor = db) {
  const normalizedEmail = normalizeEmail(email);
  const normalizedUsername = trimText(username);
  const normalizedPassword = String(password || "");
  const normalizedRole = trimText(role);

  if (!normalizedEmail) {
    throw new Error("Can nhap email de tao tai khoan portal.");
  }

  if (!USER_ROLES.has(normalizedRole)) {
    throw new Error("Vai tro tai khoan khong hop le.");
  }

  const existingUser = await findUserByEmail(normalizedEmail, executor);
  if (existingUser) {
    if (allowExistingRole && existingUser.role !== allowExistingRole) {
      throw new Error("Email nay da duoc dung cho mot vai tro khac.");
    }

    if (existingUser.role !== normalizedRole) {
      throw new Error("Email nay da ton tai voi vai tro khac, khong the gan tu dong.");
    }

    return existingUser;
  }

  if (!normalizedPassword || normalizedPassword.length < 6) {
    throw new Error("Mat khau tai khoan portal can toi thieu 6 ky tu.");
  }

  const passwordHash = await bcrypt.hash(normalizedPassword, 10);
  const [result] = await executor.query(
    `
      INSERT INTO users (username, email, password, role)
      VALUES (?, ?, ?, ?)
    `,
    [
      normalizedUsername || normalizedEmail.split("@")[0],
      normalizedEmail,
      passwordHash,
      normalizedRole,
    ]
  );

  return {
    id: Number(result.insertId || 0),
    username: normalizedUsername || normalizedEmail.split("@")[0],
    email: normalizedEmail,
    role: normalizedRole,
  };
}

async function findStudentProfile({ userId, email, phone, fullName }, executor = db) {
  const conditions = [];
  const params = [];
  const numericUserId = Number(userId || 0);
  const normalizedEmail = normalizeEmail(email);
  const normalizedPhone = trimText(phone);
  const normalizedFullName = trimText(fullName);

  if (numericUserId) {
    conditions.push("s.user_id = ?");
    params.push(numericUserId);
  }

  if (normalizedEmail) {
    conditions.push("LOWER(TRIM(s.email)) = ?");
    params.push(normalizedEmail);
  }

  if (normalizedPhone && normalizedFullName) {
    conditions.push("(TRIM(s.phone) = ? AND TRIM(s.full_name) = ?)");
    params.push(normalizedPhone, normalizedFullName);
  }

  if (!conditions.length) {
    return null;
  }

  const [rows] = await executor.query(
    `
      SELECT s.*
      FROM students s
      WHERE ${conditions.join(" OR ")}
      ORDER BY
        CASE WHEN s.user_id = ? THEN 0 ELSE 1 END,
        s.id ASC
      LIMIT 1
    `,
    [...params, numericUserId]
  );

  return rows[0] || null;
}

async function upsertStudentProfile(payload = {}, executor = db) {
  const fullName = trimText(payload.fullName || payload.full_name);
  const phone = normalizeNullableText(payload.phone);
  const email = normalizeNullableText(normalizeEmail(payload.email));
  const dob = normalizeNullableDate(payload.dob);
  const userId = Number(payload.userId || payload.user_id || 0) || null;

  if (!fullName) {
    throw new Error("Ho ten hoc vien la bat buoc.");
  }

  const existingStudent = await findStudentProfile({
    userId,
    email,
    phone,
    fullName,
  }, executor);

  if (existingStudent) {
    await executor.query(
      `
        UPDATE students
        SET user_id = ?, full_name = ?, phone = ?, email = ?, dob = ?
        WHERE id = ?
      `,
      [
        userId,
        fullName,
        phone,
        email,
        dob,
        existingStudent.id,
      ]
    );

    const [rows] = await executor.query(
      "SELECT * FROM students WHERE id = ? LIMIT 1",
      [existingStudent.id]
    );

    return rows[0] || existingStudent;
  }

  const [result] = await executor.query(
    `
      INSERT INTO students (user_id, full_name, phone, email, dob)
      VALUES (?, ?, ?, ?, ?)
    `,
    [userId, fullName, phone, email, dob]
  );

  const [rows] = await executor.query(
    "SELECT * FROM students WHERE id = ? LIMIT 1",
    [result.insertId]
  );

  return rows[0] || null;
}

async function findTeacherProfile({ userId, email, phone, fullName }, executor = db) {
  const conditions = [];
  const params = [];
  const numericUserId = Number(userId || 0);
  const normalizedEmail = normalizeEmail(email);
  const normalizedPhone = trimText(phone);
  const normalizedFullName = trimText(fullName);

  if (numericUserId) {
    conditions.push("t.user_id = ?");
    params.push(numericUserId);
  }

  if (normalizedEmail) {
    conditions.push("LOWER(TRIM(t.email)) = ?");
    params.push(normalizedEmail);
  }

  if (normalizedPhone && normalizedFullName) {
    conditions.push("(TRIM(t.phone) = ? AND TRIM(t.full_name) = ?)");
    params.push(normalizedPhone, normalizedFullName);
  }

  if (!conditions.length) {
    return null;
  }

  const [rows] = await executor.query(
    `
      SELECT t.*
      FROM teachers t
      WHERE ${conditions.join(" OR ")}
      ORDER BY
        CASE WHEN t.user_id = ? THEN 0 ELSE 1 END,
        t.id ASC
      LIMIT 1
    `,
    [...params, numericUserId]
  );

  return rows[0] || null;
}

async function upsertTeacherProfile(payload = {}, executor = db) {
  const fullName = trimText(payload.fullName || payload.full_name);
  const phone = normalizeNullableText(payload.phone);
  const email = normalizeNullableText(normalizeEmail(payload.email));
  const userId = Number(payload.userId || payload.user_id || 0) || null;

  if (!fullName) {
    throw new Error("Ho ten giao vien la bat buoc.");
  }

  const existingTeacher = await findTeacherProfile({
    userId,
    email,
    phone,
    fullName,
  }, executor);

  if (existingTeacher) {
    await executor.query(
      `
        UPDATE teachers
        SET user_id = ?, full_name = ?, phone = ?, email = ?
        WHERE id = ?
      `,
      [
        userId,
        fullName,
        phone,
        email,
        existingTeacher.id,
      ]
    );

    const [rows] = await executor.query(
      "SELECT * FROM teachers WHERE id = ? LIMIT 1",
      [existingTeacher.id]
    );

    return rows[0] || existingTeacher;
  }

  const [result] = await executor.query(
    `
      INSERT INTO teachers (user_id, full_name, phone, email)
      VALUES (?, ?, ?, ?)
    `,
    [userId, fullName, phone, email]
  );

  const [rows] = await executor.query(
    "SELECT * FROM teachers WHERE id = ? LIMIT 1",
    [result.insertId]
  );

  return rows[0] || null;
}

async function getClassInfo(classId, executor = db) {
  const numericClassId = Number(classId || 0);
  if (!numericClassId) {
    throw new Error("Lop hoc khong hop le.");
  }

  const [rows] = await executor.query(
    `
      SELECT
        c.id,
        c.code,
        c.course_id,
        c.teacher_id,
        co.name AS course_name,
        co.fee AS course_fee
      FROM classes c
      LEFT JOIN courses co ON co.id = c.course_id
      WHERE c.id = ?
      LIMIT 1
    `,
    [numericClassId]
  );

  const classInfo = rows[0] || null;
  if (!classInfo) {
    throw new Error("Khong tim thay lop hoc duoc chon.");
  }

  return classInfo;
}

async function validateClassIds(classIds = [], executor = db) {
  const normalizedIds = normalizeIdArray(classIds);
  if (!normalizedIds.length) {
    return [];
  }

  const [rows] = await executor.query(
    `
      SELECT id
      FROM classes
      WHERE id IN (?)
    `,
    [normalizedIds]
  );

  if (rows.length !== normalizedIds.length) {
    throw new Error("Danh sach lop duoc gan co muc khong ton tai.");
  }

  return normalizedIds;
}

async function seedClassroomAssignments(classId, studentId, executor = db) {
  const numericClassId = Number(classId || 0);
  const numericStudentId = Number(studentId || 0);

  if (!numericClassId || !numericStudentId) {
    return 0;
  }

  const [posts] = await executor.query(
    `
      SELECT id
      FROM classroom_posts
      WHERE class_id = ?
        AND post_type = 'assignment'
    `,
    [numericClassId]
  );

  for (const post of posts) {
    await executor.query(
      `
        INSERT INTO classroom_submissions (post_id, student_id, status)
        VALUES (?, ?, 'assigned')
        ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)
      `,
      [post.id, numericStudentId]
    );
  }

  return posts.length;
}

async function upsertEnrollment({
  studentId,
  classId,
  status,
}, executor = db) {
  const normalizedStatus = normalizeEnum(status, ENROLLMENT_STATUSES, "active");
  const numericStudentId = Number(studentId || 0);
  const numericClassId = Number(classId || 0);

  if (!numericStudentId || !numericClassId) {
    throw new Error("Thong tin ghi danh khong hop le.");
  }

  const [rows] = await executor.query(
    `
      SELECT id, status
      FROM enrollments
      WHERE student_id = ? AND class_id = ?
      LIMIT 1
    `,
    [numericStudentId, numericClassId]
  );

  if (rows.length) {
    await executor.query(
      `
        UPDATE enrollments
        SET status = ?
        WHERE id = ?
      `,
      [normalizedStatus, rows[0].id]
    );

    return {
      id: Number(rows[0].id || 0),
      status: normalizedStatus,
      updated: true,
    };
  }

  const [result] = await executor.query(
    `
      INSERT INTO enrollments (student_id, class_id, status)
      VALUES (?, ?, ?)
    `,
    [numericStudentId, numericClassId, normalizedStatus]
  );

  return {
    id: Number(result.insertId || 0),
    status: normalizedStatus,
    updated: false,
  };
}

async function createPaymentRecord({
  enrollmentId,
  amount,
  method,
  status,
  note,
}, executor = db) {
  const numericEnrollmentId = Number(enrollmentId || 0);
  if (!numericEnrollmentId) {
    return null;
  }

  const normalizedMethod = normalizeEnum(method, PAYMENT_METHODS, "cash");
  const normalizedStatus = normalizeEnum(status, PAYMENT_STATUSES, "confirmed");
  const normalizedAmount = normalizeMoney(amount, 0);
  const normalizedNote = normalizeNullableText(note);

  if (!normalizedAmount && !normalizedNote) {
    return null;
  }

  const [result] = await executor.query(
    `
      INSERT INTO payments (enrollment_id, amount, method, status, note)
      VALUES (?, ?, ?, ?, ?)
    `,
    [numericEnrollmentId, normalizedAmount, normalizedMethod, normalizedStatus, normalizedNote]
  );

  return {
    id: Number(result.insertId || 0),
    amount: normalizedAmount,
    method: normalizedMethod,
    status: normalizedStatus,
  };
}

async function createOfflineStudentEnrollment(payload = {}) {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const classInfo = await getClassInfo(payload.classId || payload.class_id, connection);
    const createPortalAccount = normalizeBoolean(payload.createPortalAccount || payload.create_portal_account, true);
    const portalPassword = String(payload.portalPassword || payload.portal_password || "");
    const email = normalizeEmail(payload.email);

    let user = null;
    if (createPortalAccount) {
      user = await ensurePortalUser({
        email,
        username: trimText(payload.fullName || payload.full_name) || email.split("@")[0],
        password: portalPassword,
        role: "user",
        allowExistingRole: "user",
      }, connection);
    } else if (email) {
      const existingUser = await findUserByEmail(email, connection);
      if (existingUser && existingUser.role !== "user") {
        throw new Error("Email nay da duoc dung cho vai tro khac, khong the gan hoc vien.");
      }
      user = existingUser;
    }

    const student = await upsertStudentProfile({
      fullName: payload.fullName || payload.full_name,
      phone: payload.phone,
      email,
      dob: payload.dob,
      userId: user?.id || null,
    }, connection);

    const enrollment = await upsertEnrollment({
      studentId: student.id,
      classId: classInfo.id,
      status: payload.enrollmentStatus || payload.enrollment_status || "active",
    }, connection);

    if (enrollment.status === "active") {
      await seedClassroomAssignments(classInfo.id, student.id, connection);
    }

    const payment = await createPaymentRecord({
      enrollmentId: enrollment.id,
      amount: normalizeMoney(
        payload.paymentAmount || payload.payment_amount,
        normalizeMoney(classInfo.course_fee, 0)
      ),
      method: payload.paymentMethod || payload.payment_method || "cash",
      status: payload.paymentStatus || payload.payment_status || "confirmed",
      note: payload.paymentNote || payload.payment_note,
    }, connection);

    if (user?.id && enrollment.status === "active") {
      await createStudentNotification({
        userId: user.id,
        title: "Ban da duoc them vao lop hoc",
        message: `${student.full_name || "Hoc vien"} da duoc xep vao lop ${classInfo.code} - ${classInfo.course_name || "lop hoc"}.`,
        href: `/student/classroom/${classInfo.id}`,
      }, connection);
    }

    await connection.commit();

    return {
      student,
      user,
      enrollment,
      payment,
      classInfo,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function createManagedClass(payload = {}) {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const code = trimText(payload.code || payload.class_code).toUpperCase();
    const courseId = Number(payload.courseId || payload.course_id || 0);
    const teacherId = Number(payload.teacherId || payload.teacher_id || 0) || null;
    const room = normalizeNullableText(payload.room);
    const startDate = normalizeNullableDate(payload.startDate || payload.start_date);
    const endDate = normalizeNullableDate(payload.endDate || payload.end_date);
    const scheduleText = normalizeNullableText(payload.scheduleText || payload.schedule_text);

    if (!code) {
      throw new Error("Ma lop la bat buoc.");
    }

    if (!courseId) {
      throw new Error("Can chon khoa hoc cho lop.");
    }

    const [courseRows] = await connection.query(
      "SELECT id FROM courses WHERE id = ? LIMIT 1",
      [courseId]
    );

    if (!courseRows.length) {
      throw new Error("Khoa hoc duoc chon khong ton tai.");
    }

    if (teacherId) {
      const [teacherRows] = await connection.query(
        "SELECT id FROM teachers WHERE id = ? LIMIT 1",
        [teacherId]
      );

      if (!teacherRows.length) {
        throw new Error("Giao vien duoc gan cho lop khong ton tai.");
      }
    }

    const [result] = await connection.query(
      `
        INSERT INTO classes (
          code,
          course_id,
          teacher_id,
          room,
          start_date,
          end_date,
          schedule_text
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [code, courseId, teacherId, room, startDate, endDate, scheduleText]
    );

    const [rows] = await connection.query(
      "SELECT * FROM classes WHERE id = ? LIMIT 1",
      [result.insertId]
    );

    await connection.commit();
    return rows[0] || null;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function createTeacherWithAssignments(payload = {}) {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const createPortalAccount = normalizeBoolean(payload.createPortalAccount || payload.create_portal_account, true);
    const email = normalizeEmail(payload.email);
    const classIds = await validateClassIds(payload.classIds || payload.class_ids, connection);
    let user = null;

    if (createPortalAccount) {
      user = await ensurePortalUser({
        email,
        username: trimText(payload.fullName || payload.full_name) || email.split("@")[0],
        password: payload.portalPassword || payload.portal_password,
        role: "teacher",
        allowExistingRole: "teacher",
      }, connection);
    } else if (email) {
      const existingUser = await findUserByEmail(email, connection);
      if (existingUser && existingUser.role !== "teacher") {
        throw new Error("Email nay da duoc dung cho vai tro khac, khong the gan giao vien.");
      }
      user = existingUser;
    }

    const teacher = await upsertTeacherProfile({
      fullName: payload.fullName || payload.full_name,
      phone: payload.phone,
      email,
      userId: user?.id || null,
    }, connection);

    if (classIds.length) {
      await connection.query(
        `
          UPDATE classes
          SET teacher_id = ?
          WHERE id IN (?)
        `,
        [teacher.id, classIds]
      );
    }

    await connection.commit();

    return {
      teacher,
      user,
      classIds,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function replaceTeacherAssignments({ teacherId, classIds = [] } = {}) {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const numericTeacherId = Number(teacherId || 0);
    if (!numericTeacherId) {
      throw new Error("Giao vien khong hop le.");
    }

    const [teacherRows] = await connection.query(
      "SELECT id, full_name FROM teachers WHERE id = ? LIMIT 1",
      [numericTeacherId]
    );

    if (!teacherRows.length) {
      throw new Error("Khong tim thay giao vien can phan cong.");
    }

    const validatedClassIds = await validateClassIds(classIds, connection);

    await connection.query(
      `
        UPDATE classes
        SET teacher_id = NULL
        WHERE teacher_id = ?
      `,
      [numericTeacherId]
    );

    if (validatedClassIds.length) {
      await connection.query(
        `
          UPDATE classes
          SET teacher_id = ?
          WHERE id IN (?)
        `,
        [numericTeacherId, validatedClassIds]
      );
    }

    await connection.commit();

    return {
      teacher: teacherRows[0],
      classIds: validatedClassIds,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  createManagedClass,
  createOfflineStudentEnrollment,
  createTeacherWithAssignments,
  replaceTeacherAssignments,
};
