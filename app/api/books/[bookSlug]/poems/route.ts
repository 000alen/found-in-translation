import { NextResponse } from "next/server";
import { getBookBySlug, listPoemsForBook } from "@/lib/data/repository";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ bookSlug: string }> }
) {
  const { bookSlug } = await params;
  const poems = await listPoemsForBook(bookSlug);
  return NextResponse.json({ poems });
}
