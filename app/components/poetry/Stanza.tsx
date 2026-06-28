import type { Segment } from "@/lib/types";
import type { SegmentGroupInfo } from "@/lib/alignments";
import { PoemLine } from "./PoemLine";

type StanzaProps = {
  stanzaId: string;
  lines: Segment[];
  groupMap: Map<string, SegmentGroupInfo>;
  focusedIds: Set<string>;
  dimUnfocused: boolean;
  stagedIds: Set<string>;
  mode?: "read" | "align" | "comment";
  onLineClick?: (segment: Segment) => void;
  registerRef?: (segmentId: string, element: HTMLElement | null) => void;
};

export function Stanza({
  lines,
  groupMap,
  focusedIds,
  dimUnfocused,
  stagedIds,
  mode = "read",
  onLineClick,
  registerRef,
}: StanzaProps) {
  const hasFocus = focusedIds.size > 0;

  return (
    <div className="poem-stanza mb-8 last:mb-0">
      {lines.map((line) => {
        const group = groupMap.get(line.id) ?? null;
        const isFocused = focusedIds.has(line.id);
        const isDimmed = dimUnfocused && hasFocus && !isFocused;

        return (
          <PoemLine
            key={line.id}
            segment={line}
            group={group}
            isFocused={isFocused}
            isDimmed={isDimmed}
            isStaged={stagedIds.has(line.id)}
            mode={mode}
            onClick={onLineClick}
            registerRef={registerRef}
          />
        );
      })}
    </div>
  );
}
