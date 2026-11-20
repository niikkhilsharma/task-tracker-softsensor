import type { ReactNode } from "react";

// A selectable filter control. The pressed state shows the active filter.
export default function FilterButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={
        selected
          ? "inline-flex items-center gap-1.5 rounded-lg bg-zinc-950 px-3 py-1.5 text-sm text-white"
          : "inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm"
      }
    >
      {children}
    </button>
  );
}
