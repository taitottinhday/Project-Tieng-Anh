require("dotenv").config();

const db = require("../src/models/db");
const { DEMO_TEACHER_PASSWORD, seedDemoCenterData } = require("../src/services/demoSeedService");

(async () => {
  try {
    const summary = await seedDemoCenterData();
    console.log("Expanded demo data seeded successfully.");
    console.log(JSON.stringify({
      ...summary,
      demoTeacherPassword: DEMO_TEACHER_PASSWORD,
    }, null, 2));
  } catch (err) {
    console.error("Failed to seed expanded demo data:", err);
    process.exitCode = 1;
  } finally {
    await db.end();
  }
})();
