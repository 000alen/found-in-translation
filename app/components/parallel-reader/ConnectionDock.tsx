"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Alignment, Segment } from "@/lib/types";
import {
  GROUP_COLORS,
  getSegmentsForAlignment,
  type GroupColor,
} from "@/lib/alignments";
import { cn } from "@/lib/utils";

type ConnectionDockProps = {
  alignment: Alignment | null;
  color: GroupColor | null;
  segments: Segment[];
  onJumpTo: (segmentId: string) => void;
  onClose: () => void;
};

function PassageList({
  label,
  items,
  color,
  onJumpTo,
}: {
  label: string;
  items: Segment[];
  color: GroupColor;
  onJumpTo: (segmentId: string) => void;
}) {
  if (items.length === 0) return null;

  return (
    <div className="min-w-0 flex-1">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">
        {label}
      </p>
      <div className="space-y-2">
        {items.map((segment) => (
          <button
            key={segment.id}
            type="button"
            onClick={() => onJumpTo(segment.id)}
            className={cn(
              "group w-full rounded-xl border border-border/80 bg-paper/80 p-3 text-left transition hover:border-border hover:bg-paper dark:bg-ink/60 dark:hover:bg-ink/80",
              "focus-visible:outline-none focus-visible:ring-2",
              color.ring
            )}
          >
            <span className={cn("mb-1 block text-[10px] font-medium uppercase tracking-wider", color.text)}>
              Line {segment.order}
            </span>
            <span className="font-poetry text-sm leading-relaxed text-ink dark:text-paper">
              {segment.text}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function kindLabel(kind: Alignment["kind"]) {
  switch (kind) {
    case "cross":
      return "Reordered mapping";
    case "partial":
      return "Many-to-many";
    case "parallel":
      return "Linked passage";
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

export function ConnectionDock({
  alignment,
  color,
  segments,
  onJumpTo,
  onClose,
}: ConnectionDockProps) {
  if (!alignment || !color) return null;

  const { source, target } = getSegmentsForAlignment(alignment, segments);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 420, damping: 32 }}
        className="pointer-events-auto absolute inset-x-4 bottom-4 z-30 mx-auto max-w-4xl"
      >
        <div className="overflow-hidden rounded-2xl border border-border/80 bg-paper/90 shadow-2xl shadow-ink/10 backdrop-blur-xl dark:bg-ink/90">
          <div className="flex items-center justify-between gap-3 border-b border-border/70 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className={cn("h-2.5 w-2.5 rounded-full", color.bar)} />
              <div>
                <p className="text-sm font-medium text-ink dark:text-paper">Connection</p>
                <p className="text-xs text-muted">{kindLabel(alignment.kind)}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-3 py-1 text-xs text-muted transition hover:bg-paper-elevated hover:text-ink dark:hover:bg-ink-elevated dark:hover:text-paper"
            >
              Close
            </button>
          </div>

          <div className="grid gap-4 p-4 md:grid-cols-[1fr_auto_1fr] md:items-start">
            <PassageList label="Original" items={source} color={color} onJumpTo={onJumpTo} />

            <div className="hidden flex-col items-center justify-center gap-1 px-2 md:flex">
              <div className={cn("h-px w-8", color.bar, "opacity-60")} />
              <span className="text-lg text-muted">↔</span>
              <div className={cn("h-px w-8", color.bar, "opacity-60")} />
            </div>

            <div className="md:hidden">
              <div className="my-1 flex items-center gap-2 text-xs text-muted">
                <div className={cn("h-px flex-1", color.bar, "opacity-40")} />
                <span>maps to</span>
                <div className={cn("h-px flex-1", color.bar, "opacity-40")} />
              </div>
            </div>

            <PassageList label="Translation" items={target} color={color} onJumpTo={onJumpTo} />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export function ConnectionLegend({ count }: { count: number }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
      <span>{count} connection{count === 1 ? "" : "s"}</span>
      <span className="hidden text-border md:inline">·</span>
      <span className="hidden md:inline">Click a passage to see triangle links across the page</span>
      <div className="ml-auto flex items-center gap-1.5">
        {GROUP_COLORS.slice(0, Math.min(count, 5)).map((color) => (
          <span key={color.id} className={cn("h-2 w-2 rounded-full", color.bar)} />
        ))}
      </div>
    </div>
  );
}
