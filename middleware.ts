import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/creator(.*)",
  "/admin(.*)",
  "/api/creator(.*)",
]);

export default clerkMiddleware((auth, req) => {
  // Public route → just continue
  if (!isProtectedRoute(req)) {
    return NextResponse.next();
  }

  // For protected routes, check auth
  const { userId } = auth();

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
  matcher: [
    "/((?!_next|.*\\..*).*)",
    "/(api|trpc)(.*)",
  ],
};

