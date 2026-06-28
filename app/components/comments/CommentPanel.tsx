"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { CommentThread } from "./useLocalComments";
import { cn } from "@/lib/utils";

type CommentPanelProps = {
  open: boolean;
  onClose: () => void;
  threads: CommentThread[];
  selectedThreadId: string | null;
  pendingComposer: { segmentId: string; exact: string } | null;
  onAddReply: (threadId: string, content: string) => void;
  onResolve: (threadId: string) => void;
  onSelectThread: (threadId: string | null) => void;
  onSubmitPending: (content: string) => void;
  onCancelPending: () => void;
};

function ThreadComposer({
  placeholder,
  onSubmit,
  onCancel,
}: {
  placeholder: string;
  onSubmit: (value: string) => void;
  onCancel?: () => void;
}) {
  const [value, setValue] = useState("");

  return (
    <div className="space-y-2">
      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full resize-none rounded-xl border border-border bg-paper px-3 py-2 text-sm text-ink outline-none ring-accent/30 focus:ring-2 dark:bg-ink dark:text-paper"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            onSubmit(value);
            setValue("");
          }}
          className="rounded-full bg-accent px-4 py-1.5 text-sm text-white"
        >
          Post
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full px-3 py-1.5 text-sm text-muted"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

export function CommentPanel({
  open,
  onClose,
  threads,
  selectedThreadId,
  pendingComposer,
  onAddReply,
  onResolve,
  onSelectThread,
  onSubmitPending,
  onCancelPending,
}: CommentPanelProps) {
  const selectedThread = threads.find((thread) => thread.id === selectedThreadId) ?? null;

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 24 }}
          className="fixed bottom-0 right-0 top-auto z-40 flex h-[70vh] w-full flex-col border-t border-border bg-paper/95 backdrop-blur-xl dark:bg-ink/95 lg:absolute lg:bottom-auto lg:top-0 lg:h-full lg:w-[320px] lg:border-l lg:border-t-0"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <h3 className="text-sm font-medium text-ink dark:text-paper">Comments</h3>
              <p className="text-xs text-muted">Select text in comment mode to annotate</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-sm text-muted hover:text-ink dark:hover:text-paper"
            >
              Close
            </button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col">
            {pendingComposer && (
              <div className="border-b border-border p-4">
                <p className="mb-2 text-xs text-muted">
                  Comment on &ldquo;{pendingComposer.exact}&rdquo;
                </p>
                <ThreadComposer
                  placeholder="Write a comment…"
                  onSubmit={onSubmitPending}
                  onCancel={onCancelPending}
                />
              </div>
            )}

            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              {threads.length === 0 ? (
                <p className="px-2 py-8 text-center text-sm text-muted">
                  No comments yet. Switch to Comment mode and select text to start a thread.
                </p>
              ) : (
                <ul className="space-y-2">
                  {threads.map((thread) => (
                    <li key={thread.id}>
                      <button
                        type="button"
                        onClick={() => onSelectThread(thread.id)}
                        className={cn(
                          "w-full rounded-xl border px-3 py-3 text-left transition",
                          selectedThreadId === thread.id
                            ? "border-accent/40 bg-accent/10"
                            : "border-border bg-paper-elevated hover:border-accent/20 dark:bg-ink-elevated"
                        )}
                      >
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <span className="truncate text-xs font-medium text-accent">
                            &ldquo;{thread.exact}&rdquo;
                          </span>
                          <span
                            className={cn(
                              "shrink-0 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide",
                              thread.status === "open"
                                ? "bg-accent/15 text-accent"
                                : "bg-muted/15 text-muted"
                            )}
                          >
                            {thread.status}
                          </span>
                        </div>
                        <p className="line-clamp-2 text-sm text-ink dark:text-paper">
                          {thread.messages[0]?.content}
                        </p>
                        <p className="mt-1 text-xs text-muted">
                          {thread.messages.length} message
                          {thread.messages.length === 1 ? "" : "s"}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {selectedThread && (
              <div className="border-t border-border p-4">
                <div className="mb-3 max-h-40 space-y-3 overflow-y-auto">
                  {selectedThread.messages.map((message) => (
                    <div key={message.id} className="rounded-xl bg-paper-elevated p-3 dark:bg-ink-elevated">
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-ink dark:text-paper">
                          {message.author}
                        </span>
                        <time className="text-[10px] text-muted">
                          {new Date(message.createdAt).toLocaleString()}
                        </time>
                      </div>
                      <p className="text-sm text-ink/90 dark:text-paper/90">{message.content}</p>
                    </div>
                  ))}
                </div>
                <ThreadComposer
                  placeholder="Reply…"
                  onSubmit={(content) => onAddReply(selectedThread.id, content)}
                />
                <button
                  type="button"
                  onClick={() => onResolve(selectedThread.id)}
                  className="mt-3 text-xs text-muted hover:text-ink dark:hover:text-paper"
                >
                  {selectedThread.status === "open" ? "Resolve thread" : "Reopen thread"}
                </button>
              </div>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
