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

**Fix:** Set `PRISMA_CLIENT_DISABLE_PREPARED_STATEMENTS=true` environment variable.

This tells Prisma to disable prepared statements globally for all queries, which is compatible with connection poolers.

---

## Step-by-Step Fix

### Step 1: Update Local `.env` File

**Add this environment variable:**
```bash
PRISMA_CLIENT_DISABLE_PREPARED_STATEMENTS=true
```

**Keep your existing DATABASE_URL and DIRECT_URL unchanged:**
```bash
# DATABASE_URL - pooled connection (port 6543)
DATABASE_URL="postgresql://user:pass@host:6543/dbname"

# DIRECT_URL - direct connection (port 5432)
DIRECT_URL="postgresql://user:pass@host:5432/dbname"
```

**No need to modify connection strings** - the env var disables prepared statements globally.

---

### Step 2: Restart Local Dev

After updating `.env`:

```bash
# Restart dev server (picks up new env var)
npm run dev
```

**Test:**
- Hit `/api/health/db` → expect `{"status":"ok","database":"connected"}`
- Create agent → should succeed without 42P05 error

---

### Step 3: Update Vercel Environment Variables

**In Vercel Dashboard:**

1. Go to: **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**

2. **Add new variable:**
   - Name: `PRISMA_CLIENT_DISABLE_PREPARED_STATEMENTS`
   - Value: `true`
   - Apply to: Production, Preview, Development (all environments)

3. **No need to modify DATABASE_URL or DIRECT_URL** - they stay as-is

4. **Redeploy:**
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

**After (with `PRISMA_CLIENT_DISABLE_PREPARED_STATEMENTS=true`):**
1. Prisma: Disables prepared statements globally for all queries
2. Uses regular queries instead
3. Connection pooler: Works correctly
4. No `42P05` errors

---

## Environment Variable Setup

### Local `.env` File

```bash
# Database connections (unchanged)
DATABASE_URL="postgresql://user:pass@host:6543/dbname"
DIRECT_URL="postgresql://user:pass@host:5432/dbname"

# Disable prepared statements globally
PRISMA_CLIENT_DISABLE_PREPARED_STATEMENTS=true
```

### Vercel Environment Variables

Add this variable to all environments (Production, Preview, Development):

```
PRISMA_CLIENT_DISABLE_PREPARED_STATEMENTS=true
```

**No need to modify DATABASE_URL or DIRECT_URL** - they stay as-is.

---

## Verification Checklist

- [ ] Added `PRISMA_CLIENT_DISABLE_PREPARED_STATEMENTS=true` to local `.env`
- [ ] Restarted local dev (`npm run dev`)
- [ ] Health check works locally (`/api/health/db`)
- [ ] Agent creation works locally (no 42P05 error)
- [ ] Added `PRISMA_CLIENT_DISABLE_PREPARED_STATEMENTS=true` to Vercel env vars
- [ ] Applied to all environments (Production, Preview, Development)
- [ ] Redeployed on Vercel
- [ ] Tested production health check
- [ ] Tested production agent creation

---

## Summary

**Fix:** Set `PRISMA_CLIENT_DISABLE_PREPARED_STATEMENTS=true` environment variable.

**What it does:**
- Disables prepared statements globally for all Prisma queries
- Compatible with connection poolers (PgBouncer/Supavisor)
- No need to modify connection strings

**Result:**
- ✅ No more `42P05` errors
- ✅ Agent creation works
- ✅ All Prisma queries work correctly

---

**Status:** Ready for Implementation
**Priority:** 🔴 Critical - Blocks agent creation

