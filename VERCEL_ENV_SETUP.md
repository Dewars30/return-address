# Vercel Environment Variables Setup

## 📋 Required Environment Variables

Copy these variables to Vercel Dashboard → Settings → Environment Variables.
Replace all `xxx` placeholders with your actual values.

```bash
# Database
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB_NAME

# App URL (IMPORTANT: Set to production domain)
NEXT_PUBLIC_APP_URL=https://returnaddress.io

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx
CLERK_SECRET_KEY=sk_live_xxx

# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# OpenAI
OPENAI_API_KEY=sk-xxx

# Supabase Storage
S3_ENDPOINT=https://your-project.supabase.co/storage/v1/s3
S3_ACCESS_KEY_ID=xxx
S3_SECRET_ACCESS_KEY=xxx
S3_BUCKET_NAME=return-address-files
S3_REGION=us-east-1

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxx

# Admin
ADMIN_EMAILS=your-email@example.com

# Platform Fee
PLATFORM_FEE_BPS=500
```

## 🚀 Setup Instructions

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add each variable from the list above
3. Replace all `xxx` placeholders with your actual values
4. Set `NEXT_PUBLIC_APP_URL=https://returnaddress.io`
5. Set `ADMIN_EMAILS` to your actual email address
6. Redeploy after adding variables

## ⚠️ Important Notes

- Use **production keys** (not test keys) for Clerk and Stripe in production
- Get `STRIPE_WEBHOOK_SECRET` after configuring the webhook endpoint
- All values should match your actual `.env` file (but use production keys)

