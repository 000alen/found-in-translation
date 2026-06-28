import type { Segment } from "@/lib/types";
import type { AnchorGroupInfo } from "@/lib/alignments";
import { splitParagraphWithSpans } from "@/lib/anchors";
import { AlignedMark } from "./AlignedMark";

type ProseParagraphProps = {
  segment: Segment;
  spans: Segment[];
  groupMap: Map<string, AnchorGroupInfo>;
  focusedIds: Set<string>;
  dimUnfocused: boolean;
  stagedIds: Set<string>;
  mode?: "read" | "align" | "comment";
  onAnchorClick?: (anchorId: string) => void;
  registerRef?: (anchorId: string, element: HTMLElement | null) => void;
};

export function ProseParagraph({
  segment,
  spans,
  groupMap,
  focusedIds,
  dimUnfocused,
  stagedIds,
  mode = "read",
  onAnchorClick,
  registerRef,
}: ProseParagraphProps) {
  const parts = splitParagraphWithSpans(segment.text, spans);
  const hasFocus = focusedIds.size > 0;

  return (
    <p
      className="text-body mb-6 last:mb-0"
      data-segment-id={segment.id}
    >
      {parts.map((part, index) => {
        if (part.type === "text") {
          return <span key={`t-${index}`}>{part.value}</span>;
        }

        const span = part.segment;
        const group = groupMap.get(span.id) ?? null;
        const isFocused = focusedIds.has(span.id);
        const isDimmed = dimUnfocused && hasFocus && !isFocused;

        return (
          <AlignedMark
            key={span.id}
            anchorId={span.id}
            group={group}
            isFocused={isFocused}
            isDimmed={isDimmed}
            isStaged={stagedIds.has(span.id)}
            mode={mode}
            onClick={onAnchorClick}
            registerRef={registerRef}
          >
            {span.text}
          </AlignedMark>
        );
      })}
    </p>
  );
}
