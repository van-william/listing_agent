import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { buildMatchKeys } from "@/lib/keys";
import { createEmbedding } from "@/lib/ai";
import { type NoteScope } from "@/lib/notes";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

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

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
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
    const supabase = createSupabaseServerClient();
    const keys = buildMatchKeys({ listingId, buildingAddress, neighborhood });
    const listingKey = keys.find((k) => k.startsWith("mred:")) || null;
    const buildingKey = keys.find((k) => k.startsWith("building:")) || null;
    const neighborhoodKey = keys.find((k) => k.startsWith("neighborhood:")) || null;

    // Create new embedding for updated content
    const embedding = await createEmbedding(content);

    const { data, error } = await supabase
      .from("realtor_notes")
      .update({
        scope,
        content,
        tags,
        listing_key: listingKey,
        building_key: buildingKey,
        neighborhood_key: neighborhoodKey,
        note_vector: embedding,
        updated_at: new Date().toISOString()
      })
      .eq("id", params.id)
      .select("id, scope, content, listing_key, building_key, neighborhood_key, tags, created_at")
      .single();

    if (error) throw new Error(error.message);
    if (!data) throw new Error("Note not found");

    return NextResponse.json({ note: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Note update failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase
      .from("realtor_notes")
      .delete()
      .eq("id", params.id);

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Note delete failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

