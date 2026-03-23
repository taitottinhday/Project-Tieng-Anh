const express = require("express");
const renderWithLayout = require("../utils/renderHelper");

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

router.get("/goc-hoc-tap", (req, res) => {
  const studySections = [
    {
      title: "Luyện đề online",
      desc: "Làm full test và placement test để kiểm tra trình độ hiện tại.",
      href: "/placement-tests",
      action: "Mở đề thi",
    },
    {
      title: "Lộ trình ôn theo từng giai đoạn",
      desc: "Từ mất gốc đến các mốc 450+, 650+, 850+ với cách chia mục tiêu dễ theo sát hơn.",
      href: "/courses-blog",
      action: "Xem khóa học",
    },
    {
      title: "Nhận tư vấn lộ trình",
      desc: "Gửi thông tin để nhận gợi ý khóa học và khung giờ phù hợp.",
      href: "/contact",
      action: "Gửi yêu cầu",
    },
  ];

  renderWithLayout(res, "study-hub", {
    title: "Góc học tập",
    studySections,
  });
});

module.exports = router;
