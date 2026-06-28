import Link from "next/link";
import { listBooks } from "@/lib/data/repository";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Editions | Found in Translation",
  description: "Browse bilingual poetry editions with linked translations and collaborative commentary.",
};

export default async function BooksPage() {
  const books = await listBooks();

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 md:px-8">
      <div className="mb-10">
        <p className="mb-2 text-sm uppercase tracking-[0.25em] text-muted">Library</p>
        <h1 className="title text-4xl font-medium tracking-tight text-ink dark:text-paper md:text-5xl">
          Poetry Editions
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted">
          Side-by-side translations with linked lines, alignment tools, and margin comments.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {books.map((book) => (
          <Link
            key={book.id}
            href={`/books/${book.slug}`}
            className="group overflow-hidden rounded-3xl border border-border bg-paper-elevated transition hover:-translate-y-1 hover:shadow-lg dark:bg-ink-elevated"
          >
            <div
              className={cn(
                "h-36 bg-gradient-to-br",
                book.coverGradient ?? "from-stone-100 to-stone-200"
              )}
            />
            <div className="p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">
                {book.sourceLanguage.toUpperCase()} → {book.targetLanguage.toUpperCase()}
              </p>
              <h2 className="mt-2 text-2xl font-medium text-ink group-hover:text-accent dark:text-paper">
                {book.title}
              </h2>
              {book.subtitle && (
                <p className="mt-1 text-sm text-muted">{book.subtitle}</p>
              )}
              <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted">
                {book.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
