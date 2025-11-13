# Quick Environment Variable Update — pgbouncer=true

**Purpose:** Fix `42P05: prepared statement "s5" already exists` error

---

## Quick Fix

### Local `.env` File

**Find this line:**
```bash
DATABASE_URL="postgresql://..."
```

**Add `pgbouncer=true` as query param:**

**If no params exist:**
```bash
DATABASE_URL="postgresql://user:pass@host:6543/dbname?pgbouncer=true"
```

**If params already exist:**
```bash
DATABASE_URL="postgresql://user:pass@host:6543/dbname?sslmode=require&pgbouncer=true"
```

**Keep DIRECT_URL unchanged (no pgbouncer=true):**
```bash
DIRECT_URL="postgresql://user:pass@host:5432/dbname?sslmode=require"
```

### Vercel Environment Variables

1. Go to: **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**

2. **Edit `DATABASE_URL`:**
   - Add `?pgbouncer=true` (if no params) or `&pgbouncer=true` (if has params)
   - Apply to: Production, Preview, Development

3. **Verify `DIRECT_URL`:**
   - Should NOT have `pgbouncer=true`
   - Should use port 5432 (direct connection)

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

