const express = require("express");
const router = express.Router();
const db = require("../models/db");
const renderWithLayout = require("../utils/renderHelper");
const { isLoggedIn } = require("./auth");
const { createEnrollmentAccessToken } = require("../utils/paymentAccess");
const { sendPublicError } = require("../utils/publicError");


// ================================
// TRANG ĐĂNG KÝ KHÓA HỌC
// ================================
router.get("/", isLoggedIn, async (req, res) => {
    try {

        const [students] = await db.query(
            `SELECT id, full_name, phone 
       FROM students 
       ORDER BY id DESC 
       LIMIT 1000`
        );

        const [courses] = await db.query(
            `SELECT id, name 
       FROM courses 
       ORDER BY id DESC 
       LIMIT 1000`
        );

        renderWithLayout(res, "enroll", {
            title: "Đăng ký khóa học",
            username: req.session.user?.username,
            students,
            courses,
            classes: [],
            message: null
        });

    } catch (err) {
        console.error("enroll page error:", err);
        return sendPublicError(res, err, 500, "Không thể tải trang đăng ký lúc này.");
    }
});


// ================================
// API LẤY DANH SÁCH LỚP THEO COURSE
// ================================
router.get("/classes", isLoggedIn, async (req, res) => {
    try {

        const courseId = Number(req.query.courseId);
        if (!courseId) return res.json([]);

        const [rows] = await db.query(
            `
      SELECT 
        c.id,
        c.code,
        c.schedule_text,
        c.room,
        t.full_name AS teacher_name
      FROM classes c
      LEFT JOIN teachers t ON c.teacher_id = t.id
      WHERE c.course_id = ?
      ORDER BY c.id DESC
      `,
            [courseId]
        );

        res.json(rows);

    } catch (err) {
        res.json([]);
    }
});


// ================================
// SUBMIT ĐĂNG KÝ
// ================================
router.post("/", isLoggedIn, express.urlencoded({ extended: true }), async (req, res) => {

    try {

        const studentId = Number(req.body.student_id);
        const classId = Number(req.body.class_id);

        if (!studentId || !classId) {
            return res.send("Thiếu thông tin đăng ký");
        }

        // kiểm tra đã đăng ký chưa
        const [check] = await db.query(
            `SELECT id 
       FROM enrollments 
       WHERE student_id = ? AND class_id = ?`,
            [studentId, classId]
        );

        if (check.length > 0) {
            // Đã đăng ký rồi -> đưa sang trang thanh toán luôn
            const paymentToken = createEnrollmentAccessToken(check[0].id);
            return res.redirect(`/payment/${check[0].id}?token=${encodeURIComponent(paymentToken)}`);
        }

        // tạo enrollment
        const [result] = await db.query(
            `INSERT INTO enrollments (student_id, class_id, status) 
       VALUES (?, ?, 'active')`,
            [studentId, classId]
        );

        const enrollmentId = result.insertId;

        // chuyển sang trang thanh toán
        const paymentToken = createEnrollmentAccessToken(enrollmentId);
        res.redirect(`/payment/${enrollmentId}?token=${encodeURIComponent(paymentToken)}`);

    } catch (err) {

        if (err.code === "ER_DUP_ENTRY") {
            return res.send("Học viên đã đăng ký lớp này rồi!");
        }

        console.error("enroll submit error:", err);
        res.status(500).send("Không thể tạo đăng ký lúc này.");
    }

});


module.exports = router;
