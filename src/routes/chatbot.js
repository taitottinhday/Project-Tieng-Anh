const express = require("express");
const router = express.Router();
const { getChatbotReply } = require("../services/chatbotService");

router.post("/chatbot/respond", express.json(), (req, res) => {
  const message = String(req.body?.message || "");
  const reply = getChatbotReply(message);

  res.json({
    ok: true,
    ...reply,
  });
});

module.exports = router;
