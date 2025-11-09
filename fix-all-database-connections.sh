#!/bin/bash

# Comprehensive Database Connection Fix
# This script fixes DATABASE_URL and DIRECT_URL for all Vercel environments

set -e

PROJECT_REF="lhcpemvphloxrjrcuoza"
REGION="us-west-1"
PASSWORD="Moose&Squirrel86!"

# URL encode password
ENCODED_PASSWORD=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$PASSWORD', safe=''))")

# Construct connection strings
DATABASE_URL="postgresql://postgres.$PROJECT_REF:$ENCODED_PASSWORD@aws-0-$REGION.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.$PROJECT_REF:$ENCODED_PASSWORD@db.$PROJECT_REF.supabase.co:5432/postgres"

echo "🔧 Fixing Database Connection Strings"
echo "======================================"
echo ""
echo "Project Reference: $PROJECT_REF"
echo "Region: $REGION"
echo "Password: [HIDDEN]"
echo "Encoded Password: $ENCODED_PASSWORD"
echo ""
echo "DATABASE_URL (Connection Pooler):"
echo "$DATABASE_URL"
echo ""
echo "DIRECT_URL (Direct Connection):"
echo "$DIRECT_URL"
echo ""

# Function to update environment variable
update_env_var() {
    local var_name=$1
    local var_value=$2
    local env=$3

    echo "Updating $var_name for $env..."

    # Remove existing variable
    vercel env rm "$var_name" "$env" --yes 2>/dev/null || true

    # Add new variable
    echo "$var_value" | vercel env add "$var_name" "$env"

    echo "✅ Updated $var_name for $env"
}

# Update for all environments
for env in production preview development; do
    echo ""
    echo "📦 Updating $env environment..."
    update_env_var "DATABASE_URL" "$DATABASE_URL" "$env"
    update_env_var "DIRECT_URL" "$DIRECT_URL" "$env"
done

echo ""
echo "✅ All environment variables updated!"
echo ""
echo "🚀 Next steps:"
echo "1. Vercel will auto-redeploy"
echo "2. Wait for deployment to complete (~2 minutes)"
echo "3. Test: curl https://returnaddress.io/api/health/db"
echo ""

