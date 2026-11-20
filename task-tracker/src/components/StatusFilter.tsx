import {
  STATUS_LABELS,
  TASK_STATUSES,
  type TaskStatus,
} from "../../../shared/taskContract.mjs";
import FilterButton from "./ui/FilterButton";

const options = [null, ...TASK_STATUSES] as const;

// Chooses whether the list shows every task or one status.
export default function StatusFilter({
  value,
  onChange,
}: {
  value: TaskStatus | null;
  onChange: (status: TaskStatus | null) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Filter by status"
      className="mb-4 flex flex-wrap gap-2"
    >
      {options.map((option) => {
        const selected = option === value;
        return (
          <FilterButton
            key={option ?? "all"}
            selected={selected}
            onClick={() => onChange(option)}
          >
            {option ? STATUS_LABELS[option] : "All"}
          </FilterButton>
        );
      })}
    </div>
  );
}
