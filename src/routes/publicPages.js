const express = require("express");
const renderWithLayout = require("../utils/renderHelper");
const { getFullTestCards } = require("../data/fullTestRegistry");
const publicPracticeController = require("../controllers/publicPracticeController");

const router = express.Router();

router.get("/ve-chung-toi", (req, res) => {
  renderWithLayout(res, "about", {
    title: "Về chúng tôi",
  });
});

router.get("/lich-khai-giang", (req, res) => {
  const scheduleGroups = [
    {
      campus: "Cơ sở Hồ Tùng Mậu",
      address: "Số 17, ngõ 20 Hồ Tùng Mậu, Cầu Giấy, Hà Nội",
      classes: [
        { code: "TA-HTM-01", course: "Lớp Tập sự TOEIC", time: "19:00 - 20:30", days: "Thứ 2 - Thứ 4 - Thứ 6", opening: "05/04/2026" },
        { code: "TA-HTM-02", course: "TOEIC A", time: "18:30 - 20:00", days: "Thứ 3 - Thứ 5 - Thứ 7", opening: "08/04/2026" },
        { code: "TA-HTM-03", course: "TOEIC B", time: "20:00 - 21:30", days: "Thứ 2 - Thứ 4 - Thứ 6", opening: "12/04/2026" },
        { code: "TA-HTM-04", course: "TOEIC Roadmap 550+", time: "18:15 - 19:45", days: "Thứ 2 - Thứ 4 - Thứ 6", opening: "15/04/2026" },
        { code: "TA-HTM-05", course: "IELTS Foundation 5.5", time: "19:15 - 21:15", days: "Thứ 3 - Thứ 5", opening: "18/04/2026" },
      ],
    },
    {
      campus: "Cơ sở Lê Đức Thọ",
      address: "Số 9 ngách 59 ngõ 21 Lê Đức Thọ, Nam Từ Liêm, Hà Nội",
      classes: [
        { code: "TA-LDT-01", course: "Lớp Tập sự TOEIC", time: "17:45 - 19:15", days: "Thứ 3 - Thứ 5", opening: "06/04/2026" },
        { code: "TA-LDT-02", course: "TOEIC A", time: "19:15 - 20:45", days: "Thứ 3 - Thứ 5 - Chủ nhật", opening: "10/04/2026" },
        { code: "TA-LDT-03", course: "Speaking & Writing", time: "09:00 - 11:00", days: "Thứ 7 - Chủ nhật", opening: "17/04/2026" },
        { code: "TA-LDT-04", course: "Business English", time: "18:45 - 20:45", days: "Thứ 2 - Thứ 4", opening: "20/04/2026" },
        { code: "TA-LDT-05", course: "TOEIC Elite 850+", time: "20:00 - 21:30", days: "Thứ 3 - Thứ 5 - Thứ 7", opening: "24/04/2026" },
      ],
    },
  ];

  renderWithLayout(res, "schedule", {
    title: "Lịch khai giảng",
    scheduleGroups,
  });
});

router.get("/goc-hoc-tap/part-5-6", publicPracticeController.listPart56Practice);
router.get("/goc-hoc-tap/part-5-6/result/latest", publicPracticeController.showLatestPart56Result);
router.get("/goc-hoc-tap/part-5-6/:practiceId", publicPracticeController.showPart56Practice);
router.get("/goc-hoc-tap/part-5-6/:practiceId/take", publicPracticeController.takePart56Practice);
router.post("/goc-hoc-tap/part-5-6/:practiceId/submit", publicPracticeController.submitPart56Practice);

router.get("/goc-hoc-tap/wordform", publicPracticeController.listWordformPractice);
router.get("/goc-hoc-tap/wordform/result/latest", publicPracticeController.showLatestWordformResult);
router.get("/goc-hoc-tap/wordform/:practiceId", publicPracticeController.showWordformPractice);
router.get("/goc-hoc-tap/wordform/:practiceId/take", publicPracticeController.takeWordformPractice);
router.post("/goc-hoc-tap/wordform/:practiceId/submit", publicPracticeController.submitWordformPractice);

router.get("/goc-hoc-tap", (req, res) => {
  const safeBaseUrl = res.locals.baseUrl || "";
  const isStudent = Boolean(
    req.session?.user?.role &&
    req.session.user.role !== "admin" &&
    req.session.user.role !== "teacher"
  );

  const fullTestButtons = getFullTestCards(safeBaseUrl)
    .filter((item) => item.isAvailable && item.href)
    .slice(0, 5)
    .map((item, index) => ({
      label: `Đề ${String(index + 1).padStart(3, "0")}`,
      href: item.href,
      note: item.title,
    }));

  const studyHub = {
    heroTitle: "Luyện tập TOEIC online cùng Lớp TOEIC thầy Tài",
    heroSummary: "Cùng luyện tập những bài test TOEIC được các thầy cô tổng hợp, kèm đáp án chi tiết và lộ trình ôn rõ ràng.",
    helperText: isStudent
      ? "Bạn có thể mở trực tiếp thư viện luyện theo part và reading ngay từ các nút bên dưới."
      : "Một số thư viện luyện sâu sẽ mở tốt nhất sau khi đăng nhập tài khoản học viên.",
    groups: [
      {
        heading: "Luyện đề TOEIC",
        layout: "two-column",
        cards: [
          {
            tone: "lavender",
            kind: "list",
            title: "Đề thi Full TOEIC TEST",
            actions: fullTestButtons,
          },
          {
            tone: "mint",
            kind: "cta",
            title: "Luyện tập TOEIC Part 5-6",
            href: `${safeBaseUrl}/goc-hoc-tap/part-5-6`,
            action: "Xem đề ngay!",
          },
        ],
      },
      {
        heading: "Luyện tập từ vựng",
        layout: "single",
        cards: [
          {
            tone: "sky",
            kind: "cta",
            title: "Wordform Test",
            href: `${safeBaseUrl}/goc-hoc-tap/wordform`,
            action: "Làm thử ngay!",
          },
        ],
      },
      {
        heading: "Luyện tập Part 7 + Chữa đề chi tiết",
        layout: "single",
        cards: [
          {
            tone: "powder",
            kind: "cta",
            title: "Mini test 1",
            href: isStudent ? `${safeBaseUrl}/student/practice/reading` : `${safeBaseUrl}/placement-tests`,
            action: "Làm thử ngay!",
          },
        ],
      },
    ],
  };

  renderWithLayout(res, "study-hub", {
    title: "Góc học tập",
    studyHub,
  });
});

module.exports = router;
