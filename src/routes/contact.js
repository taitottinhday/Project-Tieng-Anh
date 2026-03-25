const express = require("express");
const router = express.Router();
const renderWithLayout = require("../utils/renderHelper");
const { isLoggedIn, isAdmin } = require("./auth");
const fs = require("fs");
const path = require("path");
const { sendPublicError } = require("../utils/publicError");

// File-based message storage
const messagesFile = path.join(__dirname, "../data/messages.json");

function ensureDataFile() {
  const dir = path.dirname(messagesFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(messagesFile)) {
    fs.writeFileSync(messagesFile, "[]");
  }
}

function getMessages() {
  try {
    ensureDataFile();
    return JSON.parse(fs.readFileSync(messagesFile, "utf-8"));
  } catch (err) {
    console.error("Error reading messages file:", err);
    return [];
  }
}

function saveAllMessages(messages) {
  try {
    ensureDataFile();
    fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2));
  } catch (err) {
    console.error("Error saving messages file:", err);
  }
}

function saveMessage(msg) {
  const messages = getMessages();
  messages.push({
    ...msg,
    id: Date.now(),
    status: "new",
    admin_note: "",
    contacted_at: null,
    created_at: new Date().toISOString(),
  });
  saveAllMessages(messages);
}

function sanitizeReturnPath(value) {
  const raw = String(value || "").trim();

  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return null;
  }

  return raw;
}

function updateFileMessage(id, updater) {
  const messages = getMessages();
  const idx = messages.findIndex((m) => String(m.id) === String(id));
  if (idx === -1) return false;
  messages[idx] = updater(messages[idx]);
  saveAllMessages(messages);
  return true;
}

// GET contact page - public
router.get("/contact", (req, res) => {
  renderWithLayout(res, "contact", {
    title: "Tư vấn khóa học",
    success: req.query.success || null,
  });
});

// POST contact form - public
router.post("/contact", async (req, res) => {
  const {
    name,
    email,
    phone,
    goal,
    course_interest,
    schedule_preference,
    message,
    return_to,
  } = req.body;

  try {
    const fullMessage = `
SĐT: ${phone || ""}
Mục tiêu học: ${goal || ""}
Khóa học quan tâm: ${course_interest || ""}
Khung giờ mong muốn: ${schedule_preference || ""}

Nội dung:
${message || ""}
`;

    let savedToDb = false;

    try {
      const db = require("../models/db");
      await db.query(
        "INSERT INTO messages (name, email, message, status, admin_note, contacted_at) VALUES (?, ?, ?, 'new', '', NULL)",
        [name, email, fullMessage]
      );
      savedToDb = true;
      console.log("[contact] Saved message to database");
    } catch (dbErr) {
      console.log("[contact] DB error, using file storage:", dbErr.message);
    }

    if (!savedToDb) {
      saveMessage({
        name,
        email,
        message: fullMessage,
      });
      console.log("[contact] Saved message to file");
    }

    const baseUrl = res.locals.baseUrl || "";
    const safeReturnPath = sanitizeReturnPath(return_to);
    const destination = safeReturnPath || "/contact";
    const separator = destination.includes("?") ? "&" : "?";
    res.redirect(baseUrl + destination + `${separator}success=1`);
  } catch (err) {
    console.error("contact submit error:", err);
    return sendPublicError(res, err, 500, "Không thể gửi yêu cầu tư vấn lúc này.");
  }
});

// GET messages page for admin only
router.get("/messages", isLoggedIn, isAdmin, async (req, res) => {
  try {
    let messages = [];
    let dbWorked = false;

    try {
      const db = require("../models/db");
      const [rows] = await db.query(
        `SELECT 
          id, 
          name, 
          email, 
          message, 
          created_at,
          status,
          admin_note,
          contacted_at
         FROM messages
         ORDER BY 
           CASE
             WHEN status = 'new' THEN 0
             WHEN status = 'viewed' THEN 1
             WHEN status = 'contacted' THEN 2
             ELSE 3
           END,
           created_at DESC`
      );
      messages = rows;
      dbWorked = true;
      console.log("[messages] Loaded from database:", messages.length);
    } catch (dbErr) {
      console.log("[messages] DB error, fallback to file:", dbErr.message);
    }

    if (!dbWorked || messages.length === 0) {
      const fileMessages = getMessages().reverse();
      if (fileMessages.length > 0) {
        messages = fileMessages;
        console.log("[messages] Loaded from file:", messages.length);
      }
    }

    renderWithLayout(res, "messages", {
      title: "Messages",
      messages,
      username: req.session.user?.username,
    });
  } catch (err) {
    console.error("messages list error:", err);
    return sendPublicError(res, err, 500, "Không thể tải danh sách yêu cầu lúc này.");
  }
});

// ĐÁNH DẤU ĐÃ XEM - admin only
router.post("/messages/:id/viewed", isLoggedIn, isAdmin, async (req, res) => {
  const id = req.params.id;

  try {
    let updated = false;

    try {
      const db = require("../models/db");
      await db.query(
        "UPDATE messages SET status = 'viewed' WHERE id = ?",
        [id]
      );
      updated = true;
    } catch (dbErr) {
      console.log("[messages/viewed] DB error, fallback to file:", dbErr.message);
    }

    if (!updated) {
      updateFileMessage(id, (msg) => ({
        ...msg,
        status: "viewed",
      }));
    }

    res.redirect(req.baseUrl + "/messages");
  } catch (err) {
    console.error("messages viewed error:", err);
    return sendPublicError(res, err, 500, "Không thể cập nhật trạng thái yêu cầu lúc này.");
  }
});

// LIÊN HỆ TƯ VẤN - admin only
router.post("/messages/:id/contacted", isLoggedIn, isAdmin, async (req, res) => {
  const id = req.params.id;

  try {
    let updated = false;
    const now = new Date();

    try {
      const db = require("../models/db");
      await db.query(
        "UPDATE messages SET status = 'contacted', contacted_at = NOW() WHERE id = ?",
        [id]
      );
      updated = true;
    } catch (dbErr) {
      console.log("[messages/contacted] DB error, fallback to file:", dbErr.message);
    }

    if (!updated) {
      updateFileMessage(id, (msg) => ({
        ...msg,
        status: "contacted",
        contacted_at: now.toISOString(),
      }));
    }

    res.redirect(req.baseUrl + "/messages");
  } catch (err) {
    console.error("messages contacted error:", err);
    return sendPublicError(res, err, 500, "Không thể cập nhật trạng thái liên hệ lúc này.");
  }
});

// LƯU GHI CHÚ - admin only
router.post("/messages/:id/note", isLoggedIn, isAdmin, async (req, res) => {
  const id = req.params.id;
  const admin_note = req.body.admin_note || "";

  try {
    let updated = false;

    try {
      const db = require("../models/db");
      await db.query(
        "UPDATE messages SET admin_note = ? WHERE id = ?",
        [admin_note, id]
      );
      updated = true;
    } catch (dbErr) {
      console.log("[messages/note] DB error, fallback to file:", dbErr.message);
    }

    if (!updated) {
      updateFileMessage(id, (msg) => ({
        ...msg,
        admin_note,
      }));
    }

    res.redirect(req.baseUrl + "/messages");
  } catch (err) {
    console.error("messages note error:", err);
    return sendPublicError(res, err, 500, "Không thể lưu ghi chú lúc này.");
  }
});

module.exports = router;
