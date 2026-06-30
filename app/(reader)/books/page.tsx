import Link from "next/link";
import { listBooks } from "@/lib/data/repository";
import { LanguagePair } from "@/app/components/LanguageLabel";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Library | Found in Translation",
  description: "Browse bilingual editions.",
};

const bookSamples: Record<string, { excerpt: string; accent: string }> = {
  "shakespeare-sonnets": {
    excerpt: "Shall I compare thee to a summer's day?",
    accent: "bg-clay",
  },
  "borges-library": {
    excerpt: "The universe (which others call the Library)…",
    accent: "bg-mist",
  },
  "shevchenko-zapovit": {
    excerpt: "І мертвим, і живим, і ненародженим…",
    accent: "bg-wheat",
  },
  "rilke-herbsttag": {
    excerpt: "Herr: es ist Zeit. Der Sommer war sehr groß.",
    accent: "bg-sage",
  },
};

export default async function BooksPage() {
  const books = await listBooks();

  return (
    <section className="w-full py-8">
      <div className="mb-6 flex items-end justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="title text-4xl font-medium tracking-[-0.04em] text-ink md:text-5xl">
            Library
          </h1>
          <p className="mt-2 text-sm text-muted">Four editions. No catalogue noise.</p>
        </div>
      </div>

      <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-2 xl:grid-cols-4">
        {books.map((book) => {
          const sample = bookSamples[book.slug] ?? {
            excerpt: book.description,
            accent: "bg-ink-faint",
          };

          return (
            <Link
              key={book.id}
              href={`/books/${book.slug}`}
              className="group flex min-h-72 flex-col bg-surface p-5 transition hover:bg-paper"
            >
              <span className={cn("mb-6 h-1 w-12", sample.accent)} aria-hidden />
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted">
                <LanguagePair source={book.sourceLanguage} target={book.targetLanguage} />
              </p>
              <h2 className="mt-2 text-2xl font-medium leading-tight text-ink group-hover:text-accent">
                {book.title}
              </h2>
              <p className="mt-2 text-sm text-muted">
                {book.authors.map((author) => author.name).join(", ")}
              </p>
              <p className="mt-auto pt-8 font-prose text-xl leading-tight text-ink-soft">
                {sample.excerpt}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
