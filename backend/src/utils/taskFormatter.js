// Turns a stored task into the API response.
function toTask(doc) {
  const task = {
    id: doc._id.toString(),
    title: doc.title,
    status: doc.status,
    priority: doc.priority,
    createdAt: doc.createdAt.toISOString(),
  };

  if (typeof doc.description === "string") {
    task.description = doc.description;
  }

  return task;
}

module.exports = {
  toTask,
};
