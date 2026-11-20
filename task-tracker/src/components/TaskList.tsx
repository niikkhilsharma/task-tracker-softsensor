import type { Task } from "../api";
import TaskCard from "./TaskCard";

// Shows the loading, empty, error, or populated task list.
export default function TaskList({
  tasks,
  error,
  filtered,
  onUpdated,
  onDeleted,
}: {
  tasks: Task[] | null;
  error: string | null;
  filtered: boolean;
  onUpdated: (task: Task) => void;
  onDeleted: (id: string) => void;
}) {
  if (error) {
    return (
      <p className="rounded-lg border border-red-700 bg-zinc-100 px-3.5 py-3 dark:bg-zinc-900">
        {error}
      </p>
    );
  }

  if (!tasks) {
    return (
      <p className="rounded-lg border border-zinc-200 bg-zinc-100 px-3.5 py-3 dark:border-zinc-800 dark:bg-zinc-900">
        Loading tasks…
      </p>
    );
  }

  if (tasks.length === 0) {
    return (
      <p className="rounded-lg border border-zinc-200 bg-zinc-100 px-3.5 py-3 dark:border-zinc-800 dark:bg-zinc-900">
        {filtered ? "No tasks in this status." : "No tasks yet."}
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} onUpdated={onUpdated} onDeleted={onDeleted} />
      ))}
    </ul>
  );
}
