require("dotenv").config();
const bcrypt = require("bcrypt");
const db = require("./src/models/db");

(async () => {
    try {
        const email = String(process.env.DEFAULT_ADMIN_EMAIL || "").trim().toLowerCase();
        const plain = String(process.env.DEFAULT_ADMIN_PASSWORD || "");

        if (!email || !plain) {
            throw new Error("DEFAULT_ADMIN_EMAIL and DEFAULT_ADMIN_PASSWORD must be configured before running reset-admin.js.");
        }

        const hashed = await bcrypt.hash(plain, 10);

        // Tạo admin nếu chưa có, nếu có thì reset password + set role=admin
        const [rows] = await db.query("SELECT id FROM users WHERE email = ?", [email]);

        if (rows.length === 0) {
            await db.query(
                "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
                ["Admin", email, hashed, "admin"]
            );
            console.log("Admin created:", email);
        } else {
            await db.query(
                "UPDATE users SET password = ?, role = ? WHERE email = ?",
                [hashed, "admin", email]
            );
            console.log("Admin password reset:", email);
        }

        process.exit(0);
    } catch (err) {
        console.error("reset-admin failed:", err.message);
        process.exit(1);
    }
})();
