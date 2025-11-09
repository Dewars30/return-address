# Quick Database Connection Fix

## The Problem

Error: `FATAL: Tenant or user not found`

**Root Cause:** The connection string format in Vercel is incorrect. Supabase requires a specific username format: `postgres.[project-ref]` instead of just `postgres`.

## The Fix

### Step 1: Get Your Database Password

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **Database**
4. Find **Database password** section
5. If you don't know it, click **Reset database password** and copy the new password

### Step 2: Construct Correct Connection Strings

**Project Reference:** `lhcpemvphloxrjrcuoza`
**Region:** `us-west-1` (verify in Supabase Dashboard → Settings → Infrastructure)

**DATABASE_URL** (Connection Pooler - Port 6543):
```
postgresql://postgres.lhcpemvphloxrjrcuoza:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**DIRECT_URL** (Direct Connection - Port 5432):
```
postgresql://postgres.lhcpemvphloxrjrcuoza:[YOUR-PASSWORD]@db.lhcpemvphloxrjrcuoza.supabase.co:5432/postgres
```

**Important:**
- Replace `[YOUR-PASSWORD]` with your actual password
- If password has special characters, URL-encode them:
  - `@` → `%40`
  - `:` → `%3A`
  - `/` → `%2F`
  - ` ` (space) → `%20`

### Step 3: Update Vercel Environment Variables

Run these commands (replace `[YOUR-PASSWORD]` with actual password):

```bash
# Update DATABASE_URL
vercel env rm DATABASE_URL production --yes
echo "postgresql://postgres.lhcpemvphloxrjrcuoza:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true" | vercel env add DATABASE_URL production

# Update DIRECT_URL
vercel env rm DIRECT_URL production --yes
echo "postgresql://postgres.lhcpemvphloxrjrcuoza:[YOUR-PASSWORD]@db.lhcpemvphloxrjrcuoza.supabase.co:5432/postgres" | vercel env add DIRECT_URL production

# Also update for Preview and Development environments
vercel env rm DATABASE_URL preview --yes
echo "postgresql://postgres.lhcpemvphloxrjrcuoza:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true" | vercel env add DATABASE_URL preview

vercel env rm DIRECT_URL preview --yes
echo "postgresql://postgres.lhcpemvphloxrjrcuoza:[YOUR-PASSWORD]@db.lhcpemvphloxrjrcuoza.supabase.co:5432/postgres" | vercel env add DIRECT_URL preview
```

### Step 4: Redeploy

After updating environment variables, Vercel will auto-redeploy, or trigger manually:

```bash
vercel --prod
```

### Step 5: Verify Fix

Test the connection:

```bash
curl https://returnaddress.io/api/health/db
```

Expected response:
```json
{
  "status": "ok",
  "database": "connected",
  "test": [{"test": 1}]
}
```

## Key Differences

**❌ Wrong Format:**
```
postgresql://postgres:password@host:5432/postgres
```

**✅ Correct Format:**
```
postgresql://postgres.lhcpemvphloxrjrcuoza:password@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Changes:**
1. Username: `postgres` → `postgres.lhcpemvphloxrjrcuoza`
2. Host: `db.xxx.supabase.co` → `aws-0-us-west-1.pooler.supabase.com` (for pooler)
3. Port: `5432` → `6543` (for pooler)
4. Added: `?pgbouncer=true` parameter

## Verification Checklist

- [ ] Got password from Supabase Dashboard
- [ ] Constructed correct DATABASE_URL with `postgres.[project-ref]` username
- [ ] Constructed correct DIRECT_URL with `postgres.[project-ref]` username
- [ ] URL-encoded password if it has special characters
- [ ] Updated DATABASE_URL in Vercel (all environments)
- [ ] Updated DIRECT_URL in Vercel (all environments)
- [ ] Redeployed application
- [ ] Tested `/api/health/db` endpoint
- [ ] Verified no more "Tenant or user not found" errors

---

**Status:** Ready to fix - Follow steps above

