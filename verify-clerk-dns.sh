#!/bin/bash

# Clerk DNS Records Verification Script
# This script checks if all Clerk DNS records are properly configured for returnaddress.io

DOMAIN="returnaddress.io"

echo "🔍 Checking Clerk DNS records for $DOMAIN..."
echo ""

# Function to check DNS record
check_record() {
    local name=$1
    local expected=$2
    local full_name="${name}.${DOMAIN}"

    echo "Checking: $full_name"
    result=$(dig +short CNAME "$full_name" 2>/dev/null | head -1)

    if [ -z "$result" ]; then
        echo "  ❌ Not found or not propagated yet"
        return 1
    elif [ "$result" = "$expected." ] || [ "$result" = "$expected" ]; then
        echo "  ✅ OK: $result"
        return 0
    else
        echo "  ⚠️  Unexpected value: $result (expected: $expected)"
        return 1
    fi
}

# Check all 5 records
echo "1. Frontend API (clerk):"
check_record "clerk" "frontend-api.clerk.services"
CLERK_STATUS=$?

echo ""
echo "2. Account Portal (accounts):"
check_record "accounts" "accounts.clerk.services"
ACCOUNTS_STATUS=$?

echo ""
echo "3. Email (clkmail):"
check_record "clkmail" "mail.fva681yz9zbt.clerk.services"
CLKMAIL_STATUS=$?

echo ""
echo "4. DKIM 1 (clk._domainkey):"
check_record "clk._domainkey" "dkim1.fva681yz9zbt.clerk.services"
DKIM1_STATUS=$?

echo ""
echo "5. DKIM 2 (clk2._domainkey):"
check_record "clk2._domainkey" "dkim2.fva681yz9zbt.clerk.services"
DKIM2_STATUS=$?

echo ""
echo "=========================================="
if [ $CLERK_STATUS -eq 0 ] && [ $ACCOUNTS_STATUS -eq 0 ] && [ $CLKMAIL_STATUS -eq 0 ] && [ $DKIM1_STATUS -eq 0 ] && [ $DKIM2_STATUS -eq 0 ]; then
    echo "✅ All DNS records are properly configured!"
    echo ""
    echo "Next steps:"
    echo "1. Go to Clerk Dashboard → Settings → Domains"
    echo "2. Add returnaddress.io as a custom domain"
    echo "3. Wait for Clerk to verify the records"
    exit 0
else
    echo "⏱️  Some records are not yet propagated"
    echo ""
    echo "DNS propagation can take 5-60 minutes (sometimes up to 24 hours)"
    echo "Please wait a bit and run this script again:"
    echo "  ./verify-clerk-dns.sh"
    exit 1
fi

