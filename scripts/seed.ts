import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { alignments, books, poems, segments } from "../lib/db/schema";
import {
  allSeedBooks,
  allSeedWorks,
  allSeedSegments,
  getStaticEdition,
} from "../lib/data/registry";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is required to seed the database.");
    process.exit(1);
  }

  const sql = neon(url);
  const db = drizzle(sql);

  console.log("Seeding database…");

  for (const book of allSeedBooks) {
    await db
      .insert(books)
      .values({
        id: book.id,
        slug: book.slug,
        title: book.title,
        subtitle: book.subtitle,
        authors: JSON.stringify(book.authors),
        sourceLanguage: book.sourceLanguage,
        targetLanguage: book.targetLanguage,
        description: book.description,
        coverGradient: book.coverGradient,
        publishedAt: book.publishedAt,
      })
      .onConflictDoNothing();
  }

  for (const work of allSeedWorks) {
    await db
      .insert(poems)
      .values({
        id: work.id,
        bookId: work.bookId,
        slug: work.slug,
        title: work.title,
        order: work.order,
        sourceAuthor: work.sourceAuthor,
        translator: work.translator,
      })
      .onConflictDoNothing();
  }

  for (const segment of allSeedSegments) {
    await db
      .insert(segments)
      .values({
        id: segment.id,
        poemId: segment.workId ?? segment.poemId ?? "",
        side: segment.side,
        language: segment.language,
        kind: segment.kind,
        parentId: segment.parentId,
        order: segment.order,
        text: segment.text,
        metadata: segment.range ? JSON.stringify({ range: segment.range }) : null,
      })
      .onConflictDoNothing();
  }

  for (const work of allSeedWorks) {
    const book = allSeedBooks.find((b) => b.id === work.bookId);
    if (!book) continue;
    const edition = getStaticEdition(book.slug, work.slug);
    if (!edition) continue;

    for (const alignment of edition.alignments) {
      await db
        .insert(alignments)
        .values({
          id: alignment.id,
          poemId: alignment.workId ?? alignment.poemId ?? work.id,
          sourceSegmentIds: JSON.stringify(alignment.sourceAnchors),
          targetSegmentIds: JSON.stringify(alignment.targetAnchors),
          kind: alignment.kind,
          confidence: alignment.confidence,
          createdBy: alignment.createdBy,
        })
        .onConflictDoNothing();
    }
  }

  console.log("Seed complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
