const express = require("express");
const router = express.Router();
const db = require("../models/db");

router.get("/add-role-column", async (req, res) => {
  try {
    await db.query(`
      ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user'
    `);
    res.send("Role column added successfully!");
  } catch (err) {
    res.send("Error: " + err.message);
  }
});

module.exports = router;
