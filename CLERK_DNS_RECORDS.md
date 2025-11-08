# Clerk Custom Domain DNS Records - returnaddress.io

## ✅ Record Verification

These DNS records are required for Clerk custom domain functionality. They need to be added at your **DNS provider** (wherever your nameservers point, which should be Vercel if you've configured nameservers there).

## 📋 DNS Records to Add

### Record 1: Frontend API
```
Type: CNAME
Name/Host: clerk
Value/Target: frontend-api.clerk.services
TTL: 3600 (or default)
```

**Purpose:** Enables Clerk's frontend API to work on your custom domain
**Full Domain:** `clerk.returnaddress.io` → `frontend-api.clerk.services`

---

### Record 2: Account Portal
```
Type: CNAME
Name/Host: accounts
Value/Target: accounts.clerk.services
TTL: 3600 (or default)
```

**Purpose:** Enables Clerk's account portal on your custom domain
**Full Domain:** `accounts.returnaddress.io` → `accounts.clerk.services`

---

### Record 3: Email (Custom Domain Emails)
```
Type: CNAME
Name/Host: clkmail
Value/Target: mail.fva681yz9zbt.clerk.services
TTL: 3600 (or default)
```

**Purpose:** Enables Clerk to send emails from your custom domain
**Full Domain:** `clkmail.returnaddress.io` → `mail.fva681yz9zbt.clerk.services`
**Note:** The `fva681yz9zbt` is your Clerk instance ID - verify this matches your Clerk dashboard

---

### Record 4: DKIM 1 (Email Authentication)
```
Type: CNAME
Name/Host: clk._domainkey
Value/Target: dkim1.fva681yz9zbt.clerk.services
TTL: 3600 (or default)
```

**Purpose:** DKIM email authentication for Clerk emails
**Full Domain:** `clk._domainkey.returnaddress.io` → `dkim1.fva681yz9zbt.clerk.services`

---

### Record 5: DKIM 2 (Email Authentication)
```
Type: CNAME
Name/Host: clk2._domainkey
Value/Target: dkim2.fva681yz9zbt.clerk.services
TTL: 3600 (or default)
```

**Purpose:** Secondary DKIM email authentication for Clerk emails
**Full Domain:** `clk2._domainkey.returnaddress.io` → `dkim2.fva681yz9zbt.clerk.services`

---

## 🚀 How to Add These Records

### Option 1: Add in Vercel (If Vercel is Managing DNS)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on **"Domains"** in the sidebar (or go to your project → Settings → Domains)
3. Click on **`returnaddress.io`**
4. Click **"DNS Records"** or **"Configure DNS"** tab
5. Click **"Add Record"** for each of the 5 records above
6. Fill in:
   - **Type:** CNAME
   - **Name:** (the Name/Host from above, e.g., `clerk`, `accounts`, etc.)
   - **Value:** (the Value/Target from above)
   - **TTL:** 3600 (or leave default)
7. Click **"Save"** or **"Add"**
8. Repeat for all 5 records

### Option 2: Add at Domain Registrar (If Registrar is Managing DNS)

1. Log in to your domain registrar (where you bought returnaddress.io)
2. Go to **DNS Management** or **DNS Settings**
3. Find the section for adding DNS records
4. Add each of the 5 CNAME records listed above
5. Save changes

---

## ✅ Verification Steps

After adding the records, verify they're working:

### 1. Check DNS Propagation (Wait 5-60 minutes)
```bash
# Check each record
dig CNAME clerk.returnaddress.io
dig CNAME accounts.returnaddress.io
dig CNAME clkmail.returnaddress.io
dig CNAME clk._domainkey.returnaddress.io
dig CNAME clk2._domainkey.returnaddress.io
```

### 2. Verify in Clerk Dashboard
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Go to **Settings** → **Domains** (or **Configure** → **Domains**)
4. Add `returnaddress.io` as a custom domain
5. Clerk will verify the DNS records automatically
6. Wait for verification to complete (usually 5-10 minutes)

### 3. Test Authentication
1. Visit `https://returnaddress.io`
2. Try to sign in/sign up
3. Authentication should work on your custom domain

---

## ⚠️ Important Notes

1. **Instance ID Verification:** The instance ID `fva681yz9zbt` in records 3, 4, and 5 should match your Clerk instance. Verify this in your Clerk Dashboard:
   - Go to Clerk Dashboard → Settings
   - Look for your instance ID or check the email/DKIM settings
   - If different, update records 3, 4, and 5 with your correct instance ID

2. **DNS Propagation:** DNS changes can take 5-60 minutes (sometimes up to 24 hours) to propagate globally. Be patient.

3. **TTL (Time to Live):** Use 3600 seconds (1 hour) or your DNS provider's default. Lower TTLs (300-600) can help with faster updates but increase DNS query load.

4. **Clerk Domain Configuration:** After DNS records are added and verified, you still need to:
   - Add `returnaddress.io` to Clerk's allowed domains in the Clerk Dashboard
   - Update your application to use the custom domain for Clerk authentication

---

## 🔍 Troubleshooting

### Records Not Resolving
- **Wait longer:** DNS propagation can take time
- **Check record format:** Ensure no trailing dots, correct CNAME format
- **Verify instance ID:** Make sure `fva681yz9zbt` matches your Clerk instance
- **Check DNS provider:** Ensure records are saved correctly

### Clerk Verification Failing
- **Verify all 5 records are added:** All records must be present
- **Check DNS propagation:** Use `dig` or online DNS checker tools
- **Verify instance ID:** Ensure the instance ID in records 3, 4, 5 is correct
- **Wait 10-15 minutes:** Sometimes verification takes time

### Authentication Not Working
- **Check Clerk domain allowlist:** Ensure `returnaddress.io` is added in Clerk Dashboard
- **Verify environment variables:** Check `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` are set
- **Check browser console:** Look for Clerk-related errors
- **Verify DNS records:** All 5 records must be resolving correctly

---

## 📝 Quick Reference

**All 5 Records Summary:**
```
1. CNAME  clerk              → frontend-api.clerk.services
2. CNAME  accounts           → accounts.clerk.services
3. CNAME  clkmail            → mail.fva681yz9zbt.clerk.services
4. CNAME  clk._domainkey     → dkim1.fva681yz9zbt.clerk.services
5. CNAME  clk2._domainkey    → dkim2.fva681yz9zbt.clerk.services
```

**Where to Add:**
- Vercel Dashboard → Domains → returnaddress.io → DNS Records (if Vercel manages DNS)
- Domain Registrar DNS Management (if registrar manages DNS)

**Verification:**
- Clerk Dashboard → Settings → Domains → Add returnaddress.io
- Wait for automatic verification (5-10 minutes)

---

**Last Updated:** After nameservers configuration
**Status:** Ready to add DNS records

