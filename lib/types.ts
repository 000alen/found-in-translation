export type ContentType = "poetry" | "prose";

export type SegmentKind = "title" | "stanza" | "line" | "paragraph" | "span" | "note";

export type SegmentSide = "source" | "target";

export type AlignmentKind = "parallel" | "cross" | "partial";

/** Character range within a parent paragraph segment (prose spans). */
export type TextRange = {
  start: number;
  end: number;
};

export type Person = {
  name: string;
  role?: string;
};

export type Book = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  authors: Person[];
  sourceLanguage: string;
  targetLanguage: string;
  description: string;
  coverGradient?: string;
  publishedAt?: string;
};

export type TextWork = {
  id: string;
  bookId: string;
  slug: string;
  title: string;
  order: number;
  contentType: ContentType;
  sourceAuthor?: string;
  translator?: string;
};

/** @deprecated Use TextWork */
export type Poem = TextWork;

/**
 * A passage is any alignable unit: a line, a full paragraph, or a span inside one.
 * Spans use `parentId` + `range` to locate themselves within paragraph text.
 */
export type Segment = {
  id: string;
  workId: string;
  /** @deprecated Use workId */
  poemId?: string;
  side: SegmentSide;
  language: string;
  kind: SegmentKind;
  parentId?: string;
  order: number;
  text: string;
  /** Offsets within parent paragraph text — only for kind === "span" */
  range?: TextRange;
  metadata?: {
    meter?: string;
    rhyme?: string;
  };
};

/**
 * W3C-style anchor: stable id + quoted text for resilient linking.
 * Every alignable passage has a corresponding anchor id (usually === segment.id).
 */
export type TextAnchor = {
  id: string;
  segmentId: string;
  quote: string;
  range?: TextRange;
  prefix?: string;
  suffix?: string;
};

export type Alignment = {
  id: string;
  workId: string;
  /** @deprecated Use workId */
  poemId?: string;
  sourceAnchors: TextAnchor[];
  targetAnchors: TextAnchor[];
  kind: AlignmentKind;
  confidence?: number;
  createdBy?: string;
};

export type TextQuoteSelector = {
  type: "TextQuoteSelector";
  exact: string;
  prefix?: string;
  suffix?: string;
};

export type FragmentSelector = {
  type: "FragmentSelector";
  value: string;
};

export type CommentAnchor = {
  segmentId: string;
  selectors: (FragmentSelector | TextQuoteSelector)[];
};

export type TextEdition = {
  book: Book;
  work: TextWork;
  /** @deprecated Use work */
  poem?: TextWork;
  segments: Segment[];
  alignments: Alignment[];
};

/** @deprecated Use TextEdition */
export type PoemEdition = TextEdition;

export type ViewMode = "read" | "align" | "comment";

export type MobileColumn = "source" | "target" | "both";

export type ThemeMode = "light" | "dark" | "system";
