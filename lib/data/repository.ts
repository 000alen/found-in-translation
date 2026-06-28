import { eq } from "drizzle-orm";
import type { Alignment, Book, Poem, PoemEdition, Segment } from "../types";
import { getDb } from "../db";
import { alignments, books, poems, segments } from "../db/schema";
import {
  getSeedBook,
  getSeedEdition,
  getSeedPoemsForBook,
  seedAlignments,
  seedBooks,
  seedPoems,
  seedSegments,
} from "./seed";

function parseJsonArray<T>(value: string): T[] {
  return JSON.parse(value) as T[];
}

export async function listBooks(): Promise<Book[]> {
  const db = getDb();
  if (!db) return seedBooks;

  const rows = await db.select().from(books);
  if (rows.length === 0) return seedBooks;

  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle ?? undefined,
    authors: JSON.parse(row.authors),
    sourceLanguage: row.sourceLanguage,
    targetLanguage: row.targetLanguage,
    description: row.description,
    coverGradient: row.coverGradient ?? undefined,
    publishedAt: row.publishedAt ?? undefined,
  }));
}

export async function getBookBySlug(slug: string): Promise<Book | null> {
  const db = getDb();
  if (!db) return getSeedBook(slug);

  const rows = await db.select().from(books).where(eq(books.slug, slug)).limit(1);
  const row = rows[0];
  if (!row) return getSeedBook(slug);

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle ?? undefined,
    authors: JSON.parse(row.authors),
    sourceLanguage: row.sourceLanguage,
    targetLanguage: row.targetLanguage,
    description: row.description,
    coverGradient: row.coverGradient ?? undefined,
    publishedAt: row.publishedAt ?? undefined,
  };
}

export async function listPoemsForBook(bookSlug: string): Promise<Poem[]> {
  const book = await getBookBySlug(bookSlug);
  if (!book) return [];

  const db = getDb();
  if (!db) return getSeedPoemsForBook(bookSlug);

  const rows = await db
    .select()
    .from(poems)
    .where(eq(poems.bookId, book.id))
    .orderBy(poems.order);

  if (rows.length === 0) return getSeedPoemsForBook(bookSlug);

  return rows.map((row) => ({
    id: row.id,
    bookId: row.bookId,
    slug: row.slug,
    title: row.title,
    order: row.order,
    sourceAuthor: row.sourceAuthor ?? undefined,
    translator: row.translator ?? undefined,
  }));
}

export async function getPoemEdition(
  bookSlug: string,
  poemSlug: string
): Promise<PoemEdition | null> {
  const book = await getBookBySlug(bookSlug);
  if (!book) return null;

  const poemList = await listPoemsForBook(bookSlug);
  const poem = poemList.find((item) => item.slug === poemSlug);
  if (!poem) return getSeedEdition(poemSlug);

  const db = getDb();
  if (!db) return getSeedEdition(poemSlug);

  const segmentRows = await db
    .select()
    .from(segments)
    .where(eq(segments.poemId, poem.id))
    .orderBy(segments.order);

  const alignmentRows = await db
    .select()
    .from(alignments)
    .where(eq(alignments.poemId, poem.id));

  if (segmentRows.length === 0) {
    return getSeedEdition(poemSlug);
  }

  return {
    book,
    poem,
    segments: segmentRows.map((row) => ({
      id: row.id,
      poemId: row.poemId,
      side: row.side as Segment["side"],
      language: row.language,
      kind: row.kind as Segment["kind"],
      parentId: row.parentId ?? undefined,
      order: row.order,
      text: row.text,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
    })),
    alignments: alignmentRows.map((row) => ({
      id: row.id,
      poemId: row.poemId,
      sourceSegmentIds: parseJsonArray<string>(row.sourceSegmentIds),
      targetSegmentIds: parseJsonArray<string>(row.targetSegmentIds),
      kind: row.kind as Alignment["kind"],
      confidence: row.confidence ?? undefined,
      createdBy: row.createdBy ?? undefined,
    })),
  };
}

export async function saveAlignmentsForPoem(
  poemId: string,
  nextAlignments: Alignment[]
): Promise<Alignment[]> {
  const db = getDb();
  if (!db) return nextAlignments;

  await db.delete(alignments).where(eq(alignments.poemId, poemId));

  if (nextAlignments.length === 0) return [];

  const inserted = await db
    .insert(alignments)
    .values(
      nextAlignments.map((alignment) => ({
        id: alignment.id,
        poemId: alignment.poemId,
        sourceSegmentIds: JSON.stringify(alignment.sourceSegmentIds),
        targetSegmentIds: JSON.stringify(alignment.targetSegmentIds),
        kind: alignment.kind,
        confidence: alignment.confidence,
        createdBy: alignment.createdBy,
      }))
    )
    .returning();

  return inserted.map((row) => ({
    id: row.id,
    poemId: row.poemId,
    sourceSegmentIds: parseJsonArray<string>(row.sourceSegmentIds),
    targetSegmentIds: parseJsonArray<string>(row.targetSegmentIds),
    kind: row.kind as Alignment["kind"],
    confidence: row.confidence ?? undefined,
    createdBy: row.createdBy ?? undefined,
  }));
}

export function getFallbackSegments(): Segment[] {
  return seedSegments;
}

export function getFallbackAlignments(): Alignment[] {
  return seedAlignments;
}

export function getFallbackPoems(): Poem[] {
  return seedPoems;
}
