# Database Prepared Statement Fix — 42P05 Error

**Date:** 2025-01-XX  
**Status:** 🔴 Critical Fix Required  
**Error:** `42P05: prepared statement "s5" already exists`

---

## Problem

**Error:** `42P05: prepared statement "s5" already exists`

**Root Cause:**
- Prisma uses prepared statements by default
- Connection poolers (Supabase Supavisor, PgBouncer, Neon pool) don't preserve prepared statements across transactions
- Prisma tries to PREPARE statements on what Postgres thinks is a "new" session
- Postgres throws `42P05` error

**Impact:**
- Agent creation fails (`prisma.agent.create()`)
- Database queries fail intermittently
- "Stuck on landing page" behavior (API returns 500, frontend shows error)

---

## Solution

**Fix:** Add `pgbouncer=true` to `DATABASE_URL` connection string.

This tells Prisma to disable prepared statements for the pooled connection, which is compatible with connection poolers.

---

## Step-by-Step Fix

### Step 1: Update Local `.env` File

**Current format (may or may not have query params):**
```bash
# Example 1 - no query params
DATABASE_URL="postgresql://user:pass@host:6543/dbname"

# Example 2 - has params
DATABASE_URL="postgresql://user:pass@host:6543/dbname?sslmode=require"
```

**Updated format (add `pgbouncer=true`):**
```bash
# If no params exist
DATABASE_URL="postgresql://user:pass@host:6543/dbname?pgbouncer=true"

# If params already exist
DATABASE_URL="postgresql://user:pass@host:6543/dbname?sslmode=require&pgbouncer=true"
```

**Keep DIRECT_URL as direct connection (no pgbouncer=true):**
```bash
# DIRECT_URL should NOT have pgbouncer=true
DIRECT_URL="postgresql://user:pass@host:5432/dbname?sslmode=require"
```

**Pattern:**
- `DATABASE_URL` → Pooled connection (port 6543) **with** `pgbouncer=true`
- `DIRECT_URL` → Direct connection (port 5432) **without** `pgbouncer=true`

---

### Step 2: Regenerate Prisma Client

After updating `.env`:

```bash
# 1. Ensure env is loaded
export $(grep -v '^#' .env | xargs)  # or rely on next dev reading .env

# 2. Generate Prisma client
npx prisma generate

# 3. Run dev
npm run dev
```

**Test:**
- Hit `/api/health/db` → expect `{"status":"ok","database":"connected"}`
- Create agent → should succeed without 42P05 error

---

### Step 3: Update Vercel Environment Variables

**In Vercel Dashboard:**

1. Go to: **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**

2. **Edit `DATABASE_URL`:**
   - Find `DATABASE_URL`
   - Add `pgbouncer=true` as query param:
     - If no params: `?pgbouncer=true`
     - If has params: `&pgbouncer=true`
   - Example:
     ```
     Before: postgresql://user:pass@host:6543/dbname
     After:  postgresql://user:pass@host:6543/dbname?pgbouncer=true
     ```

3. **Verify `DIRECT_URL`:**
   - Should **NOT** have `pgbouncer=true`
   - Should use direct connection (port 5432)
   - Example:
     ```
     DIRECT_URL=postgresql://user:pass@host:5432/dbname?sslmode=require
     ```

4. **Apply to all environments:**
   - Production
   - Preview
   - Development (if used)

5. **Redeploy:**
   - Vercel will auto-redeploy after env var changes
   - Or trigger manual redeploy

---

### Step 4: Verify After Deploy

**Test in production:**

1. **Health check:**
   ```bash
   curl https://returnaddress.io/api/health/db
   ```
   Expected: `{"status":"ok","database":"connected"}`

2. **Create agent:**
   - Sign in as creator
   - Navigate to `/creator/agents/new`
   - Fill out form and submit
   - Should succeed without 42P05 error

---

## Why This Works

**Before (with prepared statements):**
1. Prisma: `PREPARE s5 AS SELECT ...`
2. Connection pooler: Returns connection to pool
3. Next request: Prisma tries `PREPARE s5 AS ...` again
4. Postgres: "s5 already exists" → `42P05` error

**After (with `pgbouncer=true`):**
1. Prisma: Disables prepared statements
2. Uses regular queries instead
3. Connection pooler: Works correctly
4. No `42P05` errors

---

## Connection String Examples

### Supabase Connection Pooler

**DATABASE_URL (with pgbouncer=true):**
```
postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
```

**DIRECT_URL (no pgbouncer=true):**
```
postgresql://postgres.[project-ref]:[password]@db.[project-ref].supabase.co:5432/postgres
```

### Neon Connection Pooler

**DATABASE_URL (with pgbouncer=true):**
```
postgresql://user:pass@[project].pooler.neon.tech:5432/dbname?pgbouncer=true
```

**DIRECT_URL (no pgbouncer=true):**
```
postgresql://user:pass@[project].neon.tech:5432/dbname
```

---

## Verification Checklist

- [ ] Updated local `.env` with `pgbouncer=true` in `DATABASE_URL`
- [ ] Verified `DIRECT_URL` does NOT have `pgbouncer=true`
- [ ] Regenerated Prisma client (`npx prisma generate`)
- [ ] Tested locally (`npm run dev`)
- [ ] Health check works (`/api/health/db`)
- [ ] Agent creation works locally
- [ ] Updated Vercel `DATABASE_URL` with `pgbouncer=true`
- [ ] Verified Vercel `DIRECT_URL` does NOT have `pgbouncer=true`
- [ ] Redeployed on Vercel
- [ ] Tested production health check
- [ ] Tested production agent creation

---

## Optional: Simplify Health Check

Once `pgbouncer=true` is in place, you can simplify the health check:

**Current (works but verbose):**
```typescript
await prisma.$queryRawUnsafe("SELECT 1");
```

**Simplified (also works):**
```typescript
await prisma.$queryRaw`SELECT 1`;
```

Both work because prepared statements are disabled at the connection level, not per-query.

---

## Summary

**Fix:** Add `pgbouncer=true` to `DATABASE_URL` connection string.

**Pattern:**
- `DATABASE_URL` → Pooled (port 6543) **with** `pgbouncer=true`
- `DIRECT_URL` → Direct (port 5432) **without** `pgbouncer=true`

**Result:**
- ✅ No more `42P05` errors
- ✅ Agent creation works
- ✅ All Prisma queries work correctly

---

**Status:** Ready for Implementation  
**Priority:** 🔴 Critical - Blocks agent creation

