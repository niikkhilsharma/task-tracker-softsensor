require("./src/config/env");

const { createApp } = require("./src/app");
const { loadContract } = require("./src/config/contract");
const { connectDb } = require("./src/config/db");
const { ensureTasksCollection } = require("./src/models/task");
const { logError } = require("./src/utils/logError");

// Connects to MongoDB and starts the HTTP server.
async function start() {
  try {
    const contract = await loadContract();
    const db = await connectDb();
    await ensureTasksCollection(db, contract);
    console.log(`Connected to MongoDB database "${db.name}"`);

    const app = createApp(contract);
    app.listen(3000, () => {
      console.log("Server running on port 3000");
    });
  } catch (error) {
    logError(error);
    process.exit(1);
  }
}

start();
