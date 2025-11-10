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

    // Update agent status to draft
    await prisma.agent.update({
      where: { id: agentId },
      data: { status: "draft" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unpublish agent error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

