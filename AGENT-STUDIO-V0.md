Good, this is where Cursor + Composer 1 actually earn their keep instead of becoming more noise.

Below is exactly what you asked for:
	1.	A single internal PRD/spec you can drop into your repo / Cursor Rules.
	2.	A curated MCP stack tuned for building Agent Studio v0 with high output quality, minimal attack surface, no cosplay.

I’ll keep it tight but precise.

⸻

AGENT STUDIO – V0 CURSOR IMPLEMENTATION SPEC

Doc Type: Internal build spec
Audience: You + Cursor Agent (Composer 1)
Goal: Use Cursor (Agent Mode + Composer 1 + MCP) to implement Agent Studio v0 exactly as defined — fast, stable, no scope creep.

⸻

1. Purpose

We are building:

A monolithic web app that lets vetted creators create, host, and monetize AI agents via a simple form-driven builder, with Stripe subscriptions and a lightweight marketplace.

This spec tells Cursor’s Agent how to implement it:
	•	what stack,
	•	what structure,
	•	what’s in scope,
	•	what is explicitly out of scope.

This should live in the repo root as AGENT-STUDIO-V0.md and be mirrored in .cursor/rules so Composer/Agent Mode stays on-rails. Cursor supports Rules for persistent constraints and behavior.  ￼

⸻

2. Tech Stack (Authoritative)

Frontend + Backend
	•	Next.js (App Router) + TypeScript
	•	React + Tailwind CSS
	•	Next Route Handlers for API (/app/api/...)

Data
	•	Postgres (Supabase, Neon, or RDS)
	•	Prisma ORM
	•	pgvector extension for embeddings (RAG for agent knowledge)

Auth
	•	Clerk or Supabase Auth (pick one and lock it)

Payments
	•	Stripe + Stripe Connect (Express accounts)
	•	Webhooks handled via Next.js API routes

File & Embeddings
	•	S3-compatible storage (Supabase Storage or AWS S3)
	•	Embeddings via primary LLM provider or a cheap dedicated embedding model

LLM Runtime
	•	Start with one primary provider behind a tiny wrapper:
	•	Can be OpenAI / Anthropic / etc, but do not over-fit to Cursor’s internal model.
	•	All agent invocations go through a single internal llmClient abstraction.

Hosting
	•	Vercel for app + API
	•	Managed Postgres + storage

No Kubernetes. No microservices. No separate “orchestration service.” No LangGraph circus in V0.

⸻

3. Functional Scope (For Cursor Agent)

These are the only features Cursor should scaffold and iterate on.

3.1 Entities
Implement as per previous spec (no extras):
	•	users
	•	agents
	•	agent_specs
	•	subscriptions
	•	messages
	•	usage_logs
	•	agent_knowledge_files
	•	agent_knowledge_chunks

Use the schema from the last spec as source of truth.

3.2 AgentSpec (Canonical)
Single TS type, stored in agent_specs.spec JSON. Cursor should reference this when generating code.

Key fields (no additions):
	•	profile (name, description, category, avatarUrl?)
	•	model (provider, modelId, temperature, maxTokens)
	•	knowledge (enabled, fileIds, topK)
	•	behavior (tone + optional instructions)
	•	guardrails (disclosures, disallowedTopics, categoryPolicy)
	•	pricing (monthlyPriceUsd, trialMessages)
	•	limits (maxMessagesPerDay)

No multi-agent, no custom tool graphs, no dynamic code-execution tools in V0.

3.3 Core Flows to Implement
Cursor Agent should focus on:
	1.	Creator onboarding
	•	Auth
	•	“Become a creator”
	•	Connect Stripe account
	2.	Agent creation wizard
	•	Form that writes AgentSpec
	•	Save as draft / publish
	3.	Hosted chat runtime
	•	/api/agents/[slug]/invoke:
	•	checks subscription/trial
	•	retrieves spec
	•	optional RAG
	•	calls llmClient
	•	logs usage + messages
	4.	Marketplace
	•	List agents, filter by category
	•	Agent detail page
	•	Subscribe via Stripe Checkout
	5.	Basic Analytics
	•	Per-agent:
	•	subs count
	•	message count
	•	simple chart or stats
	6.	Admin toggles
	•	Approve/suspend agents

Anything else = out of scope.

⸻

4. Explicit Non-Scope (Enforce in Cursor Rules)

Cursor Agent must not introduce:
	•	Visual node/graph editor
	•	Multi-agent routing
	•	Complex tool integration beyond what’s defined here
	•	BYO-LMM keys for creators
	•	White labeling or org-level RBAC
	•	Fine-tuning pipelines
	•	Voice, streaming UX beyond standard text
	•	Native apps

Add this verbatim into .cursor/rules so Composer 1 stops “helpfully” over-building.  ￼

⸻

5. Repo & File Layout (What Cursor Should Generate)

Minimal, opinionated:

/apps
  /web
    /app
      /page.tsx
      /agents/[slug]/page.tsx
      /creator/agents/page.tsx
      /api/agents/[slug]/invoke/route.ts
      /api/stripe/webhook/route.ts
      /api/agents/create/route.ts
      /api/agents/update/route.ts
    /components
    /lib
      /auth.ts
      /db.ts
      /llmClient.ts
      /stripe.ts
      /agentSpec.ts
      /rag.ts
/prisma
  schema.prisma
.env.example
AGENT-STUDIO-V0.md
.cursor/
  rules
  mcp.json

Cursor Agent tasks:
	•	Generate Prisma models per spec.
	•	Generate migrations.
	•	Implement typed AgentSpec + validator.
	•	Implement invoke route + RAG.
	•	Implement Stripe webhooks & subscription checks.
	•	Implement minimal UI pages.

⸻

6. Cursor Configuration

6.1 Model Choice
Use Composer 1 for:
	•	File scaffolding
	•	Refactors
	•	Repetitive boilerplate

Reason: it’s optimized for “agentic coding” and multi-step edits inside Cursor, with low latency.  ￼

For high-stakes logic (payments, auth, security-sensitive code), you can:
	•	cross-check with another model integrated in Cursor, or
	•	manually review — but don’t maintain separate infra logic.

6.2 Agent Mode Usage
Agent Mode in Cursor can:
	•	read/write multiple files,
	•	run commands,
	•	refactor across repo.  ￼

Use it for:
	1.	Initial project bootstrap:
	•	“Create Next.js + Prisma + Stripe + Clerk scaffold as per AGENT-STUDIO-V0.md.”
	2.	Schema & migration generation.
	3.	Implementing invoke route + marketplace pages.
	4.	Wiring MCP tools (below) when needed.

Pin AGENT-STUDIO-V0.md + key Rules so Agent Mode always sees constraints.

6.3 .cursor/rules (Core Content)
Seed it with:
	•	Summary of product scope.
	•	Tech stack contract.
	•	Non-goals (the list above).
	•	Style guardrails: small, composable modules; favor readability; log clearly.

Cursor’s Rules system will treat this as persistent context when Composer/Agent is active.  ￼

⸻
