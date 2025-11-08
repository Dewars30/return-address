import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/marketplace(.*)",
  "/agents/(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/agents/(.*)/invoke",
]);

export default clerkMiddleware(async (auth, request: NextRequest) => {
  if (!isPublicRoute(request)) {
    const { userId } = await auth();
    if (!userId) {
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("redirect_url", request.url);
      return NextResponse.redirect(signInUrl);
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

