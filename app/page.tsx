import Link from "next/link";
import { listBooks } from "@/lib/data/repository";

export default async function Page() {
  const books = await listBooks();
  const poetry = books.find((b) => b.slug === "shakespeare-sonnets");
  const prose = books.find((b) => b.slug === "borges-library");

  return (
    <section className="pb-16">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-surface px-6 py-14 md:px-12 md:py-18">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(181,137,110,0.08),transparent_55%)]" />
        <div className="relative max-w-2xl">
          <p className="mb-3 text-[11px] uppercase tracking-[0.3em] text-muted">
            Bilingual reading studio
          </p>
          <h1 className="title text-3xl font-medium tracking-tight text-ink md:text-5xl">
            Poetry and prose, read in parallel — phrase by phrase.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted">
            A quiet space for translation. Click a line or a phrase mid-paragraph to
            trace how it travels across languages. Leave notes in the margin.
          </p>
          <div className="mt-7 flex flex-wrap gap-2">
            <Link
              href="/books"
              className="rounded-full bg-accent px-4 py-2.5 text-sm text-white transition hover:opacity-90"
            >
              Browse editions
            </Link>
            {poetry && (
              <Link
                href={`/books/${poetry.slug}/sonnet-18`}
                className="rounded-full border border-border px-4 py-2.5 text-sm text-ink transition hover:bg-surface-2"
              >
                Sonnet XVIII
              </Link>
            )}
            {prose && (
              <Link
                href={`/books/${prose.slug}/opening`}
                className="rounded-full border border-border px-4 py-2.5 text-sm text-ink transition hover:bg-surface-2"
              >
                Library of Babel
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {[
          {
            title: "Phrase-level links",
            body: "A sentence need not fill a line. Mid-paragraph phrases connect to fragments on the other side.",
          },
          {
            title: "Triangle traces",
            body: "Click any aligned passage to draw quiet wedges between the two columns — even sub-line spans.",
          },
          {
            title: "Margin notes",
            body: "Select text to start a thread. Resolve when the conversation is complete.",
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
