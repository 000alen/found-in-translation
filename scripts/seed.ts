import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { alignments, books, poems, segments } from "../lib/db/schema";
import {
  seedAlignments,
  seedBook,
  seedPoem,
  seedSegments,
} from "../lib/data/seed";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is required to seed the database.");
    process.exit(1);
  }

  const sql = neon(url);
  const db = drizzle(sql);

  console.log("Seeding database…");

  await db.insert(books).values({
    id: seedBook.id,
    slug: seedBook.slug,
    title: seedBook.title,
    subtitle: seedBook.subtitle,
    authors: JSON.stringify(seedBook.authors),
    sourceLanguage: seedBook.sourceLanguage,
    targetLanguage: seedBook.targetLanguage,
    description: seedBook.description,
    coverGradient: seedBook.coverGradient,
    publishedAt: seedBook.publishedAt,
  }).onConflictDoNothing();

  await db.insert(poems).values({
    id: seedPoem.id,
    bookId: seedPoem.bookId,
    slug: seedPoem.slug,
    title: seedPoem.title,
    order: seedPoem.order,
    sourceAuthor: seedPoem.sourceAuthor,
    translator: seedPoem.translator,
  }).onConflictDoNothing();

  for (const segment of seedSegments) {
    await db.insert(segments).values({
      id: segment.id,
      poemId: segment.poemId,
      side: segment.side,
      language: segment.language,
      kind: segment.kind,
      parentId: segment.parentId,
      order: segment.order,
      text: segment.text,
      metadata: segment.metadata ? JSON.stringify(segment.metadata) : null,
    }).onConflictDoNothing();
  }

  for (const alignment of seedAlignments) {
    await db.insert(alignments).values({
      id: alignment.id,
      poemId: alignment.poemId,
      sourceSegmentIds: JSON.stringify(alignment.sourceSegmentIds),
      targetSegmentIds: JSON.stringify(alignment.targetSegmentIds),
      kind: alignment.kind,
      confidence: alignment.confidence,
      createdBy: alignment.createdBy,
    }).onConflictDoNothing();
  }

  console.log("Seed complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
