// Checks a create-task body and returns a document ready to save.
function buildTask(body, contract) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "Request body must be an object" };
  }

  if (typeof body.title !== "string" || body.title.trim() === "") {
    return { error: "Title is required" };
  }

  const title = body.title.trim();
  if (title.length > contract.titleMaxLength) {
    return {
      error: `Title must be at most ${contract.titleMaxLength} characters`,
    };
  }

  if (body.description !== undefined && typeof body.description !== "string") {
    return { error: "Description must be a string" };
  }

  if (body.status !== undefined && !contract.statuses.includes(body.status)) {
    return { error: "Status must be todo, in_progress, or done" };
  }

  if (
    body.priority !== undefined &&
    !contract.priorities.includes(body.priority)
  ) {
    return { error: "Priority must be low, medium, or high" };
  }

  const task = {
    title,
    status: body.status ?? contract.defaultStatus,
    priority: body.priority ?? contract.defaultPriority,
    createdAt: new Date(),
  };

  if (typeof body.description === "string" && body.description.trim() !== "") {
    task.description = body.description.trim();
  }

  return { task };
}

// Reads the optional status query and rejects a value outside the allowed list.
function statusFilter(query, contract) {
  const status = query?.status;
  if (status === undefined) {
    return {};
  }

  if (typeof status !== "string" || !contract.statuses.includes(status)) {
    return { error: "Status must be todo, in_progress, or done" };
  }

  return { status };
}

// Checks a status update and returns the new status.
function statusUpdate(body, contract) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "Request body must be an object" };
  }

  if (typeof body.status !== "string" || !contract.statuses.includes(body.status)) {
    return { error: "Status must be todo, in_progress, or done" };
  }

  return { status: body.status };
}

module.exports = {
  buildTask,
  statusFilter,
  statusUpdate,
};
