import Link from "next/link";
import { listBooks } from "@/lib/data/repository";

export default async function Page() {
  const books = await listBooks();
  const featured = books[0];

  return (
    <section className="pb-16">
      <div className="relative overflow-hidden rounded-[2rem] border border-border bg-gradient-to-br from-amber-50 via-paper to-rose-50 px-6 py-14 dark:from-ink-elevated dark:via-ink dark:to-ink-elevated md:px-12 md:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(194,106,74,0.12),transparent_45%)]" />
        <div className="relative max-w-3xl">
          <p className="mb-4 text-sm uppercase tracking-[0.28em] text-muted">
            Bilingual poetry editions
          </p>
          <h1 className="title text-4xl font-medium tracking-tight text-ink dark:text-paper md:text-6xl">
            Read poems in two languages, linked line by line.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
            An elegant reading studio for parallel translations — hover to trace
            correspondences, align lines in the studio, and leave margin comments
            like Google Docs.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/books"
              className="rounded-full bg-accent px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
            >
              Browse editions
            </Link>
            {featured && (
              <Link
                href={`/books/${featured.slug}/sonnet-18`}
                className="rounded-full border border-border bg-paper/70 px-5 py-3 text-sm text-ink backdrop-blur-sm transition hover:bg-paper dark:bg-ink/50 dark:text-paper"
              >
                Read Sonnet XVIII
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="mt-16 grid gap-6 md:grid-cols-3">
        {[
          {
            title: "Side-by-side reading",
            body: "Original and translation presented in balanced columns with synced scrolling and poetry-native typography.",
          },
          {
            title: "Visual alignment",
            body: "Curved links connect corresponding lines — including cross-order mappings when translations diverge.",
          },
          {
            title: "Threaded comments",
            body: "Select any phrase to start a discussion. Resolve threads when the conversation is complete.",
          },
        ].map((feature) => (
          <div
            key={feature.title}
            className="rounded-3xl border border-border bg-paper-elevated p-6 dark:bg-ink-elevated"
          >
            <h2 className="text-lg font-medium text-ink dark:text-paper">{feature.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">{feature.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
