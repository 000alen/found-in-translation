import type { Segment } from "@/lib/types";
import { PoemLine } from "./PoemLine";

type StanzaProps = {
  stanzaId: string;
  lines: Segment[];
  highlightedIds: Set<string>;
  selectedId?: string | null;
  linkSourceId?: string | null;
  mode?: "read" | "align" | "comment";
  onHover?: (segmentId: string | null) => void;
  onLineClick?: (segment: Segment) => void;
  registerRef?: (segmentId: string, element: HTMLElement | null) => void;
};

export function Stanza({
  lines,
  highlightedIds,
  selectedId,
  linkSourceId,
  mode = "read",
  onHover,
  onLineClick,
  registerRef,
}: StanzaProps) {
  return (
    <div className="poem-stanza mb-8 last:mb-0">
      {lines.map((line) => (
        <PoemLine
          key={line.id}
          segment={line}
          isHighlighted={highlightedIds.has(line.id)}
          isSelected={selectedId === line.id}
          isLinkSource={linkSourceId === line.id}
          mode={mode}
          onHover={onHover}
          onClick={onLineClick}
          registerRef={registerRef}
        />
      ))}
    </div>
  );
}
