# Database Connection Fix - "Tenant or user not found"

## 🔴 Critical Error

**Error:** `FATAL: Tenant or user not found`
**Location:** All database queries
**Impact:** Blocks all API endpoints, agent runtime, creator dashboard

## 🔍 Root Cause Analysis

This Supabase-specific error indicates one of these issues:

1. **Incorrect Connection String Format**
   - Wrong hostname format
   - Missing required parameters
   - Incorrect port number

2. **Invalid Credentials**
   - Password is incorrect
   - Password needs URL encoding (special characters)
   - Database user doesn't exist

3. **Wrong Project Reference**
   - Project reference in connection string doesn't match Supabase project
   - Region mismatch

4. **Database Not Found**
   - Database name incorrect (should be `postgres`)
   - Database doesn't exist

## ✅ Fix Steps

### Step 1: Get Correct Connection Strings from Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **Database**
4. Scroll to **Connection string** section
5. Copy **exact** strings:

   **For DATABASE_URL (Connection Pooler):**
   - Click **Connection pooling** tab
   - Select **Session mode**
   - Copy the **URI** (should include `pooler.supabase.com:6543`)
   - Format should be: `postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true`

   **For DIRECT_URL (Direct Connection):**
   - Click **URI** tab (direct connection)
   - Copy the **URI** (should include `db.[project-ref].supabase.co:5432`)
   - Format should be: `postgresql://postgres.[project-ref]:[password]@db.[project-ref].supabase.co:5432/postgres`

### Step 2: Verify Password Encoding

If your password contains special characters, they must be URL-encoded:

**Special Characters to Encode:**
- `@` → `%40`
- `:` → `%3A`
- `/` → `%2F`
- `?` → `%3F`
- `#` → `%23`
- `[` → `%5B`
- `]` → `%5D`
- ` ` (space) → `%20` or `+`

**Example:**
- Password: `my@pass:word`
- Encoded: `my%40pass%3Aword`

### Step 3: Update Vercel Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select project: **return-address**
3. Go to **Settings** → **Environment Variables**
4. **Update** (don't delete and recreate) these variables:

   **DATABASE_URL:**
   ```
   postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
   ```

   **DIRECT_URL:**
   ```
   postgresql://postgres.[PROJECT-REF]:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

5. **Important:**
   - Replace `[PROJECT-REF]` with your actual Supabase project reference
   - Replace `[PASSWORD]` with your actual password (URL-encoded if needed)
   - Replace `[REGION]` with your AWS region (e.g., `us-west-1`, `us-east-1`)
   - Use **exact** strings from Supabase Dashboard (don't modify)

### Step 4: Verify Connection String Format

**Correct Format Examples:**

**DATABASE_URL (Connection Pooler):**
```
postgresql://postgres.lhcpemvphloxrjrcuoza:your-password@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**DIRECT_URL (Direct Connection):**
```
postgresql://postgres.lhcpemvphloxrjrcuoza:your-password@db.lhcpemvphloxrjrcuoza.supabase.co:5432/postgres
```

**Key Points:**
- `postgres.[PROJECT-REF]` is the username format
- Port `6543` for pooler, `5432` for direct
- `?pgbouncer=true` parameter required for pooler
- Database name is always `postgres`

### Step 5: Test Connection

After updating environment variables:

1. **Redeploy** (Vercel will auto-deploy or trigger manually)
2. **Test API endpoint:**
   ```bash
   curl https://returnaddress.io/api/agents/test/invoke \
     -X POST \
     -H "Content-Type: application/json" \
     -d '{"message":"test"}'
   ```
3. **Check Vercel Logs:**
   - Go to Vercel Dashboard → Deployments → Latest → Functions
   - Look for database connection errors

### Step 6: Verify in Supabase Dashboard

1. Go to Supabase Dashboard → **Settings** → **Database**
2. Check **Connection info** section
3. Verify:
   - Project reference matches your connection string
   - Region matches your connection string
   - Database is **Active** (not paused)

## 🔧 Troubleshooting

### Error Persists After Fix

1. **Check Supabase Project Status:**
   - Ensure database is not paused
   - Verify project is active

2. **Verify Password:**
   - Reset database password in Supabase Dashboard
   - Update connection strings with new password
   - Ensure password is URL-encoded if needed

3. **Check Region:**
   - Verify region in Supabase Dashboard matches connection string
   - Common regions: `us-east-1`, `us-west-1`, `eu-west-1`

4. **Test Locally:**
   ```bash
   # Set environment variables locally
   export DATABASE_URL="your-connection-string"

   # Test connection
   npx prisma db pull
   ```

### Common Mistakes

1. **Using wrong port:**
   - ❌ Using `5432` for `DATABASE_URL` (should be `6543`)
   - ✅ Use `6543` for pooler, `5432` for direct

2. **Missing pgbouncer parameter:**
   - ❌ `postgresql://...:6543/postgres`
   - ✅ `postgresql://...:6543/postgres?pgbouncer=true`

3. **Wrong username format:**
   - ❌ `postgres:password@...`
   - ✅ `postgres.[project-ref]:password@...`

4. **Password not URL-encoded:**
   - ❌ Password with `@` or `:` characters
   - ✅ URL-encode special characters

## 📋 Checklist

- [ ] Got connection strings from Supabase Dashboard
- [ ] Verified password encoding (if special characters)
- [ ] Updated `DATABASE_URL` in Vercel (port 6543, with `?pgbouncer=true`)
- [ ] Updated `DIRECT_URL` in Vercel (port 5432)
- [ ] Verified project reference matches
- [ ] Verified region matches
- [ ] Redeployed application
- [ ] Tested API endpoint
- [ ] Checked Vercel logs for errors

## 🎯 Expected Result

After fixing:
- ✅ API endpoints return 200/404 (not 500)
- ✅ Database queries succeed
- ✅ Marketplace loads agents (if any exist)
- ✅ Creator dashboard loads
- ✅ Agent runtime works

---

**Status:** Waiting for connection string verification and update

