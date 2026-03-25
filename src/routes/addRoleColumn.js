const express = require("express");
const router = express.Router();
const db = require("../models/db");
const { isAdmin } = require("./auth");

router.get("/add-role-column", isAdmin, async (req, res) => {
  try {
    await db.query(`
      ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user'
    `);
    res.send("Role column added successfully!");
  } catch (err) {
    console.error("add-role-column error:", err);
    res.status(500).send("Khong the cap nhat schema luc nay.");
  }
});

module.exports = router;
