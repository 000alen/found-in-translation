import Link from "next/link";
import { listBooks } from "@/lib/data/repository";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Editions | Found in Translation",
  description: "Browse bilingual editions with linked translations and collaborative commentary.",
};

export default async function BooksPage() {
  const books = await listBooks();

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-8 md:px-8">
      <div className="mb-8">
        <p className="mb-2 text-[11px] uppercase tracking-[0.25em] text-muted">Library</p>
        <h1 className="title text-3xl font-medium tracking-tight text-ink md:text-4xl">
          Editions
        </h1>
        <p className="mt-3 max-w-xl text-base text-muted">
          Poetry and prose in parallel — with phrase-level alignment and margin notes.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {books.map((book) => (
          <Link
            key={book.id}
            href={`/books/${book.slug}`}
            className="group overflow-hidden rounded-xl border border-border bg-surface transition hover:border-border-soft hover:bg-surface-2"
          >
            <div
              className={cn(
                "h-24 bg-gradient-to-br opacity-80",
                book.coverGradient ?? "from-stone-100 to-stone-200"
              )}
            />
            <div className="p-5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted">
                {book.sourceLanguage.toUpperCase()} → {book.targetLanguage.toUpperCase()}
              </p>
              <h2 className="mt-1.5 text-xl font-medium text-ink group-hover:text-accent">
                {book.title}
              </h2>
              {book.subtitle && (
                <p className="mt-0.5 text-sm text-muted">{book.subtitle}</p>
              )}
              <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted">
                {book.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
