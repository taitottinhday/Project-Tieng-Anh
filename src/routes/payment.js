const express = require("express");
const router = express.Router();
const db = require("../models/db");
const renderWithLayout = require("../utils/renderHelper");
const { createEnrollmentAccessToken, verifyEnrollmentAccessToken } = require("../utils/paymentAccess");
const ensureSchemaReady = require("../middleware/ensureSchemaReady");
const {
  STUDENT_DISCOUNT_RATE,
  ensureCourseSalesCatalogData,
  resolveCoursePricing,
} = require("../data/courseSalesCatalog");

router.use(ensureSchemaReady);

const BANK = {
  bankCode: "VCB",
  accountNumber: "0123456789",
  accountName: "TRUNG TAM ANH NGU ABC",
};

function buildTransferContent(enrollmentId) {
  return `TT E${enrollmentId}`;
}

function resolvePaymentToken(req) {
  return String(req.query.token || req.body.token || "").trim();
}

function resolveSelectedCourseKey(req) {
  return String(req.query.course_key || req.body.course_key || "").trim().toLowerCase();
}

function getBrowseCoursesHref(req, res) {
  const baseUrl = res.locals.baseUrl || "";
  const isStudent =
    req.session?.user?.role &&
    req.session.user.role !== "admin" &&
    req.session.user.role !== "teacher";

  return isStudent ? `${baseUrl}/student/courses` : `${baseUrl}/courses-blog`;
}

async function getEnrollmentInfo(enrollmentId) {
  const [rows] = await db.query(
    `
      SELECT
        e.id AS enrollment_id,
        e.status AS enrollment_status,
        e.class_id,
        e.student_id,
        s.full_name AS student_name,
        s.phone AS student_phone,
        s.email AS student_email,
        s.user_id AS student_user_id,
        cl.code AS class_code,
        co.id AS course_id,
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

  return rows[0] || null;
}

router.get("/:enrollmentId", async (req, res) => {
  try {
    await ensureCourseSalesCatalogData();

    const enrollmentId = Number(req.params.enrollmentId);
    if (!enrollmentId) {
      return res.status(400).send("Invalid enrollmentId");
    }

    const paymentToken = resolvePaymentToken(req);
    if (!verifyEnrollmentAccessToken(enrollmentId, paymentToken)) {
      return res.status(403).send("Liên kết thanh toán không hợp lệ.");
    }

    const info = await getEnrollmentInfo(enrollmentId);
    if (!info) {
      return res.status(404).send("Enrollment not found");
    }

    const courseKey = resolveSelectedCourseKey(req);
    const pricing = resolveCoursePricing({
      courseId: info.course_id,
      courseFee: info.course_fee,
      courseName: info.course_name,
      courseKey,
    });

    const amount = Number(pricing.discountedFee || 0);
    const originalAmount = Number(pricing.originalFee || 0);
    const content = buildTransferContent(enrollmentId);
    const vietqrUrl =
      `https://img.vietqr.io/image/${BANK.bankCode}-${BANK.accountNumber}-compact2.png` +
      `?amount=${amount}` +
      `&addInfo=${encodeURIComponent(content)}` +
      `&accountName=${encodeURIComponent(BANK.accountName)}`;

    renderWithLayout(res, "payment", {
      title: "Thanh toán chuyển khoản",
      info,
      bank: BANK,
      amount,
      originalAmount,
      pricing,
      content,
      paymentToken,
      courseKey,
      discountRatePercent: Math.round(STUDENT_DISCOUNT_RATE * 100),
      browseCoursesHref: getBrowseCoursesHref(req, res),
      vietqrUrl,
      success: req.query.success || null,
    });
  } catch (err) {
    console.error("payment page error:", err);
    res.status(500).send("Không thể tải trang thanh toán lúc này.");
  }
});

router.post("/:enrollmentId/confirm", express.urlencoded({ extended: true }), async (req, res) => {
  try {
    await ensureCourseSalesCatalogData();

    const enrollmentId = Number(req.params.enrollmentId);
    const method = req.body.method || "bank";

    if (!enrollmentId) {
      return res.status(400).send("Invalid enrollmentId");
    }

    const paymentToken = resolvePaymentToken(req);
    if (!verifyEnrollmentAccessToken(enrollmentId, paymentToken)) {
      return res.status(403).send("Liên kết thanh toán không hợp lệ.");
    }

    const info = await getEnrollmentInfo(enrollmentId);
    if (!info) {
      return res.status(404).send("Enrollment not found");
    }

    const courseKey = resolveSelectedCourseKey(req);
    const pricing = resolveCoursePricing({
      courseId: info.course_id,
      courseFee: info.course_fee,
      courseName: info.course_name,
      courseKey,
    });
    const amount = Number(pricing.discountedFee || 0);

    if (String(info.enrollment_status || "").toLowerCase() !== "active") {
      await db.query(
        `
          UPDATE enrollments
          SET status = 'pending'
          WHERE id = ? AND status <> 'active'
        `,
        [enrollmentId]
      );
    }

    const [existingRows] = await db.query(
      `
        SELECT id, status
        FROM payments
        WHERE enrollment_id = ?
        ORDER BY id DESC
        LIMIT 1
      `,
      [enrollmentId]
    );

    const latestPayment = existingRows[0] || null;
    const pendingNote = "Học viên đã chuyển khoản (chờ xác nhận)";

    if (
      latestPayment &&
      latestPayment.status === "confirmed" &&
      String(info.enrollment_status || "").toLowerCase() === "active"
    ) {
      const baseUrl = res.locals.baseUrl || "";
      const courseKeyQuery = courseKey ? `&course_key=${encodeURIComponent(courseKey)}` : "";
      return res.redirect(
        baseUrl +
          `/payment/${enrollmentId}?token=${encodeURIComponent(paymentToken)}${courseKeyQuery}&success=1`
      );
    }

    if (latestPayment && latestPayment.status === "pending") {
      await db.query(
        `
          UPDATE payments
          SET amount = ?, method = ?, note = ?, paid_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `,
        [amount, method, pendingNote, latestPayment.id]
      );
    } else {
      await db.query(
        `
          INSERT INTO payments (enrollment_id, amount, method, note, status)
          VALUES (?, ?, ?, ?, 'pending')
        `,
        [enrollmentId, amount, method, pendingNote]
      );
    }

    const baseUrl = res.locals.baseUrl || "";
    const courseKeyQuery = courseKey ? `&course_key=${encodeURIComponent(courseKey)}` : "";
    return res.redirect(
      baseUrl +
        `/payment/${enrollmentId}?token=${encodeURIComponent(
          createEnrollmentAccessToken(enrollmentId)
        )}${courseKeyQuery}&success=1`
    );
  } catch (err) {
    console.error("payment confirm error:", err);
    res.status(500).send("Không thể xác nhận thanh toán lúc này.");
  }
});

module.exports = router;
