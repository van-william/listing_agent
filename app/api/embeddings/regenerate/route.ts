import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createEmbedding } from "@/lib/ai";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export async function POST(req: Request) {
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
  const noteId = String(body.noteId || "");

  if (!noteId) {
    return NextResponse.json({ error: "Note ID is required" }, { status: 400 });
  }

  try {
    const supabase = createSupabaseServerClient();

    // Fetch the note
    const { data: note, error: fetchError } = await supabase
      .from("realtor_notes")
      .select("id, content")
      .eq("id", noteId)
      .single();

    if (fetchError || !note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    // Generate new embedding
    const embedding = await createEmbedding(note.content);

    // Update the note with new embedding
    const { error: updateError } = await supabase
      .from("realtor_notes")
      .update({
        note_vector: embedding,
        updated_at: new Date().toISOString()
      })
      .eq("id", noteId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    return NextResponse.json({ success: true, message: "Embedding regenerated" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Embedding regeneration failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

