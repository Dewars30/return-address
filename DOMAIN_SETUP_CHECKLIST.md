# Domain Setup Checklist - returnaddress.io

## ✅ Completed Steps
- ✅ Nameservers updated to point to Vercel
- ✅ Deployment is READY on Vercel

## 📋 Steps to Complete

### 1. Add Domain in Vercel Dashboard

**Steps:**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select the **return-address** project
3. Go to **Settings** → **Domains**
4. Click **"Add Domain"**
5. Enter: `returnaddress.io`
6. Click **"Add"**
7. Wait for domain verification (automatic if nameservers are correct)
8. Wait for SSL certificate provisioning (usually 1-5 minutes)

**Expected Result:**
- Domain shows as "Valid" in Vercel
- SSL certificate shows as "Valid"
- Domain appears in deployment aliases

---

### 2. Verify Environment Variables

**Check in Vercel:**
1. Go to **Settings** → **Environment Variables**
2. Verify `NEXT_PUBLIC_APP_URL` is set to: `https://returnaddress.io`
3. If not set or incorrect:
   - Click **"Add New"**
   - Key: `NEXT_PUBLIC_APP_URL`
   - Value: `https://returnaddress.io`
   - Environment: **Production** (and Preview if desired)
   - Click **"Save"**
4. **Redeploy** after updating (or it will be picked up on next git push)

**Why This Matters:**
- Used in Stripe redirect URLs
- Used in Stripe Connect onboarding URLs
- Ensures all redirects go to the correct domain

---

### 3. Update Clerk Domain Allowlist

**Steps:**
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Go to **Domains** (or **Settings** → **Domains**)
4. Click **"Add Domain"** or **"Allowlist Domain"**
5. Enter: `returnaddress.io`
6. Click **"Save"**

**Why This Matters:**
- Clerk requires domains to be allowlisted for authentication to work
- Without this, Clerk authentication will fail on your custom domain

---

### 4. Update Stripe Webhook URL

**Steps:**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Go to **Developers** → **Webhooks**
3. Find your existing webhook or create a new one
4. Update the endpoint URL to: `https://returnaddress.io/api/stripe/webhook`
5. Ensure these events are subscribed:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
6. Copy the **Webhook Signing Secret** (starts with `whsec_`)
7. Update `STRIPE_WEBHOOK_SECRET` in Vercel environment variables if changed

**Why This Matters:**
- Webhooks won't work if the URL doesn't match your domain
- Subscription updates depend on webhooks

---

### 5. Test the Application

**Test Checklist:**
- [ ] Visit `https://returnaddress.io` - homepage loads
- [ ] SSL certificate is valid (green lock icon)
- [ ] Visit `https://returnaddress.io/sign-in` - Clerk sign-in works
- [ ] Sign in with test account
- [ ] Visit `https://returnaddress.io/creator/agents` - creator dashboard loads
- [ ] Create a test agent
- [ ] Visit `https://returnaddress.io/agents/[slug]` - agent page loads
- [ ] Test subscription checkout flow (if implemented)

---

### 6. Verify DNS Propagation

**Check DNS:**
```bash
# Check if domain resolves to Vercel
dig returnaddress.io
nslookup returnaddress.io
```

**Expected:**
- Domain should resolve to Vercel's IP addresses
- If using nameservers, should point to Vercel's nameservers

---

## 🔧 Troubleshooting

### Domain Not Loading
- **Check DNS propagation**: Can take up to 24-48 hours (usually much faster)
- **Check Vercel domain status**: Should show "Valid" and "SSL Valid"
- **Clear browser cache**: Try incognito/private mode
- **Check browser console**: Look for any errors

### Clerk Authentication Not Working
- **Verify domain is allowlisted** in Clerk Dashboard
- **Check Clerk environment variables** are set correctly in Vercel
- **Check browser console** for Clerk errors

### Stripe Redirects Not Working
- **Verify `NEXT_PUBLIC_APP_URL`** is set to `https://returnaddress.io`
- **Redeploy** after updating environment variables
- **Check Stripe dashboard** for redirect URL errors

### SSL Certificate Issues
- **Wait a few minutes** - SSL provisioning can take 1-5 minutes
- **Check Vercel domain status** - should show "SSL Valid"
- **Contact Vercel support** if SSL doesn't provision after 10 minutes

---

## 📝 Post-Deployment Checklist

After domain is live:
- [ ] Homepage loads at `https://returnaddress.io`
- [ ] Authentication works (sign in/up)
- [ ] Creator onboarding works
- [ ] Agent creation works
- [ ] Agent marketplace displays
- [ ] Subscription checkout works
- [ ] Stripe webhooks are receiving events
- [ ] Email notifications work (if implemented)

---

## 🎯 Quick Reference

**Vercel Dashboard:**
- Project: https://vercel.com/dashboard
- Domains: Settings → Domains
- Environment Variables: Settings → Environment Variables

**Clerk Dashboard:**
- Dashboard: https://dashboard.clerk.com
- Domains: Settings → Domains

**Stripe Dashboard:**
- Dashboard: https://dashboard.stripe.com
- Webhooks: Developers → Webhooks

---

## ✅ Success Criteria

Your domain is successfully configured when:
1. ✅ `https://returnaddress.io` loads the application
2. ✅ SSL certificate is valid (green lock)
3. ✅ Authentication works on the custom domain
4. ✅ All redirects use the correct domain
5. ✅ Stripe webhooks are receiving events

---

**Last Updated:** After nameservers configuration
**Status:** Ready for domain setup in Vercel

