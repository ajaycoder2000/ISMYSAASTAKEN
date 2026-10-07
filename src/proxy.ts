import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/auth";

const COOKIE = "prelaunch_access";

// Paths that must stay reachable by the public during pre-launch.
const ALWAYS_ALLOWED_EXACT = [
  "/enter",
  "/exit",
  "/robots.txt",
  "/sitemap.xml",
  "/favicon.ico",
  "/opengraph-image",
  "/twitter-image",
];

const ALWAYS_ALLOWED_PREFIX = [
  "/waitlist/",        // /waitlist/confirmed etc.
  "/api/waitlist/",    // join, confirm, progress, unsubscribe
  "/api/webhook/",     // Dodo + Clerk webhooks (they verify their own signatures)
  "/api/cron/",        // Vercel cron (protected by CRON_SECRET)
  "/_next/",
];

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hasBypass(req: NextRequest): Promise<boolean> {
  const key = process.env.PRELAUNCH_BYPASS_KEY;
  if (!key) return false;
  const cookie = req.cookies.get(COOKIE)?.value;
  if (!cookie) return false;
  return cookie === (await sha256Hex(`${key}:prelaunch`));
}

function gate(req: NextRequest): NextResponse | null {
  const { pathname } = req.nextUrl;
  if (
    ALWAYS_ALLOWED_EXACT.includes(pathname) ||
    ALWAYS_ALLOWED_PREFIX.some((p) => pathname.startsWith(p))
  ) {
    return null;
  }

  if (pathname === "/") {
    // Show the waitlist at the root, keep the URL as "/", and preserve ?ref= and utm_* params.
    const url = req.nextUrl.clone();
    url.pathname = "/waitlist";
    return NextResponse.rewrite(url);
  }

  if (pathname === "/waitlist") {
    const url = req.nextUrl.clone();
    url.pathname = "/"; // one public URL; query string is preserved by clone()
    return NextResponse.redirect(url, 307);
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const url = req.nextUrl.clone();
  url.pathname = "/";
  url.search = "";
  return NextResponse.redirect(url, 307);
}

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  // 1. Pre-launch gate (when PRELAUNCH_MODE === "true" and visitor has no bypass cookie)
  if (process.env.PRELAUNCH_MODE === "true" && !(await hasBypass(req))) {
    const blocked = gate(req);
    if (blocked) return blocked;
  }

  // 2. Post-launch redirect: /waitlist (exact path) redirects to / with 307
  if (process.env.PRELAUNCH_MODE !== "true" && req.nextUrl.pathname === "/waitlist") {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url, 307);
  }

  // 3. Admin routes protection
  if (isAdminRoute(req)) {
    const { userId } = await auth();

    // Redirect unauthenticated visitors to /sign-in
    if (!userId) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    let isUserAdmin = false;
    const supabase = getSupabaseAdmin();

    if (supabase) {
      try {
        // Check profiles table (id is Clerk userId)
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_admin, email")
          .eq("id", userId)
          .maybeSingle();

        if (profile?.is_admin === true || (profile?.email && isAdminEmail(profile.email))) {
          isUserAdmin = true;
        }
      } catch {
        // Fall back to users table
      }

      if (!isUserAdmin) {
        try {
          const { data: userRow } = await supabase
            .from("users")
            .select("is_admin, role, email")
            .or(`clerk_id.eq.${userId},id.eq.${userId}`)
            .maybeSingle();

          if (
            userRow?.is_admin === true ||
            userRow?.role === "admin" ||
            (userRow?.email && isAdminEmail(userRow.email))
          ) {
            isUserAdmin = true;
          }
        } catch {
          // Fall back
        }
      }
    }

    // Redirect non-admins to home
    if (!isUserAdmin) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
