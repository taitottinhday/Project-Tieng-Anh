const express = require("express");
const router = express.Router();
const db = require("../models/db");
const renderWithLayout = require("../utils/renderHelper");
const { sendPublicError } = require("../utils/publicError");

function ensureLoggedIn(req, res, next) {
  if (req.session && req.session.user) return next();
  const baseUrl = res.app.locals.baseUrl || '';
  return res.redirect(baseUrl + '/login');
}

async function fetchCrudData(options = {}) {
  const includeMarks = Boolean(options.includeMarks);

  console.log("CRUD: Fetching subjects...");
  const [subjects] = await db.query('SELECT * FROM subjects ORDER BY subject_name ASC');
  console.log("CRUD: Got", subjects.length, "subjects");

  console.log("CRUD: Fetching students...");
  const [students] = await db.query('SELECT * FROM students ORDER BY name ASC LIMIT 250');
  console.log("CRUD: Got", students.length, "students");

  let marks = [];
  if (includeMarks) {
    console.log("CRUD: Fetching marks...");
    const [rows] = await db.query(`
      SELECT m.id, m.student_id, m.subject_id, m.mark, s.subject_name, st.name as student_name
      FROM marks m
      LEFT JOIN subjects s ON m.subject_id = s.id
      LEFT JOIN students st ON m.student_id = st.student_id
      ORDER BY m.id DESC
      LIMIT 100
    `);
    console.log("CRUD: Got", rows.length, "marks");
    marks = rows || [];
  }

  return { subjects: subjects || [], students: students || [], marks };
}

async function renderEditView(req, res, markId) {
  const baseUrl = res.app.locals.baseUrl || '';
  console.log('CRUD Edit: loading mark id', markId);

  const { subjects, students } = await fetchCrudData();
  const [rows] = await db.query(`
    SELECT m.id, m.student_id, m.subject_id, m.mark, s.subject_name, st.name as student_name
    FROM marks m
    LEFT JOIN subjects s ON m.subject_id = s.id
    LEFT JOIN students st ON m.student_id = st.student_id
    WHERE m.id = ?
    LIMIT 1
  `, [markId]);

  if (!rows || rows.length === 0) {
    console.warn("CRUD Edit: mark not found", markId);
    return res.redirect(baseUrl + '/crud');
  }

  renderWithLayout(res, "editMark", {
    title: "Edit Mark",
    username: req.session.user?.username || "Guest",
    mark: rows[0],
    subjects,
    students
  });
}

router.get("/", ensureLoggedIn, async (req, res) => {
  try {
    const { subjects, students, marks } = await fetchCrudData({ includeMarks: true });
    renderWithLayout(res, "crud", {
      title: "Marks CRUD",
      username: req.session.user?.username || "Guest",
      subjects,
      students,
      marks
    });
  } catch (err) {
    console.error("CRUD Error:", err.message);
    console.error("Stack:", err.stack);
    return sendPublicError(res, err, 500, "Khong the tai trang CRUD luc nay.");
  }
});

router.get(["/edit/:id", "/:id/edit"], ensureLoggedIn, async (req, res) => {
  try {
    await renderEditView(req, res, req.params.id);
  } catch (err) {
    console.error("CRUD Edit Error:", err.message);
    const baseUrl = res.app.locals.baseUrl || '';
    res.redirect(baseUrl + '/app207/crud');
  }
});

router.post("/create", ensureLoggedIn, async (req, res) => {
  const { student_id, subject_id, mark } = req.body;
  try {
    console.log("CRUD Create: student_id=" + student_id + ", subject_id=" + subject_id + ", mark=" + mark);
    const baseUrl = res.app.locals.baseUrl || '';
    await db.query(
      "INSERT INTO marks (student_id, subject_id, mark) VALUES (?, ?, ?)",
      [student_id, subject_id, mark]
    );
    console.log("CRUD Create: Success, redirecting...");
    res.redirect(baseUrl + '/app207/crud');
  } catch (err) {
    console.error("CRUD Create Error:", err.message);
    return sendPublicError(res, err, 500, "Khong the tao diem luc nay.");
  }
});

router.post("/update", ensureLoggedIn, async (req, res) => {
  const { id, student_id, subject_id, mark } = req.body;
  try {
    console.log(`CRUD Update: id=${id}, student_id=${student_id}, subject_id=${subject_id}, mark=${mark}`);
    const baseUrl = res.app.locals.baseUrl || '';
    await db.query(
      "UPDATE marks SET student_id = ?, subject_id = ?, mark = ? WHERE id = ?",
      [student_id, subject_id, mark, id]
    );
    console.log("CRUD Update: Success, redirecting...");
    res.redirect(baseUrl + '/app207/crud');
  } catch (err) {
    console.error("CRUD Update Error:", err.message);
    return sendPublicError(res, err, 500, "Khong the cap nhat diem luc nay.");
  }
});

router.get("/delete/:id", ensureLoggedIn, async (req, res) => {
  try {
    const baseUrl = res.app.locals.baseUrl || '';
    console.log("CRUD Delete: id=" + req.params.id);
    await db.query("DELETE FROM marks WHERE id = ?", [req.params.id]);
    console.log("CRUD Delete: Success, redirecting...");
    res.redirect(baseUrl + '/app207/crud');
  } catch (err) {
    console.error("CRUD Delete Error:", err.message);
    return sendPublicError(res, err, 500, "Khong the xoa diem luc nay.");
  }
});

module.exports = router;
