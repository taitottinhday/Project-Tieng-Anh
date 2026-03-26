const db = require("./db");
const {
  ensureDemoContactMessages,
  seedDemoCenterData,
} = require("../services/demoSeedService");

let applicationDataReady = false;
let applicationDataPromise = null;

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
  if (applicationDataReady) {
    return;
  }

  if (!applicationDataPromise) {
    applicationDataPromise = (async () => {
      console.log("Checking if application data needs hydration...");

      const coursesCount = await safeScalar("SELECT COUNT(*) AS c FROM courses", null);

      if (coursesCount === null) {
        console.log("[dataImport] Table 'courses' not found. Skip importing. Please run /createTable first.");
        return;
      }

      const paymentsCount = await safeScalar("SELECT COUNT(*) AS c FROM payments", 0);
      const messagesCount = await safeScalar("SELECT COUNT(*) AS c FROM messages", 0);
      const shouldSeedCenter = Number(coursesCount) === 0 || Number(paymentsCount) === 0;

      if (shouldSeedCenter) {
        console.log("[dataImport] Hydrating demo center data...");
        const summary = await seedDemoCenterData({ onlyWhenEmpty: false });
        console.log("[dataImport] Demo center data ready:", summary);
      } else {
        console.log("[dataImport] Core demo center data already available.");
      }

      if (Number(messagesCount) === 0) {
        const inserted = await ensureDemoContactMessages();
        console.log(`[dataImport] Demo contact messages inserted: ${inserted}`);
      } else {
        console.log("[dataImport] Contact messages already available.");
      }

      applicationDataReady = true;
    })().catch((err) => {
      applicationDataPromise = null;
      console.error("Error checking application data:", err);
      throw err;
    });
  }

  await applicationDataPromise;
}

module.exports = {
  importDataIfEmpty,
  ensureApplicationData: importDataIfEmpty,
};
