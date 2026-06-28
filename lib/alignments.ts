import type { Alignment, Segment, TextAnchor } from "./types";
import type { ConnectionTheme } from "./connections/types";

export const GROUP_COLORS = [
  { id: "sage", bar: "bg-sage", bg: "bg-sage-soft", ring: "ring-sage/25", text: "text-sage-deep", connectionFill: "rgba(122, 140, 113, 0.28)", connectionStroke: "rgba(122, 140, 113, 0.55)" },
  { id: "clay", bar: "bg-clay", bg: "bg-clay-soft", ring: "ring-clay/25", text: "text-clay-deep", connectionFill: "rgba(181, 137, 110, 0.28)", connectionStroke: "rgba(181, 137, 110, 0.55)" },
  { id: "mist", bar: "bg-mist", bg: "bg-mist-soft", ring: "ring-mist/25", text: "text-mist-deep", connectionFill: "rgba(125, 148, 170, 0.28)", connectionStroke: "rgba(125, 148, 170, 0.55)" },
  { id: "rose", bar: "bg-rose-mark", bg: "bg-rose-soft", ring: "ring-rose-mark/25", text: "text-rose-deep", connectionFill: "rgba(196, 133, 133, 0.28)", connectionStroke: "rgba(196, 133, 133, 0.55)" },
  { id: "wheat", bar: "bg-wheat", bg: "bg-wheat-soft", ring: "ring-wheat/25", text: "text-wheat-deep", connectionFill: "rgba(196, 168, 108, 0.28)", connectionStroke: "rgba(196, 168, 108, 0.55)" },
  { id: "ink", bar: "bg-ink-faint", bg: "bg-surface-2", ring: "ring-border", text: "text-muted", connectionFill: "rgba(44, 40, 37, 0.14)", connectionStroke: "rgba(44, 40, 37, 0.32)" },
] as const;

export type GroupColor = (typeof GROUP_COLORS)[number];

export type AnchorGroupInfo = {
  alignmentId: string;
  color: GroupColor;
  kind: Alignment["kind"];
};

function anchorIdsFromAlignment(alignment: Alignment): string[] {
  const legacy = alignment as Alignment & { sourceSegmentIds?: string[]; targetSegmentIds?: string[] };
  if (alignment.sourceAnchors?.length) {
    return [
      ...alignment.sourceAnchors.map((anchor) => anchor.id),
      ...alignment.targetAnchors.map((anchor) => anchor.id),
    ];
  }
  return [...(legacy.sourceSegmentIds ?? []), ...(legacy.targetSegmentIds ?? [])];
}

export function buildAnchorGroupMap(alignments: Alignment[]): Map<string, AnchorGroupInfo> {
  const map = new Map<string, AnchorGroupInfo>();

  alignments.forEach((alignment, index) => {
    const color = GROUP_COLORS[index % GROUP_COLORS.length];
    const info: AnchorGroupInfo = { alignmentId: alignment.id, color, kind: alignment.kind };

    for (const id of anchorIdsFromAlignment(alignment)) {
      map.set(id, info);
    }
  });

  return map;
}

/** @deprecated */
export const buildSegmentGroupMap = buildAnchorGroupMap;
export type SegmentGroupInfo = AnchorGroupInfo;

export function getAlignmentForAnchor(
  anchorId: string,
  alignments: Alignment[]
): Alignment | null {
  return (
    alignments.find((alignment) => {
      const ids = anchorIdsFromAlignment(alignment);
      return ids.includes(anchorId);
    }) ?? null
  );
}

/** @deprecated */
export const getAlignmentForSegment = getAlignmentForAnchor;

export function getLinkedAnchorIds(anchorId: string, alignments: Alignment[]): string[] {
  const alignment = getAlignmentForAnchor(anchorId, alignments);
  if (!alignment) return [anchorId];
  return Array.from(new Set(anchorIdsFromAlignment(alignment)));
}

/** @deprecated */
export const getLinkedSegmentIds = getLinkedAnchorIds;

export function getAnchorsForAlignment(
  alignment: Alignment
): { source: TextAnchor[]; target: TextAnchor[] } {
  const legacy = alignment as Alignment & { sourceSegmentIds?: string[]; targetSegmentIds?: string[] };

  if (alignment.sourceAnchors?.length) {
    return { source: alignment.sourceAnchors, target: alignment.targetAnchors };
  }

  const toStub = (id: string): TextAnchor => ({ id, segmentId: id, quote: "" });
  return {
    source: (legacy.sourceSegmentIds ?? []).map(toStub),
    target: (legacy.targetSegmentIds ?? []).map(toStub),
  };
}

export function getSegmentsForAlignment(
  alignment: Alignment,
  segments: Segment[]
): { source: Segment[]; target: Segment[] } {
  const byId = new Map(segments.map((segment) => [segment.id, segment]));
  const { source, target } = getAnchorsForAlignment(alignment);

  return {
    source: source.map((a) => byId.get(a.segmentId)).filter((s): s is Segment => Boolean(s)),
    target: target.map((a) => byId.get(a.segmentId)).filter((s): s is Segment => Boolean(s)),
  };
}

export function isSourceAnchor(anchorId: string) {
  return anchorId.includes(":source:");
}

/** @deprecated */
export const isSourceSegment = isSourceAnchor;

export function groupColorToConnectionTheme(color: GroupColor): ConnectionTheme {
  return {
    fill: color.connectionFill,
    stroke: color.connectionStroke,
    strokeWidth: 1,
  };
}
