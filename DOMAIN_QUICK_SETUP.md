# Quick Domain Setup - returnaddress.io

## ✅ You've Completed:
- ✅ Updated nameservers to point to Vercel
- ✅ Deployment is ready

## 🚀 Next Steps (5 minutes):

### Step 1: Add Domain in Vercel (2 minutes)
1. Go to: https://vercel.com/dashboard
2. Select **return-address** project
3. Click **Settings** → **Domains**
4. Click **"Add Domain"**
5. Enter: `returnaddress.io`
6. Click **"Add"**
7. Vercel will verify (should be instant since nameservers are updated)
8. Wait 1-2 minutes for SSL certificate

### Step 2: Verify Environment Variable (1 minute)
1. In Vercel, go to **Settings** → **Environment Variables**
2. Check if `NEXT_PUBLIC_APP_URL` exists
3. If not, add it:
   - Key: `NEXT_PUBLIC_APP_URL`
   - Value: `https://returnaddress.io`
   - Environment: Production
4. If it exists but is wrong, update it
5. **Redeploy** after updating (or wait for next deployment)

### Step 3: Update Clerk (2 minutes)
1. Go to: https://dashboard.clerk.com
2. Select your application
3. Go to **Settings** → **Domains** (or **Configure** → **Domains**)
4. Add `returnaddress.io` to allowed domains
5. Save

### Step 4: Update Stripe Webhook (if needed)
1. Go to: https://dashboard.stripe.com/webhooks
2. Find your webhook endpoint
3. Update URL to: `https://returnaddress.io/api/stripe/webhook`
4. Save

### Step 5: Test
1. Visit: https://returnaddress.io
2. Should see your homepage
3. Test sign-in/sign-up
4. Test creating an agent (if logged in)

## ⚠️ Troubleshooting

**Domain not loading?**
- Wait 5-10 minutes for DNS propagation
- Check Vercel domain status (should show "Valid")
- Try clearing browser cache

**SSL not working?**
- Wait 1-5 minutes for SSL certificate provisioning
- Check Vercel shows "SSL Valid"
- Contact Vercel support if it takes > 10 minutes

**Clerk not working?**
- Verify domain is added to Clerk allowlist
- Check Clerk environment variables in Vercel
- Check browser console for errors

## ✅ Success!
Once all steps are complete, your app will be live at:
**https://returnaddress.io**

