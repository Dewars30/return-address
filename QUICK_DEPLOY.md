# Quick Deploy Guide - Return Address to Vercel

## 🚀 5-Minute Deployment

### Step 1: Import Project (2 minutes)

1. Go to: **https://vercel.com/new**
2. Click **"Import Git Repository"**
3. Select: **`Dewars30/return-address`**
4. Click **"Import"**

### Step 2: Configure Project (1 minute)

- **Project Name**: `return-address`
- **Framework**: Next.js (auto-detected ✅)
- **Root Directory**: `./` (default)
- **Build Command**: `npm run build` (default)
- Click **"Deploy"** (we'll add env vars after)

### Step 3: Add Environment Variables (2 minutes)

After first deployment, go to **Settings → Environment Variables** and add:

```bash
# Copy from your local .env file:

DATABASE_URL=postgresql://...
NEXT_PUBLIC_APP_URL=https://returnaddress.io
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_... (get after webhook setup)
OPENAI_API_KEY=sk-...
S3_ENDPOINT=https://lhcpemvphloxrjrcuoza.supabase.co/storage/v1/s3
S3_ACCESS_KEY_ID=a48223e0d32b608627e56eb79ec399b7
S3_SECRET_ACCESS_KEY=dd17127981916715a0b778165c131a17a418bc97151dd720ea2442166abaab7f
S3_BUCKET_NAME=return-address-files
S3_REGION=us-east-1
SUPABASE_URL=https://lhcpemvphloxrjrcuoza.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
ADMIN_EMAILS=your-email@example.com
PLATFORM_FEE_BPS=500
```

⚠️ **Important**: 
- Use **production keys** for Clerk and Stripe
- Set `NEXT_PUBLIC_APP_URL=https://returnaddress.io`
- Redeploy after adding variables

### Step 4: Configure Domain (5 minutes)

1. Go to **Settings → Domains**
2. Click **"Add Domain"**
3. Enter: `returnaddress.io`
4. Follow DNS instructions:
   - Option A: Use Vercel nameservers (easiest)
   - Option B: Add A/CNAME records at your registrar
5. Wait for DNS propagation (5-60 minutes)
6. SSL certificate issued automatically

### Step 5: Configure Stripe Webhook (3 minutes)

1. Go to **Stripe Dashboard → Webhooks**
2. Click **"Add endpoint"**
3. **URL**: `https://returnaddress.io/api/stripe/webhook`
4. **Events**: 
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Copy **webhook secret** (`whsec_...`)
6. Add to Vercel: `STRIPE_WEBHOOK_SECRET`
7. **Redeploy**

### Step 6: Test (2 minutes)

- [ ] Visit `https://returnaddress.io` - homepage loads
- [ ] Sign in with Clerk - auth works
- [ ] Create test agent - works
- [ ] Test subscription flow - works
- [ ] Check webhook logs in Stripe

---

## ✅ Done!

Your app is now live at **https://returnaddress.io**

---

## 🆘 Troubleshooting

**Build fails?**
- Check build logs in Vercel
- Ensure all environment variables are set
- Verify Prisma generates correctly

**Domain not working?**
- Wait 5-60 minutes for DNS propagation
- Check DNS records at your registrar
- Verify nameservers (if using Vercel nameservers)

**Webhook not receiving events?**
- Verify webhook URL: `https://returnaddress.io/api/stripe/webhook`
- Check webhook secret in Vercel
- Check Vercel function logs

---

## 📚 Full Guide

See `VERCEL_DEPLOYMENT.md` for complete instructions.

