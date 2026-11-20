import type { TaskStatus } from "../../../shared/taskContract.mjs";
import type { Task } from "../api";

export type StatusCounts = Record<TaskStatus | "all", number>;

// Counts tasks for All and each status.
export function countTasks(tasks: Task[]): StatusCounts {
  const counts: StatusCounts = { all: tasks.length, todo: 0, in_progress: 0, done: 0 };

  for (const task of tasks) {
    counts[task.status] += 1;
  }

  return counts;
}
