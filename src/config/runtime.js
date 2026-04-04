function firstNonEmpty(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim() !== "") {
      return value;
    }
  }

  return "";
}

function firstDefined(...values) {
  for (const value of values) {
    if (typeof value !== "undefined") {
      return value;
    }
  }

  return undefined;
}

function resolveDatabaseConfig() {
  const host = firstNonEmpty(process.env.DB_HOST, process.env.MYSQLHOST) || "localhost";
  const user = firstNonEmpty(process.env.DB_USER, process.env.MYSQLUSER) || "root";
  const database =
    firstNonEmpty(process.env.DB_NAME, process.env.MYSQLDATABASE) || "student_platform";
  const rawPassword = firstDefined(process.env.DB_PASS, process.env.MYSQLPASSWORD);
  const rawPort = firstNonEmpty(process.env.DB_PORT, process.env.MYSQLPORT) || "3306";
  const rawConnectTimeout = firstNonEmpty(process.env.DB_CONNECT_TIMEOUT_MS) || "10000";
  const rawStartupWaitMs = firstNonEmpty(process.env.DB_STARTUP_WAIT_MS) || "60000";
  const rawStartupRetryDelayMs =
    firstNonEmpty(process.env.DB_STARTUP_RETRY_DELAY_MS) || "2000";

  return {
    host,
    user,
    password: typeof rawPassword === "undefined" ? "" : rawPassword,
    database,
    port: Number(rawPort || 3306),
    connectTimeout: Number(rawConnectTimeout || 10000),
    startupWaitMs: Number(rawStartupWaitMs || 60000),
    startupRetryDelayMs: Number(rawStartupRetryDelayMs || 2000),
  };
}

function resolvePort() {
  return Number(process.env.PORT || 4207);
}

module.exports = {
  resolveDatabaseConfig,
  resolvePort,
};
