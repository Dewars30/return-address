import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "./db";

/**
 * Get the current authenticated user from Clerk
 * Returns null if not authenticated
 */
export async function getCurrentUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  // Sync user to database (preserve existing fields like stripeCustomerId)
  const existingUser = await db.user.findUnique({
    where: { authId: userId },
    select: { stripeCustomerId: true, isCreator: true, stripeAccountId: true },
  });

  const user = await db.user.upsert({
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

  return user;
}

/**
 * Require authentication - redirects to sign-in if not authenticated
 */
export async function requireAuth() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect("/sign-in");
  }
  return user;
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
