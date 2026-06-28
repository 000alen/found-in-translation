"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Alignment, MobileColumn, PoemEdition, Segment, ViewMode } from "@/lib/types";
import { cn } from "@/lib/utils";
import { LinkCanvas } from "./LinkCanvas";
import { SourceColumn, TargetColumn } from "./SourceColumn";
import { useSyncScroll } from "./SyncScroll";
import { ReaderToolbar } from "./ReaderToolbar";
import { CommentPanel } from "@/app/components/comments/CommentPanel";
import { useLocalComments } from "@/app/components/comments/useLocalComments";
import { KeyboardShortcuts } from "./KeyboardShortcuts";

type ParallelReaderProps = {
  edition: PoemEdition;
  initialAlignments?: Alignment[];
  studioMode?: boolean;
};

function getLinkedSegmentIds(
  segmentId: string,
  alignments: Alignment[]
): string[] {
  const linked = new Set<string>([segmentId]);

  for (const alignment of alignments) {
    const inSource = alignment.sourceSegmentIds.includes(segmentId);
    const inTarget = alignment.targetSegmentIds.includes(segmentId);
    if (!inSource && !inTarget) continue;

    alignment.sourceSegmentIds.forEach((id) => linked.add(id));
    alignment.targetSegmentIds.forEach((id) => linked.add(id));
  }

  return Array.from(linked);
}

export function ParallelReader({
  edition,
  initialAlignments,
  studioMode = false,
}: ParallelReaderProps) {
  const [mode, setMode] = useState<ViewMode>(studioMode ? "align" : "read");
  const [readMode, setReadMode] = useState(false);
  const [showLinks, setShowLinks] = useState(true);
  const [mobileColumn, setMobileColumn] = useState<MobileColumn>("both");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [linkSourceId, setLinkSourceId] = useState<string | null>(null);
  const [alignments, setAlignments] = useState<Alignment[]>(
    initialAlignments ?? edition.alignments
  );
  const [showComments, setShowComments] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const leftScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);
  const elementMap = useRef<Map<string, HTMLElement>>(new Map());

  const comments = useLocalComments(edition.poem.id);

  useSyncScroll({
    leftRef: leftScrollRef,
    rightRef: rightScrollRef,
    enabled: mobileColumn === "both" && !readMode,
  });

  const highlightedIds = useMemo(() => {
    if (!hoveredId) return new Set<string>();
    return new Set(getLinkedSegmentIds(hoveredId, alignments));
  }, [alignments, hoveredId]);

  const registerRef = useCallback((segmentId: string, element: HTMLElement | null) => {
    if (element) elementMap.current.set(segmentId, element);
    else elementMap.current.delete(segmentId);
  }, []);

  const getElement = useCallback(
    (segmentId: string) => elementMap.current.get(segmentId) ?? null,
    []
  );

  const handleLineClick = useCallback(
    (segment: Segment) => {
      if (mode !== "align") return;

      if (!linkSourceId) {
        setLinkSourceId(segment.id);
        return;
      }

      if (linkSourceId === segment.id) {
        setLinkSourceId(null);
        return;
      }

      const firstIsSource = linkSourceId.includes(":source:");
      const secondIsSource = segment.id.includes(":source:");

      if (firstIsSource === secondIsSource) {
        setLinkSourceId(segment.id);
        return;
      }

      const sourceId = firstIsSource ? linkSourceId : segment.id;
      const targetId = firstIsSource ? segment.id : linkSourceId;

      const newAlignment: Alignment = {
        id: `align-${crypto.randomUUID()}`,
        poemId: edition.poem.id,
        sourceSegmentIds: [sourceId],
        targetSegmentIds: [targetId],
        kind: "parallel",
        createdBy: "editor",
      };

      setAlignments((current) => [...current, newAlignment]);
      setLinkSourceId(null);
    },
    [edition.poem.id, linkSourceId, mode]
  );

  const saveAlignments = useCallback(async () => {
    await fetch(`/api/alignments?poemId=${edition.poem.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alignments }),
    });
  }, [alignments, edition.poem.id]);

  const deleteSelectedAlignment = useCallback(() => {
    if (!selectedId) return;
    setAlignments((current) =>
      current.filter(
        (alignment) =>
          !alignment.sourceSegmentIds.includes(selectedId) &&
          !alignment.targetSegmentIds.includes(selectedId)
      )
    );
    setSelectedId(null);
  }, [selectedId]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case "r":
          setReadMode((value) => !value);
          break;
        case "l":
          setShowLinks((value) => !value);
          break;
        case "c":
          setMode("comment");
          setShowComments(true);
          break;
        case "a":
          setMode("align");
          break;
        case "escape":
          setLinkSourceId(null);
          setSelectedId(null);
          setShowShortcuts(false);
          break;
        case "?":
          setShowShortcuts((value) => !value);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleTextSelection = useCallback(() => {
    if (mode !== "comment") return;

    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.toString().trim()) return;

    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    const element =
      container instanceof HTMLElement
        ? container.closest("[data-segment-id]")
        : container.parentElement?.closest("[data-segment-id]");

    const segmentId = element?.getAttribute("data-segment-id");
    if (!segmentId) return;

    const exact = selection.toString().trim();
    comments.createThread({
      segmentId,
      exact,
      content: "",
    });
    setShowComments(true);
    selection.removeAllRanges();
  }, [comments, mode]);

  return (
    <div
      className={cn(
        "relative flex min-h-[70vh] flex-col",
        readMode && "reader-read-mode"
      )}
    >
      <AnimatePresence>
        {!readMode && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <ReaderToolbar
              mode={mode}
              showLinks={showLinks}
              mobileColumn={mobileColumn}
              commentCount={comments.threads.length}
              studioMode={studioMode}
              onModeChange={(nextMode) => {
          setMode(nextMode);
          if (nextMode === "comment") setShowComments(true);
        }}
              onToggleLinks={() => setShowLinks((value) => !value)}
              onToggleComments={() => setShowComments((value) => !value)}
              onMobileColumnChange={setMobileColumn}
              onSaveAlignments={saveAlignments}
              onDeleteAlignment={deleteSelectedAlignment}
              onToggleReadMode={() => setReadMode(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {readMode && (
        <button
          type="button"
          onClick={() => setReadMode(false)}
          className="fixed right-6 top-6 z-50 rounded-full bg-ink/80 px-4 py-2 text-sm text-paper backdrop-blur-sm transition hover:bg-ink"
        >
          Exit read mode
        </button>
      )}

      <div
        className={cn(
          "relative mt-6 flex min-h-0 flex-1 gap-0",
          showComments ? "lg:pr-[340px]" : ""
        )}
      >
        <div
          ref={containerRef}
          className={cn(
            "relative flex min-h-[60vh] flex-1 rounded-2xl border border-border bg-paper-elevated/60 p-4 shadow-sm backdrop-blur-sm dark:bg-ink-elevated/40 md:p-8",
            mobileColumn === "both" ? "flex-row gap-8" : "flex-col gap-6"
          )}
          onMouseUp={handleTextSelection}
        >
        {mode === "align" && (
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center pt-2">
            <span className="rounded-full bg-accent/90 px-3 py-1 text-xs text-white shadow-sm">
              Alignment mode — click a line, then its translation
            </span>
          </div>
        )}
          <LinkCanvas
            alignments={alignments}
            activeSegmentIds={highlightedIds}
            containerRef={containerRef}
            getElement={getElement}
            visible={showLinks && mobileColumn === "both"}
          />

          {(mobileColumn === "source" || mobileColumn === "both") && (
            <SourceColumn
              segments={edition.segments}
              alignments={alignments}
              highlightedIds={highlightedIds}
              selectedId={selectedId}
              linkSourceId={linkSourceId}
              mode={mode}
              languageLabel={edition.book.sourceLanguage.toUpperCase()}
              scrollRef={leftScrollRef}
              onHover={setHoveredId}
              onLineClick={(segment) => {
                if (mode === "align") handleLineClick(segment);
                else setSelectedId(segment.id);
              }}
              registerRef={registerRef}
              className={cn(mobileColumn === "both" ? "w-1/2" : "w-full")}
            />
          )}

          {mobileColumn === "both" && (
            <div className="hidden w-px shrink-0 bg-border md:block" aria-hidden />
          )}

          {(mobileColumn === "target" || mobileColumn === "both") && (
            <TargetColumn
              segments={edition.segments}
              alignments={alignments}
              highlightedIds={highlightedIds}
              selectedId={selectedId}
              linkSourceId={linkSourceId}
              mode={mode}
              languageLabel={edition.book.targetLanguage.toUpperCase()}
              scrollRef={rightScrollRef}
              onHover={setHoveredId}
              onLineClick={(segment) => {
                if (mode === "align") handleLineClick(segment);
                else setSelectedId(segment.id);
              }}
              registerRef={registerRef}
              className={cn(mobileColumn === "both" ? "w-1/2" : "w-full")}
            />
          )}
        </div>

        <CommentPanel
          open={showComments}
          onClose={() => setShowComments(false)}
          threads={comments.threads}
          onAddReply={comments.addReply}
          onResolve={comments.resolveThread}
          onSelectThread={comments.selectThread}
          selectedThreadId={comments.selectedThreadId}
          pendingComposer={comments.pendingComposer}
          onSubmitPending={comments.submitPending}
          onCancelPending={comments.cancelPending}
        />
      </div>

      <KeyboardShortcuts open={showShortcuts} onClose={() => setShowShortcuts(false)} />

      {linkSourceId && mode === "align" && (
        <div className="mt-4 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-ink dark:text-paper">
          Click a line in the opposite column to create a link. Press Esc to cancel.
        </div>
      )}
    </div>
  );
}
