import Link from "next/link";
import { notFound } from "next/navigation";
import { getBookBySlug, listWorksForBook } from "@/lib/data/repository";

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

  const works = await listWorksForBook(bookSlug);

  return (
    <section className="mx-auto w-full max-w-3xl py-8">
      <Link href="/books" className="text-sm text-muted transition hover:text-accent">
        ← All editions
      </Link>

      <div className="mt-5">
        <p className="text-[11px] uppercase tracking-[0.25em] text-muted">
          {book.sourceLanguage.toUpperCase()} → {book.targetLanguage.toUpperCase()}
        </p>
        <h1 className="title mt-1 text-3xl font-medium tracking-tight text-ink">
          {book.title}
        </h1>
        {book.subtitle && <p className="mt-1 text-base text-muted">{book.subtitle}</p>}
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">{book.description}</p>
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-[11px] font-medium uppercase tracking-[0.2em] text-muted">
          Works
        </h2>
        <div className="divide-y divide-border rounded-xl border border-border bg-surface">
          {works.map((work) => (
            <div
              key={work.id}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted">
                  {work.contentType}
                </p>
                <h3 className="text-lg font-medium text-ink">{work.title}</h3>
                <p className="mt-0.5 text-sm text-muted">
                  {work.sourceAuthor}
                  {work.translator ? ` · ${work.translator}` : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/books/${bookSlug}/${work.slug}`}
                  className="rounded-full bg-accent px-3.5 py-1.5 text-sm text-white transition hover:opacity-90"
                >
                  Read
                </Link>
                <Link
                  href={`/books/${bookSlug}/${work.slug}/studio`}
                  className="rounded-full border border-border px-3.5 py-1.5 text-sm text-muted transition hover:bg-surface-2 hover:text-ink"
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
