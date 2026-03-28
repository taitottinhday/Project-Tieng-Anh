require('dotenv').config();
const app = require('./src/app');
const { importDataIfEmpty } = require('./src/models/dataImport');
const { resolveDatabaseConfig, resolvePort } = require('./src/config/runtime');
const { ensureApplicationSchema } = require('./src/services/bootstrapService');

const PORT = resolvePort();
const databaseConfig = resolveDatabaseConfig();

function formatStartupError(error) {
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

  if (code === 'EADDRINUSE') {
    return (
      `Port ${PORT} is already in use. ` +
      'Stop the other process using this port, or change PORT in .env.'
    );
  }

  return '';
}

function listen(appInstance, port) {
  return new Promise((resolve, reject) => {
    const server = appInstance.listen(port, () => resolve(server));
    server.on('error', reject);
  });
}

async function startServer() {
  console.log(
    `Starting app on port ${PORT} with database ${databaseConfig.database}@${databaseConfig.host}:${databaseConfig.port}`
  );

  await ensureApplicationSchema();
  await importDataIfEmpty();
  await listen(app, PORT);

  console.log(`Server running on internal port ${PORT}`);
}

startServer().catch(err => {
  console.error('Application startup failed:', err);
  const formattedError = formatStartupError(err);
  if (formattedError) {
    console.error(`[startup] ${formattedError}`);
  }
  process.exit(1);
});
