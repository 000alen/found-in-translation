import type { Alignment, Book, Segment, TextEdition, TextWork } from "../types";
import { alignmentFromPassageIds } from "../anchors";

const BOOK_ID = "book-borges-library";
const WORK_ID = "work-library-babel";

const SOURCE_PARAGRAPH =
  "The universe (which others call the Library) is composed of an indefinite, perhaps infinite number of hexagonal galleries. In the center of each gallery is a ventilation shaft. From any hexagon one can see the floors above and below: a series of identical galleries that stretch toward the remote distance.";

const TARGET_PARAGRAPH =
  "El universo (que otros llaman la Biblioteca) está compuesto por un número indefinido, quizás infinito, de galerías hexagonales. En el centro de cada galería hay un pozo de ventilación. Desde cualquier hexágono se ven los pisos superior e inferior: una serie de galerías idénticas que se extienden hacia la distancia remota.";

export const proseBook: Book = {
  id: BOOK_ID,
  slug: "borges-library",
  title: "The Library of Babel",
  subtitle: "Prose · phrase-level alignment",
  authors: [{ name: "Jorge Luis Borges", role: "author" }],
  sourceLanguage: "en",
  targetLanguage: "es",
  description: "A short prose opening mapped phrase by phrase.",
  coverGradient: "from-stone-50 to-stone-100",
  publishedAt: "1941",
};

export const proseWork: TextWork = {
  id: WORK_ID,
  bookId: BOOK_ID,
  slug: "opening",
  title: "Opening",
  order: 1,
  contentType: "prose",
  sourceAuthor: "Jorge Luis Borges",
  translator: "Traducción atribuida",
};

function findRange(text: string, phrase: string) {
  const start = text.indexOf(phrase);
  if (start < 0) throw new Error(`Phrase not found: ${phrase}`);
  return { start, end: start + phrase.length };
}

function buildProseSegments(): Segment[] {
  const sourceParagraphId = `${WORK_ID}:source:p1`;
  const targetParagraphId = `${WORK_ID}:target:p1`;

  const sourceSpans: Array<{ id: string; phrase: string }> = [
    { id: `${WORK_ID}:source:span-1`, phrase: "an indefinite, perhaps infinite number of hexagonal galleries" },
    { id: `${WORK_ID}:source:span-2`, phrase: "a ventilation shaft" },
    { id: `${WORK_ID}:source:span-3`, phrase: "a series of identical galleries that stretch toward the remote distance" },
  ];

  const targetSpans: Array<{ id: string; phrase: string }> = [
    { id: `${WORK_ID}:target:span-1`, phrase: "un número indefinido, quizás infinito, de galerías hexagonales" },
    { id: `${WORK_ID}:target:span-2`, phrase: "un pozo de ventilación" },
    { id: `${WORK_ID}:target:span-3`, phrase: "una serie de galerías idénticas que se extienden hacia la distancia remota" },
  ];

  const segments: Segment[] = [
    {
      id: sourceParagraphId,
      workId: WORK_ID,
      side: "source",
      language: "en",
      kind: "paragraph",
      order: 1,
      text: SOURCE_PARAGRAPH,
    },
    {
      id: targetParagraphId,
      workId: WORK_ID,
      side: "target",
      language: "es",
      kind: "paragraph",
      order: 1,
      text: TARGET_PARAGRAPH,
    },
  ];

  sourceSpans.forEach((span, index) => {
    const range = findRange(SOURCE_PARAGRAPH, span.phrase);
    segments.push({
      id: span.id,
      workId: WORK_ID,
      side: "source",
      language: "en",
      kind: "span",
      parentId: sourceParagraphId,
      order: index + 1,
      text: span.phrase,
      range,
    });
  });

  targetSpans.forEach((span, index) => {
    const range = findRange(TARGET_PARAGRAPH, span.phrase);
    segments.push({
      id: span.id,
      workId: WORK_ID,
      side: "target",
      language: "es",
      kind: "span",
      parentId: targetParagraphId,
      order: index + 1,
      text: span.phrase,
      range,
    });
  });

  return segments;
}

function buildProseAlignments(segments: Segment[]): Alignment[] {
  const pairs: Array<[string, string, Alignment["kind"]]> = [
    [`${WORK_ID}:source:span-1`, `${WORK_ID}:target:span-1`, "partial"],
    [`${WORK_ID}:source:span-2`, `${WORK_ID}:target:span-2`, "parallel"],
    [`${WORK_ID}:source:span-3`, `${WORK_ID}:target:span-3`, "partial"],
  ];

  return pairs.map(([sourceId, targetId, kind], index) => ({
    ...alignmentFromPassageIds(WORK_ID, [sourceId], [targetId], segments, kind),
    id: `prose-g${index + 1}`,
    confidence: 0.95,
    createdBy: "seed",
  }));
}

export const proseSegments = buildProseSegments();
export const proseAlignments = buildProseAlignments(proseSegments);

export function getProseEdition(): TextEdition {
  return {
    book: proseBook,
    work: proseWork,
    poem: proseWork,
    segments: proseSegments,
    alignments: proseAlignments,
  };
}

export function getProseEditionBySlug(workSlug: string): TextEdition | null {
  if (workSlug !== proseWork.slug) return null;
  return getProseEdition();
}
