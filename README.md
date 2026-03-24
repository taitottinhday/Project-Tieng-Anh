# Student Platform NodeJs

Nền tảng quản lý trung tâm tiếng Anh xây bằng Node.js, Express, EJS và MySQL. Repo này đã được dọn để:

- chạy local với MySQL
- đưa code lên GitHub an toàn hơn
- deploy public để gửi link cho người khác dùng thử

## Tính năng chính

- Đăng ký, đăng nhập, phân quyền `user` / `teacher` / `admin`
- Teacher workspace, classroom posts, materials, submissions
- Trang khóa học, lịch học, giới thiệu, liên hệ
- Dashboard quản trị và dữ liệu demo cho trung tâm tiếng Anh
- Bootstrap schema tự động khi app khởi động

## Yêu cầu

- Node.js 18+
- MySQL 8+ hoặc MariaDB tương thích

## Chạy local

1. Cài package:
   ```bash
   npm install
   ```

2. Tạo file `.env` từ `.env.example`

3. Điền các biến cơ bản:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=
   DB_NAME=student_platform
   DB_PORT=3306
   SESSION_SECRET=your-long-random-secret
   PORT=4207
   ```

   Nếu muốn dùng sẵn tài khoản quản trị và giáo viên mặc định trên mọi môi trường, có thể giữ hoặc đổi thêm:
   ```env
   DEFAULT_ADMIN_EMAIL=admin@gmail.com
   DEFAULT_ADMIN_PASSWORD=admin123
   DEFAULT_TEACHER_EMAIL=hoanganh.teacher@thaytaiedu.vn
   DEFAULT_TEACHER_PASSWORD=Teacher@123
   ```

4. Chạy app:
   ```bash
   npm start
   ```

5. Mở trình duyệt:
   ```text
   http://localhost:4207
   ```

Khi app khởi động, hệ thống sẽ tự tạo schema cơ bản, đồng bộ sẵn tài khoản `admin` / `teacher` mặc định trong MySQL, và tự seed dữ liệu demo nếu bảng `courses` còn trống.

## Đưa lên GitHub

1. Tạo repository rỗng trên GitHub
2. Khởi tạo git local:
   ```bash
   git init
   git add .
   git commit -m "Initial project publish"
   ```
3. Gắn remote và push:
   ```bash
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git branch -M main
   git push -u origin main
   ```

`.env`, `node_modules`, `tmp`, `public/uploads` đã được đưa vào `.gitignore`, nên sẽ không bị đẩy lên repo.

## Deploy public để gửi link cho người khác

Khuyến nghị dùng Railway vì app này cần cả Node service và MySQL. Theo tài liệu Railway, service có thể nối trực tiếp với GitHub repo để tự deploy khi bạn push code:

- Railway GitHub autodeploy docs: https://docs.railway.com/guides/github-autodeploys

Luồng triển khai phù hợp:

1. Push code lên GitHub
2. Tạo project Railway từ GitHub repo
3. Add MySQL service trong cùng project
4. Điền biến môi trường:
   - `SESSION_SECRET`
   - `PORT` nếu host yêu cầu
   - OAuth / SMTP nếu muốn bật social login hoặc email thật
5. Deploy
6. Lấy domain Railway và gửi link đó cho bạn bè

App hiện đã hỗ trợ đọc cả bộ biến `DB_*` lẫn `MYSQLHOST`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE`, `MYSQLPORT`, nên dễ nối với MySQL trên host hơn.

## Ghi chú

- Social login chỉ hoạt động khi điền `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `FACEBOOK_CLIENT_ID`, `FACEBOOK_CLIENT_SECRET`
- SMTP không còn bắt buộc cho đăng ký vì OTP đã được bỏ
- Production nên đặt `SESSION_SECRET` mạnh và không dùng secret mặc định
