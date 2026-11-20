# Task tracker

A small task list with a React interface and an Express API. Tasks are stored in MongoDB. Status, priority, and title rules live in `shared/taskContract.mjs` and are used by both sides.

## Setup

You need Node.js 20 or newer and a MongoDB connection string.

1. Install the API and the interface separately:

```bash
npm install --prefix backend
npm install --prefix task-tracker
```

1. Create `backend/.env` and set the connection string. This file is gitignored.

```bash
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<database>
```

The API selects the database name `task_tracker` itself. The database name in the URI is not used for the app.

1. Allow the machine running the API in the database host's network access list. Atlas rejects the connection when the current IP is missing.
2. Start the API and the interface in two terminals:

```bash
npm run dev --prefix backend
npm run dev --prefix task-tracker
```

The API listens on `http://localhost:3000`. The interface listens on `http://localhost:5173` and calls the API there. Open the interface URL in a browser.

`npm start --prefix backend` runs the API without reloading on file changes. `npm run build --prefix task-tracker` typechecks and builds the interface. `npm run preview --prefix task-tracker` serves that build.

To point a built interface at another API, set `VITE_API_URL` before `npm run build`. Vite reads it only at build time. When it is unset, the interface uses `http://localhost:3000`.

## Tests

API tests use the same `MONGODB_URI` and write to a separate database, `task_tracker_test`. The database host must be reachable.

```bash
npm test --prefix backend
```

That runs `node --test tests/tasks.test.js`. The two tests check that an invalid task is rejected and that a status update is saved and listed.

The interface has no test script. Check it with:

```bash
npm run lint --prefix task-tracker
npm run build --prefix task-tracker
```



## Assumptions

- One shared contract defines the allowed values: status is `todo`, `in_progress`, or `done`; priority is `low`, `medium`, or `high`; a title is required and at most 100 characters.
- A new task defaults to `todo` and `medium` when those fields are omitted. `createdAt` is set by the server.
- Titles and descriptions are trimmed. A blank description is stored as no description.
- `GET /tasks` returns every task. `GET /tasks?status=` returns one status.
- `POST /tasks` creates a task and returns `201`. `PATCH /tasks/:id` changes status only. `DELETE /tasks/:id` returns `204`.
- A bad body or status returns `400` with `{ "error": "..." }`. An unknown id returns `404`. An unexpected failure returns `500`.
- Local development is the interface on port 5173 talking to the API on port 3000. Those origins are allowed by the API CORS list, along with the deployed interface.



## Limitations

- There is no authentication. Anyone who can reach the API can list, create, update, and delete tasks.
- After a task is created, only its status can be changed. Title, description, and priority stay as they were saved.
- Description length is not limited by the shared contract.
- The CORS allowlist is fixed in `backend/src/app.js`. Another interface origin needs a code change.
- Tests need a live MongoDB database. They do not wipe `task_tracker_test` first. The status test deletes the task it creates; a failed run can leave that task behind.
- The interface has no automated tests. Status filters count the loaded tasks and narrow that list in the browser.

