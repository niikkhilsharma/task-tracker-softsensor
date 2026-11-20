const mongoose = require("mongoose");

let Task;

function taskModel() {
  if (!Task) {
    throw new Error("Task model is not ready");
  }

  return Task;
}

// Registers the Mongoose task model from the shared status and priority rules.
function ensureTasksCollection(_connection, contract) {
  if (Task) {
    return Task;
  }

  const schema = new mongoose.Schema(
    {
      title: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: contract.titleMaxLength,
        trim: true,
      },
      description: {
        type: String,
        trim: true,
      },
      status: {
        type: String,
        required: true,
        enum: [...contract.statuses],
      },
      priority: {
        type: String,
        required: true,
        enum: [...contract.priorities],
      },
      createdAt: {
        type: Date,
        required: true,
      },
    },
    { collection: "tasks", versionKey: false },
  );

  Task = mongoose.models.Task || mongoose.model("Task", schema);
  return Task;
}

// Returns tasks, optionally limited to one status, oldest first.
function findTasks(status) {
  const filter = status ? { status } : {};
  return taskModel().find(filter).sort({ createdAt: 1 }).lean();
}

// Updates one task's status and returns the stored document, or null when it is missing.
function updateTaskStatus(id, status) {
  if (typeof id !== "string" || !mongoose.isValidObjectId(id)) {
    return null;
  }

  return taskModel().findByIdAndUpdate(
    id,
    { status },
    { returnDocument: "after", lean: true },
  );
}

// Deletes one task. Returns false when the id is missing or invalid.
async function deleteTask(id) {
  if (typeof id !== "string" || !mongoose.isValidObjectId(id)) {
    return false;
  }

  const result = await taskModel().deleteOne({ _id: id });
  return result.deletedCount === 1;
}

// Saves a task and returns the stored document.
async function insertTask(task) {
  const doc = await taskModel().create(task);
  return doc.toObject();
}

// Inserts a temporary task, reads it back, then deletes it.
async function roundTripTask() {
  const doc = {
    title: "Connection check",
    description: "Temporary document to verify MongoDB",
    status: "todo",
    priority: "medium",
    createdAt: new Date(),
  };
  const created = await taskModel().create(doc);
  const found = await taskModel().findById(created._id).lean();
  await taskModel().deleteOne({ _id: created._id });

  if (!found || found.title !== doc.title) {
    throw new Error("Task round trip failed");
  }

  return found.title;
}

module.exports = {
  ensureTasksCollection,
  findTasks,
  deleteTask,
  insertTask,
  updateTaskStatus,
  roundTripTask,
};
