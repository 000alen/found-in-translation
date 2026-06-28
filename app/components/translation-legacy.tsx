"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

export function Left({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div className="w-full flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}

export function Right({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full flex flex-col items-center justify-center">
      <p className="w-full flex flex-col items-center justify-center">{children}</p>
    </div>
  );
}

export function Translation({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<"RELATIONS" | "ANNOTATION">("ANNOTATION");

  const toggle = useCallback(() => {
    setMode((current) => (current === "RELATIONS" ? "ANNOTATION" : "RELATIONS"));
  }, []);

  return (
    <div className="my-8 rounded-2xl border border-border bg-paper-elevated p-4 dark:bg-ink-elevated">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-muted">
          Legacy demo component. For the full experience, open a poem in the{" "}
          <Link href="/books" className="text-accent underline underline-offset-2">
            editions library
          </Link>
          .
        </p>
        <button
          type="button"
          onClick={toggle}
          className="rounded-full border border-border px-3 py-1.5 text-xs text-muted"
        >
          Mode: {mode.toLowerCase()}
        </button>
      </div>
      <div id="translation" className="flex w-full flex-row items-start justify-center gap-6">
        {children}
      </div>
    </div>
  );
}

// Kept for MDX compatibility without the deprecated Recogito dependency.
export function TranslationLegacyNotice() {
  const initialized = useRef(false);
  useEffect(() => {
    initialized.current = true;
  }, []);
  return null;
}
