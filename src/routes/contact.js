const express = require("express");
const router = express.Router();
const renderWithLayout = require("../utils/renderHelper");
const { isLoggedIn, isAdmin } = require("./auth");
const { sendPublicError } = require("../utils/publicError");
const ensureSchemaReady = require("../middleware/ensureSchemaReady");
const {
  createConsultationRequest,
  createConsultationResponse,
  listAdminConsultations,
  markConsultationViewed,
  saveConsultationNote,
} = require("../services/consultationService");

router.use(ensureSchemaReady);

function sanitizeReturnPath(value) {
  const raw = String(value || "").trim();

  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return null;
  }

  return raw;
}

function normalizePreferredContactMethod(value) {
  return String(value || "").trim();
}

function getConsultationResponsePayload(req) {
  return {
    admin_user_id: req.session?.user?.id || null,
    admin_name: req.session?.user?.username || "Tư vấn viên",
    contact_method: String(req.body.contact_method || "").trim(),
    contact_location: String(req.body.contact_location || "").trim(),
    contact_schedule: String(req.body.contact_schedule || "").trim(),
    request_phone: ["1", "true", "on", "yes"].includes(
      String(req.body.request_phone || "").trim().toLowerCase()
    ),
    message_to_student: String(req.body.message_to_student || "").trim(),
  };
}

router.get("/contact", (req, res) => {
  renderWithLayout(res, "contact", {
    title: "Tư vấn khóa học",
    success: req.query.success || null,
  });
});

router.post("/contact", async (req, res) => {
  const {
    name,
    email,
    phone,
    goal,
    course_interest,
    schedule_preference,
    preferred_contact_method,
    preferred_contact_detail,
    message,
    return_to,
  } = req.body;

  try {
    const trimmedName = String(name || "").trim();
    const preferredContactMethodLabel = normalizePreferredContactMethod(preferred_contact_method);
    const preferredContactDetailValue = String(preferred_contact_detail || "").trim();
    let trimmedEmail = String(email || "").trim();
    let trimmedPhone = String(phone || "").trim();
    const messageBody = String(message || "").trim();

    if (!trimmedEmail && preferredContactMethodLabel === "Email" && preferredContactDetailValue) {
      trimmedEmail = preferredContactDetailValue;
    }

    if (
      !trimmedPhone &&
      ["Gọi điện", "Zalo"].includes(preferredContactMethodLabel) &&
      preferredContactDetailValue
    ) {
      trimmedPhone = preferredContactDetailValue;
    }

    if (!trimmedName || !messageBody) {
      req.flash("error_msg", "Vui lòng điền họ tên và nội dung cần tư vấn.");
      const fallbackReturn = sanitizeReturnPath(return_to) || "/contact";
      return res.redirect((res.locals.baseUrl || "") + fallbackReturn);
    }

    if (!trimmedEmail && !trimmedPhone) {
      req.flash("error_msg", "Vui lòng để lại ít nhất email hoặc số điện thoại để trung tâm phản hồi.");
      const fallbackReturn = sanitizeReturnPath(return_to) || "/contact";
      return res.redirect((res.locals.baseUrl || "") + fallbackReturn);
    }

    await createConsultationRequest({
      user_id: req.session?.user?.id || null,
      name: trimmedName,
      email: trimmedEmail,
      phone: trimmedPhone,
      goal,
      course_interest,
      schedule_preference,
      preferred_contact_method: preferredContactMethodLabel,
      preferred_contact_detail: preferredContactDetailValue,
      message_body: messageBody,
    });

    const baseUrl = res.locals.baseUrl || "";
    const safeReturnPath = sanitizeReturnPath(return_to);
    const destination = safeReturnPath || "/contact";
    const separator = destination.includes("?") ? "&" : "?";
    return res.redirect(baseUrl + destination + `${separator}success=1`);
  } catch (err) {
    console.error("contact submit error:", err);
    return sendPublicError(res, err, 500, "Không thể gửi yêu cầu tư vấn lúc này.");
  }
});

router.get("/messages", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const messages = await listAdminConsultations();

    return renderWithLayout(res, "messages", {
      title: "Yêu cầu tư vấn",
      messages,
      username: req.session.user?.username,
    });
  } catch (err) {
    console.error("messages list error:", err);
    return sendPublicError(res, err, 500, "Không thể tải danh sách yêu cầu lúc này.");
  }
});

router.post("/messages/:id/viewed", isLoggedIn, isAdmin, async (req, res) => {
  const id = req.params.id;

  try {
    await markConsultationViewed(id);
    req.flash("success_msg", "Đã cập nhật yêu cầu sang trạng thái đã xem.");
    return res.redirect(req.baseUrl + "/messages");
  } catch (err) {
    console.error("messages viewed error:", err);
    return sendPublicError(res, err, 500, "Không thể cập nhật trạng thái yêu cầu lúc này.");
  }
});

router.post("/messages/:id/contacted", isLoggedIn, isAdmin, async (req, res) => {
  const id = req.params.id;

  try {
    await createConsultationResponse(id, getConsultationResponsePayload(req));
    req.flash("success_msg", "Đã gửi cập nhật tư vấn về đúng luồng học viên.");
    return res.redirect(req.baseUrl + "/messages");
  } catch (err) {
    if (err.code === "EMPTY_CONSULTATION_RESPONSE") {
      req.flash(
        "error_msg",
        "Vui lòng nhập ít nhất một thông tin tư vấn như kênh liên hệ, lịch hẹn, địa điểm hoặc lời nhắn gửi học viên."
      );
      return res.redirect(req.baseUrl + "/messages");
    }

    console.error("messages contacted error:", err);
    return sendPublicError(res, err, 500, "Không thể cập nhật trạng thái liên hệ lúc này.");
  }
});

router.post("/messages/:id/note", isLoggedIn, isAdmin, async (req, res) => {
  const id = req.params.id;
  const adminNote = req.body.admin_note || "";

  try {
    await saveConsultationNote(id, adminNote);
    req.flash("success_msg", "Đã lưu ghi chú nội bộ cho yêu cầu này.");
    return res.redirect(req.baseUrl + "/messages");
  } catch (err) {
    console.error("messages note error:", err);
    return sendPublicError(res, err, 500, "Không thể lưu ghi chú lúc này.");
  }
});

module.exports = router;
