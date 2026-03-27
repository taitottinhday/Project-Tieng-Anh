const fs = require("fs");
const path = require("path");
const multer = require("multer");
const db = require("../models/db");

const PUBLIC_ROOT = path.join(process.cwd(), "public");
const UPLOAD_ROOT = path.join(PUBLIC_ROOT, "uploads", "classroom");
const MATERIALS_ROOT = path.join(UPLOAD_ROOT, "materials");
const SUBMISSIONS_ROOT = path.join(UPLOAD_ROOT, "submissions");
const BLOCKED_EXTENSIONS = new Set([
  ".bat",
  ".cmd",
  ".com",
  ".cpl",
  ".exe",
  ".hta",
  ".html",
  ".js",
  ".jse",
  ".msi",
  ".msp",
  ".php",
  ".ps1",
  ".sh",
]);

let supportReady = false;

function ensureUploadDirectories() {
  [UPLOAD_ROOT, MATERIALS_ROOT, SUBMISSIONS_ROOT].forEach((dirPath) => {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });
}

function safeExtension(filename) {
  const extension = path.extname(String(filename || "")).toLowerCase();
  return extension || "";
}

function createStoredName(originalName, prefix) {
  const extension = safeExtension(originalName);
  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
}

function fileFilter(req, file, cb) {
  const extension = safeExtension(file.originalname);

  if (BLOCKED_EXTENSIONS.has(extension)) {
    return cb(new Error("Tep tai len khong duoc ho tro vi ly do bao mat."));
  }

  return cb(null, true);
}

function createDiskStorage(destination, prefix) {
  return multer.diskStorage({
    destination(req, file, cb) {
      ensureUploadDirectories();
      cb(null, destination);
    },
    filename(req, file, cb) {
      cb(null, createStoredName(file.originalname, prefix));
    },
  });
}

const uploadTeacherMaterials = multer({
  storage: createDiskStorage(MATERIALS_ROOT, "material"),
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024,
    files: 8,
  },
});

const uploadStudentSubmissionFiles = multer({
  storage: createDiskStorage(SUBMISSIONS_ROOT, "submission"),
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024,
    files: 6,
  },
});

function toPublicPath(absolutePath) {
  return `/${path.relative(PUBLIC_ROOT, absolutePath).replace(/\\/g, "/")}`;
}

async function ensurePlatformSupport() {
  if (supportReady) {
    return;
  }

  ensureUploadDirectories();

  await db.query(`
    CREATE TABLE IF NOT EXISTS registration_otps (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) NOT NULL,
      email VARCHAR(150) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      otp_code VARCHAR(8) NOT NULL,
      expires_at DATETIME NOT NULL,
      used_at DATETIME NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_registration_otps_email (email),
      INDEX idx_registration_otps_expires (expires_at)
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS user_oauth_identities (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      provider ENUM('google','facebook') NOT NULL,
      provider_user_id VARCHAR(191) NOT NULL,
      provider_email VARCHAR(150) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_oauth_identity (provider, provider_user_id),
      UNIQUE KEY uniq_oauth_email (provider, provider_email),
      CONSTRAINT fk_oauth_identity_user FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      token_hash CHAR(64) NOT NULL,
      requested_ip VARCHAR(64) NULL,
      user_agent VARCHAR(255) NULL,
      expires_at DATETIME NOT NULL,
      used_at DATETIME NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_password_reset_token_hash (token_hash),
      INDEX idx_password_reset_user (user_id),
      INDEX idx_password_reset_expires (expires_at),
      CONSTRAINT fk_password_reset_user FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS classroom_posts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      class_id INT NOT NULL,
      teacher_id INT NOT NULL,
      title VARCHAR(180) NOT NULL,
      description TEXT NULL,
      post_type ENUM('lecture','assignment') DEFAULT 'lecture',
      due_date DATETIME NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_classroom_posts_class FOREIGN KEY (class_id) REFERENCES classes(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT fk_classroom_posts_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
      INDEX idx_classroom_posts_class_created (class_id, created_at)
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS classroom_materials (
      id INT AUTO_INCREMENT PRIMARY KEY,
      post_id INT NOT NULL,
      original_name VARCHAR(255) NOT NULL,
      stored_name VARCHAR(255) NOT NULL,
      public_path VARCHAR(255) NOT NULL,
      mime_type VARCHAR(150) NULL,
      size_bytes BIGINT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_classroom_materials_post FOREIGN KEY (post_id) REFERENCES classroom_posts(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
      INDEX idx_classroom_materials_post (post_id)
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS classroom_submissions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      post_id INT NOT NULL,
      student_id INT NOT NULL,
      status ENUM('assigned','submitted','completed','reviewed') DEFAULT 'assigned',
      student_note TEXT NULL,
      teacher_feedback TEXT NULL,
      teacher_score DECIMAL(5,2) NULL,
      submitted_at DATETIME NULL,
      completed_at DATETIME NULL,
      reviewed_at DATETIME NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_classroom_submissions_post FOREIGN KEY (post_id) REFERENCES classroom_posts(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT fk_classroom_submissions_student FOREIGN KEY (student_id) REFERENCES students(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
      UNIQUE KEY uniq_classroom_submission_post_student (post_id, student_id),
      INDEX idx_classroom_submissions_status (status)
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS classroom_submission_files (
      id INT AUTO_INCREMENT PRIMARY KEY,
      submission_id INT NOT NULL,
      original_name VARCHAR(255) NOT NULL,
      stored_name VARCHAR(255) NOT NULL,
      public_path VARCHAR(255) NOT NULL,
      mime_type VARCHAR(150) NULL,
      size_bytes BIGINT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_classroom_submission_files_submission FOREIGN KEY (submission_id) REFERENCES classroom_submissions(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
      INDEX idx_classroom_submission_files_submission (submission_id)
    )
  `);

  supportReady = true;
}

async function getTeacherByEmail(email) {
  await ensurePlatformSupport();

  if (!email) {
    return null;
  }

  const [rows] = await db.query(
    "SELECT * FROM teachers WHERE email = ? LIMIT 1",
    [email]
  );

  return rows[0] || null;
}

async function getStudentByEmail(email) {
  await ensurePlatformSupport();

  if (!email) {
    return null;
  }

  const [rows] = await db.query(
    `
      SELECT
        s.*,
        COUNT(DISTINCT e.id) AS enrollment_count
      FROM students s
      LEFT JOIN enrollments e ON e.student_id = s.id
      WHERE s.email = ?
      GROUP BY s.id
      ORDER BY enrollment_count DESC, s.id ASC
      LIMIT 1
    `,
    [email]
  );

  return rows[0] || null;
}

async function getStudentByUserId(userId) {
  await ensurePlatformSupport();

  const numericUserId = Number(userId || 0);
  if (!numericUserId) {
    return null;
  }

  const [rows] = await db.query(
    `
      SELECT
        s.*,
        COUNT(DISTINCT e.id) AS enrollment_count
      FROM students s
      LEFT JOIN enrollments e ON e.student_id = s.id
      WHERE s.user_id = ?
      GROUP BY s.id
      ORDER BY enrollment_count DESC, s.id ASC
      LIMIT 1
    `,
    [numericUserId]
  );

  return rows[0] || null;
}

async function syncStudentProfileFromUser(user) {
  await ensurePlatformSupport();

  if (!user || !user.email) {
    return null;
  }

  const userId = Number(user.id || 0);
  const normalizedEmail = String(user.email || "").trim().toLowerCase();
  const fallbackName = user.username || normalizedEmail.split("@")[0];
  const existing = (userId ? await getStudentByUserId(userId) : null) || await getStudentByEmail(normalizedEmail);
  if (existing) {
    const nextFullName = String(existing.full_name || "").trim() || fallbackName;
    const shouldUpdate =
      Number(existing.user_id || 0) !== userId ||
      String(existing.email || "").trim().toLowerCase() !== normalizedEmail ||
      String(existing.full_name || "").trim() !== nextFullName;

    if (shouldUpdate) {
      await db.query(
        `
          UPDATE students
          SET user_id = ?, full_name = ?, email = ?
          WHERE id = ?
        `,
        [userId || null, nextFullName, normalizedEmail, existing.id]
      );

      const [rows] = await db.query(
        "SELECT * FROM students WHERE id = ? LIMIT 1",
        [existing.id]
      );

      return rows[0] || existing;
    }

    return existing;
  }

  const [result] = await db.query(
    "INSERT INTO students (user_id, full_name, email) VALUES (?, ?, ?)",
    [userId || null, fallbackName, normalizedEmail]
  );

  const [rows] = await db.query(
    "SELECT * FROM students WHERE id = ? LIMIT 1",
    [result.insertId]
  );

  return rows[0] || null;
}

async function persistMaterialFiles(postId, files = []) {
  await ensurePlatformSupport();

  const savedFiles = [];

  for (const file of files) {
    const publicPath = toPublicPath(file.path);

    await db.query(
      `
        INSERT INTO classroom_materials (
          post_id,
          original_name,
          stored_name,
          public_path,
          mime_type,
          size_bytes
        ) VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        postId,
        file.originalname,
        file.filename,
        publicPath,
        file.mimetype || null,
        Number(file.size || 0),
      ]
    );

    savedFiles.push({
      original_name: file.originalname,
      public_path: publicPath,
      size_bytes: Number(file.size || 0),
      mime_type: file.mimetype || null,
    });
  }

  return savedFiles;
}

async function ensureStudentSubmissionRecord(postId, studentId) {
  await ensurePlatformSupport();

  await db.query(
    `
      INSERT INTO classroom_submissions (post_id, student_id, status)
      VALUES (?, ?, 'assigned')
      ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)
    `,
    [postId, studentId]
  );

  const [rows] = await db.query(
    "SELECT * FROM classroom_submissions WHERE post_id = ? AND student_id = ? LIMIT 1",
    [postId, studentId]
  );

  return rows[0] || null;
}

async function persistSubmissionFiles(submissionId, files = []) {
  await ensurePlatformSupport();

  const savedFiles = [];

  for (const file of files) {
    const publicPath = toPublicPath(file.path);

    await db.query(
      `
        INSERT INTO classroom_submission_files (
          submission_id,
          original_name,
          stored_name,
          public_path,
          mime_type,
          size_bytes
        ) VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        submissionId,
        file.originalname,
        file.filename,
        publicPath,
        file.mimetype || null,
        Number(file.size || 0),
      ]
    );

    savedFiles.push({
      original_name: file.originalname,
      public_path: publicPath,
      size_bytes: Number(file.size || 0),
      mime_type: file.mimetype || null,
    });
  }

  return savedFiles;
}

module.exports = {
  MATERIALS_ROOT,
  SUBMISSIONS_ROOT,
  ensurePlatformSupport,
  ensureStudentSubmissionRecord,
  getStudentByEmail,
  getTeacherByEmail,
  persistMaterialFiles,
  persistSubmissionFiles,
  syncStudentProfileFromUser,
  uploadStudentSubmissionFiles,
  uploadTeacherMaterials,
};
