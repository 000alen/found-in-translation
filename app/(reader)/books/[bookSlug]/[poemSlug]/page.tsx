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
    <section className="w-full py-3">
      <div className="mb-4 grid gap-3 border-b border-border pb-4 md:grid-cols-[12rem_1fr_auto] md:items-end">
        <nav className="text-sm text-muted" aria-label="Breadcrumb">
          <Link href="/books" className="transition hover:text-accent">Library</Link>
          <span className="mx-2">/</span>
          <Link href={`/books/${bookSlug}`} className="transition hover:text-accent">
            {edition.book.title}
          </Link>
        </nav>
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted">
            {typeLabel} ·{" "}
            <LanguagePair
              source={edition.book.sourceLanguage}
              target={edition.book.targetLanguage}
            />
          </p>
          <h1 className="title mt-1 text-3xl font-medium tracking-[-0.035em] text-ink md:text-4xl">
            {work.title}
          </h1>
        </div>
        <Link
          href={`/books/${bookSlug}/${poemSlug}/studio`}
          className="justify-self-start rounded-full border border-border px-3 py-1 text-xs text-muted transition hover:text-ink md:justify-self-end"
        >
          Studio
        </Link>
      </div>

      <ParallelReader edition={edition} />
    </section>
  );
}
