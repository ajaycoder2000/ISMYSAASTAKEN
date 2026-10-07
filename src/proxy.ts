import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/auth";

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  // Only gate /admin routes
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
