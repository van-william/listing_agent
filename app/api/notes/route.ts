import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { buildMatchKeys } from "@/lib/keys";
import { createEmbedding } from "@/lib/ai";
import { fetchNotesByKeys, insertNote, type NoteScope } from "@/lib/notes";

const ALLOWED_SCOPES = new Set<NoteScope>([
  "global",
  "listing",
  "building",
  "neighborhood"
]);

function parseTags(input: unknown) {
  if (Array.isArray(input)) {
    return input.map((tag) => String(tag).trim()).filter(Boolean);
  }
  if (typeof input === "string") {
    return input
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
  return [] as string[];
}

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const listingId = searchParams.get("listingId");
  const buildingAddress = searchParams.get("buildingAddress");
  const neighborhood = searchParams.get("neighborhood");
  const limitParam = searchParams.get("limit");
  const limit = Math.min(Math.max(Number(limitParam ?? 8), 1), 50);

  try {
    const keys = buildMatchKeys({ listingId, buildingAddress, neighborhood });
    const notes = await fetchNotesByKeys(keys, limit);
    return NextResponse.json({ notes });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Notes fetch failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { userId, orgId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const scope = String(body.scope || "global") as NoteScope;
  const content = String(body.content || "").trim();

  if (!ALLOWED_SCOPES.has(scope)) {
    return NextResponse.json({ error: "Invalid scope" }, { status: 400 });
  }

  if (!content) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  const listingId = body.listingId ? String(body.listingId) : null;
  const buildingAddress = body.buildingAddress ? String(body.buildingAddress) : null;
  const neighborhood = body.neighborhood ? String(body.neighborhood) : null;
  const tags = parseTags(body.tags);

  if (scope === "listing" && !listingId) {
    return NextResponse.json({ error: "Listing ID is required" }, { status: 400 });
  }
  if (scope === "building" && !buildingAddress) {
    return NextResponse.json({ error: "Building address is required" }, { status: 400 });
  }
  if (scope === "neighborhood" && !neighborhood) {
    return NextResponse.json({ error: "Neighborhood is required" }, { status: 400 });
  }

  try {
    const embedding = await createEmbedding(content);
    const note = await insertNote({
      scope,
      content,
      tags,
      listingId,
      buildingAddress,
      neighborhood,
      createdBy: userId,
      orgId: orgId ?? null,
      embedding
    });

    return NextResponse.json({ note });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Note insert failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
