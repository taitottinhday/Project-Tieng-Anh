const express = require("express");
const router = express.Router();
const db = require("../models/db");
const renderWithLayout = require("../utils/renderHelper");
const { createEnrollmentAccessToken } = require("../utils/paymentAccess");
const ensureSchemaReady = require("../middleware/ensureSchemaReady");
const { sendPublicError } = require("../utils/publicError");
const { findOrCreateEnrollment } = require("../utils/enrollmentCompat");
const {
  STUDENT_DISCOUNT_RATE,
  buildRegisterCourseOptions,
  ensureCourseSalesCatalogData,
} = require("../data/courseSalesCatalog");
const { findStudentOpenEnrollment } = require("../services/studentEnrollmentService");

router.use(ensureSchemaReady);

async function findStudentRecord({ userId = 0, email = "" } = {}) {
  const numericUserId = Number(userId || 0);
  const normalizedEmail = String(email || "").trim().toLowerCase();

  if (numericUserId) {
    const [rows] = await db.query(
      `
        SELECT id, user_id, full_name, phone, email
        FROM students
        WHERE user_id = ?
        ORDER BY id DESC
        LIMIT 1
      `,
      [numericUserId]
    );

    if (rows[0]) {
      return rows[0];
    }
  }

  if (!normalizedEmail) {
    return null;
  }

  const [rows] = await db.query(
    `
      SELECT id, user_id, full_name, phone, email
      FROM students
      WHERE email = ?
      ORDER BY id DESC
      LIMIT 1
    `,
    [normalizedEmail]
  );

  return rows[0] || null;
}

function buildRegistrationBlocker(blocker = null) {
  if (!blocker) {
    return null;
  }

  const isPending = blocker.enrollment_status === "pending";
  const joinedDays = Array.isArray(blocker.scheduleMeta?.days)
    ? blocker.scheduleMeta.days.map((item) => item.label).join(" • ")
    : "";
  const timeRangeLabel = blocker.scheduleMeta?.timeRangeLabel || "";
  const scheduleText =
    joinedDays && timeRangeLabel
      ? `${joinedDays} • ${timeRangeLabel}`
      : joinedDays || timeRangeLabel || blocker.schedule_text || "Theo lịch lớp";

  return {
    isPending,
    isActive: blocker.enrollment_status === "active",
    statusLabel: isPending ? "Chờ xác nhận thanh toán" : "Đang học",
    title: isPending
      ? `Bạn đang có đăng ký chờ duyệt cho lớp ${blocker.class_code || "mới"}`
      : `Bạn đang theo học lớp ${blocker.class_code || "hiện tại"}`,
    message: isPending
      ? "Mỗi học viên chỉ có thể giữ một lớp tại một thời điểm. Hãy tiếp tục thanh toán hoặc chờ trung tâm xác nhận trước khi đăng ký lớp khác."
      : "Mỗi học viên chỉ có thể học một lớp tại một thời điểm. Sau khi hoàn thành lớp hiện tại hoặc được cập nhật trạng thái kết thúc, bạn mới có thể đăng ký lớp tiếp theo.",
    courseName: blocker.course_name || "Khóa học hiện tại",
    classCode: blocker.class_code || "Đang cập nhật",
    teacherName: blocker.teacher_name || "Đang cập nhật",
    scheduleText,
    actionHref: isPending
      ? blocker.paymentHref
      : blocker.classroomHref || blocker.scheduleHref || "/student/classroom",
    actionLabel: isPending ? "Tiếp tục thanh toán hiện tại" : "Mở lớp hiện tại",
    secondaryHref: blocker.scheduleHref || "/student/schedule",
    secondaryLabel: "Xem thời khóa biểu",
  };
}

async function getRegisterPrefill(req) {
  const sessionUser = req.session?.user || {};
  const sessionUserId = Number(sessionUser.id || 0);
  const prefill = {
    fullName: String(sessionUser.username || "").trim(),
    phone: "",
    email: String(sessionUser.email || "").trim().toLowerCase(),
  };

  if (!prefill.email && !sessionUserId) {
    return prefill;
  }

  const student = await findStudentRecord({
    userId: sessionUserId,
    email: prefill.email,
  });

  if (!student) {
    return prefill;
  }

  return {
    fullName: String(student.full_name || prefill.fullName || "").trim(),
    phone: String(student.phone || "").trim(),
    email: String(student.email || prefill.email || "").trim().toLowerCase(),
  };
}

async function renderRegisterCoursePage(req, res, overrides = {}) {
  await ensureCourseSalesCatalogData();

  const selectedCourseKey = String(
    overrides.selectedCourseKey !== undefined ? overrides.selectedCourseKey : req.query.course_key || ""
  )
    .trim()
    .toLowerCase();
  const [courses] = await db.query(
    `
      SELECT id, name, fee
      FROM courses
      ORDER BY id DESC
    `
  );

  const courseOptions = buildRegisterCourseOptions(courses, selectedCourseKey);
  const selectedCourse = selectedCourseKey
    ? courseOptions.find((course) => course.courseKey === selectedCourseKey) || null
    : null;
  const formValues = overrides.formValues || await getRegisterPrefill(req);
  const sessionUser = req.session?.user || {};
  const student = await findStudentRecord({
    userId: Number(sessionUser.id || 0),
    email: formValues.email || sessionUser.email || "",
  });
  const registrationBlocker = overrides.registrationBlocker !== undefined
    ? overrides.registrationBlocker
    : buildRegistrationBlocker(
        await findStudentOpenEnrollment({
          studentId: student?.id || 0,
          userId: Number(sessionUser.id || 0),
          email: formValues.email || sessionUser.email || "",
        })
      );

  renderWithLayout(res, "register-course", {
    title: "Đăng ký khóa học",
    courseOptions,
    selectedCourse,
    selectedCourseKey,
    formValues,
    discountRatePercent: Math.round(STUDENT_DISCOUNT_RATE * 100),
    message: overrides.message || null,
    registrationBlocker,
  });
}

router.get("/", async (req, res) => {
  try {
    await renderRegisterCoursePage(req, res);
  } catch (err) {
    console.error("registerCourse page error:", err);
    return sendPublicError(res, err, 500, "Không thể tải trang đăng ký khóa học lúc này.");
  }
});

router.post("/", express.urlencoded({ extended: true }), async (req, res) => {
  try {
    await ensureCourseSalesCatalogData();

    const fullName = String(req.body.full_name || "").trim();
    const phone = String(req.body.phone || "").trim();
    const normalizedEmail = String(req.body.email || "").trim().toLowerCase();
    const courseId = Number(req.body.course_id || 0);
    const selectedCourseKey = String(req.body.course_key || "").trim().toLowerCase();
    const sessionUserId = Number(req.session?.user?.id || 0);

    if (!fullName || !phone || !courseId) {
      return res.send("Thiếu thông tin đăng ký");
    }

    let studentId = null;
    const existingStudent = await findStudentRecord({
      userId: sessionUserId,
      email: normalizedEmail,
    });

    if (existingStudent) {
      studentId = existingStudent.id;

      await db.query(
        `
          UPDATE students
          SET user_id = ?, full_name = ?, phone = ?, email = ?
          WHERE id = ?
        `,
        [sessionUserId || existingStudent.user_id || null, fullName, phone, normalizedEmail || null, studentId]
      );
    }

    if (!studentId) {
      const [studentResult] = await db.query(
        `
          INSERT INTO students (user_id, full_name, phone, email)
          VALUES (?, ?, ?, ?)
        `,
        [sessionUserId || null, fullName, phone, normalizedEmail || null]
      );

      studentId = studentResult.insertId;
    }

    const openEnrollment = await findStudentOpenEnrollment({
      studentId,
      userId: sessionUserId,
      email: normalizedEmail,
    });

    if (openEnrollment) {
      if (openEnrollment.enrollment_status === "pending" && openEnrollment.paymentHref) {
        return res.redirect((res.locals.baseUrl || "") + openEnrollment.paymentHref);
      }

      res.status(409);
      return renderRegisterCoursePage(req, res, {
        selectedCourseKey,
        formValues: {
          fullName,
          phone,
          email: normalizedEmail,
        },
        message: "Bạn đang có một lớp đang học hoặc một đăng ký chờ duyệt. Hãy xử lý lớp hiện tại trước khi mở đăng ký mới.",
        registrationBlocker: buildRegistrationBlocker(openEnrollment),
      });
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

    if (!classes.length) {
      return res.send("Khóa học chưa có lớp");
    }

    const classId = classes[0].id;
    const enrollmentId = await findOrCreateEnrollment(db, studentId, classId);
    const baseUrl = res.locals.baseUrl || "";
    const paymentToken = createEnrollmentAccessToken(enrollmentId);
    const courseKeyQuery = selectedCourseKey
      ? `&course_key=${encodeURIComponent(selectedCourseKey)}`
      : "";

    return res.redirect(
      `${baseUrl}/payment/${enrollmentId}?token=${encodeURIComponent(paymentToken)}${courseKeyQuery}`
    );
  } catch (err) {
    console.error("registerCourse submit error:", err);
    return sendPublicError(res, err, 500, "Không thể tạo đăng ký khóa học lúc này.");
  }
});

module.exports = router;
