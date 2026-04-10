const express = require("express");
const db = require("../models/db");
const renderWithLayout = require("../utils/renderHelper");
const { isLoggedIn, isAdmin } = require("./auth");
const { sendPublicError } = require("../utils/publicError");
const ensureSchemaReady = require("../middleware/ensureSchemaReady");
const {
  createManagedClass,
  createOfflineStudentEnrollment,
  createTeacherWithAssignments,
  replaceTeacherAssignments,
} = require("../services/adminManagementService");
const {
  deleteUploadedExam,
  deleteUploadedResource,
  getUploadedExamEditorEntry,
  getUploadedExamEntries,
  getPublishedResourceEntries,
  registerUploadedExam,
  registerUploadedResource,
  updateUploadedExam,
  updateUploadedResource,
  uploadAdminExamAssets,
  uploadAdminResourceAssets,
} = require("../services/adminContentService");

const router = express.Router();

router.use(ensureSchemaReady);

const ADMIN_WORKSPACE_VIEWS = new Set(["overview", "students", "teachers", "resources"]);

function toNumber(value, fallback = 0) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
}

function normalizeText(value) {
  const trimmed = String(value ?? "").trim();
  return trimmed || null;
}

function normalizeDateInput(value) {
  const trimmed = String(value ?? "").trim();
  return trimmed || null;
}

function setFlash(req, type, message) {
  if (typeof req.flash === "function") {
    req.flash(type, message);
  }
}

function normalizeAdminWorkspaceView(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return ADMIN_WORKSPACE_VIEWS.has(normalized) ? normalized : "overview";
}

function getAdminWorkspacePath(view) {
  const normalizedView = normalizeAdminWorkspaceView(view);

  if (normalizedView === "students") {
    return "/admin/students";
  }

  if (normalizedView === "teachers") {
    return "/admin/teachers";
  }

  if (normalizedView === "resources") {
    return "/admin/resources";
  }

  return "/admin";
}

function getAdminWorkspaceTitle(view) {
  const normalizedView = normalizeAdminWorkspaceView(view);

  if (normalizedView === "resources") {
    return "Quản lý kho nội dung";
  }

  if (normalizedView === "students") {
    return "Quản lý học viên";
  }

  if (normalizedView === "teachers") {
    return "Quản lý giáo viên";
  }

  if (normalizedView === "resources") {
    return "Quản lý đề thi";
  }

  return "Trung tâm điều hành";
}

function getAdminWorkspaceViewFromRequest(req, preferredView = null) {
  if (preferredView) {
    return normalizeAdminWorkspaceView(preferredView);
  }

  const requestPath = String(req.path || "");

  if (requestPath.startsWith("/admin/students")) {
    return "students";
  }

  if (requestPath.startsWith("/admin/teachers")) {
    return "teachers";
  }

  if (requestPath.startsWith("/admin/resources") || requestPath.startsWith("/admin/content")) {
    return "resources";
  }

  return "overview";
}

function adminRedirect(req, hash = "") {
  const viewByHash = {
    students: "students",
    teachers: "teachers",
    content: "resources",
  };
  const targetView = getAdminWorkspaceViewFromRequest(req, viewByHash[hash] || null);
  return req.baseUrl + getAdminWorkspacePath(targetView) + (hash ? `#${hash}` : "");
}

function handleAdminUpload(middleware, hash) {
  return (req, res, next) => {
    middleware(req, res, (error) => {
      if (error) {
        setFlash(req, "error_msg", error.message || "Khong the tai tep len luc nay.");
        return res.redirect(adminRedirect(req, hash));
      }

      return next();
    });
  };
}

async function safeQuery(sql, params = []) {
  try {
    const [rows] = await db.query(sql, params);
    return rows;
  } catch (err) {
    console.log("[admin] Query error:", err.message);
    return [];
  }
}

async function safeScalar(sql, params = [], fallback = 0) {
  const rows = await safeQuery(sql, params);

  if (!rows.length) {
    return fallback;
  }

  const [firstRow] = rows;
  const [firstKey] = Object.keys(firstRow);
  return firstRow[firstKey] ?? fallback;
}

function buildMonthSeries(rows, monthCount, valueKey) {
  const rowMap = new Map(
    rows.map((row) => [String(row.month_key), toNumber(row[valueKey])])
  );

  const cursor = new Date();
  cursor.setDate(1);
  cursor.setHours(0, 0, 0, 0);
  cursor.setMonth(cursor.getMonth() - (monthCount - 1));

  return Array.from({ length: monthCount }, (_, index) => {
    const current = new Date(cursor);
    current.setMonth(cursor.getMonth() + index);

    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, "0");
    const key = `${year}-${month}`;

    return {
      key,
      label: `T${current.getMonth() + 1}`,
      value: rowMap.get(key) || 0,
    };
  });
}

function buildRoleMix(rows) {
  const palette = {
    admin: "#fb7185",
    teacher: "#38bdf8",
    registered: "#5eead4",
    visitor: "#fbbf24",
  };

  const normalizedRows = rows.map((row) => ({
    role: row.role === "user" ? "registered" : row.role || "unknown",
    total: toNumber(row.total),
  }));
  const total = normalizedRows.reduce((sum, row) => sum + row.total, 0);

  return normalizedRows
    .map((row) => ({
      key: row.role,
      label: row.role,
      total: row.total,
      percentage: total ? Math.round((row.total / total) * 100) : 0,
      color: palette[row.role] || "#a78bfa",
    }))
    .sort((left, right) => right.total - left.total);
}

function buildStatusSummary(rows, palette) {
  const total = rows.reduce((sum, row) => sum + toNumber(row.total), 0);

  return rows
    .map((row) => {
      const key = row.status || "unknown";
      return {
        key,
        label: key.replace(/^\w/, (letter) => letter.toUpperCase()),
        total: toNumber(row.total),
        percentage: total ? Math.round((toNumber(row.total) / total) * 100) : 0,
        color: palette[key] || "#94a3b8",
      };
    })
    .sort((left, right) => right.total - left.total);
}

function paymentMethodLabel(method) {
  const labels = {
    cash: "Tien mat",
    bank: "Ngan hang",
    bank_transfer: "Chuyen khoan",
    transfer: "Chuyen khoan",
    momo: "MoMo",
    zalo_pay: "ZaloPay",
    card: "The",
    other: "Khac",
  };

  return labels[method] || method || "Khac";
}

function paymentStatusLabel(status) {
  const labels = {
    pending: "Cho duyet",
    confirmed: "Da xac nhan",
    rejected: "Tu choi",
  };

  return labels[status] || status || "Chua cap nhat";
}

function buildActivityFeed({ messages = [], payments = [], enrollments = [], baseUrl = "" }) {
  const activity = [];

  messages.slice(0, 5).forEach((item) => {
    activity.push({
      id: `message-${item.id}`,
      tone: item.status === "contacted" ? "emerald" : item.status === "viewed" ? "amber" : "cyan",
      title: item.name || item.email || "Lead moi",
      label: "Lead intake",
      meta: (item.message || "").replace(/\s+/g, " ").trim().slice(0, 110) || "Chua co noi dung",
      at: item.created_at || null,
      href: `${baseUrl}/messages`,
    });
  });

  payments.slice(0, 5).forEach((item) => {
    activity.push({
      id: `payment-${item.id}`,
      tone:
        item.status === "confirmed"
          ? "emerald"
          : item.status === "rejected"
            ? "rose"
            : "amber",
      title: item.student_name || "Cap nhat thanh toan",
      label: "Finance",
      meta: `${paymentMethodLabel(item.method)} - ${paymentStatusLabel(item.status)} - ${toNumber(item.amount).toLocaleString("vi-VN")} VND`,
      at: item.paid_at || null,
      href: `${baseUrl}/payments`,
    });
  });

  enrollments.slice(0, 5).forEach((item) => {
    activity.push({
      id: `enrollment-${item.id}`,
      tone: item.status === "completed" ? "emerald" : item.status === "canceled" ? "rose" : "violet",
      title: item.student_name || "Cap nhat ghi danh",
      label: "Enrollment",
      meta: `${item.course_name || "Chua co ten khoa hoc"} - ${item.class_code || "Chua co ma lop"}`,
      at: item.enrolled_at || null,
      href: `${baseUrl}/admin#classes`,
    });
  });

  return activity
    .sort((left, right) => new Date(right.at || 0).getTime() - new Date(left.at || 0).getTime())
    .slice(0, 10);
}

async function loadAdminDashboardData(req) {
  const [
    users,
    students,
    teachers,
    messages,
    classes,
    payments,
    recentEnrollments,
    teacherLoad,
    coursePerformance,
    roleRows,
    messageStatusRows,
    paymentMethodRows,
    enrollmentTrendRows,
    revenueTrendRows,
    totalUsers,
    totalStudents,
    totalTeachers,
    totalClasses,
    totalCourses,
    totalEnrollments,
    activeEnrollments,
    totalMessages,
    pendingMessages,
    totalPayments,
    pendingPayments,
    confirmedPayments,
    rejectedPayments,
    totalRevenue,
    thisMonthRevenue,
    unassignedClasses,
    classesStartingSoon,
    studentsMissingContact,
    teachersMissingContact,
    courseOptions,
    classOptions,
    teacherOptions,
  ] = await Promise.all([
    safeQuery(`
      SELECT id, username, email, role, created_at
      FROM users
      ORDER BY created_at DESC, id DESC
      LIMIT 12
    `),
    safeQuery(`
      SELECT
        s.id,
        s.user_id,
        s.full_name,
        s.phone,
        s.email,
        s.dob,
        s.created_at,
        COUNT(DISTINCT e.id) AS enrollment_count,
        COUNT(DISTINCT CASE WHEN e.status = 'active' THEN e.class_id END) AS active_class_count,
        GROUP_CONCAT(
          DISTINCT CASE WHEN e.status = 'active' THEN c.code END
          ORDER BY c.code ASC
          SEPARATOR ', '
        ) AS active_class_codes,
        COALESCE(SUM(CASE WHEN p.status = 'confirmed' THEN p.amount ELSE 0 END), 0) AS confirmed_paid,
        MAX(e.enrolled_at) AS last_enrolled_at
      FROM students s
      LEFT JOIN enrollments e ON e.student_id = s.id
      LEFT JOIN classes c ON c.id = e.class_id
      LEFT JOIN payments p ON p.enrollment_id = e.id
      GROUP BY s.id, s.user_id, s.full_name, s.phone, s.email, s.dob, s.created_at
      ORDER BY s.created_at DESC, s.id DESC
      LIMIT 80
    `),
    safeQuery(`
      SELECT
        t.id,
        t.user_id,
        t.full_name,
        t.phone,
        t.email,
        t.created_at,
        COUNT(DISTINCT c.id) AS class_count,
        GROUP_CONCAT(DISTINCT c.code ORDER BY c.code ASC SEPARATOR ', ') AS assigned_class_codes,
        COUNT(DISTINCT e.student_id) AS student_load,
        COALESCE(SUM(CASE WHEN p.status = 'confirmed' THEN p.amount ELSE 0 END), 0) AS confirmed_revenue
      FROM teachers t
      LEFT JOIN classes c ON c.teacher_id = t.id
      LEFT JOIN enrollments e ON e.class_id = c.id
      LEFT JOIN payments p ON p.enrollment_id = e.id
      GROUP BY t.id, t.user_id, t.full_name, t.phone, t.email, t.created_at
      ORDER BY t.created_at DESC, t.id DESC
      LIMIT 60
    `),
    safeQuery(`
      SELECT id, name, email, message, created_at, status, admin_note, contacted_at
      FROM messages
      ORDER BY created_at DESC, id DESC
      LIMIT 8
    `),
    safeQuery(`
      SELECT
        c.id,
        c.code,
        c.room,
        c.start_date,
        c.end_date,
        c.schedule_text,
        c.created_at,
        co.name AS course_name,
        co.category,
        co.fee,
        t.full_name AS teacher_name,
        COUNT(DISTINCT e.id) AS enrollment_count,
        COALESCE(SUM(CASE WHEN p.status = 'confirmed' THEN p.amount ELSE 0 END), 0) AS confirmed_revenue
      FROM classes c
      LEFT JOIN courses co ON co.id = c.course_id
      LEFT JOIN teachers t ON t.id = c.teacher_id
      LEFT JOIN enrollments e ON e.class_id = c.id
      LEFT JOIN payments p ON p.enrollment_id = e.id
      GROUP BY
        c.id,
        c.code,
        c.room,
        c.start_date,
        c.end_date,
        c.schedule_text,
        c.created_at,
        co.name,
        co.category,
        co.fee,
        t.full_name
      ORDER BY
        CASE WHEN c.start_date IS NULL THEN 1 ELSE 0 END,
        c.start_date DESC,
        c.id DESC
      LIMIT 24
    `),
    safeQuery(`
      SELECT
        p.id,
        p.amount,
        p.method,
        p.status,
        p.paid_at,
        p.note,
        p.txn_ref,
        s.full_name AS student_name,
        c.code AS class_code,
        co.name AS course_name
      FROM payments p
      LEFT JOIN enrollments e ON e.id = p.enrollment_id
      LEFT JOIN students s ON s.id = e.student_id
      LEFT JOIN classes c ON c.id = e.class_id
      LEFT JOIN courses co ON co.id = c.course_id
      ORDER BY p.paid_at DESC, p.id DESC
      LIMIT 8
    `),
    safeQuery(`
      SELECT
        e.id,
        e.status,
        e.enrolled_at,
        s.full_name AS student_name,
        c.code AS class_code,
        co.name AS course_name
      FROM enrollments e
      LEFT JOIN students s ON s.id = e.student_id
      LEFT JOIN classes c ON c.id = e.class_id
      LEFT JOIN courses co ON co.id = c.course_id
      ORDER BY e.enrolled_at DESC, e.id DESC
      LIMIT 8
    `),
    safeQuery(`
      SELECT
        t.id,
        t.full_name,
        COUNT(DISTINCT c.id) AS class_count,
        COUNT(DISTINCT e.id) AS enrollment_count
      FROM teachers t
      LEFT JOIN classes c ON c.teacher_id = t.id
      LEFT JOIN enrollments e ON e.class_id = c.id
      GROUP BY t.id, t.full_name
      ORDER BY enrollment_count DESC, class_count DESC, t.full_name ASC
      LIMIT 6
    `),
    safeQuery(`
      SELECT
        co.id,
        co.name,
        co.category,
        COUNT(DISTINCT c.id) AS class_count,
        COUNT(DISTINCT e.id) AS enrollment_count,
        COALESCE(SUM(CASE WHEN p.status = 'confirmed' THEN p.amount ELSE 0 END), 0) AS confirmed_revenue
      FROM courses co
      LEFT JOIN classes c ON c.course_id = co.id
      LEFT JOIN enrollments e ON e.class_id = c.id
      LEFT JOIN payments p ON p.enrollment_id = e.id
      GROUP BY co.id, co.name, co.category
      ORDER BY enrollment_count DESC, confirmed_revenue DESC, co.name ASC
      LIMIT 6
    `),
    safeQuery(`
      SELECT role, COUNT(*) AS total
      FROM users
      GROUP BY role
    `),
    safeQuery(`
      SELECT COALESCE(status, 'new') AS status, COUNT(*) AS total
      FROM messages
      GROUP BY COALESCE(status, 'new')
    `),
    safeQuery(`
      SELECT
        method,
        COUNT(*) AS total,
        COALESCE(SUM(CASE WHEN status = 'confirmed' THEN amount ELSE 0 END), 0) AS revenue
      FROM payments
      GROUP BY method
      ORDER BY revenue DESC, total DESC
    `),
    safeQuery(`
      SELECT DATE_FORMAT(enrolled_at, '%Y-%m') AS month_key, COUNT(*) AS total
      FROM enrollments
      WHERE enrolled_at >= DATE_SUB(CURDATE(), INTERVAL 5 MONTH)
      GROUP BY DATE_FORMAT(enrolled_at, '%Y-%m')
      ORDER BY month_key ASC
    `),
    safeQuery(`
      SELECT DATE_FORMAT(paid_at, '%Y-%m') AS month_key, COALESCE(SUM(CASE WHEN status = 'confirmed' THEN amount ELSE 0 END), 0) AS total
      FROM payments
      WHERE paid_at >= DATE_SUB(CURDATE(), INTERVAL 5 MONTH)
      GROUP BY DATE_FORMAT(paid_at, '%Y-%m')
      ORDER BY month_key ASC
    `),
    safeScalar(`SELECT COUNT(*) AS total FROM users`),
    safeScalar(`SELECT COUNT(*) AS total FROM students`),
    safeScalar(`SELECT COUNT(*) AS total FROM teachers`),
    safeScalar(`SELECT COUNT(*) AS total FROM classes`),
    safeScalar(`SELECT COUNT(*) AS total FROM courses`),
    safeScalar(`SELECT COUNT(*) AS total FROM enrollments`),
    safeScalar(`SELECT COUNT(*) AS total FROM enrollments WHERE status = 'active'`),
    safeScalar(`SELECT COUNT(*) AS total FROM messages`),
    safeScalar(`SELECT COUNT(*) AS total FROM messages WHERE status = 'new' OR status IS NULL`),
    safeScalar(`SELECT COUNT(*) AS total FROM payments`),
    safeScalar(`SELECT COUNT(*) AS total FROM payments WHERE status = 'pending'`),
    safeScalar(`SELECT COUNT(*) AS total FROM payments WHERE status = 'confirmed'`),
    safeScalar(`SELECT COUNT(*) AS total FROM payments WHERE status = 'rejected'`),
    safeScalar(`
      SELECT COALESCE(SUM(amount), 0) AS total
      FROM payments
      WHERE status = 'confirmed'
    `),
    safeScalar(`
      SELECT COALESCE(SUM(amount), 0) AS total
      FROM payments
      WHERE status = 'confirmed'
        AND YEAR(paid_at) = YEAR(CURDATE())
        AND MONTH(paid_at) = MONTH(CURDATE())
    `),
    safeScalar(`SELECT COUNT(*) AS total FROM classes WHERE teacher_id IS NULL`),
    safeScalar(`
      SELECT COUNT(*) AS total
      FROM classes
      WHERE start_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 14 DAY)
    `),
    safeScalar(`
      SELECT COUNT(*) AS total
      FROM students
      WHERE phone IS NULL OR phone = '' OR email IS NULL OR email = ''
    `),
    safeScalar(`
      SELECT COUNT(*) AS total
      FROM teachers
      WHERE phone IS NULL OR phone = '' OR email IS NULL OR email = ''
    `),
    safeQuery(`
      SELECT id, name, category, fee, duration_weeks
      FROM courses
      ORDER BY name ASC, id ASC
    `),
    safeQuery(`
      SELECT
        c.id,
        c.code,
        c.start_date,
        c.schedule_text,
        co.name AS course_name,
        t.full_name AS teacher_name
      FROM classes c
      LEFT JOIN courses co ON co.id = c.course_id
      LEFT JOIN teachers t ON t.id = c.teacher_id
      ORDER BY
        CASE WHEN c.start_date IS NULL THEN 1 ELSE 0 END,
        c.start_date ASC,
        c.id DESC
    `),
    safeQuery(`
      SELECT id, full_name, email
      FROM teachers
      ORDER BY full_name ASC, id ASC
    `),
  ]);

  const stats = {
    totalUsers: toNumber(totalUsers),
    totalStudents: toNumber(totalStudents),
    totalTeachers: toNumber(totalTeachers),
    totalClasses: toNumber(totalClasses),
    totalCourses: toNumber(totalCourses),
    totalEnrollments: toNumber(totalEnrollments),
    activeEnrollments: toNumber(activeEnrollments),
    totalMessages: toNumber(totalMessages),
    pendingMessages: toNumber(pendingMessages),
    totalPayments: toNumber(totalPayments),
    pendingPayments: toNumber(pendingPayments),
    confirmedPayments: toNumber(confirmedPayments),
    rejectedPayments: toNumber(rejectedPayments),
    totalRevenue: toNumber(totalRevenue),
    thisMonthRevenue: toNumber(thisMonthRevenue),
    unassignedClasses: toNumber(unassignedClasses),
    classesStartingSoon: toNumber(classesStartingSoon),
    studentsMissingContact: toNumber(studentsMissingContact),
    teachersMissingContact: toNumber(teachersMissingContact),
  };

  const health = {
    averageStudentsPerClass: stats.totalClasses
      ? (stats.activeEnrollments / stats.totalClasses).toFixed(1)
      : "0.0",
    collectionRate: stats.totalPayments
      ? Math.round((stats.confirmedPayments / stats.totalPayments) * 100)
      : 0,
    leadResponseRate: stats.totalMessages
      ? Math.round(((stats.totalMessages - stats.pendingMessages) / stats.totalMessages) * 100)
      : 100,
    studentProfileCoverage: stats.totalStudents
      ? Math.round(((stats.totalStudents - stats.studentsMissingContact) / stats.totalStudents) * 100)
      : 100,
  };

  const analytics = {
    enrollmentTrend: buildMonthSeries(enrollmentTrendRows, 6, "total"),
    revenueTrend: buildMonthSeries(revenueTrendRows, 6, "total"),
    roleMix: buildRoleMix(roleRows),
    messageStatuses: buildStatusSummary(messageStatusRows, {
      new: "#38bdf8",
      viewed: "#fbbf24",
      contacted: "#34d399",
    }),
    paymentMethods: paymentMethodRows.map((row, index) => ({
      key: row.method || `method-${index + 1}`,
      label: row.method || "other",
      total: toNumber(row.total),
      revenue: toNumber(row.revenue),
    })),
    teacherLoad: teacherLoad.map((row) => ({
      ...row,
      class_count: toNumber(row.class_count),
      enrollment_count: toNumber(row.enrollment_count),
    })),
    coursePerformance: coursePerformance.map((row) => ({
      ...row,
      class_count: toNumber(row.class_count),
      enrollment_count: toNumber(row.enrollment_count),
      confirmed_revenue: toNumber(row.confirmed_revenue),
    })),
  };

  const alerts = [
    {
      title: "New leads waiting",
      value: stats.pendingMessages,
      description: "New consultation requests have not been processed yet.",
      href: req.baseUrl + "/messages",
      tone: stats.pendingMessages ? "amber" : "emerald",
    },
    {
      title: "Pending payments",
      value: stats.pendingPayments,
      description: "Payments still need confirmation to lock the correct revenue status.",
      href: req.baseUrl + "/payments",
      tone: stats.pendingPayments ? "amber" : "emerald",
    },
    {
      title: "Classes without owner",
      value: stats.unassignedClasses,
      description: "Some classes still do not have a teacher assigned.",
      href: req.baseUrl + "/admin#classes",
      tone: stats.unassignedClasses ? "rose" : "emerald",
    },
    {
      title: "Student profiles incomplete",
      value: stats.studentsMissingContact,
      description: "Some student records are still missing phone or email.",
      href: req.baseUrl + "/admin/students#students",
      tone: stats.studentsMissingContact ? "violet" : "emerald",
    },
    {
      title: "Teachers missing contact",
      value: stats.teachersMissingContact,
      description: "Some teacher profiles still need contact details.",
      href: req.baseUrl + "/admin/teachers#teachers",
      tone: stats.teachersMissingContact ? "cyan" : "emerald",
    },
  ];

  return {
    users,
    students,
    teachers,
    messages,
    classes,
    payments,
    courseOptions,
    classOptions,
    teacherOptions,
    uploadedExamEntries: getUploadedExamEntries(),
    uploadedResourceEntries: getPublishedResourceEntries(),
    stats,
    health,
    analytics,
    alerts,
    activityFeed: buildActivityFeed({
      messages,
      payments,
      enrollments: recentEnrollments,
      baseUrl: req.baseUrl,
    }),
  };
}

async function renderAdminWorkspace(req, res, view) {
  const normalizedView = normalizeAdminWorkspaceView(view);

  const data = await loadAdminDashboardData(req);

  return renderWithLayout(res, "admin", {
    title: getAdminWorkspaceTitle(normalizedView),
    username: req.session.user?.username,
    adminWorkspaceView: normalizedView,
    ...data,
    generatedAt: new Date(),
  });
}

router.get("/admin", isLoggedIn, isAdmin, async (req, res) => {
  try {
    return renderAdminWorkspace(req, res, "overview");
  } catch (err) {
    console.error("[admin] Error:", err);
    return sendPublicError(res, err, 500, "Khong the tai trang quan tri luc nay.");
  }
});

router.get("/admin/students", isLoggedIn, isAdmin, async (req, res) => {
  try {
    return renderAdminWorkspace(req, res, "students");
  } catch (err) {
    console.error("[admin students] Error:", err);
    return sendPublicError(res, err, 500, "Khong the tai trang quan ly hoc vien luc nay.");
  }
});

router.get("/admin/teachers", isLoggedIn, isAdmin, async (req, res) => {
  try {
    return renderAdminWorkspace(req, res, "teachers");
  } catch (err) {
    console.error("[admin teachers] Error:", err);
    return sendPublicError(res, err, 500, "Khong the tai trang quan ly giao vien luc nay.");
  }
});

router.get("/admin/resources", isLoggedIn, isAdmin, async (req, res) => {
  try {
    return renderAdminWorkspace(req, res, "resources");
  } catch (err) {
    console.error("[admin resources] Error:", err);
    return sendPublicError(res, err, 500, "Không thể tải trang kho nội dung lúc này.");
  }
});

router.get("/admin/content/exams/:id/edit", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const examEditorEntry = getUploadedExamEditorEntry(req.params.id);

    return renderWithLayout(res, "admin-exam-editor", {
      title: `Chỉnh sửa đề thi ${examEditorEntry.title || req.params.id}`,
      username: req.session.user?.username,
      examEditorEntry,
    });
  } catch (err) {
    console.error("[admin exam editor] Error:", err);
    const statusCode = err.message && err.message.includes("Không tìm thấy") ? 404 : 500;
    return sendPublicError(res, err, statusCode, err.message || "Không thể tải trình sửa đề thi lúc này.");
  }
});

router.post("/admin/classes/add", isLoggedIn, isAdmin, express.urlencoded({ extended: true }), async (req, res) => {
  try {
    const createdClass = await createManagedClass({
      code: req.body.code,
      course_id: req.body.course_id,
      teacher_id: req.body.teacher_id,
      room: req.body.room,
      start_date: req.body.start_date,
      end_date: req.body.end_date,
      schedule_text: req.body.schedule_text,
    });

    setFlash(req, "success_msg", `Da tao lop ${createdClass?.code || ""} thanh cong.`);
    return res.redirect(adminRedirect(req, "classes"));
  } catch (err) {
    setFlash(req, "error_msg", err.message || "Khong the tao lop hoc.");
    return res.redirect(adminRedirect(req, "classes"));
  }
});

router.post("/admin/students/add", isLoggedIn, isAdmin, express.urlencoded({ extended: true }), async (req, res) => {
  try {
    if (!Number(req.body.class_id || 0)) {
      const fullName = normalizeText(req.body.full_name);
      const phone = normalizeText(req.body.phone);
      const email = normalizeText(req.body.email);
      const dob = normalizeDateInput(req.body.dob);

      if (!fullName) {
        setFlash(req, "error_msg", "Ho ten hoc vien la bat buoc.");
        return res.redirect(adminRedirect(req, "students"));
      }

      await db.query(
        `
          INSERT INTO students (full_name, phone, email, dob)
          VALUES (?, ?, ?, ?)
        `,
        [fullName, phone, email, dob]
      );

      setFlash(req, "success_msg", "Da tao ho so hoc vien thanh cong.");
      return res.redirect(adminRedirect(req, "students"));
    }

    const result = await createOfflineStudentEnrollment({
      full_name: req.body.full_name,
      phone: req.body.phone,
      email: req.body.email,
      dob: req.body.dob,
      class_id: req.body.class_id,
      enrollment_status: req.body.enrollment_status || "active",
      payment_method: req.body.payment_method || "cash",
      payment_status: req.body.payment_status || "confirmed",
      payment_amount: req.body.payment_amount,
      payment_note: req.body.payment_note,
      create_portal_account: req.body.create_portal_account,
      portal_password: req.body.portal_password,
    });

    const classLabel = result.classInfo?.code ? ` lop ${result.classInfo.code}` : "";
    const portalLabel = result.user?.id ? " Tai khoan hoc vien da duoc lien ket." : "";
    setFlash(req, "success_msg", `Da tao ho so va ghi danh hoc vien vao${classLabel}.${portalLabel}`);
    return res.redirect(adminRedirect(req, "students"));
  } catch (err) {
    setFlash(req, "error_msg", err.message || "Khong the tao ho so hoc vien.");
    return res.redirect(adminRedirect(req, "students"));
  }
});

router.post("/admin/students/:id/update", isLoggedIn, isAdmin, express.urlencoded({ extended: true }), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const fullName = normalizeText(req.body.full_name);
    const phone = normalizeText(req.body.phone);
    const email = normalizeText(req.body.email);
    const dob = normalizeDateInput(req.body.dob);

    if (!id || !fullName) {
      setFlash(req, "error_msg", "Thong tin hoc vien chua day du.");
      return res.redirect(adminRedirect(req, "students"));
    }

    await db.query(
      `
        UPDATE students
        SET full_name = ?, phone = ?, email = ?, dob = ?
        WHERE id = ?
      `,
      [fullName, phone, email, dob, id]
    );

    setFlash(req, "success_msg", "Da cap nhat ho so hoc vien.");
    return res.redirect(adminRedirect(req, "students"));
  } catch (err) {
    setFlash(req, "error_msg", "Khong the cap nhat ho so hoc vien.");
    return res.redirect(adminRedirect(req, "students"));
  }
});

router.post("/admin/students/:id/delete", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      setFlash(req, "error_msg", "Ma hoc vien khong hop le.");
      return res.redirect(adminRedirect(req, "students"));
    }

    await db.query("DELETE FROM students WHERE id = ?", [id]);

    setFlash(req, "success_msg", "Da xoa ho so hoc vien.");
    return res.redirect(adminRedirect(req, "students"));
  } catch (err) {
    setFlash(req, "error_msg", "Khong the xoa ho so hoc vien.");
    return res.redirect(adminRedirect(req, "students"));
  }
});

router.post("/admin/teachers/add", isLoggedIn, isAdmin, express.urlencoded({ extended: true }), async (req, res) => {
  try {
    const result = await createTeacherWithAssignments({
      full_name: req.body.full_name,
      phone: req.body.phone,
      email: req.body.email,
      class_ids: req.body.class_ids,
      create_portal_account: req.body.create_portal_account,
      portal_password: req.body.portal_password,
    });

    const assignmentLabel = result.classIds.length
      ? ` Da gan ${result.classIds.length} lop cho giao vien.`
      : "";
    setFlash(req, "success_msg", `Da tao ho so giao vien thanh cong.${assignmentLabel}`);
    return res.redirect(adminRedirect(req, "teachers"));
  } catch (err) {
    setFlash(req, "error_msg", err.message || "Khong the tao ho so giao vien.");
    return res.redirect(adminRedirect(req, "teachers"));
  }
});

router.post("/admin/teachers/assign-classes", isLoggedIn, isAdmin, express.urlencoded({ extended: true }), async (req, res) => {
  try {
    const result = await replaceTeacherAssignments({
      teacherId: req.body.teacher_id,
      classIds: req.body.class_ids,
    });

    setFlash(
      req,
      "success_msg",
      `Da cap nhat phan cong lop cho ${result.teacher?.full_name || "giao vien"} (${result.classIds.length} lop).`
    );
    return res.redirect(adminRedirect(req, "teachers"));
  } catch (err) {
    setFlash(req, "error_msg", err.message || "Khong the cap nhat phan cong giao vien.");
    return res.redirect(adminRedirect(req, "teachers"));
  }
});

router.post("/admin/teachers/:id/update", isLoggedIn, isAdmin, express.urlencoded({ extended: true }), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const fullName = normalizeText(req.body.full_name);
    const phone = normalizeText(req.body.phone);
    const email = normalizeText(req.body.email);

    if (!id || !fullName) {
      setFlash(req, "error_msg", "Thong tin giao vien chua day du.");
      return res.redirect(adminRedirect(req, "teachers"));
    }

    await db.query(
      `
        UPDATE teachers
        SET full_name = ?, phone = ?, email = ?
        WHERE id = ?
      `,
      [fullName, phone, email, id]
    );

    setFlash(req, "success_msg", "Da cap nhat ho so giao vien.");
    return res.redirect(adminRedirect(req, "teachers"));
  } catch (err) {
    setFlash(req, "error_msg", "Khong the cap nhat ho so giao vien.");
    return res.redirect(adminRedirect(req, "teachers"));
  }
});

router.post("/admin/teachers/:id/delete", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      setFlash(req, "error_msg", "Ma giao vien khong hop le.");
      return res.redirect(adminRedirect(req, "teachers"));
    }

    await db.query("DELETE FROM teachers WHERE id = ?", [id]);

    setFlash(req, "success_msg", "Da xoa ho so giao vien.");
    return res.redirect(adminRedirect(req, "teachers"));
  } catch (err) {
    setFlash(req, "error_msg", "Khong the xoa ho so giao vien.");
    return res.redirect(adminRedirect(req, "teachers"));
  }
});

router.post(
  "/admin/content/exams/add",
  isLoggedIn,
  isAdmin,
  handleAdminUpload(
    uploadAdminExamAssets.fields([
      { name: "exam_data_file", maxCount: 1 },
      { name: "answer_key_file", maxCount: 1 },
    ]),
    "content"
  ),
  async (req, res) => {
    try {
      const examDataFile = Array.isArray(req.files?.exam_data_file) ? req.files.exam_data_file[0] : null;
      const answerKeyFile = Array.isArray(req.files?.answer_key_file) ? req.files.answer_key_file[0] : null;

      const entry = registerUploadedExam({
        year: req.body.year,
        testNumber: req.body.test_number,
        title: req.body.title,
        bookName: req.body.book_name,
        dataFile: examDataFile,
        answerKeyFile,
      });

      setFlash(req, "success_msg", `Da dang ky de thi ${entry.title}. Thu vien full test va theo part/reading se tu dong cap nhat.`);
      return res.redirect(adminRedirect(req, "content"));
    } catch (err) {
      setFlash(req, "error_msg", err.message || "Khong the them de thi moi.");
      return res.redirect(adminRedirect(req, "content"));
    }
  }
);

router.post(
  "/admin/content/exams/:id/update",
  isLoggedIn,
  isAdmin,
  handleAdminUpload(
    uploadAdminExamAssets.fields([
      { name: "exam_data_file", maxCount: 1 },
      { name: "answer_key_file", maxCount: 1 },
    ]),
    "content"
  ),
  async (req, res) => {
    try {
      const examDataFile = Array.isArray(req.files?.exam_data_file) ? req.files.exam_data_file[0] : null;
      const answerKeyFile = Array.isArray(req.files?.answer_key_file) ? req.files.answer_key_file[0] : null;
      const entry = updateUploadedExam({
        id: req.params.id,
        title: req.body.title,
        bookName: req.body.book_name,
        examDataContent: req.body.exam_data_content,
        answerKeyContent: req.body.answer_key_content,
        examDataFile,
        answerKeyFile,
      });

      setFlash(req, "success_msg", `Đã cập nhật đề thi ${entry.title}.`);
      return res.redirect(`${req.baseUrl}/admin/content/exams/${encodeURIComponent(entry.id)}/edit`);
    } catch (err) {
      setFlash(req, "error_msg", err.message || "Không thể cập nhật đề thi lúc này.");
      return res.redirect(`${req.baseUrl}/admin/content/exams/${encodeURIComponent(req.params.id)}/edit`);
    }
  }
);

router.post("/admin/content/exams/:id/delete", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const entry = deleteUploadedExam(req.params.id);
    setFlash(req, "success_msg", `Đã xóa đề thi ${entry.title || req.params.id}.`);
    return res.redirect(adminRedirect(req, "content"));
  } catch (err) {
    setFlash(req, "error_msg", err.message || "Không thể xóa đề thi lúc này.");
    return res.redirect(adminRedirect(req, "content"));
  }
});

router.post(
  "/admin/content/resources/add",
  isLoggedIn,
  isAdmin,
  handleAdminUpload(uploadAdminResourceAssets.single("resource_file"), "content"),
  async (req, res) => {
    try {
      const entry = registerUploadedResource({
        title: req.body.title,
        description: req.body.description,
        audience: req.body.audience,
        resourceFile: req.file,
      });

      setFlash(req, "success_msg", `Da tai len tai lieu ${entry.title}.`);
      return res.redirect(adminRedirect(req, "content"));
    } catch (err) {
      setFlash(req, "error_msg", err.message || "Khong the tai tai lieu len web.");
      return res.redirect(adminRedirect(req, "content"));
    }
  }
);

router.post(
  "/admin/content/resources/:id/update",
  isLoggedIn,
  isAdmin,
  handleAdminUpload(uploadAdminResourceAssets.single("resource_file"), "content"),
  async (req, res) => {
    try {
      const entry = updateUploadedResource({
        id: req.params.id,
        title: req.body.title,
        description: req.body.description,
        audience: req.body.audience,
        resourceFile: req.file,
      });

      setFlash(req, "success_msg", `Đã cập nhật tài liệu ${entry.title}.`);
      return res.redirect(adminRedirect(req, "content"));
    } catch (err) {
      setFlash(req, "error_msg", err.message || "Không thể cập nhật tài liệu lúc này.");
      return res.redirect(adminRedirect(req, "content"));
    }
  }
);

router.post("/admin/content/resources/:id/delete", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const entry = deleteUploadedResource(req.params.id);
    setFlash(req, "success_msg", `Đã xóa tài liệu ${entry.title || req.params.id}.`);
    return res.redirect(adminRedirect(req, "content"));
  } catch (err) {
    setFlash(req, "error_msg", err.message || "Không thể xóa tài liệu lúc này.");
    return res.redirect(adminRedirect(req, "content"));
  }
});

module.exports = router;
