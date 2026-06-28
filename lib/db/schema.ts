import {
  integer,
  pgTable,
  real,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const books = pgTable("books", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  authors: text("authors").notNull(),
  sourceLanguage: text("source_language").notNull(),
  targetLanguage: text("target_language").notNull(),
  description: text("description").notNull(),
  coverGradient: text("cover_gradient"),
  publishedAt: text("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const poems = pgTable("poems", {
  id: text("id").primaryKey(),
  bookId: text("book_id")
    .notNull()
    .references(() => books.id, { onDelete: "cascade" }),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  order: integer("order").notNull(),
  sourceAuthor: text("source_author"),
  translator: text("translator"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const segments = pgTable("segments", {
  id: text("id").primaryKey(),
  poemId: text("poem_id")
    .notNull()
    .references(() => poems.id, { onDelete: "cascade" }),
  side: text("side").notNull(),
  language: text("language").notNull(),
  kind: text("kind").notNull(),
  parentId: text("parent_id"),
  order: integer("order").notNull(),
  text: text("text").notNull(),
  metadata: text("metadata"),
});

export const alignments = pgTable("alignments", {
  id: text("id").primaryKey(),
  poemId: text("poem_id")
    .notNull()
    .references(() => poems.id, { onDelete: "cascade" }),
  sourceSegmentIds: text("source_segment_ids").notNull(),
  targetSegmentIds: text("target_segment_ids").notNull(),
  kind: text("kind").notNull().default("parallel"),
  confidence: real("confidence"),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
