import { Source_Serif_4 } from "next/font/google";

/** Literary serif with Latin, Latin-ext (German), and Cyrillic (Ukrainian) coverage. */
export const literaryFont = Source_Serif_4({
  subsets: ["latin", "latin-ext", "cyrillic"],
  variable: "--font-literary",
  display: "swap",
  weight: ["400", "500", "600"],
});
