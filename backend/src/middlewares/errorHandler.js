// Turns an invalid JSON body into a 400 response.
function errorHandler(error, req, res, next) {
  if (error.type === "entity.parse.failed") {
    res.status(400).json({ error: "Request body must be valid JSON" });
    return;
  }

  next(error);
}

module.exports = {
  errorHandler,
};
