const db = require("../models/db");

const STUDENT_DISCOUNT_RATE = 0.25;

const STUDENT_COURSE_SHOWCASE = [
  {
    key: "tap-su",
    title: "TẬP SỰ",
    courseName: "TẬP SỰ",
    category: "TOEIC",
    originalFee: 3200000,
    durationWeeks: 8,
    sessions: "25 buổi",
    bullets: [
      "Phát triển kỹ năng nghe cơ bản",
      "Tích lũy từ vựng",
      "Học ngữ pháp cơ bản",
    ],
    image: "https://i.pinimg.com/1200x/76/11/3b/76113b577b8d936f670eeacf3bfc8e02.jpg",
    placeholder: "Ảnh khóa Tập Sự",
    tone: "starter",
    classSeed: {
      code: "TSU-FOUND-0426",
      teacherEmail: "hoanganh.teacher@thaytaiedu.vn",
      room: "P201",
      startDate: "2026-04-06",
      endDate: "2026-05-29",
      scheduleText: "T2-T4-T6 17:45-19:15",
    },
  },
  {
    key: "toeic-a",
    title: "TOEIC A",
    courseName: "TOEIC A",
    category: "TOEIC",
    originalFee: 3900000,
    durationWeeks: 10,
    sessions: "27 buổi",
    bullets: [
      "Hoàn thành Part 1-2-3-4",
      "Hệ thống lại ngữ pháp",
      "Làm quen với phần Reading cơ bản",
    ],
    image: "https://i.pinimg.com/736x/66/53/e9/6653e98495ff276ffd2f071d208b9f79.jpg",
    placeholder: "Ảnh khóa TOEIC A",
    tone: "a",
    classSeed: {
      code: "TOEICA-CORE-0526",
      teacherEmail: "thuha.teacher@thaytaiedu.vn",
      room: "P202",
      startDate: "2026-05-05",
      endDate: "2026-07-14",
      scheduleText: "T3-T5-T7 18:00-19:30",
    },
  },
  {
    key: "toeic-b",
    title: "TOEIC B",
    courseName: "TOEIC B",
    category: "TOEIC",
    originalFee: 3500000,
    durationWeeks: 10,
    sessions: "25 buổi",
    bullets: [
      "Tập trung vào Reading",
      "Tập trung vào Vocab",
      "Hoàn thiện toàn bộ kỹ năng",
    ],
    image: "https://i.pinimg.com/736x/49/99/fb/4999fb2b2439e2eab91b90796f661fb5.jpg",
    placeholder: "Ảnh khóa TOEIC B",
    tone: "b",
    classSeed: {
      code: "TOEICB-ADV-0526",
      teacherEmail: "minhquan.teacher@thaytaiedu.vn",
      room: "P203",
      startDate: "2026-05-07",
      endDate: "2026-07-16",
      scheduleText: "T3-T5 19:00-21:00",
    },
  },
  {
    key: "toeic-sw",
    title: "TOEIC S&W",
    courseName: "TOEIC Speaking & Writing",
    category: "TOEIC SW",
    originalFee: 4000000,
    durationWeeks: 6,
    sessions: "30 buổi",
    bullets: [
      "Đầu vào TOEIC LR 600-650+",
      "Đầu ra 260-300+ điểm S&W",
      "Hỗ trợ thi lên tới 2.000.000đ",
    ],
    image: "https://i.pinimg.com/736x/7c/1c/a2/7c1ca2a6865ba76bea40a6925ba481a0.jpg",
    placeholder: "Ảnh khóa TOEIC S&W",
    tone: "sw",
    note: "Dành cho học viên đã có nền TOEIC LR và muốn học lộ trình Speaking & Writing đồng bộ.",
    classSeed: {
      code: "TSW-CORE-0526",
      teacherEmail: "giahan.teacher@thaytaiedu.vn",
      room: "Studio 3",
      startDate: "2026-05-09",
      endDate: "2026-06-20",
      scheduleText: "T7-CN 13:30-16:00",
    },
  },
  {
    key: "toeic-starter-350",
    title: "TOEIC Starter 350+",
    courseName: "TOEIC Starter 350+",
    category: "TOEIC",
    originalFee: 3300000,
    durationWeeks: 8,
    sessions: "24 buổi",
    bullets: [
      "Lấy lại nền từ vựng và ngữ pháp trọng tâm",
      "Tập phản xạ nghe Part 1-2-3 theo nhịp chậm",
      "Xây thói quen học đều và chữa lỗi cá nhân",
    ],
    image: "https://i.pinimg.com/1200x/e8/3f/60/e83f60edca1d257db49a8f2430bc9c37.jpg",
    placeholder: "Ảnh khóa TOEIC Starter 350+",
    tone: "starter",
    classSeed: {
      code: "TS350-CG-0426",
      teacherEmail: "hoanganh.teacher@thaytaiedu.vn",
      room: "P301",
      startDate: "2026-04-08",
      endDate: "2026-05-31",
      scheduleText: "T2-T4-T6 18:30-20:00",
    },
  },
  {
    key: "toeic-roadmap-550",
    title: "TOEIC Roadmap 550+",
    courseName: "TOEIC Roadmap 550+",
    category: "TOEIC",
    originalFee: 3850000,
    durationWeeks: 10,
    sessions: "28 buổi",
    bullets: [
      "Tăng chắc Part 3-4-5-6 theo dạng câu hỏi",
      "Hệ thống hóa kỹ thuật skimming và scanning",
      "Kiểm tra tiến độ theo mini test hàng tuần",
    ],
    image: "https://i.pinimg.com/736x/d3/82/9d/d3829de1490f5f25d881ac6c26035408.jpg",
    placeholder: "Ảnh khóa TOEIC Roadmap 550+",
    tone: "a",
    classSeed: {
      code: "TR550-CG-0426",
      teacherEmail: "thuha.teacher@thaytaiedu.vn",
      room: "P302",
      startDate: "2026-04-10",
      endDate: "2026-06-19",
      scheduleText: "T3-T5-T7 18:00-19:30",
    },
  },
  {
    key: "toeic-intensive-650",
    title: "TOEIC Intensive 650+",
    courseName: "TOEIC Intensive 650+",
    category: "TOEIC",
    originalFee: 4200000,
    durationWeeks: 10,
    sessions: "30 buổi",
    bullets: [
      "Đẩy tốc độ làm reading và xử lý bẫy thường gặp",
      "Luyện nghe cụm paraphrase và suy luận ngữ cảnh",
      "Theo sát đầu ra 600-700 với full test định kỳ",
    ],
    image: "https://i.pinimg.com/736x/f8/8e/80/f88e80f2791605780d155ccff28809a4.jpg",
    placeholder: "Ảnh khóa TOEIC Intensive 650+",
    tone: "b",
    classSeed: {
      code: "TI650-CG-0326",
      teacherEmail: "minhquan.teacher@thaytaiedu.vn",
      room: "P401",
      startDate: "2026-03-25",
      endDate: "2026-05-30",
      scheduleText: "T2-T4-T6 20:00-21:30",
    },
  },
  {
    key: "toeic-fast-track-750",
    title: "TOEIC Fast Track 750+",
    courseName: "TOEIC Fast Track 750+",
    category: "TOEIC",
    originalFee: 4600000,
    durationWeeks: 10,
    sessions: "30 buổi",
    bullets: [
      "Rút ngắn thời gian xử lý part khó và dài",
      "Luyện bộ đề nâng cao có chữa chiến lược làm bài",
      "Tập trung band điểm 700-780 cho sinh viên năm cuối",
    ],
    image: "https://i.pinimg.com/736x/8f/1b/4f/8f1b4fb4511947643c5dcf6897cb2899.jpg",
    placeholder: "Ảnh khóa TOEIC Fast Track 750+",
    tone: "sw",
    classSeed: {
      code: "TF750-NTL-0326",
      teacherEmail: "baongoc.teacher@thaytaiedu.vn",
      room: "P402",
      startDate: "2026-03-18",
      endDate: "2026-06-05",
      scheduleText: "T3-T5 19:00-21:00",
    },
  },
  {
    key: "toeic-elite-850",
    title: "TOEIC Elite 850+",
    courseName: "TOEIC Elite 850+",
    category: "TOEIC",
    originalFee: 5200000,
    durationWeeks: 12,
    sessions: "34 buổi",
    bullets: [
      "Làm chủ bẫy nâng cao của Part 3-4-7",
      "Huấn luyện tư duy chọn đáp án trong thời gian ngắn",
      "Phù hợp hồ sơ xin việc và đầu ra doanh nghiệp",
    ],
    image: "https://i.pinimg.com/736x/d2/3e/08/d23e08ed09c9d523cd1bca994bcbc252.jpg",
    placeholder: "Ảnh khóa TOEIC Elite 850+",
    tone: "starter",
    classSeed: {
      code: "TE850-NTL-0426",
      teacherEmail: "khanhlinh.teacher@thaytaiedu.vn",
      room: "P501",
      startDate: "2026-04-20",
      endDate: "2026-07-10",
      scheduleText: "T2-T4-T6 17:45-19:15",
    },
  },
  {
    key: "toeic-speaking-jumpstart",
    title: "Speaking Jumpstart",
    courseName: "TOEIC Speaking Jumpstart",
    category: "TOEIC SW",
    originalFee: 3600000,
    durationWeeks: 6,
    sessions: "18 buổi",
    bullets: [
      "Tạo phản xạ nói câu ngắn rõ và đúng ý",
      "Chỉnh phát âm, ngữ điệu và tốc độ trả lời",
      "Luyện task hỏi đáp và mô tả tranh thực tế",
    ],
    image: "https://i.pinimg.com/736x/73/da/69/73da693ee83465c344639249e0483498.jpg",
    placeholder: "Ảnh khóa Speaking Jumpstart",
    tone: "a",
    classSeed: {
      code: "TSW-JS-0326",
      teacherEmail: "giahan.teacher@thaytaiedu.vn",
      room: "Studio 1",
      startDate: "2026-03-29",
      endDate: "2026-05-09",
      scheduleText: "T7-CN 09:00-11:00",
    },
  },
  {
    key: "toeic-writing-lab",
    title: "Writing Lab",
    courseName: "TOEIC Writing Lab",
    category: "TOEIC SW",
    originalFee: 3400000,
    durationWeeks: 6,
    sessions: "16 buổi",
    bullets: [
      "Rèn câu trả lời email và phản hồi ngắn gọn",
      "Viết opinion và proposal có bố cục rõ",
      "Nhận feedback sửa bài trực tiếp từng buổi",
    ],
    image: "https://i.pinimg.com/736x/25/45/b9/2545b9abd619e37a31aba4546ca27315.jpg",
    placeholder: "Ảnh khóa Writing Lab",
    tone: "b",
    classSeed: {
      code: "TWL-LAB-0426",
      teacherEmail: "thanhson.teacher@thaytaiedu.vn",
      room: "Studio 2",
      startDate: "2026-04-12",
      endDate: "2026-05-24",
      scheduleText: "CN 14:00-17:00",
    },
  },
  {
    key: "business-english",
    title: "Business English",
    courseName: "Business English Communication",
    category: "Business English",
    originalFee: 4800000,
    durationWeeks: 8,
    sessions: "20 buổi",
    bullets: [
      "Email, meeting và thuyết trình cho môi trường công sở",
      "Mẫu câu làm việc với khách hàng và team quốc tế",
      "Case study bám sát bối cảnh doanh nghiệp",
    ],
    image: "https://i.pinimg.com/736x/21/84/4e/21844e98feea517a509768c6cc409da7.jpg",
    placeholder: "Ảnh khóa Business English",
    tone: "sw",
    classSeed: {
      code: "BEC-COM-0426",
      teacherEmail: "lanphuong.teacher@thaytaiedu.vn",
      room: "P205",
      startDate: "2026-04-15",
      endDate: "2026-06-03",
      scheduleText: "T3-T5 18:45-20:45",
    },
  },
  {
    key: "ielts-foundation-55",
    title: "IELTS Foundation 5.5",
    courseName: "IELTS Foundation 5.5",
    category: "IELTS",
    originalFee: 4300000,
    durationWeeks: 10,
    sessions: "28 buổi",
    bullets: [
      "Làm quen 4 kỹ năng với lộ trình học bài bản",
      "Xây từ vựng học thuật và cấu trúc nền tảng",
      "Phù hợp học viên chuyển từ TOEIC sang IELTS",
    ],
    image: "https://i.postimg.cc/1XQvqrMf/h7.png",
    placeholder: "Ảnh khóa IELTS Foundation 5.5",
    tone: "starter",
    classSeed: {
      code: "IELTS55-HTM-0426",
      teacherEmail: "quocviet.teacher@thaytaiedu.vn",
      room: "P207",
      startDate: "2026-04-05",
      endDate: "2026-06-14",
      scheduleText: "T2-T4-T6 19:00-21:00",
    },
  },
  {
    key: "ielts-65-mastery",
    title: "IELTS 6.5 Mastery",
    courseName: "IELTS 6.5 Mastery",
    category: "IELTS",
    originalFee: 5600000,
    durationWeeks: 12,
    sessions: "32 buổi",
    bullets: [
      "Tập trung chiến lược Reading và Writing band cao",
      "Speaking mock test cùng phản hồi theo tiêu chí",
      "Dành cho mục tiêu du học hoặc đầu ra học thuật",
    ],
    image: "https://i.postimg.cc/1RwT3fM6/h6.png",
    placeholder: "Ảnh khóa IELTS 6.5 Mastery",
    tone: "a",
    classSeed: {
      code: "IELTS65-HTM-0526",
      teacherEmail: "ducminh.teacher@thaytaiedu.vn",
      room: "P208",
      startDate: "2026-05-02",
      endDate: "2026-07-25",
      scheduleText: "T7-CN 13:30-16:30",
    },
  },
  {
    key: "pronunciation-lab",
    title: "Pronunciation Lab",
    courseName: "Pronunciation Lab",
    category: "Speaking",
    originalFee: 2900000,
    durationWeeks: 5,
    sessions: "14 buổi",
    bullets: [
      "Sửa âm cuối, trọng âm và nối âm thực chiến",
      "Giảm ngại nói trước khi vào lớp speaking chuyên sâu",
      "Bài tập shadowing ngắn, dễ duy trì mỗi ngày",
    ],
    image: "https://i.pinimg.com/736x/f6/7a/9d/f67a9d0bf310b8e742004184a9dfe03d.jpg",
    placeholder: "Ảnh khóa Pronunciation Lab",
    tone: "b",
    classSeed: {
      code: "PRON-LAB-0526",
      teacherEmail: "giahan.teacher@thaytaiedu.vn",
      room: "Studio 4",
      startDate: "2026-05-12",
      endDate: "2026-06-16",
      scheduleText: "T2-T4 19:15-20:45",
    },
  },
  {
    key: "interview-english",
    title: "Interview English",
    courseName: "Interview English",
    category: "Business English",
    originalFee: 3700000,
    durationWeeks: 5,
    sessions: "15 buổi",
    bullets: [
      "Mô phỏng phỏng vấn intern và fresher bằng tiếng Anh",
      "Luyện CV pitch, self-introduction và Q&A thực tế",
      "Phù hợp học viên sắp đi thực tập hoặc xin việc",
    ],
    image: "https://i.postimg.cc/c1vx9Msm/h5.png",
    placeholder: "Ảnh khóa Interview English",
    tone: "sw",
    classSeed: {
      code: "INT-ENG-0526",
      teacherEmail: "lanphuong.teacher@thaytaiedu.vn",
      room: "P206",
      startDate: "2026-05-14",
      endDate: "2026-06-18",
      scheduleText: "T3-T5 17:45-19:15",
    },
  },
];

const COURSE_MENU_ITEMS = [
  {
    label: "TOEIC 2 kỹ năng",
    href: "/courses-blog/toeic-2-ky-nang",
    note: "Lộ trình nền tảng nghe đọc và tăng band theo từng chặng.",
  },
  {
    label: "TOEIC 4 kỹ năng",
    href: "/courses-blog/toeic-4-ky-nang",
    note: "Bổ sung speaking, writing và lộ trình học đồng bộ hơn.",
  },
  {
    label: "Khóa học cấp tốc",
    href: "/courses-blog/khoa-hoc-cap-toc",
    note: "Phù hợp khi cần rút ngắn thời gian ôn và bứt tốc điểm số.",
  },
  {
    label: "Tiếng Anh doanh nghiệp",
    href: "/courses-blog/tieng-anh-doanh-nghiep",
    note: "Dùng cho giao tiếp công sở, email, meeting và thuyết trình.",
  },
];

let salesCatalogReady = false;
let salesCatalogPromise = null;
const SALES_CATALOG_LOCK_KEY = "student_course_sales_catalog_sync";

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function calculateDiscountedFee(originalFee) {
  return Math.max(0, Math.round(Number(originalFee || 0) * (1 - STUDENT_DISCOUNT_RATE)));
}

function formatCurrency(amount) {
  return `${Number(amount || 0).toLocaleString("vi-VN")}đ`;
}

function buildCourseRegisterHref(baseUrl, courseKey) {
  return `${baseUrl}/register-course?course_key=${encodeURIComponent(courseKey)}`;
}

function buildGuestCourseAuthHref(baseUrl) {
  const redirectTarget = `${baseUrl}/student/courses`;
  return `${baseUrl}/login?redirect=${encodeURIComponent(redirectTarget)}`;
}

function resolveCourseSelectionByKey(courseKey) {
  const normalizedKey = normalizeText(courseKey);
  return STUDENT_COURSE_SHOWCASE.find((item) => item.key === normalizedKey) || null;
}

function resolveCourseSelectionByName(courseName) {
  const normalizedName = normalizeText(courseName);
  return STUDENT_COURSE_SHOWCASE.find((item) => normalizeText(item.courseName) === normalizedName) || null;
}

async function ensureCourseSalesCatalogData() {
  if (salesCatalogReady) {
    return;
  }

  if (!salesCatalogPromise) {
    salesCatalogPromise = (async () => {
      const [[lockRow]] = await db.query("SELECT GET_LOCK(?, 10) AS locked", [SALES_CATALOG_LOCK_KEY]);
      if (Number(lockRow?.locked || 0) !== 1) {
        throw new Error("Unable to acquire sales catalog sync lock.");
      }

      try {
        const courseIdByName = new Map();

        for (const item of STUDENT_COURSE_SHOWCASE) {
          const [matchedCourses] = await db.query(
            `
              SELECT id
              FROM courses
              WHERE name = ?
              ORDER BY id ASC
            `,
            [item.courseName]
          );

          let courseId = Number(matchedCourses[0]?.id || 0);

          if (!courseId) {
            const [insertResult] = await db.query(
              `
                INSERT INTO courses (name, category, fee, duration_weeks)
                VALUES (?, ?, ?, ?)
              `,
              [item.courseName, item.category || null, item.originalFee, item.durationWeeks || 0]
            );

            courseId = Number(insertResult.insertId || 0);
          } else {
            for (const duplicateCourse of matchedCourses.slice(1)) {
              const duplicateId = Number(duplicateCourse.id || 0);
              if (!duplicateId) {
                continue;
              }

              await db.query(
                `
                  UPDATE classes
                  SET course_id = ?
                  WHERE course_id = ?
                `,
                [courseId, duplicateId]
              );

              await db.query("DELETE FROM courses WHERE id = ?", [duplicateId]);
            }

            await db.query(
              `
                UPDATE courses
                SET category = ?, fee = ?, duration_weeks = ?
                WHERE id = ?
              `,
              [item.category || null, item.originalFee, item.durationWeeks || 0, courseId]
            );
          }

          courseIdByName.set(normalizeText(item.courseName), courseId);
        }

        const [teachers] = await db.query(
          `
            SELECT id, email
            FROM teachers
          `
        );

        const teacherIdByEmail = new Map(
          teachers.map((teacher) => [normalizeText(teacher.email), Number(teacher.id || 0)])
        );

        for (const item of STUDENT_COURSE_SHOWCASE) {
          const classSeed = item.classSeed;
          if (!classSeed) {
            continue;
          }

          const courseId = courseIdByName.get(normalizeText(item.courseName)) || null;
          if (!courseId) {
            continue;
          }

          const teacherId = teacherIdByEmail.get(normalizeText(classSeed.teacherEmail)) || null;
          const [matchedClasses] = await db.query(
            `
              SELECT id
              FROM classes
              WHERE code = ?
              ORDER BY id ASC
            `,
            [classSeed.code]
          );

          const classId = Number(matchedClasses[0]?.id || 0);

          if (!classId) {
            await db.query(
              `
                INSERT INTO classes (code, course_id, teacher_id, room, start_date, end_date, schedule_text)
                VALUES (?, ?, ?, ?, ?, ?, ?)
              `,
              [
                classSeed.code,
                courseId,
                teacherId,
                classSeed.room || null,
                classSeed.startDate || null,
                classSeed.endDate || null,
                classSeed.scheduleText || null,
              ]
            );
          } else {
            await db.query(
              `
                UPDATE classes
                SET course_id = ?, teacher_id = ?, room = ?, start_date = ?, end_date = ?, schedule_text = ?
                WHERE id = ?
              `,
              [
                courseId,
                teacherId,
                classSeed.room || null,
                classSeed.startDate || null,
                classSeed.endDate || null,
                classSeed.scheduleText || null,
                classId,
              ]
            );
          }
        }

        salesCatalogReady = true;
      } finally {
        await db.query("DO RELEASE_LOCK(?)", [SALES_CATALOG_LOCK_KEY]).catch(() => {});
      }
    })().catch((error) => {
      salesCatalogPromise = null;
      throw error;
    });
  }

  await salesCatalogPromise;
}

function resolveCoursePricing({ courseId, courseFee, courseName, courseKey }) {
  const selectedCourse = resolveCourseSelectionByKey(courseKey);
  const matchedCourse = resolveCourseSelectionByName(courseName);
  const course = matchedCourse || selectedCourse || null;
  const originalFee = Number((course && course.originalFee) || courseFee || 0);

  return {
    courseKey: course?.key || "",
    displayTitle: course?.title || String(courseName || "Khóa học"),
    courseId: Number(courseId || 0),
    originalFee,
    discountedFee: calculateDiscountedFee(originalFee),
    discountRate: STUDENT_DISCOUNT_RATE,
  };
}

async function getStudentCourseHubData(baseUrl = "") {
  await ensureCourseSalesCatalogData();

  return {
    cards: STUDENT_COURSE_SHOWCASE.map((item) => ({
      ...item,
      discountedFee: calculateDiscountedFee(item.originalFee),
      registerHref: buildCourseRegisterHref(baseUrl, item.key),
    })),
    comboBanner: {
      title: "Combo Tập Sự + TOEIC A",
      price: "6.000.000đ",
      image: "https://i.pinimg.com/1200x/bb/cd/15/bbcd152f4a290b4987226be9fb770ed0.jpg",
      placeholder: "Ảnh banner combo",
      href: `${baseUrl}/student/schedule`,
      ctaLabel: "Xem lịch khai giảng",
    },
    promoCards: [
      {
        title: "Kiểm tra\ntrình độ đầu vào",
        image: "https://i.pinimg.com/736x/c8/a9/9e/c8a99e21941bcff08b8afada50f26e56.jpg",
        placeholder: "Ảnh kiểm tra đầu vào",
        href: `${baseUrl}/placement-tests`,
        tone: "placement",
      },
      {
        title: "Lịch khai giảng",
        image: "https://i.pinimg.com/1200x/30/3c/95/303c951ff2e035c00c767aaa8d07635d.jpg",
        placeholder: "Ảnh lịch khai giảng",
        href: `${baseUrl}/student/schedule`,
        tone: "schedule",
      },
      {
        title: "Video bài giảng",
        image: "https://i.postimg.cc/YCV0Dd4J/t8.png",
        placeholder: "Ảnh video bài giảng",
        href: `${baseUrl}/student/courses/video-bai-giang`,
        tone: "video",
      },
    ],
  };
}

function getGuestCourseHubData(baseUrl = "") {
  return {
    cards: STUDENT_COURSE_SHOWCASE.map((item) => ({
      ...item,
      discountedFee: calculateDiscountedFee(item.originalFee),
      registerHref: buildGuestCourseAuthHref(baseUrl),
    })),
    comboBanner: {
      title: "Combo Tập Sự + TOEIC A",
      price: "6.000.000đ",
      image: "https://i.pinimg.com/1200x/bb/cd/15/bbcd152f4a290b4987226be9fb770ed0.jpg",
      placeholder: "Ảnh banner combo",
      href: `${baseUrl}/contact`,
      ctaLabel: "Tìm hiểu ngay",
    },
    promoCards: [
      {
        title: "Kiểm tra\ntrình độ đầu vào",
        image: "https://i.pinimg.com/736x/c8/a9/9e/c8a99e21941bcff08b8afada50f26e56.jpg",
        placeholder: "Ảnh kiểm tra đầu vào",
        href: `${baseUrl}/placement-tests`,
        tone: "placement",
      },
      {
        title: "Lịch khai giảng",
        image: "https://i.pinimg.com/1200x/30/3c/95/303c951ff2e035c00c767aaa8d07635d.jpg",
        placeholder: "Ảnh lịch khai giảng",
        href: `${baseUrl}/lich-khai-giang`,
        tone: "schedule",
      },
    ],
  };
}

function getStudentCourseMenu(baseUrl = "") {
  return [
    {
      label: "Tổng hợp khóa học",
      href: `${baseUrl}/student/courses`,
      note: "Xem lộ trình, học phí ưu đãi và nút đăng ký nhanh.",
    },
    ...COURSE_MENU_ITEMS.map((item) => ({
      ...item,
      href: `${baseUrl}${item.href}`,
    })),
    {
      label: "Video bài giảng",
      href: `${baseUrl}/student/courses/video-bai-giang`,
      note: "Thư viện bài giảng đã mở cho tài khoản học viên.",
    },
  ];
}

function buildRegisterCourseOptions(courses = [], selectedCourseKey = "") {
  const normalizedSelectedKey = normalizeText(selectedCourseKey);
  const coursesByName = new Map(
    courses.map((course) => [normalizeText(course.name), course]).filter(([name]) => name)
  );

  const showcaseOptions = STUDENT_COURSE_SHOWCASE.map((item) => {
    const course = coursesByName.get(normalizeText(item.courseName));
    if (!course) {
      return null;
    }

    return {
      ...course,
      optionLabel: item.title,
      courseKey: item.key,
      originalFee: item.originalFee,
      discountedFee: calculateDiscountedFee(item.originalFee),
      isSelectedByKey: item.key === normalizedSelectedKey,
    };
  }).filter(Boolean);

  const showcaseCourseIds = new Set(showcaseOptions.map((item) => Number(item.id || 0)));

  const fallbackOptions = courses
    .filter((course) => !showcaseCourseIds.has(Number(course.id || 0)))
    .map((course) => {
      const pricing = resolveCoursePricing({
        courseId: course.id,
        courseFee: course.fee,
        courseName: course.name,
        courseKey: "",
      });

      return {
        ...course,
        optionLabel: pricing.displayTitle,
        courseKey: pricing.courseKey,
        originalFee: pricing.originalFee,
        discountedFee: pricing.discountedFee,
        isSelectedByKey: pricing.courseKey === normalizedSelectedKey,
      };
    });

  return [...showcaseOptions, ...fallbackOptions];
}

module.exports = {
  STUDENT_DISCOUNT_RATE,
  calculateDiscountedFee,
  formatCurrency,
  resolveCourseSelectionByKey,
  resolveCoursePricing,
  ensureCourseSalesCatalogData,
  getGuestCourseHubData,
  getStudentCourseHubData,
  getStudentCourseMenu,
  buildRegisterCourseOptions,
};
