const express = require("express");
const router = express.Router();
const renderWithLayout = require("../utils/renderHelper");

router.get("/", (req, res) => {
    const courses = [
        {
            id: 1,
            title: "Lớp Tập sự TOEIC",
            level: "Mất gốc - xây nền tảng",
            duration: "8 tuần",
            fee: "Liên hệ tư vấn",
            desc: "Phù hợp cho người cần làm lại nền tảng từ vựng, ngữ pháp, nghe và đọc trước khi vào lộ trình TOEIC chính.",
            target: "Ôn lại nền tảng TOEIC",
            highlight: "Ngữ pháp, từ vựng, kỹ năng học cơ bản"
        },
        {
            id: 2,
            title: "TOEIC A",
            level: "Đầu vào cơ bản",
            duration: "10 tuần",
            fee: "Theo lớp đang mở",
            desc: "Lộ trình để học viên đạt các mốc điểm đầu ra cơ bản, tập trung kỹ năng nghe đọc, chiến lược part và tốc độ làm bài.",
            target: "Mục tiêu 450 - 650 TOEIC",
            highlight: "Ôn từng part, chữa lỗi hệ thống, luyện đề có hướng dẫn"
        },
        {
            id: 3,
            title: "TOEIC B",
            level: "Trung cấp - cần bứt điểm",
            duration: "10 tuần",
            fee: "Theo lịch khai giảng",
            desc: "Đưa học viên lên các mốc điểm cao hơn bằng cách tối ưu tốc độ, xử lý reading khó và luyện nghe chi tiết theo bộ đề.",
            target: "Mục tiêu 650 - 850 TOEIC",
            highlight: "Tăng tốc reading, chiến lược suy luận, full test định kỳ"
        },
        {
            id: 4,
            title: "TOEIC Speaking & Writing",
            level: "Mở rộng 4 kỹ năng",
            duration: "6 tuần",
            fee: "Theo tư vấn đầu vào",
            desc: "Dành cho học viên muốn bổ sung 2 kỹ năng nói và viết để phục vụ học tập, công việc và đầu ra doanh nghiệp.",
            target: "Nói - viết ứng dụng",
            highlight: "Phản xạ nói, task viết, feedback sửa bài chi tiết"
        }
    ];

    renderWithLayout(res, "courses-blog", {
        title: "Khóa học TOEIC",
        username: req.session?.user?.username,
        courses
    });
});

module.exports = router;
