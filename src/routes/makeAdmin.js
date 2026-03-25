const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { readUsers, writeUsers } = require("../models/dataHandler");
const { sendPublicError } = require("../utils/publicError");

// ONE-TIME ROUTE to create admin
router.get("/make-admin", async (req, res) => {
  try {
    const adminEmail = String(process.env.DEFAULT_ADMIN_EMAIL || "").trim().toLowerCase();
    const adminPassword = String(process.env.DEFAULT_ADMIN_PASSWORD || "");

    if (!adminEmail || !adminPassword) {
      return res.status(400).send("Legacy admin bootstrap is disabled until DEFAULT_ADMIN_EMAIL and DEFAULT_ADMIN_PASSWORD are configured.");
    }

    // Read existing users
    const users = readUsers();

    // Check if admin already exists
    const existing = users.find(u => u.email === adminEmail);
    if (existing) {
      existing.password = await bcrypt.hash(adminPassword, 10);
      existing.role = "admin";
      writeUsers(users);
      return res.send("Legacy admin user synchronized.");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create admin user
    const adminUser = {
      id: Date.now(),
      username: "Admin",
      email: adminEmail,
      password: hashedPassword,
      role: "admin"
    };

    users.push(adminUser);
    writeUsers(users);

    res.send("Legacy admin user created.");
  } catch (err) {
    console.error("makeAdmin error:", err);
    return sendPublicError(res, err, 500, "Không thể đồng bộ tài khoản quản trị cũ lúc này.");
  }
});

module.exports = router;
