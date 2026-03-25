function shouldExposeErrorDetails() {
  return String(process.env.EXPOSE_ERROR_DETAILS || "").trim().toLowerCase() === "true";
}

function resolvePublicErrorMessage(error, fallbackMessage) {
  if (shouldExposeErrorDetails() && error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}

function sendPublicError(res, error, statusCode = 500, fallbackMessage = "Da xay ra loi.") {
  return res.status(statusCode).send(resolvePublicErrorMessage(error, fallbackMessage));
}

function sendPublicJsonError(
  res,
  error,
  statusCode = 500,
  fallbackMessage = "Da xay ra loi."
) {
  return res.status(statusCode).json({
    ok: false,
    message: resolvePublicErrorMessage(error, fallbackMessage),
  });
}

module.exports = {
  resolvePublicErrorMessage,
  sendPublicError,
  sendPublicJsonError,
};
