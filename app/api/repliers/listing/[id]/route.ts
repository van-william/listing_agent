import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getListingDetailById } from "@/lib/repliers";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const listing = await getListingDetailById(params.id);
    return NextResponse.json({ listing });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Listing fetch failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
