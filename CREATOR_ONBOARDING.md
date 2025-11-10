# Build Your First Agent on Return Address

Return Address is a platform for expert-owned, vertical AI agents with clear provenance, enforced guardrails, and direct revenue for their creators.

## What Return Address Is

Return Address hosts AI agents built by domain experts—lawyers, analysts, consultants, operators, and other specialists. Each agent:

- **Has a visible creator**: You see who built it and their credentials
- **Has defined constraints**: Guardrails prevent misuse and ensure accuracy
- **Has isolated knowledge**: Each agent's data is scoped and private
- **Generates revenue**: Creators earn directly from subscriptions

## Who It's For

Return Address is designed for:

- **Domain experts** who want to monetize their knowledge through AI
- **Professionals** in fields like law, tax, health, finance, consulting
- **Operators** with deep vertical expertise who want to scale their advice
- **Analysts** who want to create high-signal AI assistants

If you have specialized knowledge and want to build an AI agent that reflects your expertise, Return Address is for you.

## Getting Started

### Step 1: Sign In

1. Go to [returnaddress.io](https://returnaddress.io)
2. Click **"Sign in"** in the top right
3. Sign in with GitHub (or your preferred OAuth provider)
4. You'll be redirected back to the homepage

### Step 2: Become a Creator

1. Click **"Become a creator"** (or go to `/creator/onboarding`)
2. Fill out the creator profile form:
   - **Display Name**: Your public name (e.g., "Sarah Chen, Esq.")
   - **Handle**: Your unique handle (e.g., `sarah-chen-law`) — lowercase letters, numbers, and hyphens only
   - **Short Bio** (optional): Brief description of your expertise
3. Click **"Complete Onboarding"**
4. You'll be redirected to your creator dashboard

### Step 3: Connect Stripe (Required for Monetization)

To accept payments for your agent subscriptions, you need to connect a Stripe account:

1. In your creator dashboard (`/creator/agents`), click **"Connect Stripe"**
2. You'll be redirected to Stripe's onboarding flow
3. Complete Stripe Express account setup:
   - Provide business information
   - Verify your identity
   - Set up bank account for payouts
4. Once connected, you'll be redirected back to your dashboard
5. Your Stripe account ID will be saved automatically

**Note**: You can create agents without Stripe, but you won't be able to publish them until Stripe is connected.

### Step 4: Create an Agent

1. Click **"Create Agent"** (or go to `/creator/agents/new`)
2. Fill out the agent specification form:

#### Profile
- **Name**: Public name of your agent (e.g., "Tax Advisor Pro")
- **Category**: Choose from available categories (e.g., "tax", "legal", "health", "finance")
- **Description**: Clear description of what your agent does

#### Pricing
- **Monthly Price (USD)**: Subscription price per month (e.g., `29.99`)
- **Trial Messages**: Number of free messages users get before subscribing (e.g., `10`)

#### Behavior
- **Base Tone**: Choose `direct`, `friendly`, or `formal`
- **Additional Instructions**: Any specific behavioral constraints or guidelines

#### Model
- **Provider**: Currently `openai` (more providers coming)
- **Model ID**: OpenAI model (e.g., `gpt-4`, `gpt-3.5-turbo`)
- **Temperature**: 0.0-1.0 (lower = more deterministic)
- **Max Tokens**: Maximum response length

#### Guardrails
- **Disallowed Topics**: List of topics the agent should refuse to discuss
- **Category Policy**: `default` or `sensitive` (for legal/medical/financial agents)
- **Show Disclosure**: Whether to show AI disclaimer to users

#### Knowledge (Optional)
- **Enabled**: Toggle RAG (Retrieval Augmented Generation)
- **Top K**: Number of knowledge chunks to retrieve per query

3. Click **"Create Agent"**
4. You'll be redirected to the agent editor page

### Step 5: Edit and Refine Your Agent

1. In the agent editor (`/creator/agents/[id]`), you can:
   - View your agent's current specification
   - Edit any field
   - See agent status (draft/published)
   - View analytics (after publishing)

2. Make changes and click **"Update Agent"** to save
3. Each update creates a new version (version history is preserved)

### Step 6: Publish Your Agent

1. In the agent editor, click **"Publish Agent"**
2. Your agent will be set to `published` status
3. It will appear in the marketplace (`/marketplace`) and be publicly accessible
4. Users can now subscribe and chat with your agent

**Note**: You can unpublish at any time by clicking **"Unpublish Agent"**.

### Step 7: Share Your Agent

Once published, your agent has a public URL:

```
https://returnaddress.io/agents/[your-agent-slug]
```

Share this link with users. They can:
- View your agent's profile and pricing
- Use free trial messages
- Subscribe to continue chatting

## Understanding Billing, Trials, and Limits

### Free Trial

- Every user gets a set number of free trial messages (defined in your agent's pricing)
- Trial messages are counted per user per agent
- Once trial is exhausted, users must subscribe to continue

### Subscriptions

- Users subscribe monthly via Stripe Checkout
- Revenue flows to your Stripe Connect account (minus platform fee)
- Platform fee is configurable (default: 5%)

### Daily Limits

- Each agent has a `maxMessagesPerDay` limit (defined in agent spec)
- This prevents abuse and manages costs
- Limits are enforced per caller (authenticated user or anonymous)

### Rate Limiting

- Additional rate limit: 60 requests per caller per agent per 10 minutes
- Prevents abuse and ensures fair usage
- Returns `429` status code when exceeded

## Agent Specification Reference

Your agent is defined by an `AgentSpec` JSON object with these fields:

```typescript
{
  profile: {
    name: string;
    category: string;
    description: string;
  };
  pricing: {
    monthlyPriceUsd: number;
    trialMessages: number;
  };
  behavior: {
    baseTone: "direct" | "friendly" | "formal";
    additionalInstructions?: string;
  };
  model: {
    provider: "openai";
    modelId: string;
    temperature: number;
    maxTokens: number;
  };
  guardrails: {
    disallowedTopics: string[];
    categoryPolicy: "default" | "sensitive";
    showDisclosure: boolean;
  };
  knowledge: {
    enabled: boolean;
    topK: number;
  };
  limits: {
    maxMessagesPerDay: number;
  };
}
```

## Best Practices

1. **Be specific**: Define clear guardrails and disallowed topics
2. **Set appropriate pricing**: Consider your expertise level and market
3. **Use sensitive category policy**: For legal/medical/financial agents
4. **Enable disclosure**: Always show AI disclaimer for sensitive domains
5. **Test thoroughly**: Use trial messages to test your agent before sharing
6. **Monitor analytics**: Check usage and subscription metrics regularly

## Support

If you encounter issues:

1. Check the [Return Address documentation](https://returnaddress.io)
2. Review your agent specification for validation errors
3. Ensure Stripe is connected before publishing
4. Verify your agent is in `published` status

## What's Next

- **Upload knowledge files**: Add documents for RAG (coming soon)
- **View analytics**: Track usage, subscriptions, and revenue
- **Iterate**: Update your agent based on user feedback
- **Scale**: Create multiple agents for different verticals

---

**Return Address** — Agents with a return address.

