# GitHub OAuth Callback Issue - Root Cause Analysis

## 🔍 Investigation Summary

### ✅ What's Working

1. **GitHub OAuth Redirect**: ✅ WORKING
   - Button click successfully triggers OAuth flow
   - Redirects to: `https://github.com/login/oauth/authorize?...`
   - OAuth parameters are correct:
     - Client ID: `Iv23lisowRem8vY0JKAa`
     - Redirect URI: `https://clerk.returnaddress.io/v1/oauth_callback` ✅
     - Scope: `user:email read:user` ✅
     - State parameter present ✅

2. **Clerk Configuration**: ✅ VERIFIED
   - GitHub OAuth provider is enabled in Clerk
   - Found in `identification_strategies`: `["oauth_github", "oauth_google"]`
   - Clerk environment API confirms GitHub is configured

3. **Callback Endpoint**: ✅ ACCESSIBLE
   - `https://clerk.returnaddress.io/v1/oauth_callback` is reachable
   - Returns 405 for HEAD (expected - endpoint requires POST)

### ⚠️ The Problem

**The OAuth flow works up to GitHub authorization, but fails AFTER user authorizes.**

## 🔍 Most Likely Root Causes

### Issue 1: Missing or Incorrect Redirect URL After Callback

**Problem:** After Clerk processes the OAuth callback, it needs to redirect back to your site. If `NEXT_PUBLIC_APP_URL` is not set correctly, Clerk might redirect to the wrong URL or fail.

**Check:**
```bash
# Verify NEXT_PUBLIC_APP_URL is set in Vercel
vercel env ls | grep NEXT_PUBLIC_APP_URL
```

**Should be:**
```
NEXT_PUBLIC_APP_URL=https://returnaddress.io
```

**Fix:** If missing or incorrect, update in Vercel Dashboard → Settings → Environment Variables

### Issue 2: ClerkProvider Missing Redirect URLs

**Problem:** `ClerkProvider` might need explicit `afterSignInUrl` and `afterSignUpUrl` props to ensure correct redirects after OAuth.

**Current Code:**
```tsx
<ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
```

**Fix:** Add explicit redirect URLs:
```tsx
<ClerkProvider 
  publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
  afterSignInUrl="/"
  afterSignUpUrl="/"
>
```

### Issue 3: OAuth Callback Processing Error

**Problem:** Clerk might be failing to process the OAuth callback due to:
- Invalid state parameter
- Callback URL mismatch
- Session creation failure
- User sync failure

**Check:** Clerk Dashboard → Logs for OAuth callback errors

### Issue 4: Domain Configuration Issue

**Problem:** Clerk might not recognize `returnaddress.io` as a valid redirect domain.

**Check:** Clerk Dashboard → Domains → ensure `returnaddress.io` is added and verified

## 🔧 Immediate Fixes to Try

### Fix 1: Add Explicit Redirect URLs to ClerkProvider

Update `app/layout.tsx`:

```tsx
<ClerkProvider 
  publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
  afterSignInUrl={process.env.NEXT_PUBLIC_APP_URL || "https://returnaddress.io"}
  afterSignUpUrl={process.env.NEXT_PUBLIC_APP_URL || "https://returnaddress.io"}
>
```

### Fix 2: Verify NEXT_PUBLIC_APP_URL

Ensure `NEXT_PUBLIC_APP_URL=https://returnaddress.io` is set in Vercel environment variables.

### Fix 3: Check Clerk Dashboard Logs

1. Go to Clerk Dashboard → Logs
2. Look for OAuth callback errors
3. Check for:
   - Failed OAuth callbacks
   - Invalid redirect URIs
   - Session creation errors

### Fix 4: Verify Domain in Clerk Dashboard

1. Go to Clerk Dashboard → Domains
2. Ensure `returnaddress.io` is listed
3. Verify domain is verified (green checkmark)
4. Check redirect URLs include `https://returnaddress.io`

## 🧪 Testing Steps

1. **Test OAuth Flow Manually:**
   - Go to `https://returnaddress.io`
   - Click "Sign in" → "Sign in with GitHub"
   - Authorize on GitHub
   - **Watch for errors** after redirect back
   - Check browser console for errors
   - Check network tab for failed requests

2. **Check Browser Console:**
   - Look for JavaScript errors
   - Look for Clerk errors
   - Look for network errors

3. **Check Network Tab:**
   - After GitHub authorization, watch for:
     - Callback request to `clerk.returnaddress.io/v1/oauth_callback`
     - Redirect back to `returnaddress.io`
     - Any failed requests

## 📋 Debugging Checklist

- [ ] Verify `NEXT_PUBLIC_APP_URL` is set to `https://returnaddress.io` in Vercel
- [ ] Add explicit `afterSignInUrl` and `afterSignUpUrl` to ClerkProvider
- [ ] Check Clerk Dashboard → Logs for OAuth errors
- [ ] Verify `returnaddress.io` is added in Clerk Dashboard → Domains
- [ ] Test complete OAuth flow manually
- [ ] Check browser console for errors after GitHub authorization
- [ ] Check network tab for failed requests after callback

## 🎯 Expected OAuth Flow

1. User clicks "Sign in with GitHub" ✅
2. Redirects to GitHub: `https://github.com/login/oauth/authorize?...` ✅
3. User authorizes on GitHub ✅
4. GitHub redirects to: `https://clerk.returnaddress.io/v1/oauth_callback?code=...&state=...` ✅
5. **Clerk processes callback** ⚠️ (Need to verify)
6. **Clerk redirects to: `https://returnaddress.io`** ⚠️ (Need to verify)
7. **User is signed in** ⚠️ (Need to verify)

---

**Status:** OAuth redirect works, investigating callback processing and redirect back

**Next:** Apply fixes above and test complete OAuth flow

