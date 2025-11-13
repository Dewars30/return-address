import { NextRequest, NextResponse } from "next/server";
import { requireCreatorApi } from "@/lib/auth";
import { createConnectOnboardingLink } from "@/lib/stripe";

// This route uses requireCreatorApi() which uses auth, so it must be dynamic
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // Use API-safe version that throws errors instead of redirecting
    let user;
    try {
      user = await requireCreatorApi();
    } catch (authError) {
      if (authError instanceof Error) {
        if (authError.message === "UNAUTHORIZED" || authError.message === "AUTH_FAILED") {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        if (authError.message === "CREATOR_REQUIRED") {
          return NextResponse.json(
            { error: "Creator access required. Please complete onboarding." },
            { status: 403 }
          );
        }
      }
      throw authError;
    }

    const url = await createConnectOnboardingLink(user.id);

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Stripe Connect error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

