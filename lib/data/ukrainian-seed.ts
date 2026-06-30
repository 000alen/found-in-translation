import type { Alignment, Book, Segment, TextEdition, TextWork } from "../types";
import { alignmentFromPassageIds } from "../anchors";

const BOOK_ID = "book-shevchenko-zapovit";
const WORK_ID = "work-zapovit-opening";

const SOURCE_PARAGRAPH =
  "І мертвим, і живим, і ненародженим землякам моїм в Украйні і не в Украйні моє дружелюбнеє прощання й вас життем і волею цвіту мою пошлю.";

const TARGET_PARAGRAPH =
  "To my dead and living and yet unborn countrymen, in Ukraine and not in Ukraine, my friendly farewell I send you and my song of life and freedom.";

export const ukrainianBook: Book = {
  id: BOOK_ID,
  slug: "shevchenko-zapovit",
  title: "Заповіт",
  subtitle: "Prose · Ukrainian ↔ English · Cyrillic",
  authors: [{ name: "Тарас Шевченко", role: "author" }],
  sourceLanguage: "uk",
  targetLanguage: "en",
  description: "Ukrainian Cyrillic beside English.",
  coverGradient: "from-amber-50 to-yellow-100",
  publishedAt: "1845",
};

export const ukrainianWork: TextWork = {
  id: WORK_ID,
  bookId: BOOK_ID,
  slug: "zapovit",
  title: "Відкриття",
  order: 1,
  contentType: "prose",
  sourceAuthor: "Тарас Шевченко",
  translator: "Attributed translation",
};

function findRange(text: string, phrase: string) {
  const start = text.indexOf(phrase);
  if (start < 0) throw new Error(`Phrase not found: ${phrase}`);
  return { start, end: start + phrase.length };
}

function buildSegments(): Segment[] {
  const sourceParagraphId = `${WORK_ID}:source:p1`;
  const targetParagraphId = `${WORK_ID}:target:p1`;

  const sourceSpans: Array<{ id: string; phrase: string }> = [
    { id: `${WORK_ID}:source:span-1`, phrase: "в Украйні і не в Украйні" },
    { id: `${WORK_ID}:source:span-2`, phrase: "дружелюбнеє прощання" },
    { id: `${WORK_ID}:source:span-3`, phrase: "життем і волею" },
  ];

  const targetSpans: Array<{ id: string; phrase: string }> = [
    { id: `${WORK_ID}:target:span-1`, phrase: "in Ukraine and not in Ukraine" },
    { id: `${WORK_ID}:target:span-2`, phrase: "friendly farewell" },
    { id: `${WORK_ID}:target:span-3`, phrase: "life and freedom" },
  ];

  const segments: Segment[] = [
    {
      id: sourceParagraphId,
      workId: WORK_ID,
      side: "source",
      language: "uk",
      kind: "paragraph",
      order: 1,
      text: SOURCE_PARAGRAPH,
    },
    {
      id: targetParagraphId,
      workId: WORK_ID,
      side: "target",
      language: "en",
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
      language: "uk",
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
      language: "en",
      kind: "span",
      parentId: targetParagraphId,
      order: index + 1,
      text: span.phrase,
      range,
    });
  });

  return segments;
}

function buildAlignments(segments: Segment[]): Alignment[] {
  const pairs: Array<[string, string, Alignment["kind"]]> = [
    [`${WORK_ID}:source:span-1`, `${WORK_ID}:target:span-1`, "partial"],
    [`${WORK_ID}:source:span-2`, `${WORK_ID}:target:span-2`, "parallel"],
    [`${WORK_ID}:source:span-3`, `${WORK_ID}:target:span-3`, "partial"],
  ];

  return pairs.map(([sourceId, targetId, kind], index) => ({
    ...alignmentFromPassageIds(WORK_ID, [sourceId], [targetId], segments, kind),
    id: `uk-g${index + 1}`,
    confidence: 0.94,
    createdBy: "seed",
  }));
}

export const ukrainianSegments = buildSegments();
export const ukrainianAlignments = buildAlignments(ukrainianSegments);

export function getUkrainianEdition(): TextEdition {
  return {
    book: ukrainianBook,
    work: ukrainianWork,
    poem: ukrainianWork,
    segments: ukrainianSegments,
    alignments: ukrainianAlignments,
  };
}

export function getUkrainianEditionBySlug(bookSlug: string, workSlug: string): TextEdition | null {
  if (bookSlug !== ukrainianBook.slug || workSlug !== ukrainianWork.slug) return null;
  return getUkrainianEdition();
}
