import { NextRequest, NextResponse } from "next/server";
import { requireCreatorApi } from "@/lib/auth";
import { prisma } from "@/lib/db";

// This route uses requireCreatorApi() which uses auth, so it must be dynamic
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const agentId = params.id;

    // Verify ownership
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      select: { ownerId: true },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    if (agent.ownerId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Active subscribers count
    const activeSubscribers = await prisma.subscription.count({
      where: {
        agentId,
        status: {
          in: ["active", "trialing"],
        },
      },
    });

    // Messages in last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const messagesLast30Days = await prisma.message.count({
      where: {
        agentId,
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    return NextResponse.json({
      activeSubscribers,
      messagesLast30Days,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}

