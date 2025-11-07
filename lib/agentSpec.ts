/**
 * AgentSpec - Canonical type definition
 * This matches the structure stored in agent_specs.spec JSON column
 */

export type AgentCategory =
  | "tax"
  | "fitness"
  | "coaching"
  | "business"
  | "real_estate"
  | "other";

export type ModelProvider = "openai"; // v0: single provider

export type BaseTone = "direct" | "friendly" | "formal";

export type CategoryPolicy = "default" | "sensitive";

export type AgentSpec = {
  profile: {
    name: string;
    description: string;
    category: AgentCategory;
    avatarUrl?: string;
  };
  model: {
    provider: ModelProvider;
    modelId: string; // e.g. "gpt-4.1-mini" (enforced via UI)
    temperature: number; // 0.0–1.0
    maxTokens: number;
  };
  knowledge: {
    enabled: boolean;
    fileIds: string[]; // agent_knowledge_files IDs
    topK: number; // number of chunks to retrieve
  };
  behavior: {
    baseTone: BaseTone;
    additionalInstructions?: string;
  };
  guardrails: {
    showDisclosure: boolean;
    disallowedTopics: string[];
    categoryPolicy: CategoryPolicy;
  };
  pricing: {
    planType: "subscription";
    monthlyPriceUsd: number;
    trialMessages: number;
  };
  limits: {
    maxMessagesPerDay: number;
  };
};

/**
 * Validate AgentSpec structure
 */
export function validateAgentSpec(spec: unknown): spec is AgentSpec {
  if (typeof spec !== "object" || spec === null) {
    return false;
  }
  const s = spec as any;

  // Allowed enums
  const allowedCategories = [
    "tax",
    "fitness",
    "coaching",
    "business",
    "real_estate",
    "other",
  ];
  const allowedProviders = ["openai"];
  const allowedBaseTones = ["direct", "friendly", "formal"];
  const allowedCategoryPolicies = ["default", "sensitive"];

  // profile
  if (
    !s.profile ||
    typeof s.profile.name !== "string" ||
    typeof s.profile.description !== "string" ||
    !allowedCategories.includes(s.profile.category)
  ) {
    return false;
  }

  // model
  if (
    !s.model ||
    s.model.provider !== "openai" ||
    typeof s.model.modelId !== "string" ||
    typeof s.model.temperature !== "number" ||
    typeof s.model.maxTokens !== "number"
  ) {
    return false;
  }

  // knowledge
  if (
    !s.knowledge ||
    typeof s.knowledge.enabled !== "boolean" ||
    !Array.isArray(s.knowledge.fileIds) ||
    typeof s.knowledge.topK !== "number"
  ) {
    return false;
  }

  // behavior
  if (
    !s.behavior ||
    !allowedBaseTones.includes(s.behavior.baseTone)
  ) {
    return false;
  }
  if (
    s.behavior.additionalInstructions !== undefined &&
    typeof s.behavior.additionalInstructions !== "string"
  ) {
    return false;
  }

  // guardrails
  if (
    !s.guardrails ||
    typeof s.guardrails.showDisclosure !== "boolean" ||
    !Array.isArray(s.guardrails.disallowedTopics) ||
    !allowedCategoryPolicies.includes(s.guardrails.categoryPolicy)
  ) {
    return false;
  }

  // pricing
  if (
    !s.pricing ||
    s.pricing.planType !== "subscription" ||
    typeof s.pricing.monthlyPriceUsd !== "number" ||
    typeof s.pricing.trialMessages !== "number"
  ) {
    return false;
  }

  // limits
  if (
    !s.limits ||
    typeof s.limits.maxMessagesPerDay !== "number"
  ) {
    return false;
  }

  return true;
}

/**
 * Create a default AgentSpec template
 */
export function createDefaultAgentSpec(): AgentSpec {
  return {
    profile: {
      name: "",
      description: "",
      category: "other",
      avatarUrl: undefined,
    },
    model: {
      provider: "openai",
      modelId: "gpt-4.1-mini",
      temperature: 0.7,
      maxTokens: 2000,
    },
    knowledge: {
      enabled: false,
      fileIds: [],
      topK: 5,
    },
    behavior: {
      baseTone: "direct",
      additionalInstructions: undefined,
    },
    guardrails: {
      showDisclosure: true,
      disallowedTopics: [],
      categoryPolicy: "default",
    },
    pricing: {
      planType: "subscription",
      monthlyPriceUsd: 0,
      trialMessages: 5,
    },
    limits: {
      maxMessagesPerDay: 50,
    },
  };
}

