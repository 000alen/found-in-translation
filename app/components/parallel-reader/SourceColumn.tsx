"use client";

import { useMemo } from "react";
import type { Alignment, Segment } from "@/lib/types";
import { Stanza } from "@/app/components/poetry/Stanza";
import { cn } from "@/lib/utils";

type SourceColumnProps = {
  segments: Segment[];
  alignments: Alignment[];
  highlightedIds: Set<string>;
  selectedId?: string | null;
  linkSourceId?: string | null;
  mode?: "read" | "align" | "comment";
  languageLabel: string;
  scrollRef?: React.RefObject<HTMLDivElement>;
  onHover?: (segmentId: string | null) => void;
  onLineClick?: (segment: Segment) => void;
  registerRef?: (segmentId: string, element: HTMLElement | null) => void;
  className?: string;
};

export function SourceColumn({
  segments,
  alignments: _alignments,
  highlightedIds,
  selectedId,
  linkSourceId,
  mode = "read",
  languageLabel,
  scrollRef,
  onHover,
  onLineClick,
  registerRef,
  className,
}: SourceColumnProps) {
  const lines = useMemo(
    () =>
      segments
        .filter((segment) => segment.side === "source" && segment.kind === "line")
        .sort((a, b) => a.order - b.order),
    [segments]
  );

  const stanzaId = segments.find(
    (segment) => segment.side === "source" && segment.kind === "stanza"
  )?.id ?? "source-stanza";

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
          Original
        </span>
        <span className="rounded-full bg-paper-elevated px-2.5 py-0.5 text-xs text-muted dark:bg-ink-elevated">
          {languageLabel}
        </span>
      </div>
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto scroll-smooth pr-2"
      >
        <Stanza
          stanzaId={stanzaId}
          lines={lines}
          highlightedIds={highlightedIds}
          selectedId={selectedId}
          linkSourceId={linkSourceId}
          mode={mode}
          onHover={onHover}
          onLineClick={onLineClick}
          registerRef={registerRef}
        />
      </div>
    </div>
  );
}

export function TargetColumn({
  segments,
  alignments: _alignments,
  highlightedIds,
  selectedId,
  linkSourceId,
  mode = "read",
  languageLabel,
  scrollRef,
  onHover,
  onLineClick,
  registerRef,
  className,
}: SourceColumnProps) {
  const lines = useMemo(
    () =>
      segments
        .filter((segment) => segment.side === "target" && segment.kind === "line")
        .sort((a, b) => a.order - b.order),
    [segments]
  );

  const stanzaId = segments.find(
    (segment) => segment.side === "target" && segment.kind === "stanza"
  )?.id ?? "target-stanza";

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
          Translation
        </span>
        <span className="rounded-full bg-paper-elevated px-2.5 py-0.5 text-xs text-muted dark:bg-ink-elevated">
          {languageLabel}
        </span>
      </div>
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto scroll-smooth pl-2"
      >
        <Stanza
          stanzaId={stanzaId}
          lines={lines}
          highlightedIds={highlightedIds}
          selectedId={selectedId}
          linkSourceId={linkSourceId}
          mode={mode}
          onHover={onHover}
          onLineClick={onLineClick}
          registerRef={registerRef}
        />
      </div>
    </div>
  );
}
