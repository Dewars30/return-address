import { NextRequest, NextResponse } from "next/server";
import { requireCreator } from "@/lib/auth";
import { createConnectOnboardingLink } from "@/lib/stripe";

// This route uses requireCreator() which uses auth, so it must be dynamic
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const user = await requireCreator();

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

