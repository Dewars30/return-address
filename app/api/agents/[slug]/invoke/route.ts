import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { callLLM, type LLMMessage } from "@/lib/llmClient";
import { getRelevantChunks } from "@/lib/rag";
import { type AgentSpec } from "@/lib/agentSpec";

const ANON_COOKIE_NAME = "return_address_anon_id";
const ANON_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

/**
 * Get or create anonymous user ID from cookie
 */
async function getOrCreateAnonId(): Promise<string> {
  const cookieStore = await cookies();
  let anonId = cookieStore.get(ANON_COOKIE_NAME)?.value;

  if (!anonId) {
    // Generate a new anonymous ID
    anonId = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    cookieStore.set(ANON_COOKIE_NAME, anonId, {
      maxAge: ANON_COOKIE_MAX_AGE,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  }

  // Ensure anonymous user exists in database
  const anonEmail = `${anonId}@anon.returnaddress.local`;
  const user = await db.user.upsert({
    where: { email: anonEmail },
    update: {},
    create: {
      email: anonEmail,
      name: "Anonymous",
      authProvider: "anonymous",
      authId: anonId,
      isCreator: false,
    },
  });

  return user.id;
}

/**
 * Get caller ID (authenticated user or anonymous)
 */
async function getCallerId(): Promise<string> {
  const user = await getCurrentUser();
  if (user) {
    return user.id;
  }
  return await getOrCreateAnonId();
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    const body = await request.json();
    const userMessage = body.message;

    if (!userMessage || typeof userMessage !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // a. Load agent (exclude suspended)
    const agent = await db.agent.findFirst({
      where: {
        slug,
        status: "published", // Only published agents, not suspended
      },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // b. Identify caller
    const callerId = await getCallerId();

    // c. Load active AgentSpec
    const agentSpec = await db.agentSpec.findFirst({
      where: {
        agentId: agent.id,
        isActive: true,
      },
      orderBy: {
        version: "desc",
      },
    });

    if (!agentSpec) {
      return NextResponse.json(
        { error: "Agent configuration error" },
        { status: 500 }
      );
    }

    const spec = agentSpec.spec as AgentSpec;

    // d. Access control
    const authenticatedUser = await getCurrentUser();
    let hasActiveSubscription = false;
    let isTrial = false;

    if (authenticatedUser) {
      // Check for active subscription
      const subscription = await db.subscription.findFirst({
        where: {
          userId: authenticatedUser.id,
          agentId: agent.id,
          status: {
            in: ["active", "trialing"],
          },
        },
      });

      hasActiveSubscription = !!subscription;
    }

    if (!hasActiveSubscription) {
      // Count prior user messages for trial check (only user messages count)
      const messageCount = await db.message.count({
        where: {
          agentId: agent.id,
          callerId: callerId,
          role: "user",
        },
      });

      if (messageCount >= spec.pricing.trialMessages) {
        return NextResponse.json(
          { error: "subscription_required" },
          { status: 402 }
        );
      }

      isTrial = true;
    }

    // e. Daily limit check (count user messages in last 24h)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const dailyMessageCount = await db.message.count({
      where: {
        agentId: agent.id,
        callerId: callerId,
        role: "user",
        createdAt: {
          gte: twentyFourHoursAgo,
        },
      },
    });

    if (dailyMessageCount >= spec.limits.maxMessagesPerDay) {
      return NextResponse.json({ error: "limit_reached" }, { status: 429 });
    }

    // f. RAG (optional)
    let context = "";
    if (spec.knowledge.enabled) {
      const chunks = await getRelevantChunks(
        agent.id,
        userMessage,
        spec.knowledge.topK
      );
      if (chunks.length > 0) {
        context = chunks.map((chunk, i) => `- ${chunk}`).join("\n");
      }
    }

    // g. Prompt construction (deterministic scaffold)
    const systemParts: string[] = [];

    // Load creator info for disclosure
    const agentWithOwner = await db.agent.findUnique({
      where: { id: agent.id },
      include: { owner: { select: { handle: true, name: true } } },
    });
    const creatorName = agentWithOwner?.owner.handle || agentWithOwner?.owner.name || "the creator";

    // Category-specific sensitive disclaimer (prepended if categoryPolicy is "sensitive")
    if (spec.guardrails.categoryPolicy === "sensitive") {
      const sensitiveCategories = ["tax", "legal", "health"];
      if (sensitiveCategories.includes(spec.profile.category)) {
        systemParts.push(
          "IMPORTANT: This agent provides information in a sensitive domain. " +
          "You are an AI assistant, not a licensed professional. " +
          "Always advise users to consult with qualified professionals for official advice, " +
          "legal matters, tax preparation, medical diagnoses, or financial decisions. " +
          "Your responses are informational only and do not constitute professional advice."
        );
      } else {
        systemParts.push(
          "This agent handles sensitive information. Be extra cautious and respectful. " +
          "Always remind users that you are an AI assistant and not a licensed professional."
        );
      }
    }

    // Agent identity (deterministic)
    systemParts.push(
      `You are ${spec.profile.name}. ${spec.profile.description}.`
    );

    // Base tone (deterministic)
    const toneInstructions: Record<string, string> = {
      direct: "Follow this style: Be direct and concise in your responses.",
      friendly: "Follow this style: Be warm, friendly, and conversational.",
      formal: "Follow this style: Be professional and formal in your communication style.",
    };
    systemParts.push(toneInstructions[spec.behavior.baseTone] || "");

    // Additional instructions
    if (spec.behavior.additionalInstructions) {
      systemParts.push(
        `Follow these constraints: ${spec.behavior.additionalInstructions}`
      );
    }

    // Guardrails (deterministic)
    if (spec.guardrails.disallowedTopics.length > 0) {
      systemParts.push(
        `Obey these rules:\n- Do not violate: ${spec.guardrails.disallowedTopics.join(", ")}`
      );
    }

    // Category policy explanation
    if (spec.guardrails.categoryPolicy === "sensitive") {
      systemParts.push(
        "- Category policy: sensitive (This means you must be extra cautious, " +
        "always recommend consulting professionals, and never provide definitive legal, " +
        "medical, or financial advice without disclaimers.)"
      );
    } else {
      systemParts.push(
        "- Category policy: default (Standard AI assistant guidelines apply.)"
      );
    }

    // Disclosure (if enabled)
    if (spec.guardrails.showDisclosure) {
      systemParts.push(
        `Always remind the user you are an AI assistant built from ${creatorName}'s materials, ` +
        "not a licensed professional unless explicitly stated. " +
        "Responses are generated and should be verified for accuracy."
      );
    }

    const systemMessage = systemParts.filter(Boolean).join("\n\n");

    // User message with context
    let userMessageWithContext = userMessage;
    if (context) {
      userMessageWithContext = `Context:\n${context}\n\nUser: ${userMessage}`;
    }

    const messages: LLMMessage[] = [
      { role: "system", content: systemMessage },
      { role: "user", content: userMessageWithContext },
    ];

    // h. Call LLM
    const startTime = Date.now();
    const llmResponse = await callLLM(messages, {
      provider: spec.model.provider,
      modelId: spec.model.modelId,
      temperature: spec.model.temperature,
      maxTokens: spec.model.maxTokens,
    });
    const latency = Date.now() - startTime;

    const assistantMessage = llmResponse.content;

    // i. Logging
    // Insert user message
    await db.message.create({
      data: {
        userId: authenticatedUser?.id || null,
        callerId: callerId,
        agentId: agent.id,
        role: "user",
        content: userMessage,
      },
    });

    // Insert assistant message
    await db.message.create({
      data: {
        userId: authenticatedUser?.id || null,
        callerId: callerId,
        agentId: agent.id,
        role: "assistant",
        content: assistantMessage,
      },
    });

    // Insert usage log
    await db.usageLog.create({
      data: {
        userId: authenticatedUser?.id || null,
        callerId: callerId,
        agentId: agent.id,
        tokensUsed: llmResponse.tokensUsed || null,
        isTrial,
      },
    });

    // j. Respond
    return NextResponse.json({ message: assistantMessage });
  } catch (error) {
    console.error("Invoke agent error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

