# Return Address - Comprehensive Testing Plan & Bug List

## ✅ Sign-In Fix Validation

### Status: PARTIALLY FIXED
- ✅ Production Clerk keys loaded (`pk_live_...`)
- ✅ Frontend API: `clerk.returnaddress.io` (production)
- ✅ Sign-in modal opens correctly
- ✅ No "Development mode" warning
- ❌ CORS errors persist for `accounts.returnaddress.io`
- ❌ Modal backdrop blocks navigation clicks (UX issue)

### Remaining Issue
The CORS error for `accounts.returnaddress.io` suggests:
- Clerk DNS records may need verification
- Or Clerk Dashboard domain configuration needs update

---

## 🧪 Comprehensive Testing Plan

### Phase 1: Core Functionality Testing

#### 1.1 Authentication Flow
- [ ] **Sign Up**
  - [ ] Email/password sign up
  - [ ] GitHub OAuth sign up
  - [ ] Google OAuth sign up
  - [ ] Email verification (if enabled)
  - [ ] User sync to database

- [ ] **Sign In**
  - [ ] Email/password sign in
  - [ ] GitHub OAuth sign in
  - [ ] Google OAuth sign in
  - [ ] Remember me functionality
  - [ ] Redirect after sign in

- [ ] **Sign Out**
  - [ ] Sign out button works
  - [ ] Session cleared
  - [ ] Redirect to home page

#### 1.2 Public Pages
- [ ] **Homepage (`/`)**
  - [ ] Hero section displays correctly
  - [ ] Marketplace section shows published agents
  - [ ] Empty state when no agents
  - [ ] Links work (Explore agents, Become a creator)
  - [ ] Navigation bar displays correctly

- [ ] **Marketplace (`/marketplace`)**
  - [ ] Lists all published agents
  - [ ] Agent cards display correctly (name, category, price, creator)
  - [ ] Links to agent detail pages work
  - [ ] Empty state when no agents

- [ ] **Agent Detail (`/agents/[slug]`)**
  - [ ] Displays agent information correctly
  - [ ] Shows creator attribution
  - [ ] Shows pricing and trial info
  - [ ] Displays disclaimers if enabled
  - [ ] Chat component renders
  - [ ] Subscribe button displays (if not subscribed)
  - [ ] 404 for non-existent agents
  - [ ] 404 for draft/suspended agents

#### 1.3 Creator Flow
- [ ] **Creator Onboarding (`/creator/onboarding`)**
  - [ ] Requires authentication
  - [ ] Form validation works
  - [ ] Handle uniqueness check
  - [ ] Stripe Connect button works
  - [ ] Redirects after completion

- [ ] **Creator Dashboard (`/creator/agents`)**
  - [ ] Lists creator's agents
  - [ ] Create new agent button works
  - [ ] Edit agent links work
  - [ ] Empty state for new creators

- [ ] **Create Agent (`/creator/agents/new`)**
  - [ ] Form validation for all fields
  - [ ] AgentSpec saves correctly
  - [ ] Draft status by default
  - [ ] Redirects to agent edit page

- [ ] **Edit Agent (`/creator/agents/[id]`)**
  - [ ] Loads existing agent data
  - [ ] Analytics display correctly
  - [ ] Publish/Unpublish works
  - [ ] Version increments on publish
  - [ ] Only creator can edit their agents

#### 1.4 Agent Runtime
- [ ] **Invoke Endpoint (`/api/agents/[slug]/invoke`)**
  - [ ] Published agents respond
  - [ ] Draft agents return 404
  - [ ] Suspended agents return 404
  - [ ] Anonymous users get trial messages
  - [ ] Trial limit enforced correctly
  - [ ] Daily limit enforced correctly
  - [ ] Subscribed users bypass trial
  - [ ] RAG context included when enabled
  - [ ] Guardrails enforced
  - [ ] Messages logged correctly
  - [ ] Usage logged correctly

#### 1.5 Payments & Subscriptions
- [ ] **Subscription Checkout (`/api/agents/[slug]/subscribe`)**
  - [ ] Requires authentication
  - [ ] Creates Stripe Checkout Session
  - [ ] Redirects to Stripe
  - [ ] Metadata includes agentId and userId
  - [ ] Application fee calculated correctly

- [ ] **Stripe Webhooks (`/api/stripe/webhook`)**
  - [ ] `checkout.session.completed` creates subscription
  - [ ] `customer.subscription.updated` updates subscription
  - [ ] `customer.subscription.deleted` cancels subscription
  - [ ] `invoice.payment_failed` marks past_due
  - [ ] Idempotency (no duplicate subscriptions)
  - [ ] Webhook signature verification

- [ ] **Subscription Flow**
  - [ ] User subscribes → subscription active
  - [ ] User cancels → subscription canceled
  - [ ] Payment fails → subscription past_due
  - [ ] One subscription per (user, agent)

#### 1.6 Admin Flow
- [ ] **Admin Panel (`/admin/agents`)**
  - [ ] Requires admin email
  - [ ] Lists all agents
  - [ ] Shows owner, status
  - [ ] Suspend button works
  - [ ] Suspended agents don't appear in marketplace

### Phase 2: Edge Cases & Error Handling

#### 2.1 Error Scenarios
- [ ] Database connection failures
- [ ] Stripe API failures
- [ ] LLM API failures
- [ ] Invalid agent slugs
- [ ] Missing environment variables
- [ ] Network timeouts

#### 2.2 Limit Enforcement
- [ ] Anonymous user trial limits
- [ ] Daily message limits (rolling 24h)
- [ ] Multiple anonymous sessions (different cookies)
- [ ] Limit resets correctly

#### 2.3 Data Integrity
- [ ] AgentSpec versioning
- [ ] Subscription uniqueness
- [ ] Message logging accuracy
- [ ] Usage logging accuracy

### Phase 3: UI/UX Testing

#### 3.1 Responsive Design
- [ ] Mobile view (< 768px)
- [ ] Tablet view (768px - 1024px)
- [ ] Desktop view (> 1024px)
- [ ] Navigation works on all sizes

#### 3.2 Accessibility
- [ ] Keyboard navigation
- [ ] Screen reader compatibility
- [ ] Form labels and ARIA attributes
- [ ] Color contrast
- [ ] Focus indicators

#### 3.3 Performance
- [ ] Page load times
- [ ] API response times
- [ ] Database query performance
- [ ] Image optimization

### Phase 4: Integration Testing

#### 4.1 End-to-End Flows
- [ ] **Creator Journey**
  1. Sign up → Onboard → Connect Stripe → Create agent → Publish

- [ ] **User Journey**
  1. Browse marketplace → View agent → Try free → Subscribe → Chat

- [ ] **Admin Journey**
  1. Sign in as admin → View agents → Suspend agent

#### 4.2 Third-Party Integrations
- [ ] Clerk authentication
- [ ] Stripe Checkout
- [ ] Stripe Connect
- [ ] Stripe Webhooks
- [ ] OpenAI API
- [ ] Supabase Database
- [ ] Supabase Storage

---

## 🐛 Identified Bugs

### Critical Bugs (P0)

1. **CORS Error for accounts.returnaddress.io**
   - **Status**: Active
   - **Impact**: Blocks authentication redirects
   - **Location**: Console errors when accessing protected routes
   - **Error**: `Access to fetch at 'https://accounts.returnaddress.io/sign-in...' has been blocked by CORS policy`
   - **Fix**: Verify Clerk DNS records and domain configuration in Clerk Dashboard

2. **Modal Backdrop Blocks Navigation**
   - **Status**: Active
   - **Impact**: Users cannot click navigation links when sign-in modal is open
   - **Location**: Sign-in modal backdrop intercepts clicks
   - **Fix**: Ensure modal backdrop only blocks clicks within modal, not entire page

### High Priority Bugs (P1)

3. **Missing Autocomplete Attributes**
   - **Status**: Active
   - **Impact**: Accessibility and UX (password managers)
   - **Location**: Password fields in Clerk sign-in form
   - **Error**: `Input elements should have autocomplete attributes (suggested: "current-password")`
   - **Fix**: Add `autocomplete="current-password"` to password fields (may require Clerk component customization)

4. **CSP Warning for accounts.returnaddress.io**
   - **Status**: Active
   - **Impact**: Potential security issue
   - **Location**: Console warning on accounts subdomain
   - **Error**: `'script-src' was not explicitly set, so 'default-src' is used as a fallback`
   - **Fix**: Configure Content Security Policy headers in Clerk Dashboard

### Medium Priority Bugs (P2)

5. **Empty Marketplace State**
   - **Status**: Active
   - **Impact**: UX - unclear messaging
   - **Location**: Homepage and `/marketplace` when no agents
   - **Current**: "No agents available yet. Check back soon!"
   - **Suggestion**: More informative message or call-to-action

6. **Error Handling for Database Failures**
   - **Status**: Partial
   - **Impact**: User experience during outages
   - **Location**: `app/page.tsx` has error handling, but other pages may not
   - **Fix**: Add consistent error handling across all database queries

### Low Priority Bugs (P3)

7. **Missing Loading States**
   - **Status**: Active
   - **Impact**: UX during slow operations
   - **Location**: Various forms and API calls
   - **Fix**: Add loading indicators for async operations

8. **No Error Boundaries**
   - **Status**: Active
   - **Impact**: Unhandled errors crash entire page
   - **Location**: React components
   - **Fix**: Add React Error Boundaries

---

## 📋 Testing Checklist Summary

### Quick Smoke Test (5 minutes)
- [ ] Homepage loads
- [ ] Sign-in modal opens
- [ ] Marketplace page loads
- [ ] Navigation works
- [ ] No console errors (except known CORS)

### Full Test Suite (30 minutes)
- [ ] All Phase 1 tests
- [ ] Critical bugs verified
- [ ] High priority bugs verified

### Comprehensive Test (2 hours)
- [ ] All phases complete
- [ ] All bugs documented
- [ ] Performance metrics recorded

---

## 🎯 Next Steps

1. **Immediate**: Fix CORS issue for accounts.returnaddress.io
2. **High Priority**: Fix modal backdrop blocking navigation
3. **High Priority**: Add autocomplete attributes
4. **Medium Priority**: Improve error handling
5. **Low Priority**: Add loading states and error boundaries

---

## 📝 Notes

- Sign-in fix is **partially successful** - production keys are loaded, but CORS issue persists
- Most core functionality appears to work based on code review
- Need end-to-end testing to verify all flows
- Database connection handling is good (error handling in place)
- Need to test with actual data (agents, subscriptions)

