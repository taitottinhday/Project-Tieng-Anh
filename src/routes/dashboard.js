const express = require("express");
const router = express.Router();
const db = require("../models/db");
const renderWithLayout = require("../utils/renderHelper");
const { isAdmin } = require("./auth");
const { sendPublicError } = require("../utils/publicError");
const ensureSchemaReady = require("../middleware/ensureSchemaReady");

router.use(ensureSchemaReady);

// Query an toàn: lỗi hoặc bảng chưa tồn tại thì trả []
async function safeQuery(sql, params = []) {
  try {
    const [rows] = await db.query(sql, params);
    return rows;
  } catch (err) {
    console.warn("[dashboard] Query failed:", err.message);
    return [];
  }
}

// Lấy 1 giá trị scalar an toàn
async function safeScalar(sql, params = [], fallback = 0) {
  const rows = await safeQuery(sql, params);

  if (!rows || rows.length === 0) {
    return fallback;
  }

  const firstRow = rows[0];
  const firstKey = Object.keys(firstRow)[0];
  const val = firstRow[firstKey];

  if (val === null || typeof val === "undefined") {
    return fallback;
  }

  return val;
}

// Dashboard admin only
router.get("/", isAdmin, async (req, res) => {
  try {
    const stats = {
      students: await safeScalar("SELECT COUNT(*) AS students FROM students", [], 0),
      teachers: await safeScalar("SELECT COUNT(*) AS teachers FROM teachers", [], 0),
      courses: await safeScalar("SELECT COUNT(*) AS courses FROM courses", [], 0),
      classes: await safeScalar("SELECT COUNT(*) AS classes FROM classes", [], 0),
      enrollments: await safeScalar("SELECT COUNT(*) AS enrollments FROM enrollments", [], 0),
      revenue: await safeScalar("SELECT COALESCE(SUM(amount), 0) AS revenue FROM payments", [], 0),
    };

    const latestClasses = await safeQuery(`
      SELECT
        c.code AS class_code,
        co.name AS course_name,
        t.full_name AS teacher_name,
        c.schedule_text AS schedule,
        c.room AS room
      FROM classes c
      LEFT JOIN courses co ON c.course_id = co.id
      LEFT JOIN teachers t ON c.teacher_id = t.id
      ORDER BY c.id DESC
      LIMIT 10
    `);

    return renderWithLayout(res, "dashboard", {
      title: "Bảng điều khiển",
      username: req.session.user?.username || "Admin",
      stats,
      latestClasses,
    });
  } catch (err) {
    console.error("[dashboard] Error:", err);
    return sendPublicError(res, err, 500, "Không thể tải dashboard lúc này.");
  }
});

module.exports = router;
