# Runtime Debug Plan — Return Address

**Date:** 2025-01-XX
**Status:** Planning Phase
**Focus:** Runtime issues (not CI)

---

## Executive Summary

**CI Status:** ✅ Stable — CI is now the baseline contract and should not be modified further unless absolutely required.

**Runtime Issues Identified:**
1. **Create Agent NEXT_REDIRECT Bug** — Users see NEXT_REDIRECT error instead of redirect
2. **Clerk + CSP Worker Errors** — CSP blocking Clerk inline/worker scripts
3. **Routing + Middleware + CORS** — RSC prefetch → middleware → accounts.returnaddress.io → CORS error

**Approach:** Fix flows in code, not in CI. Add instrumentation, adjust CSP/middleware minimally, then verify.

---

## 1. CI Status Confirmation

### Current CI State

**Workflow:** `.github/workflows/ci.yml`
**Status:** ✅ Stable and operational
**Last Run:** Success (Run ID: 19320875846)
**Duration:** ~54 seconds

**CI Guarantees:**
- ✅ Prisma client generation
- ✅ Lint passes
- ✅ Build succeeds

**CI Does NOT Guarantee:**
- ❌ Runtime behavior correctness
- ❌ External integrations working (Clerk, Stripe, S3)
- ❌ Browser-level issues (CSP, CORS, RSC prefetch)
- ❌ Auth flow correctness

**Decision:** **Do not modify CI** unless absolutely required. CI is the baseline contract.

---

## 2. Issue #1: Create Agent NEXT_REDIRECT Bug

### Problem Description

**Symptom:** When creating an agent, users see a "NEXT_REDIRECT" error box instead of being redirected to the agent detail page.

**User Flow:**
1. User fills out agent creation form (`/creator/agents/new`)
2. User submits form (client-side)
3. API call to `/api/creator/agents` succeeds (returns `{ id, slug }`)
4. Client calls `router.push(`/creator/agents/${data.id}`)`
5. Browser navigates to `/creator/agents/[id]`
6. Server component (`app/creator/agents/[id]/page.tsx`) calls `requireCreator()`
7. If redirect occurs, ErrorBoundary catches NEXT_REDIRECT
8. ErrorBoundary displays error instead of allowing redirect

### Code Path Analysis

**Files Involved:**

1. **`app/creator/agents/new/NewAgentForm.tsx`** (Client Component)
   - Line 71: `router.push(`/creator/agents/${data.id}`)`
   - **Issue:** Uses `router.push()` which triggers client-side navigation
   - **Problem:** Server component renders before redirect completes

2. **`app/api/creator/agents/route.ts`** (API Route)
   - Line 25: `requireCreator()` — ensures user is creator
   - Line 82: Returns `{ id: agent.id, slug: agent.slug }`
   - **Status:** ✅ Working correctly

3. **`app/creator/agents/[id]/page.tsx`** (Server Component)
   - Line 31: Client component that loads agent
   - **Note:** This is a client component, so `requireCreator()` is not called here directly
   - **Wait:** Let me check if there's a server wrapper...

4. **`app/creator/agents/page.tsx`** (Server Component)
   - Line 11: `requireCreator()` — called on page load
   - **Potential Issue:** If user loses creator status between creation and navigation

5. **`app/components/ErrorBoundary.tsx`**
   - Lines 14-38: `isNextSpecialError()` — attempts to detect NEXT_REDIRECT
   - Lines 62-64: Returns `{ hasError: false }` for NEXT_REDIRECT
   - **Issue:** ErrorBoundary may still catch and display error before redirect completes

### Root Cause Hypothesis

**Primary Hypothesis:**
- `router.push()` triggers client-side navigation
- Server component (`/creator/agents/[id]/page.tsx`) renders
- If any server-side check fails (e.g., `requireCreator()` in a parent or middleware), redirect is thrown
- ErrorBoundary catches NEXT_REDIRECT before redirect completes
- Error is displayed to user

**Secondary Hypothesis:**
- Race condition: `router.push()` navigates before DB transaction commits
- Server component loads before agent exists
- Redirect or error occurs

### Proposed Fixes

#### Fix 1: Use `window.location.href` Instead of `router.push()` (Recommended)

**File:** `app/creator/agents/new/NewAgentForm.tsx`

**Change:**
```typescript
// Current (line 71):
router.push(`/creator/agents/${data.id}`);

// Proposed:
window.location.href = `/creator/agents/${data.id}`;
```

**Rationale:**
- Forces full page reload (same pattern as onboarding)
- Ensures server gets fresh data
- Redirects happen server-side before ErrorBoundary can catch them
- Prevents race conditions

**Similar Pattern:** Already used in `CreatorOnboardingForm.tsx` (line 42)

#### Fix 2: Add Logging/Instrumentation

**File:** `app/creator/agents/new/NewAgentForm.tsx`

**Add logging:**
```typescript
if (!data?.id) {
  setError("Unexpected response from server: missing agent id");
  setLoading(false);
  return;
}

// Log successful creation
console.log("[CREATE_AGENT] Agent created:", {
  agentId: data.id,
  slug: data.slug,
  userId: user?.id, // If available
  timestamp: new Date().toISOString(),
});

// Use window.location.href for full page reload
window.location.href = `/creator/agents/${data.id}`;
```

**File:** `app/creator/agents/[id]/page.tsx`

**Add logging in `useEffect`:**
```typescript
useEffect(() => {
  async function loadAgent() {
    try {
      console.log("[LOAD_AGENT] Loading agent:", {
        agentId,
        timestamp: new Date().toISOString(),
      });

      const response = await fetch(`/api/creator/agents/${agentId}`);

      console.log("[LOAD_AGENT] Response:", {
        status: response.status,
        ok: response.ok,
        timestamp: new Date().toISOString(),
      });

      if (!response.ok) {
        throw new Error("Failed to load agent");
      }
      // ... rest of code
    } catch (err) {
      console.error("[LOAD_AGENT] Error:", {
        error: err instanceof Error ? err.message : String(err),
        agentId,
        timestamp: new Date().toISOString(),
      });
      setError(err instanceof Error ? err.message : "Failed to load agent");
    }
  }
  // ... rest
}, [agentId]);
```

**File:** `app/api/creator/agents/[id]/route.ts`

**Add logging:**
```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireCreator();

    console.log("[GET_AGENT] Request:", {
      agentId: params.id,
      userId: user.id,
      isCreator: user.isCreator,
      timestamp: new Date().toISOString(),
    });

    // ... rest of handler
  } catch (error) {
    console.error("[GET_AGENT] Error:", {
      agentId: params.id,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
    // ... error handling
  }
}
```

**File:** `app/components/ErrorBoundary.tsx`

**Enhance logging:**
```typescript
componentDidCatch(error: any, errorInfo: any) {
  // If we somehow catch a Next.js special error here, don't log it
  if (isNextSpecialError(error) || isClerkError(error)) {
    // Don't log Next.js redirect errors - they're expected
    return;
  }

  // Enhanced logging for real errors
  console.error("[ERROR_BOUNDARY] Caught error:", {
    error: {
      name: error?.name,
      message: error?.message,
      digest: error?.digest,
      stack: error?.stack,
    },
    errorInfo: {
      componentStack: errorInfo?.componentStack,
    },
    timestamp: new Date().toISOString(),
  });

  console.error("ErrorBoundary caught error:", error, errorInfo);
}
```

#### Fix 3: Verify Agent Exists Before Navigation (Defensive)

**File:** `app/creator/agents/new/NewAgentForm.tsx`

**Add verification:**
```typescript
if (!data?.id) {
  setError("Unexpected response from server: missing agent id");
  setLoading(false);
  return;
}

// Verify agent was created before navigating
try {
  const verifyRes = await fetch(`/api/creator/agents/${data.id}`);
  if (!verifyRes.ok) {
    throw new Error("Agent not found after creation");
  }

  console.log("[CREATE_AGENT] Agent verified, navigating...");
  window.location.href = `/creator/agents/${data.id}`;
} catch (verifyErr) {
  console.error("[CREATE_AGENT] Verification failed:", verifyErr);
  setError("Agent created but verification failed. Please refresh the page.");
  setLoading(false);
}
```

**Note:** This adds an extra API call but provides better error handling.

### Testing Plan

**Local Dev Testing:**
1. **Test Create Agent Flow:**
   ```bash
   # 1. Sign in as creator
   # 2. Navigate to /creator/agents/new
   # 3. Fill out form
   # 4. Submit
   # 5. Check browser console for logs
   # 6. Verify redirect to /creator/agents/[id] without error
   ```

2. **Test Error Scenarios:**
   - Create agent while not authenticated (should redirect to sign-in)
   - Create agent while not creator (should redirect to onboarding)
   - Create agent with invalid spec (should show error, no redirect)

3. **Check Logs:**
   - Browser console: Look for `[CREATE_AGENT]` and `[LOAD_AGENT]` logs
   - Server logs: Look for `[GET_AGENT]` logs
   - Verify no NEXT_REDIRECT errors in ErrorBoundary

**Production Testing:**
1. Deploy changes
2. Test create agent flow on production
3. Monitor error logs for NEXT_REDIRECT occurrences
4. Verify no user reports of NEXT_REDIRECT errors

---

## 3. Issue #2: Clerk + CSP Worker Errors

### Problem Description

**Symptom:** CSP blocking Clerk inline/worker scripts, causing Clerk functionality to break.

**Evidence:**
- Browser console shows CSP violations for Clerk scripts
- Clerk workers blocked by CSP
- Clerk modals/components not loading correctly

### Code Path Analysis

**Files Involved:**

1. **`next.config.js`** (CSP Configuration)
   - Lines 10-20: Content-Security-Policy headers
   - **Current CSP:**
     - `script-src`: `'self' 'unsafe-inline' 'unsafe-eval' https://clerk.returnaddress.io https://*.clerk.services https://challenges.cloudflare.com`
     - `worker-src`: `'self' blob:`
   - **Issue:** May be missing nonce support or specific Clerk worker requirements

2. **`app/layout.tsx`** (Root Layout)
   - Lines 33-37: ClerkProvider configuration
   - **Issue:** May need nonce support for inline scripts

### Root Cause Hypothesis

**Primary Hypothesis:**
- CSP is too strict for Clerk's inline scripts and workers
- Missing nonce-based script support
- `blob:` workers may not be sufficient for Clerk's worker requirements

**Secondary Hypothesis:**
- Clerk v5 requirements changed
- CSP needs updates for latest Clerk patterns

### Proposed Fixes

#### Fix 1: Audit CSP Against Clerk v5 Requirements

**Action:** Review Clerk v5 CSP documentation and update `next.config.js`

**Current CSP:**
```javascript
"script-src 'self' 'unsafe-inline' 'unsafe-eval' https://clerk.returnaddress.io https://*.clerk.services https://challenges.cloudflare.com",
"worker-src 'self' blob:",
```

**Potential Updates:**
1. **Add nonce support** (if Clerk requires it):
   ```javascript
   // Generate nonce in middleware or layout
   // Add to script-src: 'nonce-{nonce}'
   ```

2. **Verify worker-src:**
   - Ensure `blob:` is included (already present)
   - May need `https://clerk.returnaddress.io` in worker-src

3. **Check connect-src:**
   - Already includes Clerk domains ✅

**File:** `next.config.js`

**Proposed Update:**
```javascript
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://clerk.returnaddress.io https://*.clerk.services https://challenges.cloudflare.com",
            "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
            "img-src 'self' https://img.clerk.com data:",
            "font-src 'self' data:",
            "connect-src 'self' https://clerk.returnaddress.io https://*.clerk.services",
            "frame-src 'self' https://clerk.returnaddress.io https://*.clerk.services",
            "worker-src 'self' blob: https://clerk.returnaddress.io", // Added Clerk domain
          ].join('; '),
        },
      ],
    },
  ];
}
```

#### Fix 2: Add CSP Violation Logging

**File:** `app/layout.tsx`

**Add CSP violation reporting (development only):**
```typescript
useEffect(() => {
  if (process.env.NODE_ENV === 'development') {
    // Log CSP violations in development
    const reportViolation = (e: SecurityPolicyViolationEvent) => {
      console.warn('[CSP_VIOLATION]', {
        violatedDirective: e.violatedDirective,
        blockedURI: e.blockedURI,
        documentURI: e.documentURI,
        sourceFile: e.sourceFile,
        timestamp: new Date().toISOString(),
      });
    };

    document.addEventListener('securitypolicyviolation', reportViolation);

    return () => {
      document.removeEventListener('securitypolicyviolation', reportViolation);
    };
  }
}, []);
```

**Note:** This requires adding `report-uri` or `report-to` to CSP (or use browser console in dev).

#### Fix 3: Verify Clerk Integration

**Action:** Check Clerk v5 documentation for latest CSP requirements

**Checklist:**
- [ ] Review Clerk v5 CSP documentation
- [ ] Verify nonce requirements
- [ ] Check worker-src requirements
- [ ] Test Clerk modal/component loading
- [ ] Verify no CSP violations in browser console

### Testing Plan

**Local Dev Testing:**
1. **Test Clerk Modal:**
   ```bash
   # 1. Open browser DevTools → Console
   # 2. Navigate to homepage
   # 3. Click "Sign in" button
   # 4. Check for CSP violations in console
   # 5. Verify Clerk modal loads correctly
   ```

2. **Test CSP Headers:**
   ```bash
   # Check response headers
   curl -I http://localhost:3000 | grep -i "content-security-policy"
   ```

3. **Monitor CSP Violations:**
   - Watch browser console for CSP violations
   - Note which directives are violated
   - Update CSP accordingly

**Production Testing:**
1. Deploy CSP updates
2. Test Clerk functionality on production
3. Monitor error logs for CSP violations
4. Verify Clerk modals/components work correctly

---

## 4. Issue #3: Routing + Middleware + CORS

### Problem Description

**Symptom:** RSC prefetch → middleware → accounts.returnaddress.io → CORS error

**User Flow:**
1. User clicks link to `/creator/onboarding` (signed out)
2. Next.js RSC prefetch triggers (`?_rsc=...`)
3. Middleware intercepts request
4. Middleware redirects to `/sign-in` with `redirect_url` param
5. Clerk redirects to `accounts.returnaddress.io/sign-in`
6. Cross-origin redirect causes CORS error
7. Browser console shows CORS error (noise, but confusing)

### Code Path Analysis

**Files Involved:**

1. **`middleware.ts`** (Middleware)
   - Lines 10-25: `clerkMiddleware` with route protection
   - Line 19: Creates sign-in URL with `redirect_url` param
   - Line 21: `NextResponse.redirect(signInUrl)`
   - **Issue:** Redirects RSC prefetch requests, causing CORS

2. **`app/page.tsx`** (Homepage)
   - May have Link to `/creator/onboarding` with prefetch enabled
   - **Issue:** RSC prefetch triggers middleware redirect

### Root Cause Hypothesis

**Primary Hypothesis:**
- Next.js RSC prefetch requests are intercepted by middleware
- Middleware redirects to `/sign-in` (same origin)
- Clerk then redirects to `accounts.returnaddress.io` (cross-origin)
- Browser blocks cross-origin RSC prefetch
- CORS error appears (but fallback navigation works)

**Secondary Hypothesis:**
- Middleware should skip RSC prefetch requests
- Or handle them differently (return 401 instead of redirect)

### Proposed Fixes

#### Fix 1: Guard RSC Prefetch Requests in Middleware

**File:** `middleware.ts`

**Proposed Update:**
```typescript
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/creator(.*)",
  "/admin(.*)",
  "/api/creator(.*)",
]);

export default clerkMiddleware((auth, req) => {
  // Skip middleware for RSC prefetch requests to avoid CORS issues
  const isRscPrefetch = req.headers.get("rsc") === "1" ||
                        req.nextUrl.searchParams.has("_rsc");

  if (isRscPrefetch) {
    // For RSC prefetch, just check auth but don't redirect
    // Let the actual navigation handle auth
    const { userId } = auth();
    if (!userId && isProtectedRoute(req)) {
      // Return 401 instead of redirect for RSC prefetch
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  if (!isProtectedRoute(req)) {
    return NextResponse.next();
  }

  const { userId } = auth();

  if (!userId) {
    // Redirect to /sign-in on primary domain (not accounts.returnaddress.io)
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|.*\\..*).*)",
    "/(api|trpc)(.*)",
  ],
};
```

**Alternative:** Skip middleware entirely for RSC prefetch:
```typescript
if (isRscPrefetch) {
  // Skip middleware for RSC prefetch - let actual navigation handle auth
  return NextResponse.next();
}
```

#### Fix 2: Disable Prefetch on Protected Links

**File:** `app/page.tsx` (or wherever links to `/creator/onboarding` exist)

**Check for:**
```typescript
<Link href="/creator/onboarding" prefetch={false}>
  Become a creator
</Link>
```

**Status:** May already be set (check existing code)

#### Fix 3: Add Logging to Middleware

**File:** `middleware.ts`

**Add logging:**
```typescript
export default clerkMiddleware((auth, req) => {
  const isRscPrefetch = req.headers.get("rsc") === "1" ||
                        req.nextUrl.searchParams.has("_rsc");

  if (isRscPrefetch) {
    console.log("[MIDDLEWARE] RSC prefetch detected:", {
      url: req.url,
      pathname: req.nextUrl.pathname,
      timestamp: new Date().toISOString(),
    });
  }

  // ... rest of middleware logic
});
```

### Testing Plan

**Local Dev Testing:**
1. **Test RSC Prefetch:**
   ```bash
   # 1. Open browser DevTools → Network
   # 2. Filter by "Fetch/XHR"
   # 3. Navigate to homepage
   # 4. Hover over "Become a creator" link
   # 5. Check for RSC prefetch request
   # 6. Verify no CORS error (or handled gracefully)
   ```

2. **Test Middleware Behavior:**
   - Signed out: Click link to `/creator/onboarding`
   - Check middleware logs
   - Verify redirect works without CORS error

3. **Check Browser Console:**
   - Look for CORS errors
   - Verify they're handled or eliminated

**Production Testing:**
1. Deploy middleware updates
2. Test protected route navigation
3. Monitor for CORS errors
4. Verify navigation works correctly

---

## 5. Implementation Priority

### Phase 1: Create Agent NEXT_REDIRECT (High Priority)

**Why First:**
- Direct user impact (blocks agent creation)
- Clear fix path (use `window.location.href`)
- Similar pattern already exists (onboarding)

**Steps:**
1. Update `NewAgentForm.tsx` to use `window.location.href`
2. Add logging/instrumentation
3. Test locally
4. Deploy and verify

**Estimated Time:** 1-2 hours

### Phase 2: Clerk + CSP (Medium Priority)

**Why Second:**
- Affects authentication (critical)
- May require Clerk docs review
- CSP changes need careful testing

**Steps:**
1. Review Clerk v5 CSP documentation
2. Update `next.config.js` CSP
3. Add CSP violation logging (dev)
4. Test Clerk functionality
5. Deploy and verify

**Estimated Time:** 2-3 hours

### Phase 3: Routing + Middleware + CORS (Low Priority)

**Why Third:**
- Mostly noise (fallback navigation works)
- Less critical than other issues
- Can be addressed after core flows work

**Steps:**
1. Update middleware to handle RSC prefetch
2. Add logging
3. Test navigation flows
4. Deploy and verify

**Estimated Time:** 1-2 hours

---

## 6. Logging Strategy

### Logging Levels

**Development:**
- Verbose logging for all operations
- CSP violation logging
- Middleware request logging
- ErrorBoundary error logging

**Production:**
- Error-level logging only
- Critical operation logging (create agent, auth flows)
- No verbose/debug logs

### Log Format

**Standard Format:**
```typescript
console.log("[COMPONENT] Action:", {
  // Context
  userId?: string,
  agentId?: string,
  // Action details
  action: "create_agent" | "load_agent" | "redirect",
  // Status
  status: "success" | "error" | "redirect",
  // Error details (if error)
  error?: string,
  // Timestamp
  timestamp: new Date().toISOString(),
});
```

### Log Locations

**Client-Side:**
- Browser console (development)
- Error tracking service (production) — if configured

**Server-Side:**
- Server logs (Vercel logs)
- Error tracking service (production) — if configured

---

## 7. Testing Checklist

### Create Agent Flow

- [ ] **Happy Path:**
  - [ ] Sign in as creator
  - [ ] Navigate to `/creator/agents/new`
  - [ ] Fill out form completely
  - [ ] Submit form
  - [ ] Verify redirect to `/creator/agents/[id]` without error
  - [ ] Verify agent loads correctly
  - [ ] Check browser console for logs

- [ ] **Error Scenarios:**
  - [ ] Submit with invalid spec (should show error, no redirect)
  - [ ] Submit while not authenticated (should redirect to sign-in)
  - [ ] Submit while not creator (should redirect to onboarding)

- [ ] **Edge Cases:**
  - [ ] Create agent with duplicate name (should append timestamp)
  - [ ] Create agent immediately after onboarding (should work)
  - [ ] Create multiple agents in quick succession

### Clerk + CSP

- [ ] **Clerk Modal:**
  - [ ] Click "Sign in" button
  - [ ] Verify modal opens
  - [ ] Check browser console for CSP violations
  - [ ] Complete sign-in flow
  - [ ] Verify no CSP errors

- [ ] **Clerk Components:**
  - [ ] UserButton renders correctly
  - [ ] SignInButton works
  - [ ] No CSP violations in console

### Routing + Middleware

- [ ] **Protected Routes:**
  - [ ] Navigate to `/creator/onboarding` (signed out)
  - [ ] Verify redirect to sign-in
  - [ ] Check for CORS errors in console
  - [ ] Complete sign-in
  - [ ] Verify redirect back to onboarding

- [ ] **RSC Prefetch:**
  - [ ] Hover over protected route links
  - [ ] Check Network tab for RSC prefetch
  - [ ] Verify no CORS errors
  - [ ] Verify navigation works correctly

---

## 8. Success Criteria

### Create Agent Flow

**Success:**
- ✅ Users can create agents without seeing NEXT_REDIRECT errors
- ✅ Redirect to agent detail page works smoothly
- ✅ Logs provide clear debugging information
- ✅ Error handling is graceful

**Metrics:**
- Zero NEXT_REDIRECT errors in production logs
- Zero user reports of NEXT_REDIRECT errors
- 100% successful agent creation rate (excluding validation errors)

### Clerk + CSP

**Success:**
- ✅ No CSP violations in browser console
- ✅ Clerk modals/components load correctly
- ✅ Authentication flows work smoothly

**Metrics:**
- Zero CSP violations in production
- Zero Clerk-related errors
- 100% successful authentication rate

### Routing + Middleware

**Success:**
- ✅ No CORS errors in browser console
- ✅ Protected route navigation works correctly
- ✅ RSC prefetch handled gracefully

**Metrics:**
- Zero CORS errors in production
- Zero middleware-related errors
- 100% successful navigation rate

---

## 9. Next Steps

### Immediate Actions

1. **Review this plan** with team/stakeholders
2. **Prioritize issues** (recommended: Create Agent → Clerk → Routing)
3. **Implement fixes** one at a time
4. **Test thoroughly** before moving to next issue

### Implementation Order

1. **Phase 1:** Create Agent NEXT_REDIRECT fix
   - Update `NewAgentForm.tsx`
   - Add logging
   - Test and deploy

2. **Phase 2:** Clerk + CSP fix
   - Review Clerk docs
   - Update CSP
   - Test and deploy

3. **Phase 3:** Routing + Middleware fix
   - Update middleware
   - Test and deploy

### Documentation Updates

After fixes are deployed:
- Update `PROJECT_DOCUMENTATION.md` with runtime testing procedures
- Update `CI_STATUS_REPORT.md` to clarify CI vs runtime scope
- Create `RUNTIME_TESTING.md` for ongoing runtime testing

---

## 10. Notes

### CI vs Runtime

**Important:** CI verifies build integrity, not runtime correctness. Runtime issues should be fixed in code, not CI.

**CI Scope:**
- ✅ Code quality (lint)
- ✅ Build integrity (build)
- ✅ Schema validation (Prisma)

**Runtime Scope:**
- ✅ User flows (auth, agent creation)
- ✅ External integrations (Clerk, Stripe)
- ✅ Browser behavior (CSP, CORS)

### Jules Integration

**When to Use Jules:**
- Multi-file refactors
- Mechanical changes (renames, docs)
- Test generation

**When NOT to Use Jules:**
- CI workflow changes (CI is stable)
- Critical bug fixes (do manually with logging)
- CSP/middleware changes (need careful testing)

---

**Plan Status:** Ready for Implementation
**Next Action:** Review and prioritize, then implement Phase 1 (Create Agent fix)

