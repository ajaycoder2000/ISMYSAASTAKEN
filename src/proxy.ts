import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/auth";

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  // Only gate /admin routes
  if (isAdminRoute(req)) {
    // 1. Check Clerk session
    const { userId } = await auth();

    // 2. Check Supabase Auth session if Clerk session not present
    let supabaseUserId: string | null = null;
    let supabaseEmail: string | null = null;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      try {
        const supabaseSsr = createServerClient(supabaseUrl, supabaseAnonKey, {
          cookies: {
            getAll() {
              return req.cookies.getAll();
            },
            setAll() {},
          },
        });
        const { data: { session } } = await supabaseSsr.auth.getSession();
        if (session?.user) {
          supabaseUserId = session.user.id;
          supabaseEmail = session.user.email || null;
        }
      } catch {
        // Fall back to Clerk userId
      }
    }

    const activeUserId = userId || supabaseUserId;

    // Redirect unauthenticated visitors to /sign-in
    if (!activeUserId) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    // 3. Verify admin access via is_admin in Supabase
    let isUserAdmin = false;
    if (supabaseEmail && isAdminEmail(supabaseEmail)) {
      isUserAdmin = true;
    }

    const supabase = getSupabaseAdmin();
    if (supabase && !isUserAdmin) {
      try {
        // Check profiles table (brief specification)
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_admin, email")
          .eq("id", activeUserId)
          .maybeSingle();

        if (profile?.is_admin === true || (profile?.email && isAdminEmail(profile.email))) {
          isUserAdmin = true;
        }
      } catch {
        // Fall back to users table
      }

      if (!isUserAdmin) {
        try {
          // Check users table (IsMySaaSTaken synced users table)
          const { data: userRow } = await supabase
            .from("users")
            .select("is_admin, role, email")
            .or(`clerk_id.eq.${activeUserId},id.eq.${activeUserId}`)
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
