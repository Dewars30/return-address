# Supabase Storage (S3-Compatible) Setup Guide

## Step 1: Create Storage Bucket in Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project (project ref: `lhcpemvphloxrjrcuoza`)
3. Navigate to **Storage** in the left sidebar
4. Click **New bucket**
5. Create a bucket named: `return-address-files`
6. Set it to **Public** (or Private, depending on your needs)
7. Click **Create bucket**

## Step 2: Enable S3 Compatibility & Generate Access Keys

1. In Supabase Dashboard, go to **Storage** → **Settings**
2. Scroll to **S3 Connection** section
3. Enable **S3 Compatibility** if not already enabled
4. Scroll to **S3 Access Keys** section
5. Click **Generate New Keys**
6. **IMPORTANT**: Copy both:
   - **Access Key ID**
   - **Secret Access Key**
   - (You'll only see the secret once!)

## Step 3: Get Your Storage Endpoint

Your Supabase Storage S3 endpoint will be:
```
https://lhcpemvphloxrjrcuoza.supabase.co/storage/v1/s3
```

The region is typically: `us-east-1` (or check in Storage Settings)

## Step 4: Update .env File

Add/update these values in your `.env`:

```bash
# Storage (S3-compatible - Supabase Storage)
S3_BUCKET_NAME=return-address-files
S3_REGION=us-east-1
S3_ENDPOINT=https://lhcpemvphloxrjrcuoza.supabase.co/storage/v1/s3
S3_ACCESS_KEY_ID=your-access-key-id-here
S3_SECRET_ACCESS_KEY=your-secret-access-key-here
```

## Step 5: Install AWS SDK (for S3 operations)

```bash
npm install @aws-sdk/client-s3
```

## Step 6: Create Storage Helper

We'll need to create a storage helper file to upload/download files.

---

## Quick Setup Checklist

- [ ] Create bucket `return-address-files` in Supabase
- [ ] Enable S3 Compatibility in Storage Settings
- [ ] Generate S3 Access Keys
- [ ] Copy Access Key ID and Secret Access Key
- [ ] Update .env with storage credentials
- [ ] Install @aws-sdk/client-s3
- [ ] Test file upload

---

## Next Steps

Once you have the access keys, I can:
1. Update your .env file with the credentials
2. Create a storage helper utility (`lib/storage.ts`)
3. Implement file upload/download functions for agent knowledge files

