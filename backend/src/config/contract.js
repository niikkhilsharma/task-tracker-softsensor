const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

// Uses the literal path so the file is packaged, then checks the other layout.
async function contractModule() {
  try {
    return await import("../../../shared/taskContract.mjs");
  } catch {
    return import(contractFile());
  }
}

// Finds the shared contract from the repo root in local and Vercel layouts.
function contractFile() {
  const candidates = [
    path.resolve(__dirname, "../../../shared/taskContract.mjs"),
    path.resolve(__dirname, "../../../../shared/taskContract.mjs"),
  ];
  const found = candidates.find((candidate) => fs.existsSync(candidate));
  if (!found) {
    throw new Error("Shared task contract was not found");
  }
  return pathToFileURL(found).href;
}

// Loads the shared task rules and checks that the expected values are present.
async function loadContract() {
  const {
    TASK_STATUSES,
    TASK_PRIORITIES,
    TITLE_MAX_LENGTH,
    DEFAULT_STATUS,
    DEFAULT_PRIORITY,
  } = await contractModule();

  if (
    TASK_STATUSES.length !== 3 ||
    TASK_PRIORITIES.length !== 3 ||
    TITLE_MAX_LENGTH !== 100
  ) {
    throw new Error("Shared task contract is invalid");
  }

  return {
    statuses: TASK_STATUSES,
    priorities: TASK_PRIORITIES,
    titleMaxLength: TITLE_MAX_LENGTH,
    defaultStatus: DEFAULT_STATUS,
    defaultPriority: DEFAULT_PRIORITY,
  };
}

module.exports = {
  loadContract,
};
