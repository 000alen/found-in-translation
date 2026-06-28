import type { Alignment, Book, Poem, PoemEdition, Segment } from "../types";

const BOOK_ID = "book-shakespeare-sonnets";
const POEM_ID = "poem-sonnet-18";

export const seedBook: Book = {
  id: BOOK_ID,
  slug: "shakespeare-sonnets",
  title: "Shakespeare's Sonnets",
  subtitle: "Selected bilingual editions",
  authors: [{ name: "William Shakespeare", role: "author" }],
  sourceLanguage: "en",
  targetLanguage: "es",
  description:
            "Side-by-side translations with linked passages, alignment tools, and collaborative commentary.",
  coverGradient: "from-amber-100 via-orange-50 to-rose-100",
  publishedAt: "1609",
};

export const seedPoem: Poem = {
  id: POEM_ID,
  bookId: BOOK_ID,
  slug: "sonnet-18",
  title: "Sonnet XVIII",
  order: 1,
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

function buildSegments(): Segment[] {
  const result: Segment[] = [];

  for (const side of ["source", "target"] as const) {
    const lines = side === "source" ? sourceLines : targetLines;
    const language = side === "source" ? "en" : "es";
    const stanzaParentId = `${POEM_ID}:${side}:stanza-1`;

    result.push({
      id: stanzaParentId,
      poemId: POEM_ID,
      side,
      language,
      kind: "stanza",
      order: 0,
      text: "",
    });

    lines.forEach((text, index) => {
      result.push({
        id: `${POEM_ID}:${side}:line-${index + 1}`,
        poemId: POEM_ID,
        side,
        language,
        kind: "line",
        parentId: stanzaParentId,
        order: index + 1,
        text,
      });
    });
  }

  return result;
}

function buildAlignments(): Alignment[] {
  const s = (line: number) => `${POEM_ID}:source:line-${line}`;
  const t = (line: number) => `${POEM_ID}:target:line-${line}`;

  return [
    { id: "g1", poemId: POEM_ID, sourceSegmentIds: [s(1)], targetSegmentIds: [t(1)], kind: "parallel", confidence: 1, createdBy: "seed" },
    { id: "g2", poemId: POEM_ID, sourceSegmentIds: [s(2)], targetSegmentIds: [t(2)], kind: "parallel", confidence: 1, createdBy: "seed" },
    // Nature imagery appears in different order across languages
    { id: "g3", poemId: POEM_ID, sourceSegmentIds: [s(3), s(4)], targetSegmentIds: [t(4), t(3)], kind: "cross", confidence: 0.92, createdBy: "seed" },
    { id: "g4", poemId: POEM_ID, sourceSegmentIds: [s(5), s(6)], targetSegmentIds: [t(5), t(6)], kind: "parallel", confidence: 0.95, createdBy: "seed" },
    { id: "g5", poemId: POEM_ID, sourceSegmentIds: [s(7), s(8)], targetSegmentIds: [t(7), t(8)], kind: "partial", confidence: 0.9, createdBy: "seed" },
    // Two English lines compress into one Spanish line
    { id: "g6", poemId: POEM_ID, sourceSegmentIds: [s(9), s(10)], targetSegmentIds: [t(9)], kind: "partial", confidence: 0.88, createdBy: "seed" },
    // One English line expands into two Spanish lines
    { id: "g7", poemId: POEM_ID, sourceSegmentIds: [s(11)], targetSegmentIds: [t(10), t(11)], kind: "partial", confidence: 0.86, createdBy: "seed" },
    { id: "g8", poemId: POEM_ID, sourceSegmentIds: [s(12)], targetSegmentIds: [t(12)], kind: "parallel", confidence: 1, createdBy: "seed" },
    { id: "g9", poemId: POEM_ID, sourceSegmentIds: [s(13), s(14)], targetSegmentIds: [t(13), t(14)], kind: "parallel", confidence: 0.94, createdBy: "seed" },
  ];
}

export const seedSegments = buildSegments();
export const seedAlignments = buildAlignments();

export const seedBooks: Book[] = [seedBook];
export const seedPoems: Poem[] = [seedPoem];

export function getSeedEdition(poemSlug: string): PoemEdition | null {
  if (poemSlug !== seedPoem.slug) return null;
  return {
    book: seedBook,
    poem: seedPoem,
    segments: seedSegments,
    alignments: seedAlignments,
  };
}

export function getSeedBook(slug: string): Book | null {
  return seedBooks.find((book) => book.slug === slug) ?? null;
}

export function getSeedPoemsForBook(bookSlug: string): Poem[] {
  const book = getSeedBook(bookSlug);
  if (!book) return [];
  return seedPoems.filter((poem) => poem.bookId === book.id);
}
