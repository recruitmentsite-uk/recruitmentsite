import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isUsableEnvValue, isValidHttpUrl } from "@/lib/env";

const CAREERS_HOST_SUFFIX = ".recruitmentsite.co.uk";
const APEX_HOST = "recruitmentsite.co.uk";

function careersSlugFromHost(host: string): string | null {
  if (host === APEX_HOST || host === `www.${APEX_HOST}`) return null;
  if (!host.endsWith(CAREERS_HOST_SUFFIX)) return null;
  const slug = host.slice(0, -CAREERS_HOST_SUFFIX.length);
  if (!slug || slug.includes(".")) return null;
  return slug;
}

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0]?.toLowerCase() ?? "";
  const { pathname } = request.nextUrl;

  if (host === `www.${APEX_HOST}`) {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    url.hostname = APEX_HOST;
    url.port = "";
    return NextResponse.redirect(url, 308);
  }

  const careersSlug = careersSlugFromHost(host);
  if (careersSlug && (pathname === "/" || pathname === "")) {
    const url = request.nextUrl.clone();
    url.pathname = `/careers/${careersSlug}`;
    return NextResponse.rewrite(url);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let supabaseResponse = NextResponse.next({ request });

  // Match client/server helpers: reject masked/malformed URLs so middleware
  // never throws MIDDLEWARE_INVOCATION_FAILED on auth routes.
  if (
    !isUsableEnvValue(supabaseUrl) ||
    !isValidHttpUrl(supabaseUrl) ||
    !isUsableEnvValue(supabaseKey)
  ) {
    return supabaseResponse;
  }

  const isProtected = pathname.startsWith("/dashboard") || pathname.startsWith("/onboarding");
  const isAuthPage = pathname === "/login" || pathname === "/signup" || pathname === "/forgot-password";
  const isAdmin = pathname.startsWith("/admin");

  if (!isProtected && !isAuthPage && !isAdmin) {
    return supabaseResponse;
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (isAdmin && !user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (isProtected && !user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (isAuthPage && user) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  } catch {
    return supabaseResponse;
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)"],
};
