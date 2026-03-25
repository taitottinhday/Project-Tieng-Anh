require('dotenv').config();
const app = require('./src/app');
const { importDataIfEmpty } = require('./src/models/dataImport');
const { resolveDatabaseConfig, resolvePort } = require('./src/config/runtime');
const { ensureApplicationSchema } = require('./src/services/bootstrapService');

const PORT = resolvePort();
const databaseConfig = resolveDatabaseConfig();

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
  }
}

startServer().catch(err => {
  console.error('Application startup failed:', err);
  process.exit(1);
});
