import { NextRequest, NextResponse } from "next/server";
import { requireCreatorApi } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { validateAgentSpec, type AgentSpec } from "@/lib/agentSpec";

// This route uses requireCreator() which uses auth, so it must be dynamic
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

    console.log("[GET_AGENT] Request:", {
      agentId,
      userId: user.id,
      isCreator: user.isCreator,
      timestamp: new Date().toISOString(),
    });

    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: {
        specs: {
          where: { isActive: true },
          take: 1,
          orderBy: { version: "desc" },
        },
      },
    });

    if (!agent) {
      console.warn("[GET_AGENT] Agent not found:", {
        agentId,
        userId: user.id,
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Ensure user owns this agent
    if (agent.ownerId !== user.id) {
      console.warn("[GET_AGENT] Unauthorized access attempt:", {
        agentId,
        agentOwnerId: agent.ownerId,
        userId: user.id,
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get user's Stripe account status
    const userWithStripe = await prisma.user.findUnique({
      where: { id: user.id },
      select: { stripeAccountId: true },
    });

    const spec = agent.specs[0]?.spec as AgentSpec | null;

    console.log("[GET_AGENT] Success:", {
      agentId,
      userId: user.id,
      hasSpec: !!spec,
      hasStripeAccount: !!userWithStripe?.stripeAccountId,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      agent,
      spec,
      hasStripeAccount: !!userWithStripe?.stripeAccountId,
    });
  } catch (error) {
    console.error("[GET_AGENT] Error:", {
      agentId: params.id,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const body = await request.json();
    const { spec } = body;

    if (!spec) {
      return NextResponse.json({ error: "Agent spec is required" }, { status: 400 });
    }

    // Validate AgentSpec
    if (!validateAgentSpec(spec)) {
      return NextResponse.json({ error: "Invalid agent specification" }, { status: 400 });
    }

    const agentSpec = spec as AgentSpec;

    // Verify agent exists and user owns it
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: {
        specs: {
          where: { isActive: true },
          take: 1,
          orderBy: { version: "desc" },
        },
      },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    if (agent.ownerId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get current version
    const currentSpec = agent.specs[0];
    const nextVersion = currentSpec ? currentSpec.version + 1 : 1;

    // Deactivate current spec
    if (currentSpec) {
      await prisma.agentSpec.update({
        where: { id: currentSpec.id },
        data: { isActive: false },
      });
    }

    // Create new version
    await prisma.agentSpec.create({
      data: {
        agentId,
        version: nextVersion,
        spec: agentSpec as any,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update agent error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

