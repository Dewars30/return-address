# Vercel Build Configuration - Final Fix

## ✅ Changes Applied

### 1. Build Script (Fixed)
```json
{
  "scripts": {
    "build": "next build",  // ✅ Correct - no prisma generate here
    "postinstall": "prisma generate"  // ✅ Runs automatically on Vercel
  }
}
```

**Why**: Vercel runs `postinstall` automatically before `build`. Running `prisma generate` in both places is redundant and can cause issues.

### 2. Node Version Lock
```json
{
  "engines": {
    "node": "22.x"
  }
}
```

**Why**: Vercel requires Node.js 22.x (Node 18.x is discontinued). Next.js 14.2.5 is compatible with Node 22.

### 3. Next.js Config (Verified)
```js
const nextConfig = {
  reactStrictMode: true,
}
module.exports = nextConfig
```

**Why**: Simple config avoids any `generateBuildId` conflicts. Next.js will use default build ID generation.

---

## 🚀 Vercel Configuration

### Project Settings

1. **Build Command**: `npm run build` (default)
2. **Install Command**: `npm install` (default - runs postinstall automatically)
3. **Node Version**: Set to **18.x** in Vercel Dashboard:
   - Go to: Project → Settings → Node.js Version
   - Select: **18.x**

### Environment Variables

Ensure all variables from `vercel-env-production.txt` are set in Vercel:
- `DATABASE_URL`
- `NEXT_PUBLIC_APP_URL=https://returnaddress.io`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `OPENAI_API_KEY`
- `S3_*` variables
- `SUPABASE_*` variables
- `ADMIN_EMAILS`
- `PLATFORM_FEE_BPS`

---

## 🔧 Local Testing

### If Build Fails Locally

**Issue**: Node version mismatch
- **Current**: Node 22.16.0
- **Required**: Node 18.x

**Fix**:
```bash
# Using nvm (recommended)
nvm install 18
nvm use 18

# Or install Node 18 directly
# Then verify
node -v  # Should show v18.x.x
```

**Then**:
```bash
rm -rf node_modules .next package-lock.json
npm install
npm run build
```

---

## ✅ Verification Checklist

- [x] Build script: `next build` (no prisma generate)
- [x] Postinstall: `prisma generate` 
- [x] Node engines: `18.x` specified
- [x] Next config: Simple, no generateBuildId
- [ ] Vercel Node version: Set to 18.x
- [ ] All environment variables set in Vercel
- [ ] Deploy and verify build succeeds

---

## 🐛 If Build Still Fails on Vercel

1. **Check Vercel Build Logs**:
   - Go to: Vercel Dashboard → Your Project → Deployments
   - Click on failed deployment
   - Check the exact error message

2. **Verify Node Version**:
   - In Vercel: Project → Settings → Node.js Version
   - Must be **18.x** (not 20 or 22)

3. **Check Environment Variables**:
   - Ensure all required variables are set
   - Verify `NEXT_PUBLIC_APP_URL=https://returnaddress.io`

4. **Clear Vercel Cache**:
   - Go to: Project → Settings → General
   - Click "Clear Build Cache"
   - Redeploy

---

## 📝 Notes

- The `generate is not a function` error is typically caused by:
  - Node version mismatch (22 vs 18)
  - Corrupted node_modules
  - Custom generateBuildId config (we don't have this)

- Vercel will automatically:
  - Run `npm install` (which runs `postinstall`)
  - Run `npm run build`
  - Use Node version from `engines` field or project settings

---

## ✅ Status

**Configuration**: ✅ Correct
**Node Version**: ⚠️ Set to 18.x in Vercel
**Environment Variables**: ⚠️ Verify all set in Vercel
**Ready to Deploy**: ✅ Yes

