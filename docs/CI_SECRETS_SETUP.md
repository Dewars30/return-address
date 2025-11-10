# Setting GitHub Secrets for CI

This document explains how to set GitHub Secrets for the CI workflow.

## Required Secrets

These secrets **must** be set for CI to work:

1. **DATABASE_URL**
   - Postgres connection string
   - Can be your Supabase connection string or a CI-specific database
   - **Must be valid** or `npx prisma generate` may fail
   - Example: `postgresql://user:password@host:5432/dbname?schema=public`

2. **NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY**
   - From your Clerk production instance
   - Format: `pk_live_...` or `pk_test_...`

3. **CLERK_SECRET_KEY**
   - From your Clerk production instance
   - Format: `sk_live_...` or `sk_test_...`

4. **STRIPE_SECRET_KEY**
   - From your Stripe account
   - Can use a test key (`sk_test_...`) for CI

## Optional Secrets

These have fallback values in the workflow:

- **STRIPE_WEBHOOK_SECRET**: Defaults to `whsec_dummy_for_ci`
- **OPENAI_API_KEY**: Defaults to `dummy_key_for_ci_build` (only needed if build calls OpenAI)
- **NEXT_PUBLIC_APP_URL**: Defaults to `http://localhost:3000`

## Methods to Set Secrets

### Method 1: Using GitHub CLI (Recommended)

```bash
# Required secrets
gh secret set DATABASE_URL --repo Dewars30/return-address
gh secret set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY --repo Dewars30/return-address
gh secret set CLERK_SECRET_KEY --repo Dewars30/return-address
gh secret set STRIPE_SECRET_KEY --repo Dewars30/return-address

# Optional secrets
gh secret set STRIPE_WEBHOOK_SECRET --repo Dewars30/return-address  # Optional
gh secret set OPENAI_API_KEY --repo Dewars30/return-address  # Optional
gh secret set NEXT_PUBLIC_APP_URL --repo Dewars30/return-address  # Optional
```

### Method 2: Using Interactive Script

Run the helper script:

```bash
./scripts/set-ci-secrets.sh
```

### Method 3: Via GitHub Web UI

1. Go to: https://github.com/Dewars30/return-address/settings/secrets/actions
2. Click "New repository secret"
3. Enter name and value
4. Click "Add secret"

## Verify Secrets Are Set

```bash
gh secret list --repo Dewars30/return-address
```

## Important Notes

- **CI gets its own keys** - Don't reuse local `.env` blindly
- **DATABASE_URL must be valid** - Prisma generate requires a real connection
- Secrets are encrypted and only visible to GitHub Actions
- Secrets are scoped to the repository

## Workflow Behavior

The workflow will:
- Use secrets if set
- Fall back to dummy values for optional secrets
- Fail if required secrets are missing

See `.github/workflows/ci.yml` for the exact configuration.

