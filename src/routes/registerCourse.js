const express = require("express");
const router = express.Router();
const db = require("../models/db");
const renderWithLayout = require("../utils/renderHelper");

router.get("/", async (req, res) => {
  try {
    const [courses] = await db.query(`
      SELECT id, name
      FROM courses
      ORDER BY id DESC
    `);

    renderWithLayout(res, "register-course", {
      title: "Đăng ký khóa học",
      courses,
      message: null,
    });
  } catch (err) {
    res.send("ERROR: " + err.message);
  }
});

router.post("/", express.urlencoded({ extended: true }), async (req, res) => {
  try {
    const fullName = String(req.body.full_name || "").trim();
    const phone = String(req.body.phone || "").trim();
    const normalizedEmail = String(req.body.email || "").trim().toLowerCase();
    const courseId = Number(req.body.course_id || 0);

    if (!fullName || !phone || !courseId) {
      return res.send("Thiếu thông tin đăng ký");
    }

    let studentId = null;

    if (normalizedEmail) {
      const [existingStudents] = await db.query(
        `
          SELECT id
          FROM students
          WHERE email = ?
          ORDER BY id ASC
          LIMIT 1
        `,
        [normalizedEmail]
      );

      if (existingStudents.length) {
        studentId = existingStudents[0].id;

        await db.query(
          `
            UPDATE students
            SET full_name = ?, phone = ?, email = ?
            WHERE id = ?
          `,
          [fullName, phone, normalizedEmail, studentId]
        );
      }
    }

    if (!studentId) {
      const [studentResult] = await db.query(
        `
          INSERT INTO students (full_name, phone, email)
          VALUES (?, ?, ?)
        `,
        [fullName, phone, normalizedEmail || null]
      );

      studentId = studentResult.insertId;
    }

    const [classes] = await db.query(
      `
        SELECT id
        FROM classes
        WHERE course_id = ?
        LIMIT 1
      `,
      [courseId]
    );

    if (classes.length === 0) {
      return res.send("Khóa học chưa có lớp");
    }

    const classId = classes[0].id;
    const [existingEnrollments] = await db.query(
      `
        SELECT id
        FROM enrollments
        WHERE student_id = ? AND class_id = ?
        LIMIT 1
      `,
      [studentId, classId]
    );

    let enrollmentId = existingEnrollments[0]?.id || null;

    if (!enrollmentId) {
      const [enrollResult] = await db.query(
        `
          INSERT INTO enrollments (student_id, class_id, status)
          VALUES (?, ?, 'pending')
        `,
        [studentId, classId]
      );

      enrollmentId = enrollResult.insertId;
    }

    const baseUrl = res.locals.baseUrl || "";
    return res.redirect(baseUrl + `/payment/${enrollmentId}`);
  } catch (err) {
    res.send("ERROR: " + err.message);
  }
});

module.exports = router;
