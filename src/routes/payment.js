const express = require("express");
const router = express.Router();
const db = require("../models/db");
const renderWithLayout = require("../utils/renderHelper");
const { createEnrollmentAccessToken, verifyEnrollmentAccessToken } = require("../utils/paymentAccess");

// Cấu hình tài khoản nhận tiền
const BANK = {
    bankCode: "VCB",
    accountNumber: "0123456789",
    accountName: "TRUNG TAM ANH NGU ABC",
};

// Tạo nội dung chuyển khoản
function buildTransferContent(enrollmentId) {
    return `TT E${enrollmentId}`;
}

function resolvePaymentToken(req) {
    return String(req.query.token || req.body.token || "").trim();
}

// Trang hiển thị chuyển khoản + QR
router.get("/:enrollmentId", async (req, res) => {
    try {
        const enrollmentId = Number(req.params.enrollmentId);
        if (!enrollmentId) {
            return res.status(400).send("Invalid enrollmentId");
        }

        const paymentToken = resolvePaymentToken(req);
        if (!verifyEnrollmentAccessToken(enrollmentId, paymentToken)) {
            return res.status(403).send("Liên kết thanh toán không hợp lệ.");
        }

        const [rows] = await db.query(
            `
      SELECT 
        e.id AS enrollment_id,
        e.status AS enrollment_status,
        s.full_name AS student_name,
        s.phone AS student_phone,
        cl.code AS class_code,
        co.name AS course_name,
        co.fee AS course_fee
      FROM enrollments e
      LEFT JOIN students s ON e.student_id = s.id
      LEFT JOIN classes cl ON e.class_id = cl.id
      LEFT JOIN courses co ON cl.course_id = co.id
      WHERE e.id = ?
      LIMIT 1
      `,
            [enrollmentId]
        );

        const info = rows[0];

        if (!info) {
            return res.status(404).send("Enrollment not found");
        }

        const amount = Number(info.course_fee || 0);
        const content = buildTransferContent(enrollmentId);

        const vietqrUrl =
            `https://img.vietqr.io/image/${BANK.bankCode}-${BANK.accountNumber}-compact2.png` +
            `?amount=${amount}` +
            `&addInfo=${encodeURIComponent(content)}` +
            `&accountName=${encodeURIComponent(BANK.accountName)}`;

        renderWithLayout(res, "payment", {
            title: "Thanh toán chuyển khoản",
            username: req.session?.user?.username,
            info,
            bank: BANK,
            amount,
            content,
            paymentToken,
            vietqrUrl,
            success: req.query.success || null,
        });
    } catch (err) {
        console.error("payment page error:", err);
        res.status(500).send("Không thể tải trang thanh toán lúc này.");
    }
});

// Học viên bấm "Tôi đã chuyển khoản"
router.post("/:enrollmentId/confirm", express.urlencoded({ extended: true }), async (req, res) => {
    try {
        const enrollmentId = Number(req.params.enrollmentId);
        const amount = Number(req.body.amount || 0);
        const method = req.body.method || "bank";

        if (!enrollmentId) {
            return res.status(400).send("Invalid enrollmentId");
        }

        const paymentToken = resolvePaymentToken(req);
        if (!verifyEnrollmentAccessToken(enrollmentId, paymentToken)) {
            return res.status(403).send("Liên kết thanh toán không hợp lệ.");
        }

        await db.query(
            `INSERT INTO payments (enrollment_id, amount, method, note, status)
       VALUES (?, ?, ?, ?, 'pending')`,
            [enrollmentId, amount, method, "Học viên đã chuyển khoản (chờ xác nhận)"]
        );

        const baseUrl = res.locals.baseUrl || "";
        return res.redirect(
            baseUrl + `/payment/${enrollmentId}?token=${encodeURIComponent(createEnrollmentAccessToken(enrollmentId))}&success=1`
        );
    } catch (err) {
        console.error("payment confirm error:", err);
        res.status(500).send("Không thể xác nhận thanh toán lúc này.");
    }
});

module.exports = router;
