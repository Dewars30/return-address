import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "./db";

/**
 * Get the current authenticated user from Clerk
 * Returns null if not authenticated
 * Gracefully handles cases where Clerk middleware hasn't run (e.g., static files, 404s)
 */
export async function getCurrentUser() {
  try {
    const { userId } = await auth();
    console.log("[GET_USER] Step 1 - Clerk auth():", { userId: userId ? "present" : "null" });
    if (!userId) return null;

    const clerkUser = await currentUser();
    console.log("[GET_USER] Step 2 - Clerk currentUser():", {
      email: clerkUser?.emailAddresses[0]?.emailAddress,
      hasUser: !!clerkUser
    });
    if (!clerkUser) return null;

    // Sync user to database (preserve existing fields like stripeCustomerId)
    console.log("[GET_USER] Step 3 - Finding existing user in DB");
    const existingUser = await prisma.user.findUnique({
      where: { authId: userId },
      select: { stripeCustomerId: true, isCreator: true, stripeAccountId: true },
    });
    console.log("[GET_USER] Step 3 result:", { found: !!existingUser });

    console.log("[GET_USER] Step 4 - Upserting user to DB");
    const user = await prisma.user.upsert({
      where: { authId: userId },
      update: {
        email: clerkUser.emailAddresses[0]?.emailAddress || "",
        name: clerkUser.firstName && clerkUser.lastName
          ? `${clerkUser.firstName} ${clerkUser.lastName}`
          : clerkUser.firstName || clerkUser.username || null,
        // Preserve existing fields
        stripeCustomerId: existingUser?.stripeCustomerId,
        isCreator: existingUser?.isCreator ?? false,
        stripeAccountId: existingUser?.stripeAccountId,
      },
      create: {
        email: clerkUser.emailAddresses[0]?.emailAddress || "",
        name: clerkUser.firstName && clerkUser.lastName
          ? `${clerkUser.firstName} ${clerkUser.lastName}`
          : clerkUser.firstName || clerkUser.username || null,
        authProvider: "clerk",
        authId: userId,
        isCreator: false,
      },
    });
    console.log("[GET_USER] Step 4 result - User upserted successfully:", { userId: user.id });

    return user;
  } catch (error) {
    // DIAGNOSTIC: Log the actual error being caught
    console.error("[GET_USER] ERROR CAUGHT:", {
      error: error instanceof Error ? error.message : String(error),
      name: error instanceof Error ? error.name : "unknown",
      code: (error as any)?.code,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    // Clerk middleware not initialized (e.g., static files, 404s, or middleware matcher excludes route)
    // Return null to gracefully handle unauthenticated state
    return null;
  }
}

/**
 * Require authentication - redirects to /sign-in if not authenticated
 * Gracefully handles cases where Clerk middleware hasn't run
 * Note: Middleware protects routes and redirects to /sign-in, but this is a fallback
 */
export async function requireAuth() {
  try {
    const { userId } = await auth();
    if (!userId) {
      // We don't have a /sign-in route; we use Clerk modal.
      // Redirect to home and let Clerk handle sign-in.
      redirect("/");
    }

    const user = await getCurrentUser();
    if (!user) {
      // If userId exists but getCurrentUser() fails, it's likely a database error
      // Log it and redirect to home
      console.error("getCurrentUser() returned null despite userId existing");
      redirect("/");
    }
    return user;
  } catch (error) {
    // Log the error and redirect to home
    console.error("requireAuth() error:", error);
    // Redirect to home - middleware should have handled auth, but if we get here, send them home
    redirect("/");
  }
}

/**
 * Check if user is a creator - redirects if not a creator
 */
export async function requireCreator() {
  const user = await requireAuth();
  if (!user.isCreator) {
    redirect("/creator/onboarding");
  }
  return user;
}

/**
 * Check if user is an admin (based on ADMIN_EMAILS env var)
 */
export async function requireAdmin() {
  const user = await requireAuth();
  const adminEmails = process.env.ADMIN_EMAILS?.split(",").map((e) => e.trim()) || [];

  if (!adminEmails.includes(user.email)) {
    redirect("/");
  }
  return user;
}

/**
 * Require authentication for API routes - throws error instead of redirecting
 * Use this in API routes instead of requireAuth()
 * Throws errors that can be caught and converted to JSON responses
 */
export async function requireAuthApi() {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("UNAUTHORIZED");
    }

    const user = await getCurrentUser();
    if (!user) {
      console.error("getCurrentUser() returned null despite userId existing");
      throw new Error("AUTH_FAILED");
    }
    return user;
  } catch (error) {
    // Re-throw our custom errors
    if (error instanceof Error && (error.message === "UNAUTHORIZED" || error.message === "AUTH_FAILED")) {
      throw error;
    }
    // Log unexpected errors and throw generic error
    console.error("requireAuthApi() error:", error);
    throw new Error("AUTH_FAILED");
  }
}

/**
 * Require creator status for API routes - throws error instead of redirecting
 * Use this in API routes instead of requireCreator()
 * Throws errors that can be caught and converted to JSON responses
 */
export async function requireCreatorApi() {
  const user = await requireAuthApi();
  if (!user.isCreator) {
    throw new Error("CREATOR_REQUIRED");
  }
  return user;
}
