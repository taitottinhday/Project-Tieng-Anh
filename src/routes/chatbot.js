const express = require("express");
const router = express.Router();
const { getChatbotReply } = require("../services/chatbotService");

router.post("/chatbot/respond", express.json(), async (req, res) => {
  try {
    const message = String(req.body?.message || "");
    const scope = String(req.body?.scope || "").trim().toLowerCase() === "student" ? "student" : "guest";
    const currentPath = String(req.body?.currentPath || req.originalUrl || "");

    const reply = await getChatbotReply({
      message,
      scope,
      baseUrl: res.locals.baseUrl || "",
      currentPath,
      conversationState: req.session?.chatbotState || {},
    });

    if (req.session) {
      req.session.chatbotState = reply.nextState;
    }

    res.json({
      ok: true,
      answer: reply.answer,
      suggestions: reply.suggestions,
      actions: reply.actions,
      matchedTopic: reply.matchedTopic,
      source: reply.source,
    });
  } catch (error) {
    console.error("[chatbot] respond error:", error);
    res.status(500).json({
      ok: false,
      answer: "Hệ thống chatbot đang bận. Bạn thử lại sau hoặc liên hệ hotline 0344772436 để được hỗ trợ nhanh.",
      suggestions: ["Làm placement test", "Xem lịch khai giảng", "Liên hệ tư vấn"],
      actions: [],
      matchedTopic: null,
      source: "error",
    });
  }
});

module.exports = router;
