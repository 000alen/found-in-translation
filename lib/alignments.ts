import type { Alignment, Segment } from "./types";

export const GROUP_COLORS = [
  { id: "violet", bar: "bg-violet-500", bg: "bg-violet-500/10", ring: "ring-violet-500/30", text: "text-violet-700 dark:text-violet-300", ribbon: "rgba(139, 92, 246, 0.34)" },
  { id: "sky", bar: "bg-sky-500", bg: "bg-sky-500/10", ring: "ring-sky-500/30", text: "text-sky-700 dark:text-sky-300", ribbon: "rgba(14, 165, 233, 0.34)" },
  { id: "emerald", bar: "bg-emerald-500", bg: "bg-emerald-500/10", ring: "ring-emerald-500/30", text: "text-emerald-700 dark:text-emerald-300", ribbon: "rgba(16, 185, 129, 0.34)" },
  { id: "amber", bar: "bg-amber-500", bg: "bg-amber-500/10", ring: "ring-amber-500/30", text: "text-amber-700 dark:text-amber-300", ribbon: "rgba(245, 158, 11, 0.34)" },
  { id: "rose", bar: "bg-rose-500", bg: "bg-rose-500/10", ring: "ring-rose-500/30", text: "text-rose-700 dark:text-rose-300", ribbon: "rgba(244, 63, 94, 0.34)" },
  { id: "indigo", bar: "bg-indigo-500", bg: "bg-indigo-500/10", ring: "ring-indigo-500/30", text: "text-indigo-700 dark:text-indigo-300", ribbon: "rgba(99, 102, 241, 0.34)" },
  { id: "teal", bar: "bg-teal-500", bg: "bg-teal-500/10", ring: "ring-teal-500/30", text: "text-teal-700 dark:text-teal-300", ribbon: "rgba(20, 184, 166, 0.34)" },
  { id: "fuchsia", bar: "bg-fuchsia-500", bg: "bg-fuchsia-500/10", ring: "ring-fuchsia-500/30", text: "text-fuchsia-700 dark:text-fuchsia-300", ribbon: "rgba(217, 70, 239, 0.34)" },
] as const;

export type GroupColor = (typeof GROUP_COLORS)[number];

export type SegmentGroupInfo = {
  alignmentId: string;
  color: GroupColor;
  kind: Alignment["kind"];
};

export function buildSegmentGroupMap(
  alignments: Alignment[]
): Map<string, SegmentGroupInfo> {
  const map = new Map<string, SegmentGroupInfo>();

  alignments.forEach((alignment, index) => {
    const color = GROUP_COLORS[index % GROUP_COLORS.length];
    const info: SegmentGroupInfo = {
      alignmentId: alignment.id,
      color,
      kind: alignment.kind,
    };

    for (const id of [...alignment.sourceSegmentIds, ...alignment.targetSegmentIds]) {
      map.set(id, info);
    }
  });

  return map;
}

export function getAlignmentForSegment(
  segmentId: string,
  alignments: Alignment[]
): Alignment | null {
  return (
    alignments.find(
      (alignment) =>
        alignment.sourceSegmentIds.includes(segmentId) ||
        alignment.targetSegmentIds.includes(segmentId)
    ) ?? null
  );
}

export function getLinkedSegmentIds(
  segmentId: string,
  alignments: Alignment[]
): string[] {
  const alignment = getAlignmentForSegment(segmentId, alignments);
  if (!alignment) return [segmentId];

  return Array.from(
    new Set([
      segmentId,
      ...alignment.sourceSegmentIds,
      ...alignment.targetSegmentIds,
    ])
  );
}

export function getSegmentsForAlignment(
  alignment: Alignment,
  segments: Segment[]
): { source: Segment[]; target: Segment[] } {
  const byId = new Map(segments.map((segment) => [segment.id, segment]));

  return {
    source: alignment.sourceSegmentIds
      .map((id) => byId.get(id))
      .filter((segment): segment is Segment => Boolean(segment)),
    target: alignment.targetSegmentIds
      .map((id) => byId.get(id))
      .filter((segment): segment is Segment => Boolean(segment)),
  };
}

export function isSourceSegment(segmentId: string) {
  return segmentId.includes(":source:");
}

export function segmentSide(segmentId: string): "source" | "target" {
  return isSourceSegment(segmentId) ? "source" : "target";
}
