# Return Address — Comprehensive Project Documentation

**Last Updated:** 2025-01-XX
**Version:** 0.1.0
**Status:** Production
**Domain:** https://returnaddress.io

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Current State](#current-state)
4. [Tech Stack](#tech-stack)
5. [Database Schema](#database-schema)
6. [API Routes](#api-routes)
7. [Authentication & Authorization](#authentication--authorization)
8. [Key Features](#key-features)
9. [Environment Variables](#environment-variables)
10. [Development Workflow](#development-workflow)
11. [Deployment](#deployment)
12. [Project Structure](#project-structure)

---

## Project Overview

**Return Address** is a marketplace platform for expert-owned AI agents with clear provenance, enforced guardrails, and direct revenue for creators.

### Core Value Proposition

- **For Creators:** Create, host, and monetize AI agents via a simple form-driven builder
- **For Users:** Discover, trial, and subscribe to high-quality AI agents
- **For the Platform:** Enable a sustainable marketplace with Stripe Connect for creator payouts

### Key Differentiators

- **Provenance:** Clear attribution to creators
- **Guardrails:** Category-specific safety policies and disclosures
- **Monetization:** Direct revenue to creators via Stripe Connect
- **Simplicity:** Form-based agent creation (no code required)

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Next.js App Router                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Frontend   │  │   API Routes  │  │  Middleware   │     │
│  │   (React)    │  │  (Route.ts)   │  │  (Auth Guard) │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
         │                    │                    │
         │                    │                    │
    ┌────▼────┐         ┌─────▼─────┐       ┌─────▼─────┐
    │ Clerk   │         │  Prisma   │       │  Stripe   │
    │  Auth   │         │   ORM     │       │  Connect  │
    └─────────┘         └───────────┘       └───────────┘
                              │
                              │
                         ┌────▼─────┐
                         │ Postgres │
                         │(Supabase)│
                         └──────────┘
```

### Design Principles

1. **Monolithic Architecture:** Single Next.js application (no microservices)
2. **Server Components First:** Leverage Next.js App Router for optimal performance
3. **Type Safety:** Full TypeScript coverage with Prisma-generated types
4. **Security First:** Auth guards at middleware and route levels
5. **Idempotent Operations:** Webhooks and critical operations are idempotent

---

## Current State

### Build Status

- ✅ **Linting:** `npm run lint` passes with no errors
- ✅ **Build:** `npm run build` succeeds
- ✅ **TypeScript:** No type errors
- ✅ **Production:** Deployed on Vercel at https://returnaddress.io

### Feature Completeness

#### ✅ Completed Features

1. **Authentication & User Management**
   - Clerk v5 integration with modal-based sign-in
   - User sync to database on first auth
   - Creator onboarding flow (`/creator/onboarding`)
   - Creator status tracking (`isCreator` flag)
   - Admin email-based access control

2. **Creator Onboarding & Stripe Connect**
   - Creator profile setup (handle, displayName, shortBio)
   - Stripe Connect Express account creation
   - Stripe onboarding link generation
   - Payout account connection flow
   - Platform fee configuration (default 5%)

3. **Agent Creation & Management**
   - Agent creation wizard (`/creator/agents/new`)
   - AgentSpec form (all fields: profile, model, behavior, guardrails, pricing, limits)
   - AgentSpec validation
   - Draft/Publish/Unpublish workflow
   - Agent versioning (AgentSpec with version numbers)
   - Agent edit page with analytics
   - Creator dashboard (`/creator/agents`)

4. **Agent Runtime (`/api/agents/[slug]/invoke`)**
   - Published agent validation (excludes suspended)
   - Anonymous user tracking (cookie-based `callerId`)
   - Subscription checking (authenticated users)
   - Trial message limits (per caller, per agent)
   - Daily message limits (per caller, per agent)
   - RAG integration (optional knowledge retrieval with pgvector)
   - Deterministic prompt construction
   - Category-specific guardrails & disclaimers
   - LLM client abstraction (OpenAI)
   - Message logging
   - Usage logging

5. **Marketplace**
   - Homepage marketplace listing (`/`)
   - Published agents display (excludes suspended)
   - Agent detail page (`/agents/[slug]`)
   - Chat interface component
   - Creator attribution
   - Pricing display
   - Trial information

6. **Payments & Subscriptions**
   - Stripe Checkout Session creation
   - Stripe Connect integration (creator payouts)
   - Webhook handling (idempotent)
   - Subscription status tracking
   - Trial period support

7. **Admin Features**
   - Agent suspension (`/admin/agents`)
   - Admin-only routes protection

#### ⚠️ Known Limitations

- **Node Version:** Build fails locally with Node 22.x (non-blocking, Vercel uses Node 20.x)
- **RAG:** Requires pgvector extension (setup documented in `SUPABASE_STORAGE_SETUP.md`)
- **Stripe Connect:** Currently hardcoded to US accounts (TODO: make configurable)

---

## Tech Stack

### Core Framework

- **Next.js:** 14.2.5+ (App Router)
- **React:** 18.3.1+
- **TypeScript:** 5.9.3

### Backend & Database

- **Prisma:** 5.19.1 (ORM)
- **PostgreSQL:** Via Supabase (with pgvector extension for RAG)
- **Connection Pooling:** Uses `DATABASE_URL` (pooler) and `DIRECT_URL` (direct) for migrations

### Authentication

- **Clerk:** 5.0.0+ (v5 API)
- **Pattern:** Modal-based sign-in (no `/sign-in` route)
- **Middleware:** `clerkMiddleware` with route matchers

### Payments

- **Stripe:** 14.21.0+
- **Stripe Connect:** Express accounts for creator payouts
- **Platform Fee:** Configurable (default 5%)

### LLM & AI

- **OpenAI:** Via `lib/llmClient.ts` abstraction
- **RAG:** pgvector for embeddings (optional per agent)

### Storage

- **Supabase Storage:** S3-compatible for knowledge files
- **AWS SDK:** @aws-sdk/client-s3 3.927.0

### Styling

- **Tailwind CSS:** 3.4.7
- **Fonts:** Inter (Google Fonts)

### Hosting & Deployment

- **Vercel:** Production deployment
- **Node Version:** 22.x (specified in `package.json`)

---

## Database Schema

### Models

#### User
- `id` (String, cuid)
- `email` (String, unique)
- `name` (String?)
- `handle` (String?, unique) — Creator handle
- `shortBio` (String?)
- `authProvider` (String) — "clerk" or "supabase"
- `authId` (String, unique) — External auth provider ID
- `isCreator` (Boolean, default: false)
- `stripeAccountId` (String?) — Stripe Connect Express account ID
- `stripeCustomerId` (String?) — Stripe customer ID for subscriptions
- `createdAt`, `updatedAt`

**Relations:**
- `agents` → Agent[]
- `subscriptions` → Subscription[]
- `messages` → Message[]

#### Agent
- `id` (String, cuid)
- `slug` (String, unique)
- `ownerId` (String) → User.id
- `status` (String, default: "draft") — "draft", "published", "suspended"
- `isApproved` (Boolean, default: false) — Admin approval
- `createdAt`, `updatedAt`

**Relations:**
- `owner` → User
- `specs` → AgentSpec[]
- `subscriptions` → Subscription[]
- `messages` → Message[]
- `knowledgeFiles` → AgentKnowledgeFile[]
- `knowledgeChunks` → AgentKnowledgeChunk[]

**Indexes:**
- `slug`
- `ownerId`
- `status`

#### AgentSpec
- `id` (String, cuid)
- `agentId` (String) → Agent.id
- `version` (Int, default: 1)
- `spec` (Json) — Full AgentSpec JSON
- `isActive` (Boolean, default: true)
- `createdAt`, `updatedAt`

**Relations:**
- `agent` → Agent

**Unique Constraint:** `[agentId, version]`
**Index:** `[agentId, isActive]`

#### Subscription
- `id` (String, cuid)
- `userId` (String) → User.id
- `agentId` (String) → Agent.id
- `stripeSubscriptionId` (String, unique)
- `stripeCustomerId` (String)
- `status` (String) — "active", "canceled", "past_due", etc.
- `currentPeriodEnd` (DateTime?)
- `createdAt`, `updatedAt`

**Relations:**
- `user` → User
- `agent` → Agent

**Indexes:**
- `userId`
- `agentId`
- `stripeSubscriptionId`

#### Message
- `id` (String, cuid)
- `userId` (String?) — Nullable for anonymous users
- `callerId` (String) — userId or anonId (for limits/trials)
- `agentId` (String) → Agent.id
- `role` (String) — "user" or "assistant"
- `content` (String)
- `createdAt`

**Relations:**
- `user` → User? (nullable)
- `agent` → Agent

**Indexes:**
- `[agentId, callerId, createdAt]`
- `createdAt`

#### UsageLog
- `id` (String, cuid)
- `userId` (String?)
- `callerId` (String)
- `agentId` (String) → Agent.id
- `tokensUsed` (Int?)
- `isTrial` (Boolean, default: false)
- `createdAt`

**Indexes:**
- `[agentId, callerId, createdAt]`
- `createdAt`

#### AgentKnowledgeFile
- `id` (String, cuid)
- `agentId` (String) → Agent.id
- `fileName` (String)
- `fileUrl` (String) — S3-compatible storage URL
- `fileSize` (Int?)
- `mimeType` (String?)
- `uploadedAt`

**Relations:**
- `agent` → Agent
- `chunks` → AgentKnowledgeChunk[]

**Index:** `agentId`

#### AgentKnowledgeChunk
- `id` (String, cuid)
- `agentId` (String) → Agent.id
- `fileId` (String) → AgentKnowledgeFile.id
- `content` (String)
- `embedding` (vector(1536)?) — pgvector embedding
- `metadata` (Json?)
- `createdAt`

**Relations:**
- `agent` → Agent
- `file` → AgentKnowledgeFile

**Indexes:**
- `agentId`
- `fileId`

---

## API Routes

### Public Routes

#### `POST /api/agents/[slug]/invoke`
**Purpose:** Invoke an agent (chat endpoint)

**Auth:** Optional (supports anonymous users)

**Request Body:**
```json
{
  "message": "string"
}
```

**Response:**
- `200`: `{ message: "string" }`
- `400`: Invalid JSON or missing message
- `402`: Subscription required (trial exhausted)
- `404`: Agent not found
- `429`: Rate limit exceeded or daily limit reached
- `500`: Internal error

**Logic:**
1. Load agent (published only, exclude suspended)
2. Identify caller (authenticated user or anonymous cookie)
3. Check rate limits
4. Load active AgentSpec
5. Check subscription/trial status
6. Check daily message limits
7. Optional RAG retrieval
8. Construct prompt deterministically
9. Call LLM
10. Log message and usage
11. Return response

#### `POST /api/agents/[slug]/subscribe`
**Purpose:** Create Stripe Checkout session for agent subscription

**Auth:** Required

**Request Body:** None (agentId from URL, userId from auth)

**Response:**
- `200`: `{ url: "string" }` — Stripe Checkout URL
- `400`: Agent not published or creator missing Stripe account
- `401`: Not authenticated
- `404`: Agent not found
- `500`: Internal error

**Logic:**
1. Require authentication
2. Load agent (published only)
3. Verify creator has `stripeAccountId`
4. Create Stripe Checkout session with Connect transfer
5. Return checkout URL

#### `GET /api/health/db`
**Purpose:** Database health check

**Auth:** None

**Response:**
- `200`: `{ status: "ok", database: "connected" }`
- `500`: `{ status: "error", database: "disconnected", error: "string" }`

**Logic:**
- Uses `prisma.$queryRawUnsafe("SELECT 1")` (compatible with connection poolers)

### Creator Routes (Protected)

#### `POST /api/creator/onboard`
**Purpose:** Complete creator onboarding

**Auth:** Required

**Request Body:**
```json
{
  "displayName": "string",
  "handle": "string",
  "shortBio": "string?" // optional
}
```

**Response:**
- `200`: `{ success: true }`
- `400`: Missing fields or invalid handle format
- `409`: Handle already taken
- `500`: Internal error

**Logic:**
1. Require authentication
2. Validate displayName and handle
3. Validate handle format: `/^[a-z0-9-]+$/`
4. Check handle uniqueness (excluding current user)
5. Update user with creator profile and set `isCreator: true`

#### `GET /api/creator/agents`
**Purpose:** List creator's agents

**Auth:** Required (creator)

**Response:**
- `200`: `{ agents: Agent[] }`

**Logic:**
1. Require creator status
2. Query agents where `ownerId === currentUser.id`
3. Include latest AgentSpec

#### `POST /api/creator/agents`
**Purpose:** Create new agent

**Auth:** Required (creator)

**Request Body:**
```json
{
  "spec": AgentSpec
}
```

**Response:**
- `201`: `{ id: "string", slug: "string" }`
- `400`: Invalid AgentSpec
- `500`: Internal error

**Logic:**
1. Require creator status
2. Validate AgentSpec
3. Generate unique slug from agent name
4. Create Agent and initial AgentSpec (version 1, isActive: true)

#### `GET /api/creator/agents/[id]`
**Purpose:** Get agent details (for editing)

**Auth:** Required (creator, owner)

**Response:**
- `200`: `{ agent: Agent, spec: AgentSpec }`
- `403`: Not owner
- `404`: Agent not found

**Logic:**
1. Require creator status
2. Load agent
3. Verify `agent.ownerId === currentUser.id`
4. Load active AgentSpec
5. Return agent and spec

#### `PUT /api/creator/agents/[id]`
**Purpose:** Update agent (creates new AgentSpec version)

**Auth:** Required (creator, owner)

**Request Body:**
```json
{
  "spec": AgentSpec
}
```

**Response:**
- `200`: `{ success: true }`
- `400`: Invalid AgentSpec
- `403`: Not owner
- `404`: Agent not found
- `500`: Internal error

**Logic:**
1. Require creator status
2. Load agent and verify ownership
3. Validate AgentSpec
4. Deactivate current AgentSpec
5. Create new AgentSpec (increment version)

#### `POST /api/creator/agents/[id]/publish`
**Purpose:** Publish agent (requires Stripe Connect)

**Auth:** Required (creator, owner)

**Response:**
- `200`: `{ success: true }`
- `400`: Agent not ready or creator missing Stripe account
- `403`: Not owner
- `404`: Agent not found
- `500`: Internal error

**Logic:**
1. Require creator status
2. Load agent and verify ownership
3. Verify creator has `stripeAccountId`
4. Verify agent has active AgentSpec
5. Update `status: "published"`

#### `POST /api/creator/agents/[id]/unpublish`
**Purpose:** Unpublish agent

**Auth:** Required (creator, owner)

**Response:**
- `200`: `{ success: true }`
- `403`: Not owner
- `404`: Agent not found

**Logic:**
1. Require creator status
2. Load agent and verify ownership
3. Update `status: "draft"`

#### `GET /api/creator/agents/[id]/analytics`
**Purpose:** Get agent analytics

**Auth:** Required (creator, owner)

**Response:**
- `200`: `{ subscribers: number, messages: number }`
- `403`: Not owner
- `404`: Agent not found

**Logic:**
1. Require creator status
2. Load agent and verify ownership
3. Count active subscriptions
4. Count messages
5. Return stats

#### `POST /api/creator/stripe/connect`
**Purpose:** Create Stripe Connect onboarding link

**Auth:** Required (creator)

**Response:**
- `200`: `{ url: "string" }` — Stripe onboarding URL
- `500`: Internal error

**Logic:**
1. Require creator status
2. Create or retrieve Stripe Connect Express account
3. Create onboarding link
4. Return URL

### Admin Routes (Protected)

#### `POST /api/admin/agents/[id]/suspend`
**Purpose:** Suspend agent (admin only)

**Auth:** Required (admin)

**Response:**
- `200`: `{ success: true }`
- `403`: Not admin
- `404`: Agent not found

**Logic:**
1. Require admin status (email-based)
2. Load agent
3. Update `status: "suspended"`

### Webhook Routes

#### `POST /api/stripe/webhook`
**Purpose:** Handle Stripe webhooks

**Auth:** None (signature verification)

**Request:** Raw body + `stripe-signature` header

**Response:**
- `200`: `{ received: true }`
- `400`: Invalid signature
- `500`: Handler error

**Events Handled:**
- `checkout.session.completed` → Create/update subscription
- `customer.subscription.deleted` → Mark subscription as canceled
- `customer.subscription.updated` → Update subscription status
- `invoice.payment_failed` → Mark subscription as past_due

**Logic:**
1. Verify webhook signature
2. Parse event
3. Handle event type (idempotent upserts)
4. Return success

---

## Authentication & Authorization

### Clerk Integration

**Version:** Clerk v5
**Pattern:** Modal-based sign-in (no `/sign-in` route)

**Configuration:**
- `ClerkProvider` wraps app in `app/layout.tsx`
- Uses `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` only
- `afterSignInUrl` / `afterSignUpUrl` derive from `NEXT_PUBLIC_APP_URL`

### Middleware

**File:** `middleware.ts`

**Protected Routes:**
- `/creator(.*)`
- `/admin(.*)`
- `/api/creator(.*)`

**Logic:**
- Uses `clerkMiddleware` + `createRouteMatcher`
- For protected routes without `userId`:
  - Redirects to `/sign-in` with `redirect_url` query param
- Does NOT use `auth.protect()` (deprecated)

### Auth Helpers (`lib/auth.ts`)

#### `getCurrentUser()`
- Returns authenticated user from Clerk + DB sync
- Returns `null` if not authenticated
- Gracefully handles middleware edge cases

#### `requireAuth()`
- Requires authentication
- Redirects to `/sign-in` if not authenticated
- Returns DB-backed user

#### `requireCreator()`
- Requires authentication + `isCreator: true`
- Redirects to `/creator/onboarding` if not creator
- Returns creator user

#### `requireAdmin()`
- Requires authentication + email in `ADMIN_EMAILS` env var
- Redirects to `/` if not admin
- Returns admin user

### User Sync

- On first Clerk auth, user is synced to database
- `authId` maps to Clerk `userId`
- Existing fields (e.g., `stripeCustomerId`) are preserved on sync

---

## Key Features

### AgentSpec

**Type:** `lib/agentSpec.ts`

**Structure:**
```typescript
{
  profile: {
    name: string;
    description: string;
    category: AgentCategory;
    avatarUrl?: string;
  };
  model: {
    provider: ModelProvider; // "openai"
    modelId: string;
    temperature: number;
    maxTokens: number;
  };
  knowledge: {
    enabled: boolean;
    fileIds: string[];
    topK: number;
  };
  behavior: {
    baseTone: BaseTone; // "direct" | "friendly" | "formal"
    additionalInstructions?: string;
  };
  guardrails: {
    showDisclosure: boolean;
    disallowedTopics: string[];
    categoryPolicy: CategoryPolicy; // "default" | "sensitive"
  };
  pricing: {
    planType: "subscription";
    monthlyPriceUsd: number;
    trialMessages: number;
  };
  limits: {
    maxMessagesPerDay: number;
  };
}
```

**Validation:** `validateAgentSpec()` ensures type safety

### Agent Runtime Flow

1. **Load Agent:** Published only, exclude suspended
2. **Identify Caller:** Authenticated user or anonymous cookie
3. **Rate Limiting:** Per-caller, per-agent checks
4. **Access Control:** Subscription or trial check
5. **Daily Limits:** Per-caller, per-agent message limits
6. **RAG (Optional):** Retrieve relevant chunks if enabled
7. **Prompt Construction:** Deterministic scaffold with guardrails
8. **LLM Call:** Via `lib/llmClient.ts` abstraction
9. **Logging:** Messages and usage logs

### RAG (Retrieval-Augmented Generation)

**Status:** Optional per agent

**Requirements:**
- pgvector extension enabled
- Knowledge files uploaded via Supabase Storage
- Chunks created with embeddings (1536 dimensions)

**Flow:**
1. Agent has `knowledge.enabled: true`
2. User message triggers RAG query
3. `getRelevantChunks()` searches pgvector by agentId
4. Top K chunks retrieved and injected into prompt

**Scoping:** All queries scoped by `agentId` (no cross-agent leakage)

### Stripe Connect

**Pattern:** Express accounts

**Flow:**
1. Creator completes onboarding
2. Creator clicks "Connect Stripe" → `/api/creator/stripe/connect`
3. Stripe Express account created (or retrieved)
4. Onboarding link generated
5. Creator completes Stripe onboarding
6. `stripeAccountId` stored on User
7. Agent can be published (requires `stripeAccountId`)

**Payouts:**
- Platform fee: Configurable (default 5%)
- Transfer: Via `transfer_data.destination` in checkout session
- Application fee: Calculated as percentage

### Subscription Flow

1. User visits `/agents/[slug]`
2. User clicks "Subscribe" → `POST /api/agents/[slug]/subscribe`
3. Checkout session created with Connect transfer
4. User redirected to Stripe Checkout
5. User completes payment
6. Webhook `checkout.session.completed` fires
7. Subscription created in database
8. User can now invoke agent without trial limits

### Trial System

**Logic:**
- Anonymous and unsubscribed users get trial messages
- Trial count: Per-caller, per-agent (from `AgentSpec.pricing.trialMessages`)
- Only user messages count toward trial
- After trial exhausted: `402 Payment Required`

### Rate Limiting

**Implementation:** `lib/rateLimit.ts`

**Checks:**
- Per-caller, per-agent daily message limits
- Uses `AgentSpec.limits.maxMessagesPerDay`
- Counts user messages in last 24 hours
- Returns `429` if limit exceeded

---

## Environment Variables

See `ENV_VARIABLES.md` for complete reference.

### Required

- `NEXT_PUBLIC_APP_URL` — Production app URL
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — Clerk publishable key
- `CLERK_SECRET_KEY` — Clerk secret key
- `DATABASE_URL` — PostgreSQL connection string (pooler)
- `DIRECT_URL` — Direct PostgreSQL connection (migrations)
- `STRIPE_SECRET_KEY` — Stripe secret key
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook signing secret
- `OPENAI_API_KEY` — OpenAI API key

### Optional

- `ADMIN_EMAILS` — Comma-separated admin emails
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL` — Sign-in page URL (default: `/sign-in`)
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL` — Sign-up page URL (default: `/sign-up`)
- `PLATFORM_FEE_BPS` — Platform fee in basis points (default: 500 = 5%)

---

## Development Workflow

### Prerequisites

- Node.js 22.x
- npm or yarn
- PostgreSQL database (Supabase recommended)
- Clerk account
- Stripe account

### Setup

1. **Clone repository:**
   ```bash
   git clone <repository-url>
   cd return-address
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up database:**
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```

5. **Run development server:**
   ```bash
   npm run dev
   ```

### Available Scripts

- `npm run dev` — Start development server
- `npm run build` — Build for production
- `npm run start` — Start production server
- `npm run lint` — Run ESLint
- `npm run smoke` — Run smoke tests (`scripts/smoke.ts`)
- `npm run db:generate` — Generate Prisma client
- `npm run db:push` — Push schema changes (dev)
- `npm run db:migrate` — Create and apply migration
- `npm run db:studio` — Open Prisma Studio

### Code Style

- **TypeScript:** Strict mode enabled
- **ESLint:** Next.js config
- **Formatting:** Prettier (if configured)
- **Imports:** Absolute paths via `@/` alias

### Testing

- **Linting:** `npm run lint`
- **Build:** `npm run build`
- **Smoke Tests:** `npm run smoke` (if implemented)

### Database Migrations

**Create migration:**
```bash
npx prisma migrate dev --name migration_name
```

**Apply migrations (production):**
```bash
npx prisma migrate deploy
```

**Generate Prisma client:**
```bash
npx prisma generate
```

---

## Deployment

### Vercel

**Configuration:**
- Framework: Next.js (auto-detected)
- Build Command: `npm run build`
- Output Directory: `.next`
- Node Version: 22.x (from `package.json`)

**Environment Variables:**
- Set all required env vars in Vercel dashboard
- Use Vercel's environment variable management

**Deployment:**
- Automatic on push to `main` branch
- Preview deployments for PRs

### Database Migrations

**Production:**
```bash
npx prisma migrate deploy
```

**Note:** Uses `DIRECT_URL` for migrations (bypasses connection pooler)

### Health Checks

- **Database:** `GET /api/health/db`
- **Status:** Returns `{ status, database }`

---

## Project Structure

```
.
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── admin/                # Admin routes
│   │   ├── agents/                # Public agent routes
│   │   ├── creator/              # Creator routes
│   │   ├── health/               # Health checks
│   │   └── stripe/               # Stripe webhooks
│   ├── components/               # React components
│   │   ├── AgentMarketplace.tsx
│   │   ├── ErrorBoundary.tsx
│   │   └── Nav.tsx
│   ├── creator/                  # Creator pages
│   │   ├── agents/               # Agent management
│   │   └── onboarding/           # Creator onboarding
│   ├── agents/                   # Public agent pages
│   │   └── [slug]/               # Agent detail page
│   ├── marketplace/              # Marketplace page
│   ├── admin/                    # Admin pages
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Homepage
├── lib/                          # Utility libraries
│   ├── agentSpec.ts              # AgentSpec types & validation
│   ├── auth.ts                   # Auth helpers
│   ├── db.ts                     # Prisma client
│   ├── env.ts                    # Env validation
│   ├── llmClient.ts              # LLM abstraction
│   ├── log.ts                    # Logging utilities
│   ├── rag.ts                    # RAG functions
│   ├── rateLimit.ts              # Rate limiting
│   ├── storage.ts                # File storage
│   └── stripe.ts                 # Stripe integration
├── prisma/                       # Prisma schema & migrations
│   ├── schema.prisma
│   └── migrations/
├── scripts/                      # Utility scripts
│   ├── smoke.ts                  # Smoke tests
│   └── set-secrets-from-env.sh   # Secret management
├── public/                       # Static assets
├── middleware.ts                 # Next.js middleware (auth)
├── next.config.js                # Next.js config
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
└── vercel.json                   # Vercel config
```

---

## Additional Resources

- **Specification:** `AGENT-STUDIO-V0.md` — Original implementation spec
- **Database Setup:** `DATABASE_SETUP.md` — Database configuration guide
- **Storage Setup:** `SUPABASE_STORAGE_SETUP.md` — Storage & RAG setup
- **Environment Variables:** `ENV_VARIABLES.md` — Complete env var reference
- **Creator Onboarding:** `CREATOR_ONBOARDING.md` — Creator flow documentation
- **CI Status:** `CI_STATUS_REPORT.md` — Comprehensive CI setup and status report
- **CI Verification:** `CI_VERIFICATION_REPORT.md` — Detailed CI verification results
- **CI Setup:** `CI_SETUP_SUMMARY.md` — Quick CI setup reference

---

## Support & Maintenance

### Common Issues

1. **Build fails locally with Node 22.x:**
   - Known issue, non-blocking
   - Vercel uses Node 20.x (works fine)

2. **Database connection errors:**
   - Check `DATABASE_URL` (pooler) and `DIRECT_URL` (direct)
   - Ensure migrations use `DIRECT_URL`

3. **Clerk auth issues:**
   - Verify `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set
   - Check middleware matcher configuration

4. **Stripe webhook failures:**
   - Verify `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
   - Check webhook endpoint URL in Stripe dashboard

### Debugging

- **Logs:** Use `lib/log.ts` utilities (`logInfo`, `logError`)
- **Database:** Use Prisma Studio (`npm run db:studio`)
- **Health Checks:** `GET /api/health/db`

---

**Document Version:** 1.0
**Last Updated:** 2025-01-XX
**Maintained By:** Return Address Engineering Team

