const { ensureApplicationSchema } = require("../services/bootstrapService");

async function ensureSchemaReady(req, res, next) {
  try {
    await ensureApplicationSchema();
    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = ensureSchemaReady;
