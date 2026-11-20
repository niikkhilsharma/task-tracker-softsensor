import { useEffect, useState } from "react";
import type { TaskStatus } from "../../shared/taskContract.mjs";
import { getTasks, type Task } from "./api";
import CreateTaskForm from "./components/CreateTaskForm";
import StatusFilter from "./components/StatusFilter";
import TaskList from "./components/TaskList";

function App() {
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<TaskStatus | null>(null);

  useEffect(() => {
    let active = true;
    setTasks(null);
    setError(null);

    async function loadTasks() {
      try {
        const nextTasks = await getTasks(status ?? undefined);
        if (!active) return;
        setTasks(nextTasks);
      } catch (loadError: unknown) {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : "Could not load tasks");
      }
    }

    void loadTasks();

    return () => {
      active = false;
    };
  }, [status]);

  function matchesFilter(task: Task) {
    return status === null || task.status === status;
  }

  function addTask(task: Task) {
    if (!matchesFilter(task)) return;
    setTasks((current) => (current ? [...current, task] : [task]));
  }

  function replaceTask(task: Task) {
    setTasks((current) => {
      if (!current) return null;
      if (!matchesFilter(task)) return current.filter((item) => item.id !== task.id);
      return current.map((item) => (item.id === task.id ? task : item));
    });
  }

  function removeTask(id: string) {
    setTasks((current) => current?.filter((item) => item.id !== id) ?? null);
  }

  return (
    <main className="mx-auto min-h-svh w-full max-w-5xl border-x border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto w-full max-w-xl px-6 pt-12 pb-16">
        <h1 className="mb-4 text-4xl font-medium tracking-tight text-zinc-950 dark:text-zinc-100">
          Task tracker
        </h1>
        <CreateTaskForm onCreated={addTask} />
        <div className="mt-8">
          <StatusFilter value={status} onChange={setStatus} />
          <TaskList
            tasks={tasks}
            error={error}
            filtered={status !== null}
            onUpdated={replaceTask}
            onDeleted={removeTask}
          />
        </div>
      </div>
    </main>
  );
}

export default App;
