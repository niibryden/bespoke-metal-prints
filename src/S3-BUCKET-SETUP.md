# S3 Bucket Setup Guide

## Architecture: Segmented Prefix Structure

Your S3 bucket uses a **segmented prefix architecture** for secure, organized storage:

```
s3://your-bucket-name/
├── stock/
│   ├── web/              ← PUBLIC (for website display)
│   │   ├── Nature/
│   │   ├── Abstract/
│   │   └── Modern/
│   └── original/         ← PRIVATE (high-res for printing)
│       ├── Nature/
│       ├── Abstract/
│       └── Modern/
├── customer-uploads/     ← PRIVATE (customer uploaded images)
└── orders/              ← PRIVATE (order images)
```

## Required S3 Bucket Policy

Apply this policy to your S3 bucket to allow **public read access ONLY to `stock/web/*`**:

### Step 1: Go to AWS S3 Console
1. Navigate to your bucket
2. Click **Permissions** tab
3. Scroll to **Bucket Policy**
4. Click **Edit**

### Step 2: Add This Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadStockWebPhotos",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/stock/web/*"
    }
  ]
}
```

**⚠️ IMPORTANT:** Replace `YOUR-BUCKET-NAME` with your actual bucket name (the value from `AWS_S3_BUCKET_NAME` environment variable).

### Step 3: Configure Public Access Settings

1. In the **Permissions** tab, find **Block Public Access (bucket settings)**
2. Click **Edit**
3. **Uncheck** the following to allow the bucket policy above:
   - ❌ Block public access to buckets and objects granted through **new public bucket or access point policies**
   
4. **Keep checked** (for safety):
   - ✅ Block public access to buckets and objects granted through **any public bucket or access point policies** (you can uncheck this one)
   - ✅ Block public and cross-account access to buckets and objects through **any public bucket or access point policies**

**Or simply uncheck ALL** if you want the simplest setup (the bucket policy will still restrict public access to only `stock/web/*`).

5. Click **Save changes**
6. Confirm by typing "confirm"

## What This Achieves

✅ **Public Access**: Only files in `stock/web/*` are publicly accessible (for website display)

✅ **Private Storage**: All other prefixes remain private:
- `stock/original/*` - High-resolution images (private, for printing)
- `customer-uploads/*` - Customer uploads during checkout (private)
- `orders/*` - Order-related files (private)

✅ **Security**: No risk of exposing sensitive customer data

## Folder Structure Details

### When you upload via Admin Panel:
- **Web version**: Saved to `stock/web/{CollectionName}/{timestamp}.jpg` (PUBLIC)
- **Original version**: Saved to `stock/original/{CollectionName}/{timestamp}.jpg` (PRIVATE)

### URLs Generated:
- Web: `https://your-bucket.s3.region.amazonaws.com/stock/web/Nature/123456.jpg` ✅ PUBLIC
- Original: `https://your-bucket.s3.region.amazonaws.com/stock/original/Nature/123456.jpg` ❌ PRIVATE

## Testing

After applying the policy:

1. **Upload a photo** via Admin Panel → Photos tab
2. **Check S3**: You should see files in both `stock/web/` and `stock/original/`
3. **Test public access**: Copy the web URL and open it in an incognito browser
   - ✅ `stock/web/*` URL should load the image
   - ❌ `stock/original/*` URL should show "Access Denied"

## Current Environment Variables

Make sure these are set in Supabase Edge Function Secrets:

- ✅ `AWS_ACCESS_KEY_ID`
- ✅ `AWS_SECRET_ACCESS_KEY`
- ✅ `AWS_S3_BUCKET_NAME`
- ✅ `AWS_REGION`

You've already configured these, so you're good to go! 🎉
