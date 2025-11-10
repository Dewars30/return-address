# Environment Variables Reference

This document lists all environment variables used by Return Address.

## Required Variables

### App
- `NEXT_PUBLIC_APP_URL` - Production app URL (e.g., `https://returnaddress.io`)

### Clerk Authentication
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key (starts with `pk_live_` for production)
- `CLERK_SECRET_KEY` - Clerk secret key (starts with `sk_live_` for production)

### Database
- `DATABASE_URL` - PostgreSQL connection string (connection pooler for serverless)
- `DIRECT_URL` - Direct PostgreSQL connection string (for migrations, port 5432)

### Stripe
- `STRIPE_SECRET_KEY` - Stripe secret key (starts with `sk_live_` for production)
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret (starts with `whsec_`)

### OpenAI
- `OPENAI_API_KEY` - OpenAI API key (starts with `sk-`)

## Optional Variables

### Clerk Redirect URLs (v5 Pattern)
These control Clerk's redirect behavior. If not set, Clerk uses defaults.

- `NEXT_PUBLIC_CLERK_SIGN_IN_URL` - Sign-in page URL (e.g., `/sign-in`)
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL` - Sign-up page URL (e.g., `/sign-up`)
- `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` - Fallback redirect after sign-in (e.g., `/creator/agents`)
- `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` - Fallback redirect after sign-up (e.g., `/creator/agents`)

**Recommended values for production:**
```bash
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/creator/agents
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/creator/agents
```

### Database
- `PRISMA_CLIENT_DISABLE_PREPARED_STATEMENTS` - Set to `true` when using connection poolers (PgBouncer)

### Storage (S3/Supabase)
- `S3_ENDPOINT` - S3-compatible storage endpoint
- `S3_REGION` - Storage region (default: `us-east-1`)
- `S3_ACCESS_KEY_ID` - Storage access key
- `S3_SECRET_ACCESS_KEY` - Storage secret key
- `S3_BUCKET_NAME` - Storage bucket name

### Admin
- `ADMIN_EMAILS` - Comma-separated list of admin email addresses

### Platform
- `PLATFORM_FEE_BPS` - Platform fee in basis points (default: 500 = 5%)

## Setup Instructions

1. Copy this file to `.env.local` for local development
2. Set all required variables
3. Set optional variables as needed
4. In Vercel, add all variables via Dashboard → Settings → Environment Variables
5. In Clerk Dashboard, configure redirect URLs to match your `NEXT_PUBLIC_CLERK_*` variables

## Notes

- All `NEXT_PUBLIC_*` variables are exposed to the browser
- Never commit `.env` files to version control
- Use production keys (`pk_live_`, `sk_live_`) in production, not test keys
- Database URLs should use connection pooler (`?pgbouncer=true`) for serverless deployments

