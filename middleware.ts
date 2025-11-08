import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/creator(.*)",
  "/admin(.*)",
  "/api/creator(.*)",
]);

export default clerkMiddleware((auth, req) => {
  // Always initialize Clerk by calling auth() for all routes
  // This ensures auth() can be called in components like Nav
  const { userId } = auth();

  // Public route → just continue
  if (!isProtectedRoute(req)) {
    return NextResponse.next();
  }

  // For protected routes, check auth
  if (!userId) {
    // Redirect unauthenticated users to Clerk sign-in
    return auth().redirectToSignIn({
      returnBackUrl: req.url,
    });
  }

  // Authenticated → continue
  return NextResponse.next();
});

export const config = {
  // Run on all routes except Next internals & static assets
  // Include _not-found to ensure Clerk is initialized for 404 pages
  matcher: [
    "/((?!_next|.*\\..*).*)",
    "/(api|trpc)(.*)",
  ],
};

