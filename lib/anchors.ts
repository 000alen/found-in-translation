import type { Alignment, Segment, TextAnchor, TextRange } from "./types";

export function anchorIdFromSegment(segment: Segment): string {
  return segment.id;
}

export function segmentToAnchor(segment: Segment, parentText?: string): TextAnchor {
  const quote = segment.kind === "span" && segment.range && parentText
    ? parentText.slice(segment.range.start, segment.range.end)
    : segment.text;

  let prefix: string | undefined;
  let suffix: string | undefined;

  if (segment.kind === "span" && segment.range && parentText) {
    prefix = parentText.slice(Math.max(0, segment.range.start - 24), segment.range.start);
    suffix = parentText.slice(segment.range.end, segment.range.end + 24);
  }

  return {
    id: segment.id,
    segmentId: segment.id,
    quote,
    range: segment.range,
    prefix,
    suffix,
  };
}

export function buildAnchorsFromSegments(segments: Segment[]): TextAnchor[] {
  const byId = new Map(segments.map((segment) => [segment.id, segment]));
  const anchors: TextAnchor[] = [];

  for (const segment of segments) {
    if (segment.kind === "stanza" || segment.kind === "title" || segment.kind === "note") {
      continue;
    }

    if (segment.kind === "span" && segment.parentId) {
      const parent = byId.get(segment.parentId);
      anchors.push(segmentToAnchor(segment, parent?.text));
      continue;
    }

    if (segment.kind === "line" || segment.kind === "paragraph") {
      anchors.push(segmentToAnchor(segment));
    }
  }

  return anchors;
}

export function alignmentFromPassageIds(
  workId: string,
  sourceIds: string[],
  targetIds: string[],
  segments: Segment[],
  kind: Alignment["kind"] = "parallel"
): Alignment {
  const byId = new Map(segments.map((segment) => [segment.id, segment]));
  const parentCache = new Map<string, string>();

  for (const segment of segments) {
    if (segment.kind === "paragraph") parentCache.set(segment.id, segment.text);
  }

  const toAnchor = (id: string): TextAnchor => {
    const segment = byId.get(id);
    if (!segment) {
      return { id, segmentId: id, quote: "" };
    }
    const parentText = segment.parentId ? parentCache.get(segment.parentId) : undefined;
    return segmentToAnchor(segment, parentText);
  };

  return {
    id: `align-${crypto.randomUUID()}`,
    workId,
    sourceAnchors: sourceIds.map(toAnchor),
    targetAnchors: targetIds.map(toAnchor),
    kind,
  };
}

/** Legacy alignments that used segment id arrays */
export function normalizeAlignment(
  alignment: Alignment & {
    sourceSegmentIds?: string[];
    targetSegmentIds?: string[];
  },
  segments: Segment[]
): Alignment {
  if (alignment.sourceAnchors?.length && alignment.targetAnchors?.length) {
    return alignment;
  }

  const workId = alignment.workId ?? alignment.poemId ?? "";
  const sourceIds = alignment.sourceSegmentIds ?? alignment.sourceAnchors?.map((a) => a.id) ?? [];
  const targetIds = alignment.targetSegmentIds ?? alignment.targetAnchors?.map((a) => a.id) ?? [];

  return alignmentFromPassageIds(workId, sourceIds, targetIds, segments, alignment.kind);
}

export function sliceRange(text: string, range: TextRange): string {
  return text.slice(range.start, range.end);
}

export function splitParagraphWithSpans(
  paragraphText: string,
  spans: Segment[]
): Array<{ type: "text"; value: string } | { type: "span"; segment: Segment }> {
  const ordered = [...spans]
    .filter((span) => span.range)
    .sort((a, b) => (a.range!.start - b.range!.start));

  const parts: Array<{ type: "text"; value: string } | { type: "span"; segment: Segment }> = [];
  let cursor = 0;

  for (const span of ordered) {
    const { start, end } = span.range!;
    if (start > cursor) {
      parts.push({ type: "text", value: paragraphText.slice(cursor, start) });
    }
    parts.push({ type: "span", segment: span });
    cursor = end;
  }

  if (cursor < paragraphText.length) {
    parts.push({ type: "text", value: paragraphText.slice(cursor) });
  }

  return parts;
}
