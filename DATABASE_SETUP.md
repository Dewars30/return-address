# Database Setup Guide - Supabase with Vercel

## Overview

This guide explains how to configure Supabase database connections for serverless deployments on Vercel. Supabase recommends using **connection pooling** for serverless applications to manage database connections efficiently.

## Connection Types

### 1. Direct Connection (Port 5432)
- Used for: **Migrations** and **local development**
- Format: `postgresql://[user]:[password]@db.[project-ref].supabase.co:5432/postgres`
- Set as: `DIRECT_URL` environment variable

### 2. Connection Pooler (Port 6543)
- Used for: **Serverless functions** (Vercel, AWS Lambda, etc.)
- Format: `postgresql://[user]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true`
- Set as: `DATABASE_URL` environment variable
- **Why**: Prevents connection exhaustion in serverless environments

## Setup Steps

### Step 1: Get Connection Strings from Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **Database**
4. Find **Connection string** section
5. Copy both:
   - **URI** (direct connection, port 5432) → Use for `DIRECT_URL`
   - **Connection pooling** → **Session mode** (port 6543) → Use for `DATABASE_URL`

### Step 2: Set Environment Variables in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: **return-address**
3. Go to **Settings** → **Environment Variables**
4. Add/Update these variables:

#### For Production:
```
DATABASE_URL=postgresql://postgres:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

#### For Preview/Development:
```
DATABASE_URL=postgresql://postgres:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

**Important Notes**:
- Replace `[PASSWORD]` with your actual database password
- Replace `[REGION]` with your AWS region (e.g., `us-east-1`, `us-west-1`)
- Replace `[PROJECT-REF]` with your Supabase project reference (e.g., `lhcpemvphloxrjrcuoza`)
- URL-encode special characters in password if needed

### Step 3: Update Local `.env` File

Add both variables to your local `.env` file:

```bash
# Database - Connection Pooler (for serverless/Next.js)
DATABASE_URL=postgresql://postgres:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true

# Database - Direct Connection (for migrations)
DIRECT_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

### Step 4: Run Migrations

After setting `DIRECT_URL`, run migrations:

```bash
# Generate Prisma Client
npm run db:generate

# Run migrations (uses DIRECT_URL)
npm run db:migrate

# Or push schema directly (uses DIRECT_URL)
npm run db:push
```

## Prisma Schema Configuration

The `prisma/schema.prisma` file is configured to use both connection strings:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")      // Connection pooler (port 6543)
  directUrl = env("DIRECT_URL")         // Direct connection (port 5432)
}
```

- `url`: Used by Prisma Client for queries (connection pooler)
- `directUrl`: Used by Prisma Migrate for migrations (direct connection)

## Troubleshooting

### Error: "Can't reach database server"

**Causes**:
1. `DATABASE_URL` not set in Vercel environment variables
2. Using direct connection (port 5432) instead of pooler (port 6543)
3. Database paused or credentials incorrect

**Solutions**:
1. Verify `DATABASE_URL` is set in Vercel → Settings → Environment Variables
2. Ensure `DATABASE_URL` uses port **6543** (pooler), not 5432 (direct)
3. Check Supabase dashboard to ensure database is running
4. Verify password is correct and URL-encoded if needed

### Error: "Connection pooler not found"

**Cause**: Wrong connection string format or region mismatch

**Solution**:
- Verify you're using the **Session mode** connection string from Supabase
- Check that the region matches your Supabase project region
- Ensure `?pgbouncer=true` parameter is included

### Error: "Too many connections"

**Cause**: Using direct connection (port 5432) in serverless environment

**Solution**:
- Switch to connection pooler (port 6543) for `DATABASE_URL`
- Keep direct connection (port 5432) only for `DIRECT_URL` (migrations)

## Connection String Examples

### Supabase Project Reference: `lhcpemvphloxrjrcuoza`
### Region: `us-east-1`
### Password: `your-password-here`

**DATABASE_URL** (Connection Pooler):
```
postgresql://postgres:your-password-here@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**DIRECT_URL** (Direct Connection):
```
postgresql://postgres:your-password-here@db.lhcpemvphloxrjrcuoza.supabase.co:5432/postgres
```

## Verification

After setting environment variables:

1. **Check Vercel Logs**:
   - Go to Vercel Dashboard → Your Project → Deployments → Latest → Functions
   - Look for database connection errors

2. **Test Locally**:
   ```bash
   # Test connection
   npm run db:generate
   npm run db:push
   ```

3. **Check Application**:
   - Visit `https://returnaddress.io`
   - Homepage should load without database errors
   - Check browser console and Vercel logs for errors

## Additional Resources

- [Supabase Connection Pooling Docs](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [Prisma Serverless Guide](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

**Last Updated**: After fixing database connection issues
**Status**: Ready for configuration

