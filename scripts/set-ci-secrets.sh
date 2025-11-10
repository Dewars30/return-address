#!/bin/bash
# Helper script to set GitHub Secrets for CI
# Usage: ./scripts/set-ci-secrets.sh

set -e

REPO="Dewars30/return-address"

echo "🔐 Setting GitHub Secrets for CI"
echo "Repository: $REPO"
echo ""

# Function to set a secret
set_secret() {
  local name=$1
  local description=$2
  local required=${3:-false}

  echo "📝 Setting $name..."
  if [ "$required" = "true" ]; then
    echo "   ⚠️  REQUIRED: $description"
  else
    echo "   ℹ️  Optional: $description"
  fi

  read -sp "Enter value for $name (press Enter to skip if optional): " value
  echo ""

  if [ -z "$value" ]; then
    if [ "$required" = "true" ]; then
      echo "   ❌ Skipped required secret $name. CI may fail."
    else
      echo "   ⏭️  Skipped optional secret $name"
    fi
  else
    if echo "$value" | gh secret set "$name" --repo "$REPO"; then
      echo "   ✅ Set $name successfully"
    else
      echo "   ❌ Failed to set $name"
      exit 1
    fi
  fi
  echo ""
}

# Required secrets
set_secret "DATABASE_URL" "Postgres connection string (e.g., Supabase or CI-specific DB)" true
set_secret "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" "Clerk publishable key from production instance" true
set_secret "CLERK_SECRET_KEY" "Clerk secret key from production instance" true
set_secret "STRIPE_SECRET_KEY" "Stripe secret key (can use test key for CI)" true

# Optional secrets
set_secret "STRIPE_WEBHOOK_SECRET" "Stripe webhook secret (optional, will use dummy in CI)" false
set_secret "OPENAI_API_KEY" "OpenAI API key (optional, only needed if build calls OpenAI)" false
set_secret "NEXT_PUBLIC_APP_URL" "App URL (optional, defaults to http://localhost:3000)" false

echo "✅ Done! Secrets have been set."
echo ""
echo "💡 Tip: You can verify secrets are set with:"
echo "   gh secret list --repo $REPO"
echo ""
echo "⚠️  Note: DATABASE_URL must be valid or Prisma generate may fail."

