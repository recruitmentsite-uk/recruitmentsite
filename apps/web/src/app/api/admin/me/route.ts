import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET() {
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json({
    email: user.email,
    id: user.id,
  });
}
