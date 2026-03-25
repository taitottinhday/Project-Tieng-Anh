const express = require("express");
const router = express.Router();
const { ensureApplicationSchema } = require("../services/bootstrapService");
const { isAdmin } = require("./auth");

router.get("/create-messages-table", isAdmin, async (req, res) => {
  try {
    await ensureApplicationSchema();
    res.send("Messages table created.");
  } catch (err) {
    console.error("create-messages-table error:", err);
    res.status(500).send("Khong the cap nhat schema luc nay.");
  }
});

module.exports = router;
