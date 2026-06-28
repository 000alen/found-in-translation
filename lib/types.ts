export type SegmentKind = "title" | "stanza" | "line" | "note";

export type SegmentSide = "source" | "target";

export type AlignmentKind = "parallel" | "cross" | "partial";

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

export type Poem = {
  id: string;
  bookId: string;
  slug: string;
  title: string;
  order: number;
  sourceAuthor?: string;
  translator?: string;
};

export type Segment = {
  id: string;
  poemId: string;
  side: SegmentSide;
  language: string;
  kind: SegmentKind;
  parentId?: string;
  order: number;
  text: string;
  metadata?: {
    meter?: string;
    rhyme?: string;
  };
};

export type Alignment = {
  id: string;
  poemId: string;
  sourceSegmentIds: string[];
  targetSegmentIds: string[];
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

export type PoemEdition = {
  book: Book;
  poem: Poem;
  segments: Segment[];
  alignments: Alignment[];
};

export type ViewMode = "read" | "align" | "comment";

export type MobileColumn = "source" | "target" | "both";
