const express = require("express");
const cors = require("cors");
const { errorHandler } = require("./middlewares/errorHandler");
const { taskRoutes } = require("./routes/taskRoutes");

// Builds the Express app and registers global middleware.
function createApp(contract) {
  const app = express();

  app.use(
    cors({
      origin: "http://localhost:5173",
    }),
  );
  app.use(express.json());

  app.get("/", (req, res) => {
    res.send("Hello World!");
  });
  app.use("/tasks", taskRoutes(contract));
  app.use(errorHandler);

  return app;
}

module.exports = {
  createApp,
};
