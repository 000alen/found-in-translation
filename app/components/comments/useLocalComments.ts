"use client";

import { useCallback, useEffect, useState } from "react";
import { nanoid } from "nanoid";

export type CommentMessage = {
  id: string;
  author: string;
  content: string;
  createdAt: string;
};

export type CommentThread = {
  id: string;
  segmentId: string;
  exact: string;
  status: "open" | "resolved";
  messages: CommentMessage[];
  createdAt: string;
};

type PendingComposer = {
  segmentId: string;
  exact: string;
} | null;

const STORAGE_PREFIX = "poetry-comments:";

function loadThreads(poemId: string): CommentThread[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${poemId}`);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as CommentThread[];
  } catch {
    return [];
  }
}

function saveThreads(poemId: string, threads: CommentThread[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(`${STORAGE_PREFIX}${poemId}`, JSON.stringify(threads));
}

export function useLocalComments(poemId: string) {
  const [threads, setThreads] = useState<CommentThread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [pendingComposer, setPendingComposer] = useState<PendingComposer>(null);
  const [authorName, setAuthorName] = useState("Reader");

  useEffect(() => {
    setThreads(loadThreads(poemId));
    const storedName = window.localStorage.getItem("poetry-comment-author");
    if (storedName) setAuthorName(storedName);
  }, [poemId]);

  const persist = useCallback(
    (next: CommentThread[]) => {
      setThreads(next);
      saveThreads(poemId, next);
    },
    [poemId]
  );

  const createThread = useCallback(
    ({ segmentId, exact, content }: { segmentId: string; exact: string; content: string }) => {
      if (!content.trim()) {
        setPendingComposer({ segmentId, exact });
        return;
      }

      const thread: CommentThread = {
        id: nanoid(),
        segmentId,
        exact,
        status: "open",
        createdAt: new Date().toISOString(),
        messages: [
          {
            id: nanoid(),
            author: authorName,
            content: content.trim(),
            createdAt: new Date().toISOString(),
          },
        ],
      };

      persist([thread, ...threads]);
      setSelectedThreadId(thread.id);
      setPendingComposer(null);
    },
    [authorName, persist, threads]
  );

  const submitPending = useCallback(
    (content: string) => {
      if (!pendingComposer || !content.trim()) return;
      createThread({
        ...pendingComposer,
        content,
      });
    },
    [createThread, pendingComposer]
  );

  const cancelPending = useCallback(() => setPendingComposer(null), []);

  const addReply = useCallback(
    (threadId: string, content: string) => {
      if (!content.trim()) return;

      const next = threads.map((thread) => {
        if (thread.id !== threadId) return thread;
        return {
          ...thread,
          messages: [
            ...thread.messages,
            {
              id: nanoid(),
              author: authorName,
              content: content.trim(),
              createdAt: new Date().toISOString(),
            },
          ],
        };
      });

      persist(next);
    },
    [authorName, persist, threads]
  );

  const resolveThread = useCallback(
    (threadId: string) => {
      const next = threads.map((thread) =>
        thread.id === threadId
          ? {
              ...thread,
              status: thread.status === "open" ? ("resolved" as const) : ("open" as const),
            }
          : thread
      );
      persist(next);
    },
    [persist, threads]
  );

  const selectThread = useCallback((threadId: string | null) => {
    setSelectedThreadId(threadId);
  }, []);

  const setAuthor = useCallback((name: string) => {
    setAuthorName(name);
    window.localStorage.setItem("poetry-comment-author", name);
  }, []);

  return {
    threads,
    selectedThreadId,
    pendingComposer,
    authorName,
    createThread,
    submitPending,
    cancelPending,
    addReply,
    resolveThread,
    selectThread,
    setAuthor,
  };
}
