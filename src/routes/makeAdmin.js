const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { readUsers, writeUsers } = require("../models/dataHandler");

// ONE-TIME ROUTE to create admin
router.get("/make-admin", async (req, res) => {
  try {
    const adminEmail = "admin@gmail.com";
    const adminPassword = "admin123"; // Change it later!

    // Read existing users
    const users = readUsers();

    // Check if admin already exists
    const existing = users.find(u => u.email === adminEmail);
    if (existing) {
      existing.password = await bcrypt.hash(adminPassword, 10);
      existing.role = "admin";
      writeUsers(users);
      return res.send("Admin password reset! Use email: admin@gmail.com & password: admin123");
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

    res.send("Admin created! Use email: admin@gmail.com & password: admin123");
  } catch (err) {
    res.send("ERROR: " + err.message);
  }
});

module.exports = router;
