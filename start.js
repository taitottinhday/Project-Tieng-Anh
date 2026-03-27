require('dotenv').config();
const app = require('./src/app');
const { importDataIfEmpty } = require('./src/models/dataImport');
const { resolveDatabaseConfig, resolvePort } = require('./src/config/runtime');
const { ensureApplicationSchema } = require('./src/services/bootstrapService');

const PORT = resolvePort();
const databaseConfig = resolveDatabaseConfig();

function formatBootstrapError(error) {
  const code = String(error?.code || '').trim().toUpperCase();

  if (code === 'ECONNREFUSED') {
    return (
      `Could not connect to MySQL at ${databaseConfig.host}:${databaseConfig.port}. ` +
      'Start your MySQL/MariaDB server, or update DB_HOST/DB_PORT in .env to the correct host and port.'
    );
  }

  if (code === 'ER_ACCESS_DENIED_ERROR') {
    return (
      `MySQL rejected the credentials for user "${databaseConfig.user}". ` +
      'Check DB_USER and DB_PASS in .env.'
    );
  }

  if (code === 'ER_BAD_DB_ERROR') {
    return (
      `The database "${databaseConfig.database}" does not exist yet. ` +
      'Create it first, then restart the app.'
    );
  }

  if (code === 'ENOTFOUND') {
    return (
      `The database host "${databaseConfig.host}" could not be resolved. ` +
      'Check DB_HOST in .env.'
    );
  }

  return '';
}

async function startServer() {
  console.log(
    `Starting app on port ${PORT} with database ${databaseConfig.database}@${databaseConfig.host}:${databaseConfig.port}`
  );

  app.listen(PORT, () => {
    console.log(`Server running on internal port ${PORT}`);
  });

  try {
    await ensureApplicationSchema();
    await importDataIfEmpty();
  } catch (err) {
    console.error('Startup bootstrap failed. Server is still running, but database-backed features may be degraded:', err);
    const formattedError = formatBootstrapError(err);
    if (formattedError) {
      console.error(`[startup] ${formattedError}`);
    }
  }
}

startServer().catch(err => {
  console.error('Application startup failed:', err);
  process.exit(1);
});
