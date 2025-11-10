# Option B - Clerk Dashboard Fields Explained

## Why Those Fields Are Read-Only

The fields you're seeing in **Clerk Dashboard → Customizations → Account Portal → Authentication**:
- `https://accounts.returnaddress.io/sign-in`
- `https://accounts.returnaddress.io/sign-up`
- `https://accounts.returnaddress.io/unauthorized-sign-in`

These are **read-only** because they show Clerk's **hosted Account Portal** URLs. They're auto-generated based on your Account Portal domain configuration.

## You Don't Need to Change Them

For Option B, we're **not using Clerk's hosted Account Portal**. Instead:
- We created our own `/sign-in` and `/sign-up` pages on the primary domain
- The code handles redirects to these pages
- Clerk's Account Portal fields don't affect our implementation

## What Actually Controls Auth Flow

### 1. Code Configuration (Already Done ✅)

**`app/layout.tsx`:**
```tsx
<ClerkProvider
  signInUrl="/sign-in"      // ← Tells Clerk where YOUR sign-in page is
  signUpUrl="/sign-up"      // ← Tells Clerk where YOUR sign-up page is
>
```

**`middleware.ts`:**
```tsx
// Redirects to /sign-in on primary domain (not accounts subdomain)
const signInUrl = new URL("/sign-in", req.url);
return NextResponse.redirect(signInUrl);
```

### 2. Clerk Dashboard Settings (What to Check)

**Navigate to:** Clerk Dashboard → **Paths** (or **Configure** → **Paths**)

Look for fields like:
- **Sign-in path** or **Sign-in URL**
- **Sign-up path** or **Sign-up URL**

If these fields exist and are editable, set them to:
- `/sign-in`
- `/sign-up`

**OR** they might be in:
- **Configure** → **Domains** → **Frontend API** section
- Look for "Sign-in URL" or "Sign-up URL" fields

### 3. Environment Variables (Optional but Recommended)

**Vercel → Environment Variables:**
```
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

These tell Clerk where your pages are (code already defaults to these values).

## What to Verify in Clerk Dashboard

1. **Frontend API Domain:**
   - Should be: `clerk.returnaddress.io`
   - Location: **Configure** → **Domains** → **Frontend API**

2. **Authorized Redirect URIs:**
   - Should include: `https://returnaddress.io` and `https://returnaddress.io/*`
   - Location: **Configure** → **OAuth** → **Redirect URLs** (or similar)

3. **Account Portal Domain (if visible):**
   - This might show `accounts.returnaddress.io` - that's fine
   - We're not using the Account Portal, so this doesn't matter

## The Key Point

The **Account Portal → Authentication** fields showing `accounts.returnaddress.io` are **Clerk's hosted pages**, not your app's pages. Since we're using our own pages (`/sign-in`, `/sign-up`), those Account Portal fields don't affect us.

The code already redirects to `/sign-in` and `/sign-up` on the primary domain, so auth will work correctly even if those Account Portal fields show `accounts.returnaddress.io`.

## Testing

After deploying:
1. Visit `https://returnaddress.io/sign-in` - should show YOUR sign-in page
2. Click "Become a creator" while signed out - should redirect to `/sign-in` (not accounts subdomain)
3. Complete sign-in - should work without CORS errors

The Account Portal fields being read-only is **not a problem** - they don't control our auth flow.

