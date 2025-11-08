# GitHub OAuth Authentication Issue

## 🔍 Problem

GitHub authentication is not working on the live site (`returnaddress.io`). The GitHub sign-in button is visible and clickable, but clicking it does not trigger the OAuth flow.

## 🧪 Test Results

**Browser Testing:**
- ✅ Sign-in modal opens correctly
- ✅ GitHub button is visible
- ✅ GitHub button is clickable
- ❌ Clicking GitHub button does NOT redirect to GitHub OAuth
- ❌ No OAuth redirect URL in network requests

## 🔍 Root Cause Analysis

GitHub OAuth requires configuration in **Clerk Dashboard**, not just in the code. The issue is likely:

1. **GitHub OAuth Provider Not Enabled** in Clerk Dashboard
2. **GitHub OAuth App Not Configured** (missing Client ID/Secret)
3. **Redirect URLs Not Set** in GitHub OAuth app
4. **Clerk OAuth Settings Missing** GitHub provider configuration

## ✅ Solution: Configure GitHub OAuth in Clerk

### Step 1: Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **"OAuth Apps"** → **"New OAuth App"**
3. Fill in:
   - **Application name**: `Return Address`
   - **Homepage URL**: `https://returnaddress.io`
   - **Authorization callback URL**: `https://clerk.returnaddress.io/v1/oauth_callback`
4. Click **"Register application"**
5. Copy:
   - **Client ID** (e.g., `Iv1.xxxxxxxxxxxxx`)
   - **Client Secret** (click "Generate a new client secret")

### Step 2: Configure GitHub in Clerk Dashboard

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Go to **"User & Authentication"** → **"Social Connections"**
4. Find **"GitHub"** and click **"Configure"**
5. Enable GitHub provider
6. Enter:
   - **Client ID**: From GitHub OAuth app
   - **Client Secret**: From GitHub OAuth app
7. Click **"Save"**

### Step 3: Verify Redirect URLs

**In Clerk Dashboard:**
- Go to **"Domains"** → **"Frontend API"**
- Ensure `clerk.returnaddress.io` is configured
- Verify redirect URLs include:
  - `https://clerk.returnaddress.io/v1/oauth_callback`
  - `https://returnaddress.io`

**In GitHub OAuth App:**
- Authorization callback URL must be: `https://clerk.returnaddress.io/v1/oauth_callback`

### Step 4: Test

1. Go to `https://returnaddress.io`
2. Click **"Sign in"**
3. Click **"Sign in with GitHub"**
4. Should redirect to GitHub authorization page
5. After authorizing, should redirect back to `returnaddress.io`

## 🔧 Alternative: Check Current Configuration

If GitHub OAuth is already configured, verify:

1. **Clerk Dashboard** → **Social Connections** → **GitHub**:
   - ✅ Enabled
   - ✅ Client ID set
   - ✅ Client Secret set

2. **GitHub OAuth App**:
   - ✅ Callback URL: `https://clerk.returnaddress.io/v1/oauth_callback`
   - ✅ App is active

3. **Network Requests** (when clicking GitHub button):
   - Should see redirect to: `https://github.com/login/oauth/authorize?...`
   - If not, GitHub provider is not configured in Clerk

## 📋 Checklist

- [ ] GitHub OAuth app created in GitHub Developer Settings
- [ ] Callback URL set to: `https://clerk.returnaddress.io/v1/oauth_callback`
- [ ] GitHub provider enabled in Clerk Dashboard
- [ ] Client ID entered in Clerk Dashboard
- [ ] Client Secret entered in Clerk Dashboard
- [ ] Tested GitHub sign-in flow
- [ ] Verified redirect works correctly

## 🎯 Expected Behavior

After configuration:
1. User clicks "Sign in with GitHub"
2. Redirects to: `https://github.com/login/oauth/authorize?client_id=...&redirect_uri=...`
3. User authorizes on GitHub
4. Redirects back to: `https://clerk.returnaddress.io/v1/oauth_callback`
5. Clerk processes OAuth callback
6. User is signed in and redirected to `https://returnaddress.io`

---

**Status:** Waiting for GitHub OAuth configuration in Clerk Dashboard

**Note:** This requires manual configuration in Clerk Dashboard. The code is correct; the OAuth provider just needs to be enabled and configured.

