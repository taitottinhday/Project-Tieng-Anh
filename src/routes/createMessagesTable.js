const express = require("express");
const router = express.Router();
const { ensureApplicationSchema } = require("../services/bootstrapService");

router.get("/create-messages-table", async (req, res) => {
  try {
    await ensureApplicationSchema();
    res.send("Messages table created.");
  } catch (err) {
    res.send("Error: " + err.message);
  }
});

module.exports = router;
