import { Clock, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  TASK_STATUSES,
  type TaskStatus,
} from "../../../shared/taskContract.mjs";
import { deleteTask, updateTaskStatus, type Task } from "../api";
import { formatCreatedAt } from "../utils/formatCreatedAt";
import EditTaskDialog from "./EditTaskDialog";
import Dialog from "./ui/Dialog";

// Lets one task be edited, change status, or be deleted after confirmation.
export default function TaskCard({
  task,
  onUpdated,
  onDeleted,
}: {
  task: Task;
  onUpdated: (task: Task) => void;
  onDeleted: (id: string) => void;
}) {
  const [status, setStatus] = useState(task.status);
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  async function handleStatusChange(nextStatus: TaskStatus) {
    const previousStatus = status;
    setStatus(nextStatus);
    setSaving(true);
    setStatusError(null);

    try {
      const updated = await updateTaskStatus(task.id, nextStatus);
      setStatus(updated.status);
      onUpdated(updated);
      if (updated.status === "done" && previousStatus !== "done") {
        toast.success(`${updated.title} marked as done`);
      }
    } catch (updateError: unknown) {
      setStatus(previousStatus);
      setStatusError(updateError instanceof Error ? updateError.message : "Could not update task");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setDeleteError(null);

    try {
      await deleteTask(task.id);
      toast.success(`${task.title} deleted`);
      onDeleted(task.id);
    } catch (deleteFailure: unknown) {
      setDeleteError(
        deleteFailure instanceof Error ? deleteFailure.message : "Could not delete task",
      );
    } finally {
      setDeleting(false);
    }
  }

  const done = status === "done";
  const quietText = done ? "text-zinc-400" : "";

  return (
    <li className="rounded-lg border border-zinc-200 px-3.5 py-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2
            className={`text-lg font-medium ${done ? "text-zinc-500 line-through" : "text-zinc-950"}`}
          >
            {task.title}
          </h2>
          {task.description ? <p className={`mt-1 ${quietText}`}>{task.description}</p> : null}
          <p className={`mt-2 text-sm ${quietText}`}>{PRIORITY_LABELS[task.priority]}</p>
          <p className={`mt-1 flex items-center gap-1.5 text-sm ${quietText}`}>
            <time dateTime={task.createdAt}>{formatCreatedAt(task.createdAt)}</time>
            <Clock className="size-3.5" aria-hidden="true" />
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2">
          <label className="flex flex-col gap-1 text-sm">
            Status
            <select
              aria-label={`Status for ${task.title}`}
              value={status}
              disabled={saving || deleting || savingEdit}
              onChange={(event) => handleStatusChange(event.target.value as TaskStatus)}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-950 disabled:opacity-60"
            >
              {TASK_STATUSES.map((option) => (
                <option key={option} value={option}>
                  {STATUS_LABELS[option]}
                </option>
              ))}
            </select>
          </label>
          <div className="grid w-full grid-cols-2 gap-2">
            <button
              type="button"
              aria-label={`Edit ${task.title}`}
              onClick={() => setEditing(true)}
              disabled={saving || deleting}
              className="flex items-center justify-center rounded-lg border border-zinc-300 p-2 disabled:opacity-60"
            >
              <Pencil className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label={`Delete ${task.title}`}
              onClick={() => {
                setConfirming(true);
                setDeleteError(null);
              }}
              disabled={saving}
              className="flex items-center justify-center rounded-lg bg-red-700 p-2 text-white disabled:opacity-60"
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
      {statusError ? (
        <p className="mt-2 text-sm text-red-700">{statusError}</p>
      ) : null}
      <EditTaskDialog
        task={task}
        status={status}
        open={editing}
        onClose={() => setEditing(false)}
        onUpdated={(updated) => {
          setStatus(updated.status);
          onUpdated(updated);
        }}
        onBusyChange={setSavingEdit}
      />
      <Dialog
        open={confirming}
        title="Delete this task?"
        description={`This will remove “${task.title}”.`}
        busy={deleting}
        onClose={() => setConfirming(false)}
      >
        {deleteError ? (
          <p className="mb-3 text-sm text-red-700">{deleteError}</p>
        ) : null}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setConfirming(false)}
            disabled={deleting}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            aria-label={`Confirm delete ${task.title}`}
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-lg bg-red-700 px-3 py-1.5 text-sm text-white disabled:opacity-60"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </Dialog>
    </li>
  );
}
