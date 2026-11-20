import {
  STATUS_LABELS,
  TASK_STATUSES,
  type TaskStatus,
} from "../../../shared/taskContract.mjs";
import type { StatusCounts } from "../utils/countTasks";
import FilterButton from "./ui/FilterButton";

const options = [null, ...TASK_STATUSES] as const;

// Chooses whether the list shows every task or one status.
export default function StatusFilter({
  value,
  counts,
  onChange,
}: {
  value: TaskStatus | null;
  counts: StatusCounts | null;
  onChange: (status: TaskStatus | null) => void;
}) {
  return (
    <div role="group" aria-label="Filter by status" className="mb-4 flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = option === value;
        const label = option ? STATUS_LABELS[option] : "All";
        const count = counts ? counts[option ?? "all"] : null;

        return (
          <FilterButton
            key={option ?? "all"}
            selected={selected}
            onClick={() => onChange(option)}
          >
            {label}
            {count !== null ? (
              <span className={selected ? "text-white/70" : "text-zinc-500"}>
                {count}
              </span>
            ) : null}
          </FilterButton>
        );
      })}
    </div>
  );
}
