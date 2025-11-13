import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/creator(.*)",
  "/admin(.*)",
  "/api/creator(.*)",
]);

export default clerkMiddleware((auth, req) => {
  // Skip middleware for RSC prefetch requests to avoid CORS issues
  // RSC prefetch requests have ?_rsc= query param or rsc header
  const isRscPrefetch =
    req.nextUrl.searchParams.has("_rsc") ||
    req.headers.get("rsc") === "1" ||
    req.headers.get("next-router-prefetch") === "1";

  if (isRscPrefetch) {
    // For RSC prefetch, just check auth but don't redirect
    // Let the actual navigation handle auth to avoid CORS errors
    const { userId } = auth();
    if (!userId && isProtectedRoute(req)) {
      // Return 401 instead of redirect for RSC prefetch to avoid CORS
      console.log("[MIDDLEWARE] RSC prefetch blocked (unauthorized):", {
        url: req.url,
        pathname: req.nextUrl.pathname,
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Allow RSC prefetch through if authorized or not protected
    return NextResponse.next();
  }

  if (!isProtectedRoute(req)) {
    return NextResponse.next();
  }

  const { userId } = auth();

  if (!userId) {
    // We don't have a /sign-in route; we use Clerk modal.
    // Send them home, and preserve where they wanted to go.
    const url = new URL("/", req.url);
    url.searchParams.set("next", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|.*\\..*).*)",
    "/(api|trpc)(.*)",
  ],
};
