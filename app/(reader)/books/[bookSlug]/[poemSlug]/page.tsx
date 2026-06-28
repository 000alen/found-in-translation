import Link from "next/link";
import { notFound } from "next/navigation";
import { ParallelReader } from "@/app/components/parallel-reader/ParallelReader";
import { LanguagePair } from "@/app/components/LanguageLabel";
import { getTextEdition } from "@/lib/data/repository";

type PageProps = {
  params: Promise<{ bookSlug: string; poemSlug: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { bookSlug, poemSlug } = await params;
  const edition = await getTextEdition(bookSlug, poemSlug);
  if (!edition) return { title: "Work not found" };
  const work = edition.work ?? edition.poem!;
  return {
    title: `${work.title} | ${edition.book.title}`,
    description: `Read ${work.title} in ${edition.book.sourceLanguage} and ${edition.book.targetLanguage}.`,
  };
}

export default async function WorkPage({ params }: PageProps) {
  const { bookSlug, poemSlug } = await params;
  const edition = await getTextEdition(bookSlug, poemSlug);
  if (!edition) notFound();

  const work = edition.work ?? edition.poem!;
  const typeLabel = work.contentType === "prose" ? "Prose" : "Poetry";

  return (
    <section className="mx-auto w-full max-w-7xl py-6">
      <div className="mb-6">
        <Link
          href={`/books/${bookSlug}`}
          className="text-sm text-muted transition hover:text-accent"
        >
          ← {edition.book.title}
        </Link>
        <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted">
              {typeLabel} ·{" "}
              <LanguagePair
                source={edition.book.sourceLanguage}
                target={edition.book.targetLanguage}
              />
            </p>
            <h1 className="title mt-1 text-2xl font-medium tracking-tight text-ink md:text-3xl">
              {work.title}
            </h1>
            <p className="mt-1 text-sm text-muted">
              {work.sourceAuthor}
              {work.translator ? ` · ${work.translator}` : ""}
            </p>
          </div>
          <Link
            href={`/books/${bookSlug}/${poemSlug}/studio`}
            className="inline-flex w-fit rounded-full border border-border px-3.5 py-1.5 text-sm text-muted transition hover:bg-surface-2 hover:text-ink"
          >
            Alignment studio
          </Link>
        </div>
      </div>

      <ParallelReader edition={edition} />
    </section>
  );
}
