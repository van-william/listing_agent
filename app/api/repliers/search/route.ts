import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { searchListings } from "@/lib/repliers";

function normalizeStatus(value: string | null) {
  if (!value) return "A";
  const normalized = value.trim().toUpperCase();
  if (normalized === "A" || normalized === "U") return normalized;
  if (normalized === "ACTIVE") return "A";
  return null;
}

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);

  try {
    const result = await searchListings({
      q: searchParams.get("q") || "",
      city: searchParams.get("city") || undefined,
      minPrice: searchParams.get("minPrice"),
      maxPrice: searchParams.get("maxPrice"),
      minBeds: searchParams.get("minBeds"),
      maxBeds: searchParams.get("maxBeds"),
      status: normalizeStatus(searchParams.get("status"))
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Search failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
