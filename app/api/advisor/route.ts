import { NextResponse } from "next/server";
import { getListing, mockListings } from "@/lib/mockListings";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const message: string = String(body.message ?? "");
  const listingId: string | undefined = body.listingId ? String(body.listingId) : undefined;

  // Demo logic: deterministic, realtor-like structure.
  const listing = listingId ? getListing(listingId) : undefined;

  const answerLines: string[] = [];
  answerLines.push("Realtor Advisor (demo)\n");

  if (listing) {
    answerLines.push("MLS facts (from listing record):");
    answerLines.push(`- Address: ${listing.address}`);
    answerLines.push(`- Neighborhood: ${listing.neighborhood}`);
    answerLines.push(`- Status: ${listing.status}`);
    answerLines.push(`- Price: $${listing.price.toLocaleString()}`);
    answerLines.push(`- Beds/Baths/Sqft: ${listing.beds}/${listing.baths}/${listing.sqft.toLocaleString()}`);
    answerLines.push("");
  }

  answerLines.push("Agent insight (from notes / experience layer):");
  if (listing) {
    for (const h of listing.highlights) answerLines.push(`- ${h}`);
    answerLines.push("- I’d verify HOA rules + parking situation early (common friction point in Chicago condos)." );
  } else {
    answerLines.push("- If you share your target neighborhoods + commute constraints, I can rank the best fits.");
  }
  answerLines.push("");

  // Lightweight “next actions”
  answerLines.push("Next questions to refine:");
  answerLines.push("- Must-have CTA line / max walking minutes?");
  answerLines.push("- Parking required? Pets?" );
  answerLines.push("- Tolerance for noise (nightlife / arterial roads / L tracks)?");

  // Add a tiny ranked suggestion when it’s a general search prompt
  if (!listing && message.toLowerCase().includes("2 bed")) {
    answerLines.push("");
    answerLines.push("Quick picks (mock):");
    const picks = mockListings.filter((l) => l.beds >= 2).slice(0, 3);
    for (const p of picks) {
      answerLines.push(`- ${p.address} (${p.neighborhood}) — $${p.price.toLocaleString()} [${p.id}]`);
    }
  }

  return NextResponse.json({ answer: answerLines.join("\n") });
}
