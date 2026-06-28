import type { Book, TextEdition, TextWork } from "../types";
import { getSeedEdition, seedBook, seedWork, seedWorks, seedSegments } from "./seed";
import { getProseEditionBySlug, proseBook, proseWork, proseSegments } from "./prose-seed";
import {
  getUkrainianEditionBySlug,
  ukrainianBook,
  ukrainianWork,
  ukrainianSegments,
} from "./ukrainian-seed";
import { getGermanEditionBySlug, germanBook, germanWork, germanSegments } from "./german-seed";

export const allSeedBooks: Book[] = [seedBook, proseBook, ukrainianBook, germanBook];

export const allSeedWorks: TextWork[] = [seedWork, proseWork, ukrainianWork, germanWork];

export const allSeedSegments = [
  ...seedSegments,
  ...proseSegments,
  ...ukrainianSegments,
  ...germanSegments,
];

const editionLookups: Array<(bookSlug: string, workSlug: string) => TextEdition | null> = [
  (bookSlug, workSlug) => {
    const edition = getSeedEdition(workSlug);
    return edition?.book.slug === bookSlug ? edition : null;
  },
  (bookSlug, workSlug) => {
    const edition = getProseEditionBySlug(workSlug);
    return edition?.book.slug === bookSlug ? edition : null;
  },
  getUkrainianEditionBySlug,
  getGermanEditionBySlug,
];

export function getStaticEdition(bookSlug: string, workSlug: string): TextEdition | null {
  for (const lookup of editionLookups) {
    const edition = lookup(bookSlug, workSlug);
    if (edition) return edition;
  }
  return null;
}

export function getStaticWorksForBook(bookSlug: string): TextWork[] {
  return allSeedWorks.filter((work) => {
    const book = allSeedBooks.find((b) => b.id === work.bookId);
    return book?.slug === bookSlug;
  });
}
