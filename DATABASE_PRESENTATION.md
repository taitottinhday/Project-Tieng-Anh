# Trình Bày Cơ Sở Dữ Liệu Student Platform

## 1. Tổng quan hệ quản trị cơ sở dữ liệu

- Hệ thống của em sử dụng **MySQL** làm cơ sở dữ liệu chính.
- Ứng dụng Node.js kết nối MySQL qua `mysql2/promise` và dùng **connection pool** để tái sử dụng kết nối.
- Schema được **khởi tạo tự động khi ứng dụng chạy** thông qua `ensureApplicationSchema()`.
- Dữ liệu demo cũng có thể được seed tự động nếu các bảng lõi còn trống.

Nói ngắn gọn khi thuyết trình:

> Cơ sở dữ liệu của em được thiết kế cho một nền tảng quản lý trung tâm tiếng Anh. Hệ thống không chỉ quản lý tài khoản người dùng mà còn quản lý khóa học, lớp học, ghi danh, thanh toán, điểm danh, nhận xét giáo viên, bài đăng lớp học, nộp bài và cả lịch sử hoạt động học tập của học viên.

---

## 2. Ý tưởng thiết kế tổng thể

Em chia cơ sở dữ liệu thành 6 phân hệ:

1. **Phân hệ tài khoản và xác thực**
2. **Phân hệ học viên, giáo viên, khóa học, lớp học**
3. **Phân hệ vận hành lớp học**
4. **Phân hệ tư vấn, phản hồi và thông báo**
5. **Phân hệ classroom online**
6. **Phân hệ theo dõi hoạt động học tập**

Điểm mạnh của thiết kế này là:

- Mỗi nhóm dữ liệu được tách thành bảng riêng để dễ quản lý.
- Các bảng liên kết với nhau bằng **khóa ngoại**.
- Có thêm **index** và **unique key** để tăng tốc truy vấn và tránh trùng dữ liệu.
- Có hỗ trợ mở rộng cho đăng nhập mạng xã hội, quên mật khẩu, nộp bài online và lưu lịch sử học tập.

---

## 3. Các bảng lõi của hệ thống

## 3.1. Bảng `users`

Đây là bảng trung tâm cho phần đăng nhập và phân quyền.

### Chức năng

- Lưu tài khoản đăng nhập của người dùng
- Phân quyền theo vai trò
- Là bảng gốc để liên kết sang nhiều chức năng khác

### Các cột chính

- `id`: khóa chính
- `username`: tên hiển thị hoặc tên đăng nhập
- `email`: email duy nhất
- `password`: mật khẩu đã mã hóa
- `role`: quyền của tài khoản, gồm `user`, `teacher`, `admin`
- `created_at`: thời điểm tạo tài khoản

### Ý nghĩa

- Nếu người dùng chỉ là học viên bình thường thì `role = user`
- Nếu là giáo viên thì `role = teacher`
- Nếu là quản trị viên thì `role = admin`

### Vai trò trong hệ thống

- Bảng này quản lý **danh tính đăng nhập**
- Còn thông tin nghiệp vụ của học viên hoặc giáo viên sẽ tách sang bảng `students` và `teachers`

---

## 3.2. Bảng `students`

Đây là bảng lưu hồ sơ học viên.

### Các cột chính

- `id`: khóa chính
- `user_id`: liên kết mềm đến `users.id`
- `full_name`: họ tên học viên
- `phone`: số điện thoại
- `email`: email học viên
- `dob`: ngày sinh
- `created_at`: ngày tạo hồ sơ

### Ý nghĩa thiết kế

- Hệ thống tách bảng `students` khỏi `users` để phân biệt:
  - **thông tin đăng nhập**
  - **thông tin nghiệp vụ học viên**

- Một học viên có thể được đồng bộ từ tài khoản đăng nhập sang hồ sơ học viên.

---

## 3.3. Bảng `teachers`

Đây là bảng lưu hồ sơ giáo viên.

### Các cột chính

- `id`: khóa chính
- `user_id`: liên kết đến tài khoản trong `users`
- `full_name`: họ tên giáo viên
- `phone`: số điện thoại
- `email`: email giáo viên
- `created_at`: thời gian tạo

### Ý nghĩa

- Bảng này giúp tách phần **vai trò đăng nhập** với phần **hồ sơ chuyên môn**
- Giáo viên có thể được gán vào lớp, điểm danh, viết nhận xét, tạo bài đăng lớp học

---

## 3.4. Bảng `courses`

Đây là bảng quản lý khóa học.

### Các cột chính

- `id`: khóa chính
- `name`: tên khóa học
- `category`: nhóm khóa học, ví dụ TOEIC, IELTS, Business English
- `fee`: học phí
- `duration_weeks`: thời lượng theo tuần

### Ý nghĩa

- Một khóa học là đơn vị học thuật tổng quát
- Từ một khóa học có thể mở ra nhiều lớp khác nhau

Ví dụ:

- TOEIC Starter 350+
- TOEIC Roadmap 550+
- IELTS Foundation 5.5

---

## 3.5. Bảng `classes`

Đây là bảng quản lý lớp học cụ thể.

### Các cột chính

- `id`: khóa chính
- `code`: mã lớp, duy nhất
- `course_id`: khóa ngoại sang `courses`
- `teacher_id`: khóa ngoại sang `teachers`
- `room`: phòng học
- `start_date`: ngày bắt đầu
- `end_date`: ngày kết thúc
- `schedule_text`: lịch học dạng văn bản
- `created_at`: ngày tạo lớp

### Ý nghĩa

- `courses` là cấp độ khóa học
- `classes` là cấp độ triển khai thực tế

Ví dụ:

- Khóa học: TOEIC Roadmap 550+
- Lớp học cụ thể: `TR550-CG-0426`

### Quan hệ

- Một `course` có thể có nhiều `class`
- Một `teacher` có thể dạy nhiều `class`
- Một `class` chỉ thuộc về một `course`

---

## 3.6. Bảng `enrollments`

Đây là bảng ghi danh học viên vào lớp học.

### Các cột chính

- `id`: khóa chính
- `student_id`: khóa ngoại sang `students`
- `class_id`: khóa ngoại sang `classes`
- `status`: trạng thái ghi danh, gồm `pending`, `active`, `completed`, `canceled`
- `enrolled_at`: thời điểm ghi danh

### Ý nghĩa thiết kế

- Đây là bảng trung gian giải quyết quan hệ **nhiều - nhiều** giữa `students` và `classes`
- Một học viên có thể học nhiều lớp
- Một lớp có thể có nhiều học viên

### Ràng buộc quan trọng

- Có `UNIQUE KEY (student_id, class_id)` để ngăn một học viên ghi danh trùng vào cùng một lớp

---

## 3.7. Bảng `payments`

Đây là bảng quản lý thanh toán học phí.

### Các cột chính

- `id`: khóa chính
- `enrollment_id`: khóa ngoại sang `enrollments`
- `amount`: số tiền thanh toán
- `method`: phương thức thanh toán: `cash`, `bank`, `momo`, `other`
- `note`: ghi chú
- `status`: `pending`, `confirmed`, `rejected`
- `txn_ref`: mã giao dịch nếu có
- `paid_at`: thời điểm thanh toán

### Ý nghĩa thiết kế

- Hệ thống không nối thanh toán trực tiếp với học viên, mà nối qua `enrollment`
- Cách này giúp biết rõ:
  - học viên nào
  - thanh toán cho lớp nào
  - trong trạng thái ghi danh nào

Đây là thiết kế hợp lý vì thanh toán gắn với **một lần đăng ký học cụ thể**, không chỉ gắn với người học.

---

## 4. Các bảng phục vụ vận hành lớp học

## 4.1. Bảng `attendance`

Đây là bảng điểm danh học viên.

### Các cột chính

- `id`
- `class_id`
- `student_id`
- `lesson_date`
- `status`: `present`, `absent`, `late`, `excused`
- `note`
- `created_at`
- `updated_at`

### Ý nghĩa

- Lưu trạng thái đi học của từng học viên theo từng buổi học

### Ràng buộc quan trọng

- `UNIQUE KEY (class_id, student_id, lesson_date)`

Nghĩa là:

- Mỗi học viên trong một lớp, tại một ngày học, chỉ có đúng một bản ghi điểm danh

---

## 4.2. Bảng `teacher_attendance`

Đây là bảng điểm danh giáo viên.

### Các cột chính

- `id`
- `teacher_id`
- `class_id`
- `lesson_date`
- `status`
- `note`
- `checked_in_at`
- `created_at`
- `updated_at`

### Ý nghĩa

- Theo dõi việc lên lớp của giáo viên
- Hữu ích cho quản lý vận hành trung tâm

### Ràng buộc

- `UNIQUE KEY (teacher_id, class_id, lesson_date)`

---

## 4.3. Bảng `student_comments`

Đây là bảng nhận xét học viên do giáo viên tạo.

### Các cột chính

- `id`
- `class_id`
- `student_id`
- `teacher_id`
- `lesson_date`
- `skill_focus`
- `comment`
- `created_at`
- `updated_at`

### Ý nghĩa

- Giáo viên có thể nhận xét năng lực của học viên theo từng buổi hoặc từng kỹ năng
- Ví dụ nhận xét về listening, reading, speaking hoặc thái độ học tập

### Giá trị nghiệp vụ

- Giúp phụ huynh, học viên hoặc admin theo dõi tiến bộ
- Tạo lịch sử đánh giá theo thời gian

---

## 5. Các bảng tư vấn, phản hồi và thông báo

## 5.1. Bảng `messages`

Đây là bảng rất quan trọng cho phần liên hệ và tư vấn.

### Các cột chính

- `id`
- `user_id`
- `name`
- `email`
- `phone`
- `goal`
- `course_interest`
- `schedule_preference`
- `preferred_contact_method`
- `message_channel`
- `target_teacher_id`
- `target_class_id`
- `teacher_feedback_rating`
- `message`
- `status`: `new`, `viewed`, `contacted`
- `admin_note`
- `viewed_at`
- `contacted_at`
- `created_at`
- `updated_at`

### Ý nghĩa

Ban đầu bảng này có thể dùng cho form liên hệ đơn giản, nhưng hiện tại đã được mở rộng để phục vụ:

- tư vấn khóa học
- tiếp nhận nhu cầu học viên
- tiếp nhận phản hồi cho giáo viên
- quản lý quá trình chăm sóc khách hàng

### Điểm hay trong thiết kế

- Không chỉ lưu nội dung tin nhắn
- Mà còn lưu:
  - mục tiêu học
  - khóa học quan tâm
  - khung giờ mong muốn
  - phương thức liên hệ
  - trạng thái xử lý của admin

Điều này làm bảng `messages` trở thành bảng **lead management** chứ không chỉ là contact form đơn thuần.

---

## 5.2. Bảng `message_responses`

Đây là bảng phản hồi của quản trị viên đối với từng tin nhắn.

### Các cột chính

- `id`
- `message_id`
- `admin_user_id`
- `admin_name`
- `contact_method`
- `contact_location`
- `contact_schedule`
- `request_phone`
- `message_to_student`
- `is_visible_to_student`
- `created_at`
- `updated_at`

### Ý nghĩa

- Một tin nhắn có thể có lịch sử phản hồi
- Bảng này giúp tách phần phản hồi ra khỏi bảng `messages`
- Thiết kế này tốt hơn việc nhét toàn bộ phản hồi vào một cột duy nhất

### Quan hệ

- Một `message` có thể có nhiều `message_responses`

---

## 5.3. Bảng `student_notifications`

Đây là bảng thông báo dành cho học viên.

### Các cột chính

- `id`
- `user_id`
- `title`
- `message`
- `href`
- `is_read`
- `read_at`
- `created_at`
- `updated_at`

### Ý nghĩa

- Gửi thông báo cá nhân hóa cho từng tài khoản
- Ví dụ:
  - có bài tập mới
  - có phản hồi mới
  - có lớp học sắp bắt đầu

### Điểm mạnh

- Có trạng thái đã đọc/chưa đọc
- Có đường dẫn `href` để đưa học viên tới đúng trang cần xem

---

## 6. Các bảng hỗ trợ đăng nhập và bảo mật

## 6.1. Bảng `registration_otps`

### Chức năng

- Lưu mã xác thực khi đăng ký

### Các cột chính

- `username`
- `email`
- `password_hash`
- `otp_code`
- `expires_at`
- `used_at`
- `created_at`

### Ý nghĩa

- Hệ thống có thể lưu tạm dữ liệu đăng ký trước khi kích hoạt tài khoản chính thức

---

## 6.2. Bảng `user_oauth_identities`

### Chức năng

- Liên kết tài khoản người dùng với Google hoặc Facebook

### Các cột chính

- `user_id`
- `provider`
- `provider_user_id`
- `provider_email`
- `created_at`

### Ràng buộc

- `UNIQUE (provider, provider_user_id)`
- `UNIQUE (provider, provider_email)`

### Ý nghĩa

- Cho phép một tài khoản trong hệ thống đăng nhập bằng mạng xã hội

---

## 6.3. Bảng `password_reset_tokens`

### Chức năng

- Quản lý yêu cầu quên mật khẩu

### Các cột chính

- `user_id`
- `token_hash`
- `requested_ip`
- `user_agent`
- `expires_at`
- `used_at`
- `created_at`

### Ý nghĩa

- Tăng tính bảo mật vì hệ thống không lưu token gốc mà lưu token đã hash

---

## 7. Các bảng cho classroom online

## 7.1. Bảng `classroom_posts`

Đây là bảng bài đăng trong lớp học online.

### Các cột chính

- `id`
- `class_id`
- `teacher_id`
- `title`
- `description`
- `post_type`: `lecture` hoặc `assignment`
- `due_date`
- `created_at`
- `updated_at`

### Ý nghĩa

- Giáo viên có thể đăng:
  - bài giảng
  - bài tập

- Mỗi bài đăng gắn với một lớp học cụ thể

---

## 7.2. Bảng `classroom_materials`

### Chức năng

- Lưu file tài liệu đính kèm cho bài đăng

### Các cột chính

- `post_id`
- `original_name`
- `stored_name`
- `public_path`
- `mime_type`
- `size_bytes`
- `created_at`

### Ý nghĩa

- Một bài đăng có thể có nhiều tài liệu

---

## 7.3. Bảng `classroom_submissions`

### Chức năng

- Lưu bài nộp của học viên cho từng assignment

### Các cột chính

- `post_id`
- `student_id`
- `status`: `assigned`, `submitted`, `completed`, `reviewed`
- `student_note`
- `teacher_feedback`
- `teacher_score`
- `submitted_at`
- `completed_at`
- `reviewed_at`
- `created_at`
- `updated_at`

### Ý nghĩa

- Theo dõi toàn bộ vòng đời của một bài tập
- Từ lúc được giao đến lúc nộp, chấm và phản hồi

### Ràng buộc

- `UNIQUE (post_id, student_id)`

Nghĩa là mỗi học viên chỉ có một bản ghi nộp bài cho mỗi assignment.

---

## 7.4. Bảng `classroom_submission_files`

### Chức năng

- Lưu file đính kèm của bài nộp

### Các cột chính

- `submission_id`
- `original_name`
- `stored_name`
- `public_path`
- `mime_type`
- `size_bytes`
- `created_at`

### Ý nghĩa

- Một bài nộp có thể đính kèm nhiều file

---

## 8. Bảng theo dõi hoạt động học tập

## 8.1. Bảng `student_learning_sessions`

Đây là bảng mở rộng rất hay vì nó biến hệ thống từ quản lý hành chính thành nền tảng học tập số.

### Chức năng

- Lưu lịch sử làm bài của học viên
- Theo dõi full test, practice và dictation

### Các cột chính

- `student_id`
- `activity_type`: `full_test`, `practice`, `dictation`
- `session_token`
- `activity_key`
- `secondary_key`
- `title`
- `subtitle`
- `source_label`
- `badge_label`
- `status_label`
- `score_value`
- `score_max`
- `accuracy`
- `correct_count`
- `incorrect_count`
- `unanswered_count`
- `completed_count`
- `skipped_count`
- `total_count`
- `reset_count`
- `payload`
- `submitted_at`
- `created_at`
- `updated_at`

### Ý nghĩa

- Không chỉ lưu điểm cuối cùng
- Mà còn lưu chi tiết kết quả, số câu đúng, sai, bỏ qua và metadata của bài làm

### Điểm mạnh

- `payload` lưu JSON giúp hệ thống rất linh hoạt
- Có thể phục vụ dashboard tiến độ học tập, báo cáo học viên hoặc gợi ý ôn luyện

---

## 9. Sơ đồ quan hệ giữa các bảng

Nếu trình bày bằng lời, em có thể nói như sau:

### Nhóm quan hệ học vụ chính

- `users` liên kết 1-n với `student_notifications`
- `users` có thể liên kết với `students` thông qua `students.user_id`
- `users` có thể liên kết với `teachers` thông qua `teachers.user_id`
- `courses` liên kết 1-n với `classes`
- `teachers` liên kết 1-n với `classes`
- `students` và `classes` liên kết n-n thông qua `enrollments`
- `enrollments` liên kết 1-n với `payments`
- `classes` và `students` liên kết qua `attendance`
- `teachers`, `students`, `classes` cùng liên kết trong `student_comments`

### Nhóm quan hệ classroom online

- `classes` liên kết 1-n với `classroom_posts`
- `classroom_posts` liên kết 1-n với `classroom_materials`
- `classroom_posts` liên kết 1-n với `classroom_submissions`
- `classroom_submissions` liên kết 1-n với `classroom_submission_files`

### Nhóm quan hệ bảo mật

- `users` liên kết 1-n với `user_oauth_identities`
- `users` liên kết 1-n với `password_reset_tokens`

### Nhóm quan hệ hoạt động học tập

- `students` liên kết 1-n với `student_learning_sessions`

---

## 10. ERD rút gọn để thuyết trình

```text
users
 ├── students
 ├── teachers
 ├── student_notifications
 ├── user_oauth_identities
 └── password_reset_tokens

courses
 └── classes
      ├── enrollments
      │    └── payments
      ├── attendance
      ├── teacher_attendance
      ├── student_comments
      └── classroom_posts
           ├── classroom_materials
           └── classroom_submissions
                └── classroom_submission_files

students
 ├── enrollments
 ├── attendance
 ├── student_comments
 ├── classroom_submissions
 └── student_learning_sessions

messages
 └── message_responses
```

---

## 11. Những điểm tốt trong thiết kế cơ sở dữ liệu

Khi thuyết trình, em có thể nhấn mạnh 6 điểm này:

1. **Chuẩn hóa dữ liệu khá tốt**
   - Tách riêng học viên, giáo viên, khóa học, lớp học, ghi danh, thanh toán

2. **Có khóa ngoại rõ ràng**
   - Giúp dữ liệu nhất quán và tránh bản ghi mồ côi

3. **Có bảng trung gian hợp lý**
   - `enrollments` xử lý quan hệ nhiều - nhiều giữa học viên và lớp học

4. **Có cơ chế chống trùng**
   - Ví dụ `UNIQUE(student_id, class_id)` trong ghi danh
   - `UNIQUE(class_id, student_id, lesson_date)` trong điểm danh

5. **Có hỗ trợ nghiệp vụ thực tế**
   - tư vấn
   - thanh toán
   - bài tập
   - nộp bài
   - thông báo
   - lịch sử học tập

6. **Có khả năng mở rộng**
   - Thêm social login
   - Thêm phân tích tiến độ
   - Thêm lớp học online

---

## 12. Một số hạn chế và hướng cải tiến

Phần này rất nên nói khi thuyết trình vì sẽ thể hiện em hiểu hệ thống sâu hơn.

### Hạn chế 1: Chưa ràng buộc khóa ngoại trực tiếp giữa `students.user_id` và `users.id`

- Hiện tại có cột `user_id` và index
- Nhưng chưa thấy `FOREIGN KEY` trực tiếp

### Hướng cải tiến

- Bổ sung ràng buộc khóa ngoại để tăng toàn vẹn dữ liệu

### Hạn chế 2: Bảng `messages` kiêm nhiều vai trò

- Vừa là contact form
- Vừa là lead tư vấn
- Vừa là feedback

### Hướng cải tiến

- Có thể tách thành các bảng chuyên biệt như:
  - `consultation_requests`
  - `teacher_feedback`
  - `contact_messages`

### Hạn chế 3: Có dấu vết của schema cũ

Trong repo vẫn còn các thành phần cũ như:

- `subjects`
- `marks`
- `data/*.txt`

Điều này cho thấy hệ thống đã được nâng cấp từ phiên bản cũ sang phiên bản MySQL mới.

### Hướng cải tiến

- Xóa hoặc cô lập phần legacy để kiến trúc sạch hơn

### Hạn chế 4: Một số dữ liệu thời gian biểu đang lưu dạng text

- Ví dụ `schedule_text`

### Hướng cải tiến

- Nếu cần mở rộng mạnh hơn, có thể tách thành bảng lịch học chi tiết theo từng buổi

---

## 13. Cách em có thể nói trong lúc thuyết trình

### Mở đầu

> Cơ sở dữ liệu của em được thiết kế để phục vụ một nền tảng quản lý trung tâm tiếng Anh. Em không chỉ lưu tài khoản người dùng mà còn mô hình hóa đầy đủ quy trình vận hành trung tâm, từ khóa học, lớp học, ghi danh, thanh toán, điểm danh cho đến bài tập online và lịch sử học tập.

### Khi nói về bảng lõi

> Em xem `users` là bảng quản lý danh tính đăng nhập, còn `students` và `teachers` là hai bảng hồ sơ nghiệp vụ. Từ đó, `courses` mô tả khóa học, `classes` mô tả lớp học thực tế, còn `enrollments` là bảng trung gian để gắn học viên vào lớp.

### Khi nói về thanh toán

> Em nối bảng `payments` với `enrollments` thay vì nối trực tiếp với học viên, vì một khoản thanh toán luôn gắn với một lần đăng ký học cụ thể. Thiết kế này phản ánh nghiệp vụ đúng hơn.

### Khi nói về mở rộng

> Ngoài các bảng quản lý truyền thống, hệ thống của em còn có các bảng cho classroom online như bài đăng, tài liệu, bài nộp và các bảng lưu lịch sử học tập như `student_learning_sessions`. Điều này cho thấy cơ sở dữ liệu có khả năng mở rộng từ quản lý hành chính sang hỗ trợ học tập số.

### Khi kết luận

> Tóm lại, cơ sở dữ liệu của em được thiết kế theo hướng phân hệ rõ ràng, có khóa ngoại, có chống trùng, hỗ trợ đúng nghiệp vụ thực tế và có khả năng mở rộng tiếp trong tương lai.

---

## 14. Ghi chú quan trọng để trình bày chính xác

- Schema hiện tại được đọc từ source code của hệ thống.
- Lúc em kiểm tra thì MySQL local đang chưa chạy, nên chưa lấy được số lượng bản ghi thực tế trong database đang hoạt động.
- Tuy nhiên phần cấu trúc bảng, khóa ngoại, cột dữ liệu và luồng quan hệ ở trên là schema thật mà code đang bootstrap.

---

## 15. Kết luận ngắn gọn 30 giây

> Cơ sở dữ liệu của em dùng MySQL và được thiết kế theo mô hình phân hệ. Phần lõi gồm tài khoản, học viên, giáo viên, khóa học, lớp học, ghi danh và thanh toán. Phần mở rộng gồm điểm danh, nhận xét, tư vấn, thông báo, classroom online và lịch sử hoạt động học tập. Hệ thống có dùng khóa ngoại, unique key và index để đảm bảo dữ liệu nhất quán, hạn chế trùng lặp và dễ mở rộng trong tương lai.
