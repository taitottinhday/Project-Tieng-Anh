const bcrypt = require("bcrypt");
const db = require("../models/db");
const { ensurePlatformSupport } = require("./platformSupport");
const { ensureStudentActivitySupport } = require("./studentActivityService");
const { DEMO_TEACHERS, DEMO_TEACHER_PASSWORD } = require("./demoSeedService");

let bootstrapReady = false;

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

function getDefaultAccessConfig() {
  const demoTeacher = DEMO_TEACHERS[0] || {};

  return {
    admin: {
      username: firstNonEmpty(process.env.DEFAULT_ADMIN_USERNAME, "Admin"),
      email: normalizeEmail(firstNonEmpty(process.env.DEFAULT_ADMIN_EMAIL, "admin@gmail.com")),
      password: firstNonEmpty(process.env.DEFAULT_ADMIN_PASSWORD, "admin123"),
      role: "admin",
    },
    teacher: {
      fullName: firstNonEmpty(process.env.DEFAULT_TEACHER_NAME, demoTeacher.fullName, "Demo Teacher"),
      phone: firstNonEmpty(process.env.DEFAULT_TEACHER_PHONE, demoTeacher.phone),
      email: normalizeEmail(
        firstNonEmpty(process.env.DEFAULT_TEACHER_EMAIL, demoTeacher.email, "teacher@gmail.com")
      ),
      password: firstNonEmpty(process.env.DEFAULT_TEACHER_PASSWORD, DEMO_TEACHER_PASSWORD, "Teacher@123"),
      role: "teacher",
    },
  };
}

async function ensureTeacherProfile({ fullName, phone, email }) {
  if (!email) {
    return null;
  }

  const [rows] = await db.query(
    "SELECT id, full_name, phone FROM teachers WHERE email = ? LIMIT 1",
    [email]
  );

  if (!rows.length) {
    const [result] = await db.query(
      "INSERT INTO teachers (full_name, phone, email) VALUES (?, ?, ?)",
      [fullName, phone || null, email]
    );
    return result.insertId;
  }

  const teacher = rows[0];
  const nextFullName = firstNonEmpty(teacher.full_name, fullName);
  const nextPhone = firstNonEmpty(teacher.phone, phone);

  if (nextFullName !== teacher.full_name || nextPhone !== (teacher.phone || "")) {
    await db.query(
      "UPDATE teachers SET full_name = ?, phone = ? WHERE id = ?",
      [nextFullName, nextPhone || null, teacher.id]
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

  await ensurePrivilegedUser(defaults.admin);
  await ensureTeacherProfile(defaults.teacher);
  await ensurePrivilegedUser({
    username: defaults.teacher.fullName,
    email: defaults.teacher.email,
    password: defaults.teacher.password,
    role: defaults.teacher.role,
  });
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
      full_name VARCHAR(150) NOT NULL,
      phone VARCHAR(30),
      email VARCHAR(150),
      dob DATE NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS teachers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      full_name VARCHAR(150) NOT NULL,
      phone VARCHAR(30),
      email VARCHAR(150),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
      status ENUM('active','completed','canceled') DEFAULT 'active',
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
    CREATE TABLE IF NOT EXISTS messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100),
      email VARCHAR(100),
      message TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function ensureApplicationSchema() {
  if (bootstrapReady) {
    return;
  }

  await ensureCoreTables();
  await ensureDefaultAccessUsers();
  await ensurePlatformSupport();
  await ensureStudentActivitySupport();
  bootstrapReady = true;
}

module.exports = {
  ensureApplicationSchema,
};
