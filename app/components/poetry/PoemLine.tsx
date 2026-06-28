import type { Segment } from "@/lib/types";
import { cn } from "@/lib/utils";

type PoemLineProps = {
  segment: Segment;
  isHighlighted?: boolean;
  isSelected?: boolean;
  isLinkSource?: boolean;
  mode?: "read" | "align" | "comment";
  onHover?: (segmentId: string | null) => void;
  onClick?: (segment: Segment) => void;
  registerRef?: (segmentId: string, element: HTMLElement | null) => void;
};

export function PoemLine({
  segment,
  isHighlighted = false,
  isSelected = false,
  isLinkSource = false,
  mode = "read",
  onHover,
  onClick,
  registerRef,
}: PoemLineProps) {
  if (segment.kind !== "line") return null;

  return (
    <div
      ref={(element) => registerRef?.(segment.id, element)}
      data-segment-id={segment.id}
      className={cn(
        "poem-line relative rounded-md px-3 py-1.5 transition-all duration-200",
        mode === "align" && "cursor-pointer",
        mode === "comment" && "cursor-text select-text",
        isHighlighted && "bg-accent/15 ring-1 ring-accent/30",
        isSelected && "bg-accent/25 ring-2 ring-accent/50",
        isLinkSource && "bg-link-source/20 ring-2 ring-link-source/60"
      )}
      onMouseEnter={() => onHover?.(segment.id)}
      onMouseLeave={() => onHover?.(null)}
      onClick={() => onClick?.(segment)}
    >
      <span className="font-poetry text-[1.05rem] leading-[1.9] text-ink dark:text-paper">
        {segment.text}
      </span>
    </div>
  );
}
