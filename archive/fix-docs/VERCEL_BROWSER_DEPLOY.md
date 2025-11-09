# Deploy to Vercel via Browser - Quick Guide

## 🚀 Step-by-Step Deployment

### Step 1: Import Project

1. Go to: **https://vercel.com/new**
2. Click **"Import Git Repository"**
3. Find and select: **`Dewars30/return-address`**
4. Click **"Import"**

### Step 2: Configure Project

**Project Settings:**
- **Project Name**: `return-address` (or leave default)
- **Framework Preset**: Next.js (auto-detected ✅)
- **Root Directory**: `./` (default)
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)

**Node.js Version:**
- Vercel will automatically use **22.x** from package.json
- No manual configuration needed ✅

### Step 3: Add Environment Variables

**Before deploying, add environment variables:**

1. Click **"Environment Variables"** in the project configuration
2. Add each variable from your `.env` file:

```
DATABASE_URL=postgresql://postgres:...@db.lhcpemvphloxrjrcuoza.supabase.co:5432/postgres
NEXT_PUBLIC_APP_URL=https://returnaddress.io
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
OPENAI_API_KEY=sk-...
S3_ENDPOINT=https://lhcpemvphloxrjrcuoza.supabase.co/storage/v1/s3
S3_ACCESS_KEY_ID=a48223e0d32b608627e56eb79ec399b7
S3_SECRET_ACCESS_KEY=dd17127981916715a0b778165c131a17a418bc97151dd720ea2442166abaab7f
S3_BUCKET_NAME=return-address-files
S3_REGION=us-east-1
SUPABASE_URL=https://lhcpemvphloxrjrcuoza.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ADMIN_EMAILS=your-email@example.com
PLATFORM_FEE_BPS=500
```

**⚠️ Important:**
- Set `NEXT_PUBLIC_APP_URL=https://returnaddress.io` (not localhost)
- Copy values from your local `.env` file
- Select environment: **Production** (or **Preview** for testing)

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for build to complete (~2-3 minutes)
3. You'll get a deployment URL (e.g., `return-address.vercel.app`)

### Step 5: Configure Domain

**After deployment:**

1. Go to **Project Dashboard** → **Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter: `returnaddress.io`
4. Follow DNS instructions:
   - Use Vercel nameservers (easiest)
   - Or add A/CNAME records at your registrar
5. Wait for DNS propagation (5-60 minutes)
6. SSL certificate issued automatically

### Step 6: Configure Stripe Webhook

**After domain is live:**

1. Go to **Stripe Dashboard** → **Webhooks**
2. Click **"Add endpoint"**
3. **URL**: `https://returnaddress.io/api/stripe/webhook`
4. **Events**:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Copy **webhook secret**
6. Go to **Vercel** → **Settings** → **Environment Variables**
7. Update `STRIPE_WEBHOOK_SECRET`
8. **Redeploy**

---

## ✅ Quick Checklist

- [ ] Project imported from GitHub
- [ ] Node version set to **18.x**
- [ ] All environment variables added
- [ ] `NEXT_PUBLIC_APP_URL=https://returnaddress.io`
- [ ] Deployed successfully
- [ ] Domain configured (returnaddress.io)
- [ ] Stripe webhook configured
- [ ] Tested deployment

---

## 🆘 Troubleshooting

**Build fails?**
- Check Node version is 18.x
- Verify all environment variables are set
- Check build logs in Vercel dashboard

**Domain not working?**
- Wait 5-60 minutes for DNS propagation
- Verify DNS records at your registrar
- Check domain status in Vercel dashboard

**Webhook not receiving events?**
- Verify webhook URL is correct
- Check webhook secret in Vercel
- Check Vercel function logs

---

## 🎯 That's It!

Your app will be live at `https://returnaddress.io` after DNS propagation!

