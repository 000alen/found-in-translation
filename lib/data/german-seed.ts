import type { Alignment, Book, Segment, TextEdition, TextWork } from "../types";
import { alignmentFromPassageIds } from "../anchors";

const BOOK_ID = "book-rilke-herbsttag";
const WORK_ID = "work-herbsttag";

export const germanBook: Book = {
  id: BOOK_ID,
  slug: "rilke-herbsttag",
  title: "Herbsttag",
  subtitle: "Poetry · German ↔ English",
  authors: [{ name: "Rainer Maria Rilke", role: "author" }],
  sourceLanguage: "de",
  targetLanguage: "en",
  description: "German autumn lines beside English.",
  coverGradient: "from-stone-100 to-amber-50",
  publishedAt: "1902",
};

export const germanWork: TextWork = {
  id: WORK_ID,
  bookId: BOOK_ID,
  slug: "herbsttag",
  title: "Herbsttag",
  order: 1,
  contentType: "poetry",
  sourceAuthor: "Rainer Maria Rilke",
  translator: "Attributed translation",
};

const sourceLines = [
  "Herr: es ist Zeit. Der Sommer war sehr groß.",
  "Leg deinen Schatten auf die Sonnenuhren,",
  "und auf den Fluren laß die Winde los.",
  "Befiehl den letzten Früchten voll zu sein;",
  "gib ihnen noch zwei südlichere, drängende Tage,",
  "dränge sie zur Vollendung und jage",
  "die letzte Süße in den schweren Wein.",
  "Wer jetzt kein Haus hat, baut sich keines mehr.",
  "Wer jetzt allein ist, wird es lange bleiben,",
  "wird wachen, lesen, lange Briefe schreiben",
  "und wird in den Alleen hin und her",
  "unruhig wandern, wenn die Blätter treiben.",
];

const targetLines = [
  "Lord: it is time. Summer was immense.",
  "Lay your shadow on the sundials now,",
  "and through the meadows let the winds go loose.",
  "Command the final fruits to be full;",
  "give them two more southerly, urgent days,",
  "urge them to completion and chase",
  "the last sweetness into the heavy wine.",
  "Whoever has no house now will build no more.",
  "Whoever is alone now will remain alone,",
  "will wake, read, write long letters",
  "and will wander restlessly up and down",
  "the avenues when the leaves are driven.",
];

function buildSegments(): Segment[] {
  const result: Segment[] = [];

  for (const side of ["source", "target"] as const) {
    const lines = side === "source" ? sourceLines : targetLines;
    const language = side === "source" ? "de" : "en";
    const stanzaId = `${WORK_ID}:${side}:stanza-1`;

    result.push({
      id: stanzaId,
      workId: WORK_ID,
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

function buildAlignments(segments: Segment[]): Alignment[] {
  const s = (n: number) => `${WORK_ID}:source:line-${n}`;
  const t = (n: number) => `${WORK_ID}:target:line-${n}`;

  const specs: Array<[string[], string[], Alignment["kind"]]> = [
    [[s(1)], [t(1)], "parallel"],
    [[s(2)], [t(2)], "parallel"],
    [[s(3)], [t(3)], "parallel"],
    [[s(4), s(5)], [t(4), t(5)], "partial"],
    [[s(6), s(7)], [t(6), t(7)], "partial"],
    [[s(8)], [t(8)], "parallel"],
    [[s(9), s(10)], [t(9), t(10)], "parallel"],
    [[s(11), s(12)], [t(11), t(12)], "parallel"],
  ];

  return specs.map(([sourceIds, targetIds, kind], index) => ({
    ...alignmentFromPassageIds(WORK_ID, sourceIds, targetIds, segments, kind),
    id: `de-g${index + 1}`,
    confidence: 0.92,
    createdBy: "seed",
  }));
}

export const germanSegments = buildSegments();
export const germanAlignments = buildAlignments(germanSegments);

export function getGermanEdition(): TextEdition {
  return {
    book: germanBook,
    work: germanWork,
    poem: germanWork,
    segments: germanSegments,
    alignments: germanAlignments,
  };
}

export function getGermanEditionBySlug(bookSlug: string, workSlug: string): TextEdition | null {
  if (bookSlug !== germanBook.slug || workSlug !== germanWork.slug) return null;
  return getGermanEdition();
}
