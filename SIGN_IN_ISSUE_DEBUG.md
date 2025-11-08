# Sign-In Issue: Development Keys on Production Domain

## 🔍 Root Cause

The sign-in feature is non-responsive on `returnaddress.io` because **Clerk is using development keys instead of production keys**.

### Evidence from Browser Debugging:

1. **Clerk Publishable Key**: `pk_test_Z2xvcmlvdXMtd2FsbGFieS05MC5jbGVyay5hY2NvdW50cy5kZXYk`
   - ❌ Starts with `pk_test_` (development)
   - ✅ Should start with `pk_live_` (production)

2. **Clerk Frontend API**: `glorious-wallaby-90.clerk.accounts.dev`
   - ❌ Development instance
   - ✅ Should use production instance

3. **OAuth Redirect**: `clerk.shared.lcl.dev`
   - ❌ Local development instance
   - ✅ Should redirect to production Clerk instance

4. **Console Warnings**: 
   - "Clerk has been loaded with development keys"
   - "Development instances have strict usage limits"

5. **CORS Errors**: 
   - Development instance doesn't allow `returnaddress.io` domain
   - Blocks authentication requests

## ✅ Why It Works on Vercel Deployment

- Vercel preview deployments may have different environment variables
- Or the deployment URL matches the development instance configuration
- Development keys work with development/preview URLs

## ❌ Why It Doesn't Work on returnaddress.io

- Production domains require production Clerk keys
- Development instance doesn't allow `returnaddress.io` domain
- CORS policy blocks authentication requests
- OAuth redirects fail because they go to development instances

## 🔧 Solution

### Step 1: Get Production Clerk Keys

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Go to **API Keys** section
4. Find **Production** keys (not Development/Test keys)
5. Copy:
   - `pk_live_...` (Publishable Key)
   - `sk_live_...` (Secret Key)

### Step 2: Update Vercel Environment Variables

Update these variables in Vercel Dashboard → Settings → Environment Variables:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...  # Production key (not pk_test_)
CLERK_SECRET_KEY=sk_live_...                    # Production key (not sk_test_)
```

**Important**: 
- Ensure keys start with `pk_live_` and `sk_live_` (not `pk_test_` or `sk_test_`)
- Set for **Production** environment
- Optionally set for Preview/Development if needed

### Step 3: Verify Domain Configuration

In Clerk Dashboard:
1. Go to **Domains** section
2. Ensure `returnaddress.io` is added and verified
3. DNS records should already be configured (from previous setup)

### Step 4: Redeploy

After updating environment variables:
1. Vercel will automatically redeploy, OR
2. Manually trigger a new deployment

## 🧪 Verification

After redeploying, verify:
1. Sign-in button opens modal ✅
2. Form fields are interactive ✅
3. OAuth buttons redirect correctly ✅
4. No CORS errors in console ✅
5. Authentication completes successfully ✅

## 📝 Current Status

- ✅ Sign-in modal opens correctly
- ✅ Form fields accept input
- ❌ Authentication fails due to development keys
- ❌ OAuth redirects to wrong instance
- ❌ CORS errors block requests

After updating to production keys, all issues should be resolved.

