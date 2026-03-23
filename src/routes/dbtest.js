const express = require("express");
const router = express.Router();
const db = require("../models/db");
const renderWithLayout = require("../utils/renderHelper");
const { isAdmin } = require("./auth");

// Query an toàn: nếu bảng chưa tồn tại hoặc lỗi SQL thì trả []
async function safeQuery(sql, params = []) {
  try {
    const [rows] = await db.query(sql, params);
    return rows;
  } catch (err) {
    console.warn("[dbtest] Query failed:", err.message);
    return [];
  }
}

// Database page - admin only
router.get("/", isAdmin, async (req, res) => {
  try {
    const [
      courses,
      students,
      teachers,
      classes,
      enrollments,
      payments,
    ] = await Promise.all([
      safeQuery("SELECT * FROM courses ORDER BY id DESC LIMIT 1000"),
      safeQuery("SELECT * FROM students ORDER BY id DESC LIMIT 1000"),
      safeQuery("SELECT * FROM teachers ORDER BY id DESC LIMIT 1000"),
      safeQuery(`
        SELECT 
          c.id,
          c.code,
          c.room,
          c.start_date,
          c.end_date,
          c.schedule_text,
          co.name AS course_name,
          co.category AS course_category,
          co.fee AS course_fee,
          t.full_name AS teacher_name
        FROM classes c
        LEFT JOIN courses co ON c.course_id = co.id
        LEFT JOIN teachers t ON c.teacher_id = t.id
        ORDER BY c.id DESC
        LIMIT 1000
      `),
      safeQuery(`
        SELECT
          e.id,
          e.status,
          e.enrolled_at,
          s.full_name AS student_name,
          s.phone AS student_phone,
          cl.code AS class_code,
          co.name AS course_name,
          t.full_name AS teacher_name
        FROM enrollments e
        LEFT JOIN students s ON e.student_id = s.id
        LEFT JOIN classes cl ON e.class_id = cl.id
        LEFT JOIN courses co ON cl.course_id = co.id
        LEFT JOIN teachers t ON cl.teacher_id = t.id
        ORDER BY e.id DESC
        LIMIT 1000
      `),
      safeQuery(`
        SELECT
          p.id,
          p.amount,
          p.paid_at,
          p.method,
          p.note,
          e.id AS enrollment_id,
          s.full_name AS student_name,
          cl.code AS class_code,
          co.name AS course_name
        FROM payments p
        LEFT JOIN enrollments e ON p.enrollment_id = e.id
        LEFT JOIN students s ON e.student_id = s.id
        LEFT JOIN classes cl ON e.class_id = cl.id
        LEFT JOIN courses co ON cl.course_id = co.id
        ORDER BY p.id DESC
        LIMIT 1000
      `),
    ]);

    return renderWithLayout(res, "database-tables", {
      title: "Bảng cơ sở dữ liệu",
      username: req.session.user?.username || "Admin",
      courses,
      students,
      teachers,
      classes,
      enrollments,
      payments,
    });
  } catch (err) {
    console.error("[dbtest] Error:", err);
    return res.send("Error: " + err.message);
  }
});

module.exports = router;