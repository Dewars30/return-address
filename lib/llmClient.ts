/**
 * LLM Client abstraction
 * All agent invocations go through this single interface
 */

export type LLMProvider = "openai" | "anthropic";

export type LLMMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type LLMConfig = {
  provider: LLMProvider;
  modelId: string;
  temperature: number;
  maxTokens: number;
};

export type LLMResponse = {
  content: string;
  tokensUsed?: number;
};

/**
 * Call LLM with messages and config
 */
export async function callLLM(
  messages: LLMMessage[],
  config: LLMConfig
): Promise<LLMResponse> {
  if (config.provider === "openai") {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: config.modelId,
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        temperature: config.temperature,
        max_tokens: config.maxTokens,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || "";
    const tokensUsed = data.usage?.total_tokens;

    return {
      content,
      tokensUsed,
    };
  }

  if (config.provider === "anthropic") {
    // TODO: Implement Anthropic SDK call
    throw new Error("Anthropic provider not yet implemented");
  }

  throw new Error(`Unsupported provider: ${config.provider}`);
}

