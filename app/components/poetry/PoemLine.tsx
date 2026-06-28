import type { Segment } from "@/lib/types";
import type { SegmentGroupInfo } from "@/lib/alignments";
import { cn } from "@/lib/utils";

type PoemLineProps = {
  segment: Segment;
  group?: SegmentGroupInfo | null;
  isFocused?: boolean;
  isDimmed?: boolean;
  isStaged?: boolean;
  mode?: "read" | "align" | "comment";
  onClick?: (segment: Segment) => void;
  registerRef?: (segmentId: string, element: HTMLElement | null) => void;
};

const lineClass = (props: {
  mode: PoemLineProps["mode"];
  isDimmed: boolean;
  isFocused: boolean;
  isStaged: boolean;
  group: SegmentGroupInfo | null | undefined;
}) =>
  cn(
    "poem-line group relative mb-1 w-full rounded-xl px-3 py-2.5 text-left transition-all duration-200",
    props.mode === "align" && "cursor-pointer",
    props.mode === "comment" && "cursor-text select-text",
    props.mode === "read" && "cursor-pointer hover:bg-paper-elevated/80 dark:hover:bg-ink-elevated/50",
    props.isDimmed && "opacity-35",
    props.isFocused && props.group && [props.group.color.bg, "ring-1", props.group.color.ring, "shadow-sm"],
    props.isStaged && "ring-2 ring-accent/50 bg-accent/10",
    !props.isFocused &&
      !props.isStaged &&
      props.group &&
      "hover:bg-paper-elevated/60 dark:hover:bg-ink-elevated/40"
  );

function LineContent({
  segment,
  group,
  isFocused,
}: {
  segment: Segment;
  group?: SegmentGroupInfo | null;
  isFocused: boolean;
}) {
  return (
    <>
      {group && (
        <span
          className={cn(
            "absolute bottom-2 left-0 top-2 w-1 rounded-full transition-all",
            group.color.bar,
            isFocused ? "opacity-100" : "opacity-50 group-hover:opacity-80"
          )}
          aria-hidden
        />
      )}

      <span
        className={cn(
          "font-poetry block pl-2 text-[1.05rem] leading-[1.9] text-ink dark:text-paper",
          isFocused && "font-medium"
        )}
      >
        {segment.text}
      </span>

      {group && !isFocused && (
        <span
          className={cn(
            "absolute right-2 top-2 h-1.5 w-1.5 rounded-full opacity-0 transition-opacity group-hover:opacity-100",
            group.color.bar
          )}
          aria-hidden
        />
      )}
    </>
  );
}

export function PoemLine({
  segment,
  group,
  isFocused = false,
  isDimmed = false,
  isStaged = false,
  mode = "read",
  onClick,
  registerRef,
}: PoemLineProps) {
  if (segment.kind !== "line") return null;

  const className = lineClass({ mode, isDimmed, isFocused, isStaged, group });

  if (mode === "comment") {
    return (
      <div
        ref={(element) => registerRef?.(segment.id, element)}
        data-segment-id={segment.id}
        className={className}
      >
        <LineContent segment={segment} group={group} isFocused={isFocused} />
      </div>
    );
  }

  return (
    <button
      type="button"
      ref={(element) => registerRef?.(segment.id, element)}
      data-segment-id={segment.id}
      onClick={() => onClick?.(segment)}
      className={className}
    >
      <LineContent segment={segment} group={group} isFocused={isFocused} />
    </button>
  );
}
