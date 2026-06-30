import Link from "next/link";
import { LanguagePair } from "@/app/components/LanguageLabel";
import { listBooks } from "@/lib/data/repository";
import { cn } from "@/lib/utils";

type Feature = {
  slug: string;
  work: string;
  label: string;
  excerpt: string;
  accent: string;
};

const featured: Feature[] = [
  {
    slug: "shakespeare-sonnets",
    work: "sonnet-18",
    label: "Sonnet XVIII",
    excerpt: "Shall I compare thee to a summer's day?",
    accent: "bg-clay",
  },
  {
    slug: "borges-library",
    work: "opening",
    label: "Library of Babel",
    excerpt: "The universe (which others call the Library)…",
    accent: "bg-mist",
  },
  {
    slug: "shevchenko-zapovit",
    work: "zapovit",
    label: "Заповіт",
    excerpt: "І мертвим, і живим, і ненародженим…",
    accent: "bg-wheat",
  },
  {
    slug: "rilke-herbsttag",
    work: "herbsttag",
    label: "Herbsttag",
    excerpt: "Herr: es ist Zeit. Der Sommer war sehr groß.",
    accent: "bg-sage",
  },
];

export default async function Page() {
  const books = await listBooks();
  const booksBySlug = new Map(books.map((book) => [book.slug, book]));
  const available = featured.filter((item) => booksBySlug.has(item.slug));

  return (
    <section className="pb-12">
      <div className="grid gap-8 border-b border-border pb-10 pt-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
        <div>
          <p className="mb-4 text-[11px] uppercase tracking-[0.24em] text-muted">
            Original / translation
          </p>
          <h1 className="title max-w-3xl text-5xl font-medium leading-[0.95] tracking-[-0.045em] text-ink md:text-7xl">
            Read beside the source.
          </h1>
        </div>
        <div className="max-w-xl lg:ml-auto">
          <p className="font-prose text-xl leading-relaxed text-ink-soft">
            Poetry and prose in parallel. Click a passage when the translation shifts.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href="/books"
              className="inline-flex rounded-full bg-ink px-4 py-2 text-sm text-paper transition hover:bg-accent"
            >
              Open library
            </Link>
            <Link
              href="/capabilities"
              className="inline-flex rounded-full border border-border px-4 py-2 text-sm text-ink transition hover:bg-surface-2"
            >
              See capabilities
            </Link>
          </div>
        </div>
      </div>

      <div className="grid border-b border-border md:grid-cols-2 xl:grid-cols-4">
        {available.map((item) => {
          const book = booksBySlug.get(item.slug)!;

          return (
            <Link
              key={item.slug}
              href={`/books/${item.slug}/${item.work}`}
              className="group border-border py-6 pr-6 transition hover:bg-surface/70 md:border-r md:pl-6 md:first:pl-0 xl:last:border-r-0"
            >
              <span className={cn("mb-5 block h-1 w-10", item.accent)} aria-hidden />
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted">
                <LanguagePair source={book.sourceLanguage} target={book.targetLanguage} />
              </p>
              <h2 className="mt-2 text-xl font-medium text-ink group-hover:text-accent">
                {item.label}
              </h2>
              <p className="mt-5 font-prose text-lg leading-snug text-ink-soft">
                {item.excerpt}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
