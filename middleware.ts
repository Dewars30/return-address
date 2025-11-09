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
    return auth().redirectToSignIn({
      returnBackUrl: req.url,
    });
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|.*\\..*).*)",
    "/(api|trpc)(.*)",
  ],
};
