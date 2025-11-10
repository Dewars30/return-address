import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

// This route uses requireAdmin() which uses auth, so it must be dynamic
export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const agentId = params.id;

    // Update agent status to suspended
    await prisma.agent.update({
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

