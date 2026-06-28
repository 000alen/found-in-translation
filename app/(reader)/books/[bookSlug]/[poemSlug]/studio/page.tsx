import Link from "next/link";
import { notFound } from "next/navigation";
import { ParallelReader } from "@/app/components/parallel-reader/ParallelReader";
import { getTextEdition } from "@/lib/data/repository";

type PageProps = {
  params: Promise<{ bookSlug: string; poemSlug: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { bookSlug, poemSlug } = await params;
  const edition = await getTextEdition(bookSlug, poemSlug);
  if (!edition) return { title: "Studio not found" };
  const work = edition.work ?? edition.poem!;
  return {
    title: `Studio · ${work.title}`,
  };
}

export default async function StudioPage({ params }: PageProps) {
  const { bookSlug, poemSlug } = await params;
  const edition = await getTextEdition(bookSlug, poemSlug);
  if (!edition) notFound();

  const work = edition.work ?? edition.poem!;

  return (
    <section className="mx-auto w-full max-w-7xl py-6">
      <div className="mb-6">
        <Link
          href={`/books/${bookSlug}/${poemSlug}`}
          className="text-sm text-muted transition hover:text-accent"
        >
          ← Back to reader
        </Link>
        <h1 className="title mt-3 text-2xl font-medium tracking-tight text-ink">
          Alignment studio
        </h1>
        <p className="mt-1 max-w-xl text-sm text-muted">
          Link passages between languages and save alignments for{" "}
          <span className="text-ink">{work.title}</span>.
        </p>
      </div>

      <ParallelReader edition={edition} studioMode />
    </section>
  );
}
