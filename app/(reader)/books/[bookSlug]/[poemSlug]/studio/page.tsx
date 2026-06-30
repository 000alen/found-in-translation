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

  return (
    <section className="w-full py-3">
      <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
        <Link
          href={`/books/${bookSlug}/${poemSlug}`}
          className="text-sm text-muted transition hover:text-accent"
        >
          Reader
        </Link>
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted">
          Studio
        </p>
      </div>

      <ParallelReader edition={edition} studioMode />
    </section>
  );
}
