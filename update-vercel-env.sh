#!/bin/bash

# Script to update Vercel environment variables for database connections
# Usage: ./update-vercel-env.sh [DATABASE_URL] [DIRECT_URL]

if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Usage: ./update-vercel-env.sh [DATABASE_URL] [DIRECT_URL]"
  echo ""
  echo "Example:"
  echo "  ./update-vercel-env.sh \\"
  echo "    'postgres://postgres.lhcpemvphloxrjrcuoza:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true' \\"
  echo "    'postgresql://postgres:[PASSWORD]@db.lhcpemvphloxrjrcuoza.supabase.co:5432/postgres'"
  exit 1
fi

DATABASE_URL="$1"
DIRECT_URL="$2"

echo "Updating DATABASE_URL..."
vercel env rm DATABASE_URL production --yes
vercel env add DATABASE_URL production <<< "$DATABASE_URL"

vercel env rm DATABASE_URL preview --yes
vercel env add DATABASE_URL preview <<< "$DATABASE_URL"

vercel env rm DATABASE_URL development --yes
vercel env add DATABASE_URL development <<< "$DATABASE_URL"

echo ""
echo "Adding DIRECT_URL..."
vercel env add DIRECT_URL production <<< "$DIRECT_URL"
vercel env add DIRECT_URL preview <<< "$DIRECT_URL"
vercel env add DIRECT_URL development <<< "$DIRECT_URL"

echo ""
echo "✅ Environment variables updated!"
echo "Vercel will automatically redeploy with the new values."
