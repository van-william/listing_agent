import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getZillowDataByAddress, getZillowDataByZpid } from "@/lib/zillow";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address");
  const city = searchParams.get("city");
  const state = searchParams.get("state");
  const zpid = searchParams.get("zpid");

  try {
    let data;
    if (zpid) {
      data = await getZillowDataByZpid(zpid);
    } else if (address) {
      data = await getZillowDataByAddress(address, city || undefined, state || undefined);
    } else {
      return NextResponse.json({ error: "Address or zpid required" }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Zillow fetch failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

