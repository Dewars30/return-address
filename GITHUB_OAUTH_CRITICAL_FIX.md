# GitHub OAuth - Critical Error Found

## 🚨 Critical Discovery

**Error Found on `accounts.returnaddress.io/sign-in`:**
- Message: "Unable to complete action at this time. If the problem persists please contact support."
- This error appears when accessing the accounts subdomain directly
- Suggests Clerk configuration issue

## 🔍 Root Cause Analysis

### Issue 1: Modal Redirects to Accounts Subdomain
**Problem:** When clicking GitHub OAuth from modal, it redirects to `accounts.returnaddress.io/sign-in` instead of staying in modal.

**Evidence:**
- User reports seeing different auth page
- Browser testing shows redirect to accounts subdomain
- Error message on accounts subdomain

### Issue 2: Clerk Error on Accounts Subdomain
**Problem:** `accounts.returnaddress.io/sign-in` shows error: "Unable to complete action at this time."

**Possible Causes:**
1. Clerk Dashboard configuration issue
2. OAuth callback URL mismatch
3. Domain verification issue
4. CORS/CSP blocking

## ✅ Fixes Applied

### Fix 1: Force Modal Mode ✅
- Added `signInUrl="/sign-in"` to ClerkProvider
- Added `signUpUrl="/sign-up"` to ClerkProvider
- Added `forceRedirectUrl={false}` to SignInButton

### Fix 2: CSP Headers ✅
- Added CSP headers to allow Clerk domains
- Allows `clerk.returnaddress.io` and `accounts.returnaddress.io`
- Allows frames for modal

### Fix 3: Explicit Redirect URLs ✅
- Added `afterSignInUrl` and `afterSignUpUrl` to ClerkProvider

## 🔧 Additional Fixes Needed

### Fix 4: Check Clerk Dashboard Configuration

**Verify in Clerk Dashboard:**

1. **Domains Section:**
   - Frontend API: `clerk.returnaddress.io` ✅
   - Account Portal: `accounts.returnaddress.io` ✅
   - Both should be "Active" or "Verified"

2. **OAuth Settings:**
   - GitHub OAuth enabled ✅
   - Callback URL: `https://clerk.returnaddress.io/v1/oauth_callback` ✅
   - Client ID and Secret set ✅

3. **Allowed Origins:**
   - `https://returnaddress.io` ✅
   - `https://accounts.returnaddress.io` ✅

4. **Paths:**
   - Sign-in path: `/sign-in` (or default)
   - Sign-up path: `/sign-up` (or default)

### Fix 5: Verify GitHub OAuth App

**In GitHub Developer Settings:**
- OAuth App callback URL: `https://clerk.returnaddress.io/v1/oauth_callback` ✅
- Client ID matches Clerk Dashboard ✅

## 🧪 Testing After Deployment

1. **Test Modal Mode:**
   - Go to `https://returnaddress.io`
   - Click "Sign in"
   - Modal should open (NOT redirect to accounts subdomain)
   - Click "Sign in with GitHub"
   - Should redirect to GitHub (NOT accounts subdomain)

2. **Test OAuth Flow:**
   - Authorize on GitHub
   - Should redirect to `clerk.returnaddress.io/v1/oauth_callback`
   - Then redirect back to `returnaddress.io`
   - User should be signed in

3. **Test Accounts Subdomain:**
   - Go to `https://accounts.returnaddress.io/sign-in`
   - Should NOT show error
   - GitHub OAuth should work

## 📋 Verification Checklist

- [ ] Modal opens on returnaddress.io (no redirect)
- [ ] GitHub OAuth redirects from modal (not accounts subdomain)
- [ ] OAuth callback works correctly
- [ ] User is signed in after OAuth
- [ ] accounts.returnaddress.io/sign-in works (no error)
- [ ] No console errors
- [ ] CSP headers allow Clerk domains

## 🎯 Expected Behavior After Fixes

**Correct Flow:**
1. User clicks "Sign in" → Modal opens ✅
2. User clicks "Sign in with GitHub" → Redirects to GitHub ✅
3. User authorizes → Redirects to Clerk callback ✅
4. Clerk processes → Redirects to returnaddress.io ✅
5. User is signed in ✅

**No More:**
- ❌ Redirect to accounts subdomain
- ❌ "Unable to complete action" error
- ❌ Different auth pages

---

**Status:** Fixes applied, pending deployment verification

