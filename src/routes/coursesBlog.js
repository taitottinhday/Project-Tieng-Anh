const express = require("express");
const router = express.Router();
const renderWithLayout = require("../utils/renderHelper");
const { courseMenu, getCoursePage } = require("../data/courseLandingPages");

const overviewCourses = [
  {
    id: 1,
    title: "L\u1edbp T\u1eadp s\u1ef1 TOEIC",
    level: "M\u1ea5t g\u1ed1c - x\u00e2y n\u1ec1n t\u1ea3ng",
    duration: "8 tu\u1ea7n",
    fee: "Li\u00ean h\u1ec7 t\u01b0 v\u1ea5n",
    desc: "Ph\u00f9 h\u1ee3p cho ng\u01b0\u1eddi c\u1ea7n l\u00e0m l\u1ea1i n\u1ec1n t\u1ea3ng t\u1eeb v\u1ef1ng, ng\u1eef ph\u00e1p, nghe v\u00e0 \u0111\u1ecdc tr\u01b0\u1edbc khi v\u00e0o l\u1ed9 tr\u00ecnh TOEIC ch\u00ednh.",
    target: "\u00d4n l\u1ea1i n\u1ec1n t\u1ea3ng TOEIC",
    highlight: "Ng\u1eef ph\u00e1p, t\u1eeb v\u1ef1ng, k\u1ef9 n\u0103ng h\u1ecdc c\u01a1 b\u1ea3n",
  },
  {
    id: 2,
    title: "TOEIC A",
    level: "\u0110\u1ea7u v\u00e0o c\u01a1 b\u1ea3n",
    duration: "10 tu\u1ea7n",
    fee: "Theo l\u1edbp \u0111ang m\u1edf",
    desc: "L\u1ed9 tr\u00ecnh \u0111\u1ec3 h\u1ecdc vi\u00ean \u0111\u1ea1t c\u00e1c m\u1ed1c \u0111i\u1ec3m \u0111\u1ea7u ra c\u01a1 b\u1ea3n, t\u1eadp trung k\u1ef9 n\u0103ng nghe \u0111\u1ecdc, chi\u1ebfn l\u01b0\u1ee3c part v\u00e0 t\u1ed1c \u0111\u1ed9 l\u00e0m b\u00e0i.",
    target: "M\u1ee5c ti\u00eau 450 - 650 TOEIC",
    highlight: "\u00d4n t\u1eebng part, ch\u1eefa l\u1ed7i h\u1ec7 th\u1ed1ng, luy\u1ec7n \u0111\u1ec1 c\u00f3 h\u01b0\u1edbng d\u1eabn",
  },
  {
    id: 3,
    title: "TOEIC B",
    level: "Trung c\u1ea5p - c\u1ea7n b\u1ee9t \u0111i\u1ec3m",
    duration: "10 tu\u1ea7n",
    fee: "Theo l\u1ecbch khai gi\u1ea3ng",
    desc: "\u0110\u01b0a h\u1ecdc vi\u00ean l\u00ean c\u00e1c m\u1ed1c \u0111i\u1ec3m cao h\u01a1n b\u1eb1ng c\u00e1ch t\u1ed1i \u01b0u t\u1ed1c \u0111\u1ed9, x\u1eed l\u00fd reading kh\u00f3 v\u00e0 luy\u1ec7n nghe chi ti\u1ebft theo b\u1ed9 \u0111\u1ec1.",
    target: "M\u1ee5c ti\u00eau 650 - 850 TOEIC",
    highlight: "T\u0103ng t\u1ed1c reading, chi\u1ebfn l\u01b0\u1ee3c suy lu\u1eadn, full test \u0111\u1ecbnh k\u1ef3",
  },
  {
    id: 4,
    title: "TOEIC Speaking & Writing",
    level: "M\u1edf r\u1ed9ng 4 k\u1ef9 n\u0103ng",
    duration: "6 tu\u1ea7n",
    fee: "Theo t\u01b0 v\u1ea5n \u0111\u1ea7u v\u00e0o",
    desc: "D\u00e0nh cho h\u1ecdc vi\u00ean mu\u1ed1n b\u1ed5 sung 2 k\u1ef9 n\u0103ng n\u00f3i v\u00e0 vi\u1ebft \u0111\u1ec3 ph\u1ee5c v\u1ee5 h\u1ecdc t\u1eadp, c\u00f4ng vi\u1ec7c v\u00e0 \u0111\u1ea7u ra doanh nghi\u1ec7p.",
    target: "N\u00f3i - vi\u1ebft \u1ee9ng d\u1ee5ng",
    highlight: "Ph\u1ea3n x\u1ea1 n\u00f3i, task vi\u1ebft, feedback s\u1eeda b\u00e0i chi ti\u1ebft",
  },
];

router.get("/", (req, res) => {
  renderWithLayout(res, "courses-blog", {
    title: "Kh\u00f3a h\u1ecdc TOEIC",
    username: req.session?.user?.username,
    courses: overviewCourses,
    courseMenu,
  });
});

router.get("/:slug", (req, res, next) => {
  const coursePage = getCoursePage(req.params.slug);

  if (!coursePage) {
    return next();
  }

  return renderWithLayout(res, "course-program-page", {
    title: coursePage.title,
    username: req.session?.user?.username,
    coursePage,
    courseMenu,
  });
});

module.exports = router;
