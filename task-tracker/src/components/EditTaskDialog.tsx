import { useEffect, useState, type FormEvent } from "react";
import { toast } from "react-toastify";
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  TASK_PRIORITIES,
  TASK_STATUSES,
  type TaskPriority,
  type TaskStatus,
} from "../../../shared/taskContract.mjs";
import { updateTaskDetails, type Task } from "../api";
import Dialog from "./ui/Dialog";

const fieldClass =
  "rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-950";

// Edits a task's title, description, status, and priority.
export default function EditTaskDialog({
  task,
  status,
  open,
  onClose,
  onUpdated,
  onBusyChange,
}: {
  task: Task;
  status: TaskStatus;
  open: boolean;
  onClose: () => void;
  onUpdated: (task: Task) => void;
  onBusyChange: (busy: boolean) => void;
}) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [editStatus, setEditStatus] = useState(status);
  const [priority, setPriority] = useState(task.priority);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle(task.title);
    setDescription(task.description ?? "");
    setEditStatus(status);
    setPriority(task.priority);
    setError(null);
  }, [open, task, status]);

  useEffect(() => {
    onBusyChange(saving);
  }, [saving, onBusyChange]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const updated = await updateTaskDetails(task.id, {
        title,
        description,
        status: editStatus,
        priority,
      });
      onUpdated(updated);
      toast.success(`${updated.title} updated`);
      onClose();
    } catch (editFailure: unknown) {
      setError(editFailure instanceof Error ? editFailure.message : "Could not update task");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} title="Edit task" busy={saving} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
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
            disabled={saving}
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
            disabled={saving}
            className={fieldClass}
          />
        </label>
        <div className="flex flex-col gap-1 text-sm">
          <span>Status</span>
          <div role="group" aria-label="Status" className="flex flex-wrap gap-2">
            {TASK_STATUSES.map((option) => {
              const selected = option === editStatus;
              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={selected}
                  disabled={saving}
                  onClick={() => setEditStatus(option)}
                  className={`rounded-full px-2.5 py-1 text-sm disabled:opacity-60 ${
                    selected
                      ? "bg-zinc-950 text-white"
                      : "border border-zinc-300"
                  }`}
                >
                  {STATUS_LABELS[option]}
                </button>
              );
            })}
          </div>
        </div>
        <label className="flex flex-col gap-1 text-sm">
          Priority
          <select
            value={priority}
            onChange={(event) => setPriority(event.target.value as TaskPriority)}
            disabled={saving}
            className={fieldClass}
          >
            {TASK_PRIORITIES.map((option) => (
              <option key={option} value={option}>
                {PRIORITY_LABELS[option]}
              </option>
            ))}
          </select>
        </label>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-zinc-950 px-3 py-1.5 text-sm text-white disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
