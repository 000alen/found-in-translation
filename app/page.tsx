import Link from "next/link";
import { listBooks } from "@/lib/data/repository";

export default async function Page() {
  const books = await listBooks();
  const featured = [
    { slug: "shakespeare-sonnets", work: "sonnet-18", label: "Sonnet XVIII" },
    { slug: "borges-library", work: "opening", label: "Library of Babel" },
    { slug: "shevchenko-zapovit", work: "zapovit", label: "Заповіт" },
    { slug: "rilke-herbsttag", work: "herbsttag", label: "Herbsttag" },
  ].filter((item) => books.some((b) => b.slug === item.slug));

  return (
    <section className="pb-16">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-surface px-6 py-14 md:px-12 md:py-18">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(181,137,110,0.08),transparent_55%)]" />
        <div className="relative max-w-2xl">
          <p className="mb-3 text-[11px] uppercase tracking-[0.3em] text-muted">
            Multilingual reading studio
          </p>
          <h1 className="title text-3xl font-medium tracking-tight text-ink md:text-5xl">
            Poetry and prose in English, Spanish, German, and Ukrainian.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted">
            Read in parallel — phrase by phrase, line by line. Full Cyrillic support for
            Ukrainian. Click any aligned passage to trace how it travels across languages.
          </p>
          <div className="mt-7 flex flex-wrap gap-2">
            <Link
              href="/books"
              className="rounded-full bg-accent px-4 py-2.5 text-sm text-white transition hover:opacity-90"
            >
              Browse editions
            </Link>
            {featured.map((item) => (
              <Link
                key={item.slug}
                href={`/books/${item.slug}/${item.work}`}
                className="rounded-full border border-border px-4 py-2.5 text-sm text-ink transition hover:bg-surface-2"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {[
          {
            title: "Four languages",
            body: "English, Español, Deutsch, Українська — with native script rendering and proper lang attributes.",
          },
          {
            title: "Phrase-level links",
            body: "Mid-paragraph phrases connect to fragments on the other side, including Cyrillic spans.",
          },
          {
            title: "Triangle traces",
            body: "Click any aligned passage to draw quiet wedges between the two columns.",
          },
        ].map((feature) => (
          <div
            key={feature.title}
            className="rounded-xl border border-border bg-surface p-5"
          >
            <h2 className="text-base font-medium text-ink">{feature.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{feature.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
