const assert = require("node:assert/strict");
const { after, before, describe, it } = require("node:test");
const { createApp } = require("../src/app");
const { loadContract } = require("../src/config/contract");
const { closeDb, connectDb } = require("../src/config/db");
const { ensureTasksCollection } = require("../src/models/task");

require("../src/config/env");

const TEST_DATABASE = "task_tracker_test";

let server;
let baseUrl;

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const text = await response.text();
  return {
    status: response.status,
    body: text ? JSON.parse(text) : null,
  };
}

before(async () => {
  const contract = await loadContract();
  await connectDb(TEST_DATABASE);
  ensureTasksCollection(null, contract);
  const app = createApp(contract);
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await closeDb();
});

describe("tasks", () => {
  it("rejects an invalid task and does not save it", async () => {
    const beforeList = await request("/tasks");
    const missingTitle = await request("/tasks", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const longTitle = await request("/tasks", {
      method: "POST",
      body: JSON.stringify({ title: "a".repeat(101) }),
    });
    const afterList = await request("/tasks");

    assert.equal(missingTitle.status, 400);
    assert.equal(missingTitle.body.error, "Title is required");
    assert.equal(longTitle.status, 400);
    assert.equal(longTitle.body.error, "Title must be at most 100 characters");
    assert.equal(afterList.body.length, beforeList.body.length);
  });

  it("updates a task status and returns the new status", async () => {
    const created = await request("/tasks", {
      method: "POST",
      body: JSON.stringify({ title: "Status update test" }),
    });
    const updated = await request(`/tasks/${created.body.id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "done" }),
    });
    const listed = await request("/tasks?status=done");
    const found = listed.body.find((task) => task.id === created.body.id);

    assert.equal(created.status, 201);
    assert.equal(updated.status, 200);
    assert.equal(updated.body.status, "done");
    assert.equal(found.status, "done");

    await request(`/tasks/${created.body.id}`, { method: "DELETE" });
  });

  it("updates a task title and description", async () => {
    const created = await request("/tasks", {
      method: "POST",
      body: JSON.stringify({ title: "Edit test", description: "Before" }),
    });
    const updated = await request(`/tasks/${created.body.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        title: "Edit test saved",
        description: "After",
        status: "in_progress",
        priority: "high",
      }),
    });
    const cleared = await request(`/tasks/${created.body.id}`, {
      method: "PATCH",
      body: JSON.stringify({ description: "   " }),
    });
    const blankTitle = await request(`/tasks/${created.body.id}`, {
      method: "PATCH",
      body: JSON.stringify({ title: "  " }),
    });

    assert.equal(created.status, 201);
    assert.equal(updated.status, 200);
    assert.equal(updated.body.title, "Edit test saved");
    assert.equal(updated.body.description, "After");
    assert.equal(updated.body.status, "in_progress");
    assert.equal(updated.body.priority, "high");
    assert.equal(cleared.status, 200);
    assert.equal(cleared.body.title, "Edit test saved");
    assert.equal(cleared.body.description, undefined);
    assert.equal(blankTitle.status, 400);
    assert.equal(blankTitle.body.error, "Title is required");

    await request(`/tasks/${created.body.id}`, { method: "DELETE" });
  });
});
