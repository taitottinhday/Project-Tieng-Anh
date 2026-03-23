const renderWithLayout = require("../utils/renderHelper");
const { syncStudentProfileFromUser } = require("../services/platformSupport");
const { getStudentActivityProfile } = require("../services/studentActivityService");

function toNumber(value, fallback = 0) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
}

async function showStudentProfile(req, res) {
  try {
    const student = await syncStudentProfileFromUser(req.session?.user);

    if (!student) {
      return res.status(404).send("Khong tim thay ho so hoc vien.");
    }

    const activity = await getStudentActivityProfile(student.id, res.locals.baseUrl || "");
    const summary = activity.studentSummary || student;

    return renderWithLayout(res, "student-profile", {
      title: "Hồ sơ học viên",
      studentName: student.full_name || req.session?.user?.username || "Học viên",
      profileStudent: {
        ...student,
        enrollmentCount: toNumber(summary.enrollment_count),
        activeEnrollmentCount: toNumber(summary.active_enrollment_count),
        activityCount: toNumber(summary.activity_count),
      },
      examSessions: activity.examSessions,
      dictationSessions: activity.dictationSessions,
      activeTab: String(req.query.tab || "").toLowerCase() === "dictation" ? "dictation" : "exams",
    });
  } catch (error) {
    console.error("showStudentProfile error:", error);
    return res.status(500).send(error && error.message ? error.message : "Khong the tai ho so hoc vien.");
  }
}

module.exports = {
  showStudentProfile,
};
