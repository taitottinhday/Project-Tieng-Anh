const express = require("express");
const renderWithLayout = require("../utils/renderHelper");
const { getFullTestCards } = require("../data/fullTestRegistry");
const { aboutMenu, getAboutSection } = require("../data/aboutSections");
const publicPracticeController = require("../controllers/publicPracticeController");
const { getPublishedResourceEntries } = require("../services/adminContentService");

const router = express.Router();

router.get("/ve-chung-toi", (req, res) => {
  renderWithLayout(res, "about", {
    title: "Ve chung toi",
  });
});

router.get("/ve-chung-toi/:sectionSlug", (req, res, next) => {
  const aboutSection = getAboutSection(req.params.sectionSlug);

  if (!aboutSection) {
    return next();
  }

  return renderWithLayout(res, "about-section", {
    title: aboutSection.title,
    aboutMenu,
    aboutSection,
  });
});

router.get("/lich-khai-giang", (req, res) => {
  const scheduleGroups = [
    {
      campus: "Co so Ho Tung Mau",
      address: "So 17, ngo 20 Ho Tung Mau, Cau Giay, Ha Noi",
      classes: [
        { code: "TA-HTM-01", course: "Lop Tap su TOEIC", time: "19:00 - 20:30", days: "Thu 2 - Thu 4 - Thu 6", opening: "05/04/2026" },
        { code: "TA-HTM-02", course: "TOEIC A", time: "18:30 - 20:00", days: "Thu 3 - Thu 5 - Thu 7", opening: "08/04/2026" },
        { code: "TA-HTM-03", course: "TOEIC B", time: "20:00 - 21:30", days: "Thu 2 - Thu 4 - Thu 6", opening: "12/04/2026" },
        { code: "TA-HTM-04", course: "TOEIC Roadmap 550+", time: "18:15 - 19:45", days: "Thu 2 - Thu 4 - Thu 6", opening: "15/04/2026" },
        { code: "TA-HTM-05", course: "IELTS Foundation 5.5", time: "19:15 - 21:15", days: "Thu 3 - Thu 5", opening: "18/04/2026" },
      ],
    },
    {
      campus: "Co so Le Duc Tho",
      address: "So 9 ngach 59 ngo 21 Le Duc Tho, Nam Tu Liem, Ha Noi",
      classes: [
        { code: "TA-LDT-01", course: "Lop Tap su TOEIC", time: "17:45 - 19:15", days: "Thu 3 - Thu 5", opening: "06/04/2026" },
        { code: "TA-LDT-02", course: "TOEIC A", time: "19:15 - 20:45", days: "Thu 3 - Thu 5 - Chu nhat", opening: "10/04/2026" },
        { code: "TA-LDT-03", course: "Speaking & Writing", time: "09:00 - 11:00", days: "Thu 7 - Chu nhat", opening: "17/04/2026" },
        { code: "TA-LDT-04", course: "Business English", time: "18:45 - 20:45", days: "Thu 2 - Thu 4", opening: "20/04/2026" },
        { code: "TA-LDT-05", course: "TOEIC Elite 850+", time: "20:00 - 21:30", days: "Thu 3 - Thu 5 - Thu 7", opening: "24/04/2026" },
      ],
    },
  ];

  renderWithLayout(res, "schedule", {
    title: "Lich khai giang",
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

router.get("/goc-hoc-tap/part-7", publicPracticeController.listPart7GuidePractice);
router.get("/goc-hoc-tap/part-7/result/latest", publicPracticeController.showLatestPart7GuideResult);
router.get("/goc-hoc-tap/part-7/:practiceId", publicPracticeController.showPart7GuidePractice);
router.get("/goc-hoc-tap/part-7/:practiceId/take", publicPracticeController.takePart7GuidePractice);
router.post("/goc-hoc-tap/part-7/:practiceId/submit", publicPracticeController.submitPart7GuidePractice);

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
      label: `De ${String(index + 1).padStart(3, "0")}`,
      href: item.href,
      note: item.title,
    }));

  const publicResources = getPublishedResourceEntries()
    .filter((item) => String(item.audience || "public") === "public")
    .slice(0, 6)
    .map((item, index) => ({
      label: item.title || `Tai lieu ${String(index + 1).padStart(2, "0")}`,
      href: item.publicPath,
      note: item.description || item.originalName || item.title,
    }));

  const studyHub = {
    heroTitle: "Luyen tap TOEIC online cung Lop TOEIC thay Tai",
    heroSummary: "Cung luyen tap nhung bai test TOEIC duoc cac thay co tong hop, kem dap an chi tiet va lo trinh on ro rang.",
    helperText: isStudent
      ? "Ban co the mo truc tiep thu vien luyen theo part va reading ngay tu cac nut ben duoi."
      : "Mot so thu vien luyen sau se mo tot nhat sau khi dang nhap tai khoan hoc vien.",
    groups: [
      {
        heading: "Luyen de TOEIC",
        layout: "two-column",
        cards: [
          {
            tone: "lavender",
            kind: "list",
            title: "De thi Full TOEIC TEST",
            actions: fullTestButtons,
          },
          {
            tone: "mint",
            kind: "cta",
            title: "Luyen tap TOEIC Part 5-6",
            href: `${safeBaseUrl}/goc-hoc-tap/part-5-6`,
            action: "Xem de ngay!",
          },
        ],
      },
      {
        heading: "Luyen tap tu vung",
        layout: "single",
        cards: [
          {
            tone: "sky",
            kind: "cta",
            title: "Wordform Test",
            href: `${safeBaseUrl}/goc-hoc-tap/wordform`,
            action: "Lam thu ngay!",
          },
        ],
      },
      {
        heading: "Luyen tap Part 7 + Chua de chi tiet",
        layout: "single",
        cards: [
          {
            tone: "powder",
            kind: "cta",
            title: "Mini test 1",
            href: `${safeBaseUrl}/goc-hoc-tap/part-7`,
            action: "Lam thu ngay!",
          },
        ],
      },
      ...(publicResources.length
        ? [
            {
              heading: "Tai lieu moi tu trung tam",
              layout: "single",
              cards: [
                {
                  tone: "lavender",
                  kind: "list",
                  title: "Thu vien tai lieu",
                  actions: publicResources,
                },
              ],
            },
          ]
        : []),
    ],
  };

  renderWithLayout(res, "study-hub", {
    title: "Goc hoc tap",
    studyHub,
  });
});

module.exports = router;
