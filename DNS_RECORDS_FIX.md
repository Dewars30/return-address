# DNS Records Fix - Vercel Dashboard

## Issue
DNS records show empty names in Vercel dashboard, though CLI shows them correctly.

## Current Status (via CLI)
All 5 CNAME records exist and are correct:
- ✅ `clerk` → `frontend-api.clerk.services.`
- ✅ `accounts` → `accounts.clerk.services.`
- ✅ `clkmail` → `mail.fva681yz9zbt.clerk.services.`
- ✅ `clk._domainkey` → `dkim1.fva681yz9zbt.clerk.services.`
- ✅ `clk2._domainkey` → `dkim2.fva681yz9zbt.clerk.services.`

## Solution: Fix via Vercel Dashboard

Since the Vercel CLI uses an interactive format that's difficult to script, please fix via the dashboard:

### Steps:

1. **Go to Vercel Dashboard**
   - Navigate to: https://vercel.com/dashboard
   - Go to your project → Settings → Domains
   - Click on `returnaddress.io`

2. **Remove Existing Records** (if names are empty)
   - Delete all 5 CNAME records that have empty names
   - Or delete all and recreate

3. **Add Records Correctly** (one by one)
   
   **Record 1:**
   - Type: `CNAME`
   - Name: `clerk` (just "clerk", not "clerk.returnaddress.io")
   - Value: `frontend-api.clerk.services` (no trailing dot)
   
   **Record 2:**
   - Type: `CNAME`
   - Name: `accounts`
   - Value: `accounts.clerk.services`
   
   **Record 3:**
   - Type: `CNAME`
   - Name: `clkmail`
   - Value: `mail.fva681yz9zbt.clerk.services`
   
   **Record 4:**
   - Type: `CNAME`
   - Name: `clk._domainkey`
   - Value: `dkim1.fva681yz9zbt.clerk.services`
   
   **Record 5:**
   - Type: `CNAME`
   - Name: `clk2._domainkey`
   - Value: `dkim2.fva681yz9zbt.clerk.services`

4. **Verify**
   - Check that all records show names correctly
   - Wait 5-10 minutes for DNS propagation
   - Verify in Clerk Dashboard

## Important Notes

- **Name field**: Should be just the subdomain (e.g., `clerk`, not `clerk.returnaddress.io`)
- **Value field**: Should NOT have trailing dot in dashboard (though CLI shows it)
- **Instance ID**: `fva681yz9zbt` must match your Clerk instance

## Verification Commands

After fixing, verify with:
```bash
vercel dns ls returnaddress.io
```

Or check DNS propagation:
```bash
dig CNAME clerk.returnaddress.io
dig CNAME accounts.returnaddress.io
```

