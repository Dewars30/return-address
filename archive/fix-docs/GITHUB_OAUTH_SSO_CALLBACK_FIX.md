# GitHub OAuth SSO Callback Error - Final Fix

## 🚨 Critical Error Identified

**Error:** `sign-in#/sso-callback:1 Uncaught (in promise) Error: A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received`

**URL Pattern:** `accounts.returnaddress.io/sign-in#/sso-callback`

**Root Cause:**
- OAuth callback is redirecting to `accounts.returnaddress.io/sign-in#/sso-callback`
- Clerk is trying to process the callback but failing
- The `#/sso-callback` hash suggests Clerk's internal callback handler is being triggered
- Error suggests URL construction is failing

## 🔍 Analysis

### What's Happening:

1. User clicks "Sign in with GitHub" ✅
2. Redirects to GitHub ✅
3. User authorizes ✅
4. GitHub redirects to: `clerk.returnaddress.io/v1/oauth_callback?code=...&state=...` ✅
5. **Clerk processes callback and redirects to:** `accounts.returnaddress.io/sign-in#/sso-callback` ❌
6. **Clerk tries to handle callback but fails** ❌

### The Problem:

Clerk is redirecting to the **accounts subdomain** (`accounts.returnaddress.io`) instead of back to the main site (`returnaddress.io`). This happens because:

1. **ClerkProvider Configuration:** Missing explicit redirect configuration
2. **Account Portal Domain:** Clerk is using `accounts.returnaddress.io` as the default redirect
3. **Callback Handler:** Clerk's callback handler is failing on the accounts subdomain

## ✅ Solution: Fix ClerkProvider Configuration

### Fix 1: Remove signInUrl/signUpUrl (They Force Redirects)

**Problem:** Setting `signInUrl="/sign-in"` tells Clerk to redirect to that path, which might be causing the accounts subdomain redirect.

**Solution:** Remove `signInUrl` and `signUpUrl` from ClerkProvider. Let Clerk use its default modal behavior.

### Fix 2: Use Clerk's Built-in Modal Mode

Clerk's `SignInButton` with `mode="modal"` should handle everything automatically. We don't need explicit URLs.

### Fix 3: Ensure After Sign-In Redirects Work

Keep `afterSignInUrl` and `afterSignUpUrl` to ensure redirects go to the main site.

## 🔧 Updated Configuration

### app/layout.tsx
```tsx
<ClerkProvider
  publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
  afterSignInUrl={appUrl}
  afterSignUpUrl={appUrl}
>
```

**Remove:**
- `signInUrl="/sign-in"` ❌ (causes redirects)
- `signUpUrl="/sign-up"` ❌ (causes redirects)

**Keep:**
- `afterSignInUrl` ✅ (redirects after successful auth)
- `afterSignUpUrl` ✅ (redirects after successful sign-up)

### app/components/Nav.tsx
```tsx
<SignInButton mode="modal">
  <button>Sign in</button>
</SignInButton>
```

**Remove:**
- `forceRedirectUrl={false}` ❌ (not needed, modal handles it)

## 🎯 Expected Behavior After Fix

1. User clicks "Sign in" → Modal opens ✅
2. User clicks "Sign in with GitHub" → Redirects to GitHub ✅
3. User authorizes → GitHub redirects to Clerk callback ✅
4. Clerk processes → Redirects to `returnaddress.io` (NOT accounts subdomain) ✅
5. User is signed in ✅

## 📋 Verification Steps

After deployment:

1. **Test Modal:**
   - Go to `https://returnaddress.io`
   - Click "Sign in"
   - Modal should open (no redirect)

2. **Test GitHub OAuth:**
   - Click "Sign in with GitHub" in modal
   - Authorize on GitHub
   - Should redirect back to `returnaddress.io` (NOT `accounts.returnaddress.io`)
   - User should be signed in

3. **Check URL:**
   - Should NOT see `#/sso-callback` in URL
   - Should NOT redirect to accounts subdomain
   - Should stay on `returnaddress.io`

---

**Status:** Fixing ClerkProvider configuration to prevent accounts subdomain redirect

