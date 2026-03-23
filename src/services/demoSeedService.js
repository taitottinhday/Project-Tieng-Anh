const bcrypt = require("bcrypt");
const db = require("../models/db");

const DEMO_TEACHER_PASSWORD = "Teacher@123";

const DEMO_COURSES = [
  { name: "TOEIC Starter 350+", category: "TOEIC", fee: 3200000, durationWeeks: 8 },
  { name: "TOEIC Roadmap 550+", category: "TOEIC", fee: 3800000, durationWeeks: 10 },
  { name: "TOEIC Intensive 650+", category: "TOEIC", fee: 4200000, durationWeeks: 10 },
  { name: "TOEIC Fast Track 750+", category: "TOEIC", fee: 4500000, durationWeeks: 10 },
  { name: "TOEIC Elite 850+", category: "TOEIC", fee: 5200000, durationWeeks: 12 },
  { name: "TOEIC Speaking Jumpstart", category: "TOEIC SW", fee: 3600000, durationWeeks: 6 },
  { name: "TOEIC Writing Lab", category: "TOEIC SW", fee: 3400000, durationWeeks: 6 },
  { name: "Business English Communication", category: "Business English", fee: 4800000, durationWeeks: 8 },
  { name: "IELTS Foundation 5.5", category: "IELTS", fee: 4300000, durationWeeks: 10 },
  { name: "IELTS 6.5 Mastery", category: "IELTS", fee: 5600000, durationWeeks: 12 },
];

const DEMO_TEACHERS = [
  { fullName: "Nguyen Hoang Anh", phone: "0912345601", email: "hoanganh.teacher@thaytaiedu.vn" },
  { fullName: "Tran Thu Ha", phone: "0912345602", email: "thuha.teacher@thaytaiedu.vn" },
  { fullName: "Le Minh Quan", phone: "0912345603", email: "minhquan.teacher@thaytaiedu.vn" },
  { fullName: "Pham Bao Ngoc", phone: "0912345604", email: "baongoc.teacher@thaytaiedu.vn" },
  { fullName: "Do Khanh Linh", phone: "0912345605", email: "khanhlinh.teacher@thaytaiedu.vn" },
  { fullName: "Bui Gia Han", phone: "0912345606", email: "giahan.teacher@thaytaiedu.vn" },
  { fullName: "Vu Thanh Son", phone: "0912345607", email: "thanhson.teacher@thaytaiedu.vn" },
  { fullName: "Nguyen Lan Phuong", phone: "0912345608", email: "lanphuong.teacher@thaytaiedu.vn" },
  { fullName: "Hoang Quoc Viet", phone: "0912345609", email: "quocviet.teacher@thaytaiedu.vn" },
  { fullName: "Tran Duc Minh", phone: "0912345610", email: "ducminh.teacher@thaytaiedu.vn" },
];

const DEMO_STUDENTS = [
  { fullName: "Nguyen Bao An", phone: "0938100001", email: "baoan.demo@gmail.com", dob: "2004-02-18" },
  { fullName: "Tran Minh Chau", phone: "0938100002", email: "minhchau.demo@gmail.com", dob: "2003-08-25" },
  { fullName: "Le Gia Huy", phone: "0938100003", email: "giahuy.demo@gmail.com", dob: "2005-01-09" },
  { fullName: "Pham Nha Quynh", phone: "0938100004", email: "nhaquynh.demo@gmail.com", dob: "2004-11-30" },
  { fullName: "Do Khanh Vy", phone: "0938100005", email: "khanhvy.demo@gmail.com", dob: "2003-04-14" },
  { fullName: "Bui Tuan Kiet", phone: "0938100006", email: "tuankiet.demo@gmail.com", dob: "2002-07-03" },
  { fullName: "Vo Thu Trang", phone: "0938100007", email: "thutrang.demo@gmail.com", dob: "2005-06-27" },
  { fullName: "Nguyen Duc Anh", phone: "0938100008", email: "ducanh.demo@gmail.com", dob: "2004-12-11" },
  { fullName: "Tran Phuong Linh", phone: "0938100009", email: "phuonglinh.demo@gmail.com", dob: "2003-05-19" },
  { fullName: "Hoang Anh Thu", phone: "0938100010", email: "anhthu.demo@gmail.com", dob: "2004-09-07" },
];

const DEMO_CLASSES = [
  {
    code: "TS350-CG-0426",
    courseName: "TOEIC Starter 350+",
    teacherEmail: "hoanganh.teacher@thaytaiedu.vn",
    room: "P301",
    startDate: "2026-04-08",
    endDate: "2026-05-31",
    scheduleText: "T2-T4-T6 18:30-20:00",
  },
  {
    code: "TR550-CG-0426",
    courseName: "TOEIC Roadmap 550+",
    teacherEmail: "thuha.teacher@thaytaiedu.vn",
    room: "P302",
    startDate: "2026-04-10",
    endDate: "2026-06-19",
    scheduleText: "T3-T5-T7 18:00-19:30",
  },
  {
    code: "TI650-CG-0326",
    courseName: "TOEIC Intensive 650+",
    teacherEmail: "minhquan.teacher@thaytaiedu.vn",
    room: "P401",
    startDate: "2026-03-25",
    endDate: "2026-05-30",
    scheduleText: "T2-T4-T6 20:00-21:30",
  },
  {
    code: "TF750-NTL-0326",
    courseName: "TOEIC Fast Track 750+",
    teacherEmail: "baongoc.teacher@thaytaiedu.vn",
    room: "P402",
    startDate: "2026-03-18",
    endDate: "2026-06-05",
    scheduleText: "T3-T5 19:00-21:00",
  },
  {
    code: "TE850-NTL-0426",
    courseName: "TOEIC Elite 850+",
    teacherEmail: "khanhlinh.teacher@thaytaiedu.vn",
    room: "P501",
    startDate: "2026-04-20",
    endDate: "2026-07-10",
    scheduleText: "T2-T4-T6 17:45-19:15",
  },
  {
    code: "TSW-JS-0326",
    courseName: "TOEIC Speaking Jumpstart",
    teacherEmail: "giahan.teacher@thaytaiedu.vn",
    room: "Studio 1",
    startDate: "2026-03-29",
    endDate: "2026-05-09",
    scheduleText: "T7-CN 09:00-11:00",
  },
  {
    code: "TWL-LAB-0426",
    courseName: "TOEIC Writing Lab",
    teacherEmail: "thanhson.teacher@thaytaiedu.vn",
    room: "Studio 2",
    startDate: "2026-04-12",
    endDate: "2026-05-24",
    scheduleText: "CN 14:00-17:00",
  },
  {
    code: "BEC-COM-0426",
    courseName: "Business English Communication",
    teacherEmail: "lanphuong.teacher@thaytaiedu.vn",
    room: "P205",
    startDate: "2026-04-15",
    endDate: "2026-06-03",
    scheduleText: "T3-T5 18:45-20:45",
  },
  {
    code: "IELTS55-HTM-0426",
    courseName: "IELTS Foundation 5.5",
    teacherEmail: "quocviet.teacher@thaytaiedu.vn",
    room: "P207",
    startDate: "2026-04-05",
    endDate: "2026-06-14",
    scheduleText: "T2-T4-T6 19:00-21:00",
  },
  {
    code: "IELTS65-HTM-0526",
    courseName: "IELTS 6.5 Mastery",
    teacherEmail: "ducminh.teacher@thaytaiedu.vn",
    room: "P208",
    startDate: "2026-05-02",
    endDate: "2026-07-25",
    scheduleText: "T7-CN 13:30-16:30",
  },
];

function toNumber(value, fallback = 0) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
}

async function findSingleValue(sql, params = []) {
  const [rows] = await db.query(sql, params);
  return rows[0] || null;
}

async function findOrCreateCourse(course, summary) {
  const existing = await findSingleValue(
    "SELECT id FROM courses WHERE name = ? LIMIT 1",
    [course.name]
  );

  if (existing?.id) {
    return existing.id;
  }

  const [result] = await db.query(
    "INSERT INTO courses (name, category, fee, duration_weeks) VALUES (?, ?, ?, ?)",
    [course.name, course.category, course.fee, course.durationWeeks]
  );
  summary.coursesInserted += 1;
  return result.insertId;
}

async function findOrCreateTeacher(teacher, summary) {
  const existing = await findSingleValue(
    "SELECT id FROM teachers WHERE email = ? LIMIT 1",
    [teacher.email]
  );

  if (existing?.id) {
    return existing.id;
  }

  const [result] = await db.query(
    "INSERT INTO teachers (full_name, phone, email) VALUES (?, ?, ?)",
    [teacher.fullName, teacher.phone, teacher.email]
  );
  summary.teachersInserted += 1;
  return result.insertId;
}

async function findOrCreateTeacherUser(teacher, passwordHash, summary) {
  const existing = await findSingleValue(
    "SELECT id FROM users WHERE email = ? LIMIT 1",
    [teacher.email]
  );

  if (existing?.id) {
    return existing.id;
  }

  const [result] = await db.query(
    "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, 'teacher')",
    [teacher.fullName, teacher.email, passwordHash]
  );
  summary.teacherUsersInserted += 1;
  return result.insertId;
}

async function findOrCreateStudent(student, summary) {
  const existing = await findSingleValue(
    "SELECT id FROM students WHERE email = ? LIMIT 1",
    [student.email]
  );

  if (existing?.id) {
    return existing.id;
  }

  const [result] = await db.query(
    "INSERT INTO students (full_name, phone, email, dob) VALUES (?, ?, ?, ?)",
    [student.fullName, student.phone, student.email, student.dob]
  );
  summary.studentsInserted += 1;
  return result.insertId;
}

async function findOrCreateClass(classroom, courseId, teacherId, summary) {
  const existing = await findSingleValue(
    "SELECT id FROM classes WHERE code = ? LIMIT 1",
    [classroom.code]
  );

  if (existing?.id) {
    await db.query(
      `
        UPDATE classes
        SET course_id = ?, teacher_id = ?, room = ?, start_date = ?, end_date = ?, schedule_text = ?
        WHERE id = ?
      `,
      [
        courseId,
        teacherId,
        classroom.room,
        classroom.startDate,
        classroom.endDate,
        classroom.scheduleText,
        existing.id,
      ]
    );
    return existing.id;
  }

  const [result] = await db.query(
    `
      INSERT INTO classes (code, course_id, teacher_id, room, start_date, end_date, schedule_text)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      classroom.code,
      courseId,
      teacherId,
      classroom.room,
      classroom.startDate,
      classroom.endDate,
      classroom.scheduleText,
    ]
  );
  summary.classesInserted += 1;
  return result.insertId;
}

async function ensureEnrollment(studentId, classId, summary) {
  const existing = await findSingleValue(
    "SELECT id FROM enrollments WHERE student_id = ? AND class_id = ? LIMIT 1",
    [studentId, classId]
  );

  if (existing?.id) {
    return existing.id;
  }

  const [result] = await db.query(
    "INSERT INTO enrollments (student_id, class_id, status) VALUES (?, ?, 'active')",
    [studentId, classId]
  );
  summary.enrollmentsInserted += 1;
  return result.insertId;
}

async function ensurePayment(enrollmentId, amount, method, note, summary) {
  const existing = await findSingleValue(
    "SELECT id FROM payments WHERE enrollment_id = ? LIMIT 1",
    [enrollmentId]
  );

  if (existing?.id) {
    return existing.id;
  }

  const [result] = await db.query(
    "INSERT INTO payments (enrollment_id, amount, method, note) VALUES (?, ?, ?, ?)",
    [enrollmentId, amount, method, note]
  );
  summary.paymentsInserted += 1;
  return result.insertId;
}

async function seedDemoCenterData(options = {}) {
  const { onlyWhenEmpty = false } = options;
  const summary = {
    skipped: false,
    coursesInserted: 0,
    teachersInserted: 0,
    teacherUsersInserted: 0,
    studentsInserted: 0,
    classesInserted: 0,
    enrollmentsInserted: 0,
    paymentsInserted: 0,
    totalCoursesAfterSeed: 0,
    totalTeachersAfterSeed: 0,
    totalStudentsAfterSeed: 0,
    totalClassesAfterSeed: 0,
  };

  const existingCourseCount = await findSingleValue(
    "SELECT COUNT(*) AS total FROM courses"
  );

  if (onlyWhenEmpty && toNumber(existingCourseCount?.total) > 0) {
    summary.skipped = true;
    summary.totalCoursesAfterSeed = toNumber(existingCourseCount?.total);
    return summary;
  }

  const teacherPasswordHash = await bcrypt.hash(DEMO_TEACHER_PASSWORD, 10);
  const courseIdByName = new Map();
  const teacherIdByEmail = new Map();

  for (const course of DEMO_COURSES) {
    const courseId = await findOrCreateCourse(course, summary);
    courseIdByName.set(course.name, courseId);
  }

  for (const teacher of DEMO_TEACHERS) {
    const teacherId = await findOrCreateTeacher(teacher, summary);
    teacherIdByEmail.set(teacher.email, teacherId);
    await findOrCreateTeacherUser(teacher, teacherPasswordHash, summary);
  }

  for (const student of DEMO_STUDENTS) {
    await findOrCreateStudent(student, summary);
  }

  const [allStudentRows] = await db.query("SELECT id FROM students ORDER BY id ASC");
  const studentIds = allStudentRows.map((row) => row.id).filter(Boolean);
  const paymentMethods = ["bank", "cash", "momo", "bank"];

  for (let classIndex = 0; classIndex < DEMO_CLASSES.length; classIndex += 1) {
    const classroom = DEMO_CLASSES[classIndex];
    const courseId = courseIdByName.get(classroom.courseName);
    const teacherId = teacherIdByEmail.get(classroom.teacherEmail);
    const classId = await findOrCreateClass(classroom, courseId, teacherId, summary);
    const courseConfig = DEMO_COURSES.find((item) => item.name === classroom.courseName);
    const classStudentIds = Array.from({ length: Math.min(4, studentIds.length) }, (_, offset) => {
      return studentIds[(classIndex * 2 + offset) % studentIds.length];
    });

    for (let enrollmentIndex = 0; enrollmentIndex < classStudentIds.length; enrollmentIndex += 1) {
      const studentId = classStudentIds[enrollmentIndex];
      const enrollmentId = await ensureEnrollment(studentId, classId, summary);
      const paymentAmount = Math.round((courseConfig?.fee || 0) * (enrollmentIndex % 2 === 0 ? 1 : 0.65));
      const paymentMethod = paymentMethods[(classIndex + enrollmentIndex) % paymentMethods.length];
      const paymentNote = enrollmentIndex % 2 === 0 ? "Dong hoc phi demo day du" : "Dong hoc phi demo dot 1";
      await ensurePayment(enrollmentId, paymentAmount, paymentMethod, paymentNote, summary);
    }
  }

  const [courseRows] = await db.query("SELECT COUNT(*) AS total FROM courses");
  const [teacherRows] = await db.query("SELECT COUNT(*) AS total FROM teachers");
  const [studentRows] = await db.query("SELECT COUNT(*) AS total FROM students");
  const [classRows] = await db.query("SELECT COUNT(*) AS total FROM classes");

  summary.totalCoursesAfterSeed = toNumber(courseRows[0]?.total);
  summary.totalTeachersAfterSeed = toNumber(teacherRows[0]?.total);
  summary.totalStudentsAfterSeed = toNumber(studentRows[0]?.total);
  summary.totalClassesAfterSeed = toNumber(classRows[0]?.total);

  return summary;
}

module.exports = {
  DEMO_TEACHER_PASSWORD,
  DEMO_COURSES,
  DEMO_TEACHERS,
  DEMO_CLASSES,
  seedDemoCenterData,
};
