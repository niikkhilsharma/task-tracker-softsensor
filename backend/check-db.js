require("./src/config/env");

const { loadContract } = require("./src/config/contract");
const { connectDb, closeDb } = require("./src/config/db");
const { ensureTasksCollection, roundTripTask } = require("./src/models/task");
const { logError } = require("./src/utils/logError");

// Connects, saves one task, reads it back, and removes it.
async function main() {
  try {
    const contract = await loadContract();
    const db = await connectDb();
    await ensureTasksCollection(db, contract);
    const title = await roundTripTask();
    console.log(`Connected to database "${db.name}"`);
    console.log(`Inserted and read task: ${title}`);
  } catch (error) {
    logError(error);
    process.exitCode = 1;
  } finally {
    await closeDb();
  }
}

main();
