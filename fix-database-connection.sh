#!/bin/bash

# Fix Database Connection Script
# This script helps construct the correct DATABASE_URL and DIRECT_URL for Vercel

PROJECT_REF="lhcpemvphloxrjrcuoza"
REGION="us-west-1"  # Update if different

echo "🔧 Database Connection String Fixer"
echo "===================================="
echo ""
echo "Project Reference: $PROJECT_REF"
echo "Region: $REGION"
echo ""
echo "⚠️  You need to provide your database password."
echo ""
read -sp "Enter your Supabase database password: " PASSWORD
echo ""
echo ""

# URL encode password (basic encoding)
ENCODED_PASSWORD=$(echo -n "$PASSWORD" | jq -sRr @uri 2>/dev/null || echo "$PASSWORD" | sed 's/@/%40/g; s/:/%3A/g; s/\//%2F/g; s/?/%3F/g; s/#/%23/g; s/\[/%5B/g; s/\]/%5D/g; s/ /%20/g')

echo "📋 Correct Connection Strings:"
echo ""
echo "DATABASE_URL (Connection Pooler - for Vercel):"
echo "postgresql://postgres.$PROJECT_REF:$ENCODED_PASSWORD@aws-0-$REGION.pooler.supabase.com:6543/postgres?pgbouncer=true"
echo ""
echo "DIRECT_URL (Direct Connection - for migrations):"
echo "postgresql://postgres.$PROJECT_REF:$ENCODED_PASSWORD@db.$PROJECT_REF.supabase.co:5432/postgres"
echo ""
echo ""
echo "🚀 To update in Vercel, run:"
echo "vercel env rm DATABASE_URL production --yes"
echo "vercel env add DATABASE_URL production"
echo "# Then paste the DATABASE_URL above"
echo ""
echo "vercel env rm DIRECT_URL production --yes"
echo "vercel env add DIRECT_URL production"
echo "# Then paste the DIRECT_URL above"
echo ""

