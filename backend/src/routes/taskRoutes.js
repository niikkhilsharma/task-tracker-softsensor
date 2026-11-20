const express = require("express");
const {
  createTask,
  listTasks,
  removeTask,
  updateTask,
} = require("../controllers/taskController");

// Maps task endpoints to their controllers.
function taskRoutes(contract) {
  const router = express.Router();
  router.get("/", listTasks(contract));
  router.post("/", createTask(contract));
  router.patch("/:id", updateTask(contract));
  router.delete("/:id", removeTask());
  return router;
}

module.exports = {
  taskRoutes,
};
