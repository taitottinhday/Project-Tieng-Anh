const express = require("express");
const router = express.Router();
const renderWithLayout = require("../utils/renderHelper");
const ensureSchemaReady = require("../middleware/ensureSchemaReady");
const { isLoggedIn, refreshSessionUser, redirectToRoleLogin } = require("./auth");
const studentPracticeController = require("../controllers/studentPracticeController");
const studentDictationController = require("../controllers/studentDictationController");
const studentProfileController = require("../controllers/studentProfileController");
const {
  getStudentCourseCards,
  getStudentCourseDetail,
  getStudentCoursePlayer,
} = require("../data/studentCourseCatalog");
const { getStudentCourseHubData } = require("../data/courseSalesCatalog");
const {
  syncStudentProfileFromUser,
  uploadStudentSubmissionFiles,
} = require("../services/platformSupport");
const {
  getStudentClassroomFeed,
  getStudentClassroomList,
  getStudentPostDetail,
  markStudentSubmissionComplete,
  saveStudentSubmission,
} = require("../services/classroomService");
const { listStudentConsultations } = require("../services/consultationService");
const {
  markAllStudentNotificationsRead,
} = require("../services/studentNotificationService");
const {
  findStudentOpenEnrollment,
  listStudentActiveSchedules,
} = require("../services/studentEnrollmentService");
const { resolvePublicErrorMessage, sendPublicError } = require("../utils/publicError");

router.use(ensureSchemaReady);

async function isStudent(req, res, next) {
  try {
    const sessionUser = await refreshSessionUser(req);
    const role = sessionUser?.role;

    if (!role || role === "admin" || role === "teacher") {
      return redirectToRoleLogin(req, res, "user");
    }

    return next();
  } catch (error) {
    console.error("isStudent refresh error:", error);
    const role = req.session?.user?.role;

    if (!role || role === "admin" || role === "teacher") {
      return redirectToRoleLogin(req, res, "user");
    }

    return next();
  }
}

async function getCurrentStudent(req) {
  return syncStudentProfileFromUser(req.session?.user);
}

function handleStudentUpload(middleware) {
  return (req, res, next) => {
    middleware(req, res, (err) => {
      if (err) {
        req.flash("error_msg", resolvePublicErrorMessage(err, "Không thể tải tệp nộp bài lúc này."));
        return res.redirect(req.baseUrl + `/classroom/${req.params.classId}/posts/${req.params.postId}`);
      }

      return next();
    });
  };
}

function getSafeBaseUrl(res) {
  return res.locals.baseUrl || "";
}

function getStudentCourseComments(req, slug) {
  const commentsBySlug = req.session?.studentCourseComments || {};
  const comments = commentsBySlug[slug];
  return Array.isArray(comments) ? comments : [];
}

router.use("/schedule", isLoggedIn, isStudent, async (req, res, next) => {
  if (req.method !== "GET" || (req.path !== "/" && req.path !== "")) {
    return next();
  }

  try {
    const student = await getCurrentStudent(req);
    const schedules = student?.id ? await listStudentActiveSchedules(student.id) : [];
    const openEnrollment = await findStudentOpenEnrollment({
      studentId: student?.id || 0,
      userId: Number(req.session?.user?.id || 0),
      email: req.session?.user?.email || student?.email || "",
    });

    return renderWithLayout(res, "student-schedule", {
      title: "Thời khóa biểu học viên",
      student,
      schedules,
      pendingEnrollment:
        openEnrollment && openEnrollment.enrollment_status === "pending" ? openEnrollment : null,
    });
  } catch (err) {
    console.error("student schedule error:", err);
    return sendPublicError(res, err, 500, "Không thể tải thời khóa biểu lúc này.");
  }
});

router.get("/login", (req, res) => {
  return res.redirect((res.locals.baseUrl || "") + "/login");
});

router.post("/notifications/read-all", isLoggedIn, isStudent, express.urlencoded({ extended: true }), async (req, res) => {
  try {
    await markAllStudentNotificationsRead(req.session?.user?.id || 0);
    const redirectPath = String(req.body.redirect || "").trim();
    const safeRedirect = redirectPath.startsWith("/") && !redirectPath.startsWith("//")
      ? redirectPath
      : "/";
    return res.redirect((res.locals.baseUrl || "") + safeRedirect);
  } catch (error) {
    console.error("student notifications read-all error:", error);
    req.flash("error_msg", "Không thể cập nhật trạng thái thông báo lúc này.");
    return res.redirect((res.locals.baseUrl || "") + "/");
  }
});

router.get("/courses", isLoggedIn, isStudent, async (req, res) => {
  try {
    renderWithLayout(res, "student-course-hub", {
      title: "Khóa học học viên",
      courseHub: await getStudentCourseHubData(getSafeBaseUrl(res)),
    });
  } catch (err) {
    console.error("student course hub error:", err);
    return sendPublicError(res, err, 500, "Không thể tải danh sách khóa học lúc này.");
  }
});

router.get("/courses/video-bai-giang", isLoggedIn, isStudent, (req, res) => {
  renderWithLayout(res, "student-courses", {
    title: "Video bài giảng",
    courseCards: getStudentCourseCards(getSafeBaseUrl(res)),
  });
});

router.get("/courses/:slug/learn", isLoggedIn, isStudent, (req, res) => {
  const coursePlayer = getStudentCoursePlayer(req.params.slug, req.query.lesson, getSafeBaseUrl(res));

  if (!coursePlayer) {
    return res.status(404).send("Không tìm thấy bài học");
  }

  return renderWithLayout(res, "student-course-player", {
    title: `${coursePlayer.title} · Tiếp tục bài học`,
    coursePlayer,
  });
});

router.post("/courses/:slug/comments", isLoggedIn, isStudent, express.urlencoded({ extended: true }), (req, res) => {
  const course = getStudentCourseDetail(req.params.slug, getSafeBaseUrl(res));

  if (!course) {
    return res.status(404).send("Không tìm thấy khóa học");
  }

  const content = String(req.body.comment || "").trim();
  if (!content) {
    return res.redirect(`${course.commentsHref}&error=empty`);
  }

  if (!req.session.studentCourseComments) {
    req.session.studentCourseComments = {};
  }

  const currentComments = getStudentCourseComments(req, course.slug);
  const username = req.session?.user?.username || "Học viên";
  req.session.studentCourseComments[course.slug] = [
    {
      id: `${Date.now()}`,
      author: username,
      avatar: String(username || "H").trim().charAt(0).toUpperCase() || "H",
      content,
      createdAt: new Date().toISOString(),
    },
    ...currentComments,
  ].slice(0, 20);

  return res.redirect(`${course.commentsHref}&commented=1`);
});

router.get("/courses/:slug", isLoggedIn, isStudent, (req, res) => {
  const course = getStudentCourseDetail(req.params.slug, getSafeBaseUrl(res));

  if (!course) {
    return res.status(404).send("Không tìm thấy khóa học");
  }

  return renderWithLayout(res, "student-course-detail", {
    title: course.title,
    course,
    activeCourseTab: req.query.tab === "comments" ? "comments" : "content",
    courseComments: getStudentCourseComments(req, course.slug),
    commentSuccess: String(req.query.commented || "") === "1",
    commentError:
      String(req.query.error || "") === "empty"
        ? "Vui lòng nhập nội dung bình luận trước khi gửi."
        : "",
  });
});

router.get("/schedule", isLoggedIn, isStudent, (req, res) => {
  renderWithLayout(res, "student-schedule", {
    title: "Thời khóa biểu học viên",
  });
});

router.get("/contact", isLoggedIn, isStudent, async (req, res) => {
  try {
    const consultations = await listStudentConsultations({
      userId: req.session?.user?.id || null,
      email: req.session?.user?.email || "",
    });

    return renderWithLayout(res, "student-contact", {
      title: "Liên hệ học viên",
      success: req.query.success || null,
      consultations,
    });
  } catch (err) {
    console.error("student contact page error:", err);
    return sendPublicError(res, err, 500, "Không thể tải hộp thư tư vấn lúc này.");
  }
});

router.get("/feedback", isLoggedIn, isStudent, (req, res) => {
  renderWithLayout(res, "student-feedback", {
    title: "Góp ý học viên",
    success: req.query.success || null,
  });
});

router.get("/profile", isLoggedIn, isStudent, studentProfileController.showStudentProfile);

router.get("/classroom", isLoggedIn, isStudent, async (req, res) => {
  try {
    const student = await getCurrentStudent(req);

    if (!student) {
      return res.status(404).send("Không tìm thấy hồ sơ học viên.");
    }

    const classrooms = await getStudentClassroomList(student.id);
    renderWithLayout(res, "student-classroom", {
      title: "Lớp học của tôi",
      studentName: student.full_name || req.session.user?.username,
      student,
      classrooms,
      success: req.query.success || null,
    });
  } catch (err) {
    console.error("student classroom list error:", err);
    return sendPublicError(res, err, 500, "Không thể tải lớp học của học viên lúc này.");
  }
});

router.get("/classroom/:classId", isLoggedIn, isStudent, async (req, res) => {
  try {
    const student = await getCurrentStudent(req);
    const classId = Number(req.params.classId);

    if (!student) {
      return res.status(404).send("Không tìm thấy hồ sơ học viên.");
    }

    const classroom = await getStudentClassroomFeed(student.id, classId);
    if (!classroom) {
      return res.status(404).send("Không tìm thấy lớp học của học viên.");
    }

    renderWithLayout(res, "student-classroom-feed", {
      title: "Bảng tin lớp học",
      studentName: student.full_name || req.session.user?.username,
      student,
      classInfo: classroom.classInfo,
      posts: classroom.posts,
      success: req.query.success || null,
    });
  } catch (err) {
    console.error("student classroom feed error:", err);
    return sendPublicError(res, err, 500, "Không thể tải bảng tin lớp học lúc này.");
  }
});

router.get("/classroom/:classId/posts/:postId", isLoggedIn, isStudent, async (req, res) => {
  try {
    const student = await getCurrentStudent(req);
    const classId = Number(req.params.classId);
    const postId = Number(req.params.postId);

    if (!student) {
      return res.status(404).send("Không tìm thấy hồ sơ học viên.");
    }

    const classroom = await getStudentClassroomFeed(student.id, classId);
    const detail = await getStudentPostDetail(student.id, classId, postId);

    if (!classroom || !detail) {
      return res.status(404).send("Không tìm thấy bài học của học viên.");
    }

    renderWithLayout(res, "student-assignment-detail", {
      title: "Chi tiết bài học",
      studentName: student.full_name || req.session.user?.username,
      student,
      classInfo: classroom.classInfo,
      post: detail.post,
      submission: detail.submission,
      success: req.query.success || null,
    });
  } catch (err) {
    console.error("student classroom post detail error:", err);
    return sendPublicError(res, err, 500, "Không thể tải chi tiết bài học lúc này.");
  }
});

router.post(
  "/classroom/:classId/posts/:postId/submit",
  isLoggedIn,
  isStudent,
  handleStudentUpload(uploadStudentSubmissionFiles.array("submission_files", 6)),
  async (req, res) => {
    try {
      const student = await getCurrentStudent(req);

      if (!student) {
        return res.status(404).send("Không tìm thấy hồ sơ học viên.");
      }

      await saveStudentSubmission({
        studentId: student.id,
        classId: Number(req.params.classId),
        postId: Number(req.params.postId),
        note: req.body.student_note,
        files: req.files || [],
        markComplete: String(req.body.mark_complete || "") === "1",
      });

      return res.redirect(req.baseUrl + `/classroom/${req.params.classId}/posts/${req.params.postId}?success=1`);
    } catch (err) {
      req.flash("error_msg", resolvePublicErrorMessage(err, "Không thể nộp bài lúc này."));
      return res.redirect(req.baseUrl + `/classroom/${req.params.classId}/posts/${req.params.postId}`);
    }
  }
);

router.post("/classroom/:classId/posts/:postId/complete", isLoggedIn, isStudent, async (req, res) => {
  try {
    const student = await getCurrentStudent(req);

    if (!student) {
      return res.status(404).send("Không tìm thấy hồ sơ học viên.");
    }

    await markStudentSubmissionComplete({
      studentId: student.id,
      classId: Number(req.params.classId),
      postId: Number(req.params.postId),
    });

    return res.redirect(req.baseUrl + `/classroom/${req.params.classId}/posts/${req.params.postId}?success=1`);
  } catch (err) {
    req.flash("error_msg", resolvePublicErrorMessage(err, "Không thể đánh dấu hoàn thành lúc này."));
    return res.redirect(req.baseUrl + `/classroom/${req.params.classId}/posts/${req.params.postId}`);
  }
});

router.get("/practice/parts", isLoggedIn, isStudent, studentPracticeController.listPartPractice);
router.get("/practice/reading", isLoggedIn, isStudent, studentPracticeController.listReadingPractice);
router.get("/dictation", isLoggedIn, isStudent, studentDictationController.listDictationTopics);
router.get("/dictation/:topicId", isLoggedIn, isStudent, studentDictationController.showDictationTopic);
router.get("/dictation/:topicId/:lessonId", isLoggedIn, isStudent, studentDictationController.showDictationLesson);
router.post("/dictation/:topicId/:lessonId/session", isLoggedIn, isStudent, studentDictationController.saveDictationSession);
router.get("/practice/parts/:practiceId", isLoggedIn, isStudent, studentPracticeController.showPartPracticeStart);
router.get("/practice/parts/:practiceId/take", isLoggedIn, isStudent, studentPracticeController.takePartPractice);
router.post("/practice/parts/:practiceId/submit", isLoggedIn, isStudent, studentPracticeController.submitPartPractice);
router.get("/practice/reading/:practiceId", isLoggedIn, isStudent, studentPracticeController.showReadingPracticeStart);
router.get("/practice/reading/:practiceId/take", isLoggedIn, isStudent, studentPracticeController.takeReadingPractice);
router.post("/practice/reading/:practiceId/submit", isLoggedIn, isStudent, studentPracticeController.submitReadingPractice);
router.get("/practice/result/latest", isLoggedIn, isStudent, studentPracticeController.showLatestPracticeResult);

router.get("/api/practice/parts", isLoggedIn, isStudent, studentPracticeController.listPartPracticeApi);
router.get("/api/practice/parts/:practiceId/questions", isLoggedIn, isStudent, studentPracticeController.getPartQuestionsApi);
router.get("/api/practice/parts/:practiceId/answers", isLoggedIn, isStudent, studentPracticeController.getPartAnswersApi);
router.get("/api/practice/reading", isLoggedIn, isStudent, studentPracticeController.listReadingPracticeApi);
router.get("/api/practice/reading/:practiceId/questions", isLoggedIn, isStudent, studentPracticeController.getReadingQuestionsApi);
router.get("/api/practice/reading/:practiceId/answers", isLoggedIn, isStudent, studentPracticeController.getReadingAnswersApi);

module.exports = router;
