import { NextRequest, NextResponse } from "next/server";
import { requireCreator } from "@/lib/auth";
import { db } from "@/lib/db";
import { validateAgentSpec, type AgentSpec } from "@/lib/agentSpec";

/**
 * Generate a URL-friendly slug from agent name
 */
function generateSlug(name: string, userId: string): string {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  // Add user ID prefix to ensure uniqueness
  const userPrefix = userId.slice(0, 8);
  return `${userPrefix}-${baseSlug}`;
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireCreator();

    // Parse request body safely
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { spec } = body;

    if (!spec) {
      return NextResponse.json({ error: "Agent spec is required" }, { status: 400 });
    }

    // Validate AgentSpec
    if (!validateAgentSpec(spec)) {
      return NextResponse.json({ error: "Invalid agent specification" }, { status: 400 });
    }

    const agentSpec = spec as AgentSpec;

    // Generate unique slug
    const slug = generateSlug(agentSpec.profile.name, user.id);

    // Check if slug already exists
    const existingAgent = await db.agent.findUnique({
      where: { slug },
    });

    let finalSlug = slug;
    if (existingAgent) {
      // Append timestamp if slug exists
      finalSlug = `${slug}-${Date.now()}`;
    }

    // Create Agent
    const agent = await db.agent.create({
      data: {
        slug: finalSlug,
        ownerId: user.id,
        status: "draft",
        isApproved: false,
        specs: {
          create: {
            version: 1,
            spec: agentSpec as any,
            isActive: true,
          },
        },
      },
    });

    return NextResponse.json({ agentId: agent.id }, { status: 201 });
  } catch (error) {
    console.error("Create agent error:", error);

    // Handle Prisma errors (e.g., unique constraint violations)
    if (error && typeof error === "object" && "code" in error) {
      const prismaError = error as { code: string; message?: string };
      if (prismaError.code === "P2002") {
        return NextResponse.json(
          { error: "Agent with this slug already exists" },
          { status: 400 }
        );
      }
    }

    // Handle validation errors (should already be caught above, but just in case)
    if (error instanceof Error && error.message.includes("Invalid")) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // All other errors are internal server errors
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

