import type { Segment } from "@/lib/types";
import type { AnchorGroupInfo } from "@/lib/alignments";
import { getLanguage, scriptClassFor } from "@/lib/languages";
import { splitParagraphWithSpans } from "@/lib/anchors";
import { AlignedMark } from "./AlignedMark";
import { cn } from "@/lib/utils";

type ProseParagraphProps = {
  segment: Segment;
  languageCode: string;
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
  languageCode,
  spans,
  groupMap,
  focusedIds,
  stagedIds,
  mode = "read",
  onAnchorClick,
  registerRef,
}: ProseParagraphProps) {
  const parts = splitParagraphWithSpans(segment.text, spans);
  const lang = getLanguage(languageCode);

  return (
    <p
      className={cn("text-body mb-6 last:mb-0", scriptClassFor(languageCode))}
      lang={lang.bcp47}
      dir={lang.direction}
      data-segment-id={segment.id}
    >
      {parts.map((part, index) => {
        if (part.type === "text") {
          return <span key={`t-${index}`}>{part.value}</span>;
        }

        const span = part.segment;
        const group = groupMap.get(span.id) ?? null;
        const isFocused = focusedIds.has(span.id);

        return (
          <AlignedMark
            key={span.id}
            anchorId={span.id}
            group={group}
            isFocused={isFocused}
            isDimmed={false}
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
