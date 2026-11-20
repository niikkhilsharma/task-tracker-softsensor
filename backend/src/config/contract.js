// Loads the shared task rules and checks that the expected values are present.
async function loadContract() {
  const {
    TASK_STATUSES,
    TASK_PRIORITIES,
    TITLE_MAX_LENGTH,
    DEFAULT_STATUS,
    DEFAULT_PRIORITY,
  } = await import("../../../shared/taskContract.mjs");

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
