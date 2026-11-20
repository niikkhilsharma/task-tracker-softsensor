import { useEffect, useState } from "react";
import type { TaskStatus } from "../../shared/taskContract.mjs";
import { getTasks, type Task } from "./api";
import CreateTaskForm from "./components/CreateTaskForm";
import StatusFilter from "./components/StatusFilter";
import TaskList from "./components/TaskList";
import { countTasks } from "./utils/countTasks";

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
        const nextTasks = await getTasks();
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
  }, []);

  function addTask(task: Task) {
    setTasks((current) => (current ? [task, ...current] : [task]));
  }

  function replaceTask(task: Task) {
    setTasks((current) =>
      current ? current.map((item) => (item.id === task.id ? task : item)) : null,
    );
  }

  function removeTask(id: string) {
    setTasks((current) => current?.filter((item) => item.id !== id) ?? null);
  }

  return (
    <main className="mx-auto min-h-svh w-full max-w-5xl border-x border-zinc-200">
      <div className="mx-auto w-full max-w-xl px-6 pt-12 pb-16">
        <h1 className="mb-4 text-4xl font-medium tracking-tight text-zinc-950">
          Task tracker
        </h1>
        <CreateTaskForm onCreated={addTask} />
        <div className="mt-8">
          <StatusFilter value={status} counts={tasks ? countTasks(tasks) : null} onChange={setStatus} />
          <TaskList
            tasks={tasks?.filter((task) => status === null || task.status === status) ?? null}
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
