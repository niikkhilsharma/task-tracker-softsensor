// Logs a failure without printing the database connection string.
function logError(error) {
  const message = error instanceof Error ? error.message : "Request failed";
  console.error(message.replace(/mongodb(\+srv)?:\/\/\S+/gi, "mongodb://***"));
}

module.exports = {
  logError,
};
