import Link from "next/link";

export default function BookNotFound() {
  return (
    <section className="py-20 text-center">
      <h1 className="text-3xl font-medium text-ink dark:text-paper">Edition not found</h1>
      <p className="mt-3 text-muted">This book or poem could not be located.</p>
      <Link
        href="/books"
        className="mt-6 inline-flex rounded-full bg-accent px-5 py-3 text-sm text-white"
      >
        Browse editions
      </Link>
    </section>
  );
}
