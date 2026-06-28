import { NextResponse } from "next/server";
import { listBooks } from "@/lib/data/repository";

export async function GET() {
  const books = await listBooks();
  return NextResponse.json({ books });
}
