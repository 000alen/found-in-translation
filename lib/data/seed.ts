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
    "A curated collection of Shakespeare's sonnets presented in elegant side-by-side translation, with linked lines and collaborative commentary.",
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
  return sourceLines.map((_, index) => ({
    id: `align-${index + 1}`,
    poemId: POEM_ID,
    sourceSegmentIds: [`${POEM_ID}:source:line-${index + 1}`],
    targetSegmentIds: [`${POEM_ID}:target:line-${index + 1}`],
    kind: "parallel" as const,
    confidence: 1,
    createdBy: "seed",
  }));
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
