"use client";

import type { AnchorGroupInfo } from "@/lib/alignments";
import { cn } from "@/lib/utils";

type AlignedMarkProps = {
  anchorId: string;
  group?: AnchorGroupInfo | null;
  isFocused?: boolean;
  isDimmed?: boolean;
  isStaged?: boolean;
  mode?: "read" | "align" | "comment";
  onClick?: (anchorId: string) => void;
  registerRef?: (anchorId: string, element: HTMLElement | null) => void;
  children: React.ReactNode;
};

export function AlignedMark({
  anchorId,
  group,
  isFocused = false,
  isDimmed = false,
  isStaged = false,
  mode = "read",
  onClick,
  registerRef,
  children,
}: AlignedMarkProps) {
  const markClass = cn(
    "aligned-mark inline",
    group && "has-alignment",
    isDimmed && "is-dimmed",
    isFocused && "is-focused",
    isFocused && group && [group.color.bg, "ring-1", group.color.ring],
    isStaged && "ring-1 ring-accent bg-accent-soft"
  );

  if (mode === "comment") {
    return (
      <mark
        ref={(el) => registerRef?.(anchorId, el)}
        data-anchor-id={anchorId}
        className={cn(markClass, "bg-transparent")}
      >
        {children}
      </mark>
    );
  }

  return (
    <button
      type="button"
      ref={(el) => registerRef?.(anchorId, el)}
      data-anchor-id={anchorId}
      onClick={() => onClick?.(anchorId)}
      aria-label={`Show link for ${children}`}
      className={cn(
        markClass,
        "cursor-pointer border-0 text-left font-inherit text-inherit",
        mode === "align" && "ring-1 ring-transparent"
      )}
    >
      {children}
    </button>
  );
}
