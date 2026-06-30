import type { Alignment, Book, Segment, TextEdition, TextWork } from "../types";
import { alignmentFromPassageIds } from "../anchors";

const BOOK_ID = "book-shakespeare-sonnets";
const WORK_ID = "work-sonnet-18";

export const seedBook: Book = {
  id: BOOK_ID,
  slug: "shakespeare-sonnets",
  title: "Shakespeare's Sonnets",
  subtitle: "Poetry · selected bilingual editions",
  authors: [{ name: "William Shakespeare", role: "author" }],
  sourceLanguage: "en",
  targetLanguage: "es",
  description: "A sonnet in two voices.",
  coverGradient: "from-stone-100 to-stone-50",
  publishedAt: "1609",
};

export const seedWork: TextWork = {
  id: WORK_ID,
  bookId: BOOK_ID,
  slug: "sonnet-18",
  title: "Sonnet XVIII",
  order: 1,
  contentType: "poetry",
  sourceAuthor: "William Shakespeare",
  translator: "Traducción atribuida",
};

const sourceLines = [
  "Shall I compare thee to a summer's day?",
  "Thou art more lovely and more temperate:",
  "Rough winds do shake the darling buds of May,",
  "And summer's lease hath all too short a date;",
  "Sometime too hot the eye of heaven shines,",
  "And often is his gold complexion dimm'd;",
  "And every fair from fair sometime declines,",
  "By chance or nature's changing course untrimm'd;",
  "But thy eternal summer shall not fade",
  "Nor lose possession of that fair thou ow'st;",
  "Nor shall Death brag thou wander'st in his shade,",
  "When in eternal lines to time thou grow'st:",
  "So long as men can breathe or eyes can see,",
  "So long lives this, and this gives life to thee.",
];

const targetLines = [
  "¿He de compararte con un día de verano?",
  "Eres más hermosa y más templada:",
  "Los vientos ásperos sacuden las queridas flores de mayo,",
  "Y el arrendamiento del verano tiene fecha demasiado breve;",
  "A veces demasiado caliente brilla el ojo del cielo,",
  "Y a menudo su dorado semblante se apaga;",
  "Y toda belleza de la belleza alguna vez declina,",
  "Por azar o por el curso cambiante de la naturaleza;",
  "Pero tu verano eterno no ha de marchitarse",
  "Ni perder posesión de esa belleza que posees;",
  "Ni la Muerte se jactará de que vagues en su sombra,",
  "Cuando en líneas eternas crezcas con el tiempo:",
  "Mientras los hombres respiren o los ojos puedan ver,",
  "Tanto vivirá esto, y esto te dará vida.",
];

function buildPoetrySegments(): Segment[] {
  const result: Segment[] = [];

  for (const side of ["source", "target"] as const) {
    const lines = side === "source" ? sourceLines : targetLines;
    const language = side === "source" ? "en" : "es";
    const stanzaId = `${WORK_ID}:${side}:stanza-1`;

    result.push({
      id: stanzaId,
      workId: WORK_ID,
      poemId: WORK_ID,
      side,
      language,
      kind: "stanza",
      order: 0,
      text: "",
    });

    lines.forEach((text, index) => {
      result.push({
        id: `${WORK_ID}:${side}:line-${index + 1}`,
        workId: WORK_ID,
        poemId: WORK_ID,
        side,
        language,
        kind: "line",
        parentId: stanzaId,
        order: index + 1,
        text,
      });
    });
  }

  return result;
}

function buildPoetryAlignments(segments: Segment[]): Alignment[] {
  const s = (n: number) => `${WORK_ID}:source:line-${n}`;
  const t = (n: number) => `${WORK_ID}:target:line-${n}`;

  const specs: Array<[string[], string[], Alignment["kind"]]> = [
    [[s(1)], [t(1)], "parallel"],
    [[s(2)], [t(2)], "parallel"],
    [[s(3), s(4)], [t(4), t(3)], "cross"],
    [[s(5), s(6)], [t(5), t(6)], "parallel"],
    [[s(7), s(8)], [t(7), t(8)], "partial"],
    [[s(9), s(10)], [t(9)], "partial"],
    [[s(11)], [t(10), t(11)], "partial"],
    [[s(12)], [t(12)], "parallel"],
    [[s(13), s(14)], [t(13), t(14)], "parallel"],
  ];

  return specs.map(([sourceIds, targetIds, kind], index) => ({
    ...alignmentFromPassageIds(WORK_ID, sourceIds, targetIds, segments, kind),
    id: `g${index + 1}`,
    confidence: 0.9,
    createdBy: "seed",
  }));
}

export const poetrySegments = buildPoetrySegments();
export const poetryAlignments = buildPoetryAlignments(poetrySegments);

export const seedBooks: Book[] = [seedBook];
export const seedWorks: TextWork[] = [seedWork];

export function getSeedEdition(workSlug: string): TextEdition | null {
  if (workSlug !== seedWork.slug) return null;
  return {
    book: seedBook,
    work: seedWork,
    poem: seedWork,
    segments: poetrySegments,
    alignments: poetryAlignments,
  };
}

export function getSeedBook(slug: string): Book | null {
  return seedBooks.find((book) => book.slug === slug) ?? null;
}

export function getSeedWorksForBook(bookSlug: string): TextWork[] {
  const book = getSeedBook(bookSlug);
  if (!book) return [];
  return seedWorks.filter((work) => work.bookId === book.id);
}

// Legacy exports
export const seedPoem = seedWork;
export const seedSegments = poetrySegments;
export const seedAlignments = poetryAlignments;
export const seedPoems = seedWorks;
export const getSeedPoemsForBook = getSeedWorksForBook;
