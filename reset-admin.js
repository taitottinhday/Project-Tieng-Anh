require("dotenv").config();
const bcrypt = require("bcrypt");
const db = require("./src/models/db");

(async () => {
    try {
        const email = "admin@gmail.com";
        const plain = "admin123";
        const hashed = await bcrypt.hash(plain, 10);

        // Tạo admin nếu chưa có, nếu có thì reset password + set role=admin
        const [rows] = await db.query("SELECT id FROM users WHERE email = ?", [email]);

        if (rows.length === 0) {
            await db.query(
                "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
                ["Admin", email, hashed, "admin"]
            );
            console.log("✅ Admin created:", email, "/", plain);
        } else {
            await db.query(
                "UPDATE users SET password = ?, role = ? WHERE email = ?",
                [hashed, "admin", email]
            );
            console.log("✅ Admin password reset:", email, "/", plain);
        }

        process.exit(0);
    } catch (err) {
        console.error("❌", err.message);
        process.exit(1);
    }
})();