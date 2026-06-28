"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Alignment, MobileColumn, PoemEdition, Segment, ViewMode } from "@/lib/types";
import {
  buildSegmentGroupMap,
  getAlignmentForSegment,
  getLinkedSegmentIds,
  isSourceSegment,
} from "@/lib/alignments";
import { cn } from "@/lib/utils";
import { SourceColumn, TargetColumn } from "./SourceColumn";
import { ConnectionDock, ConnectionLegend } from "./ConnectionDock";
import { ConnectionRibbons } from "./ConnectionRibbons";
import { ReaderToolbar } from "./ReaderToolbar";
import { CommentPanel } from "@/app/components/comments/CommentPanel";
import { useLocalComments } from "@/app/components/comments/useLocalComments";
import { KeyboardShortcuts } from "./KeyboardShortcuts";

type ParallelReaderProps = {
  edition: PoemEdition;
  initialAlignments?: Alignment[];
  studioMode?: boolean;
};

export function ParallelReader({
  edition,
  initialAlignments,
  studioMode = false,
}: ParallelReaderProps) {
  const [mode, setMode] = useState<ViewMode>(studioMode ? "align" : "read");
  const [readMode, setReadMode] = useState(false);
  const [showConnections, setShowConnections] = useState(true);
  const [mobileColumn, setMobileColumn] = useState<MobileColumn>("both");
  const [focusedSegmentId, setFocusedSegmentId] = useState<string | null>(null);
  const [stagingIds, setStagingIds] = useState<string[]>([]);
  const [alignments, setAlignments] = useState<Alignment[]>(
    initialAlignments ?? edition.alignments
  );
  const [showComments, setShowComments] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const leftScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const elementMap = useRef<Map<string, HTMLElement>>(new Map());

  const comments = useLocalComments(edition.poem.id);
  const groupMap = useMemo(() => buildSegmentGroupMap(alignments), [alignments]);

  const focusedIds = useMemo(() => {
    if (!focusedSegmentId || !showConnections) return new Set<string>();
    return new Set(getLinkedSegmentIds(focusedSegmentId, alignments));
  }, [alignments, focusedSegmentId, showConnections]);

  const activeAlignment = useMemo(() => {
    if (!focusedSegmentId) return null;
    return getAlignmentForSegment(focusedSegmentId, alignments);
  }, [alignments, focusedSegmentId]);

  const activeColor = focusedSegmentId ? groupMap.get(focusedSegmentId) ?? null : null;

  const stagedSet = useMemo(() => new Set(stagingIds), [stagingIds]);

  const registerRef = useCallback((segmentId: string, element: HTMLElement | null) => {
    if (element) elementMap.current.set(segmentId, element);
    else elementMap.current.delete(segmentId);
  }, []);

  const getElement = useCallback(
    (segmentId: string) => elementMap.current.get(segmentId) ?? null,
    []
  );

  const scrollToSegment = useCallback((segmentId: string) => {
    const element = elementMap.current.get(segmentId);
    if (!element) return;

    element.scrollIntoView({ behavior: "smooth", block: "center" });
    setFocusedSegmentId(segmentId);
  }, []);

  const handleReadClick = useCallback(
    (segment: Segment) => {
      const alignment = getAlignmentForSegment(segment.id, alignments);
      if (!alignment) {
        setFocusedSegmentId(null);
        return;
      }

      setFocusedSegmentId((current) =>
        current === segment.id ? null : segment.id
      );
    },
    [alignments]
  );

  const toggleStaging = useCallback((segmentId: string) => {
    setStagingIds((current) =>
      current.includes(segmentId)
        ? current.filter((id) => id !== segmentId)
        : [...current, segmentId]
    );
  }, []);

  const createStagedConnection = useCallback(() => {
    const sourceIds = stagingIds.filter((id) => isSourceSegment(id));
    const targetIds = stagingIds.filter((id) => !isSourceSegment(id));

    if (sourceIds.length === 0 || targetIds.length === 0) return;

    const isCross =
      sourceIds.length > 1 &&
      targetIds.length > 1 &&
      sourceIds.some((_, index) => {
        const sourceOrder = Number(sourceIds[index]?.split(":line-")[1] ?? 0);
        const targetOrder = Number(targetIds[index]?.split(":line-")[1] ?? 0);
        return sourceOrder !== targetOrder;
      });

    const isPartial = sourceIds.length !== targetIds.length;

    let kind: Alignment["kind"] = "parallel";
    if (isCross) kind = "cross";
    else if (isPartial) kind = "partial";

    const newAlignment: Alignment = {
      id: `align-${crypto.randomUUID()}`,
      poemId: edition.poem.id,
      sourceSegmentIds: sourceIds,
      targetSegmentIds: targetIds,
      kind,
      createdBy: "editor",
    };

    setAlignments((current) => [...current, newAlignment]);
    setStagingIds([]);
    setFocusedSegmentId(sourceIds[0] ?? targetIds[0] ?? null);
  }, [edition.poem.id, stagingIds]);

  const handleAlignClick = useCallback(
    (segment: Segment) => {
      toggleStaging(segment.id);
    },
    [toggleStaging]
  );

  const handleLineClick = useCallback(
    (segment: Segment) => {
      if (mode === "align") {
        handleAlignClick(segment);
        return;
      }

      if (mode === "read") {
        handleReadClick(segment);
      }
    },
    [handleAlignClick, handleReadClick, mode]
  );

  const saveAlignments = useCallback(async () => {
    await fetch(`/api/alignments?poemId=${edition.poem.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alignments }),
    });
  }, [alignments, edition.poem.id]);

  const deleteFocusedAlignment = useCallback(() => {
    if (!activeAlignment) return;
    setAlignments((current) =>
      current.filter((alignment) => alignment.id !== activeAlignment.id)
    );
    setFocusedSegmentId(null);
  }, [activeAlignment]);

  const stagingSummary = useMemo(() => {
    const sourceCount = stagingIds.filter((id) => isSourceSegment(id)).length;
    const targetCount = stagingIds.length - sourceCount;
    return { sourceCount, targetCount };
  }, [stagingIds]);

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
          setShowConnections((value) => !value);
          break;
        case "c":
          setMode("comment");
          setShowComments(true);
          break;
        case "a":
          setMode("align");
          setFocusedSegmentId(null);
          break;
        case "escape":
          setStagingIds([]);
          setFocusedSegmentId(null);
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

    comments.createThread({
      segmentId,
      exact: selection.toString().trim(),
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
              showConnections={showConnections}
              mobileColumn={mobileColumn}
              commentCount={comments.threads.length}
              studioMode={studioMode}
              onModeChange={(nextMode) => {
                setMode(nextMode);
                if (nextMode === "comment") setShowComments(true);
                if (nextMode === "align") {
                  setFocusedSegmentId(null);
                  setStagingIds([]);
                }
              }}
              onToggleConnections={() => {
                setShowConnections((value) => !value);
              }}
              onToggleComments={() => setShowComments((value) => !value)}
              onMobileColumnChange={setMobileColumn}
              onSaveAlignments={saveAlignments}
              onDeleteAlignment={deleteFocusedAlignment}
              onToggleReadMode={() => setReadMode(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {!readMode && !showConnections && (
        <div className="mt-3 rounded-xl border border-border bg-paper-elevated px-4 py-2 text-sm text-muted dark:bg-ink-elevated">
          Connections hidden — press <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-xs">L</kbd> or click Connections to show ribbons
        </div>
      )}

      {!readMode && showConnections && (
        <div className="mt-3">
          <ConnectionLegend count={alignments.length} />
        </div>
      )}

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
          "relative mt-4 flex min-h-0 flex-1 gap-0",
          showComments ? "lg:pr-[340px]" : ""
        )}
      >
        <div
          ref={containerRef}
          className={cn(
            "relative flex min-h-[60vh] flex-1 rounded-2xl border border-border bg-paper-elevated/60 p-4 shadow-sm backdrop-blur-sm dark:bg-ink-elevated/40 md:p-8",
            mobileColumn === "both" ? "flex-row gap-10" : "flex-col gap-6",
            activeAlignment && "pb-44 md:pb-48"
          )}
          onMouseUp={handleTextSelection}
        >
          {showConnections && activeAlignment && activeColor && mobileColumn === "both" && (
            <ConnectionRibbons
              alignment={activeAlignment}
              containerRef={containerRef}
              leftScrollRef={leftScrollRef}
              rightScrollRef={rightScrollRef}
              getElement={getElement}
              ribbonColor={activeColor.color.ribbon}
              visible
            />
          )}
          {mode === "align" && (
            <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center pt-3">
              <span className="rounded-full bg-ink/85 px-4 py-1.5 text-xs text-paper shadow-lg backdrop-blur-sm dark:bg-paper/90 dark:text-ink">
                Select passages on both sides, then create a connection
              </span>
            </div>
          )}

          {(mobileColumn === "source" || mobileColumn === "both") && (
            <SourceColumn
              segments={edition.segments}
              groupMap={groupMap}
              focusedIds={focusedIds}
              dimUnfocused={showConnections}
              stagedIds={stagedSet}
              mode={mode}
              languageLabel={edition.book.sourceLanguage.toUpperCase()}
              scrollRef={leftScrollRef}
              onLineClick={handleLineClick}
              registerRef={registerRef}
              className={cn(mobileColumn === "both" ? "w-1/2" : "w-full")}
            />
          )}

          {mobileColumn === "both" && (
            <div
              className="hidden w-px shrink-0 bg-gradient-to-b from-transparent via-border to-transparent md:block"
              aria-hidden
            />
          )}

          {(mobileColumn === "target" || mobileColumn === "both") && (
            <TargetColumn
              segments={edition.segments}
              groupMap={groupMap}
              focusedIds={focusedIds}
              dimUnfocused={showConnections}
              stagedIds={stagedSet}
              mode={mode}
              languageLabel={edition.book.targetLanguage.toUpperCase()}
              scrollRef={rightScrollRef}
              onLineClick={handleLineClick}
              registerRef={registerRef}
              className={cn(mobileColumn === "both" ? "w-1/2" : "w-full")}
            />
          )}

          {showConnections && activeAlignment && activeColor && (
            <ConnectionDock
              alignment={activeAlignment}
              color={activeColor.color}
              segments={edition.segments}
              onJumpTo={scrollToSegment}
              onClose={() => setFocusedSegmentId(null)}
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

      {mode === "align" && stagingIds.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-paper-elevated px-4 py-3 dark:bg-ink-elevated">
          <p className="text-sm text-muted">
            Staging {stagingSummary.sourceCount} original and {stagingSummary.targetCount} translation
            {stagingSummary.targetCount === 1 ? "" : "s"}
          </p>
          <div className="ml-auto flex gap-2">
            <button
              type="button"
              onClick={() => setStagingIds([])}
              className="rounded-full px-3 py-1.5 text-sm text-muted hover:text-ink dark:hover:text-paper"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={createStagedConnection}
              disabled={
                stagingSummary.sourceCount === 0 || stagingSummary.targetCount === 0
              }
              className="rounded-full bg-accent px-4 py-1.5 text-sm text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Create connection
            </button>
          </div>
        </div>
      )}

      <KeyboardShortcuts open={showShortcuts} onClose={() => setShowShortcuts(false)} />
    </div>
  );
}
