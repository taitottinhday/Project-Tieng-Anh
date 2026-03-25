const express = require("express");
const router = express.Router();
const db = require("../models/db");
const renderWithLayout = require("../utils/renderHelper");
const { isLoggedIn } = require("./auth");
const { sendPublicError } = require("../utils/publicError");

// Chỉ admin mới được vào
function isAdmin(req, res, next) {
    const role = req.session?.user?.role;
    if (role === "admin") return next();
    return res.status(403).send("Forbidden: Admin only");
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
    try {
        const id = Number(req.params.id);
        await db.query(
            `UPDATE payments SET status='confirmed', note=CONCAT(IFNULL(note,''), ' | Admin confirmed') WHERE id=?`,
            [id]
        );
        res.redirect("/payments");
    } catch (err) {
        console.error("payments confirm error:", err);
        return sendPublicError(res, err, 500, "Không thể xác nhận thanh toán lúc này.");
    }
});

// Admin từ chối thanh toán
router.post("/:id/reject", isLoggedIn, isAdmin, async (req, res) => {
    try {
        const id = Number(req.params.id);
        await db.query(
            `UPDATE payments SET status='rejected', note=CONCAT(IFNULL(note,''), ' | Admin rejected') WHERE id=?`,
            [id]
        );
        res.redirect("/payments");
    } catch (err) {
        console.error("payments reject error:", err);
        return sendPublicError(res, err, 500, "Không thể từ chối thanh toán lúc này.");
    }
});

module.exports = router;
