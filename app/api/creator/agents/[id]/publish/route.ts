import { NextRequest, NextResponse } from "next/server";
import { requireCreator } from "@/lib/auth";
import { prisma } from "@/lib/db";

// This route uses requireCreator() which uses auth, so it must be dynamic
export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireCreator();
    const agentId = params.id;

    // Verify user has Stripe account
    const userWithStripe = await prisma.user.findUnique({
      where: { id: user.id },
      select: { stripeAccountId: true },
    });

    if (!userWithStripe?.stripeAccountId) {
      return NextResponse.json(
        { error: "Stripe account must be connected before publishing" },
        { status: 400 }
      );
    }

    // Verify agent exists and user owns it
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    if (agent.ownerId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Update agent status to published
    await prisma.agent.update({
      where: { id: agentId },
      data: { status: "published" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Publish agent error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

