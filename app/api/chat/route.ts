import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createEmbedding, createChatCompletion } from "@/lib/ai";
import { matchNotesByEmbedding } from "@/lib/notes";
import { buildMatchKeys } from "@/lib/keys";
import { getListingById } from "@/lib/repliers";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const message = String(body.message || "").trim();
  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  const listingId = body.listingId ? String(body.listingId) : null;
  const buildingAddress = body.buildingAddress ? String(body.buildingAddress) : null;
  const neighborhood = body.neighborhood ? String(body.neighborhood) : null;

  try {
    const embedding = await createEmbedding(message);
    const keys = buildMatchKeys({ listingId, buildingAddress, neighborhood });

    const [notes, listing] = await Promise.all([
      matchNotesByEmbedding({ embedding, keys, limit: 6 }),
      listingId ? getListingById(listingId).catch(() => null) : Promise.resolve(null)
    ]);

    const contextLines: string[] = [];
    if (listing) {
      contextLines.push("MLS facts:");
      contextLines.push(`- Address: ${listing.address}`);
      if (listing.price != null) contextLines.push(`- Price: $${listing.price.toLocaleString()}`);
      if (listing.beds != null || listing.baths != null || listing.sqft != null) {
        contextLines.push(
          `- Beds/Baths/Sqft: ${listing.beds ?? "?"}/${listing.baths ?? "?"}/${listing.sqft ?? "?"}`
        );
      }
      if (listing.status) contextLines.push(`- Status: ${listing.status}`);
      contextLines.push("");
    }

    if (notes.length) {
      contextLines.push("Realtor notes:");
      notes.forEach((note) => contextLines.push(`- ${note.content}`));
    } else {
      contextLines.push("Realtor notes: (none found)");
    }

    const reply = await createChatCompletion([
      {
        role: "system",
        content:
          "You are a helpful real estate advisor. Always separate MLS facts from realtor notes. If you are unsure, say so."
      },
      { role: "assistant", content: contextLines.join("\n") },
      { role: "user", content: message }
    ]);

    return NextResponse.json({ reply, notes, listing });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Chat failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
