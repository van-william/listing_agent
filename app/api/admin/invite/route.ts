import { NextResponse } from "next/server";
import { inviteClient, requireAdmin } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const invitation = await inviteClient(email);
    return NextResponse.json({ success: true, invitation });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invitation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

