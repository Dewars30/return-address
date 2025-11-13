# Quick Environment Variable Update — Disable Prepared Statements

**Purpose:** Fix `42P05: prepared statement "s5" already exists` error

---

## Quick Fix

### Local `.env` File

**Add this line:**
```bash
PRISMA_CLIENT_DISABLE_PREPARED_STATEMENTS=true
```

**Keep DATABASE_URL and DIRECT_URL unchanged** - no need to modify them.

### Vercel Environment Variables

1. Go to: **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**

2. **Add new variable:**
   - Name: `PRISMA_CLIENT_DISABLE_PREPARED_STATEMENTS`
   - Value: `true`
   - Apply to: Production, Preview, Development (all environments)

3. **No need to modify DATABASE_URL or DIRECT_URL** - they stay as-is

4. **Redeploy** (auto or manual)

---

## After Update

**Local:**
```bash
npx prisma generate
npm run dev
```

**Test:**
- `/api/health/db` → `{"status":"ok","database":"connected"}`
- Create agent → Should work without 42P05 error

**Production:**
- Wait for Vercel deployment
- Test `/api/health/db`
- Test agent creation

---

**See:** `DATABASE_PGBOUNCER_FIX.md` for detailed explanation

