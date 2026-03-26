const { ensureApplicationSchema } = require("../services/bootstrapService");
const { ensureApplicationData } = require("../models/dataImport");

async function ensureSchemaReady(req, res, next) {
  try {
    await ensureApplicationSchema();
    await ensureApplicationData();
    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = ensureSchemaReady;
