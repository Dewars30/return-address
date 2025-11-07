# Launch Checklist - Ready for 3-5 Pilot Creators

## ✅ Pre-Launch Verification Complete

All 6 hardening items have been verified and implemented:

1. ✅ **Stripe & Subscriptions** - All 4 correctness checks passed
2. ✅ **Trial & Limit Logic** - All 4 scenarios verified
3. ✅ **Prompt & Guardrails** - Deterministic scaffold + category injection
4. ✅ **RAG Isolation** - Verified agent-scoped queries
5. ✅ **Creator Analytics** - Scoped and time-windowed correctly
6. ✅ **Admin Controls** - Kill switch implemented

See `V0_HARDENING_VERIFICATION.md` for detailed verification.

---

## 🚀 Launch Steps

### Step 1: Environment Configuration

**Required `.env` variables:**

```bash
# Database (REQUIRED)
DATABASE_URL="postgresql://user:password@host:5432/agent_studio?schema=public"

# Auth - Clerk (REQUIRED)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Stripe (REQUIRED)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...  # Get from Stripe Dashboard
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# LLM Provider - OpenAI (REQUIRED)
OPENAI_API_KEY=sk-...

# Storage - S3 (OPTIONAL for V0, but recommended)
S3_BUCKET_NAME=agent-studio-files
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...

# App URL (REQUIRED)
NEXT_PUBLIC_APP_URL=https://your-domain.com  # or http://localhost:3000 for dev

# Admin (REQUIRED)
ADMIN_EMAILS=admin1@example.com,admin2@example.com  # Comma-separated
```

**Action Items:**
- [ ] Set up production Postgres database
- [ ] Configure Clerk (production keys)
- [ ] Configure Stripe (test mode for pilot)
- [ ] Set OpenAI API key
- [ ] Set production `NEXT_PUBLIC_APP_URL`
- [ ] Add admin emails to `ADMIN_EMAILS`

---

### Step 2: Stripe Webhook Configuration

**Stripe Dashboard Setup:**

1. Go to: https://dashboard.stripe.com/test/webhooks (or production)
2. Click "Add endpoint"
3. Endpoint URL: `https://your-domain.com/api/stripe/webhook`
4. Description: "Agent Studio webhook handler"
5. Select events to listen to:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_failed`
6. Click "Add endpoint"
7. Copy the "Signing secret" (starts with `whsec_`)
8. Add to `.env`: `STRIPE_WEBHOOK_SECRET=whsec_...`

**Action Items:**
- [ ] Create webhook endpoint in Stripe Dashboard
- [ ] Subscribe to all 4 required events
- [ ] Copy signing secret to `.env`
- [ ] Test webhook with Stripe CLI or test payment

---

### Step 3: End-to-End Test Flows

**As Creator (Test Account):**

1. [ ] Sign in with Clerk
2. [ ] Navigate to "Become a creator"
3. [ ] Complete onboarding form (handle, bio)
4. [ ] Click "Connect Stripe"
5. [ ] Complete Stripe Connect Express onboarding
6. [ ] Create new agent
7. [ ] Fill out AgentSpec form
8. [ ] Save agent (status: draft)
9. [ ] Click "Publish" (should work if Stripe connected)
10. [ ] Verify agent appears in marketplace

**As User (Test Account):**

1. [ ] Visit marketplace (`/`)
2. [ ] Click on published agent
3. [ ] View agent detail page
4. [ ] Send trial messages (should work)
5. [ ] Hit trial limit (should get 402)
6. [ ] Click "Subscribe" button
7. [ ] Complete Stripe Checkout
8. [ ] Return to agent page
9. [ ] Send messages (should work unlimited within daily cap)
10. [ ] Hit daily limit (should get 429)

**Action Items:**
- [ ] Complete creator flow end-to-end
- [ ] Complete user flow end-to-end
- [ ] Verify webhook events are received
- [ ] Check database for correct subscription creation
- [ ] Test trial limit enforcement
- [ ] Test daily limit enforcement

---

### Step 4: Pick First Vertical

**Recommendation:**
- Don't open floodgates - hand-pick 3-5 creators
- Choose one niche to start:
  - SaaS GTM (go-to-market advice)
  - Indie dev funnels (product marketing)
  - Fitness coaching (health/wellness)
  - Business consulting (strategy)
  - Real estate (property advice)

**Action Items:**
- [ ] Identify 3-5 creators in chosen vertical
- [ ] Reach out and explain pilot program
- [ ] Co-build one great agent with each creator
- [ ] Ensure they complete Stripe Connect onboarding
- [ ] Help them publish their first agent

---

### Step 5: Instrumentation & Monitoring

**Current Logging:**

✅ **Webhook Events:**
- `app/api/stripe/webhook/route.ts` - Logs errors with `console.error`

✅ **Invoke Errors:**
- `app/api/agents/[slug]/invoke/route.ts` - Try/catch with error logging

✅ **RAG Failures:**
- `lib/rag.ts` - Returns empty array if no chunks (non-critical)

**Recommended Monitoring:**

- [ ] Set up error tracking (Sentry, LogRocket, etc.)
- [ ] Monitor webhook delivery in Stripe Dashboard
- [ ] Check database for subscription sync issues
- [ ] Monitor API response times
- [ ] Track trial → subscription conversion

**Action Items:**
- [ ] Set up error tracking service
- [ ] Configure alerts for webhook failures
- [ ] Set up database monitoring
- [ ] Create dashboard for key metrics

---

### Step 6: Pre-Launch Security Check

**Security Checklist:**

- [ ] All API keys in environment variables (not hardcoded)
- [ ] Webhook signature verification enabled
- [ ] Admin routes protected with `requireAdmin()`
- [ ] Suspended agents excluded from public endpoints
- [ ] User input sanitized (AgentSpec validation)
- [ ] SQL injection protection (Prisma parameterized queries)
- [ ] CORS configured (if needed)
- [ ] Rate limiting considered (Next.js built-in)

**Action Items:**
- [ ] Review all environment variables
- [ ] Test admin route protection
- [ ] Verify webhook signature verification
- [ ] Test suspended agent exclusion

---

## 🎯 Success Metrics for Pilot

**Week 1-2:**
- 3-5 creators onboarded
- 1 agent published per creator
- 0 critical bugs

**Week 3-4:**
- First paying subscribers
- Trial → subscription conversion rate
- User engagement (messages per agent)

**Month 2:**
- Refine based on feedback
- Fix any edge cases
- Plan for scale

---

## 🐛 Known Limitations (V0)

**Acceptable for Pilot:**
- Simple text-based RAG (no vector embeddings)
- No advanced analytics (just basic counts)
- No multi-agent orchestration
- No custom tool integrations
- No voice/phone support
- No fine-tuning pipelines

**These are by design - stay focused on core value.**

---

## 📞 Support Plan

**For Pilot Creators:**
- Direct email/chat support
- Quick bug fixes (within 24h)
- Feature requests logged (not promised)

**For End Users:**
- Self-service trial
- Clear subscription flow
- Basic error messages

---

## ✅ Final Pre-Launch Checklist

- [ ] All environment variables set
- [ ] Stripe webhook configured and tested
- [ ] End-to-end flows tested
- [ ] 3-5 creators identified and onboarded
- [ ] Error tracking configured
- [ ] Security checklist complete
- [ ] Database backups configured
- [ ] Monitoring dashboard ready

**Status: Ready to launch pilot! 🚀**

