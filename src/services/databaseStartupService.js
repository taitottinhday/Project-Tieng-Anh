const mysql = require("mysql2/promise");
const { resolveDatabaseConfig } = require("../config/runtime");

const RETRYABLE_CODES = new Set([
  "ECONNREFUSED",
  "ECONNRESET",
  "ETIMEDOUT",
  "EPIPE",
  "PROTOCOL_CONNECTION_LOST",
  "PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR",
]);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableDatabaseError(error) {
  const code = String(error?.code || "").trim().toUpperCase();
  return RETRYABLE_CODES.has(code);
}

async function pingDatabase(databaseConfig) {
  const connection = await mysql.createConnection({
    host: databaseConfig.host,
    user: databaseConfig.user,
    password: databaseConfig.password,
    database: databaseConfig.database,
    port: databaseConfig.port,
    connectTimeout: databaseConfig.connectTimeout,
  });

  try {
    await connection.query("SELECT 1");
  } finally {
    await connection.end().catch(() => {});
  }
}

async function waitForDatabaseReady() {
  const databaseConfig = resolveDatabaseConfig();
  const startedAt = Date.now();
  const deadline = startedAt + databaseConfig.startupWaitMs;
  let attempt = 0;
  let lastError = null;

  while (Date.now() <= deadline) {
    attempt += 1;

    try {
      await pingDatabase(databaseConfig);
      return {
        attempts: attempt,
        waitedMs: Date.now() - startedAt,
      };
    } catch (error) {
      lastError = error;

      if (!isRetryableDatabaseError(error)) {
        throw error;
      }

      const remainingMs = deadline - Date.now();
      if (remainingMs <= 0) {
        break;
      }

      if (attempt === 1) {
        console.warn(
          `[startup] MySQL is not ready yet (${error.code || error.message}). ` +
            `Waiting up to ${databaseConfig.startupWaitMs}ms for it to come online...`
        );
      } else {
        console.warn(
          `[startup] MySQL still unavailable after ${attempt} attempts ` +
            `(${error.code || error.message}). Retrying in ${databaseConfig.startupRetryDelayMs}ms...`
        );
      }

      await sleep(Math.min(databaseConfig.startupRetryDelayMs, remainingMs));
    }
  }

  if (lastError) {
    throw lastError;
  }
}

module.exports = {
  waitForDatabaseReady,
};
