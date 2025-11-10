#!/bin/bash
# Set GitHub Secrets from environment variables
# Usage:
#   export DATABASE_URL="postgresql://..."
#   export NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
#   export CLERK_SECRET_KEY="sk_live_..."
#   export STRIPE_SECRET_KEY="sk_test_..."
#   ./scripts/set-secrets-from-env.sh

set -e

REPO="Dewars30/return-address"

echo "🔐 Setting GitHub Secrets from environment variables"
echo "Repository: $REPO"
echo ""

# Required secrets
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL is not set"
  echo "   Set it with: export DATABASE_URL='postgresql://...'"
  exit 1
fi

if [ -z "$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" ]; then
  echo "❌ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set"
  exit 1
fi

if [ -z "$CLERK_SECRET_KEY" ]; then
  echo "❌ CLERK_SECRET_KEY is not set"
  exit 1
fi

if [ -z "$STRIPE_SECRET_KEY" ]; then
  echo "❌ STRIPE_SECRET_KEY is not set"
  exit 1
fi

echo "Setting DATABASE_URL..."
echo "$DATABASE_URL" | gh secret set DATABASE_URL --repo "$REPO"
echo "✅ DATABASE_URL set"

echo "Setting NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY..."
echo "$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" | gh secret set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY --repo "$REPO"
echo "✅ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY set"

echo "Setting CLERK_SECRET_KEY..."
echo "$CLERK_SECRET_KEY" | gh secret set CLERK_SECRET_KEY --repo "$REPO"
echo "✅ CLERK_SECRET_KEY set"

echo "Setting STRIPE_SECRET_KEY..."
echo "$STRIPE_SECRET_KEY" | gh secret set STRIPE_SECRET_KEY --repo "$REPO"
echo "✅ STRIPE_SECRET_KEY set"

# Optional secrets
if [ -n "$STRIPE_WEBHOOK_SECRET" ]; then
  echo "Setting STRIPE_WEBHOOK_SECRET..."
  echo "$STRIPE_WEBHOOK_SECRET" | gh secret set STRIPE_WEBHOOK_SECRET --repo "$REPO"
  echo "✅ STRIPE_WEBHOOK_SECRET set"
fi

if [ -n "$OPENAI_API_KEY" ]; then
  echo "Setting OPENAI_API_KEY..."
  echo "$OPENAI_API_KEY" | gh secret set OPENAI_API_KEY --repo "$REPO"
  echo "✅ OPENAI_API_KEY set"
fi

if [ -n "$NEXT_PUBLIC_APP_URL" ]; then
  echo "Setting NEXT_PUBLIC_APP_URL..."
  echo "$NEXT_PUBLIC_APP_URL" | gh secret set NEXT_PUBLIC_APP_URL --repo "$REPO"
  echo "✅ NEXT_PUBLIC_APP_URL set"
fi

echo ""
echo "✅ All secrets set successfully!"
echo ""
echo "Verify with: gh secret list --repo $REPO"

