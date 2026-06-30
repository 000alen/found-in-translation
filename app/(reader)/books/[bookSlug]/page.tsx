import Link from "next/link";
import { notFound } from "next/navigation";
import { getBookBySlug, listWorksForBook } from "@/lib/data/repository";
import { LanguagePair } from "@/app/components/LanguageLabel";

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
    <section className="mx-auto w-full max-w-5xl py-8">
      <div className="mb-8 grid gap-6 border-b border-border pb-6 md:grid-cols-[12rem_1fr]">
        <Link href="/books" className="text-sm text-muted transition hover:text-accent">
          Library
        </Link>
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted">
            <LanguagePair source={book.sourceLanguage} target={book.targetLanguage} />
          </p>
          <h1 className="title mt-2 text-5xl font-medium tracking-[-0.045em] text-ink">
            {book.title}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {book.authors.map((author) => author.name).join(", ")}
          </p>
        </div>
      </div>

      <div className="divide-y divide-border border-y border-border">
        {works.map((work) => (
          <div
            key={work.id}
            className="grid gap-4 py-5 md:grid-cols-[1fr_auto] md:items-center"
          >
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted">
                {work.contentType}
              </p>
              <h2 className="mt-1 text-2xl font-medium text-ink">{work.title}</h2>
              <p className="mt-1 text-sm text-muted">
                {work.sourceAuthor}
                {work.translator ? ` · ${work.translator}` : ""}
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/books/${bookSlug}/${work.slug}`}
                className="rounded-full bg-ink px-4 py-2 text-sm text-paper transition hover:bg-accent"
              >
                Read
              </Link>
              <Link
                href={`/books/${bookSlug}/${work.slug}/studio`}
                className="rounded-full border border-border px-4 py-2 text-sm text-muted transition hover:text-ink"
              >
                Studio
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
