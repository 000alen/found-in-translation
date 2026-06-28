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
  if (!edition) return { title: "Studio not found" };
  return {
    title: `Studio · ${edition.poem.title}`,
  };
}

export default async function StudioPage({ params }: PageProps) {
  const { bookSlug, poemSlug } = await params;
  const edition = await getPoemEdition(bookSlug, poemSlug);
  if (!edition) notFound();

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8">
      <div className="mb-8">
        <Link
          href={`/books/${bookSlug}/${poemSlug}`}
          className="text-sm text-muted transition hover:text-accent"
        >
          ← Back to reader
        </Link>
        <h1 className="title mt-4 text-3xl font-medium tracking-tight text-ink dark:text-paper">
          Alignment Studio
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Link lines between languages, save alignments, and refine the parallel edition for{" "}
          <span className="text-ink dark:text-paper">{edition.poem.title}</span>.
        </p>
      </div>

      <ParallelReader edition={edition} studioMode />
    </section>
  );
}
