const express = require("express");
const cors = require("cors");
const { errorHandler } = require("./middlewares/errorHandler");
const { taskRoutes } = require("./routes/taskRoutes");
const { logError } = require("./utils/logError");

const allowedOrigins = [
  "http://localhost:5173",
  "https://task-tracker-alpha-henna.vercel.app",
];

let pending;

// Builds the Express app and registers global middleware.
function createApp(contract) {
  const app = express();

  app.use(
    cors({
      origin: allowedOrigins,
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

// Builds the API once, then reuses the app and its MongoDB connection.
function getApp() {
  if (!pending) {
    pending = buildApp().catch((error) => {
      pending = undefined;
      throw error;
    });
  }

  return pending;
}

async function buildApp() {
  require("./config/env");
  const { loadContract } = require("./config/contract");
  const { connectDb } = require("./config/db");
  const { ensureTasksCollection } = require("./models/task");
  const contract = await loadContract();
  const db = await connectDb();
  await ensureTasksCollection(db, contract);
  return createApp(contract);
}

// Handles one request for Vercel. The platform calls this function directly.
async function handler(req, res) {
  try {
    const app = await getApp();
    app(req, res);
  } catch (error) {
    logError(error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Could not connect to the database" });
    }
  }
}

module.exports = handler;
module.exports.createApp = createApp;
