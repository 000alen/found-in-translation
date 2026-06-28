"use client";

import { useMemo } from "react";
import type { Segment } from "@/lib/types";
import type { SegmentGroupInfo } from "@/lib/alignments";
import { Stanza } from "@/app/components/poetry/Stanza";
import { cn } from "@/lib/utils";

type ColumnProps = {
  segments: Segment[];
  side: "source" | "target";
  groupMap: Map<string, SegmentGroupInfo>;
  focusedIds: Set<string>;
  dimUnfocused: boolean;
  stagedIds: Set<string>;
  mode?: "read" | "align" | "comment";
  languageLabel: string;
  scrollRef?: React.RefObject<HTMLDivElement>;
  onLineClick?: (segment: Segment) => void;
  registerRef?: (segmentId: string, element: HTMLElement | null) => void;
  className?: string;
};

function PoemColumn({
  segments,
  side,
  groupMap,
  focusedIds,
  dimUnfocused,
  stagedIds,
  mode = "read",
  languageLabel,
  scrollRef,
  onLineClick,
  registerRef,
  className,
}: ColumnProps) {
  const lines = useMemo(
    () =>
      segments
        .filter((segment) => segment.side === side && segment.kind === "line")
        .sort((a, b) => a.order - b.order),
    [segments, side]
  );

  const stanzaId =
    segments.find((segment) => segment.side === side && segment.kind === "stanza")?.id ??
    `${side}-stanza`;

  const heading = side === "source" ? "Original" : "Translation";

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
          {heading}
        </span>
        <span className="rounded-full bg-paper-elevated px-2.5 py-0.5 text-xs text-muted dark:bg-ink-elevated">
          {languageLabel}
        </span>
      </div>
      <div
        ref={scrollRef}
        className={cn(
          "min-h-0 flex-1 overflow-y-auto scroll-smooth",
          side === "source" ? "pr-1" : "pl-1"
        )}
      >
        <Stanza
          stanzaId={stanzaId}
          lines={lines}
          groupMap={groupMap}
          focusedIds={focusedIds}
          dimUnfocused={dimUnfocused}
          stagedIds={stagedIds}
          mode={mode}
          onLineClick={onLineClick}
          registerRef={registerRef}
        />
      </div>
    </div>
  );
}

export function SourceColumn(props: Omit<ColumnProps, "side">) {
  return <PoemColumn {...props} side="source" />;
}

export function TargetColumn(props: Omit<ColumnProps, "side">) {
  return <PoemColumn {...props} side="target" />;
}
