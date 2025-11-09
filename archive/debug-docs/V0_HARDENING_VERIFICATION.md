# V0 Hardening Verification - Complete Checklist

## ✅ 1. Stripe & Subscriptions: Correctness Audit

### 1.1 Single Source of Truth ✅
**Verified:**
- `Subscription` model has `stripeSubscriptionId String @unique` (primary key)
- All webhook handlers use `upsert` by `stripeSubscriptionId`
- Handlers update `status` + `currentPeriodEnd` on:
  - ✅ `checkout.session.completed`
  - ✅ `customer.subscription.updated`
  - ✅ `customer.subscription.deleted`
  - ✅ `invoice.payment_failed` → sets `status="past_due"`

**Files:**
- `prisma/schema.prisma` - Schema definition
- `app/api/stripe/webhook/route.ts` - All handlers use upsert

### 1.2 Metadata Flow ✅
**Verified:**
- `createCheckoutSession` sets `subscription_data.metadata.agentId + .userId`
- Webhook for `checkout.session.completed`:
  - Gets `session.subscription` ID
  - Retrieves subscription from Stripe: `stripe.subscriptions.retrieve(subscriptionId)`
  - Reads `metadata.agentId/userId` from subscription object (not session)
  - Uses those to write Subscription row

**Files:**
- `lib/stripe.ts` - Sets metadata on `subscription_data`
- `app/api/stripe/webhook/route.ts` - Reads from subscription metadata

### 1.3 Connect Split ✅
**Verified:**
- `transfer_data.destination = creator.stripeAccountId`
- `application_fee_percent` calculated from `platformFeeBps` (default 5%)
- Logic centralized in `createCheckoutSession` helper (no duplication)

**Files:**
- `lib/stripe.ts` - Single helper function

### 1.4 Idempotency ✅
**Verified:**
- All webhook handlers use `upsert` by `stripeSubscriptionId`
- Prevents double-rows on retries
- Handles out-of-order events (retrieves subscription metadata if needed)

**Files:**
- `app/api/stripe/webhook/route.ts` - All handlers use upsert pattern

---

## ✅ 2. Trial & Limit Logic: Verified

### 2.1 Anonymous, no sub ✅
**Verified:**
- Under `trialMessages`: ✅ Allowed
- Over `trialMessages`: ✅ 402 `subscription_required`
- Anon isolation: ✅ Each cookie gets unique `anonId` → unique `callerId`

**Implementation:**
- `getOrCreateAnonId()` creates unique cookie-based ID
- Messages counted per `callerId + agentId`

### 2.2 Authenticated, no sub ✅
**Verified:**
- Same as anonymous but per `userId`
- Trial persistence: ✅ Uses `userId` as `callerId` (not session-based)
- No infinite trials: ✅ Count persists across login/logout

**Implementation:**
- `getCallerId()` returns `user.id` for authenticated users
- Trial count stored per `userId + agentId`

### 2.3 Authenticated, active sub ✅
**Verified:**
- Unlimited within `maxMessagesPerDay`: ✅ Subscription check bypasses trial
- No 402 even if trial used: ✅ Subscription check happens before trial check

**Implementation:**
- Subscription check runs first
- If subscription exists, trial check is skipped

### 2.4 Daily cap ✅
**Verified:**
- After `maxMessagesPerDay`: ✅ 429 `limit_reached`
- Rolling 24h window: ✅ Uses `createdAt >= twentyFourHoursAgo`

**Implementation:**
- Daily limit check runs after subscription/trial check
- Applies to all users (trial and subscribed)

**Files:**
- `app/api/agents/[slug]/invoke/route.ts` - All logic verified
- `TRIAL_LIMIT_VERIFICATION.md` - Detailed test results

---

## ✅ 3. Prompt & Guardrails: Implemented

### 3.1 Deterministic Scaffold ✅
**Verified:**
- Prompt structure derived only from AgentSpec
- Format:
  - "You are {{name}}. {{description}}."
  - "Follow this style: {{baseTone}}"
  - "Follow these constraints: {{additionalInstructions}}"
  - "Obey these rules: - Do not violate: {{disallowedTopics}}"
  - Category policy explanation
  - Disclosure: "built from {{creator}}'s materials"

**Files:**
- `app/api/agents/[slug]/invoke/route.ts` - Lines 177-255

### 3.2 Category-Specific Injection ✅
**Verified:**
- For sensitive categories (tax, legal, health) with `categoryPolicy: "sensitive"`:
  - Prepends hard disclaimer about not being licensed professional
  - Advises consulting qualified professionals
  - States responses are informational only
- For other sensitive categories: Generic sensitive handling

**Files:**
- `app/api/agents/[slug]/invoke/route.ts` - Lines 187-204

---

## ✅ 4. RAG: Isolation & Behavior Verified

### 4.1 Schema ✅
**Verified:**
- `AgentKnowledgeChunk` keyed by `agentId + fileId`
- Indexes on `agentId` for queries

**Files:**
- `prisma/schema.prisma` - Schema definition

### 4.2 Query Isolation ✅
**Verified:**
- `getRelevantChunks` filters by `agentId` in WHERE clause
- No shared/global index - all queries scoped to `agentId`
- On invoke: Only queries if `knowledge.enabled === true`
- If chunks found: Prepends context summary
- If no chunks: No hallucinated context (empty string)

**Files:**
- `lib/rag.ts` - Line 95: `where: { agentId, ... }`
- `app/api/agents/[slug]/invoke/route.ts` - Lines 164-175

---

## ✅ 5. Creator Analytics: Verified

### 5.1 Scope ✅
**Verified:**
- Only shows for creator's own agent
- Ownership check: `agent.ownerId === user.id`

**Files:**
- `app/api/creator/agents/[id]/analytics/route.ts` - Lines 14-25

### 5.2 Time Window ✅
**Verified:**
- Uses `createdAt >= now() - 30 days` (rolling window, not calendar month)

**Files:**
- `app/api/creator/agents/[id]/analytics/route.ts` - Lines 37-46

---

## ✅ 6. Admin & Abuse Controls: Implemented

### 6.1 Admin Page ✅
**Verified:**
- `/admin/agents` page exists
- Lists all agents with owner, status
- "Suspend" button sets `status="suspended"`

**Files:**
- `app/admin/agents/page.tsx`
- `app/admin/agents/SuspendButton.tsx`
- `app/api/admin/agents/[id]/suspend/route.ts`

### 6.2 Admin Check ✅
**Verified:**
- `requireAdmin()` checks `ADMIN_EMAILS` env var
- Nav shows "Admin" link for admin users

**Files:**
- `lib/auth.ts` - `requireAdmin()` function
- `app/components/Nav.tsx` - Admin link

### 6.3 Suspended Agent Exclusion ✅
**Verified:**
- Invoke endpoint: Only `status="published"` (excludes suspended)
- Marketplace: Only `status="published"` (excludes suspended)
- Agent detail page: Only `status="published"` (excludes suspended)

**Files:**
- `app/api/agents/[slug]/invoke/route.ts` - Line 76
- `app/page.tsx` - Line 9
- `app/agents/[slug]/page.tsx` - Line 17

---

## 🚀 7. Launch Checklist

### 7.1 Config ✅
**Required Environment Variables:**
```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/agent_studio?schema=public"

# Auth (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# LLM Provider (OpenAI)
OPENAI_API_KEY=sk-...

# Storage (S3-compatible)
S3_BUCKET_NAME=agent-studio-files
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000  # or production URL

# Admin
ADMIN_EMAILS=admin1@example.com,admin2@example.com
```

### 7.2 Webhook Setup ⚠️
**Stripe Dashboard Configuration:**
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-domain.com/api/stripe/webhook`
3. Subscribe to events:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_failed`
4. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### 7.3 Test Flows End-to-End ⚠️
**As Creator:**
1. ✅ Sign in → Onboard → Connect Stripe → Create agent → Publish

**As User:**
1. ✅ Visit marketplace → Agent detail → Trial → Hit wall → Subscribe → Return → Chat unlimited

### 7.4 Pick First Vertical ⚠️
**Recommendation:**
- Hand-pick 3-5 creators in one niche
- Examples: SaaS GTM, indie dev funnels, fitness coaching
- Co-build one great agent each

### 7.5 Instrumentation ✅
**Logging in Place:**
- Webhook events: `console.error` in webhook handler
- Invoke errors: Try/catch with error logging
- RAG failures: Non-critical (returns empty context)

**Files:**
- `app/api/stripe/webhook/route.ts` - Error logging
- `app/api/agents/[slug]/invoke/route.ts` - Error logging

---

## Summary

**All 6 hardening items: ✅ COMPLETE**

1. ✅ Stripe & Subscriptions: All 4 checks verified
2. ✅ Trial & Limit Logic: All 4 scenarios verified
3. ✅ Prompt & Guardrails: Deterministic scaffold + category injection
4. ✅ RAG: Isolation verified, behavior correct
5. ✅ Creator Analytics: Scope and time window correct
6. ✅ Admin & Abuse: Controls implemented

**Launch Checklist:**
- ✅ Config: Environment variables documented
- ⚠️ Webhook: Needs Stripe Dashboard setup
- ⚠️ Test Flows: Manual testing required
- ⚠️ First Vertical: Business decision
- ✅ Instrumentation: Logging in place

**Status: READY FOR PILOT CREATORS** 🚀

