const express = require("express");
const router = express.Router();
const db = require("../models/db");
const renderWithLayout = require("../utils/renderHelper");
const { isLoggedIn } = require("./auth");
const { sendPublicError } = require("../utils/publicError");
const ensureSchemaReady = require("../middleware/ensureSchemaReady");
const { createStudentNotification } = require("../services/studentNotificationService");

router.use(ensureSchemaReady);

// Chỉ admin mới được vào
function isAdmin(req, res, next) {
    const role = req.session?.user?.role;
    if (role === "admin") return next();
    return res.status(403).send("Forbidden: Admin only");
}

function appendAuditNote(currentNote, suffix) {
    const base = String(currentNote || "").trim();
    if (!suffix) {
        return base || null;
    }

    if (!base) {
        return suffix;
    }

    if (base.includes(suffix)) {
        return base;
    }

    return `${base} | ${suffix}`;
}

// Trang quản lý thanh toán (admin)
router.get("/", isLoggedIn, isAdmin, async (req, res) => {
    try {
        const [payments] = await db.query(`
      SELECT
        p.id,
        p.amount,
        p.method,
        p.status,
        p.paid_at,
        p.note,
        e.id AS enrollment_id,
        s.full_name AS student_name,
        s.phone AS student_phone,
        cl.code AS class_code,
        co.name AS course_name
      FROM payments p
      LEFT JOIN enrollments e ON p.enrollment_id = e.id
      LEFT JOIN students s ON e.student_id = s.id
      LEFT JOIN classes cl ON e.class_id = cl.id
      LEFT JOIN courses co ON cl.course_id = co.id
      ORDER BY 
        CASE 
          WHEN p.status = 'pending' THEN 0
          WHEN p.status = 'confirmed' THEN 1
          ELSE 2
        END,
        p.id DESC
      LIMIT 2000
    `);

        const pendingCount = payments.filter(x => x.status === "pending").length;

        renderWithLayout(res, "payments-admin", {
            title: "Xác nhận thanh toán",
            username: req.session.user?.username,
            payments,
            pendingCount
        });
    } catch (err) {
        console.error("payments admin page error:", err);
        return sendPublicError(res, err, 500, "Không thể tải danh sách thanh toán lúc này.");
    }
});

// Admin xác nhận thanh toán
router.post("/:id/confirm", isLoggedIn, isAdmin, async (req, res) => {
    const connection = await db.getConnection();

    try {
        const id = Number(req.params.id);
        if (!id) {
            connection.release();
            return res.status(400).send("Invalid payment id.");
        }

        await connection.beginTransaction();

        const [rows] = await connection.query(
            `
              SELECT
                p.id,
                p.status,
                p.note,
                p.enrollment_id,
                e.class_id,
                e.student_id,
                e.status AS enrollment_status,
                s.full_name AS student_name,
                s.email AS student_email,
                s.user_id AS student_user_id,
                cl.code AS class_code,
                co.name AS course_name
              FROM payments p
              LEFT JOIN enrollments e ON e.id = p.enrollment_id
              LEFT JOIN students s ON s.id = e.student_id
              LEFT JOIN classes cl ON cl.id = e.class_id
              LEFT JOIN courses co ON co.id = cl.course_id
              WHERE p.id = ?
              LIMIT 1
              FOR UPDATE
            `,
            [id]
        );

        const payment = rows[0] || null;
        if (!payment) {
            await connection.rollback();
            connection.release();
            return res.status(404).send("Không tìm thấy giao dịch thanh toán.");
        }

        const shouldActivateEnrollment = payment.status !== "confirmed";

        if (shouldActivateEnrollment) {
            await connection.query(
                `
                  UPDATE payments
                  SET status = 'confirmed', note = ?
                  WHERE id = ?
                `,
                [appendAuditNote(payment.note, "Admin confirmed"), id]
            );
        }

        if (payment.enrollment_id) {
            await connection.query(
                `
                  UPDATE enrollments
                  SET status = 'active'
                  WHERE id = ?
                `,
                [payment.enrollment_id]
            );
        }

        let targetUserId = Number(payment.student_user_id || 0);

        if (!targetUserId && payment.student_email) {
            const [userRows] = await connection.query(
                `
                  SELECT id
                  FROM users
                  WHERE email = ?
                  LIMIT 1
                `,
                [payment.student_email]
            );

            targetUserId = Number(userRows[0]?.id || 0);

            if (targetUserId && payment.student_id) {
                await connection.query(
                    `
                      UPDATE students
                      SET user_id = COALESCE(user_id, ?)
                      WHERE id = ?
                    `,
                    [targetUserId, payment.student_id]
                );
            }
        }

        if (shouldActivateEnrollment && targetUserId && payment.class_id) {
            const classCode = payment.class_code || "lớp học mới";
            const courseName = payment.course_name || "khóa học đã đăng ký";
            await createStudentNotification(
                {
                    userId: targetUserId,
                    title: "Thanh toán của bạn đã được xác nhận",
                    message: `Trung tâm đã xác nhận thanh toán cho ${courseName}. Lịch học và quyền truy cập lớp sẽ được cập nhật ngay trong tài khoản học viên của bạn.`,
                    href: "/student/schedule",
                },
                connection
            );
            await createStudentNotification(
                {
                    userId: targetUserId,
                    title: `Bạn đã được thêm vào lớp ${classCode}`,
                    message: `Bạn đã được thêm vào lớp ${classCode} của ${courseName}. Hãy mở Classroom hoặc thời khóa biểu để bắt đầu theo dõi lịch học.`,
                    href: `/student/classroom/${payment.class_id}`,
                },
                connection
            );
        }

        await connection.commit();
        connection.release();
        req.flash("success_msg", "Đã xác nhận thanh toán, mở lớp cho học viên và gửi thông báo.");
        res.redirect(req.baseUrl || "/payments");
    } catch (err) {
        try {
            await connection.rollback();
        } catch (rollbackError) {
            console.error("payments confirm rollback error:", rollbackError);
        }
        connection.release();
        console.error("payments confirm error:", err);
        return sendPublicError(res, err, 500, "Không thể xác nhận thanh toán lúc này.");
    }
});

// Admin từ chối thanh toán
router.post("/:id/reject", isLoggedIn, isAdmin, async (req, res) => {
    try {
        const id = Number(req.params.id);
        const [rows] = await db.query(
            `SELECT note FROM payments WHERE id = ? LIMIT 1`,
            [id]
        );
        await db.query(
            `
              UPDATE payments
              SET status = 'rejected', note = ?
              WHERE id = ?
            `,
            [appendAuditNote(rows[0]?.note, "Admin rejected"), id]
        );
        req.flash("info", "Đã cập nhật giao dịch sang trạng thái từ chối.");
        res.redirect(req.baseUrl || "/payments");
    } catch (err) {
        console.error("payments reject error:", err);
        return sendPublicError(res, err, 500, "Không thể từ chối thanh toán lúc này.");
    }
});

module.exports = router;
