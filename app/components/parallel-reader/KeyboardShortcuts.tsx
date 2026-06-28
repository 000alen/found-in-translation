"use client";

type KeyboardShortcutsProps = {
  open: boolean;
  onClose: () => void;
};

const shortcuts = [
  { key: "R", description: "Toggle read mode" },
  { key: "A", description: "Switch to align mode" },
  { key: "C", description: "Switch to comment mode" },
  { key: "L", description: "Toggle alignment links" },
  { key: "?", description: "Show keyboard shortcuts" },
  { key: "Esc", description: "Cancel current action" },
];

export function KeyboardShortcuts({ open, onClose }: KeyboardShortcutsProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-paper p-6 shadow-xl dark:bg-ink-elevated"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-label="Keyboard shortcuts"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium text-ink dark:text-paper">Keyboard shortcuts</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-muted hover:text-ink dark:hover:text-paper"
          >
            Close
          </button>
        </div>
        <ul className="space-y-3">
          {shortcuts.map((shortcut) => (
            <li key={shortcut.key} className="flex items-center justify-between text-sm">
              <span className="text-muted">{shortcut.description}</span>
              <kbd className="rounded-md border border-border bg-paper-elevated px-2 py-1 font-mono text-xs dark:bg-ink">
                {shortcut.key}
              </kbd>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
