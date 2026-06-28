"use client";

import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { mode, setMode } = useTheme();

  const cycle = () => {
    const order = ["light", "dark", "system"] as const;
    const index = order.indexOf(mode);
    setMode(order[(index + 1) % order.length] ?? "light");
  };

  const label = mode === "light" ? "Light" : mode === "dark" ? "Dark" : "System";

  return (
    <button
      type="button"
      onClick={cycle}
      className="rounded-full px-3 py-1.5 text-xs text-muted transition hover:bg-surface-2 hover:text-ink"
      aria-label={`Theme: ${label}. Click to change.`}
    >
      {label}
    </button>
  );
}
