import type { Task, TaskPriority, TaskStatus } from "../../shared/taskContract.mjs";

const DEPLOYED_API_URL = "https://task-tracker-softsensor-backend.vercel.app";

// Uses a build-time API address, the local API on this machine, or the deployed API.
function resolveApiUrl() {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window === "undefined") return "http://localhost:3000";

  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1") return "http://localhost:3000";
  return DEPLOYED_API_URL;
}

export const API_URL = resolveApiUrl();

export type NewTask = {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
};

async function readError(response: Response): Promise<string> {
  let message = `API returned ${response.status}`;
  try {
    const body = (await response.json()) as { error?: string };
    if (body.error) message = body.error;
  } catch {
    // The error response was not JSON.
  }
  return message;
}

// Loads every task, or only the tasks with one status.
export async function getTasks(status?: TaskStatus): Promise<Task[]> {
  const url = new URL(`${API_URL}/tasks`);
  if (status) url.searchParams.set("status", status);

  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    throw new Error("Could not reach the API");
  }

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return response.json() as Promise<Task[]>;
}

// Saves the edited title, description, status, and priority for one task.
export async function updateTaskDetails(
  id: string,
  details: { title: string; description: string; status: TaskStatus; priority: TaskPriority },
): Promise<Task> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(details),
    });
  } catch {
    throw new Error("Could not reach the API");
  }

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return response.json() as Promise<Task>;
}

// Saves a new status for one task and returns the updated task.
export async function updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  } catch {
    throw new Error("Could not reach the API");
  }

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return response.json() as Promise<Task>;
}

// Removes one task. A successful delete has an empty response.
export async function deleteTask(id: string): Promise<void> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/tasks/${id}`, { method: "DELETE" });
  } catch {
    throw new Error("Could not reach the API");
  }

  if (!response.ok) {
    throw new Error(await readError(response));
  }
}

export async function createTask(task: NewTask): Promise<Task> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    });
  } catch {
    throw new Error("Could not reach the API");
  }

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return response.json() as Promise<Task>;
}

export type { Task };
