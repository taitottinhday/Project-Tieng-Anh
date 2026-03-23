const db = require("./db");
const { seedDemoCenterData } = require("../services/demoSeedService");

async function safeQuery(sql, params = []) {
  try {
    const [rows] = await db.query(sql, params);
    return rows;
  } catch (err) {
    console.warn("[dataImport] Query failed:", err.message);
    return null;
  }
}

async function safeScalar(sql, fallback = 0) {
  const rows = await safeQuery(sql);

  if (!rows || rows.length === 0) {
    return fallback;
  }

  const firstRow = rows[0];
  const firstKey = Object.keys(firstRow)[0];
  const value = firstRow[firstKey];
  return value === null || typeof value === "undefined" ? fallback : value;
}

async function importDataIfEmpty() {
  try {
    console.log("Checking if tables are empty...");

    const coursesCount = await safeScalar("SELECT COUNT(*) AS c FROM courses", null);

    if (coursesCount === null) {
      console.log("[dataImport] Table 'courses' not found. Skip importing. Please run /createTable first.");
      return;
    }

    if (Number(coursesCount) > 0) {
      console.log("[dataImport] Data already exists. Skipping import.");
      return;
    }

    console.log("[dataImport] Importing expanded demo data for English Center...");
    const summary = await seedDemoCenterData({ onlyWhenEmpty: true });
    console.log("[dataImport] Demo data imported successfully:", summary);
  } catch (err) {
    console.error("Error checking tables:", err);
  }
}

module.exports = { importDataIfEmpty };
