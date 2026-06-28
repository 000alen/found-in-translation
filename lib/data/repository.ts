import type { Alignment, Book, TextEdition, TextWork } from "../types";
import { normalizeAlignment } from "../anchors";
import { getDb } from "../db";
import { alignments, books, poems, segments } from "../db/schema";
import {
  allSeedBooks,
  allSeedWorks,
  getStaticEdition,
  getStaticWorksForBook,
} from "./registry";
import { eq } from "drizzle-orm";

function parseJsonArray<T>(value: string): T[] {
  return JSON.parse(value) as T[];
}

function normalizeEditionAlignments(edition: TextEdition): Alignment[] {
  return edition.alignments.map((alignment) =>
    normalizeAlignment(alignment as Alignment & { sourceSegmentIds?: string[] }, edition.segments)
  );
}

export async function listBooks(): Promise<Book[]> {
  const db = getDb();
  if (!db) return allSeedBooks;

  const rows = await db.select().from(books);
  if (rows.length === 0) return allSeedBooks;

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
  if (!db) return allSeedBooks.find((book) => book.slug === slug) ?? null;

  const rows = await db.select().from(books).where(eq(books.slug, slug)).limit(1);
  const row = rows[0];
  if (!row) return allSeedBooks.find((book) => book.slug === slug) ?? null;

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

export async function listWorksForBook(bookSlug: string): Promise<TextWork[]> {
  const book = await getBookBySlug(bookSlug);
  if (!book) return [];

  const db = getDb();
  if (!db) return getStaticWorksForBook(bookSlug);

  const rows = await db
    .select()
    .from(poems)
    .where(eq(poems.bookId, book.id))
    .orderBy(poems.order);

  if (rows.length === 0) return getStaticWorksForBook(bookSlug);

  return rows.map((row) => ({
    id: row.id,
    bookId: row.bookId,
    slug: row.slug,
    title: row.title,
    order: row.order,
    contentType: (row as { contentType?: string }).contentType === "prose" ? "prose" : "poetry",
    sourceAuthor: row.sourceAuthor ?? undefined,
    translator: row.translator ?? undefined,
  }));
}

export async function getTextEdition(
  bookSlug: string,
  workSlug: string
): Promise<TextEdition | null> {
  const fallback = getStaticEdition(bookSlug, workSlug);
  if (!fallback) return null;

  const book = await getBookBySlug(bookSlug);
  if (!book || fallback.book.slug !== bookSlug) {
    if (bookSlug === fallback.book.slug) {
      return { ...fallback, book: (await getBookBySlug(bookSlug)) ?? fallback.book };
    }
    return null;
  }

  const db = getDb();
  if (!db) {
    return {
      ...fallback,
      book,
      alignments: normalizeEditionAlignments(fallback),
    };
  }

  const workList = await listWorksForBook(bookSlug);
  const work = workList.find((item) => item.slug === workSlug) ?? fallback.work;

  const segmentRows = await db
    .select()
    .from(segments)
    .where(eq(segments.poemId, work.id))
    .orderBy(segments.order);

  const alignmentRows = await db
    .select()
    .from(alignments)
    .where(eq(alignments.poemId, work.id));

  if (segmentRows.length === 0) {
    return { ...fallback, book, work, alignments: normalizeEditionAlignments(fallback) };
  }

  return {
    book,
    work,
    poem: work,
    segments: segmentRows.map((row) => ({
      id: row.id,
      workId: row.poemId,
      poemId: row.poemId,
      side: row.side as TextEdition["segments"][0]["side"],
      language: row.language,
      kind: row.kind as TextEdition["segments"][0]["kind"],
      parentId: row.parentId ?? undefined,
      order: row.order,
      text: row.text,
      range: row.metadata ? JSON.parse(row.metadata).range : undefined,
    })),
    alignments: alignmentRows.map((row) =>
      normalizeAlignment(
        {
          id: row.id,
          workId: row.poemId,
          poemId: row.poemId,
          sourceAnchors: parseJsonArray(row.sourceSegmentIds),
          targetAnchors: parseJsonArray(row.targetSegmentIds),
          kind: row.kind as Alignment["kind"],
          confidence: row.confidence ?? undefined,
          createdBy: row.createdBy ?? undefined,
        },
        fallback.segments
      )
    ),
  };
}

export async function saveAlignmentsForWork(
  workId: string,
  nextAlignments: Alignment[]
): Promise<Alignment[]> {
  const db = getDb();
  if (!db) return nextAlignments;

  await db.delete(alignments).where(eq(alignments.poemId, workId));

  if (nextAlignments.length === 0) return [];

  const inserted = await db
    .insert(alignments)
    .values(
      nextAlignments.map((alignment) => ({
        id: alignment.id,
        poemId: alignment.workId ?? alignment.poemId ?? workId,
        sourceSegmentIds: JSON.stringify(alignment.sourceAnchors),
        targetSegmentIds: JSON.stringify(alignment.targetAnchors),
        kind: alignment.kind,
        confidence: alignment.confidence,
        createdBy: alignment.createdBy,
      }))
    )
    .returning();

  return inserted.map((row) => ({
    id: row.id,
    workId: row.poemId,
    sourceAnchors: parseJsonArray(row.sourceSegmentIds),
    targetAnchors: parseJsonArray(row.targetSegmentIds),
    kind: row.kind as Alignment["kind"],
    confidence: row.confidence ?? undefined,
    createdBy: row.createdBy ?? undefined,
  }));
}

/** @deprecated */
export const listPoemsForBook = listWorksForBook;
export const getPoemEdition = getTextEdition;
export const saveAlignmentsForPoem = saveAlignmentsForWork;
