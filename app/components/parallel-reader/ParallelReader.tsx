"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Alignment, MobileColumn, TextEdition, ViewMode } from "@/lib/types";
import { alignmentFromPassageIds } from "@/lib/anchors";
import {
  buildAnchorGroupMap,
  getAlignmentForAnchor,
  getLinkedAnchorIds,
  groupColorToConnectionTheme,
  isSourceAnchor,
} from "@/lib/alignments";
import { cn } from "@/lib/utils";
import { TextColumn } from "@/app/components/text/TextColumn";
import { ConnectionOverlay } from "@/app/components/connections";
import { ConnectionDock } from "./ConnectionDock";
import { ReaderToolbar } from "./ReaderToolbar";
import { CommentPanel } from "@/app/components/comments/CommentPanel";
import { useLocalComments } from "@/app/components/comments/useLocalComments";
import { KeyboardShortcuts } from "./KeyboardShortcuts";

type ParallelReaderProps = {
  edition: TextEdition;
  initialAlignments?: Alignment[];
  studioMode?: boolean;
};

export function ParallelReader({
  edition,
  initialAlignments,
  studioMode = false,
}: ParallelReaderProps) {
  const work = edition.work ?? edition.poem!;
  const contentType = work.contentType;

  const [mode, setMode] = useState<ViewMode>(studioMode ? "align" : "read");
  const [readMode, setReadMode] = useState(false);
  const [showConnections, setShowConnections] = useState(true);
  const [mobileColumn, setMobileColumn] = useState<MobileColumn>("both");
  const [focusedAnchorId, setFocusedAnchorId] = useState<string | null>(null);
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

  const comments = useLocalComments(work.id);
  const groupMap = useMemo(() => buildAnchorGroupMap(alignments), [alignments]);

  const focusedIds = useMemo(() => {
    if (!focusedAnchorId || !showConnections) return new Set<string>();
    return new Set(getLinkedAnchorIds(focusedAnchorId, alignments));
  }, [alignments, focusedAnchorId, showConnections]);

  const activeAlignment = useMemo(() => {
    if (!focusedAnchorId) return null;
    return getAlignmentForAnchor(focusedAnchorId, alignments);
  }, [alignments, focusedAnchorId]);

  const activeColor = focusedAnchorId ? groupMap.get(focusedAnchorId) ?? null : null;

  const stagedSet = useMemo(() => new Set(stagingIds), [stagingIds]);

  const registerRef = useCallback((anchorId: string, element: HTMLElement | null) => {
    if (element) elementMap.current.set(anchorId, element);
    else elementMap.current.delete(anchorId);
  }, []);

  const getElement = useCallback(
    (anchorId: string) => elementMap.current.get(anchorId) ?? null,
    []
  );

  const scrollToAnchor = useCallback((anchorId: string) => {
    const element = elementMap.current.get(anchorId);
    if (!element) return;

    element.scrollIntoView({ behavior: "smooth", block: "center" });
    setFocusedAnchorId(anchorId);
  }, []);

  const handleReadClick = useCallback(
    (anchorId: string) => {
      const alignment = getAlignmentForAnchor(anchorId, alignments);
      if (!alignment) {
        setFocusedAnchorId(null);
        return;
      }

      setFocusedAnchorId((current) => (current === anchorId ? null : anchorId));
    },
    [alignments]
  );

  const toggleStaging = useCallback((anchorId: string) => {
    setStagingIds((current) =>
      current.includes(anchorId)
        ? current.filter((id) => id !== anchorId)
        : [...current, anchorId]
    );
  }, []);

  const createStagedConnection = useCallback(() => {
    const sourceIds = stagingIds.filter((id) => isSourceAnchor(id));
    const targetIds = stagingIds.filter((id) => !isSourceAnchor(id));

    if (sourceIds.length === 0 || targetIds.length === 0) return;

    const newAlignment = alignmentFromPassageIds(
      work.id,
      sourceIds,
      targetIds,
      edition.segments,
      sourceIds.length !== targetIds.length ? "partial" : "parallel"
    );

    setAlignments((current) => [...current, newAlignment]);
    setStagingIds([]);
    setFocusedAnchorId(sourceIds[0] ?? targetIds[0] ?? null);
  }, [edition.segments, stagingIds, work.id]);

  const handleAnchorClick = useCallback(
    (anchorId: string) => {
      if (mode === "align") {
        toggleStaging(anchorId);
        return;
      }

      if (mode === "read") {
        handleReadClick(anchorId);
      }
    },
    [handleReadClick, mode, toggleStaging]
  );

  const saveAlignments = useCallback(async () => {
    await fetch(`/api/alignments?poemId=${work.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alignments }),
    });
  }, [alignments, work.id]);

  const deleteFocusedAlignment = useCallback(() => {
    if (!activeAlignment) return;
    setAlignments((current) =>
      current.filter((alignment) => alignment.id !== activeAlignment.id)
    );
    setFocusedAnchorId(null);
  }, [activeAlignment]);

  const stagingSummary = useMemo(() => {
    const sourceCount = stagingIds.filter((id) => isSourceAnchor(id)).length;
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
          if (!studioMode) break;
          setMode("align");
          setFocusedAnchorId(null);
          break;
        case "escape":
          setStagingIds([]);
          setFocusedAnchorId(null);
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
        ? container.closest("[data-segment-id], [data-anchor-id]")
        : container.parentElement?.closest("[data-segment-id], [data-anchor-id]");

    const segmentId =
      element?.getAttribute("data-segment-id") ??
      element?.getAttribute("data-anchor-id");
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
                  setFocusedAnchorId(null);
                  setStagingIds([]);
                }
              }}
              onToggleConnections={() => {
                setShowConnections((value) => !value);
              }}
              onToggleComments={() => {
                setMode("comment");
                setShowComments((value) => !value);
              }}
              onMobileColumnChange={setMobileColumn}
              onSaveAlignments={saveAlignments}
              onDeleteAlignment={deleteFocusedAlignment}
              onToggleReadMode={() => setReadMode(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {readMode && (
        <button
          type="button"
          onClick={() => setReadMode(false)}
          className="fixed right-6 top-6 z-50 rounded-full border border-border bg-surface/90 px-4 py-2 text-sm text-ink backdrop-blur-sm transition hover:bg-surface-2"
        >
          Exit read mode
        </button>
      )}

      <div
        className={cn(
          "relative mt-3 flex min-h-0 flex-1 gap-0",
          showComments ? "lg:pr-[340px]" : ""
        )}
      >
        <div
          ref={containerRef}
          className={cn(
            "reader-layout relative flex min-h-[68vh] flex-1 border-y border-border bg-transparent py-5",
            mobileColumn === "both" ? "flex-row gap-12 xl:gap-16" : "flex-col gap-6",
            activeAlignment && "pb-44 md:pb-48"
          )}
          onMouseUp={handleTextSelection}
        >
          {mode === "align" && (
            <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center pt-3">
              <span className="rounded-full border border-border bg-surface/95 px-4 py-1.5 text-xs text-muted shadow-sm backdrop-blur-sm">
                Select passages on both sides, then create a connection
              </span>
            </div>
          )}

          {(mobileColumn === "source" || mobileColumn === "both") && (
            <TextColumn
              segments={edition.segments}
              side="source"
              contentType={contentType}
              groupMap={groupMap}
              focusedIds={focusedIds}
              dimUnfocused={showConnections}
              stagedIds={stagedSet}
              mode={mode}
              languageCode={edition.book.sourceLanguage}
              scrollRef={leftScrollRef}
              onAnchorClick={handleAnchorClick}
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
            <TextColumn
              segments={edition.segments}
              side="target"
              contentType={contentType}
              groupMap={groupMap}
              focusedIds={focusedIds}
              dimUnfocused={showConnections}
              stagedIds={stagedSet}
              mode={mode}
              languageCode={edition.book.targetLanguage}
              scrollRef={rightScrollRef}
              onAnchorClick={handleAnchorClick}
              registerRef={registerRef}
              className={cn(mobileColumn === "both" ? "w-1/2" : "w-full")}
            />
          )}

          {showConnections && activeAlignment && activeColor && mobileColumn === "both" && (
            <ConnectionOverlay
              alignment={activeAlignment}
              containerRef={containerRef}
              leftScrollRef={leftScrollRef}
              rightScrollRef={rightScrollRef}
              getElement={getElement}
              theme={groupColorToConnectionTheme(activeColor.color)}
              visible
            />
          )}

          {showConnections && activeAlignment && activeColor && (
            <ConnectionDock
              alignment={activeAlignment}
              color={activeColor.color}
              segments={edition.segments}
              onJumpTo={scrollToAnchor}
              onClose={() => setFocusedAnchorId(null)}
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
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3">
          <p className="text-sm text-muted">
            Staging {stagingSummary.sourceCount} original and {stagingSummary.targetCount}{" "}
            translation{stagingSummary.targetCount === 1 ? "" : "s"}
          </p>
          <div className="ml-auto flex gap-2">
            <button
              type="button"
              onClick={() => setStagingIds([])}
              className="rounded-full px-3 py-1.5 text-sm text-muted transition hover:text-ink"
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
