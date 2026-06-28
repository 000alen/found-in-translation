import Link from "next/link";
import { notFound } from "next/navigation";
import { ParallelReader } from "@/app/components/parallel-reader/ParallelReader";
import { getPoemEdition } from "@/lib/data/repository";

type PageProps = {
  params: Promise<{ bookSlug: string; poemSlug: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { bookSlug, poemSlug } = await params;
  const edition = await getPoemEdition(bookSlug, poemSlug);
  if (!edition) return { title: "Poem not found" };
  return {
    title: `${edition.poem.title} | ${edition.book.title}`,
    description: `Read ${edition.poem.title} in ${edition.book.sourceLanguage} and ${edition.book.targetLanguage}.`,
  };
}

export default async function PoemPage({ params }: PageProps) {
  const { bookSlug, poemSlug } = await params;
  const edition = await getPoemEdition(bookSlug, poemSlug);
  if (!edition) notFound();

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8">
      <div className="mb-8">
        <Link
          href={`/books/${bookSlug}`}
          className="text-sm text-muted transition hover:text-accent"
        >
          ← {edition.book.title}
        </Link>
        <div className="mt-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted">
              {edition.book.sourceLanguage.toUpperCase()} / {edition.book.targetLanguage.toUpperCase()}
            </p>
            <h1 className="title mt-2 text-3xl font-medium tracking-tight text-ink dark:text-paper md:text-4xl">
              {edition.poem.title}
            </h1>
            <p className="mt-2 text-sm text-muted">
              {edition.poem.sourceAuthor}
              {edition.poem.translator ? ` · ${edition.poem.translator}` : ""}
            </p>
          </div>
          <Link
            href={`/books/${bookSlug}/${poemSlug}/studio`}
            className="inline-flex w-fit rounded-full border border-border px-4 py-2 text-sm text-muted transition hover:text-ink dark:hover:text-paper"
          >
            Open alignment studio
          </Link>
        </div>
      </div>

      <ParallelReader edition={edition} />
    </section>
  );
}
