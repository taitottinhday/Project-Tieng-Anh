const crypto = require("crypto");

const runtimeFallbackSecret = crypto.randomBytes(32).toString("hex");

function getPaymentLinkSecret() {
  const configuredSecret = String(
    process.env.PAYMENT_LINK_SECRET || process.env.SESSION_SECRET || ""
  ).trim();

  return configuredSecret || runtimeFallbackSecret;
}

function createEnrollmentAccessToken(enrollmentId) {
  const normalizedId = String(Number(enrollmentId) || "");

  if (!normalizedId) {
    return "";
  }

  return crypto
    .createHmac("sha256", getPaymentLinkSecret())
    .update(normalizedId)
    .digest("hex");
}

function verifyEnrollmentAccessToken(enrollmentId, token) {
  const expected = createEnrollmentAccessToken(enrollmentId);
  const provided = String(token || "").trim().toLowerCase();

  if (!expected || !provided) {
    return false;
  }

  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(provided));
  } catch {
    return false;
  }
}

module.exports = {
  createEnrollmentAccessToken,
  verifyEnrollmentAccessToken,
};
