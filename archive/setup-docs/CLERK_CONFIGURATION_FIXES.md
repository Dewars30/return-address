# Clerk Configuration Fixes for CORS and CSP

## 🔧 CORS Error Fix for accounts.returnaddress.io

### Issue
Console error: `Access to fetch at 'https://accounts.returnaddress.io/sign-in...' has been blocked by CORS policy`

### Root Cause
Clerk's `accounts.returnaddress.io` subdomain is not properly configured to allow requests from `returnaddress.io`.

### Solution

1. **Verify DNS Records in Vercel**
   - Go to Vercel Dashboard → Your Project → Settings → Domains
   - Click on `returnaddress.io` (NOT `accounts.returnaddress.io` - that's a subdomain)
   - Ensure these CNAME records exist for `returnaddress.io`:
     - `clerk` → `frontend-api.clerk.services` (for Clerk frontend API)
     - `clkmail` → `mail.fva681yz9zbt.clerk.services` (your exact value)
     - `clk._domainkey` → `dkim1.fva681yz9zbt.clerk.services`
     - `clk2._domainkey` → `dkim2.fva681yz9zbt.clerk.services`
   - **Note:** You may have `accounts` → `4b19958f2de6ed10.vercel-dns-017.com.` for Vercel verification
   - **Important:** You cannot have two CNAME records with the same name. If `accounts` is used for Vercel verification, configure Clerk to use `clerk.returnaddress.io` for frontend API instead.

2. **Configure Domain in Clerk Dashboard**
   - Go to [Clerk Dashboard](https://dashboard.clerk.com)
   - Select your application
   - Go to **Domains** section
   - Add `returnaddress.io` as a custom domain (NOT `accounts.returnaddress.io` - that's a subdomain)
   - Configure frontend API to use `clerk.returnaddress.io` (subdomain you created)
   - **Note:** If `accounts` CNAME is used for Vercel verification, you may need to:
     - Use Clerk's default account portal domain, OR
     - Configure a different subdomain (e.g., `auth.returnaddress.io`) for account portal
   - Verify the domain shows as "Active" or "Verified"

3. **Check CORS Settings**
   - In Clerk Dashboard → **Settings** → **Allowed Origins**
   - Ensure `https://returnaddress.io` is listed
   - Ensure `https://accounts.returnaddress.io` is listed (if needed)

4. **Verify Environment Variables**
   - Ensure `NEXT_PUBLIC_APP_URL=https://returnaddress.io` is set in Vercel
   - Ensure production Clerk keys (`pk_live_...` and `sk_live_...`) are set

5. **Wait for DNS Propagation**
   - DNS changes can take up to 48 hours to propagate
   - Use `dig accounts.returnaddress.io` or online DNS checker to verify

### Verification
After configuration:
- No CORS errors in browser console
- Sign-in redirects work correctly
- OAuth flows complete successfully

---

## 🔒 CSP Warning Fix

### Issue
Console warning: `'script-src' was not explicitly set, so 'default-src' is used as a fallback`

### Root Cause
Content Security Policy headers are not configured for Clerk's account portal subdomain.

### Solution

1. **Configure CSP in Clerk Dashboard**
   - Go to Clerk Dashboard → Your Application → **Settings** → **Security**
   - Find **Content Security Policy** section
   - Add CSP headers:
     ```
     default-src 'self';
     script-src 'self' 'unsafe-inline' 'unsafe-eval' https://clerk.returnaddress.io;
     style-src 'self' 'unsafe-inline';
     img-src 'self' data: https:;
     font-src 'self' data:;
     connect-src 'self' https://clerk.returnaddress.io https://api.clerk.dev;
     ```
   - Or use Clerk's recommended CSP settings

2. **Alternative: Configure in Vercel**
   - Add headers in `vercel.json`:
     ```json
     {
       "headers": [
         {
           "source": "/(.*)",
           "headers": [
             {
               "key": "Content-Security-Policy",
               "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://clerk.returnaddress.io; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://clerk.returnaddress.io https://api.clerk.dev;"
             }
           ]
         }
       ]
     }
     ```
   - Note: This applies to your app, not Clerk's subdomain

### Verification
After configuration:
- No CSP warnings in browser console
- All Clerk scripts load correctly
- OAuth flows work without CSP blocking

---

## 📝 Notes

- **CORS**: Must be configured in Clerk Dashboard, not in code
- **CSP**: Can be configured in Clerk Dashboard or Vercel headers
- **DNS**: Changes may take 24-48 hours to propagate
- **Testing**: Test in incognito mode to avoid cached DNS/CORS

---

## ✅ Checklist

- [ ] DNS records verified in Vercel
- [ ] Domain configured in Clerk Dashboard
- [ ] CORS origins added in Clerk Dashboard
- [ ] CSP headers configured
- [ ] Production Clerk keys set in Vercel
- [ ] `NEXT_PUBLIC_APP_URL` set correctly
- [ ] Tested sign-in flow
- [ ] Tested OAuth flows
- [ ] No console errors

