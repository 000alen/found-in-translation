import { NextResponse } from "next/server";
import { getPoemEdition, saveAlignmentsForPoem } from "@/lib/data/repository";
import type { Alignment } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const poemId = searchParams.get("poemId");
  const bookSlug = searchParams.get("bookSlug");
  const poemSlug = searchParams.get("poemSlug");

  if (bookSlug && poemSlug) {
    const edition = await getPoemEdition(bookSlug, poemSlug);
    if (!edition) {
      return NextResponse.json({ error: "Poem not found" }, { status: 404 });
    }
    return NextResponse.json({ alignments: edition.alignments });
  }

  return NextResponse.json({ error: "Missing query parameters" }, { status: 400 });
}

export async function PUT(request: Request) {
  const { searchParams } = new URL(request.url);
  const poemId = searchParams.get("poemId");

  if (!poemId) {
    return NextResponse.json({ error: "poemId is required" }, { status: 400 });
  }

  const body = (await request.json()) as { alignments: Alignment[] };
  const saved = await saveAlignmentsForPoem(poemId, body.alignments ?? []);
  return NextResponse.json({ alignments: saved });
}
