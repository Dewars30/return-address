import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const agentId = params.id;

    // Update agent status to suspended
    await db.agent.update({
      where: { id: agentId },
      data: { status: "suspended" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error suspending agent:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to suspend agent" },
      { status: 500 }
    );
  }
}

