const bcrypt = require("bcrypt");
const db = require("../models/db");
const { ensurePlatformSupport } = require("./platformSupport");
const { ensureStudentActivitySupport } = require("./studentActivityService");
const { DEMO_TEACHERS, DEMO_TEACHER_PASSWORD } = require("./demoSeedService");

let bootstrapReady = false;
let bootstrapPromise = null;

function firstNonEmpty(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim() !== "") {
      return value.trim();
    }
  }

  return "";
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function buildOptionalPrivilegedUser(config) {
  if (!config.email || !config.password) {
    return null;
  }

  return config;
}

async function hasColumn(tableName, columnName) {
  const [rows] = await db.query(
    `
      SELECT 1
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND COLUMN_NAME = ?
      LIMIT 1
    `,
    [tableName, columnName]
  );

  return rows.length > 0;
}

async function hasIndex(tableName, indexName) {
  const [rows] = await db.query(
    `
      SELECT 1
      FROM INFORMATION_SCHEMA.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND INDEX_NAME = ?
      LIMIT 1
    `,
    [tableName, indexName]
  );

  return rows.length > 0;
}

async function addColumnIfMissing(tableName, columnName, definition) {
  if (await hasColumn(tableName, columnName)) {
    return false;
  }

  try {
    await db.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  } catch (error) {
    if (error && error.code === "ER_DUP_FIELDNAME") {
      return false;
    }

    throw error;
  }

  return true;
}

async function addIndexIfMissing(tableName, indexName, definition) {
  if (await hasIndex(tableName, indexName)) {
    return false;
  }

  try {
    await db.query(`ALTER TABLE ${tableName} ADD INDEX ${indexName} ${definition}`);
  } catch (error) {
    if (error && error.code === "ER_DUP_KEYNAME") {
      return false;
    }

    throw error;
  }

  return true;
}

function getDefaultAccessConfig() {
  const demoTeacher = DEMO_TEACHERS[0] || {};

  return {
    admin: buildOptionalPrivilegedUser({
      username: firstNonEmpty(process.env.DEFAULT_ADMIN_USERNAME, "Admin"),
      email: normalizeEmail(firstNonEmpty(process.env.DEFAULT_ADMIN_EMAIL)),
      password: firstNonEmpty(process.env.DEFAULT_ADMIN_PASSWORD),
      role: "admin",
    }),
    teacher: buildOptionalPrivilegedUser({
      fullName: firstNonEmpty(process.env.DEFAULT_TEACHER_NAME, demoTeacher.fullName, "Demo Teacher"),
      phone: firstNonEmpty(process.env.DEFAULT_TEACHER_PHONE, demoTeacher.phone),
      email: normalizeEmail(firstNonEmpty(process.env.DEFAULT_TEACHER_EMAIL)),
      password: firstNonEmpty(process.env.DEFAULT_TEACHER_PASSWORD, DEMO_TEACHER_PASSWORD),
      role: "teacher",
    }),
  };
}

async function ensureTeacherProfile({ fullName, phone, email, userId = null }) {
  if (!email) {
    return null;
  }

  const [rows] = await db.query(
    "SELECT id, user_id, full_name, phone FROM teachers WHERE email = ? LIMIT 1",
    [email]
  );

  if (!rows.length) {
    const [result] = await db.query(
      "INSERT INTO teachers (user_id, full_name, phone, email) VALUES (?, ?, ?, ?)",
      [userId || null, fullName, phone || null, email]
    );
    return result.insertId;
  }

  const teacher = rows[0];
  const nextFullName = firstNonEmpty(teacher.full_name, fullName);
  const nextPhone = firstNonEmpty(teacher.phone, phone);
  const nextUserId = Number(teacher.user_id || 0) || Number(userId || 0) || null;

  if (
    nextFullName !== teacher.full_name ||
    nextPhone !== (teacher.phone || "") ||
    nextUserId !== (Number(teacher.user_id || 0) || null)
  ) {
    await db.query(
      "UPDATE teachers SET user_id = ?, full_name = ?, phone = ? WHERE id = ?",
      [nextUserId, nextFullName, nextPhone || null, teacher.id]
    );
  }

  return teacher.id;
}

async function ensurePrivilegedUser({ username, email, password, role }) {
  if (!email || !password || !role) {
    return null;
  }

  const [rows] = await db.query(
    "SELECT id, username, password, role FROM users WHERE email = ? LIMIT 1",
    [email]
  );

  const passwordHash = await bcrypt.hash(password, 10);

  if (!rows.length) {
    const [result] = await db.query(
      "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
      [username, email, passwordHash, role]
    );
    return result.insertId;
  }

  const user = rows[0];
  const shouldUpdate =
    user.username !== username ||
    user.role !== role ||
    !(await bcrypt.compare(password, user.password));

  if (shouldUpdate) {
    await db.query(
      "UPDATE users SET username = ?, password = ?, role = ? WHERE id = ?",
      [username, passwordHash, role, user.id]
    );
  }

  return user.id;
}

async function ensureDefaultAccessUsers() {
  const defaults = getDefaultAccessConfig();

  if (defaults.admin) {
    await ensurePrivilegedUser(defaults.admin);
  }

  if (defaults.teacher) {
    const teacherUserId = await ensurePrivilegedUser({
      username: defaults.teacher.fullName,
      email: defaults.teacher.email,
      password: defaults.teacher.password,
      role: defaults.teacher.role,
    });
    await ensureTeacherProfile({
      ...defaults.teacher,
      userId: teacherUserId,
    });
  }
}

async function ensureCoreTables() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) NOT NULL,
      email VARCHAR(150) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role ENUM('user', 'teacher', 'admin') DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS students (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NULL,
      full_name VARCHAR(150) NOT NULL,
      phone VARCHAR(30),
      email VARCHAR(150),
      dob DATE NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_students_user_id (user_id)
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS teachers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NULL,
      full_name VARCHAR(150) NOT NULL,
      phone VARCHAR(30),
      email VARCHAR(150),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_teachers_user_id (user_id)
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS courses (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      category VARCHAR(100),
      fee INT NOT NULL DEFAULT 0,
      duration_weeks INT DEFAULT 0
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS classes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      code VARCHAR(50) NOT NULL UNIQUE,
      course_id INT NOT NULL,
      teacher_id INT NULL,
      room VARCHAR(50),
      start_date DATE NULL,
      end_date DATE NULL,
      schedule_text VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_classes_course FOREIGN KEY (course_id) REFERENCES courses(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
      CONSTRAINT fk_classes_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id)
        ON DELETE SET NULL ON UPDATE CASCADE
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS enrollments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT NOT NULL,
      class_id INT NOT NULL,
      status ENUM('pending','active','completed','canceled') DEFAULT 'pending',
      enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_enroll_student FOREIGN KEY (student_id) REFERENCES students(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT fk_enroll_class FOREIGN KEY (class_id) REFERENCES classes(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
      UNIQUE KEY uniq_student_class (student_id, class_id)
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS payments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      enrollment_id INT NOT NULL,
      amount INT NOT NULL,
      method ENUM('cash','bank','momo','other') DEFAULT 'cash',
      note VARCHAR(255),
      paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_pay_enroll FOREIGN KEY (enrollment_id) REFERENCES enrollments(id)
        ON DELETE CASCADE ON UPDATE CASCADE
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS attendance (
      id INT AUTO_INCREMENT PRIMARY KEY,
      class_id INT NOT NULL,
      student_id INT NOT NULL,
      lesson_date DATE NOT NULL,
      status ENUM('present','absent','late','excused') DEFAULT 'present',
      note VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_attendance_class FOREIGN KEY (class_id) REFERENCES classes(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT fk_attendance_student FOREIGN KEY (student_id) REFERENCES students(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
      UNIQUE KEY uniq_attendance_student_class_date (class_id, student_id, lesson_date)
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS student_comments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      class_id INT NOT NULL,
      student_id INT NOT NULL,
      teacher_id INT NOT NULL,
      lesson_date DATE NULL,
      skill_focus VARCHAR(100),
      comment TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_student_comments_class FOREIGN KEY (class_id) REFERENCES classes(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT fk_student_comments_student FOREIGN KEY (student_id) REFERENCES students(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT fk_student_comments_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id)
        ON DELETE CASCADE ON UPDATE CASCADE
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS teacher_attendance (
      id INT AUTO_INCREMENT PRIMARY KEY,
      teacher_id INT NOT NULL,
      class_id INT NOT NULL,
      lesson_date DATE NOT NULL,
      status ENUM('present','absent','late','excused') DEFAULT 'present',
      note VARCHAR(255),
      checked_in_at DATETIME NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_teacher_attendance_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT fk_teacher_attendance_class FOREIGN KEY (class_id) REFERENCES classes(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
      UNIQUE KEY uniq_teacher_class_lesson (teacher_id, class_id, lesson_date),
      INDEX idx_teacher_attendance_lesson (lesson_date),
      INDEX idx_teacher_attendance_status (status)
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NULL,
      name VARCHAR(100),
      email VARCHAR(100),
      phone VARCHAR(40) NULL,
      goal VARCHAR(150) NULL,
      course_interest VARCHAR(150) NULL,
      schedule_preference VARCHAR(150) NULL,
      preferred_contact_method VARCHAR(50) NULL,
      message_channel VARCHAR(50) NOT NULL DEFAULT 'admin_only',
      target_teacher_id INT NULL,
      target_class_id INT NULL,
      teacher_feedback_rating VARCHAR(80) NULL,
      message TEXT,
      status ENUM('new','viewed','contacted') NOT NULL DEFAULT 'new',
      admin_note TEXT NULL,
      viewed_at DATETIME NULL,
      contacted_at DATETIME NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_messages_status_created (status, created_at),
      INDEX idx_messages_channel (message_channel),
      INDEX idx_messages_target_teacher (target_teacher_id),
      INDEX idx_messages_email (email),
      INDEX idx_messages_user (user_id)
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS message_responses (
      id INT AUTO_INCREMENT PRIMARY KEY,
      message_id INT NOT NULL,
      admin_user_id INT NULL,
      admin_name VARCHAR(120) NULL,
      contact_method VARCHAR(80) NULL,
      contact_location VARCHAR(255) NULL,
      contact_schedule VARCHAR(255) NULL,
      request_phone TINYINT(1) NOT NULL DEFAULT 0,
      message_to_student TEXT NULL,
      is_visible_to_student TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_message_responses_message (message_id),
      CONSTRAINT fk_message_responses_message FOREIGN KEY (message_id) REFERENCES messages(id)
        ON DELETE CASCADE ON UPDATE CASCADE
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS student_notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      title VARCHAR(180) NOT NULL,
      message TEXT NULL,
      href VARCHAR(255) NULL,
      is_read TINYINT(1) NOT NULL DEFAULT 0,
      read_at DATETIME NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_student_notifications_user_created (user_id, created_at),
      INDEX idx_student_notifications_user_read (user_id, is_read),
      CONSTRAINT fk_student_notifications_user FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE
    )
  `);
}

async function ensureLegacySchemaCompatibility() {
  await addColumnIfMissing(
    "students",
    "user_id",
    "INT NULL AFTER id"
  );
  await addColumnIfMissing(
    "teachers",
    "user_id",
    "INT NULL AFTER id"
  );
  await addIndexIfMissing(
    "teachers",
    "idx_teachers_user_id",
    "(user_id)"
  );
  await addColumnIfMissing(
    "payments",
    "status",
    "ENUM('pending','confirmed','rejected') NOT NULL DEFAULT 'pending' AFTER method"
  );
  await addColumnIfMissing(
    "payments",
    "txn_ref",
    "VARCHAR(120) NULL AFTER note"
  );
  await addColumnIfMissing(
    "messages",
    "user_id",
    "INT NULL AFTER id"
  );
  await addColumnIfMissing(
    "messages",
    "phone",
    "VARCHAR(40) NULL AFTER email"
  );
  await addColumnIfMissing(
    "messages",
    "goal",
    "VARCHAR(150) NULL AFTER phone"
  );
  await addColumnIfMissing(
    "messages",
    "course_interest",
    "VARCHAR(150) NULL AFTER goal"
  );
  await addColumnIfMissing(
    "messages",
    "schedule_preference",
    "VARCHAR(150) NULL AFTER course_interest"
  );
  await addColumnIfMissing(
    "messages",
    "preferred_contact_method",
    "VARCHAR(50) NULL AFTER schedule_preference"
  );
  await addColumnIfMissing(
    "messages",
    "message_channel",
    "VARCHAR(50) NOT NULL DEFAULT 'admin_only' AFTER preferred_contact_method"
  );
  await addColumnIfMissing(
    "messages",
    "target_teacher_id",
    "INT NULL AFTER message_channel"
  );
  await addColumnIfMissing(
    "messages",
    "target_class_id",
    "INT NULL AFTER target_teacher_id"
  );
  await addColumnIfMissing(
    "messages",
    "teacher_feedback_rating",
    "VARCHAR(80) NULL AFTER target_class_id"
  );
  await addColumnIfMissing(
    "messages",
    "status",
    "ENUM('new','viewed','contacted') NOT NULL DEFAULT 'new' AFTER created_at"
  );
  await addColumnIfMissing(
    "messages",
    "admin_note",
    "TEXT NULL AFTER status"
  );
  await addColumnIfMissing(
    "messages",
    "viewed_at",
    "DATETIME NULL AFTER admin_note"
  );
  await addColumnIfMissing(
    "messages",
    "contacted_at",
    "DATETIME NULL AFTER viewed_at"
  );
  await addColumnIfMissing(
    "messages",
    "updated_at",
    "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at"
  );
  await addIndexIfMissing(
    "messages",
    "idx_messages_channel",
    "(message_channel)"
  );
  await addIndexIfMissing(
    "messages",
    "idx_messages_target_teacher",
    "(target_teacher_id)"
  );

  await db.query(`
    CREATE TABLE IF NOT EXISTS message_responses (
      id INT AUTO_INCREMENT PRIMARY KEY,
      message_id INT NOT NULL,
      admin_user_id INT NULL,
      admin_name VARCHAR(120) NULL,
      contact_method VARCHAR(80) NULL,
      contact_location VARCHAR(255) NULL,
      contact_schedule VARCHAR(255) NULL,
      request_phone TINYINT(1) NOT NULL DEFAULT 0,
      message_to_student TEXT NULL,
      is_visible_to_student TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_message_responses_message (message_id),
      CONSTRAINT fk_message_responses_message FOREIGN KEY (message_id) REFERENCES messages(id)
        ON DELETE CASCADE ON UPDATE CASCADE
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS student_notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      title VARCHAR(180) NOT NULL,
      message TEXT NULL,
      href VARCHAR(255) NULL,
      is_read TINYINT(1) NOT NULL DEFAULT 0,
      read_at DATETIME NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_student_notifications_user_created (user_id, created_at),
      INDEX idx_student_notifications_user_read (user_id, is_read),
      CONSTRAINT fk_student_notifications_user FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE
    )
  `);

  try {
    await db.query(`
      ALTER TABLE enrollments
      MODIFY COLUMN status ENUM('pending','active','completed','canceled') NOT NULL DEFAULT 'pending'
    `);
  } catch (error) {
    const code = String(error?.code || "").toUpperCase();
    if (!["ER_DUP_FIELDNAME", "ER_PARSE_ERROR"].includes(code)) {
      throw error;
    }
  }
}

async function ensureApplicationSchema() {
  if (bootstrapReady) {
    return;
  }

  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      await ensureCoreTables();
      await ensureLegacySchemaCompatibility();
      await ensureDefaultAccessUsers();
      await ensurePlatformSupport();
      await ensureStudentActivitySupport();
      bootstrapReady = true;
    })().catch((error) => {
      bootstrapPromise = null;
      throw error;
    });
  }

  await bootstrapPromise;
}

module.exports = {
  ensureApplicationSchema,
};
