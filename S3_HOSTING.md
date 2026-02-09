# S3 Static Hosting Configuration Guide

This document describes how to configure the React frontend for static hosting on AWS S3 with proper routing fallback for SPA (Single Page Application) behavior.

## Architecture Overview

```
Internet → S3 Website / CloudFront → React App → Client-Side Routing
```

## Prerequisites

- AWS CLI installed and configured
- Terraform (optional, for infrastructure as code)
- Node.js and npm

## Configuration Files

### 1. Vite Configuration (`vite.config.ts`)

```typescript
export default defineConfig({
  plugins: [react()],
  
  // Use './' for subdirectory deployments
  // Use '/' for root domain deployments
  base: './',
  
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['chart.js', 'react-chartjs-2'],
        },
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    emptyOutDir: true
  }
})
```

### 2. HTML Entry Point (`index.html`)

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>DigiHealth - Dashboard</title>
    <!-- Preload critical assets -->
    <link rel="preload" href="/assets/main-[hash].js" as="script" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

## S3 Bucket Configuration

### Terraform Resource (`frontend.tf`)

```hcl
# S3 Bucket for Frontend
resource "aws_s3_bucket" "frontend" {
  bucket = "student-datalake-frontend"
}

# Website Configuration
resource "aws_s3_bucket_website_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"  # Critical for SPA routing fallback
  }
}

# Public Read Policy
resource "aws_s3_bucket_policy" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid       = "PublicReadGetObject"
      Effect    = "Allow"
      Principal = "*"
      Action    = "s3:GetObject"
      Resource  = "arn:aws:s3:::student-datalake-frontend/*"
    }]
  })
}
```

### AWS Console Setup

1. **Create Bucket**
   - Name: `student-datalake-frontend`
   - Region: `eu-west-1` (or your preferred region)

2. **Enable Static Website Hosting**
   - Properties → Static website hosting
   - Index document: `index.html`
   - Error document: `index.html`
   - Save

3. **Permissions**
   - Block all public access: **OFF**
   - Bucket policy: Apply the policy above

4. **CORS Configuration**
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "HEAD"],
       "AllowedOrigins": ["*"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```

## Deployment Commands

### Option 1: Using AWS CLI

```bash
# Build the frontend
cd Frontend
npm install
npm run build

# Sync to S3 with cache headers
aws s3 sync dist/ s3://student-datalake-frontend \
  --delete \
  --cache-control "max-age=31536000"

# Set shorter cache for HTML (always fetch fresh)
aws s3 cp dist/index.html s3://student-datalake-frontend/index.html \
  --cache-control "max-age=0, no-cache, no-store, must-revalidate"
```

### Option 2: Using Deployment Script

```bash
# Make script executable
chmod +x deploy-frontend.sh

# Deploy with default settings
./deploy-frontend.sh

# Deploy with custom bucket
./deploy-frontend.sh --bucket my-custom-bucket

# Deploy with CloudFront
./deploy-frontend.sh --dist-id E1234567890

# Skip build (if already built)
./deploy-frontend.sh --skip-build
```

### Option 3: Using CloudFormation/CDK

```typescript
// Example CDK code
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment'

const bucket = new s3.Bucket(this, 'FrontendBucket', {
  bucketName: 'student-datalake-frontend',
  websiteIndexDocument: 'index.html',
  publicReadAccess: true,
  removalPolicy: cdk.RemovalPolicy.DESTROY,
})

const distribution = new cloudfront.Distribution(this, 'Distribution', {
  defaultRootObject: 'index.html',
  originConfigs: [{
    s3OriginSource: {
      s3BucketSource: bucket,
    },
    behaviors: [{
      isDefaultBehavior: true,
    }],
  }],
  errorConfigurations: [{
    errorCode: 403,
    responseCode: 200,
    responsePagePath: '/index.html',
  }, {
    errorCode: 404,
    responseCode: 200,
    responsePagePath: '/index.html',
  }],
})

new s3deploy.BucketDeployment(this, 'DeployFrontend', {
  destinationBucket: bucket,
  distribution,
  sources: [s3deploy.Source.asset('./Frontend/dist')],
})
```

## Routing Fallback Configuration

### How It Works

1. User requests `/analytics`
2. S3 returns `No Such Key` for `/analytics`
3. S3 returns `index.html` as error document
4. React Router handles `/analytics` and renders the correct component

### Critical Configuration

```hcl
# Error document must point to index.html
resource "aws_s3_bucket_website_configuration" "frontend" {
  error_document {
    key = "index.html"  # ← Critical for SPA routing
  }
}
```

### CloudFront Error Pages (Optional)

```hcl
resource "aws_cloudfront_distribution" "frontend" {
  # ...

  custom_error_response {
    error_code            = 403
    response_code         = 200  # Return index.html with 200 OK
    response_page_path    = "/index.html"
  }

  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
  }
}
```

## Cache Control Strategy

### Production Build Assets

| File Type | Cache Duration | Rationale |
|-----------|----------------|-----------|
| JS/CSS files | 1 year (31536000s) | Content-hashed filenames |
| Images | 1 year | Immutable content |
| `index.html` | No cache | Always fetch fresh |
| Fonts | 1 year | Content-hashed |

### Deployment Script Cache Headers

```bash
# Static assets - long cache
aws s3 sync dist/ s3://bucket \
  --cache-control "max-age=31536000"

# HTML files - no cache
aws s3 cp dist/index.html s3://bucket/index.html \
  --cache-control "max-age=0, no-cache, no-store, must-revalidate"
```

## CloudFront CDN (Recommended)

### Benefits

- **Global CDN**: Faster loading worldwide
- **HTTPS**: Free SSL certificates
- **Edge Functions**: Lambda@Edge for advanced features
- **Cache Invalidation**: Purge stale content

### Setup

```bash
# Get CloudFront domain
aws cloudfront get-distribution --id DIST_ID --query 'DomainName'

# Create invalidation (after deployment)
aws cloudfront create-invalidation \
  --distribution-id DIST_ID \
  --paths "/*"
```

### TTL Configuration

```hcl
default_cache_behavior {
  # ...
  min_ttl                = 0
  default_ttl            = 86400   # 1 day
  max_ttl                = 31536000 # 1 year
}
```

## Troubleshooting

### 403 Forbidden Errors

**Cause**: Bucket policy or permissions issue

**Solution**:
```bash
# Check bucket policy
aws s3api get-bucket-policy --bucket bucket-name

# Verify public access
aws s3api get-public-access-block --bucket bucket-name
```

### 404 on All Routes Except Root

**Cause**: Error document not configured

**Solution**:
```hcl
# In terraform
resource "aws_s3_bucket_website_configuration" "example" {
  error_document {
    key = "index.html"  # Must be index.html, not error.html
  }
}
```

### CloudFront Serving Old Content

**Cause**: Cache not invalidated

**Solution**:
```bash
aws cloudfront create-invalidation \
  --distribution-id DIST_ID \
  --paths "/*"
```

### Mixed Content Errors (HTTPS)

**Cause**: Resources loaded over HTTP

**Solution**: Ensure all assets use relative paths:
```typescript
// vite.config.ts
base: './',  // Relative paths
```

## Performance Optimization

### 1. Enable Compression

Configure S3 or CloudFront to compress text assets (gzip/brotli).

### 2. Use Content Hash in Filenames

```javascript
// vite.config.ts
output: {
  entryFileNames: 'assets/[name]-[hash].js',
  chunkFileNames: 'assets/[name]-[hash].js',
}
```

### 3. Preload Critical Assets

```html
<link rel="preload" href="/assets/main-[hash].js" as="script">
```

### 4. Lazy Load Routes

```typescript
const Analytics = lazy(() => import('./pages/Analytics'))
```

## Security Best Practices

### 1. Use CloudFront over Direct S3 Access

```
S3 → CloudFront → Users (not public S3 access)
```

### 2. Enable WAF on CloudFront

```hcl
resource "aws_wafv2_web_acl" "cloudfront" {
  scope = "CLOUDFRONT"
  # ...
}
```

### 3. Use Signed URLs for Private Content

```typescript
import { getSignedUrl } from '@aws-sdk/cloudfront-signer'

const url = getSignedUrl({
  url: 'https://cloudfront-distribution/file.pdf',
  keyPairId: 'K1234567890',
  dateLessThan: new Date().toISOString(),
  privateKey: '-----BEGIN RSA PRIVATE KEY-----...',
})
```

## Cost Optimization

### 1. Use S3 Website Endpoint (cheaper)

```
# Instead of:
https://bucket.s3.amazonaws.com

# Use:
https://bucket.s3-website-region.amazonaws.com
```

### 2. Right-Size CloudFront Price Class

```hcl
price_class = "PriceClass_100"  # North America & Europe only
```

### 3. Set Up Cost Allocation Tags

```hcl
resource "aws_s3_bucket" "example" {
  # ...
  tags = {
    Project = "Student-DataLake"
    Environment = "Production"
  }
}
```

## Monitoring

### 1. S3 Access Logs

```hcl
resource "aws_s3_bucket_logging" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  target_bucket = aws_s3_bucket.logs.id
  target_prefix = "frontend/"
}
```

### 2. CloudWatch Metrics

Monitor:
- CloudFront: Requests, Bytes Downloaded
- S3: AllRequests, BytesDownloaded

### 3. Set Up Alarms

```hcl
resource "aws_cloudwatch_metric_alarm" "high_5xx" {
  metric_name = "5xxErrorRate"
  threshold   = 5
  # ...
}
```

## Quick Reference

| Command | Purpose |
|---------|---------|
| `npm run build` | Build for production |
| `aws s3 sync dist/ s3://bucket` | Deploy to S3 |
| `aws cloudfront create-invalidation` | Purge CDN cache |
| `./deploy-frontend.sh --skip-build` | Deploy only |

| Configuration | Value |
|--------------|-------|
| Index Document | `index.html` |
| Error Document | `index.html` |
| Cache Control (JS/CSS) | `max-age=31536000` |
| Cache Control (HTML) | `no-cache` |

