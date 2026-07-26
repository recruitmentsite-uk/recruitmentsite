import { NextResponse } from "next/server";

/** IndexNow ownership key — must stay at /{key}.txt on the apex host. */
const KEY = "recruitmentsite-indexnow-7f3a9c2e1b84";

export function GET() {
  return new NextResponse(KEY, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
