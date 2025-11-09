# Vercel Deployment Guide for Return Address

## 🚀 Quick Start

This guide will help you deploy Return Address to Vercel and configure it with the `returnaddress.io` domain.

---

## Prerequisites

- GitHub repository: `return-address` (already created ✅)
- Vercel account (free tier works)
- Domain: `returnaddress.io` (already owned ✅)
- All environment variables ready

---

## Step 1: Install Vercel CLI (Optional but Recommended)

```bash
npm i -g vercel
```

Or use the web interface (recommended for first-time setup).

---

## Step 2: Deploy via Vercel Web Interface

### 2.1 Import Project

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New..."** → **"Project"**
3. Import from GitHub: **`Dewars30/return-address`**
4. Click **"Import"**

### 2.2 Configure Project

**Project Settings:**
- **Project Name**: `return-address` (or `returnaddress`)
- **Framework Preset**: Next.js (auto-detected)
- **Root Directory**: `./` (default)
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)

**Environment Variables:**
Add all variables from `.env.example`:

```bash
# Database
DATABASE_URL=postgresql://postgres:...@db.lhcpemvphloxrjrcuoza.supabase.co:5432/postgres

# App URL (IMPORTANT: Set to production domain)
NEXT_PUBLIC_APP_URL=https://returnaddress.io

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# OpenAI
OPENAI_API_KEY=sk-...

# Supabase Storage
S3_ENDPOINT=https://lhcpemvphloxrjrcuoza.supabase.co/storage/v1/s3
S3_ACCESS_KEY_ID=a48223e0d32b608627e56eb79ec399b7
S3_SECRET_ACCESS_KEY=dd17127981916715a0b778165c131a17a418bc97151dd720ea2442166abaab7f
S3_BUCKET_NAME=return-address-files
S3_REGION=us-east-1

# Supabase
SUPABASE_URL=https://lhcpemvphloxrjrcuoza.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Admin
ADMIN_EMAILS=your-email@example.com

# Platform Fee
PLATFORM_FEE_BPS=500
```

**⚠️ Important Notes:**
- Use **production keys** (not test keys) for:
  - Clerk (pk_live_, sk_live_)
  - Stripe (sk_live_, pk_live_)
- Set `NEXT_PUBLIC_APP_URL=https://returnaddress.io`
- Get `STRIPE_WEBHOOK_SECRET` from Stripe Dashboard after configuring webhook

### 2.3 Deploy

1. Click **"Deploy"**
2. Wait for build to complete (~2-3 minutes)
3. Note the deployment URL (e.g., `return-address.vercel.app`)

---

## Step 3: Configure Custom Domain (returnaddress.io)

### 3.1 Add Domain in Vercel

1. Go to your project dashboard
2. Click **"Settings"** → **"Domains"**
3. Click **"Add Domain"**
4. Enter: `returnaddress.io`
5. Click **"Add"**

### 3.2 Configure DNS Records

Vercel will provide DNS instructions. Typically:

**Option A: Root Domain (returnaddress.io)**

Add these DNS records at your domain registrar:

```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600

Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

**Option B: CNAME (Recommended)**

If your registrar supports CNAME for root domains:

```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
TTL: 3600
```

**Option C: Vercel Nameservers (Easiest)**

1. In Vercel, go to **"Domains"** → **"returnaddress.io"**
2. Click **"Configure"**
3. Use Vercel's nameservers:
   - Copy the nameservers provided
   - Update nameservers at your domain registrar

### 3.3 Verify DNS

1. Wait for DNS propagation (5-60 minutes)
2. Vercel will automatically verify and issue SSL certificate
3. Check status in Vercel dashboard

---

## Step 4: Configure Stripe Webhook

### 4.1 Create Webhook Endpoint

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click **"Add endpoint"**
3. **Endpoint URL**: `https://returnaddress.io/api/stripe/webhook`
4. **Description**: "Return Address webhook handler"
5. **Events to listen to**:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_failed`
6. Click **"Add endpoint"**

### 4.2 Get Webhook Secret

1. Click on the webhook endpoint you just created
2. Copy the **"Signing secret"** (starts with `whsec_`)
3. Go to Vercel → **"Settings"** → **"Environment Variables"**
4. Update `STRIPE_WEBHOOK_SECRET` with the new value
5. **Redeploy** the project (or wait for next deployment)

### 4.3 Test Webhook

Use Stripe CLI to test:

```bash
stripe listen --forward-to https://returnaddress.io/api/stripe/webhook
```

Or test with a test subscription in Stripe Dashboard.

---

## Step 5: Post-Deployment Configuration

### 5.1 Verify Environment Variables

1. Go to Vercel → **"Settings"** → **"Environment Variables"**
2. Verify all variables are set correctly
3. Ensure `NEXT_PUBLIC_APP_URL=https://returnaddress.io`

### 5.2 Run Database Migration

If this is the first deployment, ensure database is set up:

```bash
# Via Vercel CLI (if installed)
vercel env pull .env.local
npx prisma migrate deploy

# Or via Supabase MCP/dashboard
```

### 5.3 Verify Build

1. Check build logs in Vercel dashboard
2. Ensure no build errors
3. Check function logs for runtime errors

---

## Step 6: Test Deployment

### 6.1 Basic Checks

- [ ] Visit `https://returnaddress.io` - homepage loads
- [ ] Visit `https://returnaddress.io/creator/onboarding` - creator flow works
- [ ] Sign in with Clerk - authentication works
- [ ] Create test agent - agent creation works
- [ ] Test Stripe Connect - onboarding works

### 6.2 Stripe Webhook Test

- [ ] Create test subscription
- [ ] Check Vercel function logs for webhook events
- [ ] Verify subscription created in database

### 6.3 Agent Runtime Test

- [ ] Publish test agent
- [ ] Visit agent detail page
- [ ] Send test message via invoke endpoint
- [ ] Verify response and logging

---

## Step 7: Vercel CLI Deployment (Alternative)

If you prefer CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Set environment variables
vercel env add DATABASE_URL
vercel env add NEXT_PUBLIC_APP_URL
# ... (add all variables)

# Deploy
vercel --prod
```

---

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://...` |
| `NEXT_PUBLIC_APP_URL` | Production app URL | `https://returnaddress.io` |
| `CLERK_SECRET_KEY` | Clerk secret key | `sk_live_...` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public key | `pk_live_...` |
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_live_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe public key | `pk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | `whsec_...` |
| `OPENAI_API_KEY` | OpenAI API key | `sk-...` |
| `S3_ENDPOINT` | Supabase Storage endpoint | `https://...supabase.co/storage/v1/s3` |
| `S3_ACCESS_KEY_ID` | Storage access key | `...` |
| `S3_SECRET_ACCESS_KEY` | Storage secret key | `...` |
| `S3_BUCKET_NAME` | Storage bucket name | `return-address-files` |
| `S3_REGION` | Storage region | `us-east-1` |
| `SUPABASE_URL` | Supabase project URL | `https://...supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `eyJ...` |
| `ADMIN_EMAILS` | Admin email addresses | `admin@example.com` |
| `PLATFORM_FEE_BPS` | Platform fee (basis points) | `500` |

---

## Troubleshooting

### Build Failures

**Error: Module not found**
```bash
# Ensure all dependencies are in package.json
npm install
```

**Error: Prisma Client not generated**
```bash
# Add to build command in Vercel:
npm run db:generate && npm run build
```

**Error: Environment variable missing**
- Check Vercel → Settings → Environment Variables
- Ensure all required variables are set
- Redeploy after adding variables

### DNS Issues

**Domain not resolving**
- Wait 5-60 minutes for DNS propagation
- Check DNS records at your registrar
- Verify nameservers (if using Vercel nameservers)

**SSL Certificate not issued**
- Wait for DNS propagation
- Vercel automatically issues certificates (can take up to 24h)
- Check domain status in Vercel dashboard

### Webhook Issues

**Webhook not receiving events**
- Verify webhook URL: `https://returnaddress.io/api/stripe/webhook`
- Check webhook secret in Vercel environment variables
- Check Vercel function logs for errors
- Test with Stripe CLI: `stripe listen --forward-to https://returnaddress.io/api/stripe/webhook`

### Database Issues

**Connection errors**
- Verify `DATABASE_URL` is correct
- Check Supabase database is accessible
- Ensure database allows connections from Vercel IPs

---

## Production Checklist

- [ ] All environment variables set in Vercel
- [ ] `NEXT_PUBLIC_APP_URL=https://returnaddress.io`
- [ ] Domain configured and SSL certificate issued
- [ ] Stripe webhook configured with production URL
- [ ] Database migrations applied
- [ ] Build succeeds without errors
- [ ] Basic functionality tested (auth, agent creation, payments)
- [ ] Webhook events received and processed
- [ ] Error tracking configured (optional but recommended)
- [ ] Monitoring set up (optional but recommended)

---

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Configure domain (returnaddress.io)
3. ✅ Set up Stripe webhook
4. ⚠️ Test end-to-end flows
5. ⚠️ Monitor for errors
6. ⚠️ Onboard first creators

---

## Support

- Vercel Docs: https://vercel.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment
- Stripe Webhooks: https://stripe.com/docs/webhooks
- Domain Setup: https://vercel.com/docs/concepts/projects/domains

---

## Status

✅ **Ready for Deployment**

All configuration complete. Follow steps above to deploy to Vercel.

