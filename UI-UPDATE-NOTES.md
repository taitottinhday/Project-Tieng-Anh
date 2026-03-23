# Ghi Chú Cập Nhật Giao Diện

## Phạm vi cập nhật

### 1. Luồng giáo viên
- Thiết kế lại dashboard giáo viên theo hướng hiện đại, chuyên nghiệp và dễ theo dõi.
- Bổ sung các khu vực quan trọng như lớp phụ trách, lịch dạy, điểm danh, nhận xét và hồ sơ giáo viên.
- Đồng bộ phong cách màu sắc và cải thiện khả năng đọc nội dung.

### 2. Trang chủ và khung guest
- Làm lại trang chủ theo phong cách hiện đại hơn.
- Tăng tỉ lệ sử dụng màu xanh lam và hồng.
- Giảm mạnh cảm giác nền trắng để tổng thể có chiều sâu hơn.
- Đồng bộ `home.ejs` và `guest-layout.ejs` để phần public thống nhất hơn.

### 3. Trang lịch khai giảng
- Sửa lỗi EJS compile ở `src/views/schedule.ejs`.
- Nguyên nhân là một số chuỗi JavaScript trong khối EJS đầu file bị xuống dòng sai vị trí.
- Đã gộp lại các chuỗi để trang render ổn định trở lại.

## Các file đáng chú ý
- `src/views/home.ejs`
- `src/views/guest-layout.ejs`
- `src/views/schedule.ejs`
- `src/views/teacher-dashboard.ejs`
- `src/views/teacher-classes.ejs`
- `src/views/teacher-class-detail.ejs`
- `src/views/teacher-schedule.ejs`
- `src/views/teacher-attendance.ejs`
- `src/views/teacher-comments.ejs`
- `src/views/teacher-profile.ejs`
- `src/views/partials/teacher-workspace-style.ejs`

## Kiểm tra nhanh
- Render `schedule.ejs`: OK
- Render `home.ejs` trong `guest-layout.ejs`: OK
- Render teacher views với dữ liệu mẫu: OK

## Ghi chú thêm
- Nếu server chưa tự reload sau khi sửa giao diện, hãy khởi động lại app để thấy thay đổi mới nhất.
