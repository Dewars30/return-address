import { NextResponse } from "next/server";
import { requireCreatorApi, requireAuthApi } from "./auth";

/**
 * Helper function to handle auth errors in API routes
 * Returns the user if auth succeeds, or a NextResponse error if auth fails
 */
export async function handleAuthApi(
  authFn: () => Promise<Awaited<ReturnType<typeof requireAuthApi>>>
): Promise<{ user: Awaited<ReturnType<typeof requireAuthApi>>; error?: never } | { user?: never; error: NextResponse }> {
  try {
    const user = await authFn();
    return { user };
  } catch (authError) {
    if (authError instanceof Error) {
      if (authError.message === "UNAUTHORIZED" || authError.message === "AUTH_FAILED") {
        return {
          error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
        };
      }
      if (authError.message === "CREATOR_REQUIRED") {
        return {
          error: NextResponse.json(
            { error: "Creator access required. Please complete onboarding." },
            { status: 403 }
          ),
        };
      }
    }
    // Re-throw unexpected errors
    throw authError;
  }
}

/**
 * Helper to require creator in API routes with proper error handling
 */
export async function handleCreatorApi() {
  return handleAuthApi(requireCreatorApi);
}

/**
 * Helper to require auth in API routes with proper error handling
 */
export async function handleAuthApiHelper() {
  return handleAuthApi(requireAuthApi);
}

