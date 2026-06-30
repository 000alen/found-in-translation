"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Alignment, Segment } from "@/lib/types";
import {
  GROUP_COLORS,
  getAnchorsForAlignment,
  type GroupColor,
} from "@/lib/alignments";
import { cn } from "@/lib/utils";

type ConnectionDockProps = {
  alignment: Alignment | null;
  color: GroupColor | null;
  segments: Segment[];
  onJumpTo: (anchorId: string) => void;
  onClose: () => void;
};

type PassageItem = {
  anchorId: string;
  quote: string;
  label: string;
};

function buildPassageItems(
  anchors: ReturnType<typeof getAnchorsForAlignment>["source"],
  segments: Segment[],
  sideLabel: string
): PassageItem[] {
  const byId = new Map(segments.map((segment) => [segment.id, segment]));

  return anchors.map((anchor) => {
    const segment = byId.get(anchor.segmentId);
    const quote = anchor.quote || segment?.text || "";

    let label = sideLabel;
    if (segment?.kind === "line") {
      label = `Line ${segment.order}`;
    } else if (segment?.kind === "span") {
      label = "Phrase";
    } else if (segment?.kind === "paragraph") {
      label = "Paragraph";
    }

    return { anchorId: anchor.id, quote, label };
  });
}

function PassageList({
  heading,
  items,
  color,
  onJumpTo,
}: {
  heading: string;
  items: PassageItem[];
  color: GroupColor;
  onJumpTo: (anchorId: string) => void;
}) {
  if (items.length === 0) return null;

  return (
    <div className="min-w-0 flex-1">
      <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.22em] text-muted">
        {heading}
      </p>
      <div className="space-y-2">
        {items.map((item) => (
          <button
            key={item.anchorId}
            type="button"
            onClick={() => onJumpTo(item.anchorId)}
          className={cn(
              "group w-full rounded-md border-l border-border bg-transparent py-2 pl-3 text-left transition hover:border-accent",
              "focus-visible:outline-none focus-visible:ring-2",
              color.ring
            )}
          >
            <span className={cn("mb-1 block text-[10px] font-medium uppercase tracking-wider", color.text)}>
              {item.label}
            </span>
            <span className="text-body block text-sm leading-snug text-ink">
              {item.quote}
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

  const { source, target } = getAnchorsForAlignment(alignment);
  const sourceItems = buildPassageItems(source, segments, "Original");
  const targetItems = buildPassageItems(target, segments, "Translation");

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 420, damping: 32 }}
        className="pointer-events-auto absolute bottom-4 right-4 z-30 w-[min(34rem,calc(100%-2rem))]"
      >
        <div className="overflow-hidden rounded-lg border border-border bg-surface/95 shadow-lg backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3 border-b border-border px-3 py-2">
            <div className="flex items-center gap-3">
              <span className={cn("h-2 w-2 rounded-full", color.bar)} />
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink">Link</p>
                <p className="text-xs text-muted">{kindLabel(alignment.kind)}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-3 py-1 text-xs text-muted transition hover:bg-surface-2 hover:text-ink"
            >
              Close
            </button>
          </div>

          <div className="grid gap-3 p-3 md:grid-cols-[1fr_auto_1fr] md:items-start">
            <PassageList heading="Original" items={sourceItems} color={color} onJumpTo={onJumpTo} />

            <div className="hidden flex-col items-center justify-center gap-1 px-2 md:flex">
              <div className={cn("h-px w-6", color.bar, "opacity-50")} />
              <span className="text-xs text-muted">↔</span>
              <div className={cn("h-px w-6", color.bar, "opacity-50")} />
            </div>

            <div className="md:hidden">
              <div className="my-1 flex items-center gap-2 text-xs text-muted">
                <div className={cn("h-px flex-1", color.bar, "opacity-40")} />
                <span>maps to</span>
                <div className={cn("h-px flex-1", color.bar, "opacity-40")} />
              </div>
            </div>

            <PassageList heading="Translation" items={targetItems} color={color} onJumpTo={onJumpTo} />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export function ConnectionLegend({ count }: { count: number }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
      <span>
        {count} connection{count === 1 ? "" : "s"}
      </span>
      <span className="hidden text-border md:inline">·</span>
      <span className="hidden md:inline">
        Click a phrase or line to trace links across the page
      </span>
      <div className="ml-auto flex items-center gap-1.5">
        {GROUP_COLORS.slice(0, Math.min(count, 5)).map((color) => (
          <span key={color.id} className={cn("h-1.5 w-1.5 rounded-full", color.bar)} />
        ))}
      </div>
    </div>
  );
}
