"use client";

import { useMemo } from "react";
import type { ContentType, Segment } from "@/lib/types";
import type { AnchorGroupInfo } from "@/lib/alignments";
import { getLanguage, scriptClassFor } from "@/lib/languages";
import { LanguageLabel } from "@/app/components/LanguageLabel";
import { PoemLine } from "@/app/components/poetry/PoemLine";
import { ProseParagraph } from "@/app/components/text/ProseParagraph";
import { cn } from "@/lib/utils";

type TextColumnProps = {
  segments: Segment[];
  side: "source" | "target";
  contentType: ContentType;
  languageCode: string;
  groupMap: Map<string, AnchorGroupInfo>;
  focusedIds: Set<string>;
  dimUnfocused: boolean;
  stagedIds: Set<string>;
  mode?: "read" | "align" | "comment";
  scrollRef?: React.RefObject<HTMLDivElement>;
  onAnchorClick?: (anchorId: string) => void;
  registerRef?: (anchorId: string, element: HTMLElement | null) => void;
  className?: string;
};

export function TextColumn({
  segments,
  side,
  contentType,
  languageCode,
  groupMap,
  focusedIds,
  dimUnfocused,
  stagedIds,
  mode = "read",
  scrollRef,
  onAnchorClick,
  registerRef,
  className,
}: TextColumnProps) {
  const lang = getLanguage(languageCode);
  const scriptClass = scriptClassFor(languageCode);

  const paragraphs = useMemo(
    () => segments.filter((s) => s.side === side && s.kind === "paragraph"),
    [segments, side]
  );

  const lines = useMemo(
    () => segments.filter((s) => s.side === side && s.kind === "line").sort((a, b) => a.order - b.order),
    [segments, side]
  );

  const spansByParent = useMemo(() => {
    const map = new Map<string, Segment[]>();
    for (const segment of segments) {
      if (segment.kind !== "span" || segment.side !== side || !segment.parentId) continue;
      const list = map.get(segment.parentId) ?? [];
      list.push(segment);
      map.set(segment.parentId, list);
    }
    return map;
  }, [segments, side]);

  const heading = side === "source" ? "Original" : "Translation";

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      <div className="mb-5 flex items-baseline justify-between gap-3">
        <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted">
          {heading}
        </span>
        <LanguageLabel
          code={languageCode}
          className="text-[11px] text-muted"
        />
      </div>

      <div
        ref={scrollRef}
        lang={lang.bcp47}
        dir={lang.direction}
        className={cn(
          "min-h-0 flex-1 overflow-y-auto scroll-smooth",
          scriptClass
        )}
      >
        {contentType === "prose" ? (
          paragraphs.map((paragraph) => (
            <ProseParagraph
              key={paragraph.id}
              segment={paragraph}
              languageCode={languageCode}
              spans={spansByParent.get(paragraph.id) ?? []}
              groupMap={groupMap}
              focusedIds={focusedIds}
              dimUnfocused={dimUnfocused}
              stagedIds={stagedIds}
              mode={mode}
              onAnchorClick={onAnchorClick}
              registerRef={registerRef}
            />
          ))
        ) : (
          <div className="poem-stanza">
            {lines.map((line) => {
              const group = groupMap.get(line.id) ?? null;
              const hasFocus = focusedIds.size > 0;
              const isFocused = focusedIds.has(line.id);
              const isDimmed = dimUnfocused && hasFocus && !isFocused;

              return (
                <PoemLine
                  key={line.id}
                  segment={line}
                  languageCode={languageCode}
                  group={group}
                  isFocused={isFocused}
                  isDimmed={isDimmed}
                  isStaged={stagedIds.has(line.id)}
                  mode={mode}
                  onClick={(segment) => onAnchorClick?.(segment.id)}
                  registerRef={(id, el) => registerRef?.(id, el)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
