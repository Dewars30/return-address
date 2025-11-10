import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createCheckoutSession } from "@/lib/stripe";
import { type AgentSpec } from "@/lib/agentSpec";

// This route uses requireAuth() which uses auth, so it must be dynamic
export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const user = await requireAuth();
    const slug = params.slug;

    // Load agent with active spec and creator (exclude suspended)
    const agent = await prisma.agent.findFirst({
      where: {
        slug,
        status: "published", // Only published agents, exclude suspended
      },
      include: {
        owner: {
          select: {
            stripeAccountId: true,
          },
        },
        specs: {
          where: {
            isActive: true,
          },
          take: 1,
          orderBy: {
            version: "desc",
          },
        },
      },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const spec = agent.specs[0]?.spec as AgentSpec | undefined;
    if (!spec) {
      return NextResponse.json(
        { error: "Agent configuration error" },
        { status: 500 }
      );
    }

    // Check if creator has Stripe account
    if (!agent.owner.stripeAccountId) {
      return NextResponse.json(
        { error: "Creator has not set up payments" },
        { status: 400 }
      );
    }

    // Check for existing subscription
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        agentId: agent.id,
        status: {
          in: ["active", "trialing"],
        },
      },
    });

    if (existingSubscription) {
      return NextResponse.json(
        { error: "You already have an active subscription" },
        { status: 400 }
      );
    }

    // Create checkout session
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const checkoutUrl = await createCheckoutSession({
      agentId: agent.id,
      userId: user.id,
      monthlyPriceUsd: spec.pricing.monthlyPriceUsd,
      creatorStripeAccountId: agent.owner.stripeAccountId,
      successUrl: `${appUrl}/agents/${slug}?sub=success`,
      cancelUrl: `${appUrl}/agents/${slug}?sub=cancel`,
    });

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    console.error("Subscribe error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

