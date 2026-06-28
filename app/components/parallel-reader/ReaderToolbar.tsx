"use client";

import type { MobileColumn, ViewMode } from "@/lib/types";
import { cn } from "@/lib/utils";

type ReaderToolbarProps = {
  mode: ViewMode;
  showConnections: boolean;
  mobileColumn: MobileColumn;
  commentCount: number;
  studioMode?: boolean;
  onModeChange: (mode: ViewMode) => void;
  onToggleConnections: () => void;
  onToggleComments: () => void;
  onMobileColumnChange: (column: MobileColumn) => void;
  onSaveAlignments: () => void;
  onDeleteAlignment: () => void;
  onToggleReadMode: () => void;
};

const modes: { id: ViewMode; label: string; shortcut: string }[] = [
  { id: "read", label: "Read", shortcut: "R" },
  { id: "align", label: "Align", shortcut: "A" },
  { id: "comment", label: "Comment", shortcut: "C" },
];

export function ReaderToolbar({
  mode,
  showConnections,
  mobileColumn,
  commentCount,
  studioMode,
  onModeChange,
  onToggleConnections,
  onToggleComments,
  onMobileColumnChange,
  onSaveAlignments,
  onDeleteAlignment,
  onToggleReadMode,
}: ReaderToolbarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-paper/80 p-3 backdrop-blur-md dark:bg-ink/60 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        {modes.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onModeChange(item.id)}
            className={cn(
              "rounded-full px-4 py-2 text-sm transition",
              mode === item.id
                ? "bg-accent text-white shadow-sm"
                : "bg-paper-elevated text-muted hover:text-ink dark:bg-ink-elevated dark:hover:text-paper"
            )}
          >
            {item.label}
            <span className="ml-1.5 text-xs opacity-60">{item.shortcut}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-full border border-border p-1 md:hidden">
          {(["source", "both", "target"] as MobileColumn[]).map((column) => (
            <button
              key={column}
              type="button"
              onClick={() => onMobileColumnChange(column)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs capitalize transition",
                mobileColumn === column
                  ? "bg-accent text-white"
                  : "text-muted hover:text-ink dark:hover:text-paper"
              )}
            >
              {column}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onToggleConnections}
          className={cn(
            "rounded-full px-3 py-2 text-sm transition",
            showConnections
              ? "bg-accent/15 text-accent"
              : "bg-paper-elevated text-muted dark:bg-ink-elevated"
          )}
        >
          Connections
        </button>

        <button
          type="button"
          onClick={onToggleComments}
          className="rounded-full bg-paper-elevated px-3 py-2 text-sm text-muted transition hover:text-ink dark:bg-ink-elevated dark:hover:text-paper"
        >
          Comments {commentCount > 0 ? `(${commentCount})` : ""}
        </button>

        <button
          type="button"
          onClick={onToggleReadMode}
          className="rounded-full bg-paper-elevated px-3 py-2 text-sm text-muted transition hover:text-ink dark:bg-ink-elevated dark:hover:text-paper"
        >
          Read mode
        </button>

        {studioMode && (
          <>
            <button
              type="button"
              onClick={onSaveAlignments}
              className="rounded-full bg-accent px-4 py-2 text-sm text-white shadow-sm transition hover:opacity-90"
            >
              Save
            </button>
            {mode === "read" && (
              <button
                type="button"
                onClick={onDeleteAlignment}
                className="rounded-full border border-border px-3 py-2 text-sm text-muted transition hover:text-ink dark:hover:text-paper"
              >
                Delete connection
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
