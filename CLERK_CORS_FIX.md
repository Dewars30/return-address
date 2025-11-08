# Clerk CORS Fix - Required Configuration

## Issue
CORS errors occur when accessing `/creator/onboarding` because Clerk needs to be configured with the production domain.

## Solution

### Step 1: Configure Clerk Dashboard

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Go to **Domains** section
4. Add `returnaddress.io` as an allowed domain
5. Ensure the domain is verified (DNS records should already be set up)

### Step 2: Verify Environment Variables

Ensure these are set in Vercel (production keys, not development):

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx  # Production key
CLERK_SECRET_KEY=sk_live_xxx                   # Production key
NEXT_PUBLIC_APP_URL=https://returnaddress.io
```

### Step 3: Check Clerk Instance

The error shows Clerk is using `glorious-wallaby-90.clerk.accounts.dev` which appears to be a development instance.

**Action Required:**
- Verify you're using **production Clerk keys** (`pk_live_` and `sk_live_`)
- Not development keys (`pk_test_` and `sk_test_`)

### Step 4: Domain Configuration

The `ClerkProvider` in `app/layout.tsx` now includes:
```tsx
domain={domain}  // Extracts "returnaddress.io" from NEXT_PUBLIC_APP_URL
```

This ensures Clerk uses the correct domain for authentication.

## After Configuration

1. Redeploy the application
2. Test the `/creator/onboarding` route
3. CORS errors should be resolved

