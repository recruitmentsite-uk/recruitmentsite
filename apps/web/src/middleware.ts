import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Canonical host is apex; send www traffic there with a permanent redirect. */
export function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0]?.toLowerCase();
  if (host === "www.recruitmentsite.co.uk") {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    url.hostname = "recruitmentsite.co.uk";
    url.port = "";
    return NextResponse.redirect(url, 308);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)"],
};
