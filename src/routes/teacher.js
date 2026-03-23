const express = require("express");
const router = express.Router();
const db = require("../models/db");
const renderWithLayout = require("../utils/renderHelper");
const { isTeacher } = require("./auth");
const { uploadTeacherMaterials } = require("../services/platformSupport");
const {
    createClassroomPost,
    getTeacherAssignmentBoard,
    getTeacherClassroomHome,
    getTeacherClassroomList,
    saveTeacherReview,
} = require("../services/classroomService");

const ATTENDANCE_STATUSES = new Set(["present", "absent", "late", "excused"]);
const DAY_DEFINITIONS = [
    { key: "mon", label: "Thứ 2", patterns: [/\bT2\b/i, /\bTHỨ\s*2\b/i, /\bMON(?:DAY)?\b/i] },
    { key: "tue", label: "Thứ 3", patterns: [/\bT3\b/i, /\bTHỨ\s*3\b/i, /\bTUE(?:SDAY)?\b/i] },
    { key: "wed", label: "Thứ 4", patterns: [/\bT4\b/i, /\bTHỨ\s*4\b/i, /\bWED(?:NESDAY)?\b/i] },
    { key: "thu", label: "Thứ 5", patterns: [/\bT5\b/i, /\bTHỨ\s*5\b/i, /\bTHU(?:RSDAY)?\b/i] },
    { key: "fri", label: "Thứ 6", patterns: [/\bT6\b/i, /\bTHỨ\s*6\b/i, /\bFRI(?:DAY)?\b/i] },
    { key: "sat", label: "Thứ 7", patterns: [/\bT7\b/i, /\bTHỨ\s*7\b/i, /\bSAT(?:URDAY)?\b/i] },
    { key: "sun", label: "Chủ nhật", patterns: [/\bCN\b/i, /\bCHỦ\s*NHẬT\b/i, /\bSUN(?:DAY)?\b/i] }
];

let teacherSupportTablesReady = false;

async function ensureTeacherSupportTables() {
    if (teacherSupportTablesReady) {
        return;
    }

    await db.query(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        class_id INT NOT NULL,
        student_id INT NOT NULL,
        lesson_date DATE NOT NULL,
        status ENUM('present','absent','late','excused') DEFAULT 'present',
        note VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_attendance_class FOREIGN KEY (class_id) REFERENCES classes(id)
          ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT fk_attendance_student FOREIGN KEY (student_id) REFERENCES students(id)
          ON DELETE CASCADE ON UPDATE CASCADE,
        UNIQUE KEY uniq_attendance_student_class_date (class_id, student_id, lesson_date)
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS student_comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        class_id INT NOT NULL,
        student_id INT NOT NULL,
        teacher_id INT NOT NULL,
        lesson_date DATE NULL,
        skill_focus VARCHAR(100),
        comment TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_student_comments_class FOREIGN KEY (class_id) REFERENCES classes(id)
          ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT fk_student_comments_student FOREIGN KEY (student_id) REFERENCES students(id)
          ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT fk_student_comments_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id)
          ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);

    teacherSupportTablesReady = true;
}

async function safeQuery(sql, params = [], fallback = []) {
    try {
        const [rows] = await db.query(sql, params);
        return rows;
    } catch (err) {
        console.warn("[teacher] Query failed:", err.message);
        return fallback;
    }
}

async function safeScalar(sql, params = [], fallback = 0) {
    const rows = await safeQuery(sql, params, null);

    if (!rows || rows.length === 0) {
        return fallback;
    }

    const firstRow = rows[0];
    const firstKey = Object.keys(firstRow)[0];
    const value = firstRow[firstKey];

    return value === null || typeof value === "undefined" ? fallback : value;
}

function getTodayIso() {
    return new Date().toISOString().slice(0, 10);
}

function parseDate(value) {
    if (!value) {
        return null;
    }

    const raw = String(value);
    const normalized = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? `${raw}T00:00:00` : raw;
    const parsed = new Date(normalized);

    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDateLabel(value, options = { day: "2-digit", month: "2-digit", year: "numeric" }) {
    const parsed = parseDate(value);
    if (!parsed) {
        return null;
    }

    return new Intl.DateTimeFormat("vi-VN", options).format(parsed);
}

function diffInDays(fromValue, toValue) {
    const fromDate = parseDate(fromValue);
    const toDate = parseDate(toValue);

    if (!fromDate || !toDate) {
        return 0;
    }

    const msPerDay = 24 * 60 * 60 * 1000;
    return Math.round((toDate.getTime() - fromDate.getTime()) / msPerDay);
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(value, max));
}

function extractScheduleDays(scheduleText) {
    const text = String(scheduleText || "");

    return DAY_DEFINITIONS
        .filter((item) => item.patterns.some((pattern) => pattern.test(text)))
        .map((item) => item.label);
}

function computeClassPhase(item, todayIso) {
    const startDate = parseDate(item.start_date);
    const endDate = parseDate(item.end_date);
    const todayDate = parseDate(todayIso);

    if (!startDate && !endDate) {
        return {
            key: "draft",
            label: "Cần hoàn thiện",
            tone: "soft",
            progress: null,
            supportingText: "Bổ sung lịch học và thời gian vận hành để theo dõi sát hơn."
        };
    }

    if (startDate && todayDate && todayDate < startDate) {
        const daysUntilStart = Math.max(diffInDays(todayIso, item.start_date), 0);

        return {
            key: "upcoming",
            label: "Sắp khai giảng",
            tone: "pink",
            progress: 8,
            supportingText: daysUntilStart > 0
                ? `Còn ${daysUntilStart} ngày nữa bắt đầu lớp.`
                : "Lớp sẵn sàng bắt đầu."
        };
    }

    if (endDate && todayDate && todayDate > endDate) {
        return {
            key: "completed",
            label: "Đã kết thúc",
            tone: "navy",
            progress: 100,
            supportingText: "Khóa học đã hoàn tất, phù hợp để tổng kết kết quả."
        };
    }

    if (startDate && endDate && todayDate) {
        const totalDays = Math.max(diffInDays(item.start_date, item.end_date), 1);
        const elapsedDays = clamp(diffInDays(item.start_date, todayIso), 0, totalDays);
        const progress = clamp(Math.round((elapsedDays / totalDays) * 100), 5, 99);
        const daysLeft = Math.max(diffInDays(todayIso, item.end_date), 0);

        return {
            key: "active",
            label: "Đang vận hành",
            tone: "blue",
            progress,
            supportingText: daysLeft > 0
                ? `Còn ${daysLeft} ngày để hoàn thành khóa học.`
                : "Đang ở giai đoạn cuối của khóa học."
        };
    }

    return {
        key: "active",
        label: "Đang vận hành",
        tone: "blue",
        progress: null,
        supportingText: "Theo dõi tiến độ lớp học theo từng buổi dạy."
    };
}

function decorateClass(item, todayIso) {
    const totalStudents = Number(item.total_students || 0);
    const totalComments = Number(item.total_comments || 0);
    const phase = computeClassPhase(item, todayIso);

    return {
        ...item,
        fee: Number(item.fee || 0),
        total_students: totalStudents,
        total_comments: totalComments,
        duration_weeks: Number(item.duration_weeks || 0),
        phase,
        schedule_days: extractScheduleDays(item.schedule_text),
        start_label: formatDateLabel(item.start_date),
        end_label: formatDateLabel(item.end_date),
        last_attendance_label: formatDateLabel(item.last_attendance_date),
        attention_flags: [
            !item.schedule_text ? "Thiếu lịch học" : null,
            !item.room ? "Thiếu phòng học" : null,
            totalStudents === 0 ? "Chưa có học viên" : null
        ].filter(Boolean)
    };
}

function buildWeekdayLoad(classes) {
    return DAY_DEFINITIONS.map((day) => {
        const count = classes.filter((item) => item.schedule_days.includes(day.label)).length;
        return {
            key: day.key,
            label: day.label,
            count
        };
    }).filter((item) => item.count > 0);
}

function buildScheduleGroups(schedule) {
    const formatter = new Intl.DateTimeFormat("vi-VN", { month: "long", year: "numeric" });
    const groups = new Map();

    schedule.forEach((item) => {
        const label = item.start_date
            ? formatter.format(parseDate(item.start_date))
            : "Chưa ấn định thời gian";

        if (!groups.has(label)) {
            groups.set(label, {
                label,
                items: []
            });
        }

        groups.get(label).items.push(item);
    });

    return Array.from(groups.values());
}

function buildPriorityCards(classes, summary) {
    const cards = [];
    const pendingSetup = classes.filter((item) => item.attention_flags.length > 0);
    const upcomingClasses = classes.filter((item) => item.phase.key === "upcoming");

    if (pendingSetup.length > 0) {
        cards.push({
            title: "Hoàn thiện lớp học đang thiếu dữ liệu",
            description: `${pendingSetup.length} lớp đang thiếu lịch học, phòng học hoặc sĩ số.`,
            href: "/teacher/classes",
            action: "Rà soát lớp",
            tone: "pink"
        });
    }

    if (!summary.attendanceTotal) {
        cards.push({
            title: "Bắt đầu điểm danh định kỳ",
            description: "Điểm danh đều sẽ giúp bạn có dữ liệu chuyên cần rõ ràng hơn cho từng lớp.",
            href: "/teacher/attendance",
            action: "Điểm danh ngay",
            tone: "blue"
        });
    }

    if (!summary.recentCommentsCount) {
        cards.push({
            title: "Tạo vòng phản hồi cho học viên",
            description: "Nhận xét định kỳ là một phần quan trọng để phụ huynh và học viên nắm tiến độ.",
            href: "/teacher/comments",
            action: "Thêm nhận xét",
            tone: "navy"
        });
    }

    if (upcomingClasses.length > 0) {
        cards.push({
            title: "Chuẩn bị lớp sắp khai giảng",
            description: `${upcomingClasses.length} lớp đang ở trạng thái sẵn sàng bắt đầu.`,
            href: "/teacher/schedule",
            action: "Xem lịch dạy",
            tone: "blue"
        });
    }

    if (cards.length === 0) {
        cards.push({
            title: "Luồng giảng dạy đang ổn định",
            description: "Tất cả dữ liệu trọng yếu đã sẵn sàng. Bạn có thể tiếp tục theo dõi chất lượng lớp học.",
            href: "/teacher/dashboard",
            action: "Xem tổng quan",
            tone: "soft"
        });
    }

    return cards.slice(0, 4);
}

function normalizeAttendanceStudents(students) {
    return students.map((item) => {
        const selectedStatus = ATTENDANCE_STATUSES.has(item.attendance_status)
            ? item.attendance_status
            : "present";

        return {
            ...item,
            selected_status: selectedStatus,
            has_saved_attendance: Boolean(item.attendance_status),
            attendance_note: item.attendance_note || ""
        };
    });
}

function summarizeAttendanceStudents(students) {
    const summary = {
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
        draft: 0,
        total: students.length
    };

    students.forEach((item) => {
        summary[item.selected_status] += 1;
        if (!item.has_saved_attendance) {
            summary.draft += 1;
        }
    });

    return summary;
}

function summarizeAttendanceRows(rows) {
    const summary = {
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
        total: 0,
        engagementRate: null
    };

    rows.forEach((item) => {
        const status = String(item.status || "");
        const total = Number(item.total || 0);

        if (ATTENDANCE_STATUSES.has(status)) {
            summary[status] = total;
            summary.total += total;
        }
    });

    if (summary.total > 0) {
        const engaged = summary.present + summary.late + summary.excused;
        summary.engagementRate = Math.round((engaged / summary.total) * 100);
    }

    return summary;
}

function decorateStudentsForDetail(rows) {
    return rows.map((item) => ({
        ...item,
        present_count: Number(item.present_count || 0),
        absent_count: Number(item.absent_count || 0),
        late_count: Number(item.late_count || 0),
        comment_count: Number(item.comment_count || 0),
        enrolled_label: formatDateLabel(item.enrolled_at),
        last_comment_label: formatDateLabel(item.last_comment_at)
    }));
}

async function getTeacherByUser(req) {
    await ensureTeacherSupportTables();

    const email = req.session.user?.email;
    if (!email) {
        return null;
    }

    const [rows] = await db.query(
        "SELECT * FROM teachers WHERE email = ? LIMIT 1",
        [email]
    );

    return rows.length ? rows[0] : null;
}

function handleTeacherUpload(middleware) {
    return (req, res, next) => {
        middleware(req, res, (err) => {
            if (err) {
                req.flash("error_msg", err.message || "Không thể tải tệp lên lúc này.");
                const classId = Number(req.params.classId || 0);
                const fallbackPath = classId
                    ? `${req.baseUrl}/classroom/${classId}`
                    : `${req.baseUrl}/classroom`;
                return res.redirect(fallbackPath);
            }

            return next();
        });
    };
}

async function getTeacherClassCards(teacherId, todayIso) {
    const rows = await safeQuery(`
      SELECT
        c.id,
        c.code,
        c.room,
        c.schedule_text,
        c.start_date,
        c.end_date,
        co.name AS course_name,
        co.category,
        co.fee,
        co.duration_weeks,
        (
          SELECT COUNT(*)
          FROM enrollments e
          WHERE e.class_id = c.id
        ) AS total_students,
        (
          SELECT COUNT(*)
          FROM student_comments sc
          WHERE sc.class_id = c.id AND sc.teacher_id = ?
        ) AS total_comments,
        (
          SELECT MAX(a.lesson_date)
          FROM attendance a
          WHERE a.class_id = c.id
        ) AS last_attendance_date
      FROM classes c
      LEFT JOIN courses co ON c.course_id = co.id
      WHERE c.teacher_id = ?
      ORDER BY
        CASE WHEN c.start_date IS NULL THEN 1 ELSE 0 END,
        c.start_date ASC,
        c.id DESC
    `, [teacherId, teacherId], []);

    return rows.map((item) => decorateClass(item, todayIso));
}

// Dashboard giáo viên
router.get("/dashboard", isTeacher, async (req, res) => {
    try {
        const teacher = await getTeacherByUser(req);

        if (!teacher) {
            return res.send("Không tìm thấy thông tin giáo viên. Hãy đảm bảo email trong bảng users trùng với bảng teachers.");
        }

        const todayIso = getTodayIso();
        const classCards = await getTeacherClassCards(teacher.id, todayIso);
        const todayClasses = classCards.filter((item) => item.phase.key !== "completed").slice(0, 5);
        const weeklyLoad = buildWeekdayLoad(classCards);
        const attendanceRows = await safeQuery(`
          SELECT a.status, COUNT(*) AS total
          FROM attendance a
          INNER JOIN classes c ON c.id = a.class_id
          WHERE c.teacher_id = ?
          GROUP BY a.status
        `, [teacher.id], []);
        const attendanceSummary = summarizeAttendanceRows(attendanceRows);
        const recentCommentsCount = await safeScalar(
            "SELECT COUNT(*) AS total FROM student_comments WHERE teacher_id = ?",
            [teacher.id],
            0
        );
        const studentsWithFeedback = await safeScalar(
            "SELECT COUNT(DISTINCT student_id) AS total FROM student_comments WHERE teacher_id = ?",
            [teacher.id],
            0
        );
        const todayAttendanceCount = await safeScalar(`
          SELECT COUNT(*) AS total
          FROM attendance a
          INNER JOIN classes c ON c.id = a.class_id
          WHERE c.teacher_id = ? AND a.lesson_date = ?
        `, [teacher.id, todayIso], 0);
        const recentComments = await safeQuery(`
          SELECT
            sc.id,
            sc.skill_focus,
            sc.lesson_date,
            sc.comment,
            sc.created_at,
            s.full_name,
            c.code AS class_code,
            co.name AS course_name
          FROM student_comments sc
          LEFT JOIN students s ON sc.student_id = s.id
          LEFT JOIN classes c ON sc.class_id = c.id
          LEFT JOIN courses co ON c.course_id = co.id
          WHERE sc.teacher_id = ?
          ORDER BY COALESCE(sc.lesson_date, DATE(sc.created_at)) DESC, sc.created_at DESC
          LIMIT 4
        `, [teacher.id], []);

        const totalStudents = classCards.reduce((sum, item) => sum + Number(item.total_students || 0), 0);
        const stats = {
            totalClasses: classCards.length,
            totalStudents,
            attendanceRate: attendanceSummary.engagementRate,
            recentCommentsCount,
            todayAttendanceCount,
            studentsWithFeedback,
            activeClasses: classCards.filter((item) => item.phase.key === "active").length
        };

        renderWithLayout(res, "teacher-dashboard", {
            title: "Không gian giáo viên",
            teacher,
            stats,
            myClasses: classCards.slice(0, 4),
            todayClasses,
            weeklyLoad,
            recentComments,
            priorityCards: buildPriorityCards(classCards, {
                attendanceTotal: attendanceSummary.total,
                recentCommentsCount
            }),
            todayIso
        });
    } catch (err) {
        res.send("ERROR: " + err.message);
    }
});

// Lớp của tôi
router.get("/classes", isTeacher, async (req, res) => {
    try {
        const teacher = await getTeacherByUser(req);

        if (!teacher) {
            return res.send("Không tìm thấy thông tin giáo viên.");
        }

        const todayIso = getTodayIso();
        const classes = await getTeacherClassCards(teacher.id, todayIso);
        const classSummary = {
            totalClasses: classes.length,
            totalStudents: classes.reduce((sum, item) => sum + item.total_students, 0),
            activeClasses: classes.filter((item) => item.phase.key === "active").length,
            upcomingClasses: classes.filter((item) => item.phase.key === "upcoming").length,
            totalComments: classes.reduce((sum, item) => sum + item.total_comments, 0)
        };

        renderWithLayout(res, "teacher-classes", {
            title: "Lớp phụ trách",
            teacher,
            classes,
            classSummary
        });
    } catch (err) {
        res.send("ERROR: " + err.message);
    }
});

// Chi tiết 1 lớp
router.get("/classes/:id", isTeacher, async (req, res) => {
    try {
        const teacher = await getTeacherByUser(req);
        const classId = Number(req.params.id);

        if (!teacher) {
            return res.send("Không tìm thấy thông tin giáo viên.");
        }

        const todayIso = getTodayIso();
        const classes = await getTeacherClassCards(teacher.id, todayIso);
        const classInfo = classes.find((item) => Number(item.id) === classId);

        if (!classInfo) {
            return res.status(404).send("Không tìm thấy lớp học.");
        }

        const studentRows = await safeQuery(`
          SELECT
            e.id AS enrollment_id,
            e.status,
            e.enrolled_at,
            s.id AS student_id,
            s.full_name,
            s.phone,
            s.email,
            (
              SELECT COUNT(*)
              FROM attendance a
              WHERE a.class_id = e.class_id
                AND a.student_id = s.id
                AND a.status = 'present'
            ) AS present_count,
            (
              SELECT COUNT(*)
              FROM attendance a
              WHERE a.class_id = e.class_id
                AND a.student_id = s.id
                AND a.status = 'absent'
            ) AS absent_count,
            (
              SELECT COUNT(*)
              FROM attendance a
              WHERE a.class_id = e.class_id
                AND a.student_id = s.id
                AND a.status = 'late'
            ) AS late_count,
            (
              SELECT COUNT(*)
              FROM student_comments sc
              WHERE sc.class_id = e.class_id
                AND sc.student_id = s.id
                AND sc.teacher_id = ?
            ) AS comment_count,
            (
              SELECT MAX(sc.created_at)
              FROM student_comments sc
              WHERE sc.class_id = e.class_id
                AND sc.student_id = s.id
                AND sc.teacher_id = ?
            ) AS last_comment_at
          FROM enrollments e
          LEFT JOIN students s ON e.student_id = s.id
          WHERE e.class_id = ?
          ORDER BY s.full_name ASC
        `, [teacher.id, teacher.id, classId], []);

        const students = decorateStudentsForDetail(studentRows);
        const recentComments = await safeQuery(`
          SELECT
            sc.id,
            sc.skill_focus,
            sc.lesson_date,
            sc.comment,
            sc.created_at,
            s.full_name
          FROM student_comments sc
          LEFT JOIN students s ON sc.student_id = s.id
          WHERE sc.teacher_id = ? AND sc.class_id = ?
          ORDER BY COALESCE(sc.lesson_date, DATE(sc.created_at)) DESC, sc.created_at DESC
          LIMIT 4
        `, [teacher.id, classId], []);
        const attendanceEntries = await safeScalar(
            "SELECT COUNT(*) AS total FROM attendance WHERE class_id = ?",
            [classId],
            0
        );

        renderWithLayout(res, "teacher-class-detail", {
            title: "Chi tiết lớp học",
            teacher,
            classInfo,
            students,
            recentComments,
            classMetrics: {
                totalStudents: students.length,
                activeStudents: students.filter((item) => item.status === "active").length,
                totalComments: classInfo.total_comments,
                attendanceEntries
            }
        });
    } catch (err) {
        res.send("ERROR: " + err.message);
    }
});

// Lịch dạy
router.get("/schedule", isTeacher, async (req, res) => {
    try {
        const teacher = await getTeacherByUser(req);

        if (!teacher) {
            return res.send("Không tìm thấy thông tin giáo viên.");
        }

        const todayIso = getTodayIso();
        const schedule = await getTeacherClassCards(teacher.id, todayIso);
        const scheduleStats = {
            total: schedule.length,
            active: schedule.filter((item) => item.phase.key === "active").length,
            upcoming: schedule.filter((item) => item.phase.key === "upcoming").length,
            completed: schedule.filter((item) => item.phase.key === "completed").length
        };

        renderWithLayout(res, "teacher-schedule", {
            title: "Lịch dạy",
            teacher,
            schedule,
            scheduleGroups: buildScheduleGroups(schedule),
            scheduleStats,
            weekdayLoad: buildWeekdayLoad(schedule),
            nextClass: schedule.find((item) => item.phase.key !== "completed") || null
        });
    } catch (err) {
        res.send("ERROR: " + err.message);
    }
});

// Hồ sơ giáo viên
router.get("/profile", isTeacher, async (req, res) => {
    try {
        const teacher = await getTeacherByUser(req);

        if (!teacher) {
            return res.send("Không tìm thấy thông tin giáo viên.");
        }

        const todayIso = getTodayIso();
        const classes = await getTeacherClassCards(teacher.id, todayIso);
        const recentCommentsCount = await safeScalar(
            "SELECT COUNT(*) AS total FROM student_comments WHERE teacher_id = ?",
            [teacher.id],
            0
        );
        const attendanceRecords = await safeScalar(`
          SELECT COUNT(*) AS total
          FROM attendance a
          INNER JOIN classes c ON c.id = a.class_id
          WHERE c.teacher_id = ?
        `, [teacher.id], 0);
        const uniqueStudents = await safeScalar(`
          SELECT COUNT(DISTINCT e.student_id) AS total
          FROM enrollments e
          INNER JOIN classes c ON c.id = e.class_id
          WHERE c.teacher_id = ?
        `, [teacher.id], 0);
        const expertiseClusters = await safeQuery(`
          SELECT
            COALESCE(NULLIF(co.category, ''), 'Đa kỹ năng') AS category,
            COUNT(*) AS total
          FROM classes c
          LEFT JOIN courses co ON c.course_id = co.id
          WHERE c.teacher_id = ?
          GROUP BY COALESCE(NULLIF(co.category, ''), 'Đa kỹ năng')
          ORDER BY total DESC, category ASC
        `, [teacher.id], []);

        renderWithLayout(res, "teacher-profile", {
            title: "Hồ sơ giáo viên",
            teacher,
            classes: classes.slice(0, 6),
            profileStats: {
                totalClasses: classes.length,
                uniqueStudents,
                recentCommentsCount,
                attendanceRecords
            },
            expertiseClusters
        });
    } catch (err) {
        res.send("ERROR: " + err.message);
    }
});

// Trang chọn lớp để điểm danh
router.get("/attendance", isTeacher, async (req, res) => {
    try {
        const teacher = await getTeacherByUser(req);

        if (!teacher) {
            return res.send("Không tìm thấy thông tin giáo viên.");
        }

        const todayIso = /^\d{4}-\d{2}-\d{2}$/.test(req.query.date || "") ? req.query.date : getTodayIso();
        const classes = await getTeacherClassCards(teacher.id, todayIso);

        renderWithLayout(res, "teacher-attendance", {
            title: "Điểm danh học viên",
            teacher,
            classes,
            selectedClass: null,
            students: [],
            lessonDate: todayIso,
            success: req.query.success || null,
            attendanceSummary: {
                present: 0,
                absent: 0,
                late: 0,
                excused: 0,
                draft: 0,
                total: 0
            }
        });
    } catch (err) {
        res.send("ERROR: " + err.message);
    }
});

// Mở form điểm danh theo lớp + ngày
router.get("/attendance/:classId", isTeacher, async (req, res) => {
    try {
        const teacher = await getTeacherByUser(req);
        const classId = Number(req.params.classId);
        const lessonDate = /^\d{4}-\d{2}-\d{2}$/.test(req.query.date || "") ? req.query.date : getTodayIso();

        if (!teacher) {
            return res.send("Không tìm thấy thông tin giáo viên.");
        }

        const classes = await getTeacherClassCards(teacher.id, lessonDate);
        const selectedClass = classes.find((item) => Number(item.id) === classId);

        if (!selectedClass) {
            return res.status(404).send("Không tìm thấy lớp học.");
        }

        const studentRows = await safeQuery(`
          SELECT
            s.id AS student_id,
            s.full_name,
            s.phone,
            s.email,
            e.status AS enrollment_status,
            a.status AS attendance_status,
            a.note AS attendance_note
          FROM enrollments e
          LEFT JOIN students s ON e.student_id = s.id
          LEFT JOIN attendance a
            ON a.student_id = s.id
            AND a.class_id = e.class_id
            AND a.lesson_date = ?
          WHERE e.class_id = ?
          ORDER BY s.full_name ASC
        `, [lessonDate, classId], []);

        const students = normalizeAttendanceStudents(studentRows);

        renderWithLayout(res, "teacher-attendance", {
            title: "Điểm danh học viên",
            teacher,
            classes,
            selectedClass,
            students,
            lessonDate,
            success: req.query.success || null,
            attendanceSummary: summarizeAttendanceStudents(students)
        });
    } catch (err) {
        res.send("ERROR: " + err.message);
    }
});

// Lưu điểm danh
router.post("/attendance/:classId", isTeacher, express.urlencoded({ extended: true }), async (req, res) => {
    try {
        const teacher = await getTeacherByUser(req);
        const classId = Number(req.params.classId);
        const lessonDate = /^\d{4}-\d{2}-\d{2}$/.test(req.body.lesson_date || "")
            ? req.body.lesson_date
            : getTodayIso();

        if (!teacher) {
            return res.send("Không tìm thấy thông tin giáo viên.");
        }

        const [classRows] = await db.query(`
          SELECT id
          FROM classes
          WHERE id = ? AND teacher_id = ?
          LIMIT 1
        `, [classId, teacher.id]);

        if (!classRows.length) {
            return res.status(403).send("Bạn không có quyền điểm danh lớp này.");
        }

        const [enrolledStudents] = await db.query(`
          SELECT student_id
          FROM enrollments
          WHERE class_id = ?
        `, [classId]);

        for (const row of enrolledStudents) {
            const studentId = row.student_id;
            const rawStatus = req.body[`status_${studentId}`];
            const status = ATTENDANCE_STATUSES.has(rawStatus) ? rawStatus : "present";
            const note = String(req.body[`note_${studentId}`] || "").trim();

            await db.query(`
              INSERT INTO attendance (class_id, student_id, lesson_date, status, note)
              VALUES (?, ?, ?, ?, ?)
              ON DUPLICATE KEY UPDATE
                status = VALUES(status),
                note = VALUES(note)
            `, [classId, studentId, lessonDate, status, note]);
        }

        return res.redirect(req.baseUrl + `/attendance/${classId}?date=${lessonDate}&success=1`);
    } catch (err) {
        return res.send("ERROR: " + err.message);
    }
});

// Trang nhận xét học viên
router.get("/comments", isTeacher, async (req, res) => {
    try {
        const teacher = await getTeacherByUser(req);

        if (!teacher) {
            return res.send("Không tìm thấy thông tin giáo viên.");
        }

        const todayIso = getTodayIso();
        const classes = await getTeacherClassCards(teacher.id, todayIso);
        const classId = Number(req.query.class_id || 0);
        const selectedClass = classes.find((item) => Number(item.id) === classId) || null;
        let students = [];
        let comments = [];
        let commentStats = {
            total: 0,
            thisMonth: 0
        };
        let skillSummary = [];

        if (selectedClass) {
            students = await safeQuery(`
              SELECT
                s.id AS student_id,
                s.full_name,
                s.phone,
                s.email
              FROM enrollments e
              LEFT JOIN students s ON e.student_id = s.id
              WHERE e.class_id = ?
              ORDER BY s.full_name ASC
            `, [classId], []);

            comments = await safeQuery(`
              SELECT
                sc.id,
                sc.lesson_date,
                sc.skill_focus,
                sc.comment,
                sc.created_at,
                s.full_name
              FROM student_comments sc
              LEFT JOIN students s ON sc.student_id = s.id
              WHERE sc.teacher_id = ? AND sc.class_id = ?
              ORDER BY COALESCE(sc.lesson_date, DATE(sc.created_at)) DESC, sc.created_at DESC
              LIMIT 50
            `, [teacher.id, classId], []);

            commentStats = {
                total: await safeScalar(
                    "SELECT COUNT(*) AS total FROM student_comments WHERE teacher_id = ? AND class_id = ?",
                    [teacher.id, classId],
                    0
                ),
                thisMonth: await safeScalar(`
                  SELECT COUNT(*) AS total
                  FROM student_comments
                  WHERE teacher_id = ?
                    AND class_id = ?
                    AND DATE_FORMAT(created_at, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')
                `, [teacher.id, classId], 0)
            };

            skillSummary = await safeQuery(`
              SELECT
                COALESCE(NULLIF(skill_focus, ''), 'Tổng quát') AS skill_focus,
                COUNT(*) AS total
              FROM student_comments
              WHERE teacher_id = ? AND class_id = ?
              GROUP BY COALESCE(NULLIF(skill_focus, ''), 'Tổng quát')
              ORDER BY total DESC, skill_focus ASC
              LIMIT 5
            `, [teacher.id, classId], []);
        }

        renderWithLayout(res, "teacher-comments", {
            title: "Nhận xét học viên",
            teacher,
            classes,
            classId,
            selectedClass,
            students,
            comments,
            commentStats,
            skillSummary,
            success: req.query.success || null,
            defaultLessonDate: todayIso
        });
    } catch (err) {
        res.send("ERROR: " + err.message);
    }
});

// Lưu nhận xét học viên
router.post("/comments", isTeacher, express.urlencoded({ extended: true }), async (req, res) => {
    try {
        const teacher = await getTeacherByUser(req);

        if (!teacher) {
            return res.send("Không tìm thấy thông tin giáo viên.");
        }

        const classId = Number(req.body.class_id || 0);
        const studentId = Number(req.body.student_id || 0);
        const lessonDate = /^\d{4}-\d{2}-\d{2}$/.test(req.body.lesson_date || "")
            ? req.body.lesson_date
            : null;
        const skillFocus = String(req.body.skill_focus || "").trim();
        const comment = String(req.body.comment || "").trim();

        if (!classId || !studentId || !comment) {
            return res.send("Thiếu thông tin nhận xét.");
        }

        const [classRows] = await db.query(`
          SELECT id
          FROM classes
          WHERE id = ? AND teacher_id = ?
          LIMIT 1
        `, [classId, teacher.id]);

        if (!classRows.length) {
            return res.status(403).send("Bạn không có quyền nhận xét lớp này.");
        }

        const [studentRows] = await db.query(`
          SELECT 1
          FROM enrollments
          WHERE class_id = ? AND student_id = ?
          LIMIT 1
        `, [classId, studentId]);

        if (!studentRows.length) {
            return res.status(400).send("Học viên không thuộc lớp học này.");
        }

        await db.query(`
          INSERT INTO student_comments (class_id, student_id, teacher_id, lesson_date, skill_focus, comment)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [classId, studentId, teacher.id, lessonDate, skillFocus || null, comment]);

        return res.redirect(req.baseUrl + `/comments?class_id=${classId}&success=1`);
    } catch (err) {
        res.send("ERROR: " + err.message);
    }
});

// Không gian lớp học số
router.get("/classroom", isTeacher, async (req, res) => {
    try {
        const teacher = await getTeacherByUser(req);

        if (!teacher) {
            return res.send("Không tìm thấy thông tin giáo viên.");
        }

        const classrooms = await getTeacherClassroomList(teacher.id);
        const totals = classrooms.reduce((summary, item) => ({
            classes: summary.classes + 1,
            students: summary.students + Number(item.student_count || 0),
            lectures: summary.lectures + Number(item.lecture_count || 0),
            assignments: summary.assignments + Number(item.assignment_count || 0),
            submissions: summary.submissions + Number(item.submission_count || 0),
        }), {
            classes: 0,
            students: 0,
            lectures: 0,
            assignments: 0,
            submissions: 0,
        });

        renderWithLayout(res, "teacher-classroom", {
            title: "Lớp học số giáo viên",
            teacher,
            classrooms,
            classroomTotals: totals,
            success: req.query.success || null,
        });
    } catch (err) {
        res.send("ERROR: " + err.message);
    }
});

router.get("/classroom/:classId", isTeacher, async (req, res) => {
    try {
        const teacher = await getTeacherByUser(req);
        const classId = Number(req.params.classId);

        if (!teacher) {
            return res.send("Không tìm thấy thông tin giáo viên.");
        }

        const classroom = await getTeacherClassroomHome(teacher.id, classId);
        if (!classroom) {
            return res.status(404).send("Không tìm thấy lớp học số.");
        }

        const assignmentPosts = classroom.posts.filter((item) => item.post_type === "assignment");
        const lecturePosts = classroom.posts.filter((item) => item.post_type === "lecture");
        const pendingReviewCount = assignmentPosts.reduce((total, item) => {
            return total + Math.max(Number(item.turned_in_count || 0) - Number(item.reviewed_count || 0), 0);
        }, 0);

        renderWithLayout(res, "teacher-classroom-detail", {
            title: "Chi tiết lớp học số",
            teacher,
            classInfo: classroom.classInfo,
            posts: classroom.posts,
            students: classroom.students,
            postStats: {
                lectures: lecturePosts.length,
                assignments: assignmentPosts.length,
                pendingReviewCount,
            },
            success: req.query.success || null,
        });
    } catch (err) {
        res.send("ERROR: " + err.message);
    }
});

router.post(
    "/classroom/:classId/posts",
    isTeacher,
    handleTeacherUpload(uploadTeacherMaterials.array("materials", 8)),
    express.urlencoded({ extended: true }),
    async (req, res) => {
        try {
            const teacher = await getTeacherByUser(req);
            const classId = Number(req.params.classId);
            const title = String(req.body.title || "").trim();
            const description = String(req.body.description || "").trim();
            const postType = req.body.post_type === "assignment" ? "assignment" : "lecture";
            const dueDate = req.body.due_date;

            if (!teacher) {
                return res.send("Không tìm thấy thông tin giáo viên.");
            }

            if (!classId || !title) {
                req.flash("error_msg", "Cần nhập tiêu đề bài giảng hoặc bài tập.");
                return res.redirect(req.baseUrl + `/classroom/${classId}`);
            }

            await createClassroomPost({
                teacherId: teacher.id,
                classId,
                title,
                description,
                postType,
                dueDate,
                files: req.files || [],
            });

            return res.redirect(req.baseUrl + `/classroom/${classId}?success=1`);
        } catch (err) {
            req.flash("error_msg", err.message || "Không thể đăng bài lúc này.");
            return res.redirect(req.baseUrl + `/classroom/${req.params.classId}`);
        }
    }
);

router.get("/classroom/:classId/posts/:postId", isTeacher, async (req, res) => {
    try {
        const teacher = await getTeacherByUser(req);
        const classId = Number(req.params.classId);
        const postId = Number(req.params.postId);

        if (!teacher) {
            return res.send("Không tìm thấy thông tin giáo viên.");
        }

        const board = await getTeacherAssignmentBoard(teacher.id, classId, postId);
        if (!board) {
            return res.status(404).send("Không tìm thấy bài tập cần chấm.");
        }

        renderWithLayout(res, "teacher-assignment-review", {
            title: "Chấm bài học viên",
            teacher,
            classId,
            post: board.post,
            students: board.students,
            success: req.query.success || null,
        });
    } catch (err) {
        res.send("ERROR: " + err.message);
    }
});

router.post("/classroom/:classId/posts/:postId/review/:studentId", isTeacher, express.urlencoded({ extended: true }), async (req, res) => {
    try {
        const teacher = await getTeacherByUser(req);
        const classId = Number(req.params.classId);
        const postId = Number(req.params.postId);
        const studentId = Number(req.params.studentId);

        if (!teacher) {
            return res.send("Không tìm thấy thông tin giáo viên.");
        }

        await saveTeacherReview({
            teacherId: teacher.id,
            classId,
            postId,
            studentId,
            teacherFeedback: req.body.teacher_feedback,
            teacherScore: req.body.teacher_score,
        });

        return res.redirect(req.baseUrl + `/classroom/${classId}/posts/${postId}?success=1`);
    } catch (err) {
        req.flash("error_msg", err.message || "Không thể lưu đánh giá lúc này.");
        return res.redirect(req.baseUrl + `/classroom/${req.params.classId}/posts/${req.params.postId}`);
    }
});

module.exports = router;
