# Live Runtime Audit - Issues Found

## [ISSUE] CORS error on RSC prefetch for protected route

**Evidence:**
- Console: "Access to fetch at 'https://accounts.returnaddress.io/sign-in?redirect_url=...' from origin 'https://returnaddress.io' has been blocked by CORS policy"
- Console: "Failed to fetch RSC payload for https://returnaddress.io/creator/onboarding. Falling back to browser navigation."
- Network: `GET https://returnaddress.io/creator/onboarding?_rsc=8kzk2 => [307]` (redirects to accounts.returnaddress.io)
- Network: `GET https://accounts.returnaddress.io/sign-in?redirect_url=... => [403]` (Cloudflare challenge)

**Suspected cause:**
- `app/page.tsx`: Link to `/creator/onboarding` has `prefetch={false}` but Next.js still attempts RSC prefetch
- `middleware.ts`: Redirects RSC prefetch requests to Clerk sign-in, causing cross-origin CORS error

**Impact:**
- Console noise (errors logged)
- Fallback to browser navigation works, but creates error state
- May confuse users or monitoring tools

**Status:** Investigating fix

