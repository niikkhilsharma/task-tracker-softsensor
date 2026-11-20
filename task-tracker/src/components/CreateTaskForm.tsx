import { useState, type FormEvent } from "react";
import { toast } from "react-toastify";
import {
  DEFAULT_PRIORITY,
  DEFAULT_STATUS,
  PRIORITY_LABELS,
  STATUS_LABELS,
  TASK_PRIORITIES,
  TASK_STATUSES,
  type TaskPriority,
  type TaskStatus,
} from "../../../shared/taskContract.mjs";
import { createTask, type Task } from "../api";

const fieldClass =
  "rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-950";

// Sends a new task to the API and resets the fields after it is saved.
export default function CreateTaskForm({ onCreated }: { onCreated: (task: Task) => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>(DEFAULT_STATUS);
  const [priority, setPriority] = useState<TaskPriority>(DEFAULT_PRIORITY);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const task = await createTask({
        title,
        description,
        status,
        priority,
      });
      onCreated(task);
      toast.success(`${task.title} created`);
      setTitle("");
      setDescription("");
      setStatus(DEFAULT_STATUS);
      setPriority(DEFAULT_PRIORITY);
    } catch (submitError: unknown) {
      setError(submitError instanceof Error ? submitError.message : "Could not create task");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm">
        <span>
          Title
          <sup className="text-red-700" aria-hidden="true">
            *
          </sup>
        </span>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
          aria-required="true"
          className={fieldClass}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span>
          Description <span className="text-zinc-500">(optional)</span>
        </span>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
          className={fieldClass}
        />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Status
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as TaskStatus)}
            className={fieldClass}
          >
            {TASK_STATUSES.map((option) => (
              <option key={option} value={option}>
                {STATUS_LABELS[option]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Priority
          <select
            value={priority}
            onChange={(event) => setPriority(event.target.value as TaskPriority)}
            className={fieldClass}
          >
            {TASK_PRIORITIES.map((option) => (
              <option key={option} value={option}>
                {PRIORITY_LABELS[option]}
              </option>
            ))}
          </select>
        </label>
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-zinc-950 px-4 py-2 text-white disabled:opacity-60"
      >
        {saving ? "Saving…" : "Add task"}
      </button>
    </form>
  );
}
