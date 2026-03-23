const express = require("express");
const router = express.Router();
const db = require("../models/db");
const renderWithLayout = require("../utils/renderHelper");

router.get("/:id", async (req, res) => {

    const courseId = req.params.id;

    try {

        // lấy thông tin khóa học
        const [courseRows] = await db.query(`
        SELECT * FROM courses
        WHERE id = ?
        `, [courseId]);

        if (courseRows.length === 0) {
            return res.send("Khóa học không tồn tại");
        }

        const course = courseRows[0];


        // đếm số học viên đăng ký
        const [countRows] = await db.query(`
        SELECT COUNT(*) as total_students
        FROM enrollments e
        JOIN classes c ON e.class_id = c.id
        WHERE c.course_id = ?
        `, [courseId]);

        const totalStudents = countRows[0].total_students;


        // lấy giáo viên
        const [teacherRows] = await db.query(`
        SELECT DISTINCT t.full_name
        FROM teachers t
        JOIN classes c ON t.id = c.teacher_id
        WHERE c.course_id = ?
        LIMIT 1
        `, [courseId]);

        const teacher = teacherRows.length ? teacherRows[0].full_name : "Đang cập nhật";


        renderWithLayout(res, "course-detail", {
            title: "Chi tiết khóa học",
            course,
            totalStudents,
            teacher
        });

    } catch (err) {
        res.send("ERROR: " + err.message);
    }

});

module.exports = router;