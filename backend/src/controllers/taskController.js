const { deleteTask, findTasks, insertTask, updateTask: saveTask } = require("../models/task");
const { buildTask, statusFilter, taskUpdate } = require("../services/taskService");
const { toTask } = require("../utils/taskFormatter");
const { logError } = require("../utils/logError");

// Returns every task, or only those matching a valid status filter.
function listTasks(contract) {
  return async (req, res) => {
    const { error, status } = statusFilter(req.query, contract);
    if (error) {
      res.status(400).json({ error });
      return;
    }

    try {
      const tasks = await findTasks(status);
      res.json(tasks.map(toTask));
    } catch (listError) {
      logError(listError);
      res.status(500).json({ error: "Could not list tasks" });
    }
  };
}

// Creates a task. Title is required; status and priority fall back to defaults.
function createTask(contract) {
  return async (req, res) => {
    const { error, task } = buildTask(req.body, contract);
    if (error) {
      res.status(400).json({ error });
      return;
    }

    try {
      const saved = await insertTask(task);
      res.status(201).json(toTask(saved));
    } catch (createError) {
      logError(createError);
      res.status(500).json({ error: "Could not create task" });
    }
  };
}

// Changes a task's status, title, or description. A missing task returns 404.
function updateTask(contract) {
  return async (req, res) => {
    const { error, set, unset } = taskUpdate(req.body, contract);
    if (error) {
      res.status(400).json({ error });
      return;
    }

    try {
      const saved = await saveTask(req.params.id, { set, unset });
      if (!saved) {
        res.status(404).json({ error: "Task not found" });
        return;
      }
      res.json(toTask(saved));
    } catch (updateError) {
      logError(updateError);
      res.status(500).json({ error: "Could not update task" });
    }
  };
}

// Removes one task. A missing task returns 404.
function removeTask() {
  return async (req, res) => {
    try {
      const deleted = await deleteTask(req.params.id);
      if (!deleted) {
        res.status(404).json({ error: "Task not found" });
        return;
      }
      res.status(204).send();
    } catch (deleteError) {
      logError(deleteError);
      res.status(500).json({ error: "Could not delete task" });
    }
  };
}

module.exports = {
  listTasks,
  createTask,
  updateTask,
  removeTask,
};
