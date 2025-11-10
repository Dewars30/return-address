# Option B - Ops Checklist

**Action Required:** Configure Clerk Dashboard and Vercel environment variables

---

## Clerk Dashboard Configuration

1. **Navigate to:** https://dashboard.clerk.com → Your Instance → Paths
2. **Set:**
   - **Sign-in URL:** `/sign-in`
   - **Sign-up URL:** `/sign-up`
3. **Verify:**
   - **Frontend API:** `clerk.returnaddress.io` (should already be set)
   - **Authorized Redirect URIs:** Include `https://returnaddress.io` and `https://returnaddress.io/*`

---

## Vercel Environment Variables

**Navigate to:** Vercel → Your Project → Settings → Environment Variables

**Add/Update:**
```
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

**Note:** These are optional (code defaults to `/sign-in` and `/sign-up`), but setting them explicitly is recommended.

---

## After Configuration

1. **Redeploy** on Vercel (or wait for next deployment)
2. **Test:**
   - Visit `https://returnaddress.io/sign-in` - should show Clerk sign-in form
   - Visit `https://returnaddress.io/sign-up` - should show Clerk sign-up form
   - Click "Become a creator" while signed out - should redirect to `/sign-in` (not accounts subdomain)
   - Complete sign-in - should work without CORS errors

---

## Verification

- ✅ Code changes complete
- ✅ Build passes (`npm run build`)
- ✅ Lint passes (`npm run lint`)
- ⏳ Clerk Dashboard configuration (manual)
- ⏳ Vercel env vars (manual)
- ⏳ Production testing (after deploy)

