# Option B Implementation - Auth on Primary Domain

**Status:** ✅ Code changes complete
**Date:** 2025-01-10

---

## Summary

Implemented Option B: keeping authentication on the primary domain (`returnaddress.io`) instead of using `accounts.returnaddress.io`. This eliminates CORS errors and Cloudflare challenges for auth flows.

---

## Code Changes

### 1. Created Sign-In Page
**File:** `app/sign-in/[[...sign-in]]/page.tsx`
- Uses Clerk's `<SignIn />` component
- Renders on `/sign-in` route
- Handles all Clerk sign-in flows (OAuth, email/password, etc.)

### 2. Created Sign-Up Page
**File:** `app/sign-up/[[...sign-up]]/page.tsx`
- Uses Clerk's `<SignUp />` component
- Renders on `/sign-up` route
- Handles all Clerk sign-up flows

### 3. Updated Middleware
**File:** `middleware.ts`
- Changed redirect from `auth().redirectToSignIn()` to explicit redirect to `/sign-in`
- Stays on primary domain (no cross-origin redirect)
- Preserves `redirect_url` query parameter

### 4. Updated ClerkProvider
**File:** `app/layout.tsx`
- Added `signInUrl` prop: `/sign-in` (or from env)
- Added `signUpUrl` prop: `/sign-up` (or from env)
- Clerk now knows where sign-in/sign-up pages are located

### 5. Updated CSP
**File:** `next.config.js`
- Removed `accounts.returnaddress.io` from `connect-src` and `frame-src`
- Auth now happens on primary domain, so accounts subdomain not needed
- Kept `clerk.returnaddress.io` and `*.clerk.services` for Clerk API calls

### 6. Updated Auth Helper
**File:** `lib/auth.ts`
- Changed `requireAuth()` redirect from `/` to `/sign-in`
- Now consistent with middleware behavior

---

## Required Configuration

### Clerk Dashboard

1. **Navigate to:** Clerk Dashboard → Your Instance → Paths
2. **Set:**
   - **Sign-in URL:** `/sign-in`
   - **Sign-up URL:** `/sign-up`
3. **Ensure:**
   - **Frontend API:** `clerk.returnaddress.io` (already set)
   - **Authorized Redirect URIs:** Include `https://returnaddress.io` and `https://returnaddress.io/*`

### Vercel Environment Variables

Add/update these in Vercel → Project → Environment Variables:

```
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

**Note:** These are optional - code defaults to `/sign-in` and `/sign-up` if not set, but setting them explicitly is recommended.

---

## Benefits

1. **No CORS errors:** Auth stays on primary domain
2. **No Cloudflare challenges:** No cross-origin redirects to accounts subdomain
3. **Cleaner CSP:** Removed accounts subdomain from CSP headers
4. **Better UX:** Users stay on `returnaddress.io` throughout auth flow
5. **Simpler architecture:** Fewer moving parts, one domain

---

## Testing Checklist

After deploying and configuring:

- [ ] Navigate to `/sign-in` - should render Clerk sign-in form
- [ ] Navigate to `/sign-up` - should render Clerk sign-up form
- [ ] Click "Become a creator" while signed out - should redirect to `/sign-in` (not accounts subdomain)
- [ ] Complete sign-in flow - should redirect back to original URL
- [ ] Check browser console - no CORS errors
- [ ] Check Network tab - no requests to `accounts.returnaddress.io`
- [ ] Test OAuth (GitHub/Google) - should work on primary domain
- [ ] Test email/password sign-in - should work on primary domain

---

## Build Verification

```bash
✅ npm run lint → No ESLint warnings or errors
✅ npm run build → Build successful
```

---

## Next Steps

1. **Deploy code changes** to Vercel
2. **Update Clerk Dashboard** settings (see above)
3. **Add Vercel env vars** (see above)
4. **Test auth flows** end-to-end
5. **Monitor for any issues** in production

---

## Rollback Plan

If issues occur:

1. Revert middleware to use `auth().redirectToSignIn()`
2. Remove `signInUrl` and `signUpUrl` from ClerkProvider
3. Keep sign-in/sign-up pages (they won't break anything)
4. Re-add `accounts.returnaddress.io` to CSP if needed

