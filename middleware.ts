import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/creator(.*)",
  "/admin(.*)",
  "/api/creator(.*)",
]);

export default clerkMiddleware((auth, req) => {
  if (!isProtectedRoute(req)) {
    return NextResponse.next();
  }

  const { userId } = auth();

  if (!userId) {
    // Redirect to /sign-in on primary domain (not accounts.returnaddress.io)
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|.*\\..*).*)",
    "/(api|trpc)(.*)",
  ],
};
