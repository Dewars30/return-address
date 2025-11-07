import { NextRequest, NextResponse } from "next/server";
import { requireCreator } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireCreator();
    const agentId = params.id;

    // Verify ownership
    const agent = await db.agent.findUnique({
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
    const activeSubscribers = await db.subscription.count({
      where: {
        agentId,
        status: {
          in: ["active", "trialing"],
        },
      },
    });

    // Messages in last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const messagesLast30Days = await db.message.count({
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

