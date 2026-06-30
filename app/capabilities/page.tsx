import Link from "next/link";

type Capability = {
  title: string;
  detail: string;
  action: string;
  href: string;
};

const capabilities: Capability[] = [
  {
    title: "Parallel reading",
    detail: "Original and translation share one reading surface.",
    action: "Open Borges",
    href: "/books/borges-library/opening",
  },
  {
    title: "Phrase links",
    detail: "Inline prose spans can link to fragments mid-paragraph.",
    action: "Click “a ventilation shaft”",
    href: "/books/borges-library/opening",
  },
  {
    title: "Line links",
    detail: "Poetry supports line, many-to-many, and reordered mappings.",
    action: "Open Sonnet XVIII",
    href: "/books/shakespeare-sonnets/sonnet-18",
  },
  {
    title: "Margin notes",
    detail: "Switch to Notes, select text, and leave a thread.",
    action: "Try notes",
    href: "/books/borges-library/opening",
  },
  {
    title: "Alignment studio",
    detail: "Create or delete links without leaving the edition.",
    action: "Open studio",
    href: "/books/borges-library/opening/studio",
  },
  {
    title: "Cyrillic",
    detail: "Ukrainian text uses language tags and Cyrillic font support.",
    action: "Open Заповіт",
    href: "/books/shevchenko-zapovit/zapovit",
  },
  {
    title: "German",
    detail: "Latin-ext typography handles umlauts, ß, and compounds.",
    action: "Open Herbsttag",
    href: "/books/rilke-herbsttag/herbsttag",
  },
  {
    title: "Focus",
    detail: "Focus hides the chrome so the text can carry the page.",
    action: "Use Focus",
    href: "/books/rilke-herbsttag/herbsttag",
  },
];

const shortcuts = [
  ["R", "focus reading"],
  ["L", "links"],
  ["C", "notes"],
  ["?", "shortcuts"],
  ["Esc", "clear"],
];

export const metadata = {
  title: "Capabilities | Found in Translation",
  description: "A concise map of what the reading studio can do.",
};

export default function CapabilitiesPage() {
  return (
    <section className="w-full py-8">
      <div className="grid gap-8 border-b border-border pb-8 md:grid-cols-[12rem_1fr]">
        <p className="text-sm text-muted">Capabilities</p>
        <div>
          <h1 className="title max-w-3xl text-5xl font-medium leading-[0.95] tracking-[-0.045em] text-ink md:text-7xl">
            What works now.
          </h1>
          <p className="mt-5 max-w-2xl font-prose text-xl leading-relaxed text-ink-soft">
            A map of the current surface area. Each row links to a real place in
            the app.
          </p>
        </div>
      </div>

      <div className="grid gap-px border-b border-border bg-border md:grid-cols-2 xl:grid-cols-4">
        {capabilities.map((capability, index) => (
          <Link
            key={capability.title}
            href={capability.href}
            className="group flex min-h-56 flex-col bg-surface p-5 transition hover:bg-paper"
          >
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted">
              {String(index + 1).padStart(2, "0")}
            </p>
            <h2 className="mt-4 text-2xl font-medium leading-tight text-ink group-hover:text-accent">
              {capability.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {capability.detail}
            </p>
            <span className="mt-auto pt-8 text-sm text-ink">
              {capability.action}
            </span>
          </Link>
        ))}
      </div>

      <div className="grid gap-8 py-8 md:grid-cols-[12rem_1fr]">
        <p className="text-sm text-muted">Keys</p>
        <div className="flex flex-wrap gap-2">
          {shortcuts.map(([key, label]) => (
            <div
              key={key}
              className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-sm"
            >
              <kbd className="font-mono text-xs text-ink">{key}</kbd>
              <span className="text-muted">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
