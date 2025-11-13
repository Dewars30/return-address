# Live Runtime Audit - Production Testing Results

**Date:** 2025-01-10
**Target:** https://returnaddress.io
**Status:** Partial - Cloudflare challenges block automated authenticated testing

---

## Test Results

### ✅ 1. Homepage (`/`)
- **Status:** PASS
- **Network:** `GET / => [200]`
- **Console:** No errors
- **Findings:** Page loads correctly, shows "No agents available yet" (expected)

### ✅ 2. Marketplace (`/marketplace`)
- **Status:** PASS
- **Network:** `GET /marketplace => [200]`
- **Console:** No errors
- **Findings:** Page loads correctly, empty state displayed

### ✅ 3. Sign-in Modal
- **Status:** PASS
- **Action:** Clicked "Sign in" button
- **Result:** Modal opens correctly
- **Network:** Clerk loads from `clerk.returnaddress.io` - all [200]
- **Console:** Only VERBOSE DOM warning about autocomplete (not an error)
- **Findings:** Clerk integration working correctly

### ⚠️ 4. Become a Creator - Signed Out
- **Status:** CORS ERROR (Expected/Noise)
- **Action:** Clicked "Become a creator" link
- **Network:**
  - `GET /creator/onboarding?_rsc=8kzk2 => [307]` (RSC prefetch)
  - Redirects to `accounts.returnaddress.io/sign-in => [403]` (Cloudflare challenge)
- **Console:**
  - `Access to fetch at 'https://accounts.returnaddress.io/sign-in...' has been blocked by CORS policy`
  - `Failed to fetch RSC payload for https://returnaddress.io/creator/onboarding. Falling back to browser navigation.`
- **Findings:**
  - Next.js RSC prefetch triggers middleware redirect to Clerk sign-in
  - Cross-origin redirect causes CORS error
  - Fallback to browser navigation works (user can still navigate)
  - `prefetch={false}` is set on homepage link (line 68 of `app/page.tsx`)
  - This is expected behavior per instructions: "classify as noise"

### ❌ 5. Authenticated Flows
- **Status:** BLOCKED
- **Reason:** Cloudflare challenges on `accounts.returnaddress.io` prevent automated browser access
- **Impact:** Cannot test:
  - Creator onboarding completion
  - Creator dashboard access
  - Agent creation
  - Stripe Connect
  - Agent publishing
  - Subscribe flow

---

## Issues Found

### [ISSUE] CORS error on RSC prefetch for protected route

**Evidence:**
- Console: `"Access to fetch at 'https://accounts.returnaddress.io/sign-in?redirect_url=...' from origin 'https://returnaddress.io' has been blocked by CORS policy"`
- Console: `"Failed to fetch RSC payload for https://returnaddress.io/creator/onboarding. Falling back to browser navigation."`
- Network: `GET https://returnaddress.io/creator/onboarding?_rsc=8kzk2 => [307]` (redirects to accounts.returnaddress.io)
- Network: `GET https://accounts.returnaddress.io/sign-in?redirect_url=... => [403]` (Cloudflare challenge)

**Suspected cause:**
- Next.js RSC prefetch attempts to fetch `/creator/onboarding` even with `prefetch={false}` set
- Middleware redirects unauthenticated requests to `accounts.returnaddress.io/sign-in`
- Cross-origin redirect triggers CORS error
- Fallback to browser navigation works, but creates console errors

**Impact:**
- Console noise (errors logged)
- Fallback works, so user can still navigate
- May confuse monitoring tools

**Status:** Expected behavior per instructions ("classify as noise"). Navigation still works via fallback.

**Code location:**
- `app/page.tsx:68` - Link already has `prefetch={false}`
- `middleware.ts:18` - Redirects unauthenticated requests

**Fix consideration:**
- Could detect RSC prefetch requests in middleware and skip redirect
- But this is complex and may break auth flow
- Current behavior is acceptable (fallback works)

---

## Code Verification (from previous audit)

All authenticated flow code has been verified:
- ✅ Creator onboarding API (`app/api/creator/onboard/route.ts`)
- ✅ Creator onboarding form (`app/creator/onboarding/CreatorOnboardingForm.tsx`)
- ✅ Agent creation API (`app/api/creator/agents/route.ts`)
- ✅ Agent publishing API (`app/api/creator/agents/[id]/publish/route.ts`)
- ✅ Stripe Connect API (`app/api/creator/stripe/connect/route.ts`)
- ✅ Subscribe API (`app/api/agents/[slug]/subscribe/route.ts`)
- ✅ Creator dashboard (`app/creator/agents/page.tsx`)

All routes:
- ✅ Use correct auth guards (`requireAuth()`, `requireCreator()`)
- ✅ Enforce ownership checks
- ✅ Return proper error responses
- ✅ Marked as `dynamic = "force-dynamic"`

---

## Build Verification

```bash
✅ npm run lint → No ESLint warnings or errors
✅ npm run build → Build successful
```

---

## Next Steps

**Manual Testing Required:**
1. Sign in via modal (bypass Cloudflare challenge manually)
2. Complete creator onboarding flow
3. Test creator dashboard access
4. Create and publish an agent
5. Test Stripe Connect flow
6. Test subscribe flow

**No code changes needed** - all code paths verified correct. Only manual testing blocked by Cloudflare challenges.

