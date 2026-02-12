# AWS Data Lake Verification Guide

This guide walks you through checking all components of your AWS Serverless Data Lake in the AWS Management Console.

---

## Quick Verification Checklist

### 1. S3 Bucket (Data Storage)
**URL:** https://s3.console.aws.amazon.com/s3/home

1. Search for: `student-socialmedia-datalake`
2. Verify these folders exist:
   - `raw/` - Raw data files
   - `processed/` - Processed data
   - `athena-results/` - Query results

**Expected:** Folders should be visible

---

### 2. Glue Database (Data Catalog)
**URL:** https://console.aws.amazon.com/glue/home

1. Go to **Databases** in the left menu
2. Look for: `student_db`
3. Click on it and check **Tables**

**Expected:** Tables like `student_social_media_usage` should be listed

---

### 3. Athena (Query Engine)
**URL:** https://console.aws.amazon.com/athena/home

1. In the left menu, go to **Tables and views**
2. You should see tables from `student_db`
3. Try running a test query:

```sql
SELECT * FROM student_social_media_usage LIMIT 10
```

**Expected:** Query should return data or show "no rows returned" (tables exist)

---

### 4. Lambda Function (Backend Logic)
**URL:** https://console.aws.amazon.com/lambda/home

1. Search for: `athena-query-student`
2. Check the following:

| Tab | What to Check |
|-----|---------------|
| **Function overview** | State is "Active" |
| **Configuration > Environment variables** | DATABASE_NAME=student_db, S3_BUCKET=student-socialmedia-datalake |
| **Configuration > Timeout** | 60 seconds or more |
| **Monitoring** | CloudWatch charts showing invocations |

**Expected:** Function should be Active with correct env vars

---

### 5. API Gateway (HTTP Endpoint)
**URL:** https://console.aws.amazon.com/apigateway/home

1. Search for: `athena-query-api`
2. Click on the API and check:

| Section | What to Check |
|---------|---------------|
| **Resources** | Should have `/query` resource with POST method |
| **Stages** | Should have `dev` stage |
| **Stage details** | Invoke URL should be: `https://shhoo6hhtl.execute-api.eu-west-1.amazonaws.com/dev` |
| **CORS** | OPTIONS method should be configured |

**Expected:** API is deployed with correct endpoint

---

### 6. CloudWatch Logs (Troubleshooting)
**URL:** https://console.aws.amazon.com/cloudwatch/home

1. Go to **Logs** > **Log groups**
2. Search for:
   - `/aws/lambda/athena-query-student` - Lambda function logs
   - `/aws/apigateway/athena-query-api` - API Gateway logs

**Expected:** Log groups should exist with recent log streams

---

## Testing Your Data Lake

### Test 1: Run a Query in Athena Console

1. Go to **Athena** > **Editor**
2. Select `AwsDataCatalog` as the data source
3. Select `student_db` as the database
4. Run:

```sql
-- Check if tables exist
SHOW TABLES;

-- Or query sample data
SELECT * FROM student_social_media_usage LIMIT 5;
```

### Test 2: Test API Endpoint

From your terminal:
```bash
# Windows (PowerShell)
$body = '{"query": "SELECT 1 as test"}'
Invoke-RestMethod -Uri "https://shhoo6hhtl.execute-api.eu-west-1.amazonaws.com/dev/query" -Method Post -ContentType "application/json" -Body $body

# Or using curl
curl -X POST \
  https://shhoo6hhtl.execute-api.eu-west-1.amazonaws.com/dev/query \
  -H 'Content-Type: application/json' \
  -d '{"query": "SELECT 1 as test"}'
```

**Expected Response:**
```json
{
  "message": "Query executed successfully",
  "queryExecutionId": "abc123...",
  "state": "SUCCEEDED",
  "rows": [{"?column?": "1"}],
  "rowCount": 1
}
```

### Test 3: Check Lambda Logs

1. Go to **CloudWatch** > **Logs** > **Log groups**
2. Click `/aws/lambda/athena-query-student`
3. Look at recent **Log streams**
4. Check for:
   - Query execution logs
   - Error messages (if any)

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| No tables in Glue | Run Glue crawler or upload data to `s3://student-socialmedia-datalake/raw/` |
| API returns 403 | Check IAM permissions or run `fix-iam-permissions.bat` |
| API returns 500 | Check Lambda CloudWatch logs for error details |
| CORS error in browser | Run `configure-cors.bat` |
| Query timeout | Increase Lambda timeout or optimize query |

---

## Data Flow Architecture

```
┌─────────────────┐
│  S3 Bucket      │  ← student-socialmedia-datalake
│  (Raw/Processed)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Glue Crawler   │  ← Scans S3, creates tables
│  (student_db)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Athena       │  ← Executes SQL queries
│   (Query)       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Lambda       │  ← Backend logic
│  (athena-       │
│   query-student)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  API Gateway    │  ← HTTP endpoint
│  (shhoo6hhtl)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Frontend      │  ← React charts
│   (React App)   │
└─────────────────┘
```

---

## Next Steps After Verification

1. ✅ All checks passed → Start frontend: `cd Frontend && npm run dev`
2. ⚠️ Issues found → Check corresponding script:
   - IAM issues → Run `fix-iam-permissions.bat`
   - CORS issues → Run `configure-cors.bat`
   - Lambda outdated → Run `rebuild-lambda.bat`
   - No tables → Run `setup-glue-crawler.bat`

