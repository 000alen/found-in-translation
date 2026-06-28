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
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface/90 p-2 backdrop-blur-sm md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap items-center gap-1">
        {modes.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onModeChange(item.id)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm transition",
              mode === item.id
                ? "bg-accent text-white"
                : "text-muted hover:bg-surface-2 hover:text-ink"
            )}
          >
            {item.label}
            <span className="ml-1 text-[10px] opacity-50">{item.shortcut}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-1">
        <div className="flex rounded-full border border-border p-0.5 md:hidden">
          {(["source", "both", "target"] as MobileColumn[]).map((column) => (
            <button
              key={column}
              type="button"
              onClick={() => onMobileColumnChange(column)}
              className={cn(
                "rounded-full px-2.5 py-1 text-xs capitalize transition",
                mobileColumn === column
                  ? "bg-accent text-white"
                  : "text-muted hover:text-ink"
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
            "rounded-full px-3 py-1.5 text-sm transition",
            showConnections ? "bg-accent-soft text-accent" : "text-muted hover:bg-surface-2"
          )}
        >
          Links
        </button>

        <button
          type="button"
          onClick={onToggleComments}
          className="rounded-full px-3 py-1.5 text-sm text-muted transition hover:bg-surface-2 hover:text-ink"
        >
          Notes {commentCount > 0 ? `(${commentCount})` : ""}
        </button>

        <button
          type="button"
          onClick={onToggleReadMode}
          className="rounded-full px-3 py-1.5 text-sm text-muted transition hover:bg-surface-2 hover:text-ink"
        >
          Focus
        </button>

        {studioMode && (
          <>
            <button
              type="button"
              onClick={onSaveAlignments}
              className="rounded-full bg-accent px-3.5 py-1.5 text-sm text-white transition hover:opacity-90"
            >
              Save
            </button>
            {mode === "read" && (
              <button
                type="button"
                onClick={onDeleteAlignment}
                className="rounded-full border border-border px-3 py-1.5 text-sm text-muted transition hover:text-ink"
              >
                Delete
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
