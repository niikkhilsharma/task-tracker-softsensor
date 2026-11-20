const mongoose = require("mongoose");

const DATABASE_NAME = "task_tracker";

// Opens the MongoDB connection named in MONGODB_URI.
async function connectDb(dbName = DATABASE_NAME) {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set");
  }

  try {
    await mongoose.connect(uri, {
      dbName,
      serverSelectionTimeoutMS: 10000,
      autoSelectFamily: false,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("alert internal error")) {
      throw new Error(
        "Could not connect to MongoDB. Confirm the Atlas cluster is running and this computer's current IP is allowed in Network Access.",
      );
    }
    throw error;
  }

  return mongoose.connection;
}

// Closes the MongoDB connection.
async function closeDb() {
  if (mongoose.connection.readyState === 0) {
    return;
  }

  await mongoose.disconnect();
}

module.exports = {
  connectDb,
  closeDb,
};
