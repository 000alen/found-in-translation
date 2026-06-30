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
  const modes: Array<{ id: ViewMode; label: string }> = studioMode
    ? [
        { id: "read", label: "Read" },
        { id: "align", label: "Align" },
      ]
    : [{ id: "read", label: "Read" }];

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted">
      <div className="flex flex-wrap items-center gap-1">
        {modes.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onModeChange(item.id)}
            className={cn(
              "rounded-full px-2.5 py-1 transition",
              mode === item.id
                ? "bg-ink text-paper"
                : "hover:bg-surface-2 hover:text-ink"
            )}
          >
            {item.label}{item.id === "comment" && commentCount > 0 ? ` ${commentCount}` : ""}
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
                "rounded-full px-2 py-0.5 text-xs capitalize transition",
                mobileColumn === column
                  ? "bg-ink text-paper"
                  : "hover:text-ink"
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
            "rounded-full px-2.5 py-1 transition hover:bg-surface-2 hover:text-ink",
            showConnections && "text-ink"
          )}
        >
          Links
        </button>

        <button
          type="button"
          onClick={onToggleComments}
          className={cn(
            "rounded-full px-2.5 py-1 transition hover:bg-surface-2 hover:text-ink",
            mode === "comment" && "text-ink"
          )}
        >
          Notes{commentCount > 0 ? ` ${commentCount}` : ""}
        </button>

        <button
          type="button"
          onClick={onToggleReadMode}
          className="rounded-full px-2.5 py-1 transition hover:bg-surface-2 hover:text-ink"
        >
          Focus
        </button>

        {studioMode && (
          <>
            <button
              type="button"
              onClick={onSaveAlignments}
              className="rounded-full bg-ink px-3 py-1 text-paper transition hover:bg-accent"
            >
              Save
            </button>
            {mode === "read" && (
              <button
                type="button"
                onClick={onDeleteAlignment}
                className="rounded-full px-2.5 py-1 transition hover:bg-surface-2 hover:text-ink"
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
