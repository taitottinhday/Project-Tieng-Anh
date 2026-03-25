const express = require("express");
const router = express.Router();
const db = require("../models/db");
const renderWithLayout = require("../utils/renderHelper");
const { isLoggedIn, isAdmin } = require("./auth");
const { sendPublicError } = require("../utils/publicError");

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

function adminRedirect(req, hash = "") {
  return req.baseUrl + "/admin" + (hash ? `#${hash}` : "");
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

  const total = rows.reduce((sum, row) => sum + toNumber(row.total), 0);

  return rows
    .map((row) => ({
      key: row.role || "unknown",
      label: row.role || "unknown",
      total: toNumber(row.total),
      percentage: total ? Math.round((toNumber(row.total) / total) * 100) : 0,
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
    cash: "Tiền mặt",
    bank: "Ngân hàng",
    bank_transfer: "Chuyển khoản",
    transfer: "Chuyển khoản",
    momo: "MoMo",
    zalo_pay: "ZaloPay",
    card: "Thẻ",
    other: "Khác",
  };

  return labels[method] || method || "Khác";
}

function paymentStatusLabel(status) {
  const labels = {
    pending: "Chờ duyệt",
    confirmed: "Đã xác nhận",
    rejected: "Từ chối",
  };

  return labels[status] || status || "Chưa cập nhật";
}

function buildActivityFeed({ messages = [], payments = [], enrollments = [], baseUrl = "" }) {
  const activity = [];

  messages.slice(0, 5).forEach((item) => {
    activity.push({
      id: `message-${item.id}`,
      tone: item.status === "contacted" ? "emerald" : item.status === "viewed" ? "amber" : "cyan",
      title: item.name || item.email || "Yêu cầu mới",
      label: "Tư vấn",
      meta: (item.message || "").replace(/\s+/g, " ").trim().slice(0, 110) || "Chưa có nội dung",
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
      title: item.student_name || "Cập nhật thanh toán",
      label: "Tài chính",
      meta: `${paymentMethodLabel(item.method)} - ${paymentStatusLabel(item.status)} - ${toNumber(item.amount).toLocaleString("vi-VN")} VNĐ`,
      at: item.paid_at || null,
      href: `${baseUrl}/payments`,
    });
  });

  enrollments.slice(0, 5).forEach((item) => {
    activity.push({
      id: `enrollment-${item.id}`,
      tone: item.status === "completed" ? "emerald" : item.status === "canceled" ? "rose" : "violet",
      title: item.student_name || "Cập nhật ghi danh",
      label: "Ghi danh",
      meta: `${item.course_name || "Chưa có tên khóa học"} - ${item.class_code || "Chưa có mã lớp"}`,
      at: item.enrolled_at || null,
      href: `${baseUrl}/admin#classes`,
    });
  });

  return activity
    .sort((left, right) => new Date(right.at || 0).getTime() - new Date(left.at || 0).getTime())
    .slice(0, 10);
}

router.get("/admin", isLoggedIn, isAdmin, async (req, res) => {
  try {
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
          s.full_name,
          s.phone,
          s.email,
          s.dob,
          s.created_at,
          COUNT(DISTINCT e.id) AS enrollment_count,
          COALESCE(SUM(CASE WHEN p.status = 'confirmed' THEN p.amount ELSE 0 END), 0) AS confirmed_paid,
          MAX(e.enrolled_at) AS last_enrolled_at
        FROM students s
        LEFT JOIN enrollments e ON e.student_id = s.id
        LEFT JOIN payments p ON p.enrollment_id = e.id
        GROUP BY s.id, s.full_name, s.phone, s.email, s.dob, s.created_at
        ORDER BY s.created_at DESC, s.id DESC
        LIMIT 80
      `),
      safeQuery(`
        SELECT
          t.id,
          t.full_name,
          t.phone,
          t.email,
          t.created_at,
          COUNT(DISTINCT c.id) AS class_count,
          COUNT(DISTINCT e.student_id) AS student_load,
          COALESCE(SUM(CASE WHEN p.status = 'confirmed' THEN p.amount ELSE 0 END), 0) AS confirmed_revenue
        FROM teachers t
        LEFT JOIN classes c ON c.teacher_id = t.id
        LEFT JOIN enrollments e ON e.class_id = c.id
        LEFT JOIN payments p ON p.enrollment_id = e.id
        GROUP BY t.id, t.full_name, t.phone, t.email, t.created_at
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
        ORDER BY c.start_date DESC, c.id DESC
        LIMIT 10
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
        title: "Yêu cầu tư vấn mới",
        value: stats.pendingMessages,
        description: "Các yêu cầu tư vấn mới chưa được phản hồi trong hộp thư.",
        href: req.baseUrl + "/messages",
        tone: stats.pendingMessages ? "amber" : "emerald",
      },
      {
        title: "Thanh toán chờ duyệt",
        value: stats.pendingPayments,
        description: "Cần xác nhận hoặc từ chối để chốt doanh thu đúng hạn.",
        href: req.baseUrl + "/payments",
        tone: stats.pendingPayments ? "amber" : "emerald",
      },
      {
        title: "Lớp chưa phân công",
        value: stats.unassignedClasses,
        description: "Một số lớp chưa được gán giáo viên phụ trách.",
        href: req.baseUrl + "/admin#classes",
        tone: stats.unassignedClasses ? "rose" : "emerald",
      },
      {
        title: "Hồ sơ học sinh thiếu thông tin",
        value: stats.studentsMissingContact,
        description: "Thiếu số điện thoại hoặc email để chăm sóc học viên.",
        href: req.baseUrl + "/admin#students",
        tone: stats.studentsMissingContact ? "violet" : "emerald",
      },
      {
        title: "Hồ sơ giáo viên thiếu liên hệ",
        value: stats.teachersMissingContact,
        description: "Cần bổ sung thông tin liên hệ để vận hành ổn định.",
        href: req.baseUrl + "/admin#teachers",
        tone: stats.teachersMissingContact ? "cyan" : "emerald",
      },
    ];

    const activityFeed = buildActivityFeed({
      messages,
      payments,
      enrollments: recentEnrollments,
      baseUrl: req.baseUrl,
    });

    renderWithLayout(res, "admin", {
      title: "Trung tâm điều hành",
      username: req.session.user?.username,
      users,
      students,
      teachers,
      messages,
      classes,
      payments,
      stats,
      health,
      analytics,
      alerts,
      activityFeed,
      generatedAt: new Date(),
    });
  } catch (err) {
    console.error("[admin] Error:", err);
    return sendPublicError(res, err, 500, "Không thể tải trang quản trị lúc này.");
  }
});

router.post("/admin/students/add", isLoggedIn, isAdmin, express.urlencoded({ extended: true }), async (req, res) => {
  try {
    const fullName = normalizeText(req.body.full_name);
    const phone = normalizeText(req.body.phone);
    const email = normalizeText(req.body.email);
    const dob = normalizeDateInput(req.body.dob);

    if (!fullName) {
      setFlash(req, "error_msg", "Họ tên học sinh là bắt buộc.");
      return res.redirect(adminRedirect(req, "students"));
    }

    await db.query(
      `INSERT INTO students (full_name, phone, email, dob) VALUES (?, ?, ?, ?)`,
      [fullName, phone, email, dob]
    );

    setFlash(req, "success_msg", "Đã tạo hồ sơ học sinh thành công.");
    res.redirect(adminRedirect(req, "students"));
  } catch (err) {
    setFlash(req, "error_msg", "Không thể tạo hồ sơ học sinh.");
    res.redirect(adminRedirect(req, "students"));
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
      setFlash(req, "error_msg", "Thông tin học sinh chưa đầy đủ.");
      return res.redirect(adminRedirect(req, "students"));
    }

    await db.query(
      `UPDATE students
       SET full_name = ?, phone = ?, email = ?, dob = ?
       WHERE id = ?`,
      [fullName, phone, email, dob, id]
    );

    setFlash(req, "success_msg", "Đã cập nhật hồ sơ học sinh.");
    res.redirect(adminRedirect(req, "students"));
  } catch (err) {
    setFlash(req, "error_msg", "Không thể cập nhật hồ sơ học sinh.");
    res.redirect(adminRedirect(req, "students"));
  }
});

router.post("/admin/students/:id/delete", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      setFlash(req, "error_msg", "Mã học sinh không hợp lệ.");
      return res.redirect(adminRedirect(req, "students"));
    }

    await db.query(`DELETE FROM students WHERE id = ?`, [id]);

    setFlash(req, "success_msg", "Đã xóa hồ sơ học sinh.");
    res.redirect(adminRedirect(req, "students"));
  } catch (err) {
    setFlash(req, "error_msg", "Không thể xóa hồ sơ học sinh.");
    res.redirect(adminRedirect(req, "students"));
  }
});

router.post("/admin/teachers/add", isLoggedIn, isAdmin, express.urlencoded({ extended: true }), async (req, res) => {
  try {
    const fullName = normalizeText(req.body.full_name);
    const phone = normalizeText(req.body.phone);
    const email = normalizeText(req.body.email);

    if (!fullName) {
      setFlash(req, "error_msg", "Họ tên giáo viên là bắt buộc.");
      return res.redirect(adminRedirect(req, "teachers"));
    }

    await db.query(
      `INSERT INTO teachers (full_name, phone, email) VALUES (?, ?, ?)`,
      [fullName, phone, email]
    );

    setFlash(req, "success_msg", "Đã tạo hồ sơ giáo viên thành công.");
    res.redirect(adminRedirect(req, "teachers"));
  } catch (err) {
    setFlash(req, "error_msg", "Không thể tạo hồ sơ giáo viên.");
    res.redirect(adminRedirect(req, "teachers"));
  }
});

router.post("/admin/teachers/:id/update", isLoggedIn, isAdmin, express.urlencoded({ extended: true }), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const fullName = normalizeText(req.body.full_name);
    const phone = normalizeText(req.body.phone);
    const email = normalizeText(req.body.email);

    if (!id || !fullName) {
      setFlash(req, "error_msg", "Thông tin giáo viên chưa đầy đủ.");
      return res.redirect(adminRedirect(req, "teachers"));
    }

    await db.query(
      `UPDATE teachers
       SET full_name = ?, phone = ?, email = ?
       WHERE id = ?`,
      [fullName, phone, email, id]
    );

    setFlash(req, "success_msg", "Đã cập nhật hồ sơ giáo viên.");
    res.redirect(adminRedirect(req, "teachers"));
  } catch (err) {
    setFlash(req, "error_msg", "Không thể cập nhật hồ sơ giáo viên.");
    res.redirect(adminRedirect(req, "teachers"));
  }
});

router.post("/admin/teachers/:id/delete", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      setFlash(req, "error_msg", "Mã giáo viên không hợp lệ.");
      return res.redirect(adminRedirect(req, "teachers"));
    }

    await db.query(`DELETE FROM teachers WHERE id = ?`, [id]);

    setFlash(req, "success_msg", "Đã xóa hồ sơ giáo viên.");
    res.redirect(adminRedirect(req, "teachers"));
  } catch (err) {
    setFlash(req, "error_msg", "Không thể xóa hồ sơ giáo viên.");
    res.redirect(adminRedirect(req, "teachers"));
  }
});

module.exports = router;
