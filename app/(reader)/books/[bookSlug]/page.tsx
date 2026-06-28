import Link from "next/link";
import { notFound } from "next/navigation";
import { getBookBySlug, listPoemsForBook } from "@/lib/data/repository";

type PageProps = {
  params: Promise<{ bookSlug: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { bookSlug } = await params;
  const book = await getBookBySlug(bookSlug);
  if (!book) return { title: "Book not found" };
  return {
    title: `${book.title} | Found in Translation`,
    description: book.description,
  };
}

export default async function BookPage({ params }: PageProps) {
  const { bookSlug } = await params;
  const book = await getBookBySlug(bookSlug);
  if (!book) notFound();

  const poems = await listPoemsForBook(bookSlug);

  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-10 md:px-8">
      <Link href="/books" className="text-sm text-muted transition hover:text-accent">
        ← All editions
      </Link>

      <div className="mt-6">
        <p className="text-sm uppercase tracking-[0.25em] text-muted">
          {book.sourceLanguage.toUpperCase()} → {book.targetLanguage.toUpperCase()}
        </p>
        <h1 className="title mt-2 text-4xl font-medium tracking-tight text-ink dark:text-paper">
          {book.title}
        </h1>
        {book.subtitle && <p className="mt-2 text-lg text-muted">{book.subtitle}</p>}
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted">{book.description}</p>
      </div>

      <div className="mt-10">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-muted">
          Poems
        </h2>
        <div className="divide-y divide-border rounded-2xl border border-border bg-paper-elevated dark:bg-ink-elevated">
          {poems.map((poem) => (
            <div
              key={poem.id}
              className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <h3 className="text-xl font-medium text-ink dark:text-paper">{poem.title}</h3>
                <p className="mt-1 text-sm text-muted">
                  {poem.sourceAuthor}
                  {poem.translator ? ` · translated by ${poem.translator}` : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/books/${bookSlug}/${poem.slug}`}
                  className="rounded-full bg-accent px-4 py-2 text-sm text-white transition hover:opacity-90"
                >
                  Read
                </Link>
                <Link
                  href={`/books/${bookSlug}/${poem.slug}/studio`}
                  className="rounded-full border border-border px-4 py-2 text-sm text-muted transition hover:text-ink dark:hover:text-paper"
                >
                  Studio
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
